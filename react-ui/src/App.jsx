import BountyDisplay from "./components/BountyDisplay";
import ProgressBar from "./components/ProgressBar";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import { useState, useEffect } from "react";
import {
  getUser,
  getTasks,
  createTask,
  completeTask,
  deleteTask,
  loginUser,
  registerUser,
} from "./api";

function App() {
  const [user, setUser] = useState({
    bounty: 0,
    total_bounty: 0,
    level: 0,
    progress: 0,
    streak_count: 0,
    last_completed_date: null,
    tasks_completed: 0,
  });

  const [tasks, setTasks] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem("token")));
  const [authMode, setAuthMode] = useState("login");

  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("none");
  const [searchQuery, setSearchQuery] = useState("");

  async function loadDashboard() {
    try {
      const [userData, tasksData] = await Promise.all([getUser(), getTasks()]);
      setUser(userData);
      const normalizedTasks = tasksData.map((task) => ({
        ...task,
        id: task.task_id,
        completed: Boolean(task.complete),
      }));
      setTasks(normalizedTasks);
    } catch (err) {
      console.error("Failed to load dashboard", err);
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboard();
    }
  }, [isAuthenticated]);

  async function handleAddTask(newTask) {
    try {
      await createTask(newTask);
      await loadDashboard();
    } catch (err) {
      console.error("Failed to add task", err);
    }
  }

  async function handleCompleteTask(taskId) {
    try {
      await completeTask(taskId);
      await loadDashboard();
    } catch (err) {
      console.error("Failed to complete task", err);
    }
  }

  async function handleDeleteTask(taskId) {
    try {
      await deleteTask(taskId);
      await loadDashboard();
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  }

  async function handleLogin(username, password) {
    try {
      const data = await loginUser(username, password);
      if (!data.access_token) return false;
  
      localStorage.setItem("token", data.access_token);
      setIsAuthenticated(true);
      await loadDashboard();
      return true;
    } catch (err) {
      console.error("Login failed", err);
      return false;
    }
  }

  async function handleRegister(username, password) {
    try {
      const result = await registerUser(username, password);
      if (!result.ok) {
        return {
          ok: false,
          message: result.data?.detail || "Registration failed.",
        };
      }
      setAuthMode("login");
      return { ok: true };
    } catch (err) {
      console.error("Registration failed", err);
      return { ok: false, message: "Registration failed." };
    }
  }
  
  function handleLogout() {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setTasks([]);
  }

  const difficultyRank = { Easy: 1, Medium: 2, Hard: 3 };

  let visibleTasks = [...tasks];

  // status filter
  if (filterStatus === "completed") {
    visibleTasks = visibleTasks.filter((task) => task.completed);
  } else if (filterStatus === "incomplete") {
    visibleTasks = visibleTasks.filter((task) => !task.completed);
  }

  // search filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    visibleTasks = visibleTasks.filter(
      (task) =>
        task.name.toLowerCase().includes(q) ||
        task.description.toLowerCase().includes(q),
    );
  }

  // sort
  if (sortBy === "reward") {
    visibleTasks = [...visibleTasks].sort((a, b) => b.reward - a.reward);
  } else if (sortBy === "difficulty") {
    visibleTasks = [...visibleTasks].sort(
      (a, b) => difficultyRank[b.difficulty] - difficultyRank[a.difficulty],
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="app-shell auth-shell">
        <h1 className="app-title">Bounty Hunter</h1>
        {authMode === "login" ? (
          <LoginForm onLogin={handleLogin} />
        ) : (
          <RegisterForm onRegister={handleRegister} />
        )}
        <button
          className="auth-toggle-btn"
          type="button"
          onClick={() =>
            setAuthMode((prev) => (prev === "login" ? "register" : "login"))
          }
        >
          {authMode === "login"
            ? "Need an account? Sign Up"
            : "Already have an account? Login"}
        </button>
      </main>
    );
  }

  return (
    <main className="app-shell dashboard-shell">
      <header className="top-bar">
        <h1 className="app-title">Bounty Hunter</h1>
        <button className="logout-btn" type="button" onClick={handleLogout}>
        Logout
        </button>
      </header>
      <BountyDisplay
        currentBounty={user.bounty}
        totalBounty={user.total_bounty}
        level={user.level}
      />

      <ProgressBar progressPercent={user.progress} />

      <TaskForm onAddTask={handleAddTask} />

      <TaskList
        tasks={visibleTasks}
        filterStatus={filterStatus}
        sortBy={sortBy}
        searchQuery={searchQuery}
        onFilterChange={setFilterStatus}
        onSortChange={setSortBy}
        onSearchChange={setSearchQuery}
        onCompleteTask={handleCompleteTask}
        onDeleteTask={handleDeleteTask}
      />
    </main>
  );
}

export default App;