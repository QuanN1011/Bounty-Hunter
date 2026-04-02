import TaskCard from "./TaskCard";

function TaskList({ tasks }) {
  return (
    <section>
      <h2>Open Contracts</h2>
      <ul>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            name={task.name}
            difficulty={task.difficulty}
            reward={task.reward}
          >
            <p>{task.description}</p>
          </TaskCard>
        ))}
      </ul>
    </section>
  );
}

export default TaskList;