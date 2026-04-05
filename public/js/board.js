const params = new URLSearchParams(window.location.search);
const orgId = params.get("orgId");

if (!orgId) window.location.href = "/";

const boardColors = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-red-500",
  "bg-pink-500",
  "bg-indigo-500",
];

// ─── LOAD PAGE ───────────────────────────────────────────────
async function loadBoardPage() {
  await loadOrg();
  await loadBoards();
}

async function loadMembers() {
  const res = await fetch(`${BASE_URL}/orgs/${orgId}/members`, {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) return;
  renderMembers(data.members || []);
}

// ─── ORG ─────────────────────────────────────────────────────
async function loadOrg() {
  try {
    const res = await fetch(`${BASE_URL}/orgs/${orgId}`, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
      window.location.href = "./dashboard.html";
      return;
    }

    const org = data.data;

    document.getElementById("orgName").textContent = org.name;
    document.getElementById("orgType").textContent = org.type;
    loadMembers();
  } catch (err) {
    console.error("loadOrg error:", err);
  }
}

// ─── BOARDS ──────────────────────────────────────────────────
async function loadBoards() {
  try {
    const res = await fetch(`${BASE_URL}/orgs/${orgId}/boards`, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data = await res.json();
    renderBoards(data.data || []);
  } catch (err) {
    console.error("loadBoards error:", err);
  }
}

function renderBoards(boards) {
  const grid = document.getElementById("boardsGrid");
  grid.innerHTML = "";

  boards.forEach((board, i) => {
    const card = document.createElement("div");
    card.className = `${boardColors[i % boardColors.length]} rounded-xl p-5 cursor-pointer hover:opacity-90 transition shadow-sm `;
    card.innerHTML = `
      <h3 class="text-white font-semibold text-base mb-1">${escapeHtml(board.title)}</h3>
      <p class="text-white/60 text-xs ">Click to open</p>
    `;
    card.onclick = () => {
      localStorage.setItem("currentBoardId", board.id);
      window.location.href = `/list.html?orgId=${orgId}&boardId=${board.id}`;
    };
    grid.appendChild(card);
  });

  // Add board card
  const addCard = document.createElement("div");
  addCard.className =
    "border-2 border-dashed border-gray-300 rounded-xl p-5 cursor-pointer hover:border-[#0052CC] hover:bg-blue-50 transition flex flex-col items-center justify-center gap-2 min-h-[100px]";
  addCard.innerHTML = `
    <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xl">+</div>
    <span class="text-sm text-gray-500 font-medium">Add Board</span>
  `;
  addCard.onclick = openBoardModal;
  grid.appendChild(addCard);
}

// ─── MEMBERS ─────────────────────────────────────────────────
function renderMembers(members) {
  const list = document.getElementById("membersList");
  list.innerHTML = "";

  if (members.length === 0) {
    list.innerHTML = `<p class="text-xs text-gray-400 text-center py-2">No members yet</p>`;
    return;
  }

  members.forEach((m) => {
    const item = document.createElement("div");
    item.className =
      "flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50";
    item.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-semibold">
          ${m.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <p class="text-xs font-medium text-gray-700 capitalize">${escapeHtml(m.username)}</p>
          <p class="text-xs text-gray-400">${m.role}</p>
        </div>
      </div>
      <button onclick="removeMember('${m.userId}')"
        class="text-xs text-red-400 hover:text-red-600 transition">Remove</button>
    `;
    list.appendChild(item);
  });
}

// ─── BOARD MODAL ─────────────────────────────────────────────
function openBoardModal() {
  document.getElementById("boardModal").classList.remove("hidden");
  document.getElementById("boardTitle").focus();
}

function closeBoardModal() {
  document.getElementById("boardModal").classList.add("hidden");
  document.getElementById("boardTitle").value = "";
  document.getElementById("boardModalError").classList.add("hidden");
}

async function createBoard() {
  const title = document.getElementById("boardTitle").value.trim();
  const errBox = document.getElementById("boardModalError");

  if (!title) {
    errBox.textContent = "Title required hai";
    errBox.classList.remove("hidden");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/orgs/${orgId}/boards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ title, orgId }),
    });
    const data = await res.json();
    if (!res.ok) {
      errBox.textContent = data.error || "Failed to create board";
      errBox.classList.remove("hidden");
      return;
    }
    closeBoardModal();
    loadBoards();
  } catch (err) {
    errBox.textContent = "Something went wrong!";
    errBox.classList.remove("hidden");
  }
}

// ─── ADD MEMBER MODAL ────────────────────────────────────────
function openAddMemberModal() {
  document.getElementById("addMemberModal").classList.remove("hidden");
  document.getElementById("memberUsername").focus();
}

function closeAddMemberModal() {
  document.getElementById("addMemberModal").classList.add("hidden");
  document.getElementById("memberUsername").value = "";
  document.getElementById("addMemberError").classList.add("hidden");
}

async function addMember() {
  console.log("addMember called");
  const username = document.getElementById("memberUsername").value.trim();
  const role = document.getElementById("memberRole").value;
  const errBox = document.getElementById("addMemberError");

  if (!username) {
    errBox.textContent = "Username required!";
    errBox.classList.remove("hidden");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/orgs/${orgId}/members`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ username, role }),
    });
    const data = await res.json();
    if (!res.ok) {
      errBox.textContent = data.error || "Failed to add member";
      errBox.classList.remove("hidden");
      return;
    }
    closeAddMemberModal();
    loadOrg();
  } catch (err) {
    errBox.textContent = "Something went wrong!";
    errBox.classList.remove("hidden");
  }
}

