// ============================================
// COLLEGE EVENT MANAGEMENT SYSTEM - JAVASCRIPT
// ============================================

// DOM Element References
const eventForm = document.getElementById("eventForm");
const eventTitle = document.getElementById("eventTitle");
const createdDate = document.getElementById("createdDate");
const eventDate = document.getElementById("eventDate");
const eventType = document.getElementById("eventType");
const description = document.getElementById("description");
const participationContainer = document.getElementById("participationContainer");

const submitButton = document.getElementById("submitButton");
const cancelButton = document.getElementById("cancelButton");
const clearButton = document.getElementById("clearButton");
const formHeading = document.getElementById("formHeading");
const message = document.getElementById("message");

const eventsContainer = document.getElementById("eventsContainer");
const totalEvents = document.getElementById("totalEvents");
const upcomingEvents = document.getElementById("upcomingEvents");
const monthlyEvents = document.getElementById("monthlyEvents");
const shownEvents = document.getElementById("shownEvents");

const searchInput = document.getElementById("searchInput");
const filterType = document.getElementById("filterType");

const detailsModal = document.getElementById("detailsModal");
const closeModal = document.getElementById("closeModal");
const modalCloseButton = document.getElementById("modalCloseButton");

const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

// State Management
let editingEventId = null;

// Pre-defined college event information for Details View
const collegeEventInfo = {
    "Sports Gala": {
        title: "Sports Gala 2026",
        date: "2026-10-15",
        type: "Sports Gala",
        description: "The biggest annual sports festival! Events include Cricket tournament, 100m sprint, Tug of war, and Badminton championships. Open to all registered students."
    },
    "Music Night": {
        title: "Music Night Extravaganza",
        date: "2026-10-22",
        type: "Music Night",
        description: "An incredible evening of melody and rhythm. Featuring acoustic performances, battle of the bands, and celebrity student singers."
    },
    "Culture Day": {
        title: "Traditional Culture Day",
        date: "2026-11-05",
        type: "Culture Day",
        description: "Showcasing provincial diversity with cultural dresses, regional cuisine stalls, poetry recitation, and traditional folk dances."
    },
    "Society Fair": {
        title: "Annual Society Fair",
        date: "2026-11-12",
        type: "Society Fair",
        description: "Explore campus societies, witness robotics displays, coding competition finals, literature debates, and art exhibitions."
    }
};

// ============================================
// DYNAMIC PARTICIPATION OPTIONS LOGIC
// ============================================
function updateParticipationOptions() {
    const selectedType = eventType.value;
    participationContainer.innerHTML = "";

    let options = [];
    if (selectedType === "Sports Gala") {
        options = ["Cricket Team", "Football Team", "Athletics (100m)", "Badminton", "Tug of War"];
    } else if (selectedType === "Music Night") {
        options = ["Solo Singing", "Band Performance", "Beatboxing", "Host / Emcee", "Audience Seating"];
    } else if (selectedType === "Culture Day") {
        options = ["Traditional Dress Ramp Walk", "Cultural Dance", "Food Stall Organizer", "Poetry Recitation"];
    } else if (selectedType === "Society Fair") {
        options = ["Project Exhibitor", "Coding Hackathon", "Robotics Display", "Literature Debate"];
    } else {
        options = ["General General Participant", "Volunteer", "Organizer"];
    }

    options.forEach(function (opt) {
        const div = document.createElement("div");
        div.className = "form-check form-check-inline";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "form-check-input participation-checkbox";
        checkbox.name = "participation";
        checkbox.value = opt;
        checkbox.id = "part_" + opt.replace(/\s+/g, '_');

        const label = document.createElement("label");
        label.className = "form-check-label small";
        label.htmlFor = checkbox.id;
        label.textContent = opt;

        div.append(checkbox, label);
        participationContainer.appendChild(div);
    });
}

// Pre-fill form and scroll down when clicking "Apply Now" on featured cards
function applyForCollegeEvent(eventName) {
    eventType.value = eventName;
    eventTitle.value = eventName + " Registration";
    updateParticipationOptions();
    
    document.getElementById("eventFormSection").scrollIntoView({ behavior: "smooth" });
    eventTitle.focus();
    showMessage("Form populated for " + eventName + "! Fill in your details and submit.", "success");
}

