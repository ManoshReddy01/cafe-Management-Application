import './Receipt.css';

function Receipt({ order, onClose }) {
  const subtotal = order.totalAmount || (order.price * order.quantity) || 0;
  const gst = subtotal * 0.05;
  const grandTotal = subtotal + gst;
  const orderDate = order.orderTime ? new Date(order.orderTime) : new Date();

  // Creates a plain-text receipt and downloads it as a .txt file
  const downloadReceipt = () => {
    const lines = [
      '========================================',
      '             MR. COFFEE',
      '    Banjara Hills, Hyderabad - 500034',
      '       Tel: +91 98765 43210',
      '========================================',
      `Date : ${orderDate.toLocaleDateString('en-IN')}`,
      `Time : ${orderDate.toLocaleTimeString('en-IN')}`,
      `Order: #ORD-${order.id || Math.floor(Math.random() * 9000 + 1000)}`,
      '----------------------------------------',
      `Customer: ${order.customerName}`,
      '----------------------------------------',
      'ITEM                    QTY      PRICE',
      '----------------------------------------',
      `${order.itemName.padEnd(24)}${String(order.quantity).padEnd(9)}Rs.${(order.price * order.quantity).toFixed(2)}`,
      '----------------------------------------',
      `Subtotal :              Rs.${subtotal.toFixed(2)}`,
      `GST (5%) :              Rs.${gst.toFixed(2)}`,
      '========================================',
      `TOTAL    :              Rs.${grandTotal.toFixed(2)}`,
      '========================================',
      '   Thank you for choosing MR. Coffee!',
      '      "Every sip tells a story."',
      '========================================',
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MrCoffee_Receipt_${order.id || Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Close if user clicks the dark overlay background
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="receipt-modal">
        {/* Header */}
        <div className="receipt-header">
          <div className="receipt-logo">MR.<span>Coffee</span></div>
          <p className="receipt-address">Banjara Hills, Hyderabad · +91 98765 43210</p>
          <p className="receipt-date">
            {orderDate.toLocaleDateString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
            {' · '}
            {orderDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Order Meta */}
        <div className="receipt-meta">
          <div className="receipt-row">
            <span>Customer</span>
            <span className="receipt-val">{order.customerName}</span>
          </div>
          <div className="receipt-row">
            <span>Order ID</span>
            <span>#ORD-{order.id || '----'}</span>
          </div>
        </div>

        <hr className="receipt-divider" />

        {/* Items */}
        <div className="receipt-items">
          <div className="receipt-row">
            <span className="receipt-item-name">
              {order.itemName} × {order.quantity}
            </span>
            <span>₹{(order.price * order.quantity).toFixed(2)}</span>
          </div>
        </div>

        <hr className="receipt-divider" />

        {/* Totals */}
        <div className="receipt-totals">
          <div className="receipt-row muted">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="receipt-row muted">
            <span>GST (5%)</span>
            <span>₹{gst.toFixed(2)}</span>
          </div>
        </div>

        <hr className="receipt-divider" />

        <div className="receipt-grand-total">
          <span>Total</span>
          <span>₹{grandTotal.toFixed(2)}</span>
        </div>

        <p className="receipt-thank-you">
          "Every sip tells a story." — Thank you for visiting!
        </p>

        {/* Action Buttons */}
        <div className="receipt-actions">
          <button className="receipt-close-btn" onClick={onClose}>
            Close
          </button>
          <button className="receipt-download-btn" onClick={downloadReceipt}>
            ⬇ Download Receipt
          </button>
        </div>
      </div>
    </div>
  );
}

export default Receipt;