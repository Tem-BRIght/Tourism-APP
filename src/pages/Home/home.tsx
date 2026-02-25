import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
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
import { Destination } from '../../types';
import './Home.css';

const Home: React.FC = () => {
  const history = useHistory();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const profilePic = localStorage.getItem('profilePic') || '/assets/images/Temporary.png';
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [recommended, setRecommended] = useState<Destination[]>([]);
  const [popular, setPopular] = useState<Destination[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      history.push('/login');
    }
  }, [isAuthenticated, authLoading, history]);

  useEffect(() => {
    const loadDestinationData = async () => {
      try {
        setDataLoading(true);
        const [recData, popData] = await Promise.all([
          fetchRecommendedDestinations(),
          fetchPopularDestinations(),
        ]);
        setRecommended(recData || []);
        setPopular(popData || []);
      } catch (error) {
        console.error('Error loading destinations:', error);
      } finally {
        setDataLoading(false);
      }
    };

    if (!authLoading && isAuthenticated) {
      loadDestinationData();
    }
  }, [authLoading, isAuthenticated]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      // TODO: Sync with Firestore
      return newSet;
    });
  };

  const handleDestinationClick = (dest: Destination) => {
    history.push(`/destination/${dest.id}`, dest);
  };

  if (authLoading || dataLoading) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <IonLoading isOpen={true} message="Loading..." />
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader className="header">
        <IonToolbar className="top-bar">
          <IonButtons slot="start" className="left-icons">
            <IonButton fill="clear" aria-label="notifications" onClick={() => history.push('/notifications')}>
              <span className="notification-badge" />
              <IonIcon icon={notifications} className="notification" />
            </IonButton>
          </IonButtons>
          <div className="center-space" />
          <IonSearchbar
            className="main-search"
            placeholder="Search destinations..."
            searchIcon={search}
            onIonInput={(e) => console.log('Search:', e.detail.value)} // Implement search later
          />
          <IonButtons slot="end" className="right-icons">
            <IonButton fill="clear" aria-label="profile" onClick={() => history.push('/profile')}>
              {profilePic ? (
                <div className="profile-pic-container">
                  <IonImg src={profilePic} className="profile-pic" />
                </div>
              ) : (
                <IonIcon icon={personCircle} className="profile" />
              )}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {/* AI Navigation Button */}
        <div className="ai-nav-button" onClick={() => history.push('/ai-guide')}>
          <IonImg src="/assets/images/AI/ALI 3.png" />
        </div>

        <section className="section">
          <h2>Recommended for You</h2>
          <div className="horizontal-scroll">
            {recommended.map((place) => (
              <IonCard
                key={place.id}
                className="recommend-card"
                onClick={() => handleDestinationClick(place)}
              >
                <div className="image-container">
                  <IonImg src={place.image} />
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
                      <span className="rating-value">{place.rating}</span>
                    </div>
                    <span className="dot">•</span>
                    <span className="distance">{place.distance}</span>
                  </div>
                </div>
              </IonCard>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <h2>Popular Destinations</h2>
            <IonButton fill="clear" className="view-all" onClick={() => history.push('/popular')}>
              View All
            </IonButton>
          </div>
          <IonGrid className="popular-grid">
            <IonRow>
              {popular.map((dest) => (
                <IonCol key={dest.id} size="6" size-md="3" size-lg="4">
                  <div className="popular-card" onClick={() => handleDestinationClick(dest)}>
                    <div className="image-container">
                      <IonImg src={dest.image} />
                      <div className="heart-icon" onClick={(e) => toggleFavorite(dest.id, e)}>
                        <IonIcon icon={favorites.has(dest.id) ? heart : heartOutline} />
                      </div>
                      <div className="ribbon">{dest.ranking}</div>
                    </div>
                    <div className="card-info">
                      <h4>{dest.title}</h4>
                      <div className="rating">
                        <IonIcon icon={star} />
                        <span className="rating-value">{dest.rating}</span>
                        <span className="reviews-value">({dest.reviews})</span>
                      </div>
                      <div className="distance">
                        <IonIcon icon={location} /> {dest.distance}
                      </div>
                    </div>
                  </div>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        </section>

        <section className="section">
          <h3>Cultural Highlights</h3>
          <IonCard className="featured-card" onClick={() => history.push('/cultural-highlights')}>
            <IonImg src="assets/images/feature.jpg" />
            <IonCardContent>Explore cultural highlights in Pasig City.</IonCardContent>
          </IonCard>
        </section>
      </IonContent>
    </IonPage>
  );
};

export default Home;