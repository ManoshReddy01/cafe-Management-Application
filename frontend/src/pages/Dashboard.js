import { useState, useEffect, useCallback } from 'react';
import Receipt from '../components/Receipt';
import {
  fetchMenu,
  fetchOrders,
  trackOrders,
  placeOrder,
  addMenuItem,
  deleteMenuItem,
  fetchPendingOrders,
  fetchPreparingOrders,
  approvePayment,
  completeOrder,
  fetchOrderStatistics,
} from '../api';
import './Dashboard.css';

const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', icon: '🏪', upiLink: 'https://g.co/pay' },
  { id: 'phonepe', name: 'PhonePe', icon: '📱', upiLink: 'https://www.phonepe.com' },
  { id: 'paytm', name: 'Paytm', icon: '💳', upiLink: 'https://paytm.me' },
  { id: 'bhim', name: 'BHIM', icon: '🏛️', upiLink: 'https://bhim.apl.gov.in' },
  { id: 'whatsapp', name: 'WhatsApp Pay', icon: '💬', upiLink: 'https://www.whatsapp.com/payments' },
];

function formatOrderTime(orderTime) {
  if (!orderTime) return '—';
  const d = new Date(orderTime);
  if (Number.isNaN(d.getTime())) return orderTime;
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusBadge(order) {
  if (order.orderStatus === 'COMPLETED') {
    return { label: 'Completed', className: 'badge-success' };
  }
  if (order.orderStatus === 'PREPARING') {
    return { label: 'Preparing', className: 'badge-preparing' };
  }
  if (order.paymentStatus === 'PENDING') {
    return { label: 'Pending Approval', className: 'badge-pending' };
  }
  return { label: order.orderStatus || 'Pending', className: 'badge-warning' };
}

function OrderTracker({ order }) {
  const steps = [
    { key: 'pending', label: 'Pending', done: true },
    {
      key: 'preparing',
      label: 'Preparing',
      done: order.orderStatus === 'PREPARING' || order.orderStatus === 'COMPLETED',
    },
    { key: 'completed', label: 'Served', done: order.orderStatus === 'COMPLETED' },
  ];

  const activeIndex = order.orderStatus === 'COMPLETED'
    ? 2
    : order.orderStatus === 'PREPARING'
    ? 1
    : 0;

  return (
    <div className="order-tracker">
      <div className="tracker-header">
        <span className="tracker-item">{order.itemName} × {order.quantity}</span>
        <span className="tracker-time">{formatOrderTime(order.orderTime)}</span>
      </div>
      <div className="tracker-steps">
        {steps.map((step, i) => (
          <div key={step.key} className={`tracker-step ${step.done ? 'done' : ''} ${i === activeIndex ? 'active' : ''}`}>
            <div className="tracker-dot">{step.done ? '✓' : i + 1}</div>
            <span className="tracker-label">{step.label}</span>
            {i < steps.length - 1 && <div className={`tracker-line ${step.done && steps[i + 1].done ? 'done' : ''}`} />}
          </div>
        ))}
      </div>
      {order.paymentStatus === 'PENDING' && (
        <p className="tracker-note">Payment submitted — waiting for admin approval.</p>
      )}
    </div>
  );
}

function PaymentModal({ order, onClose, onPaymentSelect }) {
  const handleUPIRedirect = (upiApp, amount) => {
    const link = document.createElement('a');
    link.href = upiApp.upiLink;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
    onPaymentSelect(upiApp);
    setTimeout(onClose, 500);
  };

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={e => e.stopPropagation()}>
        <div className="payment-modal-header">
          <div>
            <div className="payment-modal-title">Select Payment Method</div>
            <p style={{ fontSize: '0.8rem', color: 'rgba(245,239,224,0.5)', marginTop: '0.3rem' }}>
              Pay with UPI
            </p>
          </div>
          <button className="payment-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="payment-order-summary">
          <div className="payment-summary-row">
            <span>Item:</span>
            <span>{order.itemName}</span>
          </div>
          <div className="payment-summary-row">
            <span>Quantity:</span>
            <span>{order.quantity}</span>
          </div>
          <div className="payment-summary-row">
            <span>Unit Price:</span>
            <span>₹{Number(order.price).toFixed(2)}</span>
          </div>
          <div className="payment-summary-row">
            <span>Total Amount:</span>
            <span>₹{(order.price * order.quantity).toFixed(2)}</span>
          </div>
        </div>

        <div className="payment-methods-title">Choose Payment App</div>

        <div className="payment-methods-grid">
         {UPI_APPS.map(app => (
  <button
    key={app.id}
    type="button"
    className="upi-app"
    onClick={() => handleUPIRedirect(app, order.price * order.quantity)}
  >
    <div className="upi-app-icon">{app.icon}</div>
    <div className="upi-app-name">{app.name}</div>
  </button>
))}
        </div>

        <div className="payment-info">
          After payment, your order will be sent to admin for approval before preparation begins.
        </div>
      </div>
    </div>
  );
}

