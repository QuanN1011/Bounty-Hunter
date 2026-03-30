import {
    getUser,
    getTasks,
    createTask,
    completeTaskAPI,
    deleteTaskAPI,
    updateTaskAPI,
    registerUser,
    loginUser
} from "./api.js";

/* ========= DOM references (dashboard elements) ========= */
const bountyForm = document.getElementById("bounty"); // Display user's bounty, loadUser
const totalBounty = document.getElementById("total-bounty");
const taskList = document.getElementById("task-list"); // Container for task cards, loadTasks
const form = document.getElementById("create-task-form"); // Form for creating new tasks, handleCreateTask  
const level = document.getElementById("level"); // get level
const progress = document.getElementById("progress-fill"); // get porgress fill
const progressText = document.getElementById("progress-text"); // get progress text

/* ========= UI state ========= */
let currentFilter = "all"; // Track current filter state
let currentSort = "none"; // Track current sort state
let searchQuery = ""; // Track current search query (if implementing search)

/* ========= Auth actions ========= */
// function to login 
async function login() {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const data = await loginUser(username, password);

    if (!data.access_token) {
        alert("Login failed");
        return;
    }

    localStorage.setItem("token", data.access_token);
    window.location.href = "index.html";

    console.log("User logged in");

    loadApp();
}

// function to register
async function register() {
  const username = document.getElementById("register-username").value;
  const password = document.getElementById("register-password").value;

  const result = await registerUser(username, password);

  if (!result.ok) {
    alert("Registration failed: " + (result.data?.detail || "Unknown error"));
    return;
  }

  alert("Registration successful. Please log in.");
  window.location.href = "login.html";
}

// function to log out
function logout() {

    localStorage.removeItem("token");

    location.reload();
}

/* ========= Dashboard: user + tasks rendering ========= */
// get user info and update bounty display
async function loadUser() {
    if (!bountyForm || !totalBounty || !level || !progress || !progressText) return;

    const user = await getUser();

    if (!user) return;

    bountyForm.textContent = "Bounty: " + user.bounty;
    totalBounty.textContent = "Total Bounty: " + user.total_bounty;
    level.textContent = "Rank: " + user.level;

    const navUsername = document.getElementById("nav-username");
    if (navUsername){
        navUsername.textContent = user.username;
    }

    progress.style.width = user.progress + "%";
    progressText.textContent = user.progress + "%";
}

// get tasks and display them
async function loadTasks(){

    taskList.innerHTML = "<p>Loading tasks...</p>";

    const data = await getTasks();

    taskList.innerHTML = "";

    if (!data) return;

    let filteredTasks = data;
    filteredTasks = applyFilter(filteredTasks);
    filteredTasks = applySearch(filteredTasks);
    filteredTasks = applySort(filteredTasks);

    for (const task of filteredTasks) {
        const taskItem = createTaskCard(task);
        taskList.appendChild(taskItem);
    }
}

/* ========= Dashboard: task UI + mutations ========= */
// Create a task card element for display
function createTaskCard(task){
    const taskItem = document.createElement("li");
    const completeButton = document.createElement("button");
    const deleteButton = document.createElement("button");
    const updateButton = document.createElement("button");


    taskItem.innerHTML = `
    <div class="task-card">
        <p><strong>ID:</strong> ${task.task_id}</p>
        <h3>${task.name}</h3>
        <p>${task.description}</p>
        <p><strong>Difficulty:</strong> ${task.difficulty}</p>
        <p><strong>Reward:</strong> ${task.reward}</p>
        <p>${task.complete ? "✅ Completed" : "❌ Not Completed"}</p>
    </div>
    `;
    // Add complete button
    completeButton.textContent = "Complete Task";
    if (task.complete) {
        completeButton.disabled = true;
    }
    completeButton.onclick = function(){
        console.log("Completing task: ", task.task_id);
        completeTask(task.task_id);
        
    };
    // Add delete button
    deleteButton.textContent = "Delete Task";
    deleteButton.style.marginLeft = "10px";

    deleteButton.onclick = function(){
        console.log("Deleting task: ", task.task_id);
        deleteTask(task.task_id);
    }

    // add update button
    updateButton.textContent = "Edit Task";
    updateButton.style.marginLeft = "10px";
    
    updateButton.onclick = function(){
        console.log("Updating task: ", task.task_id);
        updateTask(task, taskItem);
    }

    taskItem.querySelector(".task-card").appendChild(completeButton);
    taskItem.querySelector(".task-card").appendChild(deleteButton);
    taskItem.querySelector(".task-card").appendChild(updateButton);
    return taskItem;
}

// Send request to complete a task and update user bounty and task list
async function completeTask(taskId){

    const data = await completeTaskAPI(taskId);

    console.log("Task completion response:", data);

    await loadUser();
    await loadTasks();
}

// delete tasks
async function deleteTask(taskId){

    const data = await deleteTaskAPI(taskId);

    console.log("Delete task response:", data);

    loadTasks();
}

