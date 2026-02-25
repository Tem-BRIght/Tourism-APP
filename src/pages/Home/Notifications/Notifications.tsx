import React from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonList, IonItem, IonLabel, IonIcon, IonText
} from '@ionic/react';
import { notifications, heart, star, location } from 'ionicons/icons';
import './Notifications.css';

const NOTIFICATIONS = [
  {
    id: 1,
    icon: heart,
    title: 'New Like',
    message: 'Someone liked your review of Pasig Cathedral',
    time: '2 hours ago',
  },
  {
    id: 2,
    icon: star,
    title: 'New Rating',
    message: 'Your booking at Rainforest Park has been rated 5 stars',
    time: '1 day ago',
  },
  {
    id: 3,
    icon: location,
    title: 'Location Update',
    message: 'New destinations added near you',
    time: '3 days ago',
  },
];

const Notifications: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Notifications</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {NOTIFICATIONS.length === 0 ? (
          <div className="empty-state">
            <p>No notifications yet</p>
          </div>
        ) : (
          <IonList>
            {NOTIFICATIONS.map(({ id, icon, title, message, time }) => (
              <IonItem key={id}>
                <IonIcon icon={icon} slot="start" />
                <IonLabel>
                  <h2>{title}</h2>
                  <p>{message}</p>
                  <IonText color="medium">
                    <small>{time}</small>
                  </IonText>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Notifications;