
// Get HTML elements
const eventForm = document.getElementById("eventForm");
const formSection = document.getElementById("formSection");
const eventsContainer = document.getElementById("eventsContainer");
const searchInput = document.getElementById("searchInput");
const filterType = document.getElementById("filterType");
const filterStatus = document.getElementById("filterStatus");
const formMessage = document.getElementById("formMessage");
const saveBtn = document.getElementById("saveBtn");
const detailsModal = document.getElementById("detailsModal");

// Load saved events from localStorage
let events = JSON.parse(localStorage.getItem("myEvents")) || [];
let editingId = null;

// Get today's date in local time
function getToday() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Set default created date
document.getElementById("createdDate").value = getToday();

// Save events in localStorage
function saveEvents() {
    localStorage.setItem("myEvents", JSON.stringify(events));
}

// Escape text before displaying user-entered information in HTML
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (char) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[char];
    });
}

// Format dates for display
function formatDate(date) {
    if (!date) return "Not provided";

    const parts = date.split("-");
    if (parts.length !== 3) return date;

    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

// Determine event status
function getStatus(eventDate) {
    if (eventDate < getToday()) {
        return "Completed";
    }

    if (eventDate === getToday()) {
        return "Today";
    }

    return "Upcoming";
}

// Show the form
function showForm() {
    formSection.style.display = "block";
    formSection.scrollIntoView({ behavior: "smooth" });
}

// Hide the form
function hideForm() {
    formSection.style.display = "none";
    resetForm();
}

// Clear the form
function resetForm() {
    eventForm.reset();
    editingId = null;

    document.getElementById("formHeading").textContent = "Add New Event";
    saveBtn.textContent = "Add Event";
    formMessage.textContent = "";
    document.getElementById("createdDate").value = getToday();
}

// Add or update an event
eventForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const title = document.getElementById("eventTitle").value.trim();
    const createdDate = document.getElementById("createdDate").value;
    const eventDate = document.getElementById("eventDate").value;
    const eventTime = document.getElementById("eventTime").value;
    const eventType = document.getElementById("eventType").value;
    const eventLocation = document.getElementById("eventLocation").value.trim();
    const eventOrganizer = document.getElementById("eventOrganizer").value.trim();
    const eventCapacity = document.getElementById("eventCapacity").value;
    const eventDescription = document.getElementById("eventDescription").value.trim();

    // Validate dates
    if (eventDate < createdDate) {
        formMessage.textContent = "Event date cannot be before created date.";
        return;
    }

    if (eventCapacity && Number(eventCapacity) < 1) {
        formMessage.textContent = "Participant capacity must be at least 1.";
        return;
    }

    // Create event object
    const eventData = {
        title: title,
        createdDate: createdDate,
        eventDate: eventDate,
        eventTime: eventTime,
        eventType: eventType,
        eventLocation: eventLocation,
        eventOrganizer: eventOrganizer,
        eventCapacity: eventCapacity,
        eventDescription: eventDescription
    };

    if (editingId !== null) {
        // Update existing event
        const index = events.findIndex(event => event.id === editingId);

        if (index !== -1) {
            events[index] = {
                ...events[index],
                ...eventData
            };

            formMessage.textContent = "Event updated successfully!";
        }
    } else {
        // Add new event
        eventData.id = Date.now();
        events.push(eventData);
        formMessage.textContent = "Event added successfully!";
    }

    saveEvents();
    renderEvents();
    resetForm();
    hideForm();
});

// Display all events
function renderEvents() {
    const searchText = searchInput.value.toLowerCase().trim();
    const selectedType = filterType.value;
    const selectedStatus = filterStatus.value;

    // Filter events according to search and selections
    const filteredEvents = events.filter(function (event) {
        const matchesSearch =
            event.title.toLowerCase().includes(searchText) ||
            event.eventDescription.toLowerCase().includes(searchText) ||
            (event.eventLocation || "").toLowerCase().includes(searchText) ||
            (event.eventOrganizer || "").toLowerCase().includes(searchText);

        const matchesType =
            selectedType === "All" || event.eventType === selectedType;

        const matchesStatus =
            selectedStatus === "All" ||
            getStatus(event.eventDate) === selectedStatus;

        return matchesSearch && matchesType && matchesStatus;
    });

    // Sort events by date
    filteredEvents.sort((a, b) =>
        a.eventDate.localeCompare(b.eventDate)
    );

    // Show empty message if no events exist
    if (filteredEvents.length === 0) {
        eventsContainer.innerHTML = `
            <div class="empty-message">
                <h3>No events found! 📅</h3>
                <p>Add a new event or change your search filters.</p>
            </div>
        `;
    } else {
        eventsContainer.innerHTML = filteredEvents.map(function (event) {
            const status = getStatus(event.eventDate);
            const statusClass = status.toLowerCase();

            return `
                <div class="event-card">
                    <span class="category-badge">
                        ${escapeHTML(event.eventType)}
                    </span>

                    <span class="status-badge status-${statusClass}">
                        ${status}
                    </span>

                    <h3>${escapeHTML(event.title)}</h3>

                    <p>📅 <strong>Date:</strong>
                        ${formatDate(event.eventDate)}
                    </p>

                    <p>⏰ <strong>Time:</strong>
                        ${escapeHTML(event.eventTime || "Not provided")}
                    </p>

                    <p>📍 <strong>Location:</strong>
                        ${escapeHTML(event.eventLocation || "Not provided")}
                    </p>

                    <p>${escapeHTML(event.eventDescription.length > 100
                        ? event.eventDescription.substring(0, 100) + "..."
                        : event.eventDescription)}
                    </p>

                    <div class="event-actions">
                        <button class="view-btn"
                            onclick="viewEvent(${event.id})">
                            View Details
                        </button>

                        <button class="edit-btn"
                            onclick="editEvent(${event.id})">
                            Edit
                        </button>

                        <button class="delete-btn"
                            onclick="deleteEvent(${event.id})">
                            Delete
                        </button>
                    </div>
                </div>
            `;
        }).join("");
    }

    document.getElementById("eventCount").textContent =
        `${filteredEvents.length} event(s) found`;

    updateDashboard();
}

