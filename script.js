
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

// Remember which event is being edited
let editingEventId = null;

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
// LOAD EVENTS FROM LOCALSTORAGE
// ============================================

let events = [];

try {
    const savedEvents = localStorage.getItem("myEvents");

    if (savedEvents) {
        const parsedEvents = JSON.parse(savedEvents);

        if (Array.isArray(parsedEvents)) {
            events = parsedEvents.filter(function (item) {
                return item &&
                    typeof item.id === "string" &&
                    typeof item.title === "string" &&
                    typeof item.createdDate === "string" &&
                    typeof item.eventDate === "string" &&
                    typeof item.type === "string" &&
                    typeof item.description === "string";
            });
        }
    }
} catch (error) {
    events = [];
    console.error("Could not load saved events.", error);
}

// ============================================
// SAVE EVENTS
// ============================================

function saveEvents() {
    try {
        localStorage.setItem("myEvents", JSON.stringify(events));
        return true;
    } catch (error) {
        console.error("Could not save events.", error);
        showMessage(
            "Could not save data. Browser storage may be unavailable.",
            "error"
        );
        return false;
    }
}

// ============================================
// SUCCESS AND ERROR MESSAGES
// ============================================

function showMessage(text, type) {
    message.textContent = text;
    message.className = "message " + type;
}

// ============================================
// CLEAR AND RESET THE FORM
// ============================================

function clearForm() {
    eventForm.reset();
    editingEventId = null;

    formHeading.textContent = "Add New Event";
    submitButton.textContent = "＋ Add Event";
    cancelButton.hidden = true;

    createdDate.value = getToday();
}

// ============================================
// FORM VALIDATION
// ============================================

function isValidDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const parts = value.split("-").map(Number);

    const date = new Date(
        parts[0],
        parts[1] - 1,
        parts[2]
    );

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

    const allowedTypes = [
        "Sports Gala",
        "Farewell Party",
        "Seminar",
        "Workshop",
        "Other"
    ];

    if (!allowedTypes.includes(type)) {
        showMessage("Please select a valid event type.", "error");
        return false;
    }

    if (!isValidDate(created) || !isValidDate(date)) {
        showMessage("Please enter valid dates.", "error");
        return false;
    }

    if (date < created) {
        showMessage(
            "Event date cannot be earlier than created date.",
            "error"
        );
        return false;
    }

    if (title.length > 100 || eventDescription.length > 1000) {
        showMessage("Please check the length of your information.", "error");
        return false;
    }

    return true;
}

// ============================================
// CREATE OR UPDATE EVENT
// ============================================

eventForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!validateForm()) {
        return;
    }

    // Collect the form information
    const eventData = {
        title: eventTitle.value.trim(),
        createdDate: createdDate.value,
        eventDate: eventDate.value,
        type: eventType.value,
        description: description.value.trim()
    };

    const previousEvents = events;

    // UPDATE an existing event
    if (editingEventId !== null) {
        const index = events.findIndex(function (item) {
            return item.id === editingEventId;
        });

        if (index === -1) {
            showMessage("Event not found.", "error");
            clearForm();
            return;
        }

        events = events.slice();

        // Keep the original ID to prevent duplicates
        events[index] = {
            id: events[index].id,
            ...eventData
        };

        if (saveEvents()) {
            renderEvents();
            clearForm();
            showMessage("Event updated successfully!", "success");
        } else {
            events = previousEvents;
        }

    } else {
        // CREATE a new event
        const newEvent = {
            id: Date.now().toString() + "-" +
                Math.random().toString(36).slice(2),
            ...eventData
        };

        events = events.concat(newEvent);

        if (saveEvents()) {
            renderEvents();
            clearForm();
            showMessage("Event added successfully!", "success");
        } else {
            events = previousEvents;
        }
    }
});

// ============================================
// EVENT CARD COLORS AND ICONS
// ============================================

function getEventStyle(type) {
    const styles = {
        "Sports Gala": {
            cover: "cover-purple",
            icon: "⚽"
        },
        "Farewell Party": {
            cover: "cover-pink",
            icon: "🎉"
        },
        "Seminar": {
            cover: "cover-blue",
            icon: "🎓"
        },
        "Workshop": {
            cover: "cover-green",
            icon: "💻"
        },
        "Other": {
            cover: "cover-indigo",
            icon: "🎵"
        }
    };

    return styles[type] || {
        cover: "cover-orange",
        icon: "✦"
    };
}