function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState(
    user.role === 'ADMIN' ? 'stats' : 'order'
  );

  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [preparingOrders, setPreparingOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [qty, setQty] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [orderMsg, setOrderMsg] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [paymentModal, setPaymentModal] = useState(false);
  const [newItem, setNewItem] = useState({ itemName: '', price: '', category: '' });
  const [adminMsg, setAdminMsg] = useState(null);

  const loadMenu = async () => {
    try {
      const data = await fetchMenu();
      if (data && data.length > 0) setMenuItems(data);
    } catch {}
  };

  const loadCustomerOrders = useCallback(async () => {
    try {
      const data = await trackOrders(user.name);
      setOrders(data || []);
    } catch {
      setOrders([]);
    }
  }, [user.name]);

  const loadAdminData = useCallback(async () => {
    try {
      const [all, pending, preparing, statistics] = await Promise.all([
        fetchOrders(),
        fetchPendingOrders(),
        fetchPreparingOrders(),
        fetchOrderStatistics(),
      ]);
      setOrders(all || []);
      setPendingOrders(pending || []);
      setPreparingOrders(preparing || []);
      setStats(statistics);
    } catch {
      setOrders([]);
      setPendingOrders([]);
      setPreparingOrders([]);
    }
  }, []);

  useEffect(() => {
    loadMenu();
  }, []);

  useEffect(() => {
    if (user.role === 'ADMIN') {
      loadAdminData();
    } else if (activeTab === 'orders' || activeTab === 'track') {
      loadCustomerOrders();
    }
  }, [activeTab, user.role, loadAdminData, loadCustomerOrders]);

  useEffect(() => {
    if (user.role !== 'CUSTOMER') return undefined;
    const interval = setInterval(() => {
      if (activeTab === 'orders' || activeTab === 'track') {
        loadCustomerOrders();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [user.role, activeTab, loadCustomerOrders]);

  useEffect(() => {
    if (user.role !== 'ADMIN') return undefined;
    const interval = setInterval(loadAdminData, 10000);
    return () => clearInterval(interval);
  }, [user.role, loadAdminData]);

  const handlePlaceOrder = () => {
    if (!selectedItem) return;
    setPaymentModal(true);
  };

  const handlePaymentConfirm = async (upiApp) => {
    setPlacing(true);
    try {
      const result = await placeOrder(
        user.name, selectedItem.itemName, qty, selectedItem.price
      );
      if (result === 'Order Placed Successfully') {
        setOrderMsg({
          type: 'success',
          text: `Order placed via ${upiApp.name}! Awaiting admin payment approval.`,
        });
        await loadCustomerOrders();
        const latest = (await trackOrders(user.name))[0];
        if (latest) {
          setReceipt({ ...latest, paymentMethod: upiApp.name });
        }
        setSelectedItem(null);
        setQty(1);
        setPaymentModal(false);
      } else {
        setOrderMsg({ type: 'error', text: result });
      }
    } catch {
      setOrderMsg({ type: 'error', text: 'Backend not reachable on port 9000.' });
    }
    setPlacing(false);
  };

  const handleApprovePayment = async (orderId) => {
    try {
      const result = await approvePayment(orderId);
      setAdminMsg({ type: 'success', text: result });
      loadAdminData();
    } catch {
      setAdminMsg({ type: 'error', text: 'Failed to approve payment.' });
    }
  };

  const handleCompleteOrder = async (orderId) => {
    try {
      const result = await completeOrder(orderId);
      setAdminMsg({ type: 'success', text: result });
      loadAdminData();
    } catch {
      setAdminMsg({ type: 'error', text: 'Failed to complete order.' });
    }
  };

  const handleAddMenuItem = async () => {
    if (!newItem.itemName || !newItem.price || !newItem.category) {
      setAdminMsg({ type: 'error', text: 'All fields are required.' });
      return;
    }
    try {
      const result = await addMenuItem(newItem.itemName, newItem.price, newItem.category);
      setAdminMsg({ type: 'success', text: result });
      setNewItem({ itemName: '', price: '', category: '' });
      loadMenu();
    } catch {
      setAdminMsg({ type: 'error', text: 'Failed to add item.' });
    }
  };

  const handleDeleteMenuItem = async (id) => {
    try {
      await deleteMenuItem(id);
      loadMenu();
    } catch {}
  };

  const activeCustomerOrders = orders.filter(o => o.orderStatus !== 'COMPLETED');

  const tabs = user.role === 'ADMIN'
    ? [
        { id: 'stats', label: 'Dashboard' },
        { id: 'pending', label: `Payments (${pendingOrders.length})` },
        { id: 'preparing', label: `Preparing (${preparingOrders.length})` },
        { id: 'orders', label: 'All Orders' },
        { id: 'admin', label: 'Manage Menu' },
      ]
    : [
        { id: 'order', label: 'Place Order' },
        { id: 'track', label: 'Track Order' },
        { id: 'orders', label: 'Order History' },
      ];

  const renderOrderTable = (orderList, showActions = false, actionType = null) => (
    <div style={{ overflowX: 'auto' }}>
      <table className="orders-table">
        <thead>
          <tr>
            <th>#</th>
            {user.role === 'ADMIN' && <th>Customer</th>}
            <th>Item</th>
            <th>Qty</th>
            <th>Total</th>
            <th>Time</th>
            <th>Status</th>
            {showActions && <th>Action</th>}
            {!showActions && user.role === 'CUSTOMER' && <th>Receipt</th>}
          </tr>
        </thead>
        <tbody>
          {orderList.map((o, i) => {
            const badge = getStatusBadge(o);
            return (
              <tr key={o.id || i}>
                <td className="table-muted">{o.id || i + 1}</td>
                {user.role === 'ADMIN' && <td className="table-bold">{o.customerName}</td>}
                <td>{o.itemName}</td>
                <td>{o.quantity}</td>
                <td className="table-price">
                  ₹{Number(o.totalAmount || (o.price * o.quantity) || 0).toFixed(2)}
                </td>
                <td className="table-muted">{formatOrderTime(o.orderTime)}</td>
                <td><span className={`badge ${badge.className}`}>{badge.label}</span></td>
                {showActions && actionType === 'approve' && (
                  <td>
                    <button className="approve-btn" onClick={() => handleApprovePayment(o.id)}>
                      Approve Payment
                    </button>
                  </td>
                )}
                {showActions && actionType === 'complete' && (
                  <td>
                    <button className="complete-btn" onClick={() => handleCompleteOrder(o.id)}>
                      Mark Served
                    </button>
                  </td>
                )}
                {!showActions && user.role === 'CUSTOMER' && (
                  <td>
                    <button className="receipt-btn" onClick={() => setReceipt(o)}>
                      Receipt
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="dashboard">
      <nav className="dash-nav">
        <div className="dash-logo">MR.<span>Coffee</span></div>
        <div className="dash-user">
          <div className="dash-avatar">{user.name[0].toUpperCase()}</div>
          <span className="dash-username hide-mobile">{user.name}</span>
          <span className="badge badge-success">{user.role}</span>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </nav>

      <div className="dash-tabs">
        {tabs.map(t => (
          <div
            key={t.id}
            className={`dash-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => { setActiveTab(t.id); setAdminMsg(null); }}
          >
            {t.label}
          </div>
        ))}
      </div>

      <div className="dash-content">

        {activeTab === 'order' && (
          <div className="order-grid">
            <div className="panel">
              <div className="panel-header">
                <p className="panel-title">Our Menu</p>
                <p className="panel-subtitle">Tap an item to select it</p>
              </div>
              <div className="panel-body">
                <div className="menu-list">
                  {menuItems.length === 0 && (
                    <div className="empty-state">
                      <div className="icon">☕</div>
                      <p>No menu items yet. Admin needs to add them.</p>
                    </div>
                  )}
                  {menuItems.map(item => (
                    <div
                      key={item.id}
                      className={`menu-item-row ${selectedItem?.id === item.id ? 'selected' : ''}`}
                      onClick={() => { setSelectedItem(item); setQty(1); setOrderMsg(null); }}
                    >
                      <div className="menu-item-info">
                        <span className="menu-item-name">{item.itemName}</span>
                        <span className="menu-item-cat">{item.category}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <span className="menu-item-price">₹{Number(item.price).toFixed(0)}</span>
                        <button
                          className="add-btn"
                          onClick={e => { e.stopPropagation(); setSelectedItem(item); setQty(1); }}
                        >+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <p className="panel-title">Your Order</p>
                <p className="panel-subtitle">Review before placing</p>
              </div>
              <div className="panel-body">
                {selectedItem ? (
                  <div className="order-form">
                    <div className="order-summary-box">
                      <div className="summary-row">
                        <span className="summary-label">Item</span>
                        <span className="summary-val">{selectedItem.itemName}</span>
                      </div>
                      <div className="summary-row">
                        <span className="summary-label">Unit Price</span>
                        <span className="summary-val">₹{Number(selectedItem.price).toFixed(2)}</span>
                      </div>
                      <div className="summary-row">
                        <span className="summary-label">Quantity</span>
                        <div className="qty-row">
                          <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                          <span className="qty-val">{qty}</span>
                          <button className="qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
                        </div>
                      </div>
                      <div className="summary-row total-row">
                        <span>Total</span>
                        <span>₹{(selectedItem.price * qty).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ color: 'var(--muted)', fontSize: '0.78rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        Ordering as
                      </label>
                      <div style={{ padding: '0.6rem 0.8rem', background: 'rgba(245,239,224,0.5)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--espresso)' }}>
                        {user.name}
                      </div>
                    </div>

                    <button
                      className="place-order-btn"
                      onClick={handlePlaceOrder}
                      disabled={placing}
                    >
                      {placing
                        ? 'Processing...'
                        : `Proceed to Payment · ₹${(selectedItem.price * qty).toFixed(2)}`}
                    </button>

                    {orderMsg && (
                      <div className={`form-msg ${orderMsg.type}`}>{orderMsg.text}</div>
                    )}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="icon">☕</div>
                    <p>Select an item from the menu to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'track' && (
          <div className="panel">
            <div className="panel-header">
              <p className="panel-title">Track Your Order</p>
              <p className="panel-subtitle">Live status — Pending → Preparing → Served</p>
            </div>
            <div className="panel-body">
              {activeCustomerOrders.length === 0 ? (
                <div className="empty-state">
                  <div className="icon">📦</div>
                  <p>No active orders to track. Place an order to get started!</p>
                </div>
              ) : (
                <div className="tracker-list">
                  {activeCustomerOrders.map(order => (
                    <OrderTracker key={order.id} order={order} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="panel">
            <div className="panel-header">
              <p className="panel-title">
                {user.role === 'ADMIN' ? 'All Orders' : 'Order History'}
              </p>
              <p className="panel-subtitle">
                {user.role === 'ADMIN'
                  ? 'Complete order history with time and status'
                  : 'Your past and current orders — click Receipt to download'}
              </p>
            </div>
            <div className="panel-body" style={{ padding: orders.length ? 0 : undefined }}>
              {orders.length === 0 ? (
                <div className="empty-state">
                  <div className="icon">📋</div>
                  <p>No orders found</p>
                </div>
              ) : (
                renderOrderTable(orders, false)
              )}
            </div>
          </div>
        )}

        {activeTab === 'stats' && user.role === 'ADMIN' && (
          <div className="stats-section">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{stats?.dailyCount?.today ?? 0}</div>
                <div className="stat-label">Orders Today</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats?.monthlyCount?.currentMonth ?? 0}</div>
                <div className="stat-label">Orders This Month</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats?.totalOrders ?? 0}</div>
                <div className="stat-label">Total Orders</div>
              </div>
              <div className="stat-card highlight">
                <div className="stat-value">{stats?.pendingOrders ?? pendingOrders.length}</div>
                <div className="stat-label">Awaiting Payment Approval</div>
              </div>
            </div>

            {pendingOrders.length > 0 && (
              <div className="panel" style={{ marginTop: '2rem' }}>
                <div className="panel-header">
                  <p className="panel-title">New Payment Requests</p>
                  <p className="panel-subtitle">Customers who completed payment — approve to start preparing</p>
                </div>
                <div className="panel-body" style={{ padding: 0 }}>
                  {renderOrderTable(pendingOrders, true, 'approve')}
                </div>
              </div>
            )}

            {preparingOrders.length > 0 && (
              <div className="panel" style={{ marginTop: '2rem' }}>
                <div className="panel-header">
                  <p className="panel-title">Orders Being Prepared</p>
                  <p className="panel-subtitle">Mark as served when ready for the customer</p>
                </div>
                <div className="panel-body" style={{ padding: 0 }}>
                  {renderOrderTable(preparingOrders, true, 'complete')}
                </div>
              </div>
            )}

            {adminMsg && (
              <div className={`form-msg ${adminMsg.type}`} style={{ marginTop: '1rem' }}>
                {adminMsg.text}
              </div>
            )}
          </div>
        )}

        {activeTab === 'pending' && user.role === 'ADMIN' && (
          <div className="panel">
            <div className="panel-header">
              <p className="panel-title">Payment Requests</p>
              <p className="panel-subtitle">
                Review and approve customer payments before preparation begins
              </p>
            </div>
            <div className="panel-body" style={{ padding: pendingOrders.length ? 0 : undefined }}>
              {pendingOrders.length === 0 ? (
                <div className="empty-state">
                  <div className="icon">✅</div>
                  <p>No pending payment requests</p>
                </div>
              ) : (
                renderOrderTable(pendingOrders, true, 'approve')
              )}
              {adminMsg && (
                <div className={`form-msg ${adminMsg.type}`} style={{ margin: '1rem' }}>
                  {adminMsg.text}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'preparing' && user.role === 'ADMIN' && (
          <div className="panel">
            <div className="panel-header">
              <p className="panel-title">Orders in Preparation</p>
              <p className="panel-subtitle">Mark as served when the order is ready</p>
            </div>
            <div className="panel-body" style={{ padding: preparingOrders.length ? 0 : undefined }}>
              {preparingOrders.length === 0 ? (
                <div className="empty-state">
                  <div className="icon">☕</div>
                  <p>No orders currently being prepared</p>
                </div>
              ) : (
                renderOrderTable(preparingOrders, true, 'complete')
              )}
              {adminMsg && (
                <div className={`form-msg ${adminMsg.type}`} style={{ margin: '1rem' }}>
                  {adminMsg.text}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="admin-grid">
            <div className="panel">
              <div className="panel-header">
                <p className="panel-title">Add Menu Item</p>
                <p className="panel-subtitle">Fill all fields and click Add</p>
              </div>
              <div className="panel-body">
                <div className="admin-form">
                  <input
                    className="admin-input"
                    placeholder="Item name (e.g. Flat White)"
                    value={newItem.itemName}
                    onChange={e => setNewItem(n => ({ ...n, itemName: e.target.value }))}
                  />
                  <input
                    className="admin-input"
                    placeholder="Price in ₹ (e.g. 150)"
                    type="number"
                    value={newItem.price}
                    onChange={e => setNewItem(n => ({ ...n, price: e.target.value }))}
                  />
                  <input
                    className="admin-input"
                    placeholder="Category (e.g. Coffee, Food, Dessert)"
                    value={newItem.category}
                    onChange={e => setNewItem(n => ({ ...n, category: e.target.value }))}
                  />
                  <button className="admin-add-btn" onClick={handleAddMenuItem}>
                    + Add to Menu
                  </button>
                  {adminMsg && (
                    <div className={`form-msg ${adminMsg.type}`}>{adminMsg.text}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <p className="panel-title">Current Menu</p>
                <p className="panel-subtitle">{menuItems.length} items</p>
              </div>
              <div className="panel-body" style={{ padding: 0 }}>
                {menuItems.length === 0 ? (
                  <div className="empty-state">
                    <div className="icon">🍽</div>
                    <p>No menu items yet. Add one on the left.</p>
                  </div>
                ) : (
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menuItems.map(item => (
                        <tr key={item.id}>
                          <td className="table-bold">{item.itemName}</td>
                          <td>{item.category}</td>
                          <td className="table-price">₹{Number(item.price).toFixed(0)}</td>
                          <td>
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteMenuItem(item.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {receipt && (
        <Receipt order={receipt} onClose={() => setReceipt(null)} />
      )}

      {paymentModal && selectedItem && (
        <PaymentModal
          order={{
            itemName: selectedItem.itemName,
            quantity: qty,
            price: selectedItem.price,
          }}
          onClose={() => setPaymentModal(false)}
          onPaymentSelect={handlePaymentConfirm}
        />
      )}
    </div>
  );
}

export default Dashboard;
