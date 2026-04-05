const BASE_URL = "http://localhost:3000/api/v1";

function showError(msg) {
  const err = document.getElementById("errorMsg");
  if (err) {
    err.textContent = msg;
    err.classList.remove("hidden");
  } else {
    alert(msg); // fallback
  }
}
// SIGNUP
async function signup(username, password) {
  try {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return showError(data.message || "Signup failed");
    }

    // success
    await signin(username, password);
  } catch (err) {
    showError("Something went wrong!");
  }
}

// SIGNIN
async function signin(username, password) {
  try {
    const res = await fetch(`${BASE_URL}/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return showError(data.error || data.message || "Login failed");
    }

    // redirect
    window.location.href = "/dashboard.html";
  } catch (err) {
    showError("Something went wrong!");
  }
}

async function getMe() {
  try {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || data.message || "Failed to fetch user info");
      return null;
    }

    return data.data;
  } catch (err) {
    showError("Something went wrong!");
    return null;
  }
}

async function logout() {
  try {
    const res = await fetch(`${BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || data.message || "Logout failed");
      return false;
    }

    window.location.href = "/";
    return true;
  } catch (err) {
    console.error("Logout error:", err);
    showError("Something went wrong!");
    return false;
  }
}
