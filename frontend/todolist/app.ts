
interface Task {
    id: string;
    name: string;
    dueDate: string;
    completed: boolean;
}

const STORAGE_KEY: string = "todoTasks";

const form = document.getElementById("todo-form") as HTMLFormElement;
const nameInput = document.getElementById("task-name") as HTMLInputElement;
const dateInput = document.getElementById("due-date") as HTMLInputElement;
const taskList = document.getElementById("task-list") as HTMLUListElement;
const summary = document.getElementById("task-summary") as HTMLParagraphElement;
const emptyMessage = document.getElementById("empty-message") as HTMLParagraphElement;

function loadTasks(): Task[] {
    try {
        const savedTasks: string | null = localStorage.getItem(STORAGE_KEY);

        if (savedTasks === null) {
            return [];
        }

        const parsed: unknown = JSON.parse(savedTasks);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.filter((task: unknown): task is Task => {
            if (typeof task !== "object" || task === null) {
                return false;
            }

            const item = task as Record<string, unknown>;

            return (
                typeof item.id === "string" &&
                typeof item.name === "string" &&
                typeof item.dueDate === "string" &&
                typeof item.completed === "boolean"
            );
        });
    } catch {
        return [];
    }
}

let tasks: Task[] = loadTasks();

function saveTasks(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function renderTasks(): void {
    taskList.replaceChildren();

    const pendingCount: number = tasks.filter(
        (task: Task) => !task.completed
    ).length;

    const completedCount: number = tasks.length - pendingCount;

    summary.textContent =
        `Pending: ${pendingCount} | Completed: ${completedCount}`;

    emptyMessage.hidden = tasks.length > 0;

    tasks.forEach((task: Task) => {
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
            tasks = tasks.filter(
                (item: Task) => item.id !== task.id
            );

            saveTasks();
            renderTasks();
        });

        li.append(checkbox, details, deleteButton);
        taskList.appendChild(li);
    });
}

form.addEventListener("submit", (event: SubmitEvent) => {
    event.preventDefault();

    const name: string = nameInput.value.trim();
    const dueDate: string = dateInput.value;

    if (name === "" || dueDate === "") {
        alert("Please enter a task name and due date.");
        return;
    }

    const newTask: Task = {
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
