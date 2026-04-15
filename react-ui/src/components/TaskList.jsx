import TaskCard from "./TaskCard";

function TaskList({ 
  tasks,
  filterStatus,
  sortBy,
  searchQuery,
  onFilterChange,
  onSortChange,
  onSearchChange,
  onCompleteTask,
  onDeleteTask,
 }) {
  return (
    <section className="panel panel--tasks">
      <h2>Open Contracts</h2>
      <div className="control-group">
        <p>Filter:</p>
        <button className="btn-secondary" onClick={() => onFilterChange("all")} disabled={filterStatus === "all"}>All</button>
        <button className="btn-secondary" onClick={() => onFilterChange("completed")} disabled={filterStatus === "completed"}>Completed</button>
        <button className="btn-secondary" onClick={() => onFilterChange("incomplete")} disabled={filterStatus === "incomplete"}>Incomplete</button>
      </div>

      <div className="control-group">
        <p>Sort:</p>
        <button className="btn-secondary" onClick={() => onSortChange("reward")} disabled={sortBy === "reward"}>By Reward</button>
        <button className="btn-secondary" onClick={() => onSortChange("difficulty")} disabled={sortBy === "difficulty"}>By Difficulty</button>
        <button className="btn-secondary" onClick={() => onSortChange("none")} disabled={sortBy === "none"}>Clear Sort</button>
      </div>

      <div className="control-group">
        <label htmlFor="task-search">Search</label>
        <input
          className="task-search"
          id="task-search"
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name or description"
        />
      </div>
      <ul className="task-list">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            name={task.name}
            difficulty={task.difficulty}
            reward={task.reward}
            completed={task.completed}
            onComplete={() => onCompleteTask(task.id)}
            onDelete={() => onDeleteTask(task.id)}
          >
            <p>{task.description}</p>
          </TaskCard>
        ))}
      </ul>
    </section>
  );
}

export default TaskList;