// ============================================
// CREATE A SAFE TEXT ELEMENT
// ============================================

function createTextElement(tag, className, text) {
    const element = document.createElement(tag);

    element.className = className;
    element.textContent = text;

    return element;
}

// ============================================
// DISPLAY EVENTS AND UPDATE DASHBOARD
// ============================================

function renderEvents() {
    eventsContainer.replaceChildren();

    const searchText = searchInput.value.trim().toLowerCase();
    const selectedType = filterType.value;
    const today = getToday();

    const now = new Date();

    const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
    const currentYear = String(now.getFullYear());

    // Update dashboard statistics
    totalEvents.textContent = events.length;

    upcomingEvents.textContent = events.filter(function (item) {
        return item.eventDate >= today;
    }).length;

    monthlyEvents.textContent = events.filter(function (item) {
        return item.eventDate.startsWith(currentYear + "-" + currentMonth);
    }).length;

    // Search and filter events
    const filteredEvents = events.filter(function (item) {
        const matchesSearch = item.title.toLowerCase().includes(searchText);

        const matchesType =
            selectedType === "All" || item.type === selectedType;

        return matchesSearch && matchesType;
    });

    shownEvents.textContent = filteredEvents.length;

    // Display the empty state when needed
    if (filteredEvents.length === 0) {
        const emptyBox = document.createElement("div");
        emptyBox.className = "empty-message";

        const icon = createTextElement("div", "empty-icon", "▦");
        const heading = createTextElement(
            "h3",
            "",
            events.length === 0
                ? "No events added yet!"
                : "No matching events found."
        );

        const paragraph = createTextElement(
            "p",
            "",
            events.length === 0
                ? "Add your first event to get started."
                : "Try another title or event type."
        );

        emptyBox.append(icon, heading, paragraph);

        if (events.length === 0) {
            const addButton = createTextElement(
                "button",
                "btn btn-primary",
                "＋ Add Event"
            );

            addButton.type = "button";

            addButton.addEventListener("click", function () {
                document.getElementById("eventFormSection").scrollIntoView({
                    behavior: "smooth"
                });
                eventTitle.focus();
            });

            emptyBox.appendChild(addButton);
        }

        eventsContainer.appendChild(emptyBox);
        return;
    }

    // Create cards for each event
    filteredEvents.forEach(function (item) {
        const style = getEventStyle(item.type);

        const card = document.createElement("article");
        card.className = "event-card";

        // Colorful cover
        const cover = document.createElement("div");
        cover.className = "event-cover " + style.cover;

        const badge = createTextElement(
            "span",
            "cover-badge",
            item.type
        );

        const dateBadge = createTextElement(
            "span",
            "cover-date",
            item.eventDate
        );

        const coverIcon = createTextElement(
            "span",
            "cover-icon",
            style.icon
        );

        cover.append(badge, dateBadge, coverIcon);

        // Card information
        const body = document.createElement("div");
        body.className = "event-card-body";

        const title = createTextElement("h3", "", item.title);

        const created = createTextElement(
            "p",
            "event-meta",
            "▦  Created: " + item.createdDate
        );

        const typeLine = createTextElement(
            "p",
            "event-meta",
            "◇  " + item.type
        );

        const descriptionText = item.description.length > 95
            ? item.description.substring(0, 95) + "..."
            : item.description;

        const descriptionElement = createTextElement(
            "p",
            "event-description",
            descriptionText
        );

        // Card action buttons
        const buttons = document.createElement("div");
        buttons.className = "card-buttons";

        const viewButton = createTextElement(
            "button", "btn btn-view", "◎ View Details"
        );
        viewButton.type = "button";

        const editButton = createTextElement(
            "button", "btn btn-edit", "✎ Edit"
        );
        editButton.type = "button";

        const deleteButton = createTextElement(
            "button", "btn btn-delete", "♲ Delete"
        );
        deleteButton.type = "button";

        viewButton.addEventListener("click", function () {
            viewEvent(item.id);
        });

        editButton.addEventListener("click", function () {
            editEvent(item.id);
        });

        deleteButton.addEventListener("click", function () {
            deleteEvent(item.id);
        });

        buttons.append(viewButton, editButton, deleteButton);

        body.append(title, created, typeLine, descriptionElement, buttons);

        card.append(cover, body);

        eventsContainer.appendChild(card);
    });
}

