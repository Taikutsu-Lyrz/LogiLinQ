import React, { useState, useEffect, useCallback } from 'react';
import './styles/index.css';
import styles from './styles/styles';
import { useTranslation } from 'react-i18next'; // <-- 1. IMPORT
import { auth, db, onAuthStateChanged, doc, getDoc, setDoc, signOut } from './services/firebase';
import Header from './components/Header.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import Login from './pages/Login.jsx';
import RoleSelection from './pages/RoleSelection.jsx';
import SenderDashboard from './pages/SenderDashboard.jsx';
import DriverDashboard from './pages/DriverDashboard.jsx'; // <-- IMPORT DRIVER
import ReceiverDashboard from './pages/ReceiverDashboard.jsx';
import './styles/persian.css';
import { initializeFGPSLocation } from './services/ENABLE_FGPS_LOCATION';

export default function App() {
    useEffect(() => {
        initializeFGPSLocation();
    }, []);
    const { i18n } = useTranslation(); // <-- 2. CALL THE HOOK
    useEffect(() => {
        document.documentElement.lang = i18n.language;
    }, [i18n.language]);


    // --- State ---
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [roleError, setRoleError] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem('app-theme') || 'light');

    // --- VVV 3. ADD THIS 'useEffect' FOR RTL VVV ---
    useEffect(() => {
        const dir = i18n.dir(i18n.language);
        document.documentElement.dir = dir;
    }, [i18n, i18n.language]);
    // --- ^^^ END OF NEW CODE ^^^ ---

    // Apply theme
    useEffect(() => {
        document.documentElement.dataset.theme = theme;
    }, [theme]);

    // Theme toggle
    const toggleTheme = useCallback(() => {
        setTheme(t => {
            const newTheme = t === 'light' ? 'dark' : 'light';
            localStorage.setItem('app-theme', newTheme);
            return newTheme;
        });
    }, []);

    // Load Leaflet
    useEffect(() => {
        if (document.getElementById('leaflet-css')) return;
        const leafletCss = document.createElement('link');
        leafletCss.id = 'leaflet-css';
        leafletCss.rel = 'stylesheet';
        leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        leafletCss.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        leafletCss.crossOrigin = '';
        document.head.appendChild(leafletCss);
        const leafletJs = document.createElement('script');
        leafletJs.id = 'leaflet-js';
        leafletJs.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        leafletJs.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        leafletJs.crossOrigin = '';
        document.body.appendChild(leafletJs);
    }, []);

    // Auth state listener
    useEffect(() => {
        setLoading(true);
        const unsubscribe = onAuthStateChanged(auth, (authUser) => {
            setUser(authUser);
            if (!authUser) {
                setRole(null);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    // Fetch user role
    useEffect(() => {
        setRoleError(null);
        if (user) {
            setLoading(true);
            const userDocRef = doc(db, 'users', user.uid);
            getDoc(userDocRef)
                .then((userDoc) => {
                    if (userDoc.exists()) {
                        setRole(userDoc.data().role);
                    } else {
                        setRole(null);
                    }
                })
                .catch((error) => {
                    console.error("Error fetching user role:", error);
                    setRole(null);
                    setRoleError(`Failed to read user profile. Check Firestore permissions.`);
                })
                .finally(() => setLoading(false));
        } else {
            setRole(null);
        }
    }, [user]);

    // --- Handlers ---
    const handleSetRole = useCallback(async (selectedRole) => {
        if (!user) return;
        if (user.uid.startsWith('mock-uid-')) {
            setLoading(true);
            setTimeout(() => {
                setRole(selectedRole);
                setLoading(false);
            }, 500);
            return;
        }
        try {
            setLoading(true);
            setRoleError(null);
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, {
                role: selectedRole,
                email: user.email,
                displayName: user.displayName || 'User'
            }, { merge: true });
            setRole(selectedRole);
        } catch (error) {
            console.error("Error setting role:", error);
            setRoleError("Failed to save your role. Please check Firestore write permissions.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    const handleMockLogin = useCallback(() => {
        const mockUser = {
            uid: `mock-uid-${Math.random().toString(36).substr(2, 4)}`,
            email: 'dev@logiliq.com',
            displayName: 'Dev User (Mock)',
        };
        setUser(mockUser);
        setRole(null);
        setLoading(false);
    }, []);

    const handleLogout = useCallback(async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
            setUser(null);
            setRole(null);
            setLoading(false);
        }
    }, []);

    // --- Content Rendering ---
    const renderContent = () => {
        if (loading) {
            return <LoadingSpinner />;
        }
        if (!user) {
            return (
                <div style={{...styles.pageContainer, maxWidth: '1200px', margin: '0 auto'}}>
                    <Login onMockLogin={handleMockLogin} />
                </div>
            );
        }
        if (!role) {
            return (
                <div style={{...styles.pageContainer, maxWidth: '1200px', margin: '0 auto'}}>
                    <RoleSelection onSetRole={handleSetRole} roleError={roleError} />
                </div>
            );
        }

        switch (role) {
            case 'sender':
                return <SenderDashboard user={user} onLogout={handleLogout} toggleTheme={toggleTheme} theme={theme} />;
            case 'driver': // <-- DRIVER IS HERE
                return <DriverDashboard user={user} onLogout={handleLogout} toggleTheme={toggleTheme} theme={theme} />;
            case 'receiver':
                return <ReceiverDashboard user={user} onLogout={handleLogout} toggleTheme={toggleTheme} theme={theme} />;
            default:
                return (
                    <div style={styles.card}>
                        <p>Unknown role: {role}. Please contact support or try logging out.</p>
                        <button onClick={handleLogout} style={styles.button}>Logout</button>
                    </div>
                );
        }
    };

    return (
        <div style={styles.appContainer}>
            <Header toggleTheme={toggleTheme} theme={theme} />
            <div style={styles.content}>
                {renderContent()}
            </div>
        </div>
    );
}