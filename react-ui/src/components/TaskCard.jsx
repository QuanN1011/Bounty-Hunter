function TaskCard({ name, difficulty, reward, children }) {
  return (
    <li>
      <h3>{name}</h3>
      <p>Difficulty: {difficulty}</p>
      <p>Reward: {reward}</p>
      {children}
    </li>
  );
}

export default TaskCard;