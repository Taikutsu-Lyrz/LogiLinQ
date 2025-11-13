import React, { useEffect } from 'react'; // <-- 1. IMPORT useEffect
import styles from '../styles/styles';

/**
 * Modal Component
 */
const Modal = ({ show, onClose, title, children }) => {


    // This locks and unlocks the background page scroll
    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        // Cleanup function to re-enable scroll if component is removed
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [show]); // This effect runs every time the 'show' prop changes


    if (!show) {
        return null;
    }
    return (
        <div style={styles.modalOverlay} onClick={onClose}>
            <div style={styles.modalContent} className="modal-content-area" onClick={e => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <h3 style={styles.modalTitle}>{title}</h3>
                    <button onClick={onClose} style={styles.modalCloseButton}>&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default Modal;