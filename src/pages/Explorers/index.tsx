import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonRow,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import Header from '../../components/Header';
import PageDescription from '../../components/PageDescription';
import {
  setExplorerLiquidAPI,
  setExplorerBitcoinAPI,
  setExplorerBitcoinUI,
  setExplorerLiquidUI,
} from '../../redux/actions/settingsActions';
import { addSuccessToast } from '../../redux/actions/toastActions';
import { network } from '../../redux/config';
import type { SettingsState } from '../../redux/reducers/settingsReducer';
import { capitalizeFirstLetter } from '../../utils/helpers';
import { onPressEnterKeyCloseKeyboard } from '../../utils/keyboard';

interface ExplorersProps {
  explorerLiquidAPI: string;
  explorerBitcoinAPI: string;
  explorerLiquidUI: string;
  explorerBitcoinUI: string;
}

const Explorers: React.FC<ExplorersProps> = ({
  explorerLiquidAPI,
  explorerBitcoinAPI,
  explorerLiquidUI,
  explorerBitcoinUI,
}) => {
  const [explorerGroup, setExplorerGroup] = useState<SettingsState['explorerLiquidAPI']>('');
  const [explorerBitcoinAPIInput, setExplorerBitcoinAPIInput] = useState<SettingsState['explorerBitcoinAPI']>('');
  const [explorerLiquidAPIInput, setExplorerLiquidAPIInput] = useState<SettingsState['explorerLiquidAPI']>('');
  const [explorerBitcoinUIInput, setExplorerBitcoinUIInput] = useState<SettingsState['explorerBitcoinUI']>('');
  const [explorerLiquidUIInput, setExplorerLiquidUIInput] = useState<SettingsState['explorerLiquidUI']>('');

  const dispatch = useDispatch();

  useEffect(() => {
    setExplorerBitcoinAPIInput(explorerBitcoinAPI);
    setExplorerLiquidAPIInput(explorerLiquidAPI);
    setExplorerBitcoinUIInput(explorerBitcoinUI);
    setExplorerLiquidUIInput(explorerLiquidUI);
  }, [explorerLiquidAPI, explorerBitcoinAPI, explorerLiquidUI, explorerBitcoinUI]);

  const handleExplorerChange = (e: any) => {
    const { value } = e.detail;
    setExplorerGroup(value);
    if (value !== 'blockstream' && value !== 'mempool' && value !== 'localhost') return;
    if (value === 'blockstream') {
      dispatch(setExplorerLiquidAPI('https://blockstream.info/liquid/api'));
      dispatch(setExplorerBitcoinAPI('https://blockstream.info/api'));
      dispatch(setExplorerBitcoinUI('https://blockstream.info'));
      dispatch(setExplorerLiquidUI('https://blockstream.info/liquid'));
    } else if (value === 'mempool') {
      dispatch(setExplorerLiquidAPI('https://liquid.network/api'));
      dispatch(setExplorerBitcoinAPI('https://mempool.space/api'));
      dispatch(setExplorerBitcoinUI('https://mempool.space'));
      dispatch(setExplorerLiquidUI('https://liquid.network'));
    } else if (value === 'localhost') {
      dispatch(setExplorerLiquidAPI('http://localhost:3001'));
      dispatch(setExplorerBitcoinAPI('http://localhost:3000'));
      dispatch(setExplorerBitcoinUI('http://localhost:5000'));
      dispatch(setExplorerLiquidUI('http://localhost:5001'));
    }
    dispatch(addSuccessToast(`Explorer endpoints successfully changed to ${capitalizeFirstLetter(value)}`));
  };

  const handleExplorerBitcoinUIChange = (e: any) => {
    setExplorerBitcoinUIInput(e.detail.value);
  };

  const handleExplorerLiquidUIChange = (e: any) => {
    setExplorerLiquidUIInput(e.detail.value);
  };

  const handleExplorerBitcoinAPIChange = (e: any) => {
    setExplorerBitcoinAPIInput(e.detail.value);
  };

  const handleExplorerLiquidAPIChange = (e: any) => {
    setExplorerLiquidAPIInput(e.detail.value);
  };

  return (
    <IonPage id="explorers">
      <IonContent>
        <IonGrid>
          <Header title="EXPLORERS" hasBackButton={true} hasCloseButton={false} />
          <PageDescription
            description="Select a preset of backend APIs Electrs-compatible and frontend explorers Esplora-compatible or enter custom compatible endpoints."
            title="Set explorer endpoints"
          />
          <IonRow className="ion-margin-vertical">
            <IonCol size="11" offset="0.5">
              <IonItem className="input">
                <IonLabel>Select your explorer</IonLabel>
                <IonSelect value={explorerGroup} onIonChange={handleExplorerChange}>
                  <IonSelectOption value="blockstream">Blockstream</IonSelectOption>
                  <IonSelectOption value="mempool">Mempool</IonSelectOption>
                  {network.chain === 'regtest' && <IonSelectOption value="localhost">Localhost</IonSelectOption>}
                  <IonSelectOption value="custom">Custom</IonSelectOption>
                </IonSelect>
              </IonItem>
            </IonCol>
          </IonRow>
          {/**/}
          <IonRow className="ion-margin-vertical">
            <IonCol size="11" offset="0.5">
              <IonItem className="input">
                <IonLabel position="floating" color="tertiary">
                  Bitcoin UI endpoint
                </IonLabel>
                <IonInput
                  readonly={explorerGroup !== 'custom'}
                  enterkeyhint="done"
                  onKeyDown={onPressEnterKeyCloseKeyboard}
                  inputmode="text"
                  value={explorerBitcoinUIInput}
                  onIonChange={handleExplorerBitcoinUIChange}
                />
              </IonItem>
            </IonCol>
          </IonRow>

          <IonRow className="ion-margin-vertical">
            <IonCol size="11" offset="0.5">
              <IonItem className="input">
                <IonLabel position="floating" color="tertiary">
                  Liquid UI endpoint
                </IonLabel>
                <IonInput
                  readonly={explorerGroup !== 'custom'}
                  enterkeyhint="done"
                  onKeyDown={onPressEnterKeyCloseKeyboard}
                  inputmode="text"
                  value={explorerLiquidUIInput}
                  onIonChange={handleExplorerLiquidUIChange}
                />
              </IonItem>
            </IonCol>
          </IonRow>

          <IonRow className="ion-margin-vertical">
            <IonCol size="11" offset="0.5">
              <IonItem className="input">
                <IonLabel position="floating" color="tertiary">
                  Bitcoin API endpoint
                </IonLabel>
                <IonInput
                  readonly={explorerGroup !== 'custom'}
                  enterkeyhint="done"
                  onKeyDown={onPressEnterKeyCloseKeyboard}
                  inputmode="text"
                  value={explorerBitcoinAPIInput}
                  onIonChange={handleExplorerBitcoinAPIChange}
                />
              </IonItem>
            </IonCol>
          </IonRow>

          <IonRow className="ion-margin-vertical">
            <IonCol size="11" offset="0.5">
              <IonItem className="input">
                <IonLabel position="floating" color="tertiary">
                  Liquid API endpoint
                </IonLabel>
                <IonInput
                  readonly={explorerGroup !== 'custom'}
                  enterkeyhint="done"
                  onKeyDown={onPressEnterKeyCloseKeyboard}
                  inputmode="text"
                  value={explorerLiquidAPIInput}
                  onIonChange={(e) => handleExplorerLiquidAPIChange(e)}
                />
              </IonItem>
            </IonCol>
          </IonRow>

          {explorerGroup === 'custom' && (
            <IonRow className="ion-margin-vertical">
              <IonCol size="9" offset="1.5" sizeMd="8" offsetMd="2">
                <IonButton
                  onClick={() => {
                    setExplorerGroup('custom');
                    dispatch(setExplorerBitcoinUI(explorerBitcoinUIInput));
                    dispatch(setExplorerLiquidUI(explorerLiquidUIInput));
                    dispatch(setExplorerBitcoinAPI(explorerBitcoinAPIInput));
                    dispatch(setExplorerLiquidAPI(explorerLiquidAPIInput));
                    dispatch(addSuccessToast(`Explorer endpoints successfully changed.`));
                  }}
                  disabled={
                    !explorerBitcoinUIInput ||
                    !explorerLiquidUIInput ||
                    !explorerBitcoinAPIInput ||
                    !explorerLiquidAPIInput
                  }
                  className="main-button"
                >
                  Save
                </IonButton>
              </IonCol>
            </IonRow>
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Explorers;
