import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './TimetablePage.css';
import { auth } from '../firebase';

function TimetablePage() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const userKey = user?.email || 'default';
  const [rawTasks, setRawTasks] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [startHour, setStartHour] = useState('');
  const [endHour, setEndHour] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(`tasks-${userKey}`);
    if (stored) {
      setRawTasks(JSON.parse(stored));
    }
  }, [userKey]);

  const generateTimetable = () => {
    const timetableMap = Array.from({ length: 24 }, (_, i) => ({
      time: i,
      task: null,
    }));

    const tasks = [...rawTasks]
      .filter(t => t.status !== 'Almost completed')
      .sort((a, b) => {
        const statusPriority = {
          'Almost completed': 0,
          'Making progress': 1,
          'Not started': 2,
        };
        return (
          statusPriority[a.status] - statusPriority[b.status] ||
          b.urgency - a.urgency ||
          a.duration - b.duration
        );
      });

    let currentHour = parseInt(startHour);
    const maxHour = parseInt(endHour);

    const newTimetable = [];

    for (const task of tasks) {
      const neededSlots = Math.ceil(task.duration / 60);
      if (currentHour + neededSlots > maxHour) break;

      for (let i = 0; i < neededSlots; i++) {
        newTimetable.push({
          time: currentHour,
          title: i === 0 ? task.title : 'Continued',
          duration: task.duration,
          urgency: task.urgency,
          status: task.status,
        });
        currentHour++;
      }

      if (currentHour < maxHour && (currentHour % 3 === 0 || currentHour === 12)) {
        newTimetable.push({
          time: currentHour,
          title: currentHour === 12 ? 'Lunch Break' : 'Short Break',
          duration: 60,
          status: 'Break',
        });
        currentHour++;
      }
    }

    for (let h = 0; h < 24; h++) {
      if (!newTimetable.find((t) => t.time === h)) {
        newTimetable.push({ time: h, title: '', status: '' });
      }
    }

    const sorted = newTimetable
      .filter((slot) => slot.time >= parseInt(startHour) && slot.time <= parseInt(endHour))
      .sort((a, b) => a.time - b.time);

    setTimetable(sorted);
    localStorage.setItem(`timetable-${userKey}`, JSON.stringify(sorted));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(timetable);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setTimetable(items);
    localStorage.setItem(`timetable-${userKey}`, JSON.stringify(items));
  };

  return (
    <div className="timetable-container">
      <button className="back-btn" onClick={() => navigate('/todo')}>← Back to To-Do List</button>
      <h2 className="dashboard-title">Your Timetable</h2>
      <p className="dashboard-subtitle">Drag tasks to customize your day. Breaks are auto-added!</p>

      <div className="time-input-row">
        <label>
          Start Hour:
          <input
            type="number"
            value={startHour}
            onChange={(e) => setStartHour(e.target.value)}
            min="0"
            max="23"
            placeholder="e.g. 8"
          />
        </label>
        <label>
          End Hour:
          <input
            type="number"
            value={endHour}
            onChange={(e) => setEndHour(e.target.value)}
            min="1"
            max="24"
            placeholder="e.g. 22"
          />
        </label>
        <button className="generate-btn" onClick={generateTimetable}>Generate Timetable</button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="timetable">
          {(provided) => (
            <div className="timetable-list" {...provided.droppableProps} ref={provided.innerRef}>
              {timetable.map((slot, index) => (
                <Draggable
                  key={`${slot.time}-${slot.title}-${index}`}
                  draggableId={`${slot.time}-${slot.title}-${index}`}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      className={`timetable-slot ${snapshot.isDragging ? 'dragging' : ''}`}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <div className="time-label">
                        {String(slot.time).padStart(2, '0')}:00 - {String(slot.time + 1).padStart(2, '0')}:00
                      </div>
                      <div className="task-info">
                        <strong>{slot.title || '—'}</strong>
                        {slot.status && <div className="status-badge">{slot.status}</div>}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

export default TimetablePage;
