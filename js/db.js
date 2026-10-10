// ===== db.js : saving / reading data from localStorage =====
// If you move to Firebase later, you only change this file.

function getData(key, fallback) {
  const text = localStorage.getItem(key);
  if (!text) return fallback;
  try { return JSON.parse(text); } catch (e) { return fallback; }
}

function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ---- users / products / categories / orders ----
function getUsers() { return getData('users', []); }
function getProducts() { return getData('products', []); }
function getCategories() { return getData('categories', []); }
function getOrders() { return getData('orders', []); }

function getProductById(id) {
  return getProducts().find(p => p.id === id);
}

function getCategoryName(id) {
  const cat = getCategories().find(c => c.id === id);
  return cat ? cat.name : 'Uncategorized';
}

// ---- logged in user ----
function getCurrentUser() {
  const id = getData('session', null);
  return getUsers().find(u => u.id === id) || null;
}

// ---- wishlist (saved per user) ----
function getWishlist() {
  const user = getCurrentUser();
  return user ? getData('wish_' + user.id, []) : [];
}
function saveWishlist(list) {
  saveData('wish_' + getCurrentUser().id, list);
}

// ---- cart (saved per user) : { productId: quantity } ----
function getCart() {
  const user = getCurrentUser();
  return user ? getData('cart_' + user.id, {}) : {};
}
function saveCart(cart) {
  saveData('cart_' + getCurrentUser().id, cart);
}
function getCartCount() {
  let total = 0;
  const cart = getCart();
  for (const id in cart) total += cart[id];
  return total;
}

// ---- first run: create default admin, categories and products ----
function seedData() {
  if (getData('seeded', false)) return;

  saveData('users', [
    { id: 'u-admin', name: 'Main Admin', email: 'admin@shop.com', password: 'Admin123', role: 'admin' }
  ]);

  saveData('categories', [
    { id: 'c1', name: 'Clothing' },
    { id: 'c2', name: 'Electronics' },
    { id: 'c3', name: 'Jewelery' }
  ]);

  const img = 'https://fakestoreapi.com/img/';
  saveData('products', [
    { id: 'p1', name: 'Fjallraven Backpack', image: img + '81fPKd-2AYL._AC_SL1500_.jpg', categoryId: 'c1', price: 109.95, stock: 12, description: 'Your perfect pack for everyday use and walks in the forest. Fits a 15 inch laptop.' },
    { id: 'p2', name: 'Slim Fit T-Shirt', image: img + '71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_t.png', categoryId: 'c1', price: 22.3, stock: 30, description: 'Slim-fitting style, contrast raglan long sleeve, three-button henley placket.' },
    { id: 'p3', name: 'Winter Jacket', image: img + '71li-ujtlUL._AC_UX679_.jpg', categoryId: 'c1', price: 56.99, stock: 8, description: 'Great outerwear jackets for spring, autumn and winter. Warm and lightweight.' },
    { id: 'p4', name: 'Wireless Headphones', image: '', categoryId: 'c2', price: 79.5, stock: 15, description: 'Over-ear bluetooth headphones with noise isolation and 30 hours of battery.' },
    { id: 'p5', name: 'Silver Ring', image: '', categoryId: 'c3', price: 168, stock: 0, description: 'Classic sterling silver ring, a timeless gift for any occasion.' }
  ]);

  saveData('orders', []);
  saveData('seeded', true);
}

seedData();
