import BountyDisplay from "./components/BountyDisplay";
import ProgressBar from "./components/ProgressBar";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";

function App() {
  const user = {
    currentBounty: 120,
    totalBounty: 540,
    level: 4,
    progressPercent: 35,
  };

  const tasks = [
    { id: 1, name: "Study React", description: "Read JSX docs", difficulty: "Easy", reward: 20 },
    { id: 2, name: "Workout", description: "30 minutes", difficulty: "Medium", reward: 35 },
    { id: 3, name: "Project Task", description: "Build TaskCard", difficulty: "Hard", reward: 50 },
  ];

  return (
    <main>
      <h1>Bounty Hunter</h1>

      <BountyDisplay
        currentBounty={user.currentBounty}
        totalBounty={user.totalBounty}
        level={user.level}
      />

      <ProgressBar progressPercent={user.progressPercent} />

      <TaskForm />

      <TaskList tasks={tasks} />
    </main>
  );
}

export default App;