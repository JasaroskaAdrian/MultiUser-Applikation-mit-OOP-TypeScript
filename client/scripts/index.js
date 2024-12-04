const API_BASE_URL = 'http://localhost:4200';

// Helper to Check Token Expiry
function isTokenExpired(token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.exp * 1000 < Date.now();
}

// Event Listener for DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  console.log(token)

  if (!token || isTokenExpired(token)) {
    alert('Session expired. Please log in again.');
    window.location.href = '/login';
  } else {
    
  }
  document.getElementById('logoutButton').addEventListener('click', logout);
});

// Logout Function
function logout() {
  localStorage.removeItem('token');
  window.location.href = '/login';
}