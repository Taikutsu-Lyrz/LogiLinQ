import React, { useState } from 'react';
import styles from '../styles/styles';
import {
    auth,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    signInWithPopup,
    sendEmailVerification,
    sendPasswordResetEmail
} from '../services/firebase';
import { useTranslation } from 'react-i18next';
import { GoogleIcon } from '../components/icons/index.jsx';
import Modal from '../components/Modal.jsx';

const Login = ({ onMockLogin }) => {
    const { t } = useTranslation();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotError, setForgotError] = useState('');
    const [forgotSuccess, setForgotSuccess] = useState('');

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setForgotError('');
        setForgotSuccess('');
        try {
            await sendPasswordResetEmail(auth, forgotEmail);
            setForgotSuccess(t('login.forgot.success'));
        } catch (err) {
            console.error(err);
            setForgotError(err.message);
        } finally {
            setLoading(false);
        }
    };

// --- Google Sign-In Handler ---
    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            setError('');
            setLoading(true);
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error during Google Sign-In:", error);
            setLoading(false);
            if (error.code === 'auth/popup-closed-by-user') {
                setError(t('login.errors.cancelled'));
            } else {
                setError(error.message);
            }
        }
    };

// --- Email/Password Auth Handler ---
    const handleEmailAuth = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError(t('login.errors.emailPasswordRequired'));
            return;
        }
        if (isSignUp && !name) {
            setError(t('login.errors.nameRequired'));
            return;
        }
        setLoading(true);
        setError('');
        try {
            if (isSignUp) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: name });
                await sendEmailVerification(userCredential.user);
                console.log("User created, profile updated, verification email sent.");
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                console.log("User signed in");
            }
        } catch (error) {
            console.error("Error during email auth:", error);
            if (error.code === 'auth/email-already-in-use') {
                setError(t('login.errors.emailInUse'));
            } else if (error.code === 'auth/weak-password') {
                setError(t('login.errors.weakPassword'));
            } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                setError(t('login.errors.invalidCredentials'));
            } else {
                setError(error.message);
            }
            setLoading(false);
        }
    };


    return (
        <>
            {/*Forgot Password*/}
            <Modal show={showForgotModal} onClose={() => setShowForgotModal(false)} title={t('login.forgot.title')}>
                <p style={styles.pageText}>{t('login.forgot.desc')}</p>
                <form onSubmit={handleForgotPassword} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label htmlFor="forgotEmail" style={styles.label}>{t('login.email')}</label>
                        <input
                            id="forgotEmail"
                            type="email"
                            placeholder="e.g., user@example.com"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <button
                        type="submit"
                        style={styles.buttonPrimary}
                        disabled={loading}
                        className="buttonPrimary"
                    >
                        {loading ? t('login.wait') : t('login.forgot.btn')}
                    </button>
                    {forgotError && <p style={{...styles.errorText, marginTop: '10px'}}>{forgotError}</p>}
                    {forgotSuccess && <p style={{color: 'var(--color-success)', fontWeight: 'bold', marginTop: '10px'}}>{forgotSuccess}</p>}
                </form>
            </Modal>

            <div style={styles.loginCardContainer}>
                <div
                    style={styles.loginCardIllustration}
                    className="login-card-illustration"
                />
                <div style={styles.loginCardForm}>
                    <h2 style={styles.pageTitle}>{isSignUp ? t('login.createAccount') : t('login.signIn')}</h2>
                    <form onSubmit={handleEmailAuth} style={styles.form}>
                        {isSignUp && (
                            <div style={styles.inputGroup}>
                                <label htmlFor="name" style={styles.label}>{t('login.yourName')}</label>
                                <input
                                    id="name"
                                    type="text"
                                    placeholder="e.g., Jane Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    style={styles.input}
                                />
                            </div>
                        )}

                        {/* --- VVV THIS IS THE FIX VVV --- */}
                        <div style={styles.inputGroup}>
                            <label htmlFor="email" style={styles.label}>{t('login.email')}</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="e.g., user@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label htmlFor="password" style={styles.label}>{t('login.password')}</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="6+ characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={styles.input}
                            />
                        </div>
                        {/* --- ^^^ END OF FIX ^^^ --- */}

                        {!isSignUp && (
                            <button
                                type="button"
                                onClick={() => setShowForgotModal(true)}
                                style={{...styles.toggleButton, margin: '10px 0 0', padding: 0, alignSelf: 'flex-end'}}
                            >
                                {t('login.forgot')}
                            </button>
                        )}

                        <button
                            type="submit"
                            style={{...styles.buttonPrimary, marginTop: '10px'}}
                            disabled={loading}
                            className="buttonPrimary"
                        >
                            {loading ? t('login.wait') : (isSignUp ? t('login.createAccount') : t('login.signIn'))}
                        </button>
                    </form>
                    {error && (
                        <div style={styles.errorBox}>
                            <p style={styles.errorText}>{error}</p>
                        </div>
                    )}
                    <p style={styles.separator}>{t('login.or')}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 0 }}>
                        <button
                            onClick={handleGoogleLogin}
                            style={{
                                ...styles.button,
                                border: `1px solid var(--color-google-border)`,
                                backgroundColor: 'var(--color-google-bg)',
                                color: 'var(--color-google-text)',
                                marginTop: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '10px 20px',
                            }}
                            disabled={loading}
                            className="button"
                        >
                            <GoogleIcon />
                            {t('login.google')}
                        </button>
                        <button
                            onClick={onMockLogin}
                            style={{...styles.buttonWarning, marginTop: 0,
                            display : 'none'}}
                            className="buttonWarning"

                        >
                            {t('login.skip')}
                        </button>
                    </div>
                    <button
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError('');
                        }}
                        style={styles.toggleButton}
                    >
                        {isSignUp ? t('login.toggle.toSignIn') : t('login.toggle.toSignUp')}
                    </button>
                </div>
            </div>
        </>
    );
};

export default Login;