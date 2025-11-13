import React, { useState, useMemo } from 'react';
import styles from '../../styles/styles';
import { useTranslation } from 'react-i18next';

const ShipmentsTab = ({
                          shipments,
                          handleTrackClick,
                          handleEditClick,
                          handlePrintShipment,
                          handleCompleteClick,
                          onArchive,
                          handleCopyShipmentId,
                          copiedId,
                          pendingConfirmation,
                          startConfirmation,
                          handleActionConfirm,
                          handleConfirmDelete,
                          handleHideShipment
                      }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredShipments = useMemo(() => {
        if (!searchTerm) return shipments;
        const term = searchTerm.toLowerCase();
        return shipments.filter(s =>
            s.shipmentId.toLowerCase().includes(term) ||
            s.receiver?.name.toLowerCase().includes(term) ||
            s.driver?.name.toLowerCase().includes(term)
        );
    }, [shipments, searchTerm]);

    return (
        <div style={styles.listCard}>
            <h3 style={styles.cardTitle}>{t('sender.manage.title')}</h3>

            <div style={styles.inputGroup}>
                <input
                    type="text"
                    placeholder={t('sender.manage.search')}
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
                            {/* Copy Button */}
                            <button
                                style={{
                                    ...styles.actionButton,
                                    backgroundColor: copiedId === ship.shipmentId ? 'var(--color-success)' : 'var(--color-secondary)',
                                    color: copiedId === ship.shipmentId ? 'white' : 'var(--color-text-primary)',
                                    transition: 'all 0.3s ease',
                                    transform: copiedId === ship.shipmentId ? 'scale(1.05)' : 'scale(1)'
                                }}
                                onClick={() => handleCopyShipmentId(ship.shipmentId)}
                                className="copy-button"
                            >
                                {copiedId === ship.shipmentId ? '✓ ' + t('btn.copied') : t('btn.copy')}
                            </button>

                            {/* Track Button */}
                            <button
                                style={{ ...styles.actionButton, ...styles.trackButton }}
                                onClick={() => handleTrackClick(ship)}
                            >
                                {t('btn.track')}
                            </button>

                            {/* Edit Button */}
                            <button
                                style={{ ...styles.actionButton, ...styles.editButton }}
                                onClick={() => handleEditClick(ship)}
                            >
                                {t('btn.edit')}
                            </button>

                            {/* Print Button */}
                            <button
                                style={{ ...styles.actionButton, ...styles.printButton }}
                                onClick={() => handlePrintShipment(ship)}
                            >
                                {t('btn.print')}
                            </button>

                            {/* Archive Button with inline confirmation */}
                            <button
                                style={{
                                    ...styles.actionButton,
                                    backgroundColor:
                                        pendingConfirmation.id === ship.id && pendingConfirmation.action === 'archive'
                                            ? 'var(--color-warning)'
                                            : styles.deleteButton?.backgroundColor || 'var(--color-error)',
                                    color: 'white',
                                    transition: 'all 0.3s ease',
                                    transform:
                                        pendingConfirmation.id === ship.id && pendingConfirmation.action === 'archive'
                                            ? 'scale(1.05)'
                                            : 'scale(1)'
                                }}
                                onClick={() => {
                                    if (pendingConfirmation.id === ship.id && pendingConfirmation.action === 'archive') {
                                        handleActionConfirm();
                                    } else {
                                        startConfirmation(ship.id, 'archive');
                                    }
                                }}
                            >
                                {pendingConfirmation.id === ship.id && pendingConfirmation.action === 'archive'
                                    ? t('btn.confirmAction') || 'Are you sure?'
                                    : t('btn.archive')}
                            </button>

                            {/* Complete Button */}
                            {ship.status !== 'Completed' && (
                                <button
                                    style={{ ...styles.actionButton, ...styles.completeButton }}
                                    onClick={() => handleCompleteClick(ship.id)}
                                >
                                    {t('btn.complete')}
                                </button>
                            )}
                        </div>
                    </li>
                )) : (
                    <p>{t('sender.manage.empty')}</p>
                )}
            </ul>
        </div>
    );
};

export default ShipmentsTab;
