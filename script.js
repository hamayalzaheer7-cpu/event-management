// ============================================
// EVENT MANAGEMENT SYSTEM - JAVASCRIPT
// ============================================

// Get HTML elements
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

let editingEventId = null;

// Pre-defined college events info for modal details
const collegeEventInfo = {
    "Sports Gala": {
        title: "Inter-Department Sports Gala",
        date: "2026-10-15",
        type: "Sport's Gala",
        description: "Annual inter-department tournament featuring cricket, football, athletics, and badminton championships."
    },
    "Music Night": {
        title: "Annual Music Night",
        date: "2026-10-22",
        type: "Music Night",
        description: "An electrifying evening featuring live student performances, beatboxing, battle of bands, and guest singers."
    },
    "Culture Day": {
        title: "Traditional Culture Day",
        date: "2026-11-05",
        type: "Culture Day",
        description: "Celebrate regional heritage with traditional dress shows, cultural food stalls, poetry recitation, and folk dances."
    },
    "Society Fair": {
        title: "University Society Fair",
        date: "2026-11-12",
        type: "Society Fair",
        description: "Explore campus societies, project exhibitions, coding hackathons, literature debates, and robotics displays."
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
        options = ["General Attendee", "Volunteer", "Organizer"];
    }

    options.forEach(function (opt) {
        const label = document.createElement("label");
        label.className = "participation-chip";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "participation-checkbox";
        checkbox.value = opt;

        const span = document.createElement("span");
        span.textContent = opt;

        label.append(checkbox, span);
        participationContainer.appendChild(label);
    });
}

function applyForCollegeEvent(eventName) {
    eventType.value = eventName;
    eventTitle.value = eventName + " Registration";
    if (collegeEventInfo[eventName]) {
        eventDate.value = collegeEventInfo[eventName].date;
    }
    updateParticipationOptions();

    document.getElementById("eventFormSection").scrollIntoView({ behavior: "smooth" });
    eventTitle.focus();
    showMessage("Form populated for " + eventName + "! Fill in your details and submit.", "success");
}

function showCollegeEventDetails(eventName) {
    const info = collegeEventInfo[eventName];
    if (!info) return;

    const style = getEventStyle(info.type);

    document.getElementById("modalTitle").textContent = info.title;
    document.getElementById("modalType").textContent = info.type;
    document.getElementById("modalEventDate").textContent = info.date;
    document.getElementById("modalCreatedDate").textContent = "Official College Schedule";
    document.getElementById("modalDescription").textContent = info.description;

    document.getElementById("modalBannerIcon").textContent = style.icon;
    document.getElementById("modalBanner").className = "modal-banner " + style.cover;

    detailsModal.hidden = false;
    closeModal.focus();
}

// DATE HELPER
function getToday() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// LOAD EVENTS FROM LOCALSTORAGE
let events = [];

try {
    const savedEvents = localStorage.getItem("collegeEventsData");
    if (savedEvents) {
        const parsedEvents = JSON.parse(savedEvents);
        if (Array.isArray(parsedEvents)) {
            events = parsedEvents;
        }
    }
} catch (error) {
    events = [];
    console.error("Could not load saved events.", error);
}

function saveEvents() {
    try {
        localStorage.setItem("collegeEventsData", JSON.stringify(events));
        return true;
    } catch (error) {
        console.error("Could not save events.", error);
        showMessage("Could not save data. Storage unavailable.", "error");
        return false;
    }
}

function showMessage(text, type) {
    message.textContent = text;
    message.className = "message " + type;
}

function clearForm() {
    eventForm.reset();
    editingEventId = null;

    formHeading.textContent = "Event Registration & Participation";
    submitButton.textContent = "＋ Submit Registration";
    cancelButton.hidden = true;

    createdDate.value = getToday();
    participationContainer.innerHTML = '<span class="muted-text">Please select an event type above to view participation options.</span>';
}

function isValidDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parts = value.split("-").map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    return date.getFullYear() === parts[0] &&
        date.getMonth() === parts[1] - 1 &&
        date.getDate() === parts[2];
}

function validateForm() {
    const title = eventTitle.value.trim();
    const created = createdDate.value;
    const date = eventDate.value;
    const type = eventType.value;
    const eventDescription = description.value.trim();

    if (!title || !created || !date || !type || !eventDescription) {
        showMessage("Please fill in all required fields.", "error");
        return false;
    }

    if (!isValidDate(created) || !isValidDate(date)) {
        showMessage("Please enter valid dates.", "error");
        return false;
    }

    return true;
}

