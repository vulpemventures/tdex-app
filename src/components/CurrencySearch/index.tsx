import { IonContent, IonList, IonModal, IonHeader, IonItem, IonInput, IonIcon } from '@ionic/react';
import { closeSharp, searchSharp } from 'ionicons/icons';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import { updatePrices } from '../../redux/actions/ratesActions';
import { setCurrency } from '../../redux/actions/settingsActions';
import type { CurrencyInterface } from '../../redux/reducers/settingsReducer';
import { CURRENCIES } from '../../utils/constants';

interface CurrencySearchProps {
  isOpen: boolean;
  close: (ev: any) => void;
}

const CurrencySearch: React.FC<CurrencySearchProps> = ({ isOpen, close }) => {
  const [searchString, setSearchString] = useState('');
  const dispatch = useDispatch();

  return (
    <div className="search">
      <IonModal cssClass="modal-small" isOpen={isOpen} onDidDismiss={close}>
        <IonHeader className="ion-no-border">
          <div>
            <label className="search-bar">
              <IonIcon icon={searchSharp} color="light-contrast" onClick={close} />
              <IonInput
                inputMode="search"
                color="light-contrast"
                placeholder="Search currency"
                value={searchString}
                onIonChange={(e) => setSearchString(e.detail.value || '')}
              />
              <IonIcon icon={closeSharp} color="light-contrast" onClick={close} />
            </label>
          </div>
        </IonHeader>
        <IonContent className="search-content">
          <IonList>
            {CURRENCIES.filter(
              (currency: CurrencyInterface) =>
                currency.name.toLowerCase().includes(searchString.toLowerCase()) ||
                currency.symbol.toLowerCase().includes(searchString.toLowerCase()) ||
                currency.value.toLowerCase().includes(searchString.toLowerCase())
            ).map((currency: CurrencyInterface, index: number) => {
              return (
                <IonItem
                  className="ion-no-margin"
                  key={index}
                  data-asset={index}
                  onClick={(ev) => {
                    dispatch(setCurrency(currency));
                    dispatch(updatePrices());
                    close(ev);
                  }}
                >
                  <div className="search-item-name">
                    <p>{`${currency.value.toUpperCase()} - ${currency.name}`}</p>
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

export default CurrencySearch;
