import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonButton, IonIcon, IonImg, IonModal,
  IonText, IonLoading
} from '@ionic/react';
import { arrowBack, location as locationIcon, star } from 'ionicons/icons';
import { Destination } from '../../../types';
import './DestinationDetail.css';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

// Static configuration for dynamic sections
const SECTIONS: { key: keyof Destination; label: string }[] = [
  { key: 'history', label: 'History' },
  { key: 'features', label: 'Features' },
  { key: 'massSchedule', label: 'Mass Schedule' },
  { key: 'attractions', label: 'Attractions & Activities' },
  { key: 'operatingHours', label: 'Operating Hours by Zone' },
  { key: 'packages', label: 'Package Deals' },
  { key: 'safety', label: 'Safety Information' },
  { key: 'foodCategories', label: 'Top Restaurants' },
  { key: 'mustTryDishes', label: 'Must-Try Dishes' },
  { key: 'bestTimes', label: 'Best Times to Visit' },
  { key: 'parkingInfo', label: 'Parking Information' },
  { key: 'walkingTour', label: 'Walking Tour Routes' },
  { key: 'specialEvents', label: 'Special Events' },
  { key: 'exhibitHalls', label: 'Exhibit Halls' },
  { key: 'specialExhibits', label: 'Special Exhibits' },
  { key: 'guidedTours', label: 'Guided Tours' },
  { key: 'collections', label: 'Collections' },
  { key: 'researchFacilities', label: 'Research Facilities' },
  { key: 'visitorServices', label: 'Visitor Services' },
  { key: 'rules', label: 'Rules & Guidelines' },
  { key: 'specialPrograms', label: 'Special Programs' },
  { key: 'visitorTips', label: 'Visitor Tips' },
  { key: 'nearbyAttractions', label: 'Nearby Attractions' },
  { key: 'reviewsSummary', label: 'Reviews Summary' },
  { key: 'ecoFeatures', label: 'Eco-Features' },
];

// Basic info fields to display (key, label, default value)
const BASIC_FIELDS = [
  { key: 'desc', label: 'Description', default: 'Pasig Recreational and Adventure Venue for Events' },
  { key: 'hours', label: 'Hours', default: '6 AM - 10 PM' },
  { key: 'entrance', label: 'Entrance', default: 'Free' },
  { key: 'goodFor', label: 'Good for', default: 'Families, Events' },
  { key: 'parking', label: 'Parking', default: 'P50/hour' },
  { key: 'lastUpdated', label: 'Last updated', default: 'January 2026' },
];

const DestinationDetail: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const dest = location.state as Destination;
  const [showItinerary, setShowItinerary] = useState(false);
  const [itinerary, setItinerary] = useState('');
  const [generating, setGenerating] = useState(false);

  if (!dest) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <p>Destination not found.</p>
          <IonButton onClick={() => history.push('/home')}>Go Back</IonButton>
        </IonContent>
      </IonPage>
    );
  }

  const handleBack = () => {
    if (history.length > 1) history.goBack();
    else history.push('/home');
  };

  const handleNavigate = () => {
    const address = dest.location || dest.address || dest.distance;
    if (address) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
    }
  };

  const callOpenAI = async (userMessage: string) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a travel assistant for Pasig City, Philippines. Generate detailed information about destinations.' },
          { role: 'user', content: userMessage },
        ],
      }),
    });
    const data = await response.json();
    return data.choices[0].message.content;
  };

  const generateItinerary = async () => {
    setGenerating(true);
    try {
      const response = await callOpenAI(`Generate a detailed day itinerary for visiting ${dest.title} in Pasig City. Include activities, timings, and tips.`);
      setItinerary(response);
      setShowItinerary(true);
    } catch (error) {
      console.error('Error generating itinerary:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={handleBack}>
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>{dest.title}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="destination-detail">
          <IonImg src={dest.image} className="detail-image" />

          <div className="detail-info">
            <h2>{dest.title}</h2>

            {/* Rating line */}
            <div className="rating">
              <IonIcon icon={star} />
              <span className="rating-value">{dest.rating} out of 5</span>
              <span className="reviews-value">({dest.reviews} reviews)</span>
              <span>, {dest.ranking} of 5 most visited</span>
            </div>

            {/* Location */}
            <div className="location">
              <IonIcon icon={locationIcon} /> {dest.location || dest.address || dest.distance}
            </div>

            {/* Basic info fields */}
            {BASIC_FIELDS.map(({ key, label, def }) => {
              const value = (dest as any)[key] || def;
              return value ? <p key={key}>{label}: {value}</p> : null;
            })}

            {/* Action buttons */}
            <div className="action-buttons">
              <IonButton fill="outline" onClick={handleNavigate}>Navigate</IonButton>
              <IonButton fill="outline" onClick={generateItinerary} disabled={generating}>Itinerary</IonButton>
              <IonButton fill="outline" onClick={() => history.push('/ai-guide')}>Guide</IonButton>
            </div>

            {/* About section */}
            <div className="about-section">
              <h3>About {dest.title}</h3>
              <p>{dest.about || dest.desc}</p>
            </div>

            {/* Dynamic sections */}
            {SECTIONS.map(({ key, label }) =>
              dest[key] ? (
                <div className="section" key={key}>
                  <h3>{label}</h3>
                  <p style={{ whiteSpace: 'pre-line' }}>{dest[key] as string}</p>
                </div>
              ) : null
            )}
          </div>
        </div>

        {/* Itinerary modal */}
        <IonModal isOpen={showItinerary} onDidDismiss={() => setShowItinerary(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Itinerary for {dest.title}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowItinerary(false)}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonText>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{itinerary}</pre>
            </IonText>
          </IonContent>
        </IonModal>

        <IonLoading isOpen={generating} message="Generating itinerary..." />
      </IonContent>
    </IonPage>
  );
};

export default DestinationDetail;