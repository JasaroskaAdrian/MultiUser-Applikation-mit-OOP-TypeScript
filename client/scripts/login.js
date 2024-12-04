const API_BASE_URL = 'http://localhost:4200' // Serveradresse

      document
        .getElementById('loginForm')
        .addEventListener('submit', async (e) => {
          e.preventDefault()

          const username = document.getElementById('username').value
          const password = document.getElementById('password').value

          try {
            const response = await fetch('http://localhost:4200/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ username, password }),
            })

            if (response.ok) {
              const data = await response.json()
              localStorage.setItem('token', data.token) // Speichert das Token
              alert('Login successful! Redirecting...')
              window.location.href = '/dashboard' // Weiterleitung
            } else {
              alert('Login failed: Invalid username or password')
            }
          } catch (err) {
            console.error('Login error:', err)
            alert('An error occurred. Please check the console for details.')
          }
        })