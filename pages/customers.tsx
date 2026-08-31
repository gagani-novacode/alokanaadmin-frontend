import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getCustomers, getCustomerOrders } from '../lib/api';
import { Search, Eye, X } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCustomerOrders, setSelectedCustomerOrders] = useState<any>(null);

  const fetchCustomers = () => {
    setLoading(true);
    getCustomers({ name, email })
      .then((res) => {
        if (res.success) setCustomers(res.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers();
  };

  const handleViewOrders = (customerEmail: string) => {
    getCustomerOrders(customerEmail)
      .then((res) => {
        if (res.success) setSelectedCustomerOrders(res);
      });
  };

  return (
    <Layout title="Customer Management">
      <form onSubmit={handleSearch} className="filter-bar">
        <input
          type="text"
          className="input-field"
          placeholder="Search name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          className="input-field"
          placeholder="Search email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="btn"><Search size={16} /> Filter</button>
      </form>

      {loading ? (
        <div className="loading-spinner">Loading Customers...</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>ID Type / No.</th>
                <th>Total Orders</th>
                <th>Tickets Bought</th>
                <th>Total Spent</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c, idx) => (
                <tr key={idx} className="hoverable" onClick={() => handleViewOrders(c.email)}>
                  <td><strong>{c.fullName}</strong></td>
                  <td>{c.email}</td>
                  <td>{c.phone || 'N/A'}</td>
                  <td>{c.idType} {c.idNumber}</td>
                  <td>{c.totalOrders} ({c.paidOrders} PAID)</td>
                  <td>{c.totalTicketsPurchased}</td>
                  <td><strong>LKR {c.totalSpentLKR?.toLocaleString()}</strong></td>
                  <td>
                    <button className="btn" style={{ padding: '4px 8px' }} onClick={(e) => { e.stopPropagation(); handleViewOrders(c.email); }}>
                      <Eye size={14} /> Orders
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedCustomerOrders && (
        <div className="modal-overlay" onClick={() => setSelectedCustomerOrders(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Orders for {selectedCustomerOrders.customer?.firstName} {selectedCustomerOrders.customer?.lastName}</h3>
              <button className="btn" onClick={() => setSelectedCustomerOrders(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '12px' }}>
                Total Orders: <strong>{selectedCustomerOrders.totalOrders}</strong> | Total Tickets Purchased: <strong>{selectedCustomerOrders.totalTicketsPurchased}</strong>
              </p>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Status</th>
                      <th>Total LKR</th>
                      <th>Tickets</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCustomerOrders.data?.map((o: any) => (
                      <tr key={o._id}>
                        <td style={{ fontFamily: 'monospace' }}>{o._id.substring(0, 8)}...</td>
                        <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                        <td>LKR {o.totalLKR?.toLocaleString()}</td>
                        <td>{o.totalTickets}</td>
                        <td>{new Date(o.createdAt).toLocaleDateString()}</td>
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
