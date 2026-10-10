// ===== utils.js : helpers used by every page =====

// picture shown when an image URL is empty or broken
const NO_IMAGE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect width='100%' height='100%' fill='%23e9ecef'/><text x='50%' y='50%' fill='%236c757d' text-anchor='middle' dy='.3em'>No image</text></svg>";

// ---------- small helpers ----------
function escapeHtml(text) {
  return String(text == null ? '' : text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function formatPrice(n) {
  return '$' + Number(n).toFixed(2);
}

function statusBadge(status) {
  const colors = { pending: 'warning', confirmed: 'success', rejected: 'danger', returned: 'secondary' };
  return '<span class="badge bg-' + colors[status] + '">' + status + '</span>';
}

// green/red message box at the top right
function showMessage(text, type) {
  type = type || 'success';
  const box = document.getElementById('message');
  box.innerHTML = '<div class="alert alert-' + type + ' alert-dismissible shadow">' +
    escapeHtml(text) + '<button class="btn-close" data-bs-dismiss="alert"></button></div>';
  setTimeout(function () { box.innerHTML = ''; }, 4000);
}

// ---------- form validation ----------
// every input has an id, and under it a div with id "<id>-error"
function showError(fieldId, message) {
  document.getElementById(fieldId).classList.add('is-invalid');
  document.getElementById(fieldId + '-error').textContent = message;
}

function clearErrors(form) {
  form.querySelectorAll('.is-invalid').forEach(function (el) { el.classList.remove('is-invalid'); });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// at least 6 characters, with a letter and a number
function isValidPassword(password) {
  return /^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password);
}

function emailExists(email) {
  return getUsers().some(function (u) { return u.email === email; });
}

// ---------- page protection ----------
function logout() {
  saveData('session', null);
  location.href = 'login.html';
}

// customer pages (wishlist, cart, orders)
function requireLogin() {
  const user = getCurrentUser();
  if (!user) { location.href = 'login.html'; return null; }
  if (user.role === 'admin') { location.href = 'admin-orders.html'; return null; }
  return user;
}

// admin pages
function requireAdmin() {
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') { location.href = 'login.html'; return null; }
  return user;
}

// login / register pages
function redirectIfLoggedIn() {
  const user = getCurrentUser();
  if (user) {
    location.href = user.role === 'admin' ? 'admin-orders.html' : 'index.html';
    return true;
  }
  return false;
}

// ---------- navbar (same on every page) ----------
function renderNavbar() {
  const user = getCurrentUser();
  const page = location.pathname.split('/').pop() || 'index.html';

  function link(href, text) {
    const active = page === href ? 'active' : '';
    return '<li class="nav-item"><a class="nav-link ' + active + '" href="' + href + '">' + text + '</a></li>';
  }

  let links = '';
  let right = '';

  if (user && user.role === 'admin') {
    links = link('admin-orders.html', 'Orders') + link('admin-products.html', 'Products') +
            link('admin-categories.html', 'Categories') + link('admin-admins.html', 'Admins');
  } else {
    links = link('index.html', 'Shop');
    if (user) {
      links += link('wishlist.html', 'Wishlist (' + getWishlist().length + ')') +
               link('cart.html', 'Cart (' + getCartCount() + ')') +
               link('orders.html', 'My Orders');
    }
  }

  if (user) {
    right = '<span class="navbar-text me-3">' + escapeHtml(user.name) + ' <span class="badge bg-secondary">' + user.role + '</span></span>' +
            '<button class="btn btn-outline-light btn-sm" onclick="logout()">Logout</button>';
  } else {
    right = '<a class="btn btn-outline-light btn-sm me-2" href="login.html">Login</a>' +
            '<a class="btn btn-light btn-sm" href="register.html">Register</a>';
  }

  document.getElementById('navbar').innerHTML =
    '<nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top"><div class="container">' +
    '<a class="navbar-brand fw-bold" href="index.html">ShopHub</a>' +
    '<button class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#menu"><span class="navbar-toggler-icon"></span></button>' +
    '<div class="collapse navbar-collapse" id="menu"><ul class="navbar-nav me-auto">' + links + '</ul><div>' + right + '</div></div>' +
    '</div></nav>';
}

// ---------- product card + cart/wishlist buttons (used by shop and wishlist pages) ----------
function createProductCard(p) {
  const inWishlist = getWishlist().includes(p.id);
  const stockText = p.stock > 0
    ? '<small class="text-success">' + p.stock + ' in stock</small>'
    : '<small class="text-danger">Out of stock</small>';
  const shortDescription = p.description.length > 80 ? p.description.slice(0, 80) + '…' : p.description;

  return '<div class="col-6 col-md-4 col-lg-3"><div class="card h-100 shadow-sm">' +
    '<img src="' + escapeHtml(p.image || NO_IMAGE) + '" class="card-img-top p-img" alt="" onerror="this.onerror=null;this.src=NO_IMAGE">' +
    '<div class="card-body d-flex flex-column">' +
      '<span class="badge bg-light text-dark border align-self-start mb-1">' + escapeHtml(getCategoryName(p.categoryId)) + '</span>' +
      '<h6>' + escapeHtml(p.name) + '</h6>' +
      '<p class="small text-muted flex-grow-1">' + escapeHtml(shortDescription) + '</p>' +
      '<div class="d-flex justify-content-between align-items-center"><strong>' + formatPrice(p.price) + '</strong>' + stockText + '</div>' +
    '</div>' +
    '<div class="card-footer bg-white d-flex gap-2">' +
      '<button class="btn btn-primary btn-sm flex-grow-1" onclick="addToCart(\'' + p.id + '\')" ' + (p.stock > 0 ? '' : 'disabled') + '>Add to cart</button>' +
      '<button class="btn btn-outline-danger btn-sm" onclick="toggleWishlist(\'' + p.id + '\')">' + (inWishlist ? '♥' : '♡') + '</button>' +
    '</div></div></div>';
}

function addToCart(productId) {
  if (!getCurrentUser()) { location.href = 'login.html'; return; }
  const product = getProductById(productId);
  const cart = getCart();
  const newQty = (cart[productId] || 0) + 1;
  cart[productId] = Math.min(newQty, product.stock);   // never more than the stock
  saveCart(cart);
  showMessage('Added to cart');
  renderNavbar();
}

function toggleWishlist(productId) {
  if (!getCurrentUser()) { location.href = 'login.html'; return; }
  let list = getWishlist();
  if (list.includes(productId)) {
    list = list.filter(function (id) { return id !== productId; });
  } else {
    list.push(productId);
  }
  saveWishlist(list);
  renderNavbar();
  // each page that shows product cards defines its own refreshPage()
  if (typeof refreshPage === 'function') refreshPage();
}
