const params = new URLSearchParams(window.location.search);
const orgId = params.get("orgId");
const boardId = params.get("boardId");

if (!orgId) window.location.href = "/";
if (!boardId) window.history.back();

let activeListId = null;
let editingCardId = null; // moved to top-level, initialized properly

// ─── LOAD PAGE ───────────────────────────────────────────────
async function loadListsPage() {
  await loadBoardName();
  await loadLists();
}

// ─── BOARD NAME ──────────────────────────────────────────────
async function loadBoardName() {
  try {
    const res = await fetch(`${BASE_URL}/orgs/${orgId}/boards/${boardId}`, {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok) {
      document.getElementById("boardName").textContent =
        data.data?.title || "Board";
    }
  } catch (err) {
    console.error("loadBoardName error:", err);
  }
}

// ─── LISTS ───────────────────────────────────────────────────
async function loadLists() {
  try {
    const res = await fetch(
      `${BASE_URL}/orgs/${orgId}/boards/${boardId}/lists`,
      {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      },
    );
    const data = await res.json();
    await renderLists(data.data || []);
  } catch (err) {
    console.error("loadLists error:", err);
  }
}

async function renderLists(lists) {
  const container = document.getElementById("listsContainer");
  container.innerHTML = "";

  for (const list of lists) {
    const cards = await fetchCards(list.id);
    container.appendChild(createListEl(list, cards));
  }

  // Add List button
  const addListBtn = document.createElement("div");
  addListBtn.className =
    "min-w-[272px] max-w-[272px] bg-white/20 hover:bg-white/30 rounded-xl p-3 cursor-pointer transition flex items-center gap-2 self-start";
  addListBtn.innerHTML = `
    <span class="text-white text-xl font-bold">+</span>
    <span class="text-white text-sm font-medium">Add List</span>
  `;
  addListBtn.onclick = openListModal;
  container.appendChild(addListBtn);
}

function createListEl(list, cards) {
  const col = document.createElement("div");
  col.className = "list-col";

  const header = document.createElement("div");
  header.className = "flex items-center justify-between mb-3";
  header.innerHTML = `
    <h3 class="text-sm font-semibold text-gray-700">${escapeHtml(list.title)}</h3>
    <button onclick="deleteList('${list.id}')" class="text-gray-400 hover:text-red-500 text-xs transition">✕</button>
  `;
  col.appendChild(header);

  const cardsContainer = document.createElement("div");
  cardsContainer.id = `cards-${list.id}`;
  cards.forEach((card) => {
    cardsContainer.appendChild(createCardEl(card, list.id));
  });
  col.appendChild(cardsContainer);

  const addCardBtn = document.createElement("button");
  addCardBtn.className =
    "w-full text-left text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-200 px-2 py-1.5 rounded-lg transition mt-1";
  addCardBtn.textContent = "+ Add Card";
  addCardBtn.onclick = () => openCardModal(list.id);
  col.appendChild(addCardBtn);

  return col;
}

function createCardEl(card, listId) {
  const el = document.createElement("div");
  el.className = "card-item group relative bg-white p-2 rounded-lg shadow-sm";

  const createdDate = new Date(card.createdAt).toLocaleString();

  el.innerHTML = `
    <div class="pr-6">
      <h4 class="text-sm font-medium text-gray-800">
        ${escapeHtml(card.title)}
      </h4>
      ${
        card.description
          ? `<p class="text-xs text-gray-500 mt-1">${escapeHtml(card.description)}</p>`
          : ""
      }
      <span class="text-[10px] text-gray-400 block mt-2">${createdDate}</span>
    </div>
    <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
      <button
        onclick='openEditCardModal(${JSON.stringify(card)}, "${listId}")'
        class="text-gray-400 hover:text-blue-500 text-xs"
      >✎</button>
      <button
        onclick="deleteCard('${card.id}', '${listId}')"
        class="text-gray-400 hover:text-red-500 text-xs"
      >✕</button>
    </div>
  `;

  return el;
}

// ─── CARD MODAL OPEN/CLOSE ────────────────────────────────────
function openCardModal(listId) {
  activeListId = listId;
  editingCardId = null;

  document.getElementById("cardModalTitle").textContent = "Add Card";
  document.getElementById("cardSubmitBtn").textContent = "Create";
  document.getElementById("cardTitle").value = "";
  document.getElementById("cardDescription").value = "";
  document.getElementById("cardModalError").classList.add("hidden");

  document.getElementById("cardModal").classList.remove("hidden");
  document.getElementById("cardTitle").focus();
}

function openEditCardModal(card, listId) {
  activeListId = listId;
  editingCardId = card.id;

  document.getElementById("cardModalTitle").textContent = "Edit Card";
  document.getElementById("cardSubmitBtn").textContent = "Update";
  document.getElementById("cardTitle").value = card.title || "";
  document.getElementById("cardDescription").value = card.description || "";
  document.getElementById("cardModalError").classList.add("hidden");

  document.getElementById("cardModal").classList.remove("hidden");
  document.getElementById("cardTitle").focus();
}

function closeCardModal() {
  activeListId = null;
  editingCardId = null;

  document.getElementById("cardModal").classList.add("hidden");
  document.getElementById("cardTitle").value = "";
  document.getElementById("cardDescription").value = "";
  document.getElementById("cardModalError").classList.add("hidden");
}

// ─── SINGLE SUBMIT HANDLER (create + edit dono) ──────────────
// FIX: Sirf ek jagah se handle hoga — no double event listener
async function handleCardSubmit() {
  const title = document.getElementById("cardTitle").value.trim();
  const description = document.getElementById("cardDescription").value.trim();
  const errBox = document.getElementById("cardModalError");

  if (!title) {
    errBox.textContent = "Title required hai";
    errBox.classList.remove("hidden");
    return;
  }

  try {
    const isEditing = !!editingCardId;
    const url = isEditing
      ? `${BASE_URL}/orgs/${orgId}/boards/${boardId}/lists/${activeListId}/cards/${editingCardId}`
      : `${BASE_URL}/orgs/${orgId}/boards/${boardId}/lists/${activeListId}/cards`;

    const method = isEditing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ title, description, listId: activeListId }),
    });

    const data = await res.json();

    if (!res.ok) {
      errBox.textContent = data.error || "Something went wrong";
      errBox.classList.remove("hidden");
      return;
    }

    closeCardModal();
    loadLists();
  } catch (err) {
    errBox.textContent = "Network error";
    errBox.classList.remove("hidden");
  }
}

