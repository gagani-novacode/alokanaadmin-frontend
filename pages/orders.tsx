import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getOrders, getOrderById } from '../lib/api';
import { Search, Eye, X } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const fetchOrders = () => {
    setLoading(true);
    getOrders({ status, customerName, page, limit: 15 })
      .then((res) => {
        if (res.success) {
          setOrders(res.data);
          setTotalPages(res.totalPages || 1);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [status, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleOpenModal = (orderId: string) => {
    getOrderById(orderId)
      .then((res) => {
        if (res.success) {
          setSelectedOrder(res.data);
        }
      });
  };

  return (
    <Layout title="Tickets Management">
      <form onSubmit={handleSearch} className="filter-bar">
        <input
          type="text"
          className="input-field"
          placeholder="Search customer name..."
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />
        <select
          className="select-field"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
        >
          <option value="">All Statuses</option>
          <option value="PAID">PAID</option>
          <option value="PENDING">PENDING</option>
          <option value="CANCELLED">CANCELLED</option>
          <option value="FAILED">FAILED</option>
        </select>
        <button type="submit" className="btn">
          <Search size={16} /> Filter
        </button>
      </form>

      {loading ? (
        <div className="loading-spinner">Loading Orders...</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Total (LKR)</th>
                <th>Status</th>
                <th>Payment Method</th>
                <th>Date</th>

              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '24px' }}>No orders found</td></tr>
              ) : (
                orders.map((o) => (
                  <tr key={o._id} className="hoverable" onClick={() => handleOpenModal(o._id)}>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{o._id.substring(0, 8)}...</td>
                    <td>{o.customer?.firstName} {o.customer?.lastName}</td>
                    <td>{o.customer?.email}</td>
                    <td><strong>LKR {o.totalLKR?.toLocaleString()}</strong></td>
                    <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                    <td>{o.paymentMethod || 'N/A'}</td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>

                  </tr>
                ))
              )}
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
                  <div className="detail-label">Customer</div>
                  <div className="detail-value">{selectedOrder.customer?.firstName} {selectedOrder.customer?.lastName}</div>
                </div>
                <div>
                  <div className="detail-label">Email</div>
                  <div className="detail-value">{selectedOrder.customer?.email}</div>
                </div>
                <div>
                  <div className="detail-label">Status</div>
                  <div className="detail-value"><span className={`badge badge-${selectedOrder.status}`}>{selectedOrder.status}</span></div>
                </div>
                <div>
                  <div className="detail-label">Total LKR</div>
                  <div className="detail-value">LKR {selectedOrder.totalLKR?.toLocaleString()}</div>
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
