async function loadOrgs() {
  try {
    const res = await fetch(`${BASE_URL}/orgs`, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("Failed to load orgs", data);
      return;
    }
    // Check if renderOrgs function exists (defined in HTML)
    if (typeof renderOrgs === "function") {
      renderOrgs(data.data || []);
    } else {
      console.error("renderOrgs function not found");
    }
  } catch (err) {
    console.error("loadOrgs error:", err);
  }
}

function openModal() {
  const modal = document.getElementById("orgModal");
  if (modal) {
    modal.classList.remove("hidden");
    const nameInput = document.getElementById("orgName");
    if (nameInput) nameInput.focus();
  }
}

function closeModal() {
  const modal = document.getElementById("orgModal");
  if (modal) modal.classList.add("hidden");
  const nameInput = document.getElementById("orgName");
  const descInput = document.getElementById("orgDesc");
  const errorBox = document.getElementById("modalError");
  if (nameInput) nameInput.value = "";
  if (descInput) descInput.value = "";
  if (errorBox) errorBox.classList.add("hidden");
}

async function createOrg() {
  const name = document.getElementById("orgName")?.value.trim();
  const description = document.getElementById("orgDesc")?.value.trim();
  const type = document.getElementById("orgType")?.value;
  const errBox = document.getElementById("modalError");

  if (!name || !description) {
    if (errBox) {
      errBox.textContent = "Both name and description are required!";
      errBox.classList.remove("hidden");
    }
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/orgs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ name, description, type }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (errBox) {
        errBox.textContent =
          data.error || data.message || "Failed to create org";
        errBox.classList.remove("hidden");
      }
      return;
    }
    closeModal();
    loadOrgs(); // refresh list
  } catch (err) {
    if (errBox) {
      errBox.textContent = "Something went wrong!";
      errBox.classList.remove("hidden");
    }
  }
}

// Escape key listener
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});