// ============================================
// READ: VIEW EVENT DETAILS
// ============================================

function viewEvent(id) {
    const item = events.find(function (event) {
        return event.id === id;
    });

    if (!item) {
        showMessage("Event not found.", "error");
        return;
    }

    const style = getEventStyle(item.type);

    document.getElementById("modalTitle").textContent = item.title;
    document.getElementById("modalType").textContent = item.type;
    document.getElementById("modalEventDate").textContent = item.eventDate;
    document.getElementById("modalCreatedDate").textContent = item.createdDate;
    document.getElementById("modalDescription").textContent = item.description;

    document.getElementById("modalBannerIcon").textContent = style.icon;
    document.getElementById("modalBanner").className =
        "modal-banner " + style.cover;

    detailsModal.hidden = false;
    closeModal.focus();
}

// ============================================
// UPDATE: EDIT EVENT
// ============================================

function editEvent(id) {
    const item = events.find(function (event) {
        return event.id === id;
    });

    if (!item) {
        showMessage("Event not found.", "error");
        return;
    }

    editingEventId = id;

    // Fill the form with existing information
    eventTitle.value = item.title;
    createdDate.value = item.createdDate;
    eventDate.value = item.eventDate;
    eventType.value = item.type;
    description.value = item.description;

    // Change form heading and button
    formHeading.textContent = "Update Your Event";
    submitButton.textContent = "↻ Update Event";
    cancelButton.hidden = false;

    showMessage("Edit the details and click Update Event.", "success");

    document.getElementById("eventFormSection").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// ============================================
// DELETE EVENT
// ============================================

function deleteEvent(id) {
    const item = events.find(function (event) {
        return event.id === id;
    });

    if (!item) {
        showMessage("Event not found.", "error");
        return;
    }

    const confirmed = confirm(
        'Are you sure you want to delete "' + item.title + '"?'
    );

    if (!confirmed) {
        return;
    }

    const previousEvents = events;

    events = events.filter(function (event) {
        return event.id !== id;
    });

    if (saveEvents()) {
        if (editingEventId === id) {
            clearForm();
        }

        renderEvents();
        showMessage("Event deleted successfully!", "success");
    } else {
        events = previousEvents;
    }
}

// ============================================
// FORM BUTTONS
// ============================================

cancelButton.addEventListener("click", function () {
    clearForm();
    showMessage("Editing cancelled.", "success");
});

clearButton.addEventListener("click", function () {
    clearForm();
    showMessage("Form cleared.", "success");
});

// ============================================
// SEARCH AND FILTER
// ============================================

searchInput.addEventListener("input", renderEvents);
filterType.addEventListener("change", renderEvents);

// ============================================
// CLOSE DETAILS MODAL
// ============================================

function hideModal() {
    detailsModal.hidden = true;
}

closeModal.addEventListener("click", hideModal);
modalCloseButton.addEventListener("click", hideModal);

detailsModal.addEventListener("click", function (event) {
    if (event.target === detailsModal) {
        hideModal();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !detailsModal.hidden) {
        hideModal();
    }
});

// ============================================
// DYNAMIC LIGHT AND DARK THEME
// ============================================

function updateThemeIcon() {
    const isDark = document.body.classList.contains("dark-theme");

    themeIcon.textContent = isDark ? "☀" : "☾";
    themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light theme" : "Switch to dark theme"
    );
}

function loadTheme() {
    try {
        const savedTheme = localStorage.getItem("eventTheme");

        if (savedTheme === "dark") {
            document.body.classList.add("dark-theme");
        }
    } catch (error) {
        console.log("Using the default light theme.");
    }

    updateThemeIcon();
}

themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-theme");

    const isDark = document.body.classList.contains("dark-theme");

    try {
        localStorage.setItem("eventTheme", isDark ? "dark" : "light");
    } catch (error) {
        console.log("Theme preference could not be saved.");
    }

    updateThemeIcon();
});

// ============================================
// START THE WEBSITE
// ============================================

createdDate.value = getToday();

loadTheme();
renderEvents();