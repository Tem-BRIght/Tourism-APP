import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon,
  IonContent, IonAvatar, IonTitle, IonList, IonItem, IonLabel,
  IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonBackButton,
  IonLoading, IonAlert, IonPopover, IonInput
} from '@ionic/react';
import {
  ellipsisVertical, camera, person, location, mail, heart, star,
  save, close
} from 'ionicons/icons';
import { useAuth } from '../../../context/AuthContext';
import { getUserProfile, updateUserProfile, UserProfile } from '../../../services/userProfileService';
import './profile.css';

const Profile: React.FC = () => {
  const history = useHistory();
  const { user, logout, loading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const popoverButtonRef = useRef<HTMLIonButtonElement>(null);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stats placeholder (replace with real data later)
  const stats = { visited: 12, reviews: 8, upcoming: '?' };

  useEffect(() => {
    const fetchProfile = async () => {
      if (loading || !user) return;
      try {
        setError(null);
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
        if (profile?.img) localStorage.setItem('profilePic', profile.img);
      } catch (err) {
        console.error(err);
        setError('Failed to load profile. Please try again.');
      }
    };
    fetchProfile();
  }, [user, loading]);

  const handleLogout = async () => {
    setIsSaving(true);
    try {
      await logout();
      history.replace('/login');
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Image upload handling
  const handleImageClick = () => {
    if (!isEditing && userProfile) {
      // Enter edit mode first
      setEditForm({ ...userProfile });
      setIsEditing(true);
      setTimeout(() => fileInputRef.current?.click(), 50);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setEditForm(prev => ({ ...prev, img: reader.result as string }));
    reader.onerror = () => setError('Could not read selected image.');
    reader.readAsDataURL(file);
  };

  // Generic change handler for simple fields
  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  // Handler for nested name fields
  const handleNameChange = (subField: keyof UserProfile['name'], value: string) => {
    setEditForm(prev => ({
      ...prev,
      name: {
        firstname: prev.name?.firstname || userProfile?.name?.firstname || '',
        surname: prev.name?.surname || userProfile?.name?.surname || '',
        suffix: prev.name?.suffix || userProfile?.name?.suffix || '',
        [subField]: value
      }
    }));
  };

  const handleEditProfile = () => {
    if (userProfile) {
      setEditForm({ ...userProfile });
      setIsEditing(true);
    }
    setShowPopover(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!user || !userProfile) return;
    setIsSaving(true);
    try {
      // Simple validation
      if (!editForm.name?.firstname?.trim()) {
        throw new Error('First name is required');
      }
      if (!editForm.nickname?.trim()) {
        throw new Error('Nickname is required');
      }

      // Build changes object (only send what changed)
      const changes: Partial<UserProfile> = {};
      (Object.keys(editForm) as Array<keyof UserProfile>).forEach(key => {
        if (key === 'name') {
          const nameChanges: Partial<UserProfile['name']> = {};
          (['firstname', 'surname', 'suffix'] as const).forEach(sub => {
            if (editForm.name?.[sub] !== userProfile.name?.[sub]) {
              nameChanges[sub] = editForm.name?.[sub];
            }
          });
          if (Object.keys(nameChanges).length) changes.name = nameChanges as UserProfile['name'];
        } else if (editForm[key] !== userProfile[key]) {
          changes[key] = editForm[key] as any;
        }
      });

      if (Object.keys(changes).length === 0) {
        setIsEditing(false);
        setIsSaving(false);
        return;
      }

      await updateUserProfile(user.uid, changes);
      const merged = { ...userProfile, ...editForm };
      setUserProfile(merged);
      if (merged.img) localStorage.setItem('profilePic', merged.img);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonBackButton defaultHref="/home" /></IonButtons>
          <IonTitle>Profile</IonTitle>
          <IonButtons slot="end">
            <IonButton ref={popoverButtonRef} onClick={() => setShowPopover(true)}>
              <IonIcon icon={ellipsisVertical} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="profile-content">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <IonLoading isOpen={loading || isSaving} message={isSaving ? 'Saving...' : 'Loading...'} />

        {error && (
          <div className="error-banner">
            <p>{error}</p>
            <IonButton size="small" fill="outline" onClick={() => window.location.reload()}>Retry</IonButton>
          </div>
        )}

        {userProfile && (
          <>
            {/* Profile photo & name section */}
            <div className="profile-top-section">
              <div
                className="profile-photo-container"
                onClick={handleImageClick}
                role="button"
                tabIndex={0}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleImageClick()}
                style={{ cursor: 'pointer' }}
              >
                <IonAvatar className="profile-avatar">
                  <img
                    src={editForm.img || userProfile.img || '/assets/images/Temporary.png'}
                    alt="Profile"
                    onError={e => (e.currentTarget.src = '/assets/images/Temporary.png')}
                  />
                </IonAvatar>
                <div className="camera-icon" onClick={handleImageClick}>
                  <IonIcon icon={camera} />
                </div>
              </div>

              {!isEditing ? (
                <>
                  <h1 className="profile-name">
                    {userProfile.name?.firstname} {userProfile.name?.surname} {userProfile.name?.suffix}
                  </h1>
                  <p className="profile-username">@{userProfile.nickname}</p>
                </>
              ) : (
                <div className="editable-name-section">
                  <IonItem><IonLabel position="stacked">First Name</IonLabel><IonInput value={editForm.name?.firstname} onIonChange={e => handleNameChange('firstname', e.detail.value!)} /></IonItem>
                  <IonItem><IonLabel position="stacked">Surname</IonLabel><IonInput value={editForm.name?.surname} onIonChange={e => handleNameChange('surname', e.detail.value!)} /></IonItem>
                  <IonItem><IonLabel position="stacked">Suffix (optional)</IonLabel><IonInput value={editForm.name?.suffix} onIonChange={e => handleNameChange('suffix', e.detail.value!)} /></IonItem>
                  <IonItem><IonLabel position="stacked">Nickname</IonLabel><IonInput value={editForm.nickname} onIonChange={e => handleInputChange('nickname', e.detail.value!)} /></IonItem>
                </div>
              )}
            </div>

            {/* Personal Information */}
            <div className="personal-info-section">
              <h2>Personal Information</h2>
              {!isEditing ? (
                <IonList>
                  <IonItem><IonIcon icon={person} slot="start" /><IonLabel><h3>Date of Birth</h3><p>{userProfile.dateOfBirth ? new Date(userProfile.dateOfBirth).toLocaleDateString() : '-'}</p></IonLabel></IonItem>
                  <IonItem><IonIcon icon={location} slot="start" /><IonLabel><h3>Nationality</h3><p>{userProfile.nationality ? userProfile.nationality.charAt(0).toUpperCase() + userProfile.nationality.slice(1) : '-'}</p></IonLabel></IonItem>
                  <IonItem><IonIcon icon={mail} slot="start" /><IonLabel><h3>Email</h3><p>{userProfile.email}</p></IonLabel></IonItem>
                </IonList>
              ) : (
                <IonList>
                  <IonItem><IonLabel position="stacked">Date of Birth</IonLabel><IonInput type="date" value={editForm.dateOfBirth?.slice(0,10)} onIonChange={e => handleInputChange('dateOfBirth', e.detail.value!)} /></IonItem>
                  <IonItem><IonLabel position="stacked">Nationality</IonLabel><IonInput value={editForm.nationality} onIonChange={e => handleInputChange('nationality', e.detail.value!)} /></IonItem>
                </IonList>
              )}

              {isEditing && (
                <IonToolbar>
                  <IonButtons slot="start"><IonButton color="medium" onClick={handleCancelEdit}><IonIcon icon={close} slot="start" />Cancel</IonButton></IonButtons>
                  <IonButtons slot="end"><IonButton color="primary" onClick={handleSave} disabled={isSaving}><IonIcon icon={save} slot="start" />Save</IonButton></IonButtons>
                </IonToolbar>
              )}
            </div>

            {/* Stats */}
            <div className="stats-section">
              <IonGrid>
                <IonRow>
                  {(['visited', 'reviews', 'upcoming'] as const).map((key, idx) => (
                    <IonCol size="4" key={key}>
                      <IonCard className={`stat-card ${key === 'visited' ? 'visited' : key === 'reviews' ? 'reviews' : 'soon'}`}>
                        <IonCardContent><h3>{stats[key]}</h3><p>{key.charAt(0).toUpperCase() + key.slice(1)}</p></IonCardContent>
                      </IonCard>
                    </IonCol>
                  ))}
                </IonRow>
              </IonGrid>
            </div>

            {/* Action buttons */}
            <div className="action-buttons">
              <IonGrid>
                <IonRow>
                  <IonCol size="6"><IonButton expand="block" className="favorites-btn" onClick={() => history.push('/favorites')}><IonIcon icon={heart} slot="start" />Favorites</IonButton></IonCol>
                  <IonCol size="6"><IonButton expand="block" className="reviews-btn" onClick={() => history.push('/my-reviews')}><IonIcon icon={star} slot="start" />My Reviews</IonButton></IonCol>
                </IonRow>
              </IonGrid>
            </div>

            {/* Logout */}
            <div className="logout-section">
              <IonButton
                color="danger"
                expand="block"
                onClick={() => setShowLogoutAlert(true)}
              >
                Logout
              </IonButton>
            </div>

            <IonAlert
              isOpen={showLogoutAlert}
              onDidDismiss={() => setShowLogoutAlert(false)}
              header="Confirm Logout"
              message="Are you sure you want to logout?"
              buttons={[
                { text: 'Cancel', role: 'cancel' },
                { text: 'Logout', handler: handleLogout }
              ]}
            />
            <IonPopover isOpen={showPopover} onDidDismiss={() => setShowPopover(false)} triggerRef={popoverButtonRef}>
              <IonList>
                <IonItem button onClick={() => { setShowPopover(false); history.push('/scan-qr'); }}><IonLabel>Scan QR code</IonLabel></IonItem>
                <IonItem button onClick={handleEditProfile}><IonLabel>Edit profile</IonLabel></IonItem>
              </IonList>
            </IonPopover>
          </>
        )}

        <IonAlert isOpen={showLogoutAlert} onDidDismiss={() => setShowLogoutAlert(false)} header="Confirm Logout" message="Are you sure you want to logout?" buttons={[{ text: 'Cancel', role: 'cancel' }, { text: 'Logout', handler: handleLogout }]} />
        <IonPopover isOpen={showPopover} onDidDismiss={() => setShowPopover(false)} triggerRef={popoverButtonRef}>
          <IonList>
            <IonItem button onClick={() => { setShowPopover(false); history.push('/scan-qr'); }}><IonLabel>Scan QR code</IonLabel></IonItem>
            <IonItem button onClick={handleEditProfile}><IonLabel>Edit profile</IonLabel></IonItem>
          </IonList>
        </IonPopover>
      </IonContent>
    </IonPage>
  );
};

export default Profile;