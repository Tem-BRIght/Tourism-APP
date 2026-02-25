import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonContent, IonPage, IonButton, IonInput,
  IonItem, IonLabel, IonLoading, IonAlert, IonIcon,
  InputCustomEvent, InputChangeEventDetail
} from '@ionic/react';
import { lockClosedOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';

import './reset-password.css';

const ResetPassword: React.FC = () => {
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertHeader, setAlertHeader] = useState('');

  useEffect(() => {
    // Get email from session storage
    const resetEmail = sessionStorage.getItem('resetEmail');
    if (resetEmail) {
      setEmail(resetEmail);
    } else {
      // If no email, redirect back to forgot password
      history.push('/forgot');
    }
  }, [history]);

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumberOrSymbol = /[0-9!@#$%^&*]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumberOrSymbol) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number or symbol';
    }

    return null;
  };

  const handleResetPassword = async () => {
    if (!code || !newPassword || !confirmPassword) {
      setAlertHeader('Validation Error');
      setAlertMessage('Please fill in all fields');
      setShowAlert(true);
      return;
    }

    if (code.length !== 6) {
      setAlertHeader('Invalid Code');
      setAlertMessage('Please enter a valid 6-digit reset code');
      setShowAlert(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setAlertHeader('Password Mismatch');
      setAlertMessage('Passwords do not match');
      setShowAlert(true);
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setAlertHeader('Password Requirements');
      setAlertMessage(passwordError);
      setShowAlert(true);
      return;
    }


      // Clear session storage
      sessionStorage.removeItem('resetEmail');

      setAlertHeader('Password Reset Successful');
      setAlertMessage('Your password has been reset successfully. You can now log in with your new password.');
      setShowAlert(true);

      // Redirect to login after success
      setTimeout(() => {
        history.push('/login');
      }, 2000);

  };

  return (
    <IonPage>
      <IonContent className="reset-content" fullscreen>
        <div className="logo-wrap">
          <img src="/public/assets/images/Pasig Logo.png" alt="Pasig Logo" className="logo" />
        </div>
        <h2 className="title">Reset Password</h2>
        <p className="subtitle">Enter the code from your email and create a new password</p>

        <div className="reset-card">
          <div className="form">
            <div className="email-display">
              <IonIcon icon="mail-outline" />
              <span>{email}</span>
            </div>

            <IonLabel position="stacked">Reset Code</IonLabel>
            <IonItem className="input-item">
              <IonInput
                placeholder="Enter 6-digit code"
                type="text"
                className="code-input"
                value={code}
                maxlength={6}
                onIonChange={(e: InputCustomEvent<InputChangeEventDetail>) => {
                  const value = e.detail.value!.replace(/\D/g, ''); // Only allow digits
                  setCode(value);
                }}
              />
            </IonItem>

            <IonLabel position="stacked">New Password</IonLabel>
            <IonItem className="input-item">
              <IonIcon icon={lockClosedOutline} slot="start" />
              <IonInput
                placeholder="Enter new password"
                type={showPassword ? "text" : "password"}
                className="text-input"
                value={newPassword}
                onIonChange={(e: InputCustomEvent<InputChangeEventDetail>) => setNewPassword(e.detail.value!)}
              />
              <IonIcon
                icon={showPassword ? eyeOffOutline : eyeOutline}
                slot="end"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              />
            </IonItem>

            <IonLabel position="stacked">Confirm New Password</IonLabel>
            <IonItem className="input-item">
              <IonIcon icon={lockClosedOutline} slot="start" />
              <IonInput
                placeholder="Confirm new password"
                type={showConfirmPassword ? "text" : "password"}
                className="text-input"
                value={confirmPassword}
                onIonChange={(e: InputCustomEvent<InputChangeEventDetail>) => setConfirmPassword(e.detail.value!)}
              />
              <IonIcon
                icon={showConfirmPassword ? eyeOffOutline : eyeOutline}
                slot="end"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            </IonItem>

            <div className="password-requirements">
              <p>Password must contain:</p>
              <ul>
                <li className={newPassword.length >= 8 ? 'valid' : ''}>✓ At least 8 characters</li>
                <li className={/[A-Z]/.test(newPassword) ? 'valid' : ''}>✓ One uppercase letter</li>
                <li className={/[a-z]/.test(newPassword) ? 'valid' : ''}>✓ One lowercase letter</li>
                <li className={/[0-9!@#$%^&*]/.test(newPassword) ? 'valid' : ''}>✓ One number or symbol</li>
              </ul>
            </div>

            <IonButton
              expand="block"
              className="reset-button"
              onClick={handleResetPassword}
              disabled={!code || !newPassword || !confirmPassword}
            >
              Reset Password
            </IonButton>
          </div>
        </div>

        <IonLoading
          isOpen={showLoading}
          message={'Resetting password...'}
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

export default ResetPassword;