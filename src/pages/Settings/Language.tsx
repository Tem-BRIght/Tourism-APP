import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonRadioGroup,
  IonRadio,
  IonButton,
  IonIcon,
  IonButtons,
  IonBackButton
} from '@ionic/react';
import { arrowBackOutline, globeOutline, locationOutline, timeOutline, calendarOutline, thermometerOutline } from 'ionicons/icons';
import { useIonRouter } from '@ionic/react';
import './Language.css';

const LanguageRegion: React.FC = () => {
  const router = useIonRouter();

  return (
    <IonPage>
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonBackButton defaultHref="/tabs/settings" />
              </IonButtons>
              <IonTitle>Langauge Settings</IonTitle>
            </IonToolbar>
          </IonHeader>

      <IonContent>
        {/* APP LANGUAGE */}
        <section className="section">
          <h3><IonIcon icon={globeOutline} /> App Language</h3>
          <IonRadioGroup value="en">
            <IonItem>
              <IonLabel>English (Default)</IonLabel>
              <IonRadio value="en" slot="end"/>
            </IonItem>
            <IonItem>
              <IonLabel>Filipino</IonLabel>
              <IonRadio value="fil" slot="end"/>
            </IonItem>
            <IonItem>
              <IonLabel>Español</IonLabel>
              <IonRadio value="es" slot="end"/>
            </IonItem>
            <IonItem>
              <IonLabel>中文</IonLabel>
              <IonRadio value="zh" slot="end"/>
            </IonItem>
            <IonItem>
              <IonLabel>日本語</IonLabel>
              <IonRadio value="jp" slot="end"/>
            </IonItem>
            <IonItem>
              <IonLabel>한국어</IonLabel>
              <IonRadio value="kr" slot="end"/>
            </IonItem>
          </IonRadioGroup>
        </section>

        {/* REGION */}
        <section className="section">
          <h3><IonIcon icon={locationOutline} /> Region</h3>
          <IonRadioGroup value="ph">
            <IonItem>
              <IonLabel>Philippines (Default)</IonLabel>
              <IonRadio value="ph" slot="end"/>
            </IonItem>
            <IonItem>
              <IonLabel>United States</IonLabel>
              <IonRadio value="us" slot="end"/>
            </IonItem>
            <IonItem>
              <IonLabel>United Kingdom</IonLabel>
              <IonRadio value="uk" slot="end"/>
            </IonItem>
            <IonItem>
              <IonLabel>Australia</IonLabel>
              <IonRadio value="au" slot="end"/>
            </IonItem>
            <IonItem>
              <IonLabel>Singapore</IonLabel>
              <IonRadio value="sg" slot="end"/>
            </IonItem>
          </IonRadioGroup>
        </section>

        {/* TIME FORMAT */}
        <section className="section">
          <h3><IonIcon icon={timeOutline} /> Time Format</h3>
          <IonRadioGroup value="12">
            <IonItem>
              <IonLabel>12-hour (2:30 PM)</IonLabel>
              <IonRadio value="12" slot="end"/>
            </IonItem>
            <IonItem>
              <IonLabel>24-hour (14:30)</IonLabel>
              <IonRadio value="24" slot="end"/>
            </IonItem>
          </IonRadioGroup>
        </section>

        {/* DATE FORMAT */}
        <section className="section">
          <h3><IonIcon icon={calendarOutline} /> Date Format</h3>
          <IonRadioGroup value="mdy">
            <IonItem>
              <IonLabel>MM/DD/YYYY (11/20/2026)</IonLabel>
              <IonRadio value="mdy" slot="end"/>
            </IonItem>
            <IonItem>
              <IonLabel>DD/MM/YYYY (20/11/2026)</IonLabel>
              <IonRadio value="dmy" slot="end"/>
            </IonItem>
            <IonItem>
              <IonLabel>YYYY-MM-DD (2026-11-20)</IonLabel>
              <IonRadio value="ymd" slot="end"/>
            </IonItem>
          </IonRadioGroup>
        </section>

        <div className="action-buttons">
          <IonButton fill="outline" color="medium" onClick={() => router.goBack()}>Cancel</IonButton>
          <IonButton color="primary">Save</IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LanguageRegion;
