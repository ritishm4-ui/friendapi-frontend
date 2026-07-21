// Point this at your backend. Use localhost while testing,
// then switch to your deployed Azure URL before you deploy the frontend.
const API_BASE_URL = "http://localhost:8080/api/friends";
const form = document.getElementById("friend-form");
const idField = document.getElementById("friend-id");
const nameField = document.getElementById("name");
const emailField = document.getElementById("email");
const phoneField = document.getElementById("phone");
const notesField = document.getElementById("notes");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const statusEl = document.getElementById("status");
const tableBody = document.getElementById("friends-body");

async function loadFriends() {
  statusEl.textContent = "";
  try {
    const res = await fetch(API_BASE_URL);
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const friends = await res.json();
    renderFriends(friends);
  } catch (err) {
    statusEl.textContent = `Could not load friends: ${err.message}`;
  }
}

function renderFriends(friends) {
  tableBody.innerHTML = "";
  for (const friend of friends) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(friend.name ?? "")}</td>
      <td>${escapeHtml(friend.email ?? "")}</td>
      <td>${escapeHtml(friend.phone ?? "")}</td>
      <td>${escapeHtml(friend.notes ?? "")}</td>
      <td>
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      </td>
    `;
    row.querySelector(".edit-btn").addEventListener("click", () => startEdit(friend));
    row.querySelector(".delete-btn").addEventListener("click", () => deleteFriend(friend.id));
    tableBody.appendChild(row);
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function startEdit(friend) {
  idField.value = friend.id;
  nameField.value = friend.name ?? "";
  emailField.value = friend.email ?? "";
  phoneField.value = friend.phone ?? "";
  notesField.value = friend.notes ?? "";
  submitBtn.textContent = "Save Changes";
  cancelBtn.hidden = false;
}

function resetForm() {
  form.reset();
  idField.value = "";
  submitBtn.textContent = "Add Friend";
  cancelBtn.hidden = true;
}

cancelBtn.addEventListener("click", resetForm);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "";

  const payload = {
    name: nameField.value.trim(),
    email: emailField.value.trim(),
    phone: phoneField.value.trim(),
    notes: notesField.value.trim(),
  };

  const isEditing = idField.value !== "";
  const url = isEditing ? `${API_BASE_URL}/${idField.value}` : API_BASE_URL;
  const method = isEditing ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    resetForm();
    loadFriends();
  } catch (err) {
    statusEl.textContent = `Could not save friend: ${err.message}`;
  }
});

async function deleteFriend(id) {
  if (!confirm("Delete this friend?")) return;
  statusEl.textContent = "";
  try {
    const res = await fetch(`${API_BASE_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    loadFriends();
  } catch (err) {
    statusEl.textContent = `Could not delete friend: ${err.message}`;
  }
}

loadFriends();
