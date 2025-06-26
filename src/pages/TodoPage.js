import React, { useState, useEffect } from 'react';
import TaskInput from '../components/TaskInput';
import './Dashboard.css';
import './TodoPage.css';

function TodoPage() {
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTask, setEditedTask] = useState({});

  useEffect(() => {
    const stored = localStorage.getItem('tasks');
    if (stored) setTasks(JSON.parse(stored));
  }, []);

  const saveTasks = (updatedTasks) => {
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  const addTask = (task) => {
    const newTask = { ...task, status: 'Not started' };
    const updated = [...tasks, newTask];
    saveTasks(updated);
  };

  const startEdit = (task) => {
    setEditingTaskId(task.id);
    setEditedTask({ ...task });
  };

  const handleEditChange = (field, value) => {
    setEditedTask((prev) => ({ ...prev, [field]: value }));
  };

  const saveEdit = () => {
    const updatedTasks = tasks.map((t) =>
      t.id === editingTaskId
        ? {
            ...editedTask,
            duration: parseInt(editedTask.duration),
            urgency: parseInt(editedTask.urgency),
          }
        : t
    );
    setEditingTaskId(null);
    setEditedTask({});
    saveTasks(updatedTasks);
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditedTask({});
  };

  const completeTask = (taskId) => {
    const updatedTasks = tasks.filter((t) => t.id !== taskId);
    saveTasks(updatedTasks);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Not started':
        return '#f6c90e';
      case 'Making progress':
        return '#00a8f3';
      case 'Almost completed':
        return '#38b000';
      default:
        return '#ccc';
    }
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Create a New To-Do List</h2>
      <p className="dashboard-subtitle">Here you can add tasks you want to complete today.</p>

      <TaskInput onAdd={addTask} />

      <div className="task-list">
        {[...tasks]
          .sort((a, b) => b.urgency - a.urgency)
          .map((task) => (
            <div className="task-card" key={task.id}>
              <input
                type="checkbox"
                onChange={() => completeTask(task.id)}
                title="Mark as done"
              />
              {editingTaskId === task.id ? (
                <div className="task-edit-row">
                  <input
                    type="text"
                    value={editedTask.title}
                    onChange={(e) => handleEditChange('title', e.target.value)}
                  />
                  <input
                    type="number"
                    value={editedTask.duration}
                    onChange={(e) => handleEditChange('duration', e.target.value)}
                  />
                  <select
                    value={editedTask.urgency}
                    onChange={(e) => handleEditChange('urgency', e.target.value)}
                  >
                    {[1, 2, 3, 4, 5].map((u) => (
                      <option key={u} value={u}>Urgency {u}</option>
                    ))}
                  </select>
                  <select
                    value={editedTask.status}
                    onChange={(e) => handleEditChange('status', e.target.value)}
                  >
                    <option value="Not started">Not started</option>
                    <option value="Making progress">Making progress</option>
                    <option value="Almost completed">Almost completed</option>
                  </select>
                  <div className="task-buttons">
                    <button className="save-btn" onClick={saveEdit}>Save</button>
                    <button className="cancel-btn" onClick={cancelEdit}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="task-info-row">
                  <span className="task-main-text">
                    {task.title} – {task.duration} min – Urgency {task.urgency}
                  </span>
                  <span
                    className="task-status-badge"
                    style={{ backgroundColor: getStatusColor(task.status) }}
                  >
                    {task.status}
                  </span>
                  <button className="edit-btn" onClick={() => startEdit(task)}>
                    Edit
                  </button>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

export default TodoPage;