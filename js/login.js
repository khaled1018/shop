// ===== login.html =====
if (!redirectIfLoggedIn()) {
  renderNavbar();

  document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors(this);

    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    let ok = true;

    if (!isValidEmail(email)) { showError('email', 'Enter a valid email (e.g. name@mail.com)'); ok = false; }
    if (password === '') { showError('password', 'Password is required'); ok = false; }
    if (!ok) return;

    const user = getUsers().find(function (u) { return u.email === email && u.password === password; });
    if (!user) { showMessage('Invalid email or password', 'danger'); return; }

    saveData('session', user.id);
    location.href = user.role === 'admin' ? 'admin-orders.html' : 'index.html';
  });
}
