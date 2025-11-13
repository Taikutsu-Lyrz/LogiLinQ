import React, { useMemo } from 'react';
import styles from '../../styles/styles';
import { useTranslation } from 'react-i18next';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
);

// Configure Chart.js default font
ChartJS.defaults.font.family = "'Vazirmatn', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
ChartJS.defaults.font.size = 14;
ChartJS.defaults.font.weight = '500';


// Updated to accept archivedShipments prop
const MonthlyRecapTab = ({ shipments, archivedShipments = [] }) => {
    const { t, i18n } = useTranslation();

    const stats = useMemo(() => {
        //  Include archived in total calculations
        const allShipments = [...shipments, ...archivedShipments];
        const totalShipments = allShipments.length;

        const completedShipments = shipments.filter(s =>
            s.status === 'Completed' || s.status === 'Received'
        ).length;
        const ongoingShipments = shipments.filter(s =>
            s.status !== 'Completed' && s.status !== 'Received'
        ).length;

        const driverEmails = allShipments.map(s => s.driver?.email).filter(Boolean);
        const totalDrivers = new Set(driverEmails).size;
        const totalFees = allShipments.reduce((acc, s) => {
            const fee = parseFloat(s.driver?.fee) || 0;
            return acc + fee;
        }, 0);

        return {
            totalShipment: totalShipments,
            completedShipments,
            ongoingShipments,
            archivedShipments: archivedShipments.length, // ✅ Added archived count
            totalDrivers,
            totalFees
        };
    }, [shipments, archivedShipments]);

    // includes archived in doughnut chart
    const doughnutData = {
        labels: [
            t('sender.recap.ongoing'),
            t('sender.recap.completed'),
            t('sender.nav.archived') || 'Archived'
        ],
        datasets: [
            {
                label: '# of Shipments',
                data: [
                    stats.ongoingShipments,
                    stats.completedShipments,
                    stats.archivedShipments
                ],
                backgroundColor: [
                    'rgba(255, 165, 0, 0.4)', // Orange - Ongoing
                    'rgba(76, 175, 80, 0.4)',  // Green - Completed
                    'rgba(158, 158, 158, 0.4)' // Grey - Archived
                ],
                borderColor: [
                    'rgba(255, 165, 0, 1)',
                    'rgba(76, 175, 80, 1)',
                    'rgba(158, 158, 158, 1)'
                ],
                borderWidth: 1,
            },
        ],
    };

    const barChartData = useMemo(() => {
        const locale = i18n.language.startsWith('fa') ? 'fa-IR-u-ca-gregory' : 'en-US';

        // Include archived in bar chart
        const allShipments = [...shipments, ...archivedShipments];
        const months = {};
        const labels = [];
        const data = [];

        const today = new Date();
        for (let i = 11; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;

            labels.push(d.toLocaleString(locale, { month: 'short', year: '2-digit' }));
            months[key] = 0;
        }

        for (const ship of allShipments) {
            if (!ship.createdAt) continue;
            const d = new Date(ship.createdAt);
            const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
            if (key in months) {
                months[key]++;
            }
        }

        data.push(...Object.values(months));

        return {
            labels,
            datasets: [{
                label: t('sender.recap.total'),
                data: data,
                backgroundColor: 'rgba(25, 118, 210, 0.5)',
                borderColor: 'rgba(25, 118, 210, 1)',
                borderWidth: 1
            }]
        };
    }, [shipments, archivedShipments, i18n.language, t]);

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: t('sender.recap.monthlyTitle')
            }
        },
        scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: {
                display: true,
                text: t('sender.recap.title')
            }
        }
    };

    return (
        <>
            <div style={styles.overviewGrid} className="overview-grid-responsive">

                <div style={styles.formCard}>
                    <h3 style={styles.cardTitle}>{t('sender.recap.title')}</h3>
                    <p style={styles.pageText}>{t('sender.recap.desc')}</p>
                    <div style={styles.statCardContainer}>
                        <div style={styles.statCard}>
                            <p style={styles.statValue}>{stats.totalShipment}</p>
                            <p style={styles.statLabel}>{t('sender.recap.total')}</p>
                        </div>
                        <div style={styles.statCard}>
                            <p style={styles.statValue}>{stats.completedShipments}</p>
                            <p style={styles.statLabel}>{t('sender.recap.completed')}</p>
                        </div>
                        <div style={styles.statCard}>
                            <p style={styles.statValue}>{stats.ongoingShipments}</p>
                            <p style={styles.statLabel}>{t('sender.recap.ongoing')}</p>
                        </div>
                        {/* ✅ NEW: Added archived stat card */}
                        <div style={styles.statCard}>
                            <p style={styles.statValue}>{stats.archivedShipments}</p>
                            <p style={styles.statLabel}>{t('sender.nav.archived') || 'Archived'}</p>
                        </div>
                        <div style={styles.statCard}>
                            <p style={styles.statValue}>{stats.totalDrivers}</p>
                            <p style={styles.statLabel}>{t('sender.recap.drivers')}</p>
                        </div>
                        <div style={styles.statCard}>
                            <p style={styles.statValue}>${stats.totalFees.toFixed(2)}</p>
                            <p style={styles.statLabel}>{t('sender.recap.fees')}</p>
                        </div>
                    </div>
                </div>

                <div style={styles.formCard}>
                    <h3 style={styles.cardTitle}>{t('sender.recap.title')}</h3>
                    <div style={{height: '300px', width: '100%', margin: '0 auto'}}>
                        <Doughnut data={doughnutData} options={doughnutOptions} />
                    </div>
                </div>
            </div>

            <div style={{...styles.listCard, marginTop: '24px'}}>
                <div style={{height: '300px', width: '100%'}}>
                    <Bar data={barChartData} options={barOptions} />
                </div>
            </div>
        </>
    );
};

export default MonthlyRecapTab;