// Update dashboard statistics
function updateDashboard() {
    const upcoming = events.filter(event =>
        getStatus(event.eventDate) === "Upcoming"
    ).length;

    const completed = events.filter(event =>
        getStatus(event.eventDate) === "Completed"
    ).length;

    const categories = new Set(events.map(event => event.eventType));

    document.getElementById("totalEvents").textContent = events.length;
    document.getElementById("upcomingEvents").textContent = upcoming;
    document.getElementById("completedEvents").textContent = completed;
    document.getElementById("totalCategories").textContent = categories.size;
}

// View complete event details
function viewEvent(id) {
    const event = events.find(event => event.id === id);

    if (!event) return;

    const status = getStatus(event.eventDate);

    document.getElementById("modalTitle").textContent = event.title;

    document.getElementById("modalDetails").innerHTML = `
        <div class="detail-row">
            <strong>Event Type</strong>
            <p>${escapeHTML(event.eventType)}</p>
        </div>

        <div class="detail-row">
            <strong>Status</strong>
            <p>${status}</p>
        </div>

        <div class="detail-row">
            <strong>Created Date</strong>
            <p>${formatDate(event.createdDate)}</p>
        </div>

        <div class="detail-row">
            <strong>Event Date</strong>
            <p>${formatDate(event.eventDate)}</p>
        </div>

        <div class="detail-row">
            <strong>Event Time</strong>
            <p>${escapeHTML(event.eventTime || "Not provided")}</p>
        </div>

        <div class="detail-row">
            <strong>Location</strong>
            <p>${escapeHTML(event.eventLocation || "Not provided")}</p>
        </div>

        <div class="detail-row">
            <strong>Organizer</strong>
            <p>${escapeHTML(event.eventOrganizer || "Not provided")}</p>
        </div>

        <div class="detail-row">
            <strong>Participant Capacity</strong>
            <p>${escapeHTML(event.eventCapacity || "Not specified")}</p>
        </div>

        <div class="detail-row">
            <strong>Description</strong>
            <p>${escapeHTML(event.eventDescription)}</p>
        </div>
    `;

    detailsModal.style.display = "flex";
}

// Close event details modal
function closeModal() {
    detailsModal.style.display = "none";
}

// Close modal when clicking outside it
detailsModal.addEventListener("click", function (e) {
    if (e.target === detailsModal) {
        closeModal();
    }
});

// Edit an existing event
function editEvent(id) {
    const event = events.find(event => event.id === id);

    if (!event) return;

    editingId = id;

    document.getElementById("eventTitle").value = event.title;
    document.getElementById("createdDate").value = event.createdDate;
    document.getElementById("eventDate").value = event.eventDate;
    document.getElementById("eventTime").value = event.eventTime || "";
    document.getElementById("eventType").value = event.eventType;
    document.getElementById("eventLocation").value = event.eventLocation || "";
    document.getElementById("eventOrganizer").value = event.eventOrganizer || "";
    document.getElementById("eventCapacity").value = event.eventCapacity || "";
    document.getElementById("eventDescription").value = event.eventDescription;

    document.getElementById("formHeading").textContent = "Edit Event";
    saveBtn.textContent = "Update Event";
    formMessage.textContent = "";

    showForm();
}

// Delete an event
function deleteEvent(id) {
    const event = events.find(event => event.id === id);

    if (!event) return;

    const confirmed = confirm(
        `Are you sure you want to delete "${event.title}"?`
    );

    if (confirmed) {
        events = events.filter(event => event.id !== id);

        saveEvents();
        renderEvents();

        if (editingId === id) {
            resetForm();
            hideForm();
        }
    }
}

// Search and filters
searchInput.addEventListener("input", renderEvents);
filterType.addEventListener("change", renderEvents);
filterStatus.addEventListener("change", renderEvents);

// Dark mode toggle
const themeBtn = document.getElementById("themeBtn");

// Restore saved theme
if (localStorage.getItem("eventTheme") === "dark") {
    document.body.classList.add("dark");
    themeBtn.textContent = "☀️ Light Mode";
}

themeBtn.addEventListener("click", function () {
    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");

    localStorage.setItem("eventTheme", isDark ? "dark" : "light");

    themeBtn.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
});

// Initial page load
renderEvents();