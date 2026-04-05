const navbar = document.getElementById("navbar");
navbar.innerHTML = `
 <div class="flex items-center justify-between py-4 px-6 bg-blue-600 shadow-md">
  <!-- Logo -->
  <div class="flex items-center gap-2">
    <div class="flex gap-1">
      <div class="w-[14px] h-8 bg-white rounded"></div>
      <div class="w-[14px] h-6 bg-white rounded self-end"></div>
    </div>
    <span class="text-white text-2xl font-bold tracking-tight">Trello</span>
  </div>

  <!-- Logout button -->
  <div class="flex items-center gap-3">
    <button id="logoutBtn" class="rounded-md bg-red-500 hover:bg-red-600 px-4 py-2 font-semibold text-white cursor-pointer transition">
      Logout
    </button>
  </div>
</div>

  <!-- Logout Modal (same, no change needed) -->
  <div id="logoutModal" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 hidden">
    <div class="bg-white rounded-lg shadow-lg px-8 py-6 min-w-[320px]">
      <div class="mb-4 text-lg font-semibold text-center">Logout</div>
      <div class="mb-6 text-gray-600 text-center">Are you sure you want to logout?</div>
      <div class="flex justify-center gap-4">
        <button id="cancelLogout" class="py-2 px-6 bg-gray-200 rounded hover:bg-gray-300 font-semibold">Cancel</button>
        <button id="confirmLogout" class="py-2 px-6 bg-red-500 rounded text-white hover:bg-red-600 font-semibold">Logout</button>
      </div>
    </div>
  </div>
`;

const logoutBtn = document.getElementById("logoutBtn");
const logoutModal = document.getElementById("logoutModal");
const cancelLogout = document.getElementById("cancelLogout");
const confirmLogout = document.getElementById("confirmLogout");

logoutBtn.addEventListener("click", () => {
  logoutModal.classList.remove("hidden");
});

// Modal logic

cancelLogout.addEventListener("click", () => {
  logoutModal.classList.add("hidden");
});

logoutModal.addEventListener("click", (e) => {
  if (e.target === logoutModal) {
    logoutModal.classList.add("hidden");
  }
});

confirmLogout.addEventListener("click", async () => {
  logout();
});
