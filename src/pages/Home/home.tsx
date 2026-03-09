import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonSearchbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonImg,
  IonLoading,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { search, personCircle, notifications, location, star, heart, heartOutline } from 'ionicons/icons';
import { useAuth } from '../../context/AuthContext';
import { fetchRecommendedDestinations, fetchPopularDestinations } from '../../services/destinationService';
import { getUserProfile } from '../../services/userProfileService';
import { Destination } from '../../types';
import './Home.css';

const Home: React.FC = () => {
  const history = useHistory();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [profilePic, setProfilePic] = useState<string>('/assets/images/Temporary.png');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [recommended, setRecommended] = useState<Destination[]>([]);
  const [popular, setPopular] = useState<Destination[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      history.replace('/login');
    }
  }, [isAuthenticated, authLoading, history]);

  // Load profile picture
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.uid) {
      (async () => {
        try {
          const profile = await getUserProfile(user.uid);
          if (profile?.img) setProfilePic(profile.img);
        } catch (err) {
          console.error('Error loading profile picture:', err);
        }
      })();
    }
  }, [authLoading, isAuthenticated, user]);

  // Load destination data
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      (async () => {
        try {
          setDataLoading(true);
          const [recData, popData] = await Promise.all([
            fetchRecommendedDestinations(),
            fetchPopularDestinations(),
          ]);
          setRecommended(recData ?? []);
          setPopular(popData ?? []);
        } catch (err) {
          console.error('Error loading destinations:', err);
        } finally {
          setDataLoading(false);
        }
      })();
    }
  }, [authLoading, isAuthenticated]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      // TODO: Sync with Firestore
      return next;
    });
  };

  const handleDestinationClick = (dest: Destination) => {
    history.push(`/destination/${dest.id}`, dest);
  };

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (authLoading || dataLoading) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <IonLoading isOpen message="Loading..." />
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      {/* ── Header ─────────────────────────────────────── */}
      <IonHeader className="header">
        <IonToolbar className="top-bar">
          <IonButtons slot="start" className="left-icons">
            <IonButton
              fill="clear"
              aria-label="Notifications"
              onClick={() => history.push('/notifications')}
            >
              <span className="notification-badge" />
              <IonIcon icon={notifications} />
            </IonButton>
          </IonButtons>

          <IonSearchbar
            className="main-search"
            placeholder="Search destinations…"
            searchIcon={search}
            onIonInput={(e) => console.log('Search:', e.detail.value)}
          />

          <IonButtons slot="end" className="right-icons">
            <IonButton
              fill="clear"
              aria-label="Profile"
              onClick={() => history.push('/profile')}
            >
              <div className="profile-pic-container">
                {profilePic ? (
                  <IonImg src={profilePic} className="profile-pic" />
                ) : (
                  <IonIcon icon={personCircle} style={{ fontSize: 32 }} />
                )}
              </div>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {/* ── AI Assistant Button ─────────────────────── */}
        <div
          className="ai-nav-button"
          role="button"
          aria-label="Open AI Guide"
          onClick={() => history.push('/ai-guide')}
        >
          <IonImg src="/assets/images/AI/ALI 3.png" />
        </div>

        {/* ── Greeting ────────────────────────────────── */}
        <div className="hero-greeting">
          <p className="greeting-label">{greeting}</p>
          <h1 className="greeting-title">
            Where to <span>explore</span> today?
          </h1>
        </div>

        {/* ── Recommended ─────────────────────────────── */}
        <section className="section">
          <h2>Recommended for You</h2>
          <div className="horizontal-scroll">
            {recommended.length === 0 ? (
              <p style={{ color: '#94A3B8', fontSize: 14 }}>No recommendations yet.</p>
            ) : (
              recommended.map((place) => (
                <IonCard
                  key={place.id}
                  className="recommend-card"
                  onClick={() => handleDestinationClick(place)}
                >
                  <div className="image-container">
                    <IonImg src={place.image} alt={place.title} />
                    {place.category && (
                      <span className="card-category-tag">{place.category}</span>
                    )}
                  </div>
                  <div className="card-body">
                    <div className="card-location">
                      <IonIcon icon={location} />
                      <span className="location-text">{place.address}</span>
                    </div>
                    <h3 className="card-title">{place.title}</h3>
                    <p className="card-desc">{place.desc}</p>
                    <div className="meta-row">
                      <div className="rating">
                        <IonIcon icon={star} />
                        <span>{place.rating}</span>
                      </div>
                      <span className="dot">•</span>
                      <span className="distance">{place.distance}</span>
                    </div>
                  </div>
                </IonCard>
              ))
            )}
          </div>
        </section>

        {/* ── Popular Destinations ─────────────────────── */}
        <section className="section">
          <div className="section-header">
            <h2>Popular Destinations</h2>
            <IonButton
              fill="clear"
              className="view-all"
              onClick={() => history.push('/popular')}
            >
              View All
            </IonButton>
          </div>

          <IonGrid className="popular-grid">
            <IonRow>
              {popular.length === 0 ? (
                <p style={{ color: '#94A3B8', fontSize: 14, padding: '0 4px' }}>
                  No popular destinations yet.
                </p>
              ) : (
                popular.map((dest) => (
                  <IonCol key={dest.id} size="6" size-md="4" size-lg="3">
                    <div
                      className="popular-card"
                      role="button"
                      aria-label={`View ${dest.title}`}
                      onClick={() => handleDestinationClick(dest)}
                    >
                      <div className="image-container">
                        <IonImg src={dest.image} alt={dest.title} />
                        <div
                          className="heart-icon"
                          role="button"
                          aria-label={
                            favorites.has(dest.id) ? 'Remove from favorites' : 'Add to favorites'
                          }
                          onClick={(e) => toggleFavorite(dest.id, e)}
                        >
                          <IonIcon icon={favorites.has(dest.id) ? heart : heartOutline} />
                        </div>
                        {dest.ranking && (
                          <div className="ribbon">#{dest.ranking}</div>
                        )}
                      </div>
                      <div className="card-info">
                        <h4>{dest.title}</h4>
                        <div className="rating">
                          <IonIcon icon={star} />
                          <span>{dest.rating}</span>
                          {dest.reviews && (
                            <span style={{ color: '#94A3B8' }}>({dest.reviews})</span>
                          )}
                        </div>
                        <div className="distance">
                          <IonIcon icon={location} />
                          <span>{dest.distance}</span>
                        </div>
                      </div>
                    </div>
                  </IonCol>
                ))
              )}
            </IonRow>
          </IonGrid>
        </section>

        {/* ── Cultural Highlights ──────────────────────── */}
        <section className="section" style={{ paddingBottom: 100 }}>
          <div className="featured-section-header">
            <h2>Cultural Highlights</h2>
          </div>
          <IonCard
            className="featured-card"
            onClick={() => history.push('/cultural-highlights')}
          >
            <IonImg src="assets/images/feature.jpg" alt="Cultural Highlights" />
            <IonCardContent>
              Explore the rich cultural heritage and hidden gems of Pasig City.
            </IonCardContent>
          </IonCard>
        </section>
      </IonContent>
    </IonPage>
  );
};

export default Home;