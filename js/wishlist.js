// ===== wishlist.html =====
if (requireLogin()) {
  renderNavbar();
  renderWishlist();
}

function renderWishlist() {
  const products = getWishlist().map(getProductById).filter(function (p) { return p; });
  const box = document.getElementById('wishlist');
  if (products.length === 0) {
    box.innerHTML = '<p class="text-muted">Your wishlist is empty.</p>';
    return;
  }
  box.innerHTML = products.map(createProductCard).join('');
}

function refreshPage() { renderWishlist(); }
