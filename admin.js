let loggedIn = sessionStorage.getItem('admin') === 'true';

function requireAuth() {
  if (!loggedIn) {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('admin-content').style.display = 'none';
  } else {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('admin-content').style.display = 'block';
    loadAdminProducts();
    loadAdminOrders();
    loadAdminNotifications();
    loadOrderNotifications();
  }
}

function login() {
  const pwd = document.getElementById('admin-password').value;
  if (pwd === 'Amatextile001') {
    sessionStorage.setItem('admin', 'true');
    loggedIn = true;
    requireAuth();
  } else {
    alert('Incorrect password');
  }
}

function logout() {
  sessionStorage.removeItem('admin');
  loggedIn = false;
  requireAuth();
}

// Product management with image URLs
document.getElementById('product-form')?.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const name = document.getElementById('product-name').value;
  const price = document.getElementById('product-price').value;
  const desc = document.getElementById('product-desc').value;
  const urlsText = document.getElementById('image-urls').value;
  
  if (!urlsText.trim()) {
    alert('Please paste at least one image URL');
    return;
  }

  // Split by new line and clean up URLs
  const imageUrls = urlsText.split('\n')
    .map(url => url.trim())
    .filter(url => url.startsWith('http'));

  if (imageUrls.length === 0) {
    alert('Please enter valid image URLs starting with http:// or https://');
    return;
  }

  const product = {
    id: Date.now(),
    name,
    price,
    description: desc,
    images: imageUrls,
    date: new Date().toISOString()
  };
  
  saveProduct(product);
  alert('Product added successfully!');
  document.getElementById('product-form').reset();
  loadAdminProducts();
});

function loadAdminProducts() {
  const products = loadProducts();
  const tbody = document.querySelector('#products-table tbody');
  if (tbody) {
    tbody.innerHTML = '';
    products.forEach((p, index) => {
      const firstImage = p.images && p.images.length > 0 ? p.images[0] : 'https://via.placeholder.com/50';
      tbody.innerHTML += `
        <tr>
          <td><img src="${firstImage}" width="50" height="50" style="object-fit: cover;" onerror="this.src='https://via.placeholder.com/50'"></td>
          <td>${p.name}</td>
          <td>₦${p.price}</td>
          <td>${p.images ? p.images.length : 0} image(s)</td>
          <td>${new Date(p.date).toLocaleDateString()}</td>
          <td>
            <button onclick="confirmDelete(${index})" class="btn btn-danger" style="padding: 0.3rem 1rem;">Delete</button>
          </td>
        </tr>
      `;
    });
  }
}

function confirmDelete(index) {
  if (confirm('Are you sure you want to delete this product?')) {
    deleteProduct(index);
    loadAdminProducts();
    if (typeof loadGallery === 'function') loadGallery();
  }
}

// Order management
function loadAdminOrders() {
  const orders = loadOrders();
  const container = document.getElementById('orders-list');
  if (container) {
    container.innerHTML = '';
    orders.forEach(o => {
      // Create thumbnail for first image if exists
      let imageThumb = '';
      if (o.productImages && o.productImages.length > 0) {
        imageThumb = `<img src="${o.productImages[0]}" width="50" height="50" style="object-fit: cover; margin-right: 10px;" onerror="this.style.display='none'">`;
      }
      
      container.innerHTML += `
        <div class="order-card">
          <div style="display: flex; align-items: center;">
            ${imageThumb}
            <div>
              <p><strong>Order ID:</strong> ${o.orderId}</p>
              <p><strong>Customer:</strong> ${o.name} (${o.phone})</p>
              <p><strong>Product:</strong> ${o.productName} (Quantity: ${o.quantity})</p>
              <p><strong>Address:</strong> ${o.address}, ${o.lga}, ${o.state}</p>
            </div>
          </div>
          <p><strong>Status:</strong> 
            <select onchange="updateStatus('${o.orderId}', this.value)">
              <option value="Pending" ${o.status==='Pending'?'selected':''}>Pending</option>
              <option value="On Delivery 🚚" ${o.status==='On Delivery 🚚'?'selected':''}>On Delivery 🚚</option>
              <option value="Delivered" ${o.status==='Delivered'?'selected':''}>Delivered</option>
            </select>
          </p>
          <button onclick="sendOrderNotification('${o.orderId}')" class="btn btn-outline" style="margin-top: 0.5rem; padding: 0.3rem 1rem;">Send Notification</button>
        </div>
      `;
    });
  }
}

