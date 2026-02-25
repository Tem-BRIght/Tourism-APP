import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonItem,
  IonLabel,
  IonToggle,
  IonButton
} from '@ionic/react';

import './Notification.css';

const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    newMessages: true,
    bookingUpdates: true,
    paymentConfirmations: true,
    promotions: false,
    forumReplies: true,

    emailBooking: true,
    emailNewsletter: false,
    emailOffers: false,

    quietHours: true,
    sound: true,
    vibration: true,
    led: false
  });

  const toggle = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/settings" />
          </IonButtons>
          <IonTitle>Notification Settings</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="notification-page">

        {/* PUSH NOTIFICATIONS */}
        <div className="section">
          <h3>🔔 Push Notifications</h3>

          <IonItem>
            <IonLabel>New Messages</IonLabel>
            <IonToggle checked={settings.newMessages} onIonChange={() => toggle('newMessages')} />
          </IonItem>

          <IonItem>
            <IonLabel>Booking Updates</IonLabel>
            <IonToggle checked={settings.bookingUpdates} onIonChange={() => toggle('bookingUpdates')} />
          </IonItem>

          <IonItem>
            <IonLabel>Payment Confirmations</IonLabel>
            <IonToggle checked={settings.paymentConfirmations} onIonChange={() => toggle('paymentConfirmations')} />
          </IonItem>

          <IonItem>
            <IonLabel>Promotions</IonLabel>
            <IonToggle checked={settings.promotions} onIonChange={() => toggle('promotions')} />
          </IonItem>

          <IonItem>
            <IonLabel>Forum Replies</IonLabel>
            <IonToggle checked={settings.forumReplies} onIonChange={() => toggle('forumReplies')} />
          </IonItem>
        </div>

        {/* EMAIL NOTIFICATIONS */}
        <div className="section">
          <h3>📧 Email Notifications</h3>

          <IonItem>
            <IonLabel>Booking Confirmations</IonLabel>
            <IonToggle checked={settings.emailBooking} onIonChange={() => toggle('emailBooking')} />
          </IonItem>

          <IonItem>
            <IonLabel>Monthly Newsletter</IonLabel>
            <IonToggle checked={settings.emailNewsletter} onIonChange={() => toggle('emailNewsletter')} />
          </IonItem>

          <IonItem>
            <IonLabel>Special Offers</IonLabel>
            <IonToggle checked={settings.emailOffers} onIonChange={() => toggle('emailOffers')} />
          </IonItem>
        </div>

        {/* QUIET HOURS */}
        <div className="section">
          <h3>⏰ Quiet Hours</h3>

          <IonItem>
            <IonLabel>Enable Quiet Hours</IonLabel>
            <IonToggle checked={settings.quietHours} onIonChange={() => toggle('quietHours')} />
          </IonItem>

          <p className="note">From: 10:00 PM — To: 7:00 AM</p>
          <p className="note">Exceptions: Emergency alerts</p>
        </div>

        {/* VIBRATION & SOUND */}
        <div className="section">
          <h3>📳 Vibration & Sound</h3>

          <IonItem>
            <IonLabel>Sound</IonLabel>
            <IonToggle checked={settings.sound} onIonChange={() => toggle('sound')} />
          </IonItem>

          <IonItem>
            <IonLabel>Vibration</IonLabel>
            <IonToggle checked={settings.vibration} onIonChange={() => toggle('vibration')} />
          </IonItem>

          <IonItem>
            <IonLabel>LED Light</IonLabel>
            <IonToggle checked={settings.led} onIonChange={() => toggle('led')} />
          </IonItem>
        </div>

        {/* ACTION BUTTONS */}
        <div className="actions">
          <IonButton fill="outline" color="medium">Reset to Default</IonButton>
          <IonButton color="primary">Save</IonButton>
        </div>

      </IonContent>
    </IonPage>
  );
};

export default NotificationSettings;
