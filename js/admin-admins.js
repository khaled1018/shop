// ===== admin-admins.html : add another admin =====
if (requireAdmin()) {
  renderNavbar();
  renderAdmins();
  document.getElementById('admin-form').addEventListener('submit', addAdmin);
}

function renderAdmins() {
  let html = '';
  getUsers().filter(function (u) { return u.role === 'admin'; }).forEach(function (u) {
    html += '<tr><td>' + escapeHtml(u.name) + '</td><td>' + escapeHtml(u.email) + '</td></tr>';
  });
  document.getElementById('admins-table').innerHTML = html;
}

function addAdmin(e) {
  e.preventDefault();
  clearErrors(this);

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;
  let ok = true;

  if (name.length < 3) { showError('name', 'Name must be at least 3 characters'); ok = false; }
  if (!isValidEmail(email)) { showError('email', 'Enter a valid email (e.g. name@mail.com)'); ok = false; }
  else if (emailExists(email)) { showError('email', 'This email is already registered'); ok = false; }
  if (!isValidPassword(password)) { showError('password', 'Password needs 6+ characters with letters and numbers'); ok = false; }
  if (!ok) return;

  const users = getUsers();
  users.push({ id: generateId(), name: name, email: email, password: password, role: 'admin' });
  saveData('users', users);

  this.reset();
  showMessage('Admin added');
  renderAdmins();
}
