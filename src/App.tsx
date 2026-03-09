import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { AuthProvider } from './context/AuthContext';
import { SignupProvider } from './context/SignupContext';
import { ellipse, square, triangle } from 'ionicons/icons';
import Login from './pages/Login/Login';
import SignUP1 from './pages/SignUp/signup1';
import SignUP2 from './pages/SignUp/signup2';
import SignUP3 from './pages/SignUp/signup3';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import Home from './pages/Home/home';
import AllActivities from './pages/Home/Profile/AllActivities';
import Profile from './pages/Home/Profile/profile';
import DestinationDetail from './pages/Home/DestinationDetail/DestinationDetail';
import Notifications from './pages/Home/Notifications/Notifications';
import AIGuide from './pages/AI/AIGuide';
import Settings from './pages/Settings/Settings';
import ErrorBoundary from './components/ErrorBoundary';
import About from './pages/Settings/About';
import Help from './pages/Settings/Help';
import LanguageRegion from './pages/Settings/Language';
import NotificationSettings from './pages/Settings/Notifications';
import PrivacyTerms from './pages/Settings/Privacy';
import MapPage from './pages/Map/maps';
import GoogleUserProfile from './pages/SignUp/googleUser/googleUser';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
  <AuthProvider>
    <SignupProvider>
      <IonApp>
        <IonReactRouter>
          <IonRouterOutlet>
            {/* wrap pages that might crash in an error boundary */}
            <ErrorBoundary>
              <Route exact path="/login" component={Login} />
              <Route exact path="/signup1" component={SignUP1} />
              <Route exact path="/signup2" component={SignUP2} />
              <Route exact path="/signup3" component={SignUP3} />
              <Route exact path="/googleUser" component={GoogleUserProfile} />
              <Route exact path="/reset-password" component={ResetPassword} />
              <Route exact path="/home" component={Home} /> 
              <Route exact path="/profile" component={Profile} />
              <Route exact path="/home/profile/activities" component={AllActivities} />
              <Route exact path="/destination/:id" component={DestinationDetail} />
              <Route exact path="/notifications" component={Notifications} />
              <Route exact path="/ai-guide" component={AIGuide} />
              <Route exact path="/settings" component={Settings} />
            </ErrorBoundary>
            <Route exact path="/settings/about" component={About} />
            <Route exact path="/settings/help" component={Help} />
            <Route exact path="/settings/language" component={LanguageRegion} />
            <Route exact path="/settings/notifications" component={NotificationSettings} />
            <Route exact path="/settings/privacy" component={PrivacyTerms} />
            <Route exact path="/map" component={MapPage} />
            <Route exact path="/">
              <Redirect to="/login" />
            </Route>
          </IonRouterOutlet>
        </IonReactRouter>
      </IonApp>
    </SignupProvider>
  </AuthProvider>
);

export default App;
