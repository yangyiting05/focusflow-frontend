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
        return '#f6c90e'; // yellow
      case 'Making progress':
        return '#00a8f3'; // blue
      case 'Almost completed':
        return '#38b000'; // green
      default:
        return '#ccc'; // gray fallback
    }
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">📝 Create a New To-Do List</h2>
      <p>Here you can add tasks you want to complete today.</p>

      <TaskInput onAdd={addTask} />

      <ul>
        {[...tasks]
          .sort((a, b) => b.urgency - a.urgency)
          .map((task) => (
            <li key={task.id} style={{ marginBottom: '1rem' }}>
              <input
                type="checkbox"
                onChange={() => completeTask(task.id)}
                title="Mark as done"
                style={{ marginRight: '0.5rem' }}
              />

              {editingTaskId === task.id ? (
                <div>
                  <input
                    type="text"
                    value={editedTask.title}
                    onChange={(e) => handleEditChange('title', e.target.value)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <input
                    type="number"
                    value={editedTask.duration}
                    onChange={(e) => handleEditChange('duration', e.target.value)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <select
                    value={editedTask.urgency}
                    onChange={(e) => handleEditChange('urgency', e.target.value)}
                    style={{ marginRight: '0.5rem' }}
                  >
                    {[1, 2, 3, 4, 5].map((u) => (
                      <option key={u} value={u}>Urgency {u}</option>
                    ))}
                  </select>
                  <select
                    value={editedTask.status}
                    onChange={(e) => handleEditChange('status', e.target.value)}
                    style={{
                      marginRight: '0.5rem',
                      backgroundColor: getStatusColor(editedTask.status),
                      color: '#fff',
                      border: 'none',
                      padding: '4px',
                      borderRadius: '4px',
                    }}
                  >
                    <option value="Not started">Not started</option>
                    <option value="Making progress">Making progress</option>
                    <option value="Almost completed">Almost completed</option>
                  </select>
                  <button onClick={saveEdit}>Save</button>
                  <button onClick={cancelEdit} style={{ marginLeft: '0.5rem' }}>Cancel</button>
                </div>
              ) : (
                <div>
                  {task.title} – {task.duration} min – Urgency {task.urgency}
                  <span
                    style={{
                      marginLeft: '0.5rem',
                      backgroundColor: getStatusColor(task.status),
                      color: '#fff',
                      borderRadius: '6px',
                      padding: '2px 8px',
                      fontSize: '0.85rem',
                    }}
                  >
                    {task.status}
                  </span>
                  <button onClick={() => startEdit(task)} style={{ marginLeft: '0.5rem' }}>
                    Edit
                  </button>
                </div>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
}

export default TodoPage;
