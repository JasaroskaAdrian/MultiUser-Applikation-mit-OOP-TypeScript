document.querySelector(".form").addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent the default form submission
  
    const formData = {
      firstName: document.querySelector('input[placeholder="First Name"]').value,
      lastName: document.querySelector('input[placeholder="Last Name"]').value,
      email: document.querySelector('input[placeholder="Email"]').value,
      username: document.querySelector('input[placeholder="Username"]').value,
      password: document.querySelector('input[placeholder="Password"]').value,
    };
  
    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
  
      const result = await response.json();
      if (response.ok) {
        document.querySelector(".userFeedback").textContent =
          "Registration successful!";
      } else {
        document.querySelector(".userFeedback").textContent = result.message;
      }
    } catch (err) {
      document.querySelector(".userFeedback").textContent =
        "An error occurred. Please try again.";
    }
  });
  