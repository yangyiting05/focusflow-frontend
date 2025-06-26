/* import React from 'react';
import './Dashboard.css';

function TimetablePage() {
  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Your Daily Timetable</h2>
      <p>This page will show your scheduled tasks and time blocks.</p>
    </div>
  );
}

export default TimetablePage;
*/

import React, { useEffect, useState } from 'react';
import './Dashboard.css';

function TimetablePage() {
  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('tasks');
    if (stored) {
      const tasks = JSON.parse(stored)
        .filter(t => t.status !== 'Completed') // skip done tasks
        .sort((a, b) => b.urgency - a.urgency);

      const scheduled = generateTimetable(tasks);
      setBlocks(scheduled);
    }
  }, []);

  const generateTimetable = (tasks) => {
    const startHour = 9;
    const endHour = 21;
    const slotLength = 30; // minutes
    const totalSlots = ((endHour - startHour) * 60) / slotLength;

    const timetable = Array(totalSlots).fill(null);
    let currentSlot = 0;

    for (const task of tasks) {
      const neededSlots = Math.ceil(task.duration / slotLength);
      while (currentSlot + neededSlots <= totalSlots &&
             !timetable.slice(currentSlot, currentSlot + neededSlots).some(Boolean)) {
        for (let i = 0; i < neededSlots; i++) {
          timetable[currentSlot + i] = { ...task, part: `${i + 1}/${neededSlots}` };
        }
        currentSlot += neededSlots;
        break;
      }
    }

    return timetable.map((task, index) => {
      const hour = startHour + Math.floor(index / 2);
      const minutes = index % 2 === 0 ? '00' : '30';
      return {
        time: `${hour}:${minutes}`,
        task,
      };
    });
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">📅 Your Daily Timetable</h2>
      <p>This page auto-generates a schedule based on urgency and duration.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px', marginTop: '2rem' }}>
        {blocks.map((block, idx) => (
          <React.Fragment key={idx}>
            <div><strong>{block.time}</strong></div>
            <div
              style={{
                backgroundColor: block.task ? '#e0f2fe' : '#f8f9fa',
                borderLeft: block.task ? '4px solid #3b82f6' : '4px solid #ddd',
                borderRadius: '6px',
                padding: '0.5rem',
              }}
            >
              {block.task ? (
                <>
                  <strong>{block.task.title}</strong> ({block.task.part})<br />
                  <small>Urgency: {block.task.urgency}</small>
                </>
              ) : (
                <em>Free slot</em>
              )}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default TimetablePage;
