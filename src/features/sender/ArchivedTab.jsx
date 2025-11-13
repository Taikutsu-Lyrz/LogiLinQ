import React, { useState, useMemo } from 'react';
import styles from '../../styles/styles';
import { useTranslation } from 'react-i18next';

const ArchivedTab = ({
                         shipments,
                         onUnarchive,
                         onDelete,
                         pendingConfirmation,
                         startConfirmation,
                         handleActionConfirm
                     }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredShipments = useMemo(() => {
        if (!searchTerm) return shipments;
        const term = searchTerm.toLowerCase();
        return shipments.filter(s =>
            s.shipmentId.toLowerCase().includes(term) ||
            s.receiver?.name.toLowerCase().includes(term)
        );
    }, [shipments, searchTerm]);

    return (
        <div style={styles.listCard}>
            <h3 style={styles.cardTitle}>{t('sender.archived.title')}</h3>

            <div style={styles.inputGroup}>
                <input
                    type="text"
                    placeholder={t('sender.archived.search')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ ...styles.input, marginBottom: '20px' }}
                />
            </div>

            <ul style={styles.list}>
                {filteredShipments.length > 0 ? filteredShipments.map(ship => (
                    <li key={ship.id} style={styles.listItem}>
                        <strong>{ship.shipmentId}</strong> - {ship.status}
                        <div style={styles.listItemDetails}>
                            <span>{t('list.to', { name: ship.receiver?.name || 'N/A' })}</span>
                            <span>{t('list.driver', { name: ship.driver?.name || 'N/A' })}</span>
                        </div>
                        <div style={styles.actionButtonGroup}>
                            <button
                                style={{ ...styles.actionButton, ...styles.trackButton }}
                                onClick={() => onUnarchive(ship.id)}
                            >
                                {t('sender.archived.unarchive')}
                            </button>

                            <button
                                style={{
                                    ...styles.actionButton,
                                    backgroundColor:
                                        pendingConfirmation.id === ship.id && pendingConfirmation.action === 'delete'
                                            ? 'var(--color-warning)'
                                            : styles.deleteButton?.backgroundColor || 'var(--color-error)',
                                    color: 'white',
                                    transition: 'all 0.3s ease',
                                    transform:
                                        pendingConfirmation.id === ship.id && pendingConfirmation.action === 'delete'
                                            ? 'scale(1.05)'
                                            : 'scale(1)'
                                }}
                                onClick={() => {
                                    if (pendingConfirmation.id === ship.id && pendingConfirmation.action === 'delete') {
                                        handleActionConfirm();
                                    } else {
                                        startConfirmation(ship.id, 'delete');
                                    }
                                }}
                            >
                                {pendingConfirmation.id === ship.id && pendingConfirmation.action === 'delete'
                                    ? t('btn.confirmAction') || 'Are you sure?'
                                    : t('sender.archived.delete')}
                            </button>
                        </div>
                    </li>
                )) : (
                    <p>{t('sender.archived.empty')}</p>
                )}
            </ul>
        </div>
    );
};

export default ArchivedTab;
