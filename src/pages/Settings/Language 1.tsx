import React from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonList,
  IonRadioGroup,
  IonItem,
  IonLabel,
  IonRadio
} from '@ionic/react';
import { useIonRouter } from '@ionic/react';
import { arrowBackOutline } from 'ionicons/icons';

const LanguageRegion: React.FC = () => {
  const router = useIonRouter();

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => router.goBack()}>
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>Language & Region</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent color="light">
        <IonList inset={true} className="settings-list">
          <IonRadioGroup value="en">
            <div className="list-header">App Language</div>
            <IonItem>
              <IonLabel>English</IonLabel>
              <IonRadio slot="end" value="en" />
            </IonItem>
            <IonItem>
              <IonLabel>Filipino</IonLabel>
              <IonRadio slot="end" value="fil" />
            </IonItem>
          </IonRadioGroup>
        </IonList>

        <IonList inset={true}>
          <IonRadioGroup value="ph">
            <div className="list-header">Region</div>
            <IonItem>
              <IonLabel>Philippines</IonLabel>
              <IonRadio slot="end" value="ph" />
            </IonItem>
          </IonRadioGroup>
        </IonList>

        <div className="ion-padding">
          <IonButton expand="block" shape="round">Save Changes</IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};