import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import styles from '../styles/styles';
import {
    db,
    doc,
    updateDoc,
    deleteDoc,
    query,
    collection,
    where,
    onSnapshot,
    addDoc
} from '../services/firebase.js';
import { useTranslation } from 'react-i18next';

import DashboardHeader from '../components/DashboardHeader.jsx';
import Modal from '../components/Modal.jsx';
import MapDisplay from '../components/MapDisplay.jsx';

import PrintableShipment from '../features/sender/PrintableShipment.jsx';
import OverviewTab from '../features/sender/OverviewTab.jsx';
import MonthlyRecapTab from '../features/sender/MonthlyRecapTab.jsx';
import AiRecapTab from '../features/sender/AiRecapTab.jsx';
import ShipmentsTab from '../features/sender/ShipmentsTab.jsx';
import ArchivedTab from '../features/sender/ArchivedTab.jsx';
import ProfileTab from '../features/shared/ProfileTab.jsx';

const SenderDashboard = ({ user, onLogout, toggleTheme, theme }) => {
    const { t } = useTranslation();
    const [allShipments, setAllShipments] = useState([]);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [copiedId, setCopiedId] = useState(null);

    // INLINE CONFIRMATION STATES
    const [pendingConfirmation, setPendingConfirmation] = useState({ id: null, action: null });
    const [confirmationTimeoutId, setConfirmationTimeoutId] = useState(null);

    const initialFormData = useMemo(() => ({
        receiverName: '',
        receiverPhone: '',
        receiverEmail: '',
        receiverCompany: '',
        receiverAddress: '',
        driverName: '',
        driverId: '',
        driverEmail: '',
        driverCarPlate: '',
        driverPhone: '',
        driverFee: '',
        goodsName: '',
        goodsType: '',
        goodsWeight: ''
    }), []);

    const [formData, setFormData] = useState(initialFormData);
    const [editingShipmentId, setEditingShipmentId] = useState(null);
    const [trackingShipment, setTrackingShipment] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const printRef = useRef();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [shipmentToPrint, setShipmentToPrint] = useState(null);
    const modalUnsubscribeRef = useRef(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);

    const handleFormChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    useEffect(() => {
        if (user.uid.startsWith('mock-uid-')) return;

        const q = query(collection(db, 'shipments'), where('sender', '==', user.uid));
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const sortedShipments = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                setAllShipments(sortedShipments);
            },
            (err) => {
                console.error("Error listening to shipments: ", err);
                setError(t('error.generic'));
            }
        );

        return () => unsubscribe();
    }, [user.uid, t]);

    const resetForm = useCallback(() => {
        setFormData(initialFormData);
        setEditingShipmentId(null);
    }, [initialFormData]);

    const handleCopyShipmentId = useCallback(async (shipmentId) => {
        try {
            await navigator.clipboard.writeText(shipmentId);
            setCopiedId(shipmentId);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            alert('Failed to copy. Please try again.');
        }
    }, []);

    // CONFIRMATION HANDLERS
    const startConfirmation = (shipmentId, action) => {
        if (confirmationTimeoutId) {
            clearTimeout(confirmationTimeoutId);
        }
        setPendingConfirmation({ id: shipmentId, action });

        const timeoutId = setTimeout(() => {
            setPendingConfirmation({ id: null, action: null });
        }, 5000);
        setConfirmationTimeoutId(timeoutId);
    };

    const handleActionConfirm = () => {
        if (!pendingConfirmation.id || !pendingConfirmation.action) return;

        switch (pendingConfirmation.action) {
            case 'archive': handleArchive(pendingConfirmation.id); break;
            case 'delete': handleConfirmDelete(pendingConfirmation.id); break;
            case 'hide': handleHideShipment(pendingConfirmation.id); break;
        }
        setPendingConfirmation({ id: null, action: null });
        if (confirmationTimeoutId) {
            clearTimeout(confirmationTimeoutId);
            setConfirmationTimeoutId(null);
        }
    };

    const handleCreateOrUpdateShipment = useCallback(async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (user.uid.startsWith('mock-uid-')) {
            resetForm();
            return;
        }

        setIsSubmitting(true);

        try {
            setError('');
            setShowSuccess(false);

            const currentShipment = editingShipmentId
                ? allShipments.find(s => s.id === editingShipmentId)
                : null;

            const hasDriverData = !!(
                formData.driverName?.trim() ||
                formData.driverId?.trim() ||
                formData.driverEmail?.trim() ||
                formData.driverPhone?.trim() ||
                formData.driverCarPlate?.trim() ||
                formData.driverFee
            );

            const shipmentData = {
                sender: user.uid,
                status: editingShipmentId ? (currentShipment?.status || "Pending") : "Pending",
                createdAt: editingShipmentId ? (currentShipment?.createdAt || new Date().toISOString()) : new Date().toISOString(),
                archived: editingShipmentId ? (currentShipment?.archived || false) : false,
                receiver: {
                    name: formData.receiverName || '',
                    phone: formData.receiverPhone || '',
                    email: formData.receiverEmail || '',
                    company: formData.receiverCompany || '',
                    address: formData.receiverAddress || ''
                },
                goods: {
                    name: formData.goodsName || '',
                    type: formData.goodsType || '',
                    weight: formData.goodsWeight || ''
                },
                currentDriverLocation: editingShipmentId ? (currentShipment?.currentDriverLocation || null) : null,
                signature: editingShipmentId ? (currentShipment?.signature || null) : null
            };

            if (hasDriverData) {
                shipmentData.driver = {
                    name: formData.driverName || '',
                    id: formData.driverId || '',
                    email: formData.driverEmail || '',
                    carPlate: formData.driverCarPlate || '',
                    phone: formData.driverPhone || '',
                    fee: formData.driverFee || ''
                };
            } else if (editingShipmentId && currentShipment?.driver) {
                shipmentData.driver = currentShipment.driver;
            }

            if (editingShipmentId) {
                const shipmentDocRef = doc(db, 'shipments', editingShipmentId);
                await updateDoc(shipmentDocRef, shipmentData);
            } else {
                const shipmentId = 'LOG-' + Math.random().toString(36).substr(2, 6).toUpperCase();
                await addDoc(collection(db, 'shipments'), {
                    ...shipmentData,
                    shipmentId: shipmentId
                });
            }

            resetForm();
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error("❌ Error creating/updating shipment:", error);
            setError(t('error.saveFailed') + ": " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, editingShipmentId, user.uid, resetForm, allShipments, isSubmitting, t]);

    const handleEditClick = useCallback((shipment) => {
        setFormData({
            receiverName: shipment.receiver?.name || '',
            receiverPhone: shipment.receiver?.phone || '',
            receiverEmail: shipment.receiver?.email || '',
            receiverCompany: shipment.receiver?.company || '',
            receiverAddress: shipment.receiver?.address || '',
            driverName: shipment.driver?.name || '',
            driverId: shipment.driver?.id || '',
            driverEmail: shipment.driver?.email || '',
            driverCarPlate: shipment.driver?.carPlate || '',
            driverPhone: shipment.driver?.phone || '',
            driverFee: shipment.driver?.fee || '',
            goodsName: shipment.goods?.name || '',
            goodsType: shipment.goods?.type || '',
            goodsWeight: shipment.goods?.weight || ''
        });
        setEditingShipmentId(shipment.id);
        setError('');
        setShowSuccess(false);
        setActiveTab('overview');
    }, []);

    const handleArchive = useCallback(async (shipmentId) => {
        try {
            const shipmentDocRef = doc(db, 'shipments', shipmentId);
            await updateDoc(shipmentDocRef, { archived: true });
        } catch (error) {
            setError(t('error.hideFailed'));
        }
    }, [t]);

    const handleUnarchive = useCallback(async (shipmentId) => {
        try {
            const shipmentDocRef = doc(db, 'shipments', shipmentId);
            await updateDoc(shipmentDocRef, { archived: false });
        } catch (error) {
            setError(t('error.unhideFailed'));
        }
    }, [t]);

    const handleConfirmDelete = useCallback(async (shipmentId) => {
        try {
            const shipmentDocRef = doc(db, 'shipments', shipmentId);
            await deleteDoc(shipmentDocRef);
        } catch (error) {
            setError(t('error.deleteFailed'));
        }
    }, [t]);

    const handleHideShipment = useCallback(async (shipmentId) => {
        try {
            const shipmentDocRef = doc(db, 'shipments', shipmentId);
            await updateDoc(shipmentDocRef, { archived: true });
        } catch (error) {
            setError(t('error.hideFailed'));
        }
    }, [t]);

    const handleCompleteClick = useCallback(async (shipmentId) => {
        try {
            const shipmentDocRef = doc(db, 'shipments', shipmentId);
            await updateDoc(shipmentDocRef, { status: 'Completed', currentDriverLocation: null });
        } catch (error) {
            setError(t('error.updateFailed'));
        }
    }, [t]);

    const handleTrackClick = useCallback((shipment) => {
        if (modalUnsubscribeRef.current) {
            modalUnsubscribeRef.current();
        }
        setTrackingShipment(shipment);
        const unsub = onSnapshot(
            doc(db, 'shipments', shipment.id),
            (docSnap) => {
                if (docSnap.exists()) {
                    setTrackingShipment({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setTrackingShipment(null);
                }
            }
        );
        modalUnsubscribeRef.current = unsub;
    }, []);

    const handleCloseModal = () => {
        if (modalUnsubscribeRef.current) {
            modalUnsubscribeRef.current();
            modalUnsubscribeRef.current = null;
        }
        setTrackingShipment(null);
    };

    const handlePrintShipment = useCallback((shipment) => {
        setShipmentToPrint(shipment);
    }, []);

    const handlePrintComplete = useCallback(() => {
        setShipmentToPrint(null);
    }, []);

    useEffect(() => {
        if (shipmentToPrint && printRef.current) {
            const timer = setTimeout(() => {
                window.print();
                handlePrintComplete();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [shipmentToPrint, handlePrintComplete]);

    const getNavStyle = useCallback((tabName) => {
        return activeTab === tabName
            ? { ...styles.navButton, ...styles.navButtonActive }
            : styles.navButton;
    }, [activeTab]);

    const activeShipments = useMemo(() => allShipments.filter(s => !s.archived), [allShipments]);

    const archivedShipments = useMemo(() => allShipments.filter(s => s.archived), [allShipments]);

    return (
        <div style={{ ...styles.pageContainer, maxWidth: '1200px', margin: '0 auto' }}>
            <DashboardHeader
                title={t('sender.title')}
                user={user}
                onLogout={onLogout}
                onToggleMenu={toggleMenu}
            />

            <Modal
                show={!!trackingShipment}
                onClose={handleCloseModal}
                title={`${t('btn.viewDetails')}: ${trackingShipment?.shipmentId}`}
            >
                {trackingShipment && (
                    <div>
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
                            <div style={{ marginTop: '10px' }}>
                                <h4 style={styles.subCardTitle}>{t('details.signature')}</h4>
                                <img
                                    src={trackingShipment.signature}
                                    alt="Receiver Signature"
                                    style={styles.signatureImage}
                                />
                            </div>
                        )}

                        {(trackingShipment.status === 'Received' || trackingShipment.status === 'Completed') && (
                            <p style={{ color: 'var(--color-success)', fontWeight: 'bold', marginTop: '20px' }}>
                                {t('receiver.modal.received')}
                            </p>
                        )}
                    </div>
                )}
            </Modal>

            <div id="print-area" style={styles.printArea}>
                <PrintableShipment
                    ref={printRef}
                    shipment={shipmentToPrint}
                    onPrintComplete={handlePrintComplete}
                />
            </div>

            <div style={styles.dashboardLayout} className="dashboard-layout-responsive">
                <nav style={styles.sidebarNav} className={`sidebar-nav-responsive ${isMenuOpen ? 'is-open' : ''}`}>
                    <button style={getNavStyle('overview')} onClick={() => { setActiveTab('overview'); setIsMenuOpen(false); }} className="navButton">
                        {t('sender.nav.create')}
                    </button>
                    <button style={getNavStyle('shipments')} onClick={() => { setActiveTab('shipments'); setIsMenuOpen(false); }} className="navButton">
                        {t('sender.nav.manage')}
                    </button>
                    <button style={getNavStyle('recap')} onClick={() => { setActiveTab('recap'); setIsMenuOpen(false); }} className="navButton">
                        {t('sender.nav.recap')}
                    </button>
                    <button style={getNavStyle('ai')} onClick={() => { setActiveTab('ai'); setIsMenuOpen(false); }} className="navButton">
                        {t('sender.nav.ai')}
                    </button>
                    <button style={getNavStyle('archived')} onClick={() => { setActiveTab('archived'); setIsMenuOpen(false); }} className="navButton">
                        {t('sender.nav.archived')}
                    </button>
                    <button style={getNavStyle('profile')} onClick={() => { setActiveTab('profile'); setIsMenuOpen(false); }} className="navButton">
                        {t('profile.title')}
                    </button>

                    <button
                        style={{ ...styles.navButton, marginTop: '8px', borderTop: `1px solid var(--color-border)` }}
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
                    {activeTab === 'overview' && (
                        <div key="overview" className="tab-content">
                            <OverviewTab
                                error={error}
                                setError={setError}
                                formData={formData}
                                handleFormChange={handleFormChange}
                                editingShipmentId={editingShipmentId}
                                handleCreateOrUpdateShipment={handleCreateOrUpdateShipment}
                                resetForm={resetForm}
                                showSuccess={showSuccess}
                                isSubmitting={isSubmitting}
                            />
                        </div>
                    )}

                    {activeTab === 'shipments' && (
                        <div key="shipments" className="tab-content">
                            {activeShipments.length === 0 ? (
                                <p>{t('sender.manage.empty')}</p>
                            ) : (
                                <ShipmentsTab
                                    shipments={activeShipments}
                                    handleTrackClick={handleTrackClick}
                                    handleEditClick={handleEditClick}
                                    handlePrintShipment={handlePrintShipment}
                                    handleCompleteClick={handleCompleteClick}
                                    onArchive={handleArchive}
                                    handleCopyShipmentId={handleCopyShipmentId}
                                    copiedId={copiedId}
                                    pendingConfirmation={pendingConfirmation}
                                    startConfirmation={startConfirmation}
                                    handleActionConfirm={handleActionConfirm}
                                    handleConfirmDelete={handleConfirmDelete}
                                    handleHideShipment={handleHideShipment}
                                />
                            )}
                        </div>
                    )}

                    {activeTab === 'recap' && (
                        <div key="recap" className="tab-content">
                            <MonthlyRecapTab
                                shipments={activeShipments}
                                archivedShipments={archivedShipments}
                            />
                        </div>
                    )}

                    {activeTab === 'ai' && (
                        <div key="ai" className="tab-content">
                            <AiRecapTab shipments={activeShipments} />
                        </div>
                    )}

                    {activeTab === 'archived' && (
                        <div key="archived" className="tab-content">
                            <ArchivedTab
                                shipments={archivedShipments}
                                onUnarchive={handleUnarchive}
                                onDelete={handleConfirmDelete} // you can still keep this for initial call but should go through confirmation
                                pendingConfirmation={pendingConfirmation}
                                startConfirmation={startConfirmation}
                                handleActionConfirm={handleActionConfirm}
                            />
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div key="profile" className="tab-content">
                            <ProfileTab user={user} />
                        </div>
                    )}
                </main>

            </div>
        </div>
    );
};

export default SenderDashboard;