// Show modal details for pre-defined college events
function showCollegeEventDetails(eventName) {
    const info = collegeEventInfo[eventName];
    if (!info) return;

    document.getElementById("modalTitle").textContent = info.title;
    document.getElementById("modalType").textContent = info.type;
    document.getElementById("modalEventDate").textContent = info.date;
    document.getElementById("modalCreatedDate").textContent = "Official College Schedule";
    document.getElementById("modalDescription").textContent = info.description;
    document.getElementById("modalBannerIcon").textContent = "🎓";

    detailsModal.hidden = false;
    detailsModal.style.display = "block";
}

// ============================================
// DATE HELPER
// ============================================
function getToday() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// ============================================
// LOCAL STORAGE DATA LOADING (CRUD - Read)
// ============================================
let events = [];

try {
    const savedEvents = localStorage.getItem("collegeEventsData");
    if (savedEvents) {
        const parsed = JSON.parse(savedEvents);
        if (Array.isArray(parsed)) {
            events = parsed;
        }
    }
} catch (err) {
    events = [];
    console.error("Error loading local storage data", err);
}

// Save to LocalStorage Function
function saveEvents() {
    try {
        localStorage.setItem("collegeEventsData", JSON.stringify(events));
        return true;
    } catch (err) {
        showMessage("Storage error: Could not save data.", "error");
        return false;
    }
}

// Helper for status messages
function showMessage(text, type) {
    message.textContent = text;
    message.className = "message mt-3 fw-bold small " + (type === "success" ? "text-success" : "text-danger");
}

// Clear Form
function clearForm() {
    eventForm.reset();
    editingEventId = null;
    formHeading.textContent = "Event Registration & Participation";
    submitButton.textContent = "＋ Submit Registration";
    cancelButton.hidden = true;
    createdDate.value = getToday();
    participationContainer.innerHTML = '<span class="text-muted small">Please select an event type above to view participation activities.</span>';
}

// ============================================
// CRUD FORM SUBMISSION (Create & Update)
// ============================================
eventForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const titleVal = eventTitle.value.trim();
    const createdVal = createdDate.value;
    const eventDateVal = eventDate.value;
    const typeVal = eventType.value;
    const descVal = description.value.trim();

    if (!titleVal || !createdVal || !eventDateVal || !typeVal || !descVal) {
        showMessage("Please fill out all required fields.", "error");
        return;
    }

    // Collect selected participation checkboxes
    const selectedParticipations = [];
    document.querySelectorAll(".participation-checkbox:checked").forEach(function (cb) {
        selectedParticipations.push(cb.value);
    });

    const formPayload = {
        title: titleVal,
        createdDate: createdVal,
        eventDate: eventDateVal,
        type: typeVal,
        description: descVal,
        participations: selectedParticipations
    };

    if (editingEventId !== null) {
        // UPDATE existing record
        const index = events.findIndex(item => item.id === editingEventId);
        if (index !== -1) {
            events[index] = { id: editingEventId, ...formPayload };
            if (saveEvents()) {
                renderEvents();
                clearForm();
                showMessage("Registration updated successfully!", "success");
            }
        }
    } else {
        // CREATE new record
        const newRecord = {
            id: Date.now().toString() + "-" + Math.random().toString(36).slice(2),
            ...formPayload
        };
        events.push(newRecord);
        if (saveEvents()) {
            renderEvents();
            clearForm();
            showMessage("Registration added successfully!", "success");
        }
    }
});

