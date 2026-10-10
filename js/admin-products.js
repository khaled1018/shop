// ===== admin-products.html : products CRUD =====
let editingId = null;      // null = adding a new product, otherwise the id being edited

if (requireAdmin()) {
  renderNavbar();
  fillCategorySelect();
  renderTable();
  document.getElementById('product-form').addEventListener('submit', saveProduct);
  document.getElementById('import-btn').addEventListener('click', importFromFakeStore);
  document.getElementById('cancel-btn').addEventListener('click', resetForm);
}

function fillCategorySelect() {
  const select = document.getElementById('categoryId');
  select.innerHTML = '<option value="">Choose...</option>';
  getCategories().forEach(function (c) {
    select.innerHTML += '<option value="' + c.id + '">' + escapeHtml(c.name) + '</option>';
  });
}

function renderTable() {
  let html = '';
  getProducts().forEach(function (p) {
    html += '<tr><td><img class="thumb" src="' + escapeHtml(p.image || NO_IMAGE) + '" onerror="this.onerror=null;this.src=NO_IMAGE"></td>' +
            '<td>' + p.id + '</td><td>' + escapeHtml(p.name) + '</td><td>' + escapeHtml(getCategoryName(p.categoryId)) + '</td>' +
            '<td>' + formatPrice(p.price) + '</td><td>' + p.stock + '</td>' +
            '<td class="text-nowrap"><button class="btn btn-sm btn-outline-primary me-1" onclick="editProduct(\'' + p.id + '\')">Edit</button>' +
            '<button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(\'' + p.id + '\')">Delete</button></td></tr>';
  });
  document.getElementById('products-table').innerHTML = html;
}

function saveProduct(e) {
  e.preventDefault();
  clearErrors(this);

  const name = document.getElementById('name').value.trim();
  const image = document.getElementById('image').value.trim();
  const categoryId = document.getElementById('categoryId').value;
  const price = document.getElementById('price').value;
  const stock = document.getElementById('stock').value;
  const description = document.getElementById('description').value.trim();
  let ok = true;

  if (name.length < 3) { showError('name', 'Name must be at least 3 characters'); ok = false; }
  if (!/^https?:\/\/\S+$/.test(image)) { showError('image', 'Enter a valid image URL starting with http(s)://'); ok = false; }
  if (categoryId === '') { showError('categoryId', 'Choose a category'); ok = false; }
  if (!(Number(price) > 0)) { showError('price', 'Price must be a number greater than 0'); ok = false; }
  if (!/^\d+$/.test(stock)) { showError('stock', 'Stock must be a whole number (0 or more)'); ok = false; }
  if (description.length < 10) { showError('description', 'Description must be at least 10 characters'); ok = false; }
  if (!ok) return;

  const product = {
    id: editingId || generateId(),
    name: name, image: image, categoryId: categoryId,
    price: Number(price), stock: Number(stock), description: description
  };

  const products = getProducts();
  const index = products.findIndex(function (p) { return p.id === editingId; });
  if (index >= 0) products[index] = product;     // update
  else products.push(product);                    // create
  saveData('products', products);

  showMessage('Product saved');
  resetForm();
  renderTable();
}

function editProduct(id) {
  const p = getProductById(id);
  editingId = id;
  document.getElementById('form-title').textContent = 'Edit product';
  document.getElementById('save-btn').textContent = 'Update';
  document.getElementById('cancel-btn').classList.remove('d-none');
  document.getElementById('name').value = p.name;
  document.getElementById('image').value = p.image;
  document.getElementById('categoryId').value = p.categoryId;
  document.getElementById('price').value = p.price;
  document.getElementById('stock').value = p.stock;
  document.getElementById('description').value = p.description;
  window.scrollTo(0, 0);
}

function resetForm() {
  editingId = null;
  const form = document.getElementById('product-form');
  form.reset();
  clearErrors(form);
  document.getElementById('form-title').textContent = 'Add product';
  document.getElementById('save-btn').textContent = 'Add';
  document.getElementById('cancel-btn').classList.add('d-none');
}

function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  saveData('products', getProducts().filter(function (p) { return p.id !== id; }));
  showMessage('Product deleted');
  renderTable();
}

// uses the free fake API https://fakestoreapi.com
async function importFromFakeStore() {
  try {
    const response = await fetch('https://fakestoreapi.com/products');
    const data = await response.json();
    const categories = getCategories();
    const products = getProducts();

    data.forEach(function (item) {
      if (products.some(function (p) { return p.name === item.title; })) return;   // skip duplicates

      let category = categories.find(function (c) { return c.name.toLowerCase() === item.category.toLowerCase(); });
      if (!category) {
        category = { id: generateId(), name: item.category };
        categories.push(category);
      }
      products.push({
        id: generateId(), name: item.title, image: item.image, categoryId: category.id,
        price: item.price, stock: 5 + Math.floor(Math.random() * 25), description: item.description
      });
    });

    saveData('categories', categories);
    saveData('products', products);
    fillCategorySelect();
    renderTable();
    showMessage('Products imported');
  } catch (error) {
    showMessage('Could not reach FakeStore API', 'danger');
  }
}
