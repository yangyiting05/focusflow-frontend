import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import './Dashboard.css';
import './TodoPage.css';

function TodoPage() {
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTask, setEditedTask] = useState({});
  const [newTask, setNewTask] = useState({ title: '', duration: '', urgency: '3', fixed: false, fixedTime: '' });
  const navigate = useNavigate();

  const user = auth.currentUser;
  const userKey = user?.email || 'default';

  useEffect(() => {
    const stored = localStorage.getItem(`tasks-${userKey}`);
    if (stored) setTasks(JSON.parse(stored));
  }, [userKey]);

  const saveTasks = (updatedTasks) => {
    setTasks(updatedTasks);
    localStorage.setItem(`tasks-${userKey}`, JSON.stringify(updatedTasks));
  };

  const handleNewChange = (field, value) => {
    setNewTask((prev) => ({ ...prev, [field]: value }));
  };

  const addTask = () => {
    const validDuration = Math.max(0, parseInt(newTask.duration) || 0);
    const fixedTimeMinutes =
      newTask.fixed && newTask.fixedTime
        ? (() => {
            const [hours, minutes] = newTask.fixedTime.split(':').map(Number);
            return hours * 60 + minutes;
          })()
        : undefined;

    const task = {
      id: Date.now(),
      title: newTask.title.trim(),
      duration: validDuration,
      urgency: parseInt(newTask.urgency),
      status: 'Not started',
      fixed: newTask.fixed,
      startTime: fixedTimeMinutes,
    };

    if (task.title) {
      saveTasks([...tasks, task]);
      setNewTask({ title: '', duration: '', urgency: '3', fixed: false, fixedTime: '' });
    }
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
            duration: Math.max(0, parseInt(editedTask.duration) || 0),
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

  const deleteTask = (taskId) => {
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

  const goToTimetable = () => {
    const existingTimetable = localStorage.getItem(`timetable-${userKey}`);
    if (!existingTimetable || existingTimetable === '[]') {
      const sortedTasks = [...tasks].sort((a, b) => a.urgency - b.urgency);
      localStorage.setItem(`timetable-${userKey}`, JSON.stringify(sortedTasks));
    }
    navigate('/timetable');
  };

  return (
    <div className="dashboard-container">
      <button className="back-btn" onClick={() => navigate('/dashboard')}>
        ← Back to Dashboard
      </button>
      <h2 className="dashboard-title">Create a New To-Do List</h2>
      <p className="dashboard-subtitle">Here you can add tasks you want to complete today.</p>
      <p className="urgency-hint">Urgency 1 = Highest priority, Urgency 5 = Lowest priority</p>

      {}
      <div className="add-task-container">
        <div className="add-task-row">
          <input
            type="text"
            placeholder="Task name"
            value={newTask.title}
            onChange={(e) => handleNewChange('title', e.target.value)}
          />
          <input
            type="number"
            placeholder="Duration (mins)"
            min="0"
            step="1"
            value={newTask.duration}
            onChange={(e) => handleNewChange('duration', e.target.value)}
          />
          <select value={newTask.urgency} onChange={(e) => handleNewChange('urgency', e.target.value)}>
            <option value="1">Urgency 1 (High)</option>
            <option value="2">Urgency 2</option>
            <option value="3">Urgency 3</option>
            <option value="4">Urgency 4</option>
            <option value="5">Urgency 5 (Low)</option>
          </select>
          <div className="fixed-time-row">
            <label className="fixed-time-label">
              Set Fixed Time
              <input
                type="checkbox"
                className="fixed-time-checkbox"
                checked={newTask.fixed}
                onChange={(e) => handleNewChange('fixed', e.target.checked)}
              />
            </label>
            {newTask.fixed && (
              <input
                type="time"
                className="fixed-time-input"
                value={newTask.fixedTime}
                onChange={(e) => handleNewChange('fixedTime', e.target.value)}
              />
            )}
          </div>
        </div>
        <button className="add-task-btn" onClick={addTask}>Add Task</button>
      </div>

      {tasks.length > 0 && (
        <>
          <div className="task-table">
            <div className="task-header-row">
              <span>Task</span>
              <span>Duration</span>
              <span>Urgency</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {[...tasks]
              .sort((a, b) => a.urgency - b.urgency)
              .map((task) => (
                <div className={`task-row ${task.fixed ? 'fixed-time' : ''}`} key={task.id}>
                  {editingTaskId === task.id ? (
                    <>
                      <input
                        type="text"
                        className="edit-input"
                        value={editedTask.title}
                        onChange={(e) => handleEditChange('title', e.target.value)}
                      />
                      <input
                        type="number"
                        className="edit-input"
                        min="0"
                        step="1"
                        value={editedTask.duration}
                        onChange={(e) => handleEditChange('duration', e.target.value)}
                      />
                      <select
                        className="edit-input"
                        value={editedTask.urgency}
                        onChange={(e) => handleEditChange('urgency', e.target.value)}
                      >
                        <option value="1">Urgency 1 (High)</option>
                        <option value="2">Urgency 2</option>
                        <option value="3">Urgency 3</option>
                        <option value="4">Urgency 4</option>
                        <option value="5">Urgency 5 (Low)</option>
                      </select>
                      <select
                        className="edit-input"
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
                    </>
                  ) : (
                    <>
                      <span>
                        {task.title}
                        {task.fixed && (
                          <span className="fixed-time-badge">
                            Fixed at{' '}
                            {`${String(Math.floor(task.startTime / 60)).padStart(2, '0')}:${String(
                              task.startTime % 60
                            ).padStart(2, '0')}`}
                          </span>
                        )}
                      </span>
                      <span>{task.duration} min</span>
                      <span>Urgency {task.urgency}</span>
                      <span
                        className="task-status-badge"
                        style={{ backgroundColor: getStatusColor(task.status) }}
                      >
                        {task.status}
                      </span>
                      <div className="task-buttons">
                        <button className="edit-btn" onClick={() => startEdit(task)}>Edit</button>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            onChange={() => completeTask(task.id)}
                            className="task-checkbox"
                          />
                          <span>Mark as done</span>
                        </label>
                        <button className="cancel-btn" onClick={() => deleteTask(task.id)}>Delete</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
          </div>

          <div className="timetable-btn-wrapper">
            <p className="instruction-text">Click next after setting your to-do list.</p>
            <button className="next-btn" onClick={goToTimetable}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}

export default TodoPage;