async function removeMember(userId) {
  if (!confirm("Remove this member?")) return;
  try {
    const res = await fetch(`${BASE_URL}/orgs/${orgId}/members/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to remove member");
      return;
    }
    loadOrg();
  } catch (err) {
    alert("Something went wrong!");
  }
}

// ─── DELETE ORG MODAL ────────────────────────────────────────
async function openDeleteOrgModal() {
  document.getElementById("deleteOrgModal").classList.remove("hidden");
  document.getElementById("deleteOrgError").classList.add("hidden");
  document.getElementById("deleteOrgSuccess").classList.add("hidden");

  // Boards list dikhao
  try {
    const res = await fetch(`${BASE_URL}/orgs/${orgId}/boards`, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data = await res.json();
    const boards = data.data || [];
    const container = document.getElementById("deleteOrgBoardsList");
    container.innerHTML = "";

    if (boards.length === 0) {
      container.innerHTML = `<p class="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">No boards — org delete kar sakte ho!</p>`;
      return;
    }

    boards.forEach((b) => {
      const row = document.createElement("div");
      row.className =
        "flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg";
      row.innerHTML = `
        <span class="text-sm text-gray-700">${escapeHtml(b.title)}</span>
        <button onclick="deleteBoardFromModal('${b.id}', this)"
          class="text-xs text-red-500 hover:text-red-700 font-medium transition">Delete</button>
      `;
      container.appendChild(row);
    });
  } catch (err) {
    console.error(err);
  }
}

function closeDeleteOrgModal() {
  document.getElementById("deleteOrgModal").classList.add("hidden");
}

async function deleteBoardFromModal(boardId, btn) {
  btn.textContent = "...";
  btn.disabled = true;
  try {
    const res = await fetch(`${BASE_URL}/orgs/${orgId}/boards/${boardId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (!res.ok) {
      btn.textContent = "Error";
      return;
    }
    // Row hatao
    btn.closest("div").remove();

    // Agar koi board nahi bachi
    const container = document.getElementById("deleteOrgBoardsList");
    if (container.children.length === 0) {
      container.innerHTML = `<p class="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">No boards — org delete kar sakte ho!</p>`;
    }
  } catch (err) {
    btn.textContent = "Error";
  }
}

async function deleteOrg() {
  const errBox = document.getElementById("deleteOrgError");
  const container = document.getElementById("deleteOrgBoardsList");

  // Check boards abhi bhi hain?
  const boardRows = container.querySelectorAll(
    "button[onclick*='deleteBoardFromModal']",
  );
  if (boardRows.length > 0) {
    errBox.textContent = "first delete all boards!";
    errBox.classList.remove("hidden");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/orgs/${orgId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (!res.ok) {
      const data = await res.json();
      errBox.textContent = data.error || "Failed to delete org";
      errBox.classList.remove("hidden");
      return;
    }
    localStorage.removeItem("currentOrgId");
    window.location.href = "./dashboard.html";
  } catch (err) {
    errBox.textContent = "Something went wrong!";
    errBox.classList.remove("hidden");
  }
}

// ─── HELPER ──────────────────────────────────────────────────
function escapeHtml(str) {
  if (!str) return "";
  return str.replace(
    /[&<>]/g,
    (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[m],
  );
}
