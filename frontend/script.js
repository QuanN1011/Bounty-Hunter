
const source = "http://127.0.0.1:8000";
const bountyForm = document.getElementById("bounty"); // Display user's bounty, loadUser
const taskList = document.getElementById("task-list"); // Container for task cards, loadTasks
const form = document.getElementById("create-task-form"); // Form for creating new tasks, handleCreateTask  


// get user info and update bounty display
function loadUser(){
    fetch(source + "/user")
        .then(response => response.json())
        .then(user => {
            console.log("User: ", user);
            bountyForm.textContent = "Bounty: " + user.bounty;
        });
}

// get tasks and display them
function loadTasks(){
    taskList.innerHTML = ""; // Clear existing tasks

    fetch(source + "/tasks")
        .then(response => response.json())
        .then(data => {
            for (const task of data) {
                const taskItem = createTaskCard(task);
                taskList.appendChild(taskItem);

            }   
        });
}

// Create a task card element for display
function createTaskCard(task){
    const taskItem = document.createElement("li");
    const button = document.createElement("button");


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
    button.textContent = "Complete Task";
    if (task.complete) {
        button.disabled = true;
    }
    button.onclick = function(){
        console.log("Completing task: ", task.task_id);
        completeTask(task.task_id);
        
    };
    taskItem.querySelector(".task-card").appendChild(button);
    return taskItem;
}

// Send request to complete a task and update user bounty and task list
function completeTask(taskId){
    fetch(`${source}/tasks/${taskId}/complete`, {
        method: "POST",
    })
    .then(response => response.json())
    .then(data => {
        console.log("Task completion response: ", data);
        loadUser(); // Update bounty display after completing task
        loadTasks(); // Refresh task list to show updated status
    })
}

// Handle form submission to create a new task
form.addEventListener("submit", handleCreateTask);
function handleCreateTask(event){
    event.preventDefault();
    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    const difficulty = document.getElementById("difficulty").value;
    const reward = parseInt(document.getElementById("reward").value);

    const newTask = {
        task_id: Date.now(), // Use timestamp as a simple unique ID
        name: name,
        description: description,
        difficulty: difficulty,
        reward: reward,
        complete: false
    };

    console.log("Creating task: ", newTask);

    fetch(`${source}/tasks`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newTask)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Create task response: ", data);
        form.reset(); // Clear the form
        loadTasks(); // Refresh the task list to show the new task
    });
}


// run 
loadUser();
loadTasks();
    
