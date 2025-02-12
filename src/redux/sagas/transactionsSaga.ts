import type { BlindingKeyGetter, TxInterface, AddressInterface } from 'ldk';
import { fetchAndUnblindTxsGenerator, isBlindedOutputInterface, fetchTx, unblindTransaction } from 'ldk';
import { takeLatest, call, put, select, all, takeEvery, delay } from 'redux-saga/effects';

import { UpdateTransactionsError } from '../../utils/errors';
import { getTransactionsFromStorage, setTransactionsInStorage } from '../../utils/storage-helper';
import type { ActionType } from '../../utils/types';
import { SIGN_IN } from '../actions/appActions';
import { addAsset } from '../actions/assetsActions';
import { addErrorToast } from '../actions/toastActions';
import {
  addWatcherTransaction,
  removeWatcherTransaction,
  setTransaction,
  SET_TRANSACTION,
  UPDATE_TRANSACTIONS,
  WATCH_TRANSACTION,
} from '../actions/transactionsActions';
import type { WalletState } from '../reducers/walletReducer';

function* updateTransactions() {
  try {
    const [addresses, explorerLiquidAPI, currentTxs]: [
      Record<string, AddressInterface>,
      string,
      Record<string, TxInterface>
    ] = yield all([
      select(({ wallet }: { wallet: WalletState }) => wallet.addresses),
      select(({ settings }) => settings.explorerLiquidAPI),
      select(({ transactions }) => transactions.txs),
    ]);

    const toSearch: string[] = [];
    for (const { confidentialAddress } of Object.values(addresses)) {
      toSearch.unshift(confidentialAddress);
    }

    yield call(fetchAndUpdateTxs, toSearch, addresses, currentTxs, explorerLiquidAPI);
  } catch (e) {
    console.error(e);
    yield put(addErrorToast(UpdateTransactionsError));
  }
}

/**
 * Saga launched in order to update the transactions state
 * @param addresses a set of addresses to search transactions.
 * @param scriptsToAddressInterface a record using to build a BlindingKeyGetter.
 * @param currentTxs
 * @param explorerLiquidAPI esplora URL used to fetch transactions.
 */
export function* fetchAndUpdateTxs(
  addresses: string[],
  scriptsToAddressInterface: Record<string, AddressInterface>,
  currentTxs: Record<string, TxInterface>,
  explorerLiquidAPI: string
): Generator<any, any, any> {
  const identityBlindKeyGetter = blindKeyGetterFactory(scriptsToAddressInterface);

  const txsGen = fetchAndUnblindTxsGenerator(
    addresses,
    identityBlindKeyGetter,
    explorerLiquidAPI,
    (tx: TxInterface) => {
      const txInStore = currentTxs[tx.txid];
      // skip if tx is already in store AND confirmed
      return !!txInStore?.status.confirmed;
    }
  );
  const next = () => txsGen.next();
  let it: IteratorResult<TxInterface, number> = yield call(next);

  if (it.done) {
    return;
  }

  while (!it.done) {
    const tx = it.value;
    yield put(setTransaction(tx));
    it = yield call(next);
  }
}

// update the assets state when a new transaction is set in tx state
function* updateAssets({ payload }: { payload: TxInterface }) {
  for (const out of payload.vout) {
    if (!isBlindedOutputInterface(out)) {
      yield put(addAsset(out.asset));
    }
  }
}

function* persistTransactions() {
  yield delay(20_000); // 20 sec
  const txs: TxInterface[] = yield select(({ transactions }) => Object.values(transactions.txs));
  yield call(setTransactionsInStorage, txs);
}

function* restoreTransactions() {
  const txs: TxInterface[] = yield call(getTransactionsFromStorage);
  for (const tx of txs) {
    yield put(setTransaction(tx));
  }
}

function* watchTransaction(action: ActionType) {
  yield delay(1_000);
  const { txID, maxTry } = action.payload as { txID: string; maxTry: number };
  yield put(addWatcherTransaction(txID));
  const explorer: string = yield select(({ settings }) => settings.explorerLiquidAPI);

  for (let t = 0; t < maxTry; t++) {
    try {
      const tx: TxInterface = yield call(fetchTx, txID, explorer);
      const scriptsToAddress: Record<string, AddressInterface> = yield select(
        ({ wallet }: { wallet: WalletState }) => wallet.addresses
      );
      const blindKeyGetter = blindKeyGetterFactory(scriptsToAddress);
      const { unblindedTx, errors } = yield call(unblindTransaction, tx, blindKeyGetter);
      if (errors.length > 0) {
        errors.forEach((err: { message?: string }) => {
          console.error(err.message);
        });
      }
      yield put(setTransaction(unblindedTx));
      yield put(removeWatcherTransaction(txID));
      break;
    } catch {
      yield delay(1_000);
    }
  }
  yield put(removeWatcherTransaction(txID));
}

function blindKeyGetterFactory(scriptsToAddressInterface: Record<string, AddressInterface>): BlindingKeyGetter {
  return (script: string) => {
    try {
      return scriptsToAddressInterface[script]?.blindingPrivateKey;
    } catch (_) {
      return undefined;
    }
  };
}

export function* transactionsWatcherSaga(): Generator<any, any, any> {
  yield takeLatest(UPDATE_TRANSACTIONS, updateTransactions);
  yield takeLatest(UPDATE_TRANSACTIONS, persistTransactions);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  yield takeEvery(SET_TRANSACTION, updateAssets);
  yield takeLatest(SIGN_IN, restoreTransactions);
  yield takeEvery(WATCH_TRANSACTION, watchTransaction);
}
