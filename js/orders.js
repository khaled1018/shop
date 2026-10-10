// ===== orders.html : customer's previous orders =====
const user = requireLogin();
if (user) {
  renderNavbar();
  renderOrders();
}

function renderOrders() {
  const myOrders = getOrders().filter(function (o) { return o.userId === user.id; }).reverse();
  const box = document.getElementById('orders');

  if (myOrders.length === 0) {
    box.innerHTML = '<p class="text-muted">No orders yet.</p>';
    return;
  }

  let html = '<div class="table-responsive"><table class="table bg-white align-middle"><thead><tr>' +
             '<th>Date</th><th>Items</th><th>Total</th><th>Status</th><th></th></tr></thead><tbody>';

  myOrders.forEach(function (o) {
    const items = o.items.map(function (i) { return escapeHtml(i.name) + ' × ' + i.qty; }).join('<br>');
    const returnButton = o.status === 'confirmed'
      ? '<button class="btn btn-sm btn-outline-secondary" onclick="returnOrder(\'' + o.id + '\')">Return order</button>'
      : '';
    html += '<tr><td>' + escapeHtml(o.date) + '</td><td>' + items + '</td><td>' + formatPrice(o.total) + '</td>' +
            '<td>' + statusBadge(o.status) + '</td><td>' + returnButton + '</td></tr>';
  });

  box.innerHTML = html + '</tbody></table></div>';
}

// bonus feature: return a confirmed order and put the items back in stock
function returnOrder(orderId) {
  const orders = getOrders();
  const order = orders.find(function (o) { return o.id === orderId; });
  const products = getProducts();

  order.items.forEach(function (item) {
    const product = products.find(function (p) { return p.id === item.productId; });
    if (product) product.stock += item.qty;
  });
  order.status = 'returned';

  saveData('products', products);
  saveData('orders', orders);
  showMessage('Order returned');
  renderOrders();
}
