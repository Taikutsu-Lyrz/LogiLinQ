import React from 'react';
import styles from '../styles/styles';
import { MenuIcon } from './icons';
import { useTranslation } from 'react-i18next';

const DashboardHeader = ({ title, user, onLogout, onToggleMenu }) => {
    const { t } = useTranslation();

    return (
        <div style={styles.dashboardHeader}>
            <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'absolute', top: '16px' }} // <-- REMOVED 'right: 0'
                className="dashboard-header-buttons"
            >
                <button
                    onClick={onLogout}
                    style={styles.buttonSecondary}
                    className="button desktop-only-item"
                >
                    {t('btn.logout')}
                </button>
                {onToggleMenu && (
                    <button onClick={onToggleMenu} style={styles.menuButton} className="mobile-menu-button">
                        <MenuIcon />
                    </button>
                )}
            </div>

            <div>
                <h2 style={styles.pageTitle}>{title}</h2>
                <p style={styles.pageText}>{t('header.welcome', { name: user.displayName || user.email })}</p>
                <p style={{...styles.pageText, fontSize: '0.8rem', wordBreak: 'break-all'}}>User ID: {user.uid}</p>
            </div>
        </div>
    );
};

export default DashboardHeader;