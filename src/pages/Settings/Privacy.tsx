import React, { useState } from 'react';
import './Privacy.css';
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
  IonButton,
  IonIcon,
  IonList
} from '@ionic/react';
import {
  eyeOutline,
  locationOutline,
  shareOutline,
  trashOutline,
  documentTextOutline
} from 'ionicons/icons';

const Privacy: React.FC = () => {
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    reviewsPublic: true,
    favoritesFriends: true,
    itinerariesPrivate: true,

    shareLocationApp: true,
    shareLocationUsers: false,
    showDistance: true,
    preciseLocation: true,

    shareData: true,
    personalizedAds: false,
    thirdPartySharing: false,
  });

  const toggle = (key: keyof typeof privacy) => {
    setPrivacy({ ...privacy, [key]: !privacy[key] });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/settings" />
          </IonButtons>
          <IonTitle>Privacy Settings</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>

        {/* PROFILE VISIBILITY */}
        <IonList inset>
          <IonItem lines="none">
            <IonIcon icon={eyeOutline} slot="start" />
            <IonLabel><strong>Profile Visibility</strong></IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>Profile: Public</IonLabel>
            <IonToggle checked={privacy.profilePublic} onIonChange={() => toggle('profilePublic')} />
          </IonItem>

          <IonItem>
            <IonLabel>Reviews: Public</IonLabel>
            <IonToggle checked={privacy.reviewsPublic} onIonChange={() => toggle('reviewsPublic')} />
          </IonItem>

          <IonItem>
            <IonLabel>Favorites: Friends Only</IonLabel>
            <IonToggle checked={privacy.favoritesFriends} onIonChange={() => toggle('favoritesFriends')} />
          </IonItem>

          <IonItem>
            <IonLabel>Itineraries: Private</IonLabel>
            <IonToggle checked={privacy.itinerariesPrivate} onIonChange={() => toggle('itinerariesPrivate')} />
          </IonItem>
        </IonList>

        {/* LOCATION PRIVACY */}
        <IonList inset>
          <IonItem lines="none">
            <IonIcon icon={locationOutline} slot="start" />
            <IonLabel><strong>Location Privacy</strong></IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>Share location with app</IonLabel>
            <IonToggle checked={privacy.shareLocationApp} onIonChange={() => toggle('shareLocationApp')} />
          </IonItem>

          <IonItem>
            <IonLabel>Share with other users</IonLabel>
            <IonToggle checked={privacy.shareLocationUsers} onIonChange={() => toggle('shareLocationUsers')} />
          </IonItem>

          <IonItem>
            <IonLabel>Show distance from me</IonLabel>
            <IonToggle checked={privacy.showDistance} onIonChange={() => toggle('showDistance')} />
          </IonItem>

          <IonItem>
            <IonLabel>Precise location</IonLabel>
            <IonToggle checked={privacy.preciseLocation} onIonChange={() => toggle('preciseLocation')} />
          </IonItem>
        </IonList>

        {/* DATA SHARING */}
        <IonList inset>
          <IonItem lines="none">
            <IonIcon icon={shareOutline} slot="start" />
            <IonLabel><strong>Data Sharing</strong></IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>Share data for improvement</IonLabel>
            <IonToggle checked={privacy.shareData} onIonChange={() => toggle('shareData')} />
          </IonItem>

          <IonItem>
            <IonLabel>Personalized ads</IonLabel>
            <IonToggle checked={privacy.personalizedAds} onIonChange={() => toggle('personalizedAds')} />
          </IonItem>

          <IonItem>
            <IonLabel>Third-party sharing</IonLabel>
            <IonToggle checked={privacy.thirdPartySharing} onIonChange={() => toggle('thirdPartySharing')} />
          </IonItem>
        </IonList>

        {/* DATA MANAGEMENT */}
        <IonList inset>
          <IonItem lines="none">
            <IonIcon icon={trashOutline} slot="start" />
            <IonLabel><strong>Data Management</strong></IonLabel>
          </IonItem>

          <IonItem button>
            <IonLabel>Download my data</IonLabel>
          </IonItem>

          <IonItem button>
            <IonLabel>Delete search history</IonLabel>
          </IonItem>

          <IonItem button>
            <IonLabel>Clear chat history</IonLabel>
          </IonItem>

          <IonItem button color="danger">
            <IonLabel>Delete account</IonLabel>
          </IonItem>
        </IonList>

        {/* ACTION BUTTONS */}
        <div style={{ padding: '16px' }}>
          <IonButton fill="clear" expand="block">
            <IonIcon icon={documentTextOutline} slot="start" />
            View Privacy Policy
          </IonButton>

          <IonButton expand="block" color="primary">
            Save
          </IonButton>
        </div>

      </IonContent>
    </IonPage>
  );
};

export default Privacy;
