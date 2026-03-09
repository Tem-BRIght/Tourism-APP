import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonContent, IonPage, IonButton, IonInput,
  IonItem, IonLabel, IonIcon, IonLoading, IonAlert,
  InputCustomEvent, InputChangeEventDetail
} from '@ionic/react';
import { mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { Link } from 'react-router-dom';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useSignup } from '../../context/SignupContext';
import { getUserProfile } from '../../services/userProfileService';
import './Login.css';

const Login: React.FC = () => {
  const history = useHistory();
  const { isAuthenticated } = useAuth();
  const { updateSignupData } = useSignup();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertHeader, setAlertHeader] = useState('');

  // Check if user is already logged in
  useEffect(() => {
    if (isAuthenticated) {
      history.push('/home');
    }
  }, [isAuthenticated, history]);

  const handleLogin = async () => {
    if (!email || !password) {
      setAlertMessage('Please enter both email and password');
      setShowAlert(true);
      return;
    }

    setShowLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect to home (will happen automatically via useEffect)
      history.push('/home');
    } catch (error: any) {
      setShowLoading(false);
      setAlertHeader('Login Failed');

      if (error.code === 'user-not-found') {
        setAlertMessage('No account found with this email. Please sign up first.');
      } else if (error.code === 'wrong-password') {
        setAlertMessage('Invalid email or password. Please try again.');
      } else if (error.code === 'invalid-email') {
        setAlertMessage('Please enter a valid email address.');
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        setAlertMessage('Network error. Please check your connection and try again.');
      } else {
        setAlertMessage(error.message || 'An unexpected error occurred. Please try again.');
      }
      setShowAlert(true);
    } finally {
      setShowLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setShowLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      // Request additional scopes for profile information
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user profile exists in database
      try {
        const existingProfile = await getUserProfile(user.uid);
        
        if (existingProfile) {
          // User already exists, redirect to home
          history.push('/home');
        } else {
          // New user, extract Google info and redirect to googleUser page
          const googleUser = result.user;
          
          // Extract name parts from display name
          const displayName = googleUser.displayName || '';
          const parts = displayName.trim().split(' ');
          const firstname = parts[0] || '';
          const surname = parts.length > 1 ? parts.slice(1).join(' ') : '';
          
          // Try to get birthdate (if available from Google)
          // Note: Google API typically requires special permissions for birthdate
          const birthdate = googleUser.metadata?.creationTime ? 
            new Date(googleUser.metadata.creationTime).toISOString().split('T')[0] : '';

          // Update signup context with Google user data
          updateSignupData({
            firstName: firstname,
            surname: surname,
            email: googleUser.email || '',
            isGoogleUser: true,
            uid: user.uid,
            dateOfBirth: birthdate,
            username: googleUser.displayName || firstname,
          });

          // Redirect to Google user profile completion page
          history.push('/googleUser');
        }
      } catch (dbError) {
        console.error('Error checking user profile:', dbError);
        // On error, assume new user and proceed
        const googleUser = result.user;
        const displayName = googleUser.displayName || '';
        const parts = displayName.trim().split(' ');
        const firstname = parts[0] || '';
        const surname = parts.length > 1 ? parts.slice(1).join(' ') : '';
        
        updateSignupData({
          firstName: firstname,
          surname: surname,
          email: googleUser.email || '',
          isGoogleUser: true,
          uid: user.uid,
          username: googleUser.displayName || firstname,
        });

        history.push('/googleUser');
      }
    } catch (error: any) {
      setShowLoading(false);
      setAlertHeader('Google Login Failed');
      if (error.code === 'auth/popup-closed-by-user') {
        setAlertMessage('Login cancelled by user.');
      } else if (error.code === 'auth/popup-blocked') {
        setAlertMessage('Popup blocked by browser. Please allow popups and try again.');
      } else {
        setAlertMessage(error.message || 'An unexpected error occurred. Please try again.');
      }
      setShowAlert(true);
    } finally {
      setShowLoading(false);
    }
  };



  return (
    <IonPage>
      <IonContent className="login-content" fullscreen>
        <div className="logo-wrap">
          <img src="/assets/images/Pasig Logo.png" alt="Pasig Logo" className="logo" />
        </div>
        <h2 className="title">Tourism AI</h2>
        <p className="subtitle">DISCOVER THE PASIG WITH AI GUIDANCE!</p>

        <div className="login-card">
          <div className="form">

            <IonLabel position="stacked">Email</IonLabel>
            <IonItem className="input-item">
              <IonIcon icon={mailOutline} slot="start" className="input-icon" />
              <IonInput
                placeholder="Enter your email"
                type="email"
                className="text-input"
                value={email}
                onIonChange={(e: InputCustomEvent<InputChangeEventDetail>) => setEmail(e.detail.value!)}
              />
            </IonItem>

            <IonLabel position="stacked">Password</IonLabel>
            <IonItem className="input-item">
              <IonIcon icon={lockClosedOutline} slot="start" className="input-icon" />
              <IonInput
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                className="text-input"
                value={password}
                onIonChange={(e: InputCustomEvent<InputChangeEventDetail>) => setPassword(e.detail.value!)}
              />
            </IonItem>

            <IonButton
              expand="block"
              className="login-button"
              onClick={handleLogin}
            >
              Log In
            </IonButton>

            <div className="forgot">
              <Link to="/reset-password">Forgot password?</Link>
            </div>
            
            <div className="divider"><span>Or continue with</span></div>

            <IonButton fill="outline" className="google-button" onClick={handleGoogleLogin}>
              <img src="/assets/images/google Logo.png" alt="google" />
              Continue with Google
            </IonButton>

            <div className="signup">
              <Link to="/signUp1">Don't have an account? Sign up</Link>
            </div>
          </div>
        </div>

        <IonLoading
          isOpen={showLoading}
          message={'Logging in...'}
        />

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={alertHeader}
          message={alertMessage}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;