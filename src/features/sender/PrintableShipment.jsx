import React, { useEffect } from 'react'; // <-- IMPORT useEffect
import styles from '../../styles/styles';

/**
 * PrintableShipment Component
 * This now controls the print dialog
 */
const PrintableShipment = React.forwardRef(({ shipment, onPrintComplete }, ref) => { // <-- ADD onPrintComplete

    useEffect(() => {
        // This effect runs *after* this component has rendered with the new shipment
        if (shipment) {
            window.print(); // Open the print dialog
            onPrintComplete(); // Tell the parent to reset the state
        }
    }, [shipment, onPrintComplete]); // Run when these props change
    // --- ^^^ END NEW EFFECT ^^^ ---

    if (!shipment) return null; // Don't render anything if no shipment

    return (
        <div ref={ref} style={styles.printPage} className="print-area-content">
            <div style={styles.printHeader}>
                <h1>Shipment Manifest</h1>
                <h2>ID: {shipment.shipmentId}</h2>
            </div>

            <div style={styles.printSection}>
                <h3 style={styles.printSectionTitle}>Receiver Details</h3>
                <div style={styles.printGrid}>
                    <span style={styles.printLabel}>Name:</span><span style={styles.printValue}>{shipment.receiver?.name || 'N/A'}</span>
                    <span style={styles.printLabel}>Email:</span><span style={styles.printValue}>{shipment.receiver?.email || 'N/A'}</span>
                    <span style={styles.printLabel}>Phone:</span><span style={styles.printValue}>{shipment.receiver?.phone || 'N/A'}</span>
                    <span style={styles.printLabel}>Company:</span><span style={styles.printValue}>{shipment.receiver?.company || 'N/A'}</span>
                    <span style={styles.printLabel}>Address:</span><span style={styles.printValue}>{shipment.receiver?.address || 'N/A'}</span>
                </div>
            </div>

            <div style={styles.printSection}>
                <h3 style={styles.printSectionTitle}>Driver Details</h3>
                <div style={styles.printGrid}>
                    <span style={styles.printLabel}>Name:</span><span style={styles.printValue}>{shipment.driver?.name || 'N/A'}</span>
                    <span style={styles.printLabel}>Email:</span><span style={styles.printValue}>{shipment.driver?.email || 'N/A'}</span>
                    <span style={styles.printLabel}>Phone:</span><span style={styles.printValue}>{shipment.driver?.phone || 'N/A'}</span>
                    <span style={styles.printLabel}>Car Plate:</span><span style={styles.printValue}>{shipment.driver?.carPlate || 'N/A'}</span>
                    <span style={styles.printLabel}>Fee:</span><span style={styles.printValue}>{shipment.driver?.fee ? `$${shipment.driver.fee}` : 'N/A'}</span>
                </div>
            </div>

            <div style={styles.printSection}>
                <h3 style={styles.printSectionTitle}>Goods Details</h3>
                <div style={styles.printGrid}>
                    <span style={styles.printLabel}>Name:</span><span style={styles.printValue}>{shipment.goods?.name || 'N/A'}</span>
                    <span style={styles.printLabel}>Type:</span><span style={styles.printValue}>{shipment.goods?.type || 'N/A'}</span>
                    <span style={styles.printLabel}>Weight:</span><span style={styles.printValue}>{shipment.goods?.weight ? `${shipment.goods.weight} kg` : 'N/A'}</span>
                </div>
            </div>

            <div style={{...styles.printSection, marginTop: '40px', textAlign: 'center', fontStyle: 'italic'}}>
                <p>Status: {shipment.status}</p>
                <p>Created: {shipment.createdAt ? new Date(shipment.createdAt).toLocaleString() : 'N/A'}</p>
            </div>
        </div>
    );
});
PrintableShipment.displayName = 'PrintableShipment';
export default PrintableShipment;