function updateStatus(orderId, newStatus) {
  let orders = loadOrders();
  orders = orders.map(o => o.orderId === orderId ? {...o, status: newStatus} : o);
  localStorage.setItem('orders', JSON.stringify(orders));
  loadAdminOrders();
}

// Order-specific notifications
function sendOrderNotification(orderId) {
  const orders = loadOrders();
  const order = orders.find(o => o.orderId === orderId);
  if (!order) return;

  const title = prompt("Enter notification title:", `Order ${orderId} Update`);
  if (!title) return;
  
  const message = prompt("Enter notification message:", `Your order (${order.productName}) is now ${order.status}.`);
  if (!message) return;

  const notification = {
    title,
    message,
    orderId: orderId,
    phone: order.phone,
    date: new Date().toISOString(),
    image: null
  };

  const orderNotifications = JSON.parse(localStorage.getItem('orderNotifications')) || [];
  orderNotifications.push(notification);
  localStorage.setItem('orderNotifications', JSON.stringify(orderNotifications));

  alert(`Notification sent to customer (${order.phone})!`);
  loadOrderNotifications();
}

function loadOrderNotifications() {
  const container = document.getElementById('order-notifications-list');
  if (!container) return;

  const orderNotifications = JSON.parse(localStorage.getItem('orderNotifications')) || [];
  container.innerHTML = '';

  orderNotifications.slice().reverse().forEach((n, index) => {
    const div = document.createElement('div');
    div.className = 'order-notification-item';
    div.innerHTML = `
      <h4>${n.title}</h4>
      <p>${n.message}</p>
      <p><strong>Order ID:</strong> ${n.orderId}</p>
      <p><strong>Customer Phone:</strong> ${n.phone}</p>
      <small>${new Date(n.date).toLocaleString()}</small>
      <button onclick="deleteOrderNotification(${index})" class="btn btn-outline" style="margin-top: 0.5rem; padding: 0.3rem 1rem;">Delete</button>
    `;
    container.appendChild(div);
  });
}

function deleteOrderNotification(index) {
  if (confirm('Delete this order notification?')) {
    const orderNotifications = JSON.parse(localStorage.getItem('orderNotifications')) || [];
    orderNotifications.splice(index, 1);
    localStorage.setItem('orderNotifications', JSON.stringify(orderNotifications));
    loadOrderNotifications();
  }
}

// General notifications
document.getElementById('notification-form')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const title = document.getElementById('notification-title').value;
  const message = document.getElementById('notification-message').value;
  const imageFile = document.getElementById('notification-image').files[0];
  
  if (imageFile) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const notification = {
        title,
        message,
        image: event.target.result,
        date: new Date().toISOString()
      };
      saveNotification(notification);
      alert('Notification added!');
      document.getElementById('notification-form').reset();
      loadAdminNotifications();
      updateNotificationBadge();
    };
    reader.readAsDataURL(imageFile);
  } else {
    const notification = {
      title,
      message,
      image: null,
      date: new Date().toISOString()
    };
    saveNotification(notification);
    alert('Notification added!');
    document.getElementById('notification-form').reset();
    loadAdminNotifications();
    updateNotificationBadge();
  }
});

function loadAdminNotifications() {
  const notifications = loadNotifications();
  const container = document.getElementById('notifications-list-admin');
  if (container) {
    container.innerHTML = '';
    notifications.slice().reverse().forEach((n, index) => {
      const div = document.createElement('div');
      div.className = 'notification-admin-item';
      let imgHtml = '';
      if (n.image) {
        imgHtml = `<img src="${n.image}" alt="notification image">`;
      }
      div.innerHTML = `
        <h4>${n.title}</h4>
        <p>${n.message}</p>
        ${imgHtml}
        <small>${new Date(n.date).toLocaleString()}</small>
        <button onclick="deleteNotification(${index})" class="btn btn-outline" style="margin-top: 0.5rem; padding: 0.3rem 1rem;">Delete</button>
      `;
      container.appendChild(div);
    });
  }
}

function deleteNotification(index) {
  if (confirm('Delete this notification?')) {
    const notifications = loadNotifications();
    notifications.splice(index, 1);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    loadAdminNotifications();
    updateNotificationBadge();
  }
}

// Tab switching
function showTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  if (event) event.target.classList.add('active');
    }
