import React from 'react';
import styles from '../styles/styles';
import { useTranslation } from 'react-i18next';



//Header Components

const Header = ({ toggleTheme, theme }) => {
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const getLangBtnStyle = (lang) => {
        const currentLang = i18n.language.startsWith(lang) ? lang : null;
        return currentLang === lang
            ? {...styles.themeToggleButton, backgroundColor: 'var(--color-primary)', color: 'white'}
            : {...styles.themeToggleButton, opacity: 0.7};
    };

    return (
        <header style={styles.header}>
            <div style={styles.headerInner}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                        src="/logo-black.svg"
                        alt="LogiliQ Logo"
                        className="header-logo light-mode-logo"
                    />
                    <img
                        src="/logo-white.svg"
                        alt="LogiliQ Logo"
                        className="header-logo dark-mode-logo"
                    />
                    <h1 style={styles.headerTitle}>LogilinQ</h1>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>


                    <button
                        onClick={() => changeLanguage('en')}
                        style={getLangBtnStyle('en')}
                        className="themeToggleButton"
                    >
                        {t('lang.english')}
                    </button>
                    <button
                        onClick={() => changeLanguage('fa')}
                        style={getLangBtnStyle('fa')}
                        className="themeToggleButton"
                    >
                        {t('lang.persian')}
                    </button>



                    {/* Theme Toggle Button (still desktop-only) */}
                    <button
                        onClick={toggleTheme}
                        style={styles.themeToggleButton}
                        className="themeToggleButton desktop-only-item"
                    >
                        {theme === 'light' ? t('header.theme.dark') : t('header.theme.light')}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;