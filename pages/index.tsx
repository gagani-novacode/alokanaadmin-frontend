import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getDashboardSummary } from '../lib/api';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement);

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboardSummary()
      .then((res) => {
        if (res.success) setData(res.data);
        else setError('Failed to load dashboard data');
      })
      .catch((err) => setError(err.message || 'Error connecting to backend'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout title="Dashboard Overview">
        <div className="loading-spinner">Loading Dashboard Data...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Dashboard Overview">
        <div className="card" style={{ color: 'var(--error)' }}>{error}</div>
      </Layout>
    );
  }

  const revenueData = {
    labels: data?.dailyRevenue?.map((d: any) => d._id) || [],
    datasets: [
      {
        label: 'Daily Revenue (LKR)',
        data: data?.dailyRevenue?.map((d: any) => d.revenue) || [],
        borderColor: '#e53935',
        backgroundColor: 'rgba(229, 57, 53, 0.1)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const statusCounts = data?.ordersByStatus || {};
  const statusData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: ['#16a34a', '#d97706', '#dc2626', '#94a3b8'],
      },
    ],
  };

  const paymentBreakdown = data?.paymentMethodBreakdown || [];
  const paymentData = {
    labels: paymentBreakdown.map((p: any) => p._id),
    datasets: [
      {
        label: 'Orders Count',
        data: paymentBreakdown.map((p: any) => p.count),
        backgroundColor: '#e53935',
      },
    ],
  };

  return (
    <Layout title="Dashboard Overview">
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Total Tickets</span>
          <span className="kpi-value">{data?.totalOrders || 0}</span>
          <span className="kpi-sub">Across all statuses</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Total Revenue</span>
          <span className="kpi-value">LKR {(data?.totalRevenueLKR || 0).toLocaleString()}</span>
          <span className="kpi-sub">PAID tickets only</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Tickets Sold</span>
          <span className="kpi-value">{data?.totalTicketsSold || 0}</span>
          <span className="kpi-sub">{data?.totalAvailableTickets || 0} available in stock</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Unique Customers</span>
          <span className="kpi-value">{data?.uniqueCustomers || 0}</span>
          <span className="kpi-sub">Registered buyers</span>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Revenue</h2>
          </div>
          <Line data={revenueData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Tickets Status</h2>
          </div>
          <Doughnut data={statusData} options={{ responsive: true }} />
        </div>
      </div>

      {/*<div className="card">
        <div className="card-header">
          <h2 className="card-title">Payment Methods Breakdown</h2>
        </div>
        <Bar data={paymentData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
      </div>*/}
    </Layout>
  );
}
