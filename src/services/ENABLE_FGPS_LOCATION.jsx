//Fake GPS Location Service use if you need to test GPS location in a specific area
const ENABLE_FGPS_LOCATION = true; //
// Define your GPS coordinates
const GPS_COORDINATESS = {
    lat: 36.705667,
    lng: 67.182963
};


export const initializeFGPSLocation = () => {
    if (!ENABLE_FGPS_LOCATION) {
        console.log("🌍 Using real GPS coordinatess");
        return;
    }

    console.log(`📍 GPS coordinatess loaded: ${GPS_COORDINATESS.lat}, ${GPS_COORDINATESS.lng}`);

    // Create position object
    const createPosition = () => ({
        coords: {
            latitude: GPS_COORDINATESS.lat,
            longitude: GPS_COORDINATESS.lng,
            accuracy: 10,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null
        },
        timestamp: Date.now()
    });

    // Override getCurrentPosition
    navigator.geolocation.getCurrentPosition = function(success, error, options) {
        console.log("📍 GPS coordinatess retrieved");
        const position = createPosition();
        if (success) {
            setTimeout(() => success(position), 100);
        }
    };

    // Override watchPosition
    navigator.geolocation.watchPosition = function(success, error, options) {
        console.log("📍 GPS coordinatess tracking active");
        const position = createPosition();
        if (success) {
            setTimeout(() => success(position), 100);
        }
        return Math.floor(Math.random() * 10000);
    };

    // Override clearWatch
    navigator.geolocation.clearWatch = function(watchId) {
        console.log("📍 GPS coordinatess tracking stopped");
    };
};

export { ENABLE_FGPS_LOCATION, GPS_COORDINATESS };
