function TaskForm() {
  return (
    <section>
      <h2>Post a New Contract</h2>
      <form>
        <input type="text" placeholder="Task name" />
        <input type="text" placeholder="Description" />
        <select>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
        <input type="number" placeholder="Reward" />
        <button type="button">Add Task</button>
      </form>
    </section>
  );
}

export default TaskForm;