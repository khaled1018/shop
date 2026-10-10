// ===== index.html : product list with filters =====
const currentUser = getCurrentUser();
if (currentUser && currentUser.role === 'admin') {
  location.href = 'admin-orders.html';
} else {
  renderNavbar();
  fillCategoryFilter();
  renderProducts();

  // re-filter whenever the user types or changes a filter
  ['search', 'category', 'maxPrice', 'inStock'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', renderProducts);
  });
}

function fillCategoryFilter() {
  const select = document.getElementById('category');
  getCategories().forEach(function (c) {
    select.innerHTML += '<option value="' + c.id + '">' + escapeHtml(c.name) + '</option>';
  });
}

function renderProducts() {
  const search = document.getElementById('search').value.trim().toLowerCase();
  const category = document.getElementById('category').value;
  const maxPrice = document.getElementById('maxPrice').value;
  const onlyInStock = document.getElementById('inStock').checked;

  const list = getProducts().filter(function (p) {
    if (search && !p.name.toLowerCase().includes(search)) return false;
    if (category && p.categoryId !== category) return false;
    if (maxPrice && p.price > Number(maxPrice)) return false;
    if (onlyInStock && p.stock <= 0) return false;
    return true;
  });

  const grid = document.getElementById('products');
  if (list.length === 0) {
    grid.innerHTML = '<p class="text-muted">No products match your filters.</p>';
    return;
  }
  grid.innerHTML = list.map(createProductCard).join('');
}

function refreshPage() { renderProducts(); }
