import React from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonIcon
} from '@ionic/react';
import { useIonRouter } from '@ionic/react';
import {
  createOutline,
  starOutline,
  timeOutline,
  notificationsOutline,
  globeOutline,
  shieldCheckmarkOutline,
  helpCircleOutline,
  headsetOutline,
  warningOutline,
  phonePortraitOutline,
  documentTextOutline,
  logOutOutline,
  chevronForwardOutline
} from 'ionicons/icons';

import './Settings.css';

const Settings: React.FC = () => {
  const router = useIonRouter();

  const onItemClick = (label: string) => {
    if (label === 'Notification Settings') {
      router.push('/settings/notification');
    } else if (label === 'Language') {
      router.push('/settings/language-region');
    }
    else {
      console.log(label);
    }
  };

  const logout = () => {
    console.log('Logout clicked');
  };

  const Item = ({ icon, color, label, onClick, extraClass = '' }: any) => (
    <div className={`item ${extraClass}`} onClick={onClick}>
      <div className={`icon ${color}`}>
        <IonIcon icon={icon} />
      </div>
      <span>{label}</span>
      <IonIcon icon={chevronForwardOutline} className="arrow" />
    </div>
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>

        {/* Profile */}
        <div className="section">
          <p className="section-title">Profile</p>
          <div className="card">
            <Item icon={createOutline} color="purple" label="Edit Profile" onClick={() => onItemClick('Edit Profile')} />
            <Item icon={starOutline} color="yellow" label="My Reviews" onClick={() => onItemClick('My Reviews')} />
            <Item icon={timeOutline} color="blue" label="Booking History" onClick={() => onItemClick('Booking History')} />
          </div>
        </div>

        {/* Preferences */}
        <div className="section">
          <p className="section-title">Preferences</p>
          <div className="card">
            <Item icon={notificationsOutline} color="purple" label="Notification Settings" onClick={() => onItemClick('Notification Settings')} />
            <Item icon={globeOutline} color="green" label="Language" onClick={() => onItemClick('Language')} />
            <Item icon={shieldCheckmarkOutline} color="blue" label="Privacy Settings" onClick={() => onItemClick('Privacy Settings')} />
          </div>
        </div>

        {/* Support */}
        <div className="section">
          <p className="section-title">Support</p>
          <div className="card">
            <Item icon={helpCircleOutline} color="cyan" label="Help Center" onClick={() => onItemClick('Help Center')} />
            <Item icon={headsetOutline} color="mint" label="Contact Support" onClick={() => onItemClick('Contact Support')} />
            <Item icon={warningOutline} color="red" label="Report Problem" onClick={() => onItemClick('Report Problem')} />
          </div>
        </div>

        {/* About */}
        <div className="section">
          <p className="section-title">About</p>
          <div className="card">
            <Item icon={phonePortraitOutline} color="gray" label="About App" onClick={() => onItemClick('About App')} />
            <Item icon={documentTextOutline} color="gray" label="Terms & Privacy" onClick={() => onItemClick('Terms & Privacy')} />
            <Item
              icon={logOutOutline}
              color="red-outline"
              label="Logout"
              onClick={logout}
              extraClass="logout"
            />
          </div>

          <div className="footer">
            <p>Version 1.0.0</p>
            <p>© 2025 All rights reserved</p>
          </div>
        </div>

      </IonContent>
    </IonPage>
  );
};

export default Settings;
