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
    LineElement,
    PointElement,
    Title
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title
);

// Configure Chart.js default font
ChartJS.defaults.font.family = "'Vazirmatn', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
ChartJS.defaults.font.size = 14;
ChartJS.defaults.font.weight = '500';


const RevenueTab = ({ completedJobs, archivedJobs }) => {
    const { t, i18n } = useTranslation();

    // Calculate revenue statistics
    const stats = useMemo(() => {
        const allEarnings = [...completedJobs, ...archivedJobs];

        const totalRevenue = allEarnings.reduce((sum, job) => {
            return sum + (parseFloat(job.driver?.fee) || 0);
        }, 0);

        const thisMonthRevenue = allEarnings
            .filter(job => {
                if (!job.deliveredAt) return false;
                const deliveryDate = new Date(job.deliveredAt);
                const now = new Date();
                return deliveryDate.getMonth() === now.getMonth() &&
                    deliveryDate.getFullYear() === now.getFullYear();
            })
            .reduce((sum, job) => sum + (parseFloat(job.driver?.fee) || 0), 0);

        const totalDeliveries = allEarnings.length;
        const averagePerDelivery = totalDeliveries > 0 ? totalRevenue / totalDeliveries : 0;

        return {
            totalRevenue,
            thisMonthRevenue,
            totalDeliveries,
            averagePerDelivery
        };
    }, [completedJobs, archivedJobs]);

    // Monthly revenue chart data
    const monthlyChartData = useMemo(() => {
        const locale = i18n.language.startsWith('fa') ? 'fa-IR-u-ca-gregory' : 'en-US';
        const allEarnings = [...completedJobs, ...archivedJobs];
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

        for (const job of allEarnings) {
            if (!job.deliveredAt) continue;
            const d = new Date(job.deliveredAt);
            const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
            if (key in months) {
                months[key] += parseFloat(job.driver?.fee) || 0;
            }
        }

        data.push(...Object.values(months));

        return {
            labels,
            datasets: [{
                label: t('driver.revenue.monthlyEarnings') || 'Monthly Earnings ($)',
                data: data,
                backgroundColor: 'rgba(33, 128, 141, 0.2)',
                borderColor: 'rgba(33, 128, 141, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        };
    }, [completedJobs, archivedJobs, i18n.language, t]);

    // Payment status breakdown (for doughnut chart)
    const paymentStatusData = useMemo(() => {
        const allEarnings = [...completedJobs, ...archivedJobs];

        const paid = allEarnings
            .filter(job => job.paymentStatus === 'paid')
            .reduce((sum, job) => sum + (parseFloat(job.driver?.fee) || 0), 0);

        const pending = allEarnings
            .filter(job => !job.paymentStatus || job.paymentStatus === 'pending')
            .reduce((sum, job) => sum + (parseFloat(job.driver?.fee) || 0), 0);

        return {
            labels: [
                t('driver.revenue.paid') || 'Paid',
                t('driver.revenue.pending') || 'Pending'
            ],
            datasets: [{
                data: [paid, pending],
                backgroundColor: [
                    'rgba(76, 175, 80, 0.6)',
                    'rgba(255, 165, 0, 0.6)'
                ],
                borderColor: [
                    'rgba(76, 175, 80, 1)',
                    'rgba(255, 165, 0, 1)'
                ],
                borderWidth: 1
            }]
        };
    }, [completedJobs, archivedJobs, t]);

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: t('driver.revenue.monthlyTitle') || 'Monthly Revenue Trend'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return '$' + value.toFixed(0);
                    }
                }
            }
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: {
                display: true,
                text: t('driver.revenue.paymentStatus') || 'Payment Status'
            }
        }
    };

    // Recent earnings list
    const recentEarnings = useMemo(() => {
        return [...completedJobs, ...archivedJobs]
            .sort((a, b) => new Date(b.deliveredAt || 0) - new Date(a.deliveredAt || 0))
            .slice(0, 10);
    }, [completedJobs, archivedJobs]);

    return (
        <>
            {/* Revenue Stats Cards */}
            <div style={styles.overviewGrid} className="overview-grid-responsive">
                <div style={styles.formCard}>
                    <h3 style={styles.cardTitle}>{t('driver.revenue.title') || 'Revenue Overview'}</h3>
                    <p style={styles.pageText}>{t('driver.revenue.desc') || 'Track your earnings and payment status'}</p>
                    <div style={styles.statCardContainer}>
                        <div style={styles.statCard}>
                            <p style={styles.statValue}>${stats.totalRevenue.toFixed(2)}</p>
                            <p style={styles.statLabel}>{t('driver.revenue.total') || 'Total Revenue'}</p>
                        </div>
                        <div style={styles.statCard}>
                            <p style={styles.statValue}>${stats.thisMonthRevenue.toFixed(2)}</p>
                            <p style={styles.statLabel}>{t('driver.revenue.thisMonth') || 'This Month'}</p>
                        </div>
                        <div style={styles.statCard}>
                            <p style={styles.statValue}>{stats.totalDeliveries}</p>
                            <p style={styles.statLabel}>{t('driver.revenue.deliveries') || 'Total Deliveries'}</p>
                        </div>
                        <div style={styles.statCard}>
                            <p style={styles.statValue}>${stats.averagePerDelivery.toFixed(2)}</p>
                            <p style={styles.statLabel}>{t('driver.revenue.average') || 'Avg Per Delivery'}</p>
                        </div>
                    </div>
                </div>

                {/* Payment Status Doughnut */}
                <div style={styles.formCard}>
                    <h3 style={styles.cardTitle}>{t('driver.revenue.paymentStatus') || 'Payment Status'}</h3>
                    <div style={{height: '300px', width: '100%', margin: '0 auto'}}>
                        <Doughnut data={paymentStatusData} options={doughnutOptions} />
                    </div>
                </div>
            </div>

            {/* Monthly Revenue Line Chart */}
            <div style={{...styles.listCard, marginTop: '24px'}}>
                <div style={{height: '300px', width: '100%'}}>
                    <Line data={monthlyChartData} options={lineChartOptions} />
                </div>
            </div>

            {/* Recent Earnings List */}
            <div style={{...styles.listCard, marginTop: '24px'}}>
                <h3 style={styles.cardTitle}>{t('driver.revenue.recent') || 'Recent Earnings'}</h3>
                {recentEarnings.length === 0 && (
                    <p style={styles.pageText}>{t('driver.revenue.noEarnings') || 'No earnings yet'}</p>
                )}
                <ul style={styles.list}>
                    {recentEarnings.map(job => (
                        <li key={job.id} style={styles.listItem}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <div>
                                    <strong>{job.shipmentId}</strong>
                                    <div style={styles.listItemDetails}>
                                        <span>{t('list.to', { name: job.receiver?.name || 'N/A' })}</span>
                                        <span>
                                            {job.deliveredAt
                                                ? new Date(job.deliveredAt).toLocaleDateString()
                                                : 'N/A'
                                            }
                                        </span>
                                    </div>
                                </div>
                                <div style={{textAlign: 'right'}}>
                                    <p style={{
                                        fontSize: '1.2rem',
                                        fontWeight: 'bold',
                                        color: 'var(--color-success)',
                                        margin: 0
                                    }}>
                                        ${parseFloat(job.driver?.fee || 0).toFixed(2)}
                                    </p>
                                    <span style={{
                                        fontSize: '0.85rem',
                                        color: job.paymentStatus === 'paid'
                                            ? 'var(--color-success)'
                                            : 'var(--color-warning)',
                                        fontWeight: '500'
                                    }}>
                                        {job.paymentStatus === 'paid'
                                            ? (t('driver.revenue.paid') || 'Paid')
                                            : (t('driver.revenue.pending') || 'Pending')
                                        }
                                    </span>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};

export default RevenueTab;
