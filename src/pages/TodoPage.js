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
      <h2 className="dashboard-title">📝 Create a New To-Do List</h2>
      <p className="urgency-hint">Tasks are automatically sorted by urgency (highest first)</p>

      <TaskInput onAdd={addTask} />

      <div className="task-table">
        <div className="task-header-row">
          <div>Task</div>
          <div>Duration</div>
          <div>Urgency</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        {[...tasks]
          .sort((a, b) => b.urgency - a.urgency)
          .map((task) =>
            editingTaskId === task.id ? (
              <div key={task.id} className="task-row task-edit-row">
                <input
                  className="edit-input"
                  type="text"
                  value={editedTask.title}
                  onChange={(e) => handleEditChange('title', e.target.value)}
                />
                <input
                  className="edit-input"
                  type="number"
                  value={editedTask.duration}
                  onChange={(e) => handleEditChange('duration', e.target.value)}
                />
                <select
                  className="edit-input"
                  value={editedTask.urgency}
                  onChange={(e) => handleEditChange('urgency', e.target.value)}
                >
                  {[1, 2, 3, 4, 5].map((u) => (
                    <option key={u} value={u}>Urgency {u}</option>
                  ))}
                </select>
                <select
                  className="edit-input"
                  value={editedTask.status}
                  onChange={(e) => handleEditChange('status', e.target.value)}
                  style={{ backgroundColor: getStatusColor(editedTask.status), color: '#fff' }}
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
              <div key={task.id} className="task-row">
                <div>{task.title}</div>
                <div>{task.duration} min</div>
                <div>{task.urgency}</div>
                <div>
                  <span
                    className="task-status-badge"
                    style={{ backgroundColor: getStatusColor(task.status) }}
                  >
                    {task.status}
                  </span>
                </div>
                <div className="task-buttons">
                  <button className="edit-btn" onClick={() => startEdit(task)}>Edit</button>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      className="task-checkbox"
                      onChange={() => completeTask(task.id)}
                    />
                    Done
                  </label>
                </div>
              </div>
            )
          )}
      </div>
    </div>
  );
}

export default TodoPage;

