import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonTitle,
  IonList,
  IonItem,
  IonLabel,
  IonBackButton,
} from '@ionic/react';
import { ellipsisVertical } from 'ionicons/icons';

const AllActivities: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home/profile" />
          </IonButtons>
          <IonTitle>All Activities</IonTitle>
          <IonButtons slot="end">
            <IonButton>
              <IonIcon icon={ellipsisVertical} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem>
            <IonLabel>
              <h3>Reviewed Pasig Museum</h3>
              <p>Today</p>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <h3>Visited RAVE Park</h3>
              <p>Nov 15</p>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <h3>Visited Pasig Cathedral</h3>
              <p>Nov 10</p>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <h3>Reviewed Ace Hotel Spa</h3>
              <p>Nov 5</p>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <h3>Visited Ace Hotel Spa</h3>
              <p>Nov 5</p>
            </IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default AllActivities;