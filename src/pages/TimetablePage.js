//test can delete
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useNavigate } from 'react-router-dom';
import './TimetablePage.css';
import { auth } from '../firebase';

function TimetablePage() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const userKey = user?.email || 'default';

  const [rawTasks, setRawTasks] = useState([]);
  const [startHour, setStartHour] = useState(8);
  const [endHour, setEndHour] = useState(22);
  const [timetable, setTimetable] = useState([]);
  const [originalTimetable, setOriginalTimetable] = useState([]);
  const [historyStack, setHistoryStack] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [energyLevel, setEnergyLevel] = useState(5); 

  const timetableRef = useRef(null);

  const updateCurrentTimeLine = useCallback(() => {
    const now = new Date();
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    const line = document.querySelector('.current-time-line');
    if (line && totalMinutes >= startHour * 60 && totalMinutes <= endHour * 60) {
      line.style.top = `${totalMinutes - startHour * 60}px`;
    }
    if (timetableRef.current) {
      timetableRef.current.scrollTop = Math.max(totalMinutes - startHour * 60 - 200, 0);
    }
  }, [startHour, endHour]);

  useEffect(() => {
    const stored = localStorage.getItem(`tasks-${userKey}`);
    if (stored) setRawTasks(JSON.parse(stored));

    const today = new Date().toISOString().split('T')[0];
    const storedEnergy = localStorage.getItem(`energy-${today}`);
    if (storedEnergy) setEnergyLevel(parseInt(storedEnergy));

    const interval = setInterval(updateCurrentTimeLine, 60000);
    updateCurrentTimeLine();
    return () => clearInterval(interval);
  }, [userKey, updateCurrentTimeLine]);

  const generateBreaks = (totalMinsWorked, currentHour, lastBreakTime) => {
    const isLunch = currentHour >= 11 && currentHour <= 13;
    const isDinner = currentHour >= 18 && currentHour <= 20;

    if ((isLunch || isDinner) && (!lastBreakTime || currentHour * 60 - lastBreakTime >= 90)) {
      return { title: 'Meal Time', duration: 45, isBreak: true };
    }

    if (energyLevel <= 4 && totalMinsWorked >= 60) {
      return { title: 'Energy Break', duration: 30, isBreak: true };
    }
    if (totalMinsWorked >= 150) return { title: 'Meal Time', duration: 40, isBreak: true };
    if (totalMinsWorked >= 90) return { title: 'Short Break', duration: 15, isBreak: true };

    return null;
  };

  const generateTimetable = () => {
    const statusPriority = { 'Almost completed': 0, 'Making progress': 1, 'Not started': 2 };

    const fixedTasks = rawTasks
      .filter((t) => t.fixed && t.startTime !== undefined)
      .map((t) => ({
        title: t.title,
        urgency: t.urgency,
        duration: t.duration,
        start: t.startTime,
        fixed: true,
      }));

    const sortedTasks = rawTasks
      .filter((t) => !t.fixed)
      .sort((a, b) => {
        if (energyLevel >= 7) {
          return b.urgency - a.urgency || statusPriority[a.status] - statusPriority[b.status];
        }
        if (energyLevel <= 4) {
          return a.urgency - b.urgency || statusPriority[a.status] - statusPriority[b.status];
        }
        const completionBias = statusPriority[a.status] - statusPriority[b.status];
        const urgencyBias = a.urgency - b.urgency;
        const shortTaskBias = a.duration < 30 ? -1 : 0;
        return completionBias || urgencyBias || shortTaskBias || a.duration - b.duration;
      });

    const newTimetable = [...fixedTasks];
    let currentMinutes = startHour * 60;
    let totalMinsWorked = 0;
    let lastBreakTime = null;

    const isSlotFree = (start, duration) =>
      !newTimetable.some(
        (t) =>
          (start >= t.start && start < t.start + t.duration) ||
          (start + duration > t.start && start + duration <= t.start + t.duration)
      );

    for (let i = 0; i < sortedTasks.length; i++) {
      const task = sortedTasks[i];

      while (
        currentMinutes + task.duration <= endHour * 60 &&
        !isSlotFree(currentMinutes, task.duration)
      ) {
        currentMinutes += 5;
      }

      if (currentMinutes + task.duration > endHour * 60) break;

      newTimetable.push({
        title: task.title,
        urgency: task.urgency,
        duration: task.duration,
        start: currentMinutes,
        fixed: false,
      });

      currentMinutes += task.duration;
      totalMinsWorked += task.duration;

      const breakTask = generateBreaks(
        totalMinsWorked,
        Math.floor(currentMinutes / 60),
        lastBreakTime
      );
      if (breakTask && currentMinutes + breakTask.duration <= endHour * 60) {
        while (!isSlotFree(currentMinutes, breakTask.duration)) currentMinutes += 5;
        breakTask.start = currentMinutes;
        newTimetable.push(breakTask);
        lastBreakTime = currentMinutes;
        currentMinutes += breakTask.duration;
        totalMinsWorked = 0;
      }

      currentMinutes += 5;
    }

    setTimetable(newTimetable.sort((a, b) => a.start - b.start));
    setOriginalTimetable(newTimetable);
    setHistoryStack([]);
    localStorage.setItem(`timetable-${userKey}`, JSON.stringify(newTimetable));
    setTimeout(updateCurrentTimeLine, 500);
  };

  const onDragEnd = (result) => {
    if (!result.destination || !editMode) return;
    const items = Array.from(timetable);
    const [moved] = items.splice(result.source.index, 1);
    if (moved.fixed) return;
    items.splice(result.destination.index, 0, moved);

    let currentMinutes = startHour * 60;
    const updated = items.map((t) => {
      if (t.fixed) return t;
      const updatedTask = { ...t, start: currentMinutes };
      currentMinutes += t.duration + 5;
      return updatedTask;
    });

    setHistoryStack((prev) => [...prev, timetable]);
    setTimetable(updated.sort((a, b) => a.start - b.start));
  };

  const saveTimetable = () => {
    localStorage.setItem(`timetable-${userKey}`, JSON.stringify(timetable));
    setOriginalTimetable(timetable);
    setHistoryStack([]);
    setEditMode(false);
  };

  const undoChanges = () => {
    if (historyStack.length > 0) {
      const previous = historyStack[historyStack.length - 1];
      setHistoryStack(historyStack.slice(0, -1));
      setTimetable(previous);
    }
  };

  const resetTimetable = () => {
    setTimetable([...originalTimetable]);
    setHistoryStack([]);
  };

  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const gridHeight = (endHour - startHour) * 60;

  return (
    <div className="timetable-container">
      <button className="back-btn" onClick={() => navigate('/todo')}>
        ← Back to To-Do List
      </button>
      <h2>Your Timetable</h2>
      <p className="dashboard-subtitle">
        Plan your day effectively with smart breaks and fixed-time task support.
      </p>
      <p className="dashboard-subtitle">
        ✅ Today’s Energy Level: <strong>{energyLevel} / 10</strong>
      </p>

      <div className="time-select-row">
        <label>
          Start Hour:
          <input
            type="number"
            min="0"
            max="23"
            value={startHour}
            onChange={(e) => setStartHour(parseInt(e.target.value))}
          />
        </label>
        <label>
          End Hour:
          <input
            type="number"
            min="1"
            max="24"
            value={endHour}
            onChange={(e) => setEndHour(parseInt(e.target.value))}
          />
        </label>
        <button className="generate-btn" onClick={generateTimetable}>
          Generate Timetable
        </button>
      </div>

      <div className="action-buttons">
        {!editMode ? (
          <button className="edit-btn" onClick={() => setEditMode(true)}>
            Edit Timetable
          </button>
        ) : (
          <>
            <button className="save-btn" onClick={saveTimetable}>
              Save
            </button>
            <button className="undo-btn" onClick={undoChanges}>
              Undo
            </button>
            <button className="reset-btn" onClick={resetTimetable}>
              Reset
            </button>
          </>
        )}
      </div>

      <div
        className={`timetable-grid ${editMode ? 'fade-in' : ''}`}
        style={{ height: `${gridHeight}px` }}
        ref={timetableRef}
      >
        <div className="time-column">
          {Array.from({ length: endHour - startHour }, (_, i) => (
            <div key={i} className="time-slot">
              {String(startHour + i).padStart(2, '0')}:00
            </div>
          ))}
          <div className="current-time-line"></div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="timetable">
            {(provided) => (
              <div className="task-column" {...provided.droppableProps} ref={provided.innerRef}>
                {timetable.map((slot, index) => {
                  const top = slot.start - startHour * 60;
                  const height = (slot.duration / 60) * 60;
                  return (
                    <Draggable
                      key={`task-${index}`}
                      draggableId={`task-${index}`}
                      index={index}
                      isDragDisabled={!editMode || slot.fixed}
                    >
                      {(provided) => (
                        <div
                          className={`task-slot ${
                            slot.isBreak ? 'break-task' : slot.fixed ? 'fixed' : ''} urgency-${
                            slot.urgency
                          }`}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            top: `${Math.round(top / 5) * 5}px`,
                            height: `${Math.round(height / 5) * 5}px`,
                          }}
                          title={`${slot.title} | Urgency: ${slot.urgency || '-'} | Duration: ${
                            slot.duration
                          } mins`}
                        >
                          <div className="task-title">
                            {slot.isBreak
                              ? slot.title
                              : slot.title}{' '}
                            ({formatTime(slot.start)} - {formatTime(
                              slot.start + slot.duration
                            )})
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}

export default TimetablePage;




