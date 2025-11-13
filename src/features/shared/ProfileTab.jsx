import React, { useState, useCallback } from 'react';
import styles from '../../styles/styles';
import { useTranslation } from 'react-i18next';
import { auth, db, updateProfile, doc, updateDoc } from '../../services/firebase';

const ProfileTab = ({ user }) => {
    const { t } = useTranslation();
    const [name, setName] = useState(user.displayName || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // This handles updating BOTH Firebase Auth and the user's document in Firestore
    const handleUpdateProfile = useCallback(async (e) => {
        e.preventDefault();
        if (name === user.displayName) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // 1. Update Firebase Authentication
            await updateProfile(auth.currentUser, { displayName: name });

            // 2. Update the 'users' document in Firestore
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, { displayName: name });

            setSuccess(t('profile.update.success'));
            // Note: The user object in App.jsx is now stale.
            // A full page reload is the simplest way to see the new name in the header.

        } catch (err) {
            console.error("Error updating profile:", err);
            setError(t('error.generic'));
        } finally {
            setLoading(false);
        }
    }, [name, user, t]);

    return (
        <div style={styles.listCard}>
            <h3 style={styles.cardTitle}>{t('profile.title')}</h3>

            <form onSubmit={handleUpdateProfile} style={styles.form}>
                <div style={styles.inputGroup}>
                    <label htmlFor="email" style={styles.label}>{t('login.email')}</label>
                    <input
                        id="email"
                        type="email"
                        value={user.email}
                        style={styles.input}
                        disabled // Email is not changeable
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label htmlFor="name" style={styles.label}>{t('profile.name')}</label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={styles.input}
                    />
                </div>

                {error && <p style={styles.errorText}>{error}</p>}
                {success && <p style={{color: 'var(--color-success)', fontWeight: 'bold'}}>{success}</p>}

                <button
                    type="submit"
                    style={styles.buttonPrimary}
                    disabled={loading || name === user.displayName}
                    className="buttonPrimary"
                >
                    {loading ? t('login.wait') : t('btn.save')}
                </button>
            </form>
        </div>
    );
};

export default ProfileTab;