// ─── FETCH CARDS ─────────────────────────────────────────────
async function fetchCards(listId) {
  try {
    const res = await fetch(
      `${BASE_URL}/orgs/${orgId}/boards/${boardId}/lists/${listId}/cards`,
      {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      },
    );
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    return [];
  }
}

// ─── LIST MODAL ──────────────────────────────────────────────
function openListModal() {
  document.getElementById("listModal").classList.remove("hidden");
  document.getElementById("listTitle").focus();
}

function closeListModal() {
  document.getElementById("listModal").classList.add("hidden");
  document.getElementById("listTitle").value = "";
  document.getElementById("listModalError").classList.add("hidden");
}

async function createList() {
  const title = document.getElementById("listTitle").value.trim();
  const errBox = document.getElementById("listModalError");

  if (!title) {
    errBox.textContent = "Title required hai";
    errBox.classList.remove("hidden");
    return;
  }

  try {
    const res = await fetch(
      `${BASE_URL}/orgs/${orgId}/boards/${boardId}/lists`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, boardId }),
      },
    );
    const data = await res.json();
    if (!res.ok) {
      errBox.textContent = data.error || "Failed to create list";
      errBox.classList.remove("hidden");
      return;
    }
    closeListModal();
    loadLists();
  } catch (err) {
    errBox.textContent = "Something went wrong!";
    errBox.classList.remove("hidden");
  }
}

async function deleteList(listId) {
  if (!confirm("Delete this list?")) return;
  try {
    const res = await fetch(
      `${BASE_URL}/orgs/${orgId}/boards/${boardId}/lists/${listId}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      },
    );
    if (res.ok) loadLists();
    else alert("Failed to delete list");
  } catch (err) {
    alert("Something went wrong!");
  }
}

async function deleteCard(cardId, listId) {
  if (!confirm("Delete this card?")) return;
  try {
    const res = await fetch(
      `${BASE_URL}/orgs/${orgId}/boards/${boardId}/lists/${listId}/cards/${cardId}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      },
    );
    if (res.ok) loadLists();
    else alert("Failed to delete card");
  } catch (err) {
    alert("Something went wrong!");
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