// CREATE OR UPDATE EVENT (CRUD)
eventForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!validateForm()) return;

    // Collect checked participation activities
    const selectedParticipations = [];
    document.querySelectorAll(".participation-checkbox:checked").forEach(function (cb) {
        selectedParticipations.push(cb.value);
    });

    const eventData = {
        title: eventTitle.value.trim(),
        createdDate: createdDate.value,
        eventDate: eventDate.value,
        type: eventType.value,
        description: description.value.trim(),
        participations: selectedParticipations
    };

    const previousEvents = events;

    if (editingEventId !== null) {
        const index = events.findIndex(item => item.id === editingEventId);
        if (index === -1) {
            showMessage("Event not found.", "error");
            clearForm();
            return;
        }

        events = events.slice();
        events[index] = { id: events[index].id, ...eventData };

        if (saveEvents()) {
            renderEvents();
            clearForm();
            showMessage("Registration updated successfully!", "success");
        } else {
            events = previousEvents;
        }
    } else {
        const newEvent = {
            id: Date.now().toString() + "-" + Math.random().toString(36).slice(2),
            ...eventData
        };

        events = events.concat(newEvent);

        if (saveEvents()) {
            renderEvents();
            clearForm();
            showMessage("Registration submitted successfully!", "success");
        } else {
            events = previousEvents;
        }
    }
});

// EVENT CARD STYLING & ICONS
function getEventStyle(type) {
    const styles = {
        "Sports Gala": { cover: "cover-purple", icon: "⚽" },
        "Music Night": { cover: "cover-pink", icon: "🎉" },
        "Culture Day": { cover: "cover-blue", icon: "🎓" },
        "Society Fair": { cover: "cover-green", icon: "💻" },
        "Other": { cover: "cover-indigo", icon: "🎵" }
    };
    return styles[type] || { cover: "cover-orange", icon: "✦" };
}

function createTextElement(tag, className, text) {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = text;
    return element;
}

// RENDER EVENTS AND DASHBOARD STATS
function renderEvents() {
    eventsContainer.replaceChildren();

    const searchText = searchInput.value.trim().toLowerCase();
    const selectedType = filterType.value;
    const today = getToday();
    const now = new Date();
    const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
    const currentYear = String(now.getFullYear());

    totalEvents.textContent = events.length;

    upcomingEvents.textContent = events.filter(item => item.eventDate >= today).length;

    monthlyEvents.textContent = events.filter(item => item.eventDate.startsWith(currentYear + "-" + currentMonth)).length;

    const filteredEvents = events.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchText);
        const matchesType = selectedType === "All" || item.type === selectedType;
        return matchesSearch && matchesType;
    });

    shownEvents.textContent = filteredEvents.length;

    if (filteredEvents.length === 0) {
        const emptyBox = document.createElement("div");
        emptyBox.className = "empty-message";

        const icon = createTextElement("div", "empty-icon", "▦");
        const heading = createTextElement("h3", "", events.length === 0 ? "No registrations added yet!" : "No matching records found.");
        const paragraph = createTextElement("p", "", events.length === 0 ? "Fill out the form above or click Apply Now on any college card." : "Try another title or event type.");

        emptyBox.append(icon, heading, paragraph);
        eventsContainer.appendChild(emptyBox);
        return;
    }

    filteredEvents.forEach(item => {
        const style = getEventStyle(item.type);

        const card = document.createElement("article");
        card.className = "event-card";

        const cover = document.createElement("div");
        cover.className = "event-cover " + style.cover;

        const badge = createTextElement("span", "cover-badge", item.type);
        const dateBadge = createTextElement("span", "cover-date", item.eventDate);
        const coverIcon = createTextElement("span", "cover-icon", style.icon);

        cover.append(badge, dateBadge, coverIcon);

        const body = document.createElement("div");
        body.className = "event-card-body";

        const title = createTextElement("h3", "", item.title);
        const created = createTextElement("p", "event-meta", "▦  Registered: " + item.createdDate);
        const typeLine = createTextElement("p", "event-meta", "◇  " + item.type);

        let partSummary = item.participations && item.participations.length > 0 
            ? "Participating in: " + item.participations.join(", ") 
            : item.description;

        const descEl = createTextElement("p", "event-description", partSummary.length > 95 ? partSummary.substring(0, 95) + "..." : partSummary);

        const buttons = document.createElement("div");
        buttons.className = "card-buttons";

        const viewButton = createTextElement("button", "btn btn-view", "◎ View Details");
        viewButton.type = "button";
        const editButton = createTextElement("button", "btn btn-edit", "✎ Edit");
        editButton.type = "button";
        const deleteButton = createTextElement("button", "btn btn-delete", "♲ Delete");
        deleteButton.type = "button";

        viewButton.addEventListener("click", () => viewEvent(item.id));
        editButton.addEventListener("click", () => editEvent(item.id));
        deleteButton.addEventListener("click", () => deleteEvent(item.id));

        buttons.append(viewButton, editButton, deleteButton);
        body.append(title, created, typeLine, descEl, buttons);
        card.append(cover, body);

        eventsContainer.appendChild(card);
    });
}

