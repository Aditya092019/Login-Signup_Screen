"use strict";
const STORAGE_KEY = "todoTasks";
const form = document.getElementById("todo-form");
const nameInput = document.getElementById("task-name");
const dateInput = document.getElementById("due-date");
const taskList = document.getElementById("task-list");
const summary = document.getElementById("task-summary");
const emptyMessage = document.getElementById("empty-message");
function loadTasks() {
    try {
        const savedTasks = localStorage.getItem(STORAGE_KEY);
        if (savedTasks === null) {
            return [];
        }
        const parsed = JSON.parse(savedTasks);
        if (!Array.isArray(parsed)) {
            return [];
        }
        return parsed.filter((task) => {
            if (typeof task !== "object" || task === null) {
                return false;
            }
            const item = task;
            return (typeof item.id === "string" &&
                typeof item.name === "string" &&
                typeof item.dueDate === "string" &&
                typeof item.completed === "boolean");
        });
    }
    catch {
        return [];
    }
}
let tasks = loadTasks();
function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
function renderTasks() {
    taskList.replaceChildren();
    const pendingCount = tasks.filter((task) => !task.completed).length;
    const completedCount = tasks.length - pendingCount;
    summary.textContent =
        `Pending: ${pendingCount} | Completed: ${completedCount}`;
    emptyMessage.hidden = tasks.length > 0;
    tasks.forEach((task) => {
        const li = document.createElement("li");
        li.className = "task-item";
        if (task.completed) {
            li.classList.add("completed");
        }
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", `Complete ${task.name}`);
        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });
        const details = document.createElement("div");
        details.className = "task-details";
        const taskName = document.createElement("span");
        taskName.className = "task-name";
        taskName.textContent = task.name;
        const taskDate = document.createElement("span");
        taskDate.className = "task-date";
        taskDate.textContent = `Due date: ${task.dueDate}`;
        const status = document.createElement("span");
        status.className = "status";
        status.textContent = task.completed ? "Completed" : "Pending";
        details.append(taskName, taskDate, status);
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => {
            tasks = tasks.filter((item) => item.id !== task.id);
            saveTasks();
            renderTasks();
        });
        li.append(checkbox, details, deleteButton);
        taskList.appendChild(li);
    });
}
form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    const dueDate = dateInput.value;
    if (name === "" || dueDate === "") {
        alert("Please enter a task name and due date.");
        return;
    }
    const newTask = {
        id: crypto.randomUUID(),
        name: name,
        dueDate: dueDate,
        completed: false
    };
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    form.reset();
    nameInput.focus();
});
renderTasks();
