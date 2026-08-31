import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getLogs, getLogsSummary } from '../lib/api';
import { Search } from 'lucide-react';

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState('');
  const [context, setContext] = useState('');
  const [message, setMessage] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = () => {
    setLoading(true);
    getLogs({ level, context, message, page, limit: 30 })
      .then((res) => {
        if (res.success) {
          setLogs(res.data);
          setTotalPages(res.totalPages || 1);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getLogsSummary().then(res => { if (res.success) setSummary(res.data); });
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [level, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
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

      <form onSubmit={handleSearch} className="filter-bar">
        <input
          type="text"
          className="input-field"
          placeholder="Search log message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <input
          type="text"
          className="input-field"
          placeholder="Filter context..."
          value={context}
          onChange={(e) => setContext(e.target.value)}
        />
        <select className="select-field" value={level} onChange={(e) => { setLevel(e.target.value); setPage(1); }}>
          <option value="">All Levels</option>
          <option value="info">info</option>
          <option value="warn">warn</option>
          <option value="error">error</option>
          <option value="debug">debug</option>
        </select>
        <button type="submit" className="btn"><Search size={16} /> Search</button>
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
              {logs.map((log) => (
                <tr key={log._id}>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(log.timestamp || log.createdAt).toLocaleString()}</td>
                  <td><span className={`badge badge-${log.level}`}>{ (log.level || 'info').toUpperCase() }</span></td>
                  <td><strong>{log.context || '-'}</strong></td>
                  <td style={{ fontWeight: 500 }}>{log.message}</td>
                  <td>{log.customerFullName || '-'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{log.orderId || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            <span>Page {page} of {totalPages}</span>
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
