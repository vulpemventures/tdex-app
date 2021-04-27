import React, { useState } from 'react';
import {
  IonContent,
  IonList,
  IonModal,
  IonHeader,
  IonItem,
  IonInput,
  IonIcon,
} from '@ionic/react';
import { closeSharp, searchSharp } from 'ionicons/icons';
import { useDispatch } from 'react-redux';
import { LBTC_DENOMINATIONS } from '../../utils/constants';
import { setLBTCDenomination } from '../../redux/actions/settingsActions';
import { updatePrices } from '../../redux/actions/ratesActions';
import './style.scss';

interface DenominationSearchProps {
  isOpen: boolean;
  close: () => void;
}

const DenominationSearch: React.FC<DenominationSearchProps> = ({
  isOpen,
  close,
}) => {
  const [searchString, setSearchString] = useState('');
  const dispatch = useDispatch();

  return (
    <div className="search">
      <IonModal cssClass="modal-small" isOpen={isOpen} onDidDismiss={close}>
        <IonHeader>
          <div>
            <label className="search-bar">
              <IonIcon icon={searchSharp} color="light" onClick={close} />
              <IonInput
                inputMode="search"
                color="light"
                placeholder="Search currency"
                value={searchString}
                onIonChange={(e) => setSearchString(e.detail.value || '')}
              />
              <IonIcon icon={closeSharp} color="light" onClick={close} />
            </label>
          </div>
        </IonHeader>
        <IonContent className="search-content">
          <IonList>
            {LBTC_DENOMINATIONS.filter((denomination: string) =>
              denomination.includes(searchString)
            ).map((denomination: string, index: number) => {
              return (
                <IonItem
                  key={index}
                  data-asset={index}
                  onClick={() => {
                    dispatch(setLBTCDenomination(denomination));
                    dispatch(updatePrices());
                    close();
                  }}
                >
                  <div
                    // https://github.com/ionic-team/ionic-framework/issues/21939#issuecomment-694259307
                    tabIndex={0}
                  ></div>
                  <div className="search-item-name">
                    <p>{denomination}</p>
                  </div>
                </IonItem>
              );
            })}
          </IonList>
        </IonContent>
      </IonModal>
    </div>
  );
};

export default DenominationSearch;
