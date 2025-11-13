import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import styles from '../styles/styles';
import {
    db,
    doc,
    updateDoc,
    query,
    collection,
    where,
    getDocs,
    onSnapshot
} from '../services/firebase';
import { useTranslation } from 'react-i18next';



// Import Components
import DashboardHeader from '../components/DashboardHeader.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import Modal from '../components/Modal.jsx';
import SignatureCanvas from 'react-signature-canvas';
import ProfileTab from '../features/shared/ProfileTab.jsx';
import RevenueTab from '../features/driver/RevenueTab.jsx';

const DriverDashboard = ({ user, onLogout, toggleTheme, theme }) => {
    const { t } = useTranslation();
    const [allJobs, setAllJobs] = useState([]);
    const [activeJob, setActiveJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('pending');

    const [manualShipmentId, setManualShipmentId] = useState('');
    const [manualError, setManualError] = useState('');

    const [searchOngoing, setSearchOngoing] = useState('');
    const [searchCompleted, setSearchCompleted] = useState('');

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);

    // Modal States
    const sigPadRef = useRef(null);
    const invoicePrintRef = useRef(null);
    const [invoiceToPrint, setInvoiceToPrint] = useState(null);
    const [signingShipment, setSigningShipment] = useState(null);
    const [sigError, setSigError] = useState('');
    const [claimableShipment, setClaimableShipment] = useState(null);
    const [isSavingSig, setIsSavingSig] = useState(false);

    useEffect(() => {
        if (!user?.email) {
            setLoading(false);
            return;
        }

        setLoading(true);

        const assignedQuery = query(
            collection(db, 'shipments'),
            where('driver.email', '==', user.email)
        );

        const pendingQuery = query(
            collection(db, 'shipments'),
            where('status', '==', 'Pending')
        );

        const unsubscribeAssigned = onSnapshot(assignedQuery, (snapshot) => {
            const assignedJobs = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }));

            getDocs(pendingQuery).then(pendingSnapshot => {
                const pendingJobs = pendingSnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(job => (!job.driver || !job.driver.email) && !job.archivedByDriver);

                const combinedJobs = [...assignedJobs];
                pendingJobs.forEach(pJob => {
                    if (!combinedJobs.find(j => j.id === pJob.id)) {
                        combinedJobs.push(pJob);
                    }
                });

                const sortedJobs = combinedJobs.sort((a, b) =>
                    new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
                );

                setAllJobs(sortedJobs);

                const currentlyActiveJob = sortedJobs.find(
                    job => job.status === 'In Transit' && job.driver?.email === user.email
                );
                setActiveJob(currentlyActiveJob || null);

                setLoading(false);
            }).catch(err => {

                setError(t('error.generic'));
                setLoading(false);
            });
        }, (err) => {
            setError(t('error.generic'));
            setLoading(false);
        });

        return () => unsubscribeAssigned();
    }, [user, t]);

    useEffect(() => {
        if (!activeJob) return;
        let watchId = null;

        const updateLocationInFirestore = async (pos) => {
            const newLocation = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                timestamp: new Date().toISOString()
            };
            const shipmentDocRef = doc(db, 'shipments', activeJob.id);
            try {
                await updateDoc(shipmentDocRef, { currentDriverLocation: newLocation });
            } catch (updateError) {

                setError(t('error.updateFailed'));
            }
        };

        const startWatching = () => {
            const fakePosition = { coords: { latitude: 36.705667, longitude: 67.182963 } };
            navigator.geolocation.getCurrentPosition(
                updateLocationInFirestore,
                (err) => {
                    setError(t('error.location'));
                    console.warn();
                    updateLocationInFirestore(fakePosition);
                }
            );
            watchId = navigator.geolocation.watchPosition(
                updateLocationInFirestore,
                (err) => {
                    console.error("Error watching location: ", err.message);
                    setError(t('error.location'));
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
            );
        };

        startWatching();
        return () => { if (watchId) navigator.geolocation.clearWatch(watchId); };
    }, [activeJob, t]);

    const updateShipmentStatus = async (shipmentId, status, newLocation = undefined, signature = undefined) => {
        const shipmentDocRef = doc(db, 'shipments', shipmentId);
        let updates = { status };

        if (newLocation !== undefined) {
            updates.currentDriverLocation = newLocation;
        }
        if (signature !== undefined) {
            updates.signature = signature;
            updates.deliveredAt = new Date().toISOString();
        }


        await updateDoc(shipmentDocRef, updates);

    };

    const startDriving = useCallback(async (shipment) => {
        if (activeJob) {
            alert("You are already tracking another job. Please deliver it first.");
            throw new Error("Already have active job");
        }



        setActiveJob({
            ...shipment,
            status: 'In Transit',
            driver: {
                email: user.email,
                name: user.displayName || user.email
            }
        });

        const shipmentDocRef = doc(db, 'shipments', shipment.id);
        try {
            await updateDoc(shipmentDocRef, {
                status: 'In Transit',
                'driver.email': user.email,
                'driver.name': user.displayName || user.email,
                claimedAt: new Date().toISOString()
            });


        } catch (err) {

            setError(t('error.saveFailed'));
            setActiveJob(null);
            throw err;
        }
    }, [activeJob, user, t]);

    const handleClaimJob = useCallback(async () => {
        if (!claimableShipment) return;

        const shipmentToClaim = claimableShipment;

        setClaimableShipment(null);

        try {
            await startDriving(shipmentToClaim);
        } catch (err) {
            setClaimableShipment(shipmentToClaim);
        }
    }, [claimableShipment, startDriving]);

    const handleMarkAsDelivered = (job) => {
        setSigError('');
        setSigningShipment(job);
    };

    const handleSignatureSave = async () => {
        setSigError('');

        if (!sigPadRef.current || sigPadRef.current.isEmpty()) {
            setSigError(t('driver.signature.error'));
            return;
        }

        setIsSavingSig(true);
        const signatureDataUrl = sigPadRef.current.toDataURL('image/png');

        try {

            await updateShipmentStatus(
                signingShipment.id,
                'Delivered',
                null,
                signatureDataUrl
            );


            setActiveJob(null);

            setSigningShipment(null);
            if (sigPadRef.current) {
                sigPadRef.current.clear();
            }

            alert(t('driver.signature.success') || 'Delivery confirmed successfully!');

        } catch (err) {
            setSigError(`${t('error.saveFailed')}: ${err.message}`);
        } finally {
            setIsSavingSig(false);
        }
    };

    const handleFindShipment = async (e) => {
        e.preventDefault();
        setManualError('');

        const q = query(
            collection(db, 'shipments'),
            where('shipmentId', '==', manualShipmentId.toUpperCase())
        );

        try {
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setManualError(t('error.notFound'));
                return;
            }

            const job = {
                id: querySnapshot.docs[0].id,
                ...querySnapshot.docs[0].data()
            };


            const existingJob = allJobs.find(j => j.id === job.id);
            if (existingJob) {
                setManualShipmentId('');
                setActiveTab(
                    existingJob.status === 'Delivered' || existingJob.status === 'Completed' || existingJob.status === 'Received'
                        ? 'completed'
                        : 'pending'
                );
                return;
            }

            if (job.driver?.email === user.email) {
                setAllJobs(prevJobs => [job, ...prevJobs]);
                setManualShipmentId('');
                setActiveTab(
                    job.status === 'Delivered' || job.status === 'Completed' || job.status === 'Received'
                        ? 'completed'
                        : 'pending'
                );
                return;
            }

            if (job.status === 'Pending' && (!job.driver || !job.driver.email || job.driver.email === '')) {
                setClaimableShipment(job);
                setManualShipmentId('');
                return;
            }

            if (job.status === 'Pending') {
                setClaimableShipment(job);
                setManualShipmentId('');
                return;
            }

            setManualError(t('driver.manual.error.taken') || `This shipment is ${job.status}. You cannot claim it.`);

        } catch (err) {
            console.error("Error finding shipment:", err);
            setManualError(t('error.generic'));
        }
    };

    const handleArchiveShipment = useCallback(async (shipmentId) => {
        try {
            const shipmentDocRef = doc(db, 'shipments', shipmentId);
            await updateDoc(shipmentDocRef, {
                archivedByDriver: true,
                archivedByDriverAt: new Date().toISOString()
            });

        } catch (err) {
            console.error("❌ Error archiving shipment:", err);
            setError(t('error.archiveFailed') || 'Failed to hide shipment');
        }
    }, [t]);

    //  UNARCHIVE HANDLER
    const handleUnarchiveShipment = useCallback(async (shipmentId) => {
        try {
            const shipmentDocRef = doc(db, 'shipments', shipmentId);
            await updateDoc(shipmentDocRef, {
                archivedByDriver: false,
                unarchivedByDriverAt: new Date().toISOString()
            });

        } catch (err) {
            console.error("❌ Error unarchiving shipment:", err);
            setError(t('error.unarchiveFailed') || 'Failed to unhide shipment');
        }
    }, [t]);

    const handleDeletePermanently = useCallback(async (shipmentId) => {
        const confirmDelete = window.confirm(
            t('driver.delete.permanentConfirm') ||
            'Are you sure? This will permanently remove this shipment from your view (data stays in database).'
        );

        if (!confirmDelete) return;

        try {
            const shipmentDocRef = doc(db, 'shipments', shipmentId);
            await updateDoc(shipmentDocRef, {
                deletedByDriver: true,
                deletedByDriverAt: new Date().toISOString()
            });

        } catch (err) {

            setError(t('error.deleteFailed') || 'Failed to delete shipment');
        }
    }, [t]);

    const handleMarkAsPaid = useCallback(async (shipmentId) => {
        const confirmPaid = window.confirm(
            t('driver.payment.confirmPaid') ||
            'Mark this shipment as paid? This will update your revenue statistics.'
        );

        if (!confirmPaid) return;

        try {
            const shipmentDocRef = doc(db, 'shipments', shipmentId);
            await updateDoc(shipmentDocRef, {
                paymentStatus: 'paid',
                paidAt: new Date().toISOString()
            });

        } catch (err) {
            console.error("❌ Error marking shipment as paid:", err);
            setError(t('error.paymentFailed') || 'Failed to update payment status');
        }
    }, [t]);

    const handlePrintInvoice = useCallback((job) => {
        setInvoiceToPrint(job);

        const cleanup = () => {
            setInvoiceToPrint(null);
            window.removeEventListener("afterprint", cleanup);
        };

        window.addEventListener("afterprint", cleanup);

        setTimeout(() => {
            window.print();
        }, 100);
    }, []);


    const pendingJobs = useMemo(() =>
            allJobs.filter(s =>
                !s.archivedByDriver &&
                !s.deletedByDriver &&
                s.status !== 'Delivered' &&
                s.status !== 'Completed' &&
                s.status !== 'Received'
            ),
        [allJobs]
    );

    const completedJobs = useMemo(() =>
            allJobs.filter(s =>
                !s.archivedByDriver &&
                !s.deletedByDriver &&
                (s.status === 'Delivered' ||
                    s.status === 'Completed' ||
                    s.status === 'Received')
            ),
        [allJobs]
    );

    const archivedJobs = useMemo(() =>
            allJobs.filter(s => s.archivedByDriver && !s.deletedByDriver),
        [allJobs]
    );

    const filteredOngoingJobs = useMemo(() => {
        if (!searchOngoing.trim()) return pendingJobs;

        const searchLower = searchOngoing.toLowerCase();
        return pendingJobs.filter(job =>
            job.shipmentId?.toLowerCase().includes(searchLower) ||
            job.receiver?.name?.toLowerCase().includes(searchLower) ||
            job.receiver?.address?.toLowerCase().includes(searchLower) ||
            job.goods?.name?.toLowerCase().includes(searchLower)
        );
    }, [pendingJobs, searchOngoing]);

    const filteredCompletedJobs = useMemo(() => {
        if (!searchCompleted.trim()) return completedJobs;

        const searchLower = searchCompleted.toLowerCase();
        return completedJobs.filter(job =>
            job.shipmentId?.toLowerCase().includes(searchLower) ||
            job.receiver?.name?.toLowerCase().includes(searchLower) ||
            job.receiver?.address?.toLowerCase().includes(searchLower) ||
            job.goods?.name?.toLowerCase().includes(searchLower)
        );
    }, [completedJobs, searchCompleted]);

    const getNavStyle = useCallback((tabName) => {
        return activeTab === tabName
            ? {...styles.navButton, ...styles.navButtonActive}
            : styles.navButton;
    }, [activeTab]);

    return (
        <div style={{...styles.pageContainer, maxWidth: '1200px', margin: '0 auto'}}>
            <DashboardHeader
                title={t('driver.title')}
                user={user}
                onLogout={onLogout}
                onToggleMenu={toggleMenu}
            />

            <Modal
                show={!!claimableShipment}
                onClose={() => setClaimableShipment(null)}
                title={t('driver.manual.claimTitle')}
            >
                {claimableShipment && (
                    <div className="modal-content-area">
                        <p style={styles.pageText}>{t('driver.manual.claimDesc')}</p>
                        <h4 style={styles.subCardTitle}>{t('details.goods')}</h4>
                        <p style={styles.pageText}>
                            {t('list.name')}: {claimableShipment.goods?.name || 'N/A'}
                        </p>
                        <p style={styles.pageText}>
                            {t('list.address')}: {claimableShipment.receiver?.address || 'N/A'}
                        </p>
                        <div style={styles.buttonGroup}>
                            <button
                                style={styles.button}
                                className="button"
                                onClick={() => setClaimableShipment(null)}
                            >
                                {t('receiver.modal.discard')}
                            </button>
                            <button
                                style={styles.buttonPrimary}
                                className="buttonPrimary"
                                onClick={handleClaimJob}
                            >
                                {t('driver.manual.claimBtn')}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                show={!!signingShipment}
                onClose={isSavingSig ? () => {} : () => setSigningShipment(null)}
                title={t('driver.signature.title')}
            >
                {signingShipment && (
                    <div className="modal-content-area">
                        {signingShipment.signature ? (
                            <div>
                                <p style={styles.pageText}>
                                    {t('list.status')}: <strong>{signingShipment.status}</strong>
                                </p>
                                <img
                                    src={signingShipment.signature}
                                    alt="Receiver Signature"
                                    style={styles.signatureImage}
                                />
                                <div style={styles.buttonGroup}>
                                    <button
                                        style={{...styles.button, marginTop: '10px'}}
                                        className="button"
                                        onClick={() => setSigningShipment(null)}
                                    >
                                        {t('btn.close')}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p style={styles.pageText}>{t('driver.signature.desc')}</p>
                                <p style={styles.pageText}>
                                    <strong>{t('sender.form.goodsName')}:</strong> {signingShipment.goods?.name || 'N/A'}
                                </p>
                                <SignatureCanvas
                                    ref={sigPadRef}
                                    penColor='black'
                                    canvasProps={{ style: styles.signaturePad }}
                                />
                                {sigError && <p style={styles.errorText}>{sigError}</p>}
                                <div style={styles.buttonGroup}>
                                    <button
                                        style={styles.button}
                                        className="button"
                                        onClick={() => sigPadRef.current.clear()}
                                        disabled={isSavingSig}
                                    >
                                        {t('driver.signature.clear')}
                                    </button>
                                    <button
                                        style={styles.buttonPrimary}
                                        className="buttonPrimary"
                                        onClick={handleSignatureSave}
                                        disabled={isSavingSig}
                                    >
                                        {isSavingSig ? t('btn.saving') : t('driver.signature.confirm')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {invoiceToPrint && (
                <>
                    <style>{`
                        @media print {
                            body * { visibility: hidden; }
                            .invoice-print-area, .invoice-print-area * { visibility: visible; }
                            .invoice-print-area { position: absolute; left: 0; top: 0; width: 100%; }
                        }
                        @media screen {
                            .invoice-print-area { display: none; }
                        }
                    `}</style>
                    <div ref={invoicePrintRef} className="invoice-print-area" style={{ padding: '0px', backgroundColor: 'white' }}>
                        <style>{`
                        @media print {
                            body * {
                                visibility: hidden;
                            }
                            .invoice-print-area, .invoice-print-area * {
                                visibility: visible;
                            }
                            .invoice-print-area {
                                position: absolute;
                                left: 0;
                                top: 0;
                                width: 100%;
                            }
                        }
                        @media screen {
                            .invoice-print-area {
                                display: none;
                            }
                        }
                    `}</style>
                        <div ref={invoicePrintRef} className="invoice-print-area" style={{
                            padding: '0px',
                            backgroundColor: 'white'
                        }}>
                            <div style={{maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif', color: '#000'}}>
                                <div style={{textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #333', paddingBottom: '20px'}}>
                                    <h1 style={{margin: '0 0 10px 0', fontSize: '32px'}}>DELIVERY INVOICE</h1>
                                    <p style={{margin: 0, fontSize: '14px', color: '#666'}}>Payment Receipt for Delivery Services</p>
                                </div>

                                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '30px'}}>
                                    <div>
                                        <h3 style={{margin: '0 0 10px 0', fontSize: '16px'}}>Driver Information:</h3>
                                        <p style={{margin: '5px 0', fontSize: '14px'}}><strong>Name:</strong> {invoiceToPrint.driver?.name || 'N/A'}</p>
                                        <p style={{margin: '5px 0', fontSize: '14px'}}><strong>Email:</strong> {invoiceToPrint.driver?.email || 'N/A'}</p>
                                        <p style={{margin: '5px 0', fontSize: '14px'}}><strong>Phone:</strong> {invoiceToPrint.driver?.phone || 'N/A'}</p>
                                        <p style={{margin: '5px 0', fontSize: '14px'}}><strong>Vehicle:</strong> {invoiceToPrint.driver?.carPlate || 'N/A'}</p>
                                    </div>
                                    <div style={{textAlign: 'right'}}>
                                        <h3 style={{margin: '0 0 10px 0', fontSize: '16px'}}>Invoice Details:</h3>
                                        <p style={{margin: '5px 0', fontSize: '14px'}}><strong>Invoice #:</strong> {invoiceToPrint.shipmentId}</p>
                                        <p style={{margin: '5px 0', fontSize: '14px'}}><strong>Date:</strong> {invoiceToPrint.deliveredAt ? new Date(invoiceToPrint.deliveredAt).toLocaleDateString() : 'N/A'}</p>
                                        <p style={{margin: '5px 0', fontSize: '14px'}}><strong>Status:</strong> {invoiceToPrint.status}</p>
                                    </div>
                                </div>

                                <div style={{marginBottom: '30px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px'}}>
                                    <h3 style={{margin: '0 0 15px 0', fontSize: '16px'}}>Receiver Information:</h3>
                                    <p style={{margin: '5px 0', fontSize: '14px'}}><strong>Name:</strong> {invoiceToPrint.receiver?.name || 'N/A'}</p>
                                    <p style={{margin: '5px 0', fontSize: '14px'}}><strong>Address:</strong> {invoiceToPrint.receiver?.address || 'N/A'}</p>
                                    <p style={{margin: '5px 0', fontSize: '14px'}}><strong>Phone:</strong> {invoiceToPrint.receiver?.phone || 'N/A'}</p>
                                </div>

                                <div style={{marginBottom: '30px'}}>
                                    <h3 style={{margin: '0 0 15px 0', fontSize: '16px'}}>Goods Delivered:</h3>
                                    <table style={{width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd'}}>
                                        <thead>
                                        <tr style={{backgroundColor: '#f5f5f5'}}>
                                            <th style={{padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', fontSize: '14px'}}>Item Description</th>
                                            <th style={{padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', fontSize: '14px'}}>Type</th>
                                            <th style={{padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd', fontSize: '14px'}}>Weight</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr>
                                            <td style={{padding: '12px', borderBottom: '1px solid #ddd', fontSize: '14px'}}>{invoiceToPrint.goods?.name || 'N/A'}</td>
                                            <td style={{padding: '12px', borderBottom: '1px solid #ddd', fontSize: '14px'}}>{invoiceToPrint.goods?.type || 'N/A'}</td>
                                            <td style={{padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd', fontSize: '14px'}}>{invoiceToPrint.goods?.weight || 'N/A'} kg</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div style={{marginTop: '40px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '2px solid #333'}}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                        <h2 style={{margin: 0, fontSize: '24px'}}>TOTAL AMOUNT DUE:</h2>
                                        <h2 style={{margin: 0, fontSize: '32px', color: '#21808D'}}>${parseFloat(invoiceToPrint.driver?.fee || 0).toFixed(2)}</h2>
                                    </div>
                                </div>

                                {invoiceToPrint.signature && (
                                    <div style={{marginTop: '40px', paddingTop: '20px'}}>
                                        <h3 style={{margin: '0 0 15px 0', fontSize: '16px', float: 'left', width: '60%'}}>Receiver Signature:</h3>
                                        <h3 style={{margin: '0 0 15px 0', fontSize: '16px', paddingLeft: '10px'}}>Confirm Signature:</h3>
                                        <img src={invoiceToPrint.signature} alt="Receiver Signature" style={{maxWidth: '50%', border: '1px solid #ddd', padding: '10px', backgroundColor: 'white', position: 'absolute', left: '0', height: '90px'}} />
                                        <div style={{width: '50%', border: '1px solid #ddd', padding: '10px', backgroundColor: 'white', position: 'absolute', right: '0', height: '90px' }}></div>


                                    </div>

                                )}

                                <div style={{marginTop: '50px', paddingTop: '20px', textAlign: 'left', position: 'absolute', bottom: '40px', width: '90%'}}>
                                    <p style={{margin: '5px 0', fontSize: '11px', color: '#999'}}> Please sign to to confirm payment of {invoiceToPrint.driver.fee}$ to {invoiceToPrint.driver?.name || 'N/A'} signed date: {invoiceToPrint.deliveredAt ? new Date(invoiceToPrint.deliveredAt).toLocaleString() : 'N/A'}.</p>
                                </div>



                            </div>
                        </div>

                    </div>
                </>
            )}

            <div style={styles.dashboardLayout} className="dashboard-layout-responsive">
                <nav style={styles.sidebarNav} className={`sidebar-nav-responsive ${isMenuOpen ? 'is-open' : ''}`}>
                    <button style={getNavStyle('pending')} onClick={() => { setActiveTab('pending'); setIsMenuOpen(false); }} className="navButton">
                        {t('driver.nav.pending')}
                    </button>
                    <button style={getNavStyle('completed')} onClick={() => { setActiveTab('completed'); setIsMenuOpen(false); }} className="navButton">
                        {t('driver.nav.completed')}
                    </button>
                    <button style={getNavStyle('archived')} onClick={() => { setActiveTab('archived'); setIsMenuOpen(false); }} className="navButton">
                        {t('driver.nav.archived') || 'Archived'}
                    </button>
                    <button style={getNavStyle('revenue')} onClick={() => { setActiveTab('revenue'); setIsMenuOpen(false); }} className="navButton">
                        {t('driver.nav.revenue') || 'Revenue'}
                    </button>
                    <button style={getNavStyle('profile')} onClick={() => { setActiveTab('profile'); setIsMenuOpen(false); }} className="navButton">
                        {t('profile.title')}
                    </button>

                    <button
                        style={{...styles.navButton, marginTop: '8px', borderTop: `1px solid var(--color-border)`}}
                        onClick={() => { toggleTheme(); setIsMenuOpen(false); }}
                        className="navButton mobile-menu-only-item"
                    >
                        {theme === 'light' ? t('header.theme.dark') : t('header.theme.light')}
                    </button>
                    <button style={styles.navButton} onClick={onLogout} className="navButton mobile-menu-only-item">
                        {t('btn.logout')}
                    </button>
                </nav>

                <main style={styles.mainContent} className="main-content-area">

                    {activeTab === 'pending' && (
                        <div key="pending" className="tab-content">
                            <>
                                <div style={{...styles.card, marginBottom: '24px'}}>
                                    <h3 style={styles.cardTitle}>{t('driver.manual.title')}</h3>
                                    <form onSubmit={handleFindShipment} style={styles.form}>
                                        <div style={styles.inputGroup}>
                                            <label htmlFor="shipmentId" style={styles.label}>
                                                {t('driver.manual.id')}
                                            </label>
                                            <input
                                                id="shipmentId"
                                                type="text"
                                                placeholder="e.g., LOG-ABC123"
                                                value={manualShipmentId}
                                                onChange={(e) => setManualShipmentId(e.target.value.toUpperCase())}
                                                style={styles.input}
                                            />
                                        </div>
                                        <button type="submit" style={styles.buttonPrimary} className="buttonPrimary">
                                            {t('driver.manual.btn')}
                                        </button>
                                        {manualError && <p style={styles.errorText}>{manualError}</p>}
                                    </form>
                                </div>

                                <div style={styles.listCard}>
                                    {error && <p style={styles.errorText}>{error}</p>}
                                    {loading && <LoadingSpinner />}
                                    {!loading && (
                                        <>
                                            <h3 style={styles.cardTitle}>
                                                {t('driver.pending.title', { count: filteredOngoingJobs.length })}
                                            </h3>

                                            <div style={{ marginBottom: '20px' }}>
                                                <input
                                                    type="text"
                                                    placeholder={t('driver.search.placeholder') || 'Search by ID, receiver, address, or goods...'}
                                                    value={searchOngoing}
                                                    onChange={(e) => setSearchOngoing(e.target.value)}
                                                    style={{
                                                        ...styles.input,
                                                        width: '100%',
                                                        padding: '12px',
                                                        fontSize: '14px'
                                                    }}
                                                />
                                            </div>

                                            {filteredOngoingJobs.length === 0 && (
                                                <p style={styles.pageText}>
                                                    {searchOngoing.trim() ? t('driver.search.noResults') || 'No matching shipments found' : t('driver.pending.empty')}
                                                </p>
                                            )}
                                            <ul style={styles.list}>
                                                {filteredOngoingJobs.map(job => (
                                                    <li key={job.id} style={styles.listItem}>
                                                        <strong>{job.shipmentId}</strong> - {job.status}
                                                        <div style={styles.listItemDetails}>
                                                            <span>{t('list.to', { name: job.receiver?.name || 'N/A' })}</span>
                                                            <span>{t('list.goods', { name: job.goods?.name || 'N/A' })}</span>
                                                        </div>
                                                        <p style={{ ...styles.pageText, fontSize: '0.9rem', margin: '4px 0' }}>
                                                            {t('sender.form.address')}: {job.receiver?.address || 'N/A'}
                                                        </p>
                                                        <div style={styles.actionButtonGroup}>
                                                            {job.status === 'Pending' && (
                                                                <button
                                                                    style={{ ...styles.actionButton, ...styles.trackButton }}
                                                                    onClick={() => startDriving(job)}
                                                                    disabled={!!activeJob}
                                                                >
                                                                    {t('driver.pending.start')}
                                                                </button>
                                                            )}
                                                            {job.status === 'In Transit' && activeJob?.id === job.id && (
                                                                <button
                                                                    style={{ ...styles.actionButton, ...styles.completeButton }}
                                                                    onClick={() => handleMarkAsDelivered(job)}
                                                                >
                                                                    {t('driver.pending.deliver')}
                                                                </button>
                                                            )}
                                                        </div>
                                                        {job.status === 'In Transit' && activeJob?.id === job.id && (
                                                            <p style={{ color: 'var(--color-success)', fontWeight: 'bold', margin: '8px 0 0' }}>
                                                                {t('driver.pending.active')}
                                                            </p>
                                                        )}
                                                        {job.status === 'Pending' && !!activeJob && (
                                                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', margin: '8px 0 0' }}>
                                                                {t('driver.pending.await')}
                                                            </p>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                </div>
                            </>
                        </div>
                    )}

                    {!loading && activeTab === 'completed' && (
                        <div key="completed" className="tab-content">
                            <div style={styles.listCard}>
                                <>
                                    <h3 style={styles.cardTitle}>
                                        {t('driver.completed.title', { count: filteredCompletedJobs.length })}
                                    </h3>

                                    <div style={{ marginBottom: '20px' }}>
                                        <input
                                            type="text"
                                            placeholder={t('driver.search.placeholder') || 'Search by ID, receiver, address, or goods...'}
                                            value={searchCompleted}
                                            onChange={(e) => setSearchCompleted(e.target.value)}
                                            style={{
                                                ...styles.input,
                                                width: '100%',
                                                padding: '12px',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </div>

                                    {filteredCompletedJobs.length === 0 && (
                                        <p style={styles.pageText}>
                                            {searchCompleted.trim() ? t('driver.search.noResults') || 'No matching shipments found' : t('driver.completed.empty')}
                                        </p>
                                    )}
                                    <ul style={styles.list}>
                                        {filteredCompletedJobs.map(job => (
                                            <li key={job.id} style={styles.listItem}>
                                                <strong>{job.shipmentId}</strong> - {job.status}
                                                <div style={styles.listItemDetails}>
                                                    <span>{t('list.to', { name: job.receiver?.name || 'N/A' })}</span>
                                                    <span>{t('list.goods', { name: job.goods?.name || 'N/A' })}</span>
                                                </div>
                                                <div style={{...styles.actionButtonGroup, marginTop: '10px', flexWrap: 'wrap', gap: '8px'}}>
                                                    <button
                                                        style={{ ...styles.actionButton, backgroundColor: 'var(--color-primary)', color: 'white' }}
                                                        onClick={() => handlePrintInvoice(job)}
                                                    >
                                                        🖨️ {t('btn.printInvoice') || 'Print Invoice'}
                                                    </button>
                                                    {job.signature && (
                                                        <button
                                                            style={{ ...styles.actionButton, ...styles.trackButton }}
                                                            onClick={() => setSigningShipment(job)}
                                                        >
                                                            {t('list.signature')}
                                                        </button>
                                                    )}
                                                    {!job.paymentStatus || job.paymentStatus === 'pending' ? (
                                                        <button
                                                            style={{ ...styles.actionButton, backgroundColor: 'var(--color-primary)', color: 'white' }}
                                                            onClick={() => handleMarkAsPaid(job.id)}
                                                        >
                                                            {t('btn.markPaid') || 'Mark as Paid'}
                                                        </button>
                                                    ) : (
                                                        <span style={{ ...styles.actionButton, backgroundColor: 'var(--color-success)', color: 'white', cursor: 'default' }}>
                                            ✓ {t('driver.revenue.paid') || 'Paid'}
                                        </span>
                                                    )}
                                                    <button
                                                        style={{ ...styles.actionButton, backgroundColor: 'var(--color-secondary)', color: 'var(--color-text)' }}
                                                        onClick={() => handleArchiveShipment(job.id)}
                                                    >
                                                        {t('btn.hide') || 'Hide'}
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            </div>
                        </div>
                    )}

                    {!loading && activeTab === 'archived' && (
                        <div key="archived" className="tab-content">
                            <div style={styles.listCard}>
                                <>
                                    <h3 style={styles.cardTitle}>
                                        {t('driver.archived.title', { count: archivedJobs.length }) || `Archived Shipments (${archivedJobs.length})`}
                                    </h3>
                                    {archivedJobs.length === 0 && (
                                        <p style={styles.pageText}>{t('driver.archived.empty') || 'No archived shipments'}</p>
                                    )}
                                    <ul style={styles.list}>
                                        {archivedJobs.map(job => (
                                            <li key={job.id} style={styles.listItem}>
                                                <strong>{job.shipmentId}</strong> - {job.status}
                                                <div style={styles.listItemDetails}>
                                                    <span>{t('list.to', { name: job.receiver?.name || 'N/A' })}</span>
                                                    <span>{t('list.goods', { name: job.goods?.name || 'N/A' })}</span>
                                                </div>
                                                <div style={{...styles.actionButtonGroup, marginTop: '10px'}}>
                                                    <button
                                                        style={{
                                                            ...styles.actionButton,
                                                            backgroundColor: 'var(--color-success)',
                                                            color: 'white'
                                                        }}
                                                        onClick={() => handleUnarchiveShipment(job.id)}
                                                    >
                                                        {t('btn.unhide') || 'Unhide'}
                                                    </button>

                                                    {job.signature && (
                                                        <button
                                                            style={{ ...styles.actionButton, ...styles.trackButton }}
                                                            onClick={() => setSigningShipment(job)}
                                                        >
                                                            {t('list.signature') || 'View Signature'}
                                                        </button>
                                                    )}
                                                    <button
                                                        style={{ ...styles.actionButton, backgroundColor: 'var(--color-error)', color: 'white' }}
                                                        onClick={() => handleDeletePermanently(job.id)}
                                                    >
                                                        {t('btn.deletePermanently') || 'Delete Permanently'}
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            </div>
                        </div>
                    )}

                    {!loading && activeTab === 'revenue' && (
                        <div key="revenue" className="tab-content">
                            <RevenueTab completedJobs={completedJobs} archivedJobs={archivedJobs} />
                        </div>
                    )}

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

export default DriverDashboard;