// VIEW, EDIT, DELETE (CRUD OPERATIONS)
function viewEvent(id) {
    const item = events.find(event => event.id === id);
    if (!item) return;

    const style = getEventStyle(item.type);

    document.getElementById("modalTitle").textContent = item.title;
    document.getElementById("modalType").textContent = item.type;
    document.getElementById("modalEventDate").textContent = item.eventDate;
    document.getElementById("modalCreatedDate").textContent = item.createdDate;
    
    let fullDesc = item.description;
    if (item.participations && item.participations.length > 0) {
        fullDesc += "\n\nSelected Activities:\n• " + item.participations.join("\n• ");
    }
    document.getElementById("modalDescription").textContent = fullDesc;

    document.getElementById("modalBannerIcon").textContent = style.icon;
    document.getElementById("modalBanner").className = "modal-banner " + style.cover;

    detailsModal.hidden = false;
    closeModal.focus();
}

function editEvent(id) {
    const item = events.find(event => event.id === id);
    if (!item) return;

    editingEventId = id;

    eventTitle.value = item.title;
    createdDate.value = item.createdDate;
    eventDate.value = item.eventDate;
    eventType.value = item.type;
    description.value = item.description;

    updateParticipationOptions();

    if (item.participations) {
        item.participations.forEach(val => {
            const cb = document.querySelector(`.participation-checkbox[value="${val}"]`);
            if (cb) cb.checked = true;
        });
    }

    formHeading.textContent = "Update Registration Record";
    submitButton.textContent = "↻ Update Registration";
    cancelButton.hidden = false;

    showMessage("Edit details and click Update Registration.", "success");

    document.getElementById("eventFormSection").scrollIntoView({ behavior: "smooth", block: "start" });
}

function deleteEvent(id) {
    const item = events.find(event => event.id === id);
    if (!item) return;

    if (!confirm('Are you sure you want to delete "' + item.title + '"?')) return;

    const previousEvents = events;
    events = events.filter(event => event.id !== id);

    if (saveEvents()) {
        if (editingEventId === id) clearForm();
        renderEvents();
        showMessage("Registration deleted successfully!", "success");
    } else {
        events = previousEvents;
    }
}

// Form buttons
cancelButton.addEventListener("click", () => { clearForm(); showMessage("Editing cancelled.", "success"); });
clearButton.addEventListener("click", () => { clearForm(); showMessage("Form cleared.", "success"); });
searchInput.addEventListener("input", renderEvents);
filterType.addEventListener("change", renderEvents);

// Modal Close Handlers
function hideModal() { detailsModal.hidden = true; }
closeModal.addEventListener("click", hideModal);
modalCloseButton.addEventListener("click", hideModal);
detailsModal.addEventListener("click", (e) => { if (e.target === detailsModal) hideModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !detailsModal.hidden) hideModal(); });

// Theme toggle
function updateThemeIcon() {
    const isDark = document.body.classList.contains("dark-theme");
    themeIcon.textContent = isDark ? "☀" : "☾";
}

function loadTheme() {
    try {
        if (localStorage.getItem("eventTheme") === "dark") {
            document.body.classList.add("dark-theme");
        }
    } catch (e) {}
    updateThemeIcon();
}

themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-theme");
    const isDark = document.body.classList.contains("dark-theme");
    try { localStorage.setItem("eventTheme", isDark ? "dark" : "light"); } catch (e) {}
    updateThemeIcon();
});

// Initialization
createdDate.value = getToday();
loadTheme();
renderEvents();