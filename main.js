// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.getElementById('mobile-menu');
  const menu = document.getElementById('nav-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('active');
    });
  }

  // Notification bell functionality - FULL SCREEN MODE
  const bell = document.getElementById('notification-bell');
  if (bell) {
    bell.addEventListener('click', function(e) {
      e.stopPropagation();
      showFullScreenNotifications();
    });
  }

  // Update notification badge
  updateNotificationBadge();

  // Load gallery if on gallery page
  if (document.getElementById('gallery-grid')) {
    loadGallery();
  }

  // Load recent products on homepage (last 2)
  if (document.getElementById('recent-products')) {
    loadRecentProducts();
  }
});

function updateNotificationBadge() {
  const notifications = loadNotifications();
  const badge = document.getElementById('notification-badge');
  if (badge) {
    if (notifications.length > 0) {
      badge.textContent = notifications.length;
      badge.style.display = 'inline';
    } else {
      badge.style.display = 'none';
    }
  }
}

// Full screen notification modal
function showFullScreenNotifications() {
  let modal = document.getElementById('notification-modal-full');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'notification-modal-full';
    modal.className = 'notification-modal-full';
    modal.innerHTML = `
      <div class="modal-content-full">
        <span class="close-modal-full">&times;</span>
        <h2 style="margin-bottom: 1.5rem;">All Notifications</h2>
        <div id="notifications-full-list"></div>
      </div>
    `;
    document.body.appendChild(modal);

    document.querySelector('.close-modal-full').addEventListener('click', function() {
      modal.classList.remove('show');
    });

    window.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.classList.remove('show');
      }
    });
  }

  const notifications = loadNotifications();
  const listContainer = document.getElementById('notifications-full-list');
  listContainer.innerHTML = '';

  if (notifications.length === 0) {
    listContainer.innerHTML = '<div class="no-notifications-full">No notifications available</div>';
  } else {
    notifications.slice().reverse().forEach(n => {
      const item = document.createElement('div');
      item.className = 'notification-full-item';
      let imgHtml = '';
      if (n.image) {
        imgHtml = `<img src="${n.image}" alt="notification image">`;
      }
      item.innerHTML = `
        <h3>${n.title}</h3>
        <p>${n.message}</p>
        ${imgHtml}
        <small>${new Date(n.date).toLocaleString()}</small>
      `;
      listContainer.appendChild(item);
    });
  }

  modal.classList.add('show');
}

// Load recent products on homepage (last 2)
function loadRecentProducts() {
  const products = loadProducts();
  const recentProducts = products.slice(-2).reverse();
  const container = document.getElementById('recent-products');
  container.innerHTML = '';

  recentProducts.forEach(prod => {
    container.innerHTML += `
      <div class="product-card" onclick="location.href='product.html?name=${encodeURIComponent(prod.name)}'">
        <div class="product-image">
          <img src="${prod.images && prod.images.length > 0 ? prod.images[0] : 'https://via.placeholder.com/300x300?text=No+Image'}" alt="${prod.name}">
        </div>
        <div class="product-info">
          <h3>${prod.name}</h3>
          <p class="product-price">₦${prod.price}</p>
        </div>
      </div>
    `;
  });
}

// Gallery page with search and grouping
function loadGallery(searchTerm = '') {
  const products = loadProducts();
  const groups = groupProductsByName(products);
  const gallery = document.getElementById('gallery-grid');
  gallery.innerHTML = '';

  const groupNames = Object.keys(groups).filter(name => 
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  groupNames.forEach(name => {
    const variants = groups[name];
    const firstVariant = variants[0];
    const variantCount = variants.length;
    
    const card = document.createElement('div');
    card.className = 'product-card';
    card.onclick = () => location.href = `product.html?name=${encodeURIComponent(name)}`;
    card.innerHTML = `
      <div class="product-image">
        <img src="${firstVariant.images && firstVariant.images.length > 0 ? firstVariant.images[0] : 'https://via.placeholder.com/300x300?text=No+Image'}" alt="${name}">
      </div>
      <div class="product-info">
        <h3>${name}</h3>
        <p class="product-price">₦${firstVariant.price}</p>
        <div class="product-variants">${variantCount} color${variantCount > 1 ? 's' : ''} available</div>
      </div>
    `;
    gallery.appendChild(card);
  });
}

// Search functionality
if (document.getElementById('search-button')) {
  document.getElementById('search-button').addEventListener('click', function() {
    const term = document.getElementById('search-input').value;
    loadGallery(term);
  });
  document.getElementById('search-input').addEventListener('keyup', function(e) {
    if (e.key === 'Enter') {
      const term = document.getElementById('search-input').value;
      loadGallery(term);
    }
  });
}
