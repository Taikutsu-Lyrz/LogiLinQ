import React from 'react';
import styles from '../styles/styles';
import { SenderIcon, DriverIcon, ReceiverIcon } from '../components/icons';
import { useTranslation } from 'react-i18next';

const RoleSelection = ({ onSetRole, roleError }) => {
    const { t } = useTranslation();

    return (
        <div style={styles.pageContainer}>
            <div style={styles.card}>
                <h2 style={styles.pageTitle}>{t('role.title')}</h2>
                <p style={styles.pageText}>Choose how you'll be using the app.</p>
                {roleError && (
                    <div style={styles.errorBox}>
                        <p style={styles.errorText}><strong>Action Required:</strong> {roleError}</p>
                        <p style={styles.errorText}>This is usually a <strong>Firestore Security Rules</strong> issue. Ensure your rules allow writes to the `users/{userId}` path.</p>
                    </div>
                )}
                <div style={styles.roleSelectionContainer}>
                    <button onClick={() => onSetRole('sender')} style={styles.roleButtonCard} className="roleButtonCard">
                        <SenderIcon />
                        <span style={{ fontSize: '1.2rem', fontWeight: '600' }}>{t('role.sender')}</span>
                        <p style={{ ...styles.pageText, margin: 0, fontSize: '0.9rem' }}>{t('role.sender.desc')}</p>
                    </button>

                    <button onClick={() => onSetRole('driver')} style={styles.roleButtonCard} className="roleButtonCard">
                        <DriverIcon />
                        <span style={{ fontSize: '1.2rem', fontWeight: '600' }}>{t('role.driver')}</span>
                        <p style={{ ...styles.pageText, margin: 0, fontSize: '0.9rem' }}>{t('role.driver.desc')}</p>
                    </button>

                    <button onClick={() => onSetRole('receiver')} style={styles.roleButtonCard} className="roleButtonCard">
                        <ReceiverIcon />
                        <span style={{ fontSize: '1.2rem', fontWeight: '600' }}>{t('role.receiver')}</span>
                        <p style={{ ...styles.pageText, margin: 0, fontSize: '0.9rem' }}>{t('role.receiver.desc')}</p>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoleSelection;