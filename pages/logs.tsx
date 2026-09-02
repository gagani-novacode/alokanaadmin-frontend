import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getLogs, getLogsSummary } from '../lib/api';
import { Search, RotateCcw, Filter } from 'lucide-react';

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form input state
  const [level, setLevel] = useState('');
  const [context, setContext] = useState('');
  const [message, setMessage] = useState('');
  const [customerName, setCustomerName] = useState('');

  // Active filters sent to API
  const [activeFilters, setActiveFilters] = useState({
    level: '',
    context: '',
    message: '',
    customerName: '',
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  const fetchLogs = (filterParams = activeFilters, targetPage = page) => {
    setLoading(true);
    getLogs({ ...filterParams, page: targetPage, limit: 30 })
      .then((res) => {
        if (res.success) {
          setLogs(res.data || []);
          setTotalPages(res.totalPages || 1);
          setTotalLogs(res.total || 0);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getLogsSummary().then((res) => {
      if (res.success) setSummary(res.data);
    });
  }, []);

  useEffect(() => {
    fetchLogs(activeFilters, page);
  }, [page, activeFilters]);

  const handleApplyFilters = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const newFilters = { level, context, message, customerName };
    setPage(1);
    setActiveFilters(newFilters);
  };

  const handleReset = () => {
    const defaultFilters = { level: '', context: '', message: '', customerName: '' };
    setLevel('');
    setContext('');
    setMessage('');
    setCustomerName('');
    setPage(1);
    setActiveFilters(defaultFilters);
  };

  return (
    <Layout title="System Logs & Audit">
      {summary && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div className="card" style={{ padding: '12px 18px', flex: 1, minWidth: '140px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>INFO LOGS</span>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--info)' }}>{summary.byLevel?.info || 0}</div>
          </div>
          <div className="card" style={{ padding: '12px 18px', flex: 1, minWidth: '140px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>WARN LOGS</span>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--warning)' }}>{summary.byLevel?.warn || 0}</div>
          </div>
          <div className="card" style={{ padding: '12px 18px', flex: 1, minWidth: '140px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>ERROR LOGS</span>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--error)' }}>{summary.byLevel?.error || 0}</div>
          </div>
          <div className="card" style={{ padding: '12px 18px', flex: 1, minWidth: '140px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>DEBUG LOGS</span>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#7c3aed' }}>{summary.byLevel?.debug || 0}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleApplyFilters} className="filter-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          className="input-field"
          placeholder="Filter by Customer Name..."
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          style={{ minWidth: '180px' }}
        />
        <input
          type="text"
          className="input-field"
          placeholder="Search log message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ minWidth: '180px' }}
        />
        <input
          type="text"
          className="input-field"
          placeholder="Filter context..."
          value={context}
          onChange={(e) => setContext(e.target.value)}
          style={{ minWidth: '140px' }}
        />
        <select
          className="select-field"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          style={{ minWidth: '130px' }}
        >
          <option value="">All Levels</option>
          <option value="info">info</option>
          <option value="warn">warn</option>
          <option value="error">error</option>
          <option value="debug">debug</option>
        </select>
        
        <button type="submit" className="btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={16} /> Apply Filters
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleReset} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <RotateCcw size={16} /> Reset
        </button>
      </form>

      {loading ? (
        <div className="loading-spinner">Loading Logs...</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Level</th>
                <th>Context</th>
                <th>Message</th>
                <th>Customer</th>
                <th>Order ID</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>No logs found matching filters</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id}>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(log.timestamp || log.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge badge-${log.level}`}>{(log.level || 'info').toUpperCase()}</span>
                    </td>
                    <td><strong>{log.context || '-'}</strong></td>
                    <td style={{ fontWeight: 500 }}>{log.message}</td>
                    <td>{log.customerFullName || log.meta?.customerName || log.meta?.customerEmail || '-'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{log.orderId || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="pagination">
            <span>Page {page} of {totalPages} (Total: {totalLogs} logs)</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</button>
              <button className="btn" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
