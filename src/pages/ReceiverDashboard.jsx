import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import styles from '../styles/styles';
import {
    db,
    doc,
    updateDoc,
    query,
    collection,
    where,
    onSnapshot,
    getDocs
} from '../services/firebase';
import { useTranslation } from 'react-i18next';

// Import Components
import DashboardHeader from '../components/DashboardHeader.jsx';
import MapDisplay from '../components/MapDisplay.jsx';
import Modal from '../components/Modal.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ReceiverRecapTab from '../features/receiver/ReceiverRecapTab.jsx';
import ProfileTab from '../features/shared/ProfileTab.jsx';

const ReceiverDashboard = ({ user, onLogout, toggleTheme, theme }) => {
    const { t } = useTranslation();
    const [myShipments, setMyShipments] = useState([]);
    const [archivedShipments, setArchivedShipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [trackingShipment, setTrackingShipment] = useState(null);
    const [manualShipmentId, setManualShipmentId] = useState('');
    const [manualError, setManualError] = useState('');
    const [activeTab, setActiveTab] = useState('manage');
    const [searchTerm, setSearchTerm] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);

    const modalUnsubscribeRef = useRef(null);

    useEffect(() => {
        if (!user?.email) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const q = query(collection(db, 'shipments'), where('receiver.email', '==', user.email));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const sorted = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(s => !s.deletedByReceiver)
                .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            setMyShipments(sorted);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching active shipments:", err);
            setError(t('error.generic'));
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user, t]);

    useEffect(() => {
        if (!user?.email) return;
        const q = query(collection(db, 'shipments'), where('receiver.email', '==', `archived-${user.email}`));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const sorted = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(s => !s.deletedByReceiver)
                .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            setArchivedShipments(sorted);
        }, (err) => {
            console.error("Error fetching archived shipments:", err);
        });
        return () => unsubscribe();
    }, [user]);

    const handleCloseModal = () => {
        if (modalUnsubscribeRef.current) {
            modalUnsubscribeRef.current();
            modalUnsubscribeRef.current = null;
        }
        setTrackingShipment(null);
    };

    const openLiveTrackingModal = (shipment) => {
        if (modalUnsubscribeRef.current) {
            modalUnsubscribeRef.current();
        }
        setTrackingShipment({...shipment, modalError: null});

        const unsub = onSnapshot(
            doc(db, 'shipments', shipment.id),
            (docSnap) => {
                if (docSnap.exists()) {
                    setTrackingShipment(prev => ({ ...prev, ...docSnap.data() }));
                } else {
                    handleCloseModal();
                }
            }
        );
        modalUnsubscribeRef.current = unsub;
    };

    const handleManualTrack = async (e) => {
        e.preventDefault();
        setManualError('');
        if (!manualShipmentId) return setManualError(t('error.noShipmentId'));
        const q = query(collection(db, 'shipments'), where('shipmentId', '==', manualShipmentId.toUpperCase()));
        try {
            const snap = await getDocs(q);
            if (snap.empty) return setManualError(t('error.notFound'));
            const data = { id: snap.docs[0].id, ...snap.docs[0].data() };
            openLiveTrackingModal(data);
            setManualShipmentId('');
        } catch (err) {
            setManualError(t('error.generic'));
        }
    };

    const handleTrackClick = (shipment) => {
        openLiveTrackingModal(shipment);
    };

    const handleMarkAsReceived = useCallback(async (shipmentId) => {
        if (!shipmentId) return;
        const docRef = doc(db, 'shipments', shipmentId);
        try {
            await updateDoc(docRef, { status: 'Received', currentDriverLocation: null });
            handleCloseModal();
        } catch (err) {
            setError(t('error.updateFailed'));
        }
    }, [t]);

    const handleUncompleteShipment = useCallback(async (shipmentId) => {
        if (!shipmentId) return;
        const docRef = doc(db, 'shipments', shipmentId);
        try {
            await updateDoc(docRef, { status: 'Delivered' });
        } catch (err) {
            setError(t('error.updateFailed'));
        }
    }, [t]);

    const handleHideShipment = useCallback(async (shipmentId) => {
        if (!shipmentId || !user) return;
        const docRef = doc(db, 'shipments', shipmentId);
        try {
            await updateDoc(docRef, { 'receiver.email': `archived-${user.email}` });
        } catch (err) {
            setError(t('error.hideFailed'));
        }
    }, [user, t]);

    const handleUnhideShipment = useCallback(async (shipmentId) => {
        if (!shipmentId || !user) return;
        const docRef = doc(db, 'shipments', shipmentId);
        try {
            await updateDoc(docRef, { 'receiver.email': user.email });
        } catch (err) {
            setError(t('error.unhideFailed'));
        }
    }, [user, t]);

    const handleDeletePermanently = useCallback(async (shipmentId) => {
        const confirmDelete = window.confirm(
            t('receiver.delete.permanentConfirm') ||
            'Are you sure? This will permanently remove this shipment from your view (data stays in database).'
        );

        if (!confirmDelete) return;

        try {
            const shipmentDocRef = doc(db, 'shipments', shipmentId);
            await updateDoc(shipmentDocRef, {
                deletedByReceiver: true,
                deletedByReceiverAt: new Date().toISOString()
            });
            console.log("✅ Shipment permanently deleted from receiver view");

        } catch (err) {
            console.error("❌ Error deleting shipment permanently:", err);
            setError(t('error.deleteFailed') || 'Failed to delete shipment');
        }
    }, [t]);

    const handleSaveShipment = useCallback(async (shipment) => {
        if (!shipment || !user) return;
        const docRef = doc(db, 'shipments', shipment.id);
        try {
            await updateDoc(docRef, {
                'receiver.email': user.email,
                'receiver.name': user.displayName || shipment.receiver.name
            });
        } catch (err) {
            setTrackingShipment(prev => ({...prev, modalError: t('error.saveFailed')}));
        }
    }, [user, t]);

    const isShipmentInList = useMemo(() =>
            myShipments.some(s => s.id === trackingShipment?.id),
        [myShipments, trackingShipment]
    );

    const ongoingShipments = useMemo(() =>
            myShipments.filter(s => s.status !== 'Received' && s.status !== 'Completed'),
        [myShipments]
    );

    const completedShipments = useMemo(() =>
            myShipments.filter(s => s.status === 'Received' || s.status === 'Completed'),
        [myShipments]
    );

    const filterShipments = (shipments) => {
        if (!searchTerm) return shipments;
        const term = searchTerm.toLowerCase();
        return shipments.filter(s =>
            s.shipmentId.toLowerCase().includes(term) ||
            s.driver?.name.toLowerCase().includes(term) ||
            s.goods?.name.toLowerCase().includes(term)
        );
    };

    const filteredOngoing = useMemo(() => filterShipments(ongoingShipments), [ongoingShipments, searchTerm]);
    const filteredCompleted = useMemo(() => filterShipments(completedShipments), [completedShipments, searchTerm]);
    const filteredArchived = useMemo(() => filterShipments(archivedShipments), [archivedShipments, searchTerm]);

    const getNavStyle = useCallback((tabName) => {
        return activeTab === tabName
            ? {...styles.navButton, ...styles.navButtonActive}
            : styles.navButton;
    }, [activeTab]);

    const renderShipmentList = (shipments, listType) => (
        <ul style={styles.list}>
            {shipments.map(ship => (
                <li key={ship.id} style={styles.listItem}>
                    <strong>{ship.shipmentId}</strong> - {ship.status}
                    <div style={styles.listItemDetails}>
                        <span>{t('list.driver', { name: ship.driver?.name || 'N/A' })}</span>
                        <span>{t('list.goods', { name: ship.goods?.name || 'N/A' })}</span>
                    </div>
                    <div style={styles.actionButtonGroup}>
                        {listType === 'ongoing' && (
                            <>
                                <button
                                    style={{...styles.actionButton, ...styles.trackButton}}
                                    onClick={() => handleTrackClick(ship)}
                                >
                                    {ship.status === 'In Transit' ? t('btn.track') : (ship.status === 'Delivered' ? t('btn.confirmDelivery') : t('btn.viewDetails'))}
                                </button>
                                <button
                                    style={{...styles.actionButton, ...styles.completeButton}}
                                    onClick={() => handleMarkAsReceived(ship.id)}
                                >
                                    {t('btn.received')}
                                </button>
                                <button
                                    style={{...styles.actionButton, ...styles.deleteButton}}
                                    onClick={() => handleHideShipment(ship.id)}
                                >
                                    {t('btn.hide')}
                                </button>
                            </>
                        )}
                        {listType === 'completed' && (
                            <>
                                <button
                                    style={{...styles.actionButton, ...styles.trackButton}}
                                    onClick={() => handleTrackClick(ship)}
                                >
                                    {t('btn.viewDetails')}
                                </button>
                                <button
                                    style={{...styles.actionButton, ...styles.editButton}}
                                    onClick={() => handleUncompleteShipment(ship.id)}
                                >
                                    {t('btn.notReceived')}
                                </button>
                                <button
                                    style={{...styles.actionButton, ...styles.deleteButton}}
                                    onClick={() => handleHideShipment(ship.id)}
                                >
                                    {t('btn.hide')}
                                </button>
                            </>
                        )}
                        {listType === 'archived' && (
                            <>
                                <button
                                    style={{...styles.actionButton, ...styles.trackButton}}
                                    onClick={() => handleUnhideShipment(ship.id)}
                                >
                                    {t('btn.unhide')}
                                </button>
                                <button
                                    style={{
                                        ...styles.actionButton,
                                        backgroundColor: 'var(--color-error)',
                                        color: 'white'
                                    }}
                                    onClick={() => handleDeletePermanently(ship.id)}
                                >
                                    {t('btn.deletePermanently') || 'Delete Permanently'}
                                </button>
                            </>
                        )}
                    </div>
                </li>
            ))}
        </ul>
    );

    return (
        <div style={{...styles.pageContainer, maxWidth: '1200px', margin: '0 auto'}}>
            <DashboardHeader title={t('receiver.title')} user={user} onLogout={onLogout} onToggleMenu={toggleMenu} />

            <Modal show={!!trackingShipment} onClose={handleCloseModal} title={`${t('btn.viewDetails')}: ${trackingShipment?.shipmentId}`}>
                {trackingShipment && (
                    <div className="modal-content-area">
                        <p>{t('list.status')}: <strong>{trackingShipment.status}</strong></p>

                        {trackingShipment.status === 'In Transit' && (
                            <MapDisplay location={trackingShipment.currentDriverLocation} />
                        )}

                        <h4 style={styles.subCardTitle}>{t('details.receiver')}</h4>
                        <p style={styles.pageText}>{t('list.name')}: {trackingShipment.receiver?.name || 'N/A'}</p>
                        <p style={styles.pageText}>{t('list.address')}: {trackingShipment.receiver?.address || 'N/A'}</p>

                        <h4 style={styles.subCardTitle}>{t('details.driver')}</h4>
                        <p style={styles.pageText}>{t('list.name')}: {trackingShipment.driver?.name || 'N/A'}</p>
                        <p style={styles.pageText}>{t('list.vehicle')}: {trackingShipment.driver?.carPlate || 'N/A'}</p>

                        <h4 style={styles.subCardTitle}>{t('details.goods')}</h4>
                        <p style={styles.pageText}>{t('list.name')}: {trackingShipment.goods?.name || 'N/A'}</p>
                        <p style={styles.pageText}>{t('list.weight')}: {trackingShipment.goods?.weight || 'N/A'} kg</p>

                        {trackingShipment.signature && (
                            <div style={{marginTop: '10px'}}>
                                <h4 style={styles.subCardTitle}>{t('details.signature')}</h4>
                                <img
                                    src={trackingShipment.signature}
                                    alt="Receiver Signature"
                                    style={styles.signatureImage}
                                />
                            </div>
                        )}

                        {trackingShipment.modalError && <p style={styles.errorText}>{trackingShipment.modalError}</p>}

                        {!isShipmentInList &&
                            trackingShipment.status !== 'Received' &&
                            trackingShipment.status !== 'Completed' && (
                                <div style={styles.buttonGroup}>
                                    <button
                                        style={styles.buttonPrimary}
                                        onClick={() => handleSaveShipment(trackingShipment)}
                                        className="buttonPrimary"
                                    >
                                        {t('receiver.modal.save')}
                                    </button>
                                    <button
                                        style={styles.button}
                                        onClick={handleCloseModal}
                                        className="button"
                                    >
                                        {t('receiver.modal.discard')}
                                    </button>
                                </div>
                            )}
                        {trackingShipment.status === 'Delivered' && isShipmentInList && (
                            <button
                                style={{...styles.buttonPrimary, marginTop: '20px'}}
                                onClick={() => handleMarkAsReceived(trackingShipment.id)}
                                className="buttonPrimary"
                            >
                                {t('btn.received')}
                            </button>
                        )}
                        {(trackingShipment.status === 'Received' || trackingShipment.status === 'Completed') && (
                            <p style={{color: 'var(--color-success)', fontWeight: 'bold', marginTop: '20px'}}>{t('receiver.modal.received')}</p>
                        )}
                    </div>
                )}
            </Modal>

            <div style={styles.dashboardLayout} className="dashboard-layout-responsive">

                <nav style={styles.sidebarNav} className={`sidebar-nav-responsive ${isMenuOpen ? 'is-open' : ''}`}>
                    <button style={getNavStyle('manage')} onClick={() => { setActiveTab('manage'); setIsMenuOpen(false); }} className="navButton">{t('receiver.nav.manage') || 'Manage Shipments'}</button>
                    <button style={getNavStyle('recap')} onClick={() => { setActiveTab('recap'); setIsMenuOpen(false); }} className="navButton">{t('receiver.nav.recap')}</button>
                    <button style={getNavStyle('completed')} onClick={() => { setActiveTab('completed'); setIsMenuOpen(false); }} className="navButton">{t('receiver.nav.completed')}</button>
                    <button style={getNavStyle('archived')} onClick={() => { setActiveTab('archived'); setIsMenuOpen(false); }} className="navButton">{t('receiver.nav.archived')}</button>
                    <button style={getNavStyle('profile')} onClick={() => { setActiveTab('profile'); setIsMenuOpen(false); }} className="navButton">{t('profile.title')}</button>

                    <button
                        style={{...styles.navButton, marginTop: '8px', borderTop: `1px solid var(--color-border)`}}
                        onClick={() => { toggleTheme(); setIsMenuOpen(false); }}
                        className="navButton mobile-menu-only-item"
                    >
                        {theme === 'light' ? t('header.theme.dark') : t('header.theme.light')}
                    </button>
                    <button
                        style={styles.navButton}
                        onClick={onLogout}
                        className="navButton mobile-menu-only-item"
                    >
                        {t('btn.logout')}
                    </button>
                </nav>

                <main style={styles.mainContent} className="main-content-area">

                    {/* --- MANAGE SHIPMENTS TAB --- */}
                    {activeTab === 'manage' && (
                        <div key="manage" className="tab-content">
                            <>
                                <div style={{...styles.card, marginBottom: '24px'}}>
                                    <h3 style={styles.cardTitle}>{t('receiver.manual.title')}</h3>
                                    <form onSubmit={handleManualTrack} style={styles.form}>
                                        <div style={styles.inputGroup}>
                                            <label htmlFor="shipmentIdTrack" style={styles.label}>{t('receiver.manual.id')}</label>
                                            <input
                                                id="shipmentIdTrack"
                                                type="text"
                                                placeholder="e.g., LOG-ABC123"
                                                value={manualShipmentId}
                                                onChange={(e) => setManualShipmentId(e.target.value.toUpperCase())}
                                                style={styles.input}
                                            />
                                        </div>
                                        <button type="submit" style={styles.buttonPrimary} className="buttonPrimary">
                                            {t('receiver.manual.btn')}
                                        </button>
                                    </form>
                                    {manualError && <p style={{...styles.errorText, marginTop: '10px'}}>{manualError}</p>}
                                </div>

                                <div style={styles.inputGroup}>
                                    <input
                                        type="text"
                                        placeholder={t('receiver.search')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ ...styles.input, marginBottom: '20px' }}
                                    />
                                </div>

                                <div style={styles.listCard}>
                                    {error && <p style={styles.errorText}>{error}</p>}
                                    {loading && <LoadingSpinner />}
                                    {!loading && (
                                        <>
                                            <h3 style={styles.cardTitle}>{t('receiver.ongoing.title') || 'Ongoing Shipments'}</h3>
                                            {filteredOngoing.length > 0 ?
                                                renderShipmentList(filteredOngoing, 'ongoing') :
                                                <p style={styles.pageText}>{t('receiver.ongoing.empty', { search: searchTerm ? t('receiver.search.clear') : '' })}</p>
                                            }
                                        </>
                                    )}
                                </div>
                            </>
                        </div>
                    )}

                    {/* --- RECAP TAB --- */}
                    {!loading && activeTab === 'recap' && (
                        <div key="recap" className="tab-content">
                            <ReceiverRecapTab
                                ongoing={ongoingShipments}
                                completed={completedShipments}
                                archived={archivedShipments}
                            />
                        </div>
                    )}

                    {/* --- COMPLETED TAB --- */}
                    {activeTab === 'completed' && (
                        <div key="completed" className="tab-content">
                            <>
                                <div style={styles.inputGroup}>
                                    <input
                                        type="text"
                                        placeholder={t('receiver.search')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ ...styles.input, marginBottom: '20px' }}
                                    />
                                </div>

                                <div style={styles.listCard}>
                                    {error && <p style={styles.errorText}>{error}</p>}
                                    {loading && <LoadingSpinner />}
                                    {!loading && (
                                        <>
                                            <h3 style={styles.cardTitle}>{t('receiver.completed.title') || 'Completed Shipments'}</h3>
                                            {filteredCompleted.length > 0 ?
                                                renderShipmentList(filteredCompleted, 'completed') :
                                                <p style={styles.pageText}>{t('receiver.completed.empty', { search: searchTerm ? t('receiver.search.clear') : '' })}</p>
                                            }
                                        </>
                                    )}
                                </div>
                            </>
                        </div>
                    )}

                    {/* --- ARCHIVED TAB --- */}
                    {activeTab === 'archived' && (
                        <div key="archived" className="tab-content">
                            <>
                                <div style={styles.inputGroup}>
                                    <input
                                        type="text"
                                        placeholder={t('receiver.search')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ ...styles.input, marginBottom: '20px' }}
                                    />
                                </div>

                                <div style={styles.listCard}>
                                    {error && <p style={styles.errorText}>{error}</p>}
                                    {loading && <LoadingSpinner />}
                                    {!loading && (
                                        <>
                                            <h3 style={styles.cardTitle}>{t('receiver.archived.title') || 'Archived Shipments'}</h3>
                                            {filteredArchived.length > 0 ?
                                                renderShipmentList(filteredArchived, 'archived') :
                                                <p style={styles.pageText}>{t('receiver.archived.empty', { search: searchTerm ? t('receiver.search.clear') : '' })}</p>
                                            }
                                        </>
                                    )}
                                </div>
                            </>
                        </div>
                    )}

                    {/* --- PROFILE TAB --- */}
                    {!loading && activeTab === 'profile' && (
                        <div key="profile" className="tab-content">
                            <ProfileTab user={user} />
                        </div>
                    )}

                </main>

            </div>

        </div>
    );
};

export default ReceiverDashboard;
