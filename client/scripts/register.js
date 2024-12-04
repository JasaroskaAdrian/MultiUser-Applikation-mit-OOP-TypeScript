const API_BASE_URL = 'http://localhost:4200'; // Serveradresse

document.getElementById('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const email = document.getElementById('email').value;
  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;

  const response = await fetch('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, email, firstName, lastName })
  });

  if (response.ok) {
    alert('Registration successful');
    window.location.href = '/login';
  } else {
    alert('Registration failed');
  }
});