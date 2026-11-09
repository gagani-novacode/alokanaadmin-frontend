import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getOrders, getOrderById } from '../lib/api';
import { Search, Eye, X, RotateCcw, Filter } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter form state
  const [status, setStatus] = useState('PAID');
  const [customerName, setCustomerName] = useState('');
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('');

  // Active filters sent to API
  const [activeFilters, setActiveFilters] = useState({
    status: 'PAID',
    customerName: '',
    orderId: '',
    email: '',
    date: '',
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalFilteredTickets, setTotalFilteredTickets] = useState(0);

  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const fetchOrders = (filterParams = activeFilters, targetPage = page) => {
    setLoading(true);
    getOrders({ ...filterParams, page: targetPage, limit: 15 })
      .then((res) => {
        if (res.success) {
          setOrders(res.data || []);
          setTotalPages(res.totalPages || 1);
          setTotalOrders(res.total || 0);
          setTotalFilteredTickets(res.totalFilteredTickets || 0);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  // Fetch when page or active filters change
  useEffect(() => {
    fetchOrders(activeFilters, page);
  }, [page, activeFilters]);

  // Trigger filter application on form submit / button click
  const handleApplyFilters = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const newFilters = { status, customerName, orderId, email, date };
    setPage(1);
    setActiveFilters(newFilters);
  };

  const handleReset = () => {
    const defaultFilters = {
      status: 'PAID',
      customerName: '',
      orderId: '',
      email: '',
      date: '',
    };
    setStatus('PAID');
    setCustomerName('');
    setOrderId('');
    setEmail('');
    setDate('');
    setPage(1);
    setActiveFilters(defaultFilters);
  };

  const handleOpenModal = (id: string) => {
    getOrderById(id)
      .then((res) => {
        if (res.success) {
          setSelectedOrder(res.data);
        }
      });
  };

  return (
    <Layout title="Tickets Management">
      <form onSubmit={handleApplyFilters} className="filter-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          className="input-field"
          placeholder="Filter by Order ID..."
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          style={{ minWidth: '180px' }}
        />
        <input
          type="text"
          className="input-field"
          placeholder="Filter by Customer Name..."
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          style={{ minWidth: '160px' }}
        />
        <input
          type="text"
          className="input-field"
          placeholder="Filter by Email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ minWidth: '180px' }}
        />
        <input
          type="date"
          className="input-field"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ minWidth: '140px' }}
        />
        <select
          className="select-field"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ minWidth: '130px' }}
        >
          <option value="">All Statuses</option>
          <option value="PAID">PAID</option>
          <option value="PENDING">PENDING</option>
          <option value="CANCELLED">CANCELLED</option>
          <option value="FAILED">FAILED</option>
        </select>
        
        <button type="submit" className="btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={16} /> Apply Filters
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleReset} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <RotateCcw size={16} /> Reset
        </button>
      </form>

      <div className="summary-row" style={{ margin: '14px 0', padding: '10px 14px', backgroundColor: 'var(--card-bg, #ffffff)', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', display: 'flex', gap: '20px', alignItems: 'center', fontWeight: '500', flexWrap: 'wrap' }}>
        <span>Filtered Count: <strong>{totalOrders}</strong> Orders</span>
        <span style={{ borderLeft: '1px solid #cbd5e1', paddingLeft: '20px' }}>Total Tickets Purchased: <strong>{totalFilteredTickets}</strong> Tickets</span>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading Orders...</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Name</th>
                <th>Email</th>
                <th>Quantity</th>
                <th>Total (LKR)</th>
                <th>Status</th>
                <th>Payment Method</th>
                <th>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '24px' }}>No orders found matching filters</td></tr>
              ) : (
                orders.map((o) => (
                  <tr key={o._id} className="hoverable" onClick={() => handleOpenModal(o._id)}>
                    <td style={{ fontFamily: 'monospace', fontSize: '13px', wordBreak: 'break-all' }}>{o._id}</td>
                    <td>{o.customer?.firstName} {o.customer?.lastName}</td>
                    <td>{o.customer?.email}</td>
                    <td><strong>{o.totalQuantity || 1}</strong></td>
                    <td><strong>LKR {o.totalLKR?.toLocaleString()}</strong></td>
                    <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                    <td>{o.paymentMethod || 'N/A'}</td>
                    <td>{new Date(o.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="pagination">
            <span>Page {page} of {totalPages} (Total: {totalOrders} orders)</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</button>
              <button className="btn" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
            </div>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Details</h3>
              <button className="btn" onClick={() => setSelectedOrder(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div>
                  <div className="detail-label">Order ID</div>
                  <div className="detail-value" style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{selectedOrder._id}</div>
                </div>
                <div>
                  <div className="detail-label">Customer Name</div>
                  <div className="detail-value">{selectedOrder.customer?.firstName} {selectedOrder.customer?.lastName}</div>
                </div>
                <div>
                  <div className="detail-label">Email</div>
                  <div className="detail-value">{selectedOrder.customer?.email}</div>
                </div>
                <div>
                  <div className="detail-label">Mobile Number</div>
                  <div className="detail-value">{selectedOrder.customer?.phone || selectedOrder.customer?.mobile || 'N/A'}</div>
                </div>
                {selectedOrder.customer?.idNumber && (
                  <div>
                    <div className="detail-label">ID ({selectedOrder.customer?.idType || 'NIC'})</div>
                    <div className="detail-value">{selectedOrder.customer?.idNumber}</div>
                  </div>
                )}
                <div>
                  <div className="detail-label">Status</div>
                  <div className="detail-value"><span className={`badge badge-${selectedOrder.status}`}>{selectedOrder.status}</span></div>
                </div>
                <div>
                  <div className="detail-label">Total LKR</div>
                  <div className="detail-value">LKR {selectedOrder.totalLKR?.toLocaleString()}</div>
                </div>
                <div>
                  <div className="detail-label">Payment Method</div>
                  <div className="detail-value">{selectedOrder.paymentMethod || 'N/A'}</div>
                </div>
                <div>
                  <div className="detail-label">Date & Time</div>
                  <div className="detail-value">{new Date(selectedOrder.createdAt).toLocaleString()}</div>
                </div>
              </div>

              <h4 style={{ margin: '16px 0 8px', fontFamily: 'Outfit, sans-serif' }}>Purchased Inventory Items</h4>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Seat Type</th>
                      <th>Unit Price</th>
                      <th>Quantity</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.inventoryItems?.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td>{item.ticketInventory?.seatType || 'General'}</td>
                        <td>LKR {(item.unitPriceLKR || item.ticketInventory?.unitPriceLKR || 0).toLocaleString()}</td>
                        <td>{item.quantity}</td>
                        <td>LKR {((item.unitPriceLKR || item.ticketInventory?.unitPriceLKR || 0) * item.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
