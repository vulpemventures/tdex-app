import { KeyboardStyle } from '@capacitor/keyboard';
import { IonContent, IonPage, isPlatform, useIonViewWillEnter, IonGrid, IonRow, IonCol, IonButton } from '@ionic/react';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import logo from '../../assets/img/tdex_3d_logo.svg';
import ButtonsMainSub from '../../components/ButtonsMainSub';
import Loader from '../../components/Loader';
import PinModal from '../../components/PinModal';
import { initApp, signIn } from '../../redux/actions/appActions';
import { addErrorToast } from '../../redux/actions/toastActions';
import { PIN_TIMEOUT_FAILURE, PIN_TIMEOUT_SUCCESS } from '../../utils/constants';
import { IncorrectPINError } from '../../utils/errors';
import { setKeyboardTheme } from '../../utils/keyboard';
import { getIdentity, mnemonicInSecureStorage } from '../../utils/storage-helper';
import './style.scss';

const Homescreen: React.FC = () => {
  const [isWrongPin, setIsWrongPin] = useState<boolean | null>(null);
  const [pinModalIsOpen, setPinModalIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [needReset, setNeedReset] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState('Searching mnemonic in secure storage...');
  const appInit = useSelector((state: any) => state.app.appInit);
  const dispatch = useDispatch();


  const goToWallet = (withMnemonic?: any) => {
    setIsWrongPin(null);
    setNeedReset(true);
    setLoading(false);
    // setIsAuth will cause redirect to /wallet
    // Restore state
    dispatch(signIn(withMnemonic));
  }

  const onConfirmPinModal = (pin: string) => {
    getIdentity(pin)
      .then((mnemonic) => {
        setLoadingMessage('Unlocking wallet...');
        setLoading(true);
        setIsWrongPin(false);
        setTimeout(() => {
          goToWallet(mnemonic);
        }, PIN_TIMEOUT_SUCCESS);
      })
      .catch((e) => {
        console.error(e);
        setIsWrongPin(true);
        setTimeout(() => {
          setIsWrongPin(null);
          setNeedReset(true);
          setLoading(false);
        }, PIN_TIMEOUT_FAILURE);
        dispatch(addErrorToast(IncorrectPINError));
      });
  };

  useIonViewWillEnter(() => {
    if (isPlatform("desktop")) {
      if (typeof (window as any).marina === 'undefined')
        return;

      const onConnect = async () => {
        await (window as any).marina.on('ENABLED', () => goToWallet());
      }

      onConnect()
        .catch(console.error)
        .finally(() => setLoading(false));


    } else {
      const init = async () => {
        setLoading(true);
        if (!appInit) dispatch(initApp());
        await setKeyboardTheme(KeyboardStyle.Dark);
        const mnemonicExists = await mnemonicInSecureStorage();
        if (mnemonicExists) setPinModalIsOpen(true);
      };
      init()
        .catch(console.error)
        .finally(() => setLoading(false));
    }


  });

  const connectWithMarina = async (evt: any) => {
    evt.preventDefault();

    if (typeof (window as any).marina === 'undefined')
      return;

    await (window as any).marina.enable()
  }

  return (
    <IonPage id="homescreen">
      <Loader message={loadingMessage} showLoading={loading} />
      <PinModal
        onClose={() => setPinModalIsOpen(false)}
        needReset={needReset}
        setNeedReset={setNeedReset}
        open={pinModalIsOpen}
        title="Enter your secret PIN"
        description="Unlock your wallet"
        onConfirm={onConfirmPinModal}
        isWrongPin={isWrongPin}
        setIsWrongPin={setIsWrongPin}
      />
      <IonContent>
        <IonGrid className="ion-text-center ion-justify-content-evenly" fixed>
          <IonRow className="img-container">
            <IonCol size="8" offset="2" sizeMd="6" offsetMd="3">
              <img src={logo} alt="tdex logo" />
            </IonCol>
          </IonRow>
          {isPlatform("desktop") ?
            <IonButton
              className="main-button"
              data-cy="main-button"
              onClick={connectWithMarina}
            >
              CONNECT WITH MARINA
            </IonButton> :
            <ButtonsMainSub
              mainTitle="SETUP WALLET"
              mainLink="/onboarding/backup"
              subTitle="RESTORE WALLET"
              subLink="/restore"
              className="btn-container"
            />}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Homescreen;
