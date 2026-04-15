function TaskCard({
  name,
  difficulty,
  reward,
  completed,
  onComplete,
  onDelete,
  children,
}) {
  return (
    <li className="task-card">
      <h3 className="task-card__title">{name}</h3>
      <p>Difficulty: <strong>{difficulty}</strong></p>
      <p>Reward: <strong>{reward}</strong> berry</p>
      <div className="task-card__actions">
      <button className="btn-primary" onClick={onComplete} disabled = {completed}>
        {completed ? "Completed" : "Complete Task"}
      </button>
      <button className="btn-danger" onClick={onDelete}>Delete Task</button>
      </div>
      {children}
    </li>
  );
}

export default TaskCard;