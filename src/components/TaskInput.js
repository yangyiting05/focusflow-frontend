import React, { useState } from 'react';

function TaskInput({ onAdd }) {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [urgency, setUrgency] = useState(3);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !duration) {
      alert('Please fill in all fields');
      return;
    }

    const newTask = {
      id: Date.now(),
      title,
      duration: parseInt(duration),
      urgency: parseInt(urgency),
    };

    onAdd(newTask);
    setTitle('');
    setDuration('');
    setUrgency(3);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
      <input
        type="text"
        placeholder="Task name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ marginRight: '0.5rem' }}
      />
      <input
        type="number"
        placeholder="Duration (mins)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        style={{ marginRight: '0.5rem' }}
      />
      <select
        value={urgency}
        onChange={(e) => setUrgency(e.target.value)}
        style={{ marginRight: '0.5rem' }}
      >
        <option value={1}>Urgency 1</option>
        <option value={2}>Urgency 2</option>
        <option value={3}>Urgency 3</option>
        <option value={4}>Urgency 4</option>
        <option value={5}>Urgency 5</option>
      </select>

      <button type="submit">Add Task</button>
    </form>
  );
}

export default TaskInput;
