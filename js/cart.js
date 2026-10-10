// ===== cart.html : shopping cart + placing an order =====
if (requireLogin()) {
  renderNavbar();
  renderCart();

  document.getElementById('order-form').addEventListener('submit', placeOrder);
}

function renderCart() {
  const cart = getCart();
  const rows = [];
  let total = 0;

  for (const id in cart) {
    const product = getProductById(id);
    if (!product) continue;                      // product was deleted by admin
    const subtotal = product.price * cart[id];
    total += subtotal;
    rows.push(
      '<tr><td>' + escapeHtml(product.name) + '</td>' +
      '<td>' + formatPrice(product.price) + '</td>' +
      '<td><input type="number" class="form-control form-control-sm" min="1" max="' + product.stock + '" value="' + cart[id] + '" onchange="changeQty(\'' + id + '\', this.value)"></td>' +
      '<td>' + formatPrice(subtotal) + '</td>' +
      '<td><button class="btn btn-sm btn-outline-danger" onclick="removeFromCart(\'' + id + '\')">Remove</button></td></tr>'
    );
  }

  if (rows.length === 0) {
    document.getElementById('cart-content').classList.add('d-none');
    document.getElementById('empty-cart').classList.remove('d-none');
    return;
  }
  document.getElementById('cart-content').classList.remove('d-none');
  document.getElementById('empty-cart').classList.add('d-none');
  document.getElementById('cart-rows').innerHTML = rows.join('');
  document.getElementById('cart-total').textContent = formatPrice(total);
}

function changeQty(productId, value) {
  const product = getProductById(productId);
  let qty = parseInt(value);
  if (isNaN(qty) || qty < 1) qty = 1;
  if (qty > product.stock) qty = product.stock;
  const cart = getCart();
  cart[productId] = qty;
  saveCart(cart);
  renderCart();
  renderNavbar();
}

function removeFromCart(productId) {
  const cart = getCart();
  delete cart[productId];
  saveCart(cart);
  renderCart();
  renderNavbar();
}

function placeOrder(e) {
  e.preventDefault();
  clearErrors(this);

  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  let ok = true;

  if (!/^\+?\d{10,14}$/.test(phone)) { showError('phone', 'Enter a valid phone number (10-14 digits)'); ok = false; }
  if (address.length < 10) { showError('address', 'Address must be at least 10 characters'); ok = false; }
  if (!ok) return;

  // build the order items and check the stock again
  const cart = getCart();
  const items = [];
  let total = 0;
  for (const id in cart) {
    const product = getProductById(id);
    if (!product) continue;
    if (cart[id] > product.stock) {
      showMessage('Only ' + product.stock + ' of "' + product.name + '" left in stock', 'danger');
      return;
    }
    items.push({ productId: id, name: product.name, price: product.price, qty: cart[id] });
    total += product.price * cart[id];
  }

  const user = getCurrentUser();
  const orders = getOrders();
  orders.push({
    id: generateId(),
    userId: user.id,
    userName: user.name,
    items: items,
    total: total,
    phone: phone,
    address: address,
    status: 'pending',               // admin will confirm or reject it
    date: new Date().toLocaleString()
  });
  saveData('orders', orders);
  saveCart({});

  location.href = 'orders.html';
}
