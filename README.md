# ShopHub – E-Commerce (HTML + CSS + JavaScript + Bootstrap)

Open `index.html` in the browser (double-click works, no server needed).
Bootstrap 5.3.3 is included in `vendor/`.

Demo admin: `admin@shop.com` / `Admin123`

## Pages (each page has its own JS file)
| Page | JS file | Who |
|---|---|---|
| index.html | shop.js | everyone (products + filters) |
| login.html / register.html | login.js / register.js | guests |
| wishlist.html, cart.html, orders.html | wishlist.js, cart.js, orders.js | customers |
| admin-orders.html | admin-orders.js | admin (confirm / reject orders) |
| admin-products.html | admin-products.js | admin (products CRUD) |
| admin-categories.html | admin-categories.js | admin (categories CRUD) |
| admin-admins.html | admin-admins.js | admin (add admins) |

Shared files: `js/db.js` (localStorage), `js/utils.js` (navbar, validation, helpers), `css/style.css`.

Data is stored in localStorage. To reset: DevTools > Application > Local Storage > Clear.

## Push to GitHub
    git init && git add . && git commit -m "E-commerce project"
    git branch -M main
    git remote add origin <your-repo-url>
    git push -u origin main
