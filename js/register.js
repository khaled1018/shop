// ===== register.html =====
if (!redirectIfLoggedIn()) {
  renderNavbar();

  document.getElementById('register-form').addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors(this);

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirm').value;
    let ok = true;

    if (name.length < 3) { showError('name', 'Name must be at least 3 characters'); ok = false; }
    if (!isValidEmail(email)) { showError('email', 'Enter a valid email (e.g. name@mail.com)'); ok = false; }
    else if (emailExists(email)) { showError('email', 'This email is already registered'); ok = false; }
    if (!isValidPassword(password)) { showError('password', 'Password needs 6+ characters with letters and numbers'); ok = false; }
    if (confirm !== password) { showError('confirm', 'Passwords do not match'); ok = false; }
    if (!ok) return;

    const user = { id: generateId(), name: name, email: email, password: password, role: 'customer' };
    const users = getUsers();
    users.push(user);
    saveData('users', users);
    saveData('session', user.id);       // log the new user in
    location.href = 'index.html';
  });
}
