const defaultRooms = [
  { number: "101", type: "Single", price: 50, status: "Available", guest: null },
  { number: "102", type: "Single", price: 50, status: "Available", guest: null },
  { number: "103", type: "Double", price: 85, status: "Available", guest: null },
  { number: "104", type: "Double", price: 85, status: "Available", guest: null },
  { number: "201", type: "Deluxe", price: 130, status: "Available", guest: null },
  { number: "202", type: "Deluxe", price: 130, status: "Available", guest: null },
  { number: "301", type: "Suite", price: 220, status: "Available", guest: null },
  { number: "302", type: "Suite", price: 220, status: "Available", guest: null }
];

let rooms = JSON.parse(localStorage.getItem("hotelRooms")) || defaultRooms;

const checkinForm = document.getElementById("checkin-form");
const roomSelect = document.getElementById("room-select");
const tableBody = document.getElementById("rooms-table-body");
const searchInput = document.getElementById("search-input");
const statusFilter = document.getElementById("status-filter");

function saveData() {
  localStorage.setItem("hotelRooms", JSON.stringify(rooms));
}

function renderApp() {
  updateStats();
  populateRoomDropdown();
  renderTable();
}

function updateStats() {
  const total = rooms.length;
  const occupied = rooms.filter(r => r.status === "Occupied").length;
  const available = total - occupied;
  const revenue = rooms.reduce((sum, r) => {
    return r.status === "Occupied" ? sum + (r.price * r.guest.nights) : sum;
  }, 0);

  document.getElementById("total-rooms").textContent = total;
  document.getElementById("available-rooms").textContent = available;
  document.getElementById("occupied-rooms").textContent = occupied;
  document.getElementById("total-revenue").textContent = `$${revenue}`;
}

function populateRoomDropdown() {
  roomSelect.innerHTML = "";
  const availableRooms = rooms.filter(r => r.status === "Available");

  if (availableRooms.length === 0) {
    const option = document.createElement("option");
    option.textContent = "No rooms available";
    option.disabled = true;
    option.selected = true;
    roomSelect.appendChild(option);
    return;
  }

  availableRooms.forEach(room => {
    const option = document.createElement("option");
    option.value = room.number;
    option.textContent = `Room ${room.number} - ${room.type} ($${room.price}/night)`;
    roomSelect.appendChild(option);
  });
}
function renderTable() {
  const searchTerm = searchInput.value.toLowerCase();
  const filterValue = statusFilter.value;

  tableBody.innerHTML = "";

  const filteredRooms = rooms.filter(room => {
    const matchesStatus = filterValue === "all" || room.status === filterValue;
    const guestName = room.guest ? room.guest.name.toLowerCase() : "";
    const matchesSearch =
      room.number.toLowerCase().includes(searchTerm) ||
      room.type.toLowerCase().includes(searchTerm) ||
      guestName.includes(searchTerm);

    return matchesStatus && matchesSearch;
  });

  filteredRooms.forEach(room => {
    const tr = document.createElement("tr");
    const isOccupied = room.status === "Occupied";
    const totalBill = isOccupied ? `$${room.price * room.guest.nights}` : "-";

    tr.innerHTML = `
      <td><strong>${room.number}</strong></td>
      <td>${room.type}</td>
      <td>$${room.price}</td>
      <td>
        <span class="badge ${isOccupied ? "occupied" : "available"}">
          ${room.status}
        </span>
      </td>
      <td>${isOccupied ? `${room.guest.name}<br><small>${room.guest.phone}</small>` : "-"}</td>
      <td>${isOccupied ? room.guest.nights : "-"}</td>
      <td><strong>${totalBill}</strong></td>
      <td>
        ${
          isOccupied
            ? `<button class="btn-checkout" onclick="checkOut('${room.number}')">Check Out</button>`
            : `<span style="color:#94a3b8;">Ready</span>`
        }
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

checkinForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("guest-name").value.trim();
  const phone = document.getElementById("guest-phone").value.trim();
  const roomNumber = roomSelect.value;
  const nights = parseInt(document.getElementById("nights").value, 10);

  const room = rooms.find(r => r.number === roomNumber);
  if (!room || room.status === "Occupied") {
    alert("Please select an available room.");
    return;
  }

  room.status = "Occupied";
  room.guest = { name, phone, nights };

  saveData();
  renderApp();
  checkinForm.reset();
});

window.checkOut = function (roomNumber) {
  const room = rooms.find(r => r.number === roomNumber);
  if (!room) return;

  const total = room.price * room.guest.nights;
  const confirmCheckout = confirm(
    `Check out ${room.guest.name} from Room ${room.number}?\nTotal Bill: $${total}`
  );

  if (confirmCheckout) {
    room.status = "Available";
    room.guest = null;
    saveData();
    renderApp();
  }
};

searchInput.addEventListener("input", renderTable);
statusFilter.addEventListener("change", renderTable);

renderApp();