// Backend base URL. Override in Vercel with REACT_APP_API_URL if needed.
const BASE_URL = "http://localhost:8080/api";
// ======================
// AUTH APIs
// ======================

export const loginUser = async (email, password) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  return res.text();
};

export const loginAdmin = async (email, password) => {
  const res = await fetch(`${BASE_URL}/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  return res.text();
};

export const registerUser = async (name, email, password) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });

  return res.text();
};

// ======================
// MENU APIs
// ======================

export const fetchMenu = async () => {
  const res = await fetch(`${BASE_URL}/menu/all`);
  return res.json();
};

export const addMenuItem = async (itemName, price, category) => {
  const res = await fetch(`${BASE_URL}/menu/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      itemName,
      price: Number(price),
      category,
    }),
  });

  return res.text();
};

export const deleteMenuItem = async (id) => {
  const res = await fetch(`${BASE_URL}/menu/delete/${id}`, {
    method: 'DELETE',
  });

  return res.text();
};

// ======================
// ORDER APIs
// ======================

export const placeOrder = async (
  customerName,
  itemName,
  quantity,
  price
) => {
  const res = await fetch(`${BASE_URL}/order/place`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customerName,
      itemName,
      quantity,
      price,
      totalAmount: quantity * price,
    }),
  });

  return res.text();
};

export const fetchOrders = async () => {
  const res = await fetch(`${BASE_URL}/order/all`);
  return res.json();
};

export const trackOrders = async (customerName) => {
  const res = await fetch(
    `${BASE_URL}/order/track/${encodeURIComponent(customerName)}`
  );

  return res.json();
};

// ======================
// ADMIN APIs
// ======================

export const fetchPendingOrders = async () => {
  const res = await fetch(`${BASE_URL}/admin/pending-orders`);
  return res.json();
};

export const fetchPreparingOrders = async () => {
  const res = await fetch(`${BASE_URL}/admin/preparing-orders`);
  return res.json();
};

export const approvePayment = async (orderId) => {
  const res = await fetch(
    `${BASE_URL}/admin/approve-payment/${orderId}`,
    {
      method: 'PUT',
    }
  );

  return res.text();
};

export const completeOrder = async (orderId) => {
  const res = await fetch(
    `${BASE_URL}/admin/complete-order/${orderId}`,
    {
      method: 'PUT',
    }
  );

  return res.text();
};

export const fetchOrderStatistics = async () => {
  const res = await fetch(`${BASE_URL}/admin/statistics`);
  return res.json();
};