// ============================================
// RENDER EVENTS & STATISTICS (CRUD - Read / UI)
// ============================================
function renderEvents() {
    eventsContainer.innerHTML = "";

    const searchText = searchInput.value.trim().toLowerCase();
    const selectedFilter = filterType.value;
    const today = getToday();
    const now = new Date();
    const curMonth = String(now.getMonth() + 1).padStart(2, "0");
    const curYear = String(now.getFullYear());

    // Update Dashboard Metrics
    totalEvents.textContent = events.length;
    upcomingEvents.textContent = events.filter(i => i.eventDate >= today).length;
    monthlyEvents.textContent = events.filter(i => i.eventDate.startsWith(curYear + "-" + curMonth)).length;

    // Filter Logic
    const filtered = events.filter(item => {
        const matchSearch = item.title.toLowerCase().includes(searchText);
        const matchType = selectedFilter === "All" || item.type === selectedFilter;
        return matchSearch && matchType;
    });

    shownEvents.textContent = filtered.length;

    if (filtered.length === 0) {
        eventsContainer.innerHTML = `
            <div class="col-12 text-center py-5 text-muted bg-light rounded-4 border border-dashed">
                <p class="mb-1 fw-bold">No event registrations found.</p>
                <small>Fill out the form above or click "Apply Now" on any college card.</small>
            </div>
        `;
        return;
    }

    filtered.forEach(item => {
        const col = document.createElement("div");
        col.className = "col-md-6 col-lg-4";

        const partText = item.participations && item.participations.length > 0 
            ? item.participations.join(", ") 
            : "General Attendee";

        col.innerHTML = `
            <div class="card h-100 shadow-sm border">
                <div class="card-body d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge bg-primary-subtle text-primary">${item.type}</span>
                        <small class="text-muted">📅 ${item.eventDate}</small>
                    </div>
                    <h5 class="card-title fw-bold text-dark">${item.title}</h5>
                    <p class="card-text text-muted small flex-grow-1 mb-2">${item.description}</p>
                    <div class="mb-3 small text-secondary bg-light p-2 rounded-2">
                        <b>Activities:</b> ${partText}
                    </div>
                    <div class="d-flex gap-2 pt-2 border-top">
                        <button class="btn btn-sm btn-outline-primary w-33" onclick="viewRecord('${item.id}')">Details</button>
                        <button class="btn btn-sm btn-outline-secondary w-33" onclick="editRecord('${item.id}')">Edit</button>
                        <button class="btn btn-sm btn-outline-danger w-33" onclick="deleteRecord('${item.id}')">Delete</button>
                    </div>
                </div>
            </div>
        `;
        eventsContainer.appendChild(col);
    });
}

// ============================================
// CRUD OPERATIONS (Read Details, Update, Delete)
// ============================================
function viewRecord(id) {
    const item = events.find(e => e.id === id);
    if (!item) return;

    document.getElementById("modalTitle").textContent = item.title;
    document.getElementById("modalType").textContent = item.type;
    document.getElementById("modalEventDate").textContent = item.eventDate;
    document.getElementById("modalCreatedDate").textContent = item.createdDate;
    
    let detailsHTML = item.description;
    if (item.participations && item.participations.length > 0) {
        detailsHTML += "<br><br><b>Participating in:</b> " + item.participations.join(", ");
    }
    document.getElementById("modalDescription").innerHTML = detailsHTML;
    document.getElementById("modalBannerIcon").textContent = "📋";

    detailsModal.hidden = false;
    detailsModal.style.display = "block";
}

function editRecord(id) {
    const item = events.find(e => e.id === id);
    if (!item) return;

    editingEventId = id;
    eventTitle.value = item.title;
    createdDate.value = item.createdDate;
    eventDate.value = item.eventDate;
    eventType.value = item.type;
    description.value = item.description;

    updateParticipationOptions();
    
    // Check previously selected checkboxes
    if (item.participations) {
        item.participations.forEach(val => {
            const cb = document.querySelector(`input[value="${val}"]`);
            if (cb) cb.checked = true;
        });
    }

    formHeading.textContent = "Update Registration Record";
    submitButton.textContent = "↻ Update Registration";
    cancelButton.hidden = false;

    document.getElementById("eventFormSection").scrollIntoView({ behavior: "smooth" });
    showMessage("Loaded record for editing.", "success");
}

function deleteRecord(id) {
    if (!confirm("Are you sure you want to delete this registration?")) return;

    events = events.filter(e => e.id !== id);
    if (saveEvents()) {
        if (editingEventId === id) clearForm();
        renderEvents();
        showMessage("Record deleted successfully!", "success");
    }
}

// Modal closing handlers
function hideModal() {
    detailsModal.hidden = true;
    detailsModal.style.display = "none";
}
closeModal.addEventListener("click", hideModal);
modalCloseButton.addEventListener("click", hideModal);

// ============================================
// EVENT LISTENERS & INITIALIZATION
// ============================================
cancelButton.addEventListener("click", clearForm);
clearButton.addEventListener("click", clearForm);
searchInput.addEventListener("input", renderEvents);
filterType.addEventListener("change", renderEvents);

// Theme Toggle
themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-theme");
    const isDark = document.body.classList.contains("dark-theme");
    themeIcon.textContent = isDark ? "☀" : "☾";
    try { localStorage.setItem("collegeTheme", isDark ? "dark" : "light"); } catch(e){}
});

// Load Theme & Start
if (localStorage.getItem("collegeTheme") === "dark") {
    document.body.classList.add("dark-theme");
    themeIcon.textContent = "☀";
}

createdDate.value = getToday();
renderEvents();