// update tasks
function updateTask(task, taskItem){
    // update task when clicked
    const card = taskItem.querySelector(".task-card");
    card.innerHTML = `
    <input id = "edit-name-${task.task_id}" type="text" value="${task.name}">
    <input id = "edit-description-${task.task_id}" type="text" value="${task.description}">
    <input id = "edit-difficulty-${task.task_id}" type="text" value="${task.difficulty}">
    <input id = "edit-reward-${task.task_id}" type="number" value="${task.reward}">

    <button id="save-button-${task.task_id}">Save</button>
    `;

    document.getElementById(`save-button-${task.task_id}`).onclick = async function(){
        const newName = document.getElementById(`edit-name-${task.task_id}`).value;
        const newDescription = document.getElementById(`edit-description-${task.task_id}`).value;
        const newDifficulty = document.getElementById(`edit-difficulty-${task.task_id}`).value;
        const newReward = parseInt(document.getElementById(`edit-reward-${task.task_id}`).value);

        if (!newName || !newDescription || !newDifficulty || isNaN(newReward) || newReward <= 0) {
            alert("Please fill in all fields with valid values.");
            return;
        }

        const updatedTask = {
            name: newName,
            description: newDescription,
            difficulty: newDifficulty,
            reward: newReward
        };

        const data = await updateTaskAPI(task.task_id, updatedTask);
        console.log("Update task response:", data);
        loadTasks();
    };

}

/* ========= Dashboard: create task ========= */
// Handle form submission to create a new task
if (form) {
    form.addEventListener("submit", handleCreateTask);
}
async function handleCreateTask(event){

    event.preventDefault();

    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    const difficulty = document.getElementById("difficulty").value;
    const reward = parseInt(document.getElementById("reward").value);

    const newTask = {
        name,
        description,
        difficulty,
        reward,
        complete: false
    };

    const data = await createTask(newTask);

    console.log("Create task response:", data);

    form.reset();
    loadTasks();
}

/* ========= Dashboard: filtering / sorting / searching ========= */
function setFilter(filter) {
    currentFilter = filter;
    loadTasks(); // Refresh tasks based on new filter
}

function setSort(sort){
    currentSort = sort;
    loadTasks(); // Refresh tasks based on new sort
}

// function to filter tasks
function applyFilter(tasks){
    if (currentFilter === "completed") {
        return tasks.filter(task => task.complete);
    } else if (currentFilter === "incomplete") {
        return tasks.filter(task => !task.complete);
    }
    return tasks; // No filter, return all tasks
}

// function to filter tasks based on search query
function applySearch(tasks){
    if (searchQuery) {
        return tasks.filter(task =>
            task.name.toLowerCase().includes(searchQuery) ||
            task.description.toLowerCase().includes(searchQuery)
        );
    }
    return tasks; // No search query, return all tasks
}

// function to sort tasks
function applySort(tasks){
    if (currentSort === "reward"){
        return tasks.sort((a, b) => b.reward - a.reward); // Sort by reward descending
    }
    if (currentSort === "difficulty"){
        const difficultyOrder = { "Easy": 1, "Medium": 2, "Hard": 3 };
        return tasks.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]); // Sort by difficulty (Easy -> Hard)
    }
    return tasks; // No sort, return tasks in original order
}

let searchListenerBound = false;

function setSearch() {
    if (searchListenerBound) return;
    searchListenerBound = true;
    document.getElementById("search").addEventListener("input", function (event) {
        searchQuery = event.target.value.toLowerCase();
        loadTasks();
    });
}

/* ========= Dashboard: event wiring ========= */
function bindModuleControls() {
    document.getElementById("login-form")?.addEventListener("submit", (e) => {
        e.preventDefault();
        login();
    });
    document.getElementById("register-form")?.addEventListener("submit", (e) => {
        e.preventDefault();
        register();
    });
    document.getElementById("logout-btn")?.addEventListener("click", logout);

    document.querySelector(".filter-buttons")?.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-filter]");
        if (btn) setFilter(btn.dataset.filter);
    });
    document.querySelector(".sort-buttons")?.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-sort]");
        if (btn) setSort(btn.dataset.sort);
    });
}

/* ========= Startup ========= */
function updateAuthUI(){
    const logoutButton = document.getElementById("logout-btn");
    if (!logoutButton) return;
    logoutButton.hidden = !localStorage.getItem("token");
}

async function loadApp() {
    await loadUser();
    await loadTasks();
    setSearch();
}

bindModuleControls();
updateAuthUI();

// on register, when click enter on username, go to password input
document.getElementById("register-username")?.addEventListener("keydown", function (e){
    if (e.key == "Enter"){
        e.preventDefault();
        document.getElementById("register-password").focus();
    }
});

// on login, when click enter on username, go to password input
document.getElementById("username")?.addEventListener("keydown", function (e){
    if (e.key == "Enter"){
        e.preventDefault();
        document.getElementById("password").focus();
    }
});

const isDashboardPage = Boolean(
  document.getElementById("bounty") &&
  document.getElementById("task-list") &&
  document.getElementById("create-task-form")
);
const token = localStorage.getItem("token");
if (token && isDashboardPage) {
  loadApp();
}

