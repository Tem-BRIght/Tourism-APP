import React, { useEffect, useRef, useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonLoading } from '@ionic/react';
import { arrowBack } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import './maps.css';

// using Leaflet for OpenStreetMap
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
    if (!mapRef.current) return;

    try {
      // initialize leaflet map
      const leafletMap = L.map(mapRef.current).setView([defaultCenter.lat, defaultCenter.lng], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(leafletMap);

      // Add markers for tourist spots
      touristSpots.forEach((spot) => {
        const marker = L.marker([spot.lat, spot.lng])
          .addTo(leafletMap)
          .bindPopup(`<strong>${spot.title}</strong><br>${spot.address}`);

        marker.on('click', () => {
          setSelectedSpot(spot);
          leafletMap.setView([spot.lat, spot.lng], 16);
        });
      });

      setMap(leafletMap);
      setLoading(false);
    } catch (err) {
      setError('Error initializing map.');
      setLoading(false);
    }
  }, []);

  const handleGoToSpot = (spot: typeof touristSpots[0]) => {
    if (map) {
      map.setView([spot.lat, spot.lng], 16);
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
          </div>
        )}

        <div
          ref={mapRef}
          className={`map-container ${loading || error ? 'hidden' : ''}`}
        ></div>

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


export default MapPage;
