// ===== admin-orders.html : see all orders, confirm / reject =====
if (requireAdmin()) {
  renderNavbar();
  renderOrders();
}

function renderOrders() {
  const orders = getOrders().slice().reverse();
  const box = document.getElementById('orders');

  if (orders.length === 0) {
    box.innerHTML = '<p class="text-muted">No orders yet.</p>';
    return;
  }

  let html = '<div class="table-responsive"><table class="table bg-white align-middle"><thead><tr>' +
             '<th>Date</th><th>Customer</th><th>Items</th><th>Contact</th><th>Total</th><th>Status</th><th></th></tr></thead><tbody>';

  orders.forEach(function (o) {
    const items = o.items.map(function (i) { return escapeHtml(i.name) + ' × ' + i.qty; }).join('<br>');
    let buttons = '';
    if (o.status === 'pending') {
      buttons = '<button class="btn btn-sm btn-success me-1" onclick="confirmOrder(\'' + o.id + '\')">Confirm</button>' +
                '<button class="btn btn-sm btn-danger" onclick="rejectOrder(\'' + o.id + '\')">Reject</button>';
    }
    html += '<tr><td>' + escapeHtml(o.date) + '</td><td>' + escapeHtml(o.userName) + '</td><td>' + items + '</td>' +
            '<td class="small">' + escapeHtml(o.phone) + '<br>' + escapeHtml(o.address) + '</td>' +
            '<td>' + formatPrice(o.total) + '</td><td>' + statusBadge(o.status) + '</td>' +
            '<td class="text-nowrap">' + buttons + '</td></tr>';
  });

  box.innerHTML = html + '</tbody></table></div>';
}

function confirmOrder(orderId) {
  const orders = getOrders();
  const order = orders.find(function (o) { return o.id === orderId; });
  const products = getProducts();

  // make sure there is enough stock for every item
  for (let i = 0; i < order.items.length; i++) {
    const item = order.items[i];
    const product = products.find(function (p) { return p.id === item.productId; });
    if (!product || product.stock < item.qty) {
      showMessage('Not enough stock for "' + item.name + '"', 'danger');
      return;
    }
  }

  // reduce the stock
  order.items.forEach(function (item) {
    products.find(function (p) { return p.id === item.productId; }).stock -= item.qty;
  });
  order.status = 'confirmed';

  saveData('products', products);
  saveData('orders', orders);
  showMessage('Order confirmed');
  renderOrders();
}

function rejectOrder(orderId) {
  const orders = getOrders();
  orders.find(function (o) { return o.id === orderId; }).status = 'rejected';
  saveData('orders', orders);
  showMessage('Order rejected', 'warning');
  renderOrders();
}
