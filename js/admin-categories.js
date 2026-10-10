// ===== admin-categories.html : categories CRUD =====
let editingId = null;

if (requireAdmin()) {
  renderNavbar();
  renderTable();
  document.getElementById('category-form').addEventListener('submit', saveCategory);
  document.getElementById('cancel-btn').addEventListener('click', resetForm);
}

function renderTable() {
  let html = '';
  getCategories().forEach(function (c) {
    const count = getProducts().filter(function (p) { return p.categoryId === c.id; }).length;
    html += '<tr><td>' + c.id + '</td><td>' + escapeHtml(c.name) + '</td><td>' + count + '</td>' +
            '<td class="text-nowrap"><button class="btn btn-sm btn-outline-primary me-1" onclick="editCategory(\'' + c.id + '\')">Edit</button>' +
            '<button class="btn btn-sm btn-outline-danger" onclick="deleteCategory(\'' + c.id + '\')">Delete</button></td></tr>';
  });
  document.getElementById('categories-table').innerHTML = html;
}

function saveCategory(e) {
  e.preventDefault();
  clearErrors(this);

  const name = document.getElementById('name').value.trim();
  const categories = getCategories();

  if (name.length < 2) { showError('name', 'Category name must be at least 2 characters'); return; }
  const duplicate = categories.some(function (c) { return c.name.toLowerCase() === name.toLowerCase() && c.id !== editingId; });
  if (duplicate) { showError('name', 'Category already exists'); return; }

  if (editingId) {
    categories.find(function (c) { return c.id === editingId; }).name = name;
  } else {
    categories.push({ id: generateId(), name: name });
  }
  saveData('categories', categories);

  showMessage('Category saved');
  resetForm();
  renderTable();
}

function editCategory(id) {
  const category = getCategories().find(function (c) { return c.id === id; });
  editingId = id;
  document.getElementById('form-title').textContent = 'Edit category';
  document.getElementById('save-btn').textContent = 'Update';
  document.getElementById('cancel-btn').classList.remove('d-none');
  document.getElementById('name').value = category.name;
}

function resetForm() {
  editingId = null;
  const form = document.getElementById('category-form');
  form.reset();
  clearErrors(form);
  document.getElementById('form-title').textContent = 'Add category';
  document.getElementById('save-btn').textContent = 'Add';
  document.getElementById('cancel-btn').classList.add('d-none');
}

function deleteCategory(id) {
  const used = getProducts().some(function (p) { return p.categoryId === id; });
  if (used) { showMessage('Cannot delete a category that still has products', 'danger'); return; }
  if (!confirm('Delete this category?')) return;
  saveData('categories', getCategories().filter(function (c) { return c.id !== id; }));
  showMessage('Category deleted');
  renderTable();
}
