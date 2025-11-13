import React, { useEffect, useRef, useId } from 'react';
import styles from '../styles/styles';

/**
 * MapDisplay Component
 */
const MapDisplay = ({ location }) => {
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    // Use React.useId to ensure a unique ID for each map instance
    const mapId = `map-${useId()}`;

    useEffect(() => {
        // Only attempt to initialize if Leaflet is loaded
        if (typeof L === 'undefined') {
            console.warn("Leaflet (L) is not defined. Map cannot be initialized.");
            return;
        }

        // Initialize map only once
        if (!mapRef.current && location) {
            try {
                const map = L.map(mapId).setView([location.lat, location.lng], 13);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap'
                }).addTo(map);

                // Custom truck icon using HTML/CSS
                const truckIcon = L.divIcon({
                    html: '<span style="font-size: 2rem;">🚚</span>',
                    className: 'map-truck-icon', // See CSS block for .map-truck-icon
                    iconSize: [32, 32],
                    iconAnchor: [16, 32] // Point of the icon (bottom center)
                });

                markerRef.current = L.marker([location.lat, location.lng], { icon: truckIcon }).addTo(map);
                mapRef.current = map;
            } catch (e) {
                console.error("Error initializing Leaflet map:", e);
            }
        }
    }, [mapId, location]); // mapId is now a stable dependency

    // Update marker location when location prop changes
    useEffect(() => {
        if (mapRef.current && markerRef.current && location) {
            const newLatLng = [location.lat, location.lng];
            markerRef.current.setLatLng(newLatLng);
            mapRef.current.panTo(newLatLng);
        }
    }, [location]);

    // Render the map container
    return (
        <div id={mapId} style={styles.mapContainer}>
            {!location && <div style={{padding: '20px', textAlign: 'center'}}>Waiting for driver's location...</div>}
        </div>
    );
};

export default MapDisplay;