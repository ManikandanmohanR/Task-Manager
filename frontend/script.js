const API = "http://127.0.0.1:8000/tasks";

// Get all tasks
async function loadTasks() {

    const response = await fetch(API);
    const tasks = await response.json();

    const filter = document.getElementById("filter").value;
    const list = document.getElementById("taskList");

    const completedCount = tasks.filter(task => task.completed).length;
    document.getElementById("allCount").textContent = tasks.length;
    document.getElementById("completedCount").textContent = completedCount;
    document.getElementById("pendingCount").textContent =
        tasks.length - completedCount;

    list.innerHTML = "";

    let filteredTasks = tasks;

    if (filter === "completed") {
        filteredTasks = tasks.filter(t => t.completed);
    }

    if (filter === "pending") {
        filteredTasks = tasks.filter(t => !t.completed);
    }

    filteredTasks.forEach(task => {

        list.innerHTML += `
            <div class="task">

                <h3 class="${task.completed ? 'completed' : ''}">
                    ${escapeHTML(task.title)}
                </h3>

                <p>${escapeHTML(task.description || "")}</p>

                <p>Status:
                    ${task.completed ? "Completed" : "Pending"}
                </p>

                <button onclick="editTask(${task.id})">
                    Edit
                </button>

                <button onclick="completeTask(
                    ${task.id},
                    '${task.completed}'
                )">
                    Complete
                </button>

                <button onclick="deleteTask(${task.id})">
                    Delete
                </button>

            </div>
        `;
    });
}


// Prevent HTML injection when displaying task text
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}


// Add task
async function addTask() {

    const title = document.getElementById("title").value;
    const description =
        document.getElementById("description").value;

    if (!title.trim()) {
        alert("Please enter task title");
        return;
    }

    await fetch(API, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: title,
            description: description,
            completed: false
        })
    });

    document.getElementById("title").value = "";
    document.getElementById("description").value = "";

    loadTasks();
}


// Edit task
async function editTask(id) {

    const title = prompt("Enter new task title");

    if (title === null || !title.trim()) return;

    const response = await fetch(API);
    const tasks = await response.json();

    const task = tasks.find(t => t.id === id);

    if (!task) return;

    await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: title,
            description: task.description,
            completed: task.completed
        })
    });

    loadTasks();
}


// Mark task completed or pending
async function completeTask(id, status) {

    const response = await fetch(API);
    const tasks = await response.json();

    const task = tasks.find(t => t.id === id);

    if (!task) return;

    await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: task.title,
            description: task.description,
            completed: status !== "true"
        })
    });

    loadTasks();
}


// Delete task
async function deleteTask(id) {

    if (!confirm("Are you sure you want to delete?")) return;

    await fetch(`${API}/${id}`, {
        method: "DELETE"
    });

    loadTasks();
}


// Load tasks when page opens
loadTasks();