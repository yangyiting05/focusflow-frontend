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
  const [hasGenerated, setHasGenerated] = useState(false);

  const timetableRef = useRef(null);

  const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

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
    const storedTasks = localStorage.getItem(`tasks-${userKey}`);
    const today = new Date().toISOString().split('T')[0];
    const storedEnergy = localStorage.getItem(`energy-${today}`);
    if (storedEnergy) setEnergyLevel(parseInt(storedEnergy));

    const storedTimetable = localStorage.getItem(`timetable-${userKey}`);
    if (storedTimetable) {
      const loaded = JSON.parse(storedTimetable);
      if (Array.isArray(loaded) && loaded.length > 0) {
        setTimetable(loaded);
        setOriginalTimetable(deepCopy(loaded));
        setHasGenerated(true);
      }
    }

    const interval = setInterval(updateCurrentTimeLine, 60000);
    updateCurrentTimeLine();
    return () => clearInterval(interval);
  }, [userKey, updateCurrentTimeLine]);

  const generateBreaks = useCallback((totalMinsWorked, currentHour, lastBreakTime) => {
    const isLunch = currentHour >= 11 && currentHour <= 13;
    const isDinner = currentHour >= 18 && currentHour <= 20;

    if ((isLunch || isDinner) && (!lastBreakTime || Math.abs(currentHour * 60 - lastBreakTime) > 120)) {
      return { title: 'Meal Time', duration: 45, isBreak: true };
    }
    if (energyLevel <= 4 && totalMinsWorked >= 60) {
      return { title: 'Energy Break', duration: 30, isBreak: true };
    }
    if (totalMinsWorked >= 150) return { title: 'Meal Time', duration: 40, isBreak: true };
    if (totalMinsWorked >= 90) return { title: 'Short Break', duration: 15, isBreak: true };

    return null;
  }, [energyLevel]);

  const isSlotFree = useCallback((newTimetable, start, duration, ignoreTitle = null) => {
    return !newTimetable.some(
      (t) =>
        t.title !== ignoreTitle &&
        start < t.start + t.duration &&
        start + duration > t.start
    );
  }, []);

  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission().then((permission) => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  const scheduleReminders = (timetable) => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications.');
      return;
    }

    timetable.forEach((task) => {
      const now = new Date();
      const taskTime = new Date();
      taskTime.setHours(Math.floor(task.start / 60));
      taskTime.setMinutes(task.start % 60);

      const delay = taskTime.getTime() - now.getTime();
      console.log(`⏰ Scheduling: ${task.title} in ${delay / 1000} seconds`);

      if (delay > 0) {
        setTimeout(() => {
          console.log(`🔔 Triggering notification for: ${task.title}`);
          if (Notification.permission === 'granted') {
            const n = new Notification('⏰ FocusFlow Reminder', {
              body: `Time to get started on ${task.title}!`,
              icon: '/logo192.png',
            });
            n.onclick = () => {
              window.focus();
              window.location.href = '/';
            };
          } else {
            alert(`⏰ Reminder: Time to get started on ${task.title}!`);
          }
        }, delay);
      }
    });
  };

  const generateTimetable = useCallback(() => {
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

    for (let i = 0; i < sortedTasks.length; i++) {
      const task = sortedTasks[i];
      while (
        currentMinutes + task.duration <= endHour * 60 &&
        !isSlotFree(newTimetable, currentMinutes, task.duration)
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

      const breakTask = generateBreaks(totalMinsWorked, Math.floor(currentMinutes / 60), lastBreakTime);
      if (breakTask && currentMinutes + breakTask.duration <= endHour * 60) {
        while (!isSlotFree(newTimetable, currentMinutes, breakTask.duration)) currentMinutes += 5;
        breakTask.start = currentMinutes;
        newTimetable.push(breakTask);
        lastBreakTime = currentMinutes;
        currentMinutes += breakTask.duration;
        totalMinsWorked = 0;
      }
      currentMinutes += 5;
    }

    const finalTable = newTimetable.sort((a, b) => a.start - b.start);
    setTimetable(finalTable);
    setOriginalTimetable(deepCopy(finalTable));
    setHistoryStack([]);
    setHasGenerated(true);
    localStorage.setItem(`timetable-${userKey}`, JSON.stringify(finalTable));
    setTimeout(updateCurrentTimeLine, 500);
    scheduleReminders(finalTable);
  }, [rawTasks, startHour, endHour, userKey, generateBreaks, isSlotFree, updateCurrentTimeLine, energyLevel]);

  const onDragEnd = (result) => {
    if (!result.destination || !editMode) return;

    const items = deepCopy(timetable);
    const [moved] = items.splice(result.source.index, 1);
    if (moved.fixed) return;

    let targetStart = items[result.destination.index]?.start || moved.start;
    while (
      targetStart + moved.duration <= endHour * 60 &&
      !isSlotFree(items, targetStart, moved.duration)
    ) {
      targetStart += 5;
    }
    if (targetStart + moved.duration > endHour * 60) return;
    if (targetStart + moved.duration > endHour * 60) {
      console.warn("Task duration exceeds end of day, reverting");
      return;
    }

    moved.start = targetStart;
    items.push(moved);
    let updated = items.sort((a, b) => a.start - b.start);

    let currentTime = startHour * 60;
    const fixedPositions = updated
      .filter((t) => t.fixed)
      .map((t) => ({ start: t.start, end: t.start + t.duration }));

    for (let i = 0; i < updated.length; i++) {
      const task = updated[i];
      if (task.fixed) {
        currentTime = task.start + task.duration + 5;
        continue;
      }

      const blocked = fixedPositions.find((f) => currentTime < f.start && currentTime + task.duration > f.start);
      if (blocked || currentTime + task.duration > endHour * 60) {
        console.warn("Cannot place task due to fixed task or end limit, reverting");
        setTimetable(deepCopy(timetable));
        return;
      }

      task.start = currentTime;
      currentTime += task.duration + 5;
    }

    setHistoryStack((prev) => [...prev, deepCopy(timetable)]);
    setTimetable(updated.sort((a, b) => a.start - b.start));
    localStorage.setItem(`timetable-${userKey}`, JSON.stringify(updated));
  };

  const saveTimetable = () => {
    localStorage.setItem(`timetable-${userKey}`, JSON.stringify(timetable));
    setOriginalTimetable(deepCopy(timetable));
    setHistoryStack([]);
    setEditMode(false);
  };

  const undoChanges = () => {
    if (historyStack.length > 0) {
      const previous = historyStack[historyStack.length - 1];
      setHistoryStack(historyStack.slice(0, -1));
      setTimetable(deepCopy(previous));
      localStorage.setItem(`timetable-${userKey}`, JSON.stringify(previous));
    }
  };

  const resetTimetable = () => {
    setTimetable(deepCopy(originalTimetable));
    setHistoryStack([]);
    localStorage.setItem(`timetable-${userKey}`, JSON.stringify(originalTimetable));
  };

  const formatTime = (minutes) => {
    if (minutes === undefined || minutes === null) return "--:--";
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
        Today’s Energy Level: <strong>{energyLevel} / 10</strong>
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
            <button className="save-btn" onClick={saveTimetable}>Save</button>
            <button className="undo-btn" onClick={undoChanges}>Undo</button>
            <button className="reset-btn" onClick={resetTimetable}>Reset</button>
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

        {hasGenerated && (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="timetable">
              {(provided) => (
                <div className="task-column" {...provided.droppableProps} ref={provided.innerRef}>
                  {timetable.map((slot, index) => {
                    if (slot.start === undefined || slot.duration === undefined) return null;
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
                              slot.isBreak ? 'break-task' : slot.fixed ? 'fixed' : ''
                            } urgency-${slot.urgency}`}
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
                              {slot.title} ({formatTime(slot.start)} - {formatTime(slot.start + slot.duration)})
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
        )}
      </div>
    </div>
  );
}

export default TimetablePage;
