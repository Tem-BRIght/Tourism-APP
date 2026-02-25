import React, { useEffect, useRef, useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonLoading } from '@ionic/react';
import { arrowBack } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import './maps.css';

// Note: Replace with your own Google Maps API key
// You can get one from: https://console.cloud.google.com/google/maps-apis
const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY";

// Default center - Pasig City, Philippines
const defaultCenter = { lat: 14.5776, lng: 121.0858 };

// Tourist spot locations in Pasig City
const touristSpots = [
  { id: 1, title: "Pasig City Hall", address: "Caruncho Ave, Pasig City", lat: 14.5776, lng: 121.0858 },
  { id: 2, title: "Pasig Cathedral", address: "Caballero St, Pasig City", lat: 14.5673, lng: 121.0789 },
  { id: 3, title: "Pasig Museum", address: "Museum Drive, Pasig City", lat: 14.5801, lng: 121.0831 },
  { id: 4, title: "Kapitolyo", address: "Pasig Kapitolyo", lat: 14.5745, lng: 121.0812 },
  { id: 5, title: "Rainbow Pond", address: "Rave, Pasig City", lat: 14.5698, lng: 121.0723 },
];

const MapPage: React.FC = () => {
  const history = useHistory();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [selectedSpot, setSelectedSpot] = useState<typeof touristSpots[0] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load Google Maps script
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      script.onerror = () => {
        setError('Failed to load Google Maps. Please check your API key.');
        setLoading(false);
      };
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapRef.current) return;

      try {
        const googleMap = new window.google.maps.Map(mapRef.current, {
          center: defaultCenter,
          zoom: 14,
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        });

        setMap(googleMap);

        // Add markers for tourist spots
        touristSpots.forEach((spot) => {
          const marker = new window.google.maps.Marker({
            position: { lat: spot.lat, lng: spot.lng },
            map: googleMap,
            title: spot.title,
            animation: window.google.maps.Animation.DROP,
          });

          marker.addListener('click', () => {
            setSelectedSpot(spot);
            googleMap.setCenter({ lat: spot.lat, lng: spot.lng });
            googleMap.setZoom(16);
          });
        });

        setLoading(false);
      } catch (err) {
        setError('Error initializing Google Maps.');
        setLoading(false);
      }
    };

    loadGoogleMaps();
  }, []);

  const handleGoToSpot = (spot: typeof touristSpots[0]) => {
    if (map) {
      map.setCenter({ lat: spot.lat, lng: spot.lng });
      map.setZoom(16);
      setSelectedSpot(spot);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => history.goBack()}>
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>Tourist Spots Map</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {loading && (
          <IonLoading
            isOpen={loading}
            message="Loading Map..."
            duration={30000}
          />
        )}

        {error && (
          <div className="map-error">
            <p>{error}</p>
            <p style={{ fontSize: '12px', marginTop: '10px' }}>
              To use Google Maps, you need to:
              <br />1. Get an API key from Google Cloud Console
              <br />2. Enable "Maps JavaScript API"
              <br />3. Replace "YOUR_GOOGLE_MAPS_API_KEY" in maps.tsx
            </p>
          </div>
        )}

        <div ref={mapRef} className="map-container" style={{ display: loading || error ? 'none' : 'block' }}></div>

        {/* List of tourist spots */}
        <div className="spots-list">
          <h3>Tourist Spots in Pasig City</h3>
          {touristSpots.map((spot) => (
            <div
              key={spot.id}
              className={`spot-item ${selectedSpot?.id === spot.id ? 'selected' : ''}`}
              onClick={() => handleGoToSpot(spot)}
            >
              <h4>{spot.title}</h4>
              <p>{spot.address}</p>
            </div>
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

// Add Google Maps types - using any to avoid type issues
declare global {
  interface Window {
    google: any;
  }
}

export default MapPage;
