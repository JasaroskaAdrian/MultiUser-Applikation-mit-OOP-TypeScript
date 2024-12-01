document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent the default form submission

  const username = document.getElementById('Username').value; // Matches 'Username' from HTML
  const password = document.getElementById('password').value; // Matches 'password' from HTML

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ username, password }),
    });
    

    const result = await response.json();

    if (response.ok) {
      // Stores the token in localStorage
      if (result.token) {
        localStorage.setItem("authToken", result.token);
        document.getElementById("userFeedback").textContent = "Login successful!";
        document.getElementById("userFeedback").style.color = "green";

        // Redirects to dashboard
        setTimeout(() => {
          window.location.href = "/";
        }, 1000); // Waits for a second before redirecting for user feedback - thought it might be cool
      } else {
        document.getElementById("userFeedback").textContent = "Login failed. No token received.";
        document.getElementById("userFeedback").style.color = "red";
      }
    } else {
      // Displays error message if login fails
      document.getElementById("userFeedback").textContent = result.message || "Invalid username or password.";
      document.getElementById("userFeedback").style.color = "red";
    }
  } catch (err) {
    // Handles unexpected errors
    document.getElementById("userFeedback").textContent =
      "An error occurred. Please check your network and try again.";
    document.getElementById("userFeedback").style.color = "red";
  }
});
