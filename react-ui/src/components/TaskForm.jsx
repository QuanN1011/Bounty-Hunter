import { useState } from "react";

const emptyForm = {
  name: "",
  description: "",
  difficulty: "Easy",
  reward: "",
  category: "Other",
};

function TaskForm({ onAddTask }) {
  const [fields, setFields] = useState(emptyForm);

  function updateField(name, value) {
    setFields((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!fields.name.trim()) return;

    onAddTask({
      name: fields.name.trim(),
      description: fields.description.trim(),
      difficulty: fields.difficulty,
      reward: Number(fields.reward) || 0,
      category: fields.category,
    });

    setFields(emptyForm);
  }
  return (
    <section className="panel panel--form">
      <h2>Post a New Contract</h2>
      <form className="task-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Task name"
          value={fields.name}
          onChange={(e) => updateField("name", e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={fields.description}
          onChange={(e) => updateField("description", e.target.value)}
        />
        <select
          value={fields.difficulty}
          onChange={(e) => updateField("difficulty", e.target.value)}
        >
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
        <input
          type="number"
          placeholder="Reward"
          value={fields.reward}
          onChange={(e) => updateField("reward", e.target.value)}
          min="0"
        />
        <select
          value={fields.category}
          onChange={(e) => updateField("category", e.target.value)}
        >
          <option>Work</option>
          <option>Personal</option>
          <option>Study</option>
          <option>Health</option>
          <option>Finance</option>
          <option>Errands</option>
          <option>Home</option>
          <option>Other</option>
        </select>
        <button className="btn-primary" type="submit">Add Task</button>
      </form>
    </section>
  );
}

export default TaskForm;