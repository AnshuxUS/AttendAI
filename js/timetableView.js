// ============================================================================
// ATTENDAI TIMETABLE MATRIX VIEW
// Team: NEXT GEN | Project: AI ATTENDANCE SYSTEM
// Weekly Academic Period Matrix, Teacher & Class Scheduling
// ============================================================================

import { db } from './database.js';
import { auth, ROLES } from './auth.js';

export function renderTimetableView() {
  const timetable = db.getTimetable();
  const classes = db.getClasses();
  const isAdmin = auth.hasPermission(ROLES.ADMINISTRATOR);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return `
    <div class="view-container">
      <div class="view-header-row">
        <div class="view-title-group">
          <h1>Institutional Timetable Matrix</h1>
          <p>Curriculum class routines, faculty room assignments, and academic hour slots.</p>
        </div>
        <div class="view-actions-group">
          ${isAdmin ? `
            <button class="btn btn-primary" onclick="window.timetableViewApp.openAddPeriodModal()">
              <span>+ Add Period Entry</span>
            </button>
          ` : ''}
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title-box">
            <h2>Weekly Schedule Overview</h2>
            <p>Mon – Fri Academic Lecture & Lab Schedule</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <select id="timetable-filter-day" class="form-select" style="width: 160px;" onchange="window.timetableViewApp.filterSchedule()">
              <option value="ALL">All Days</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
            </select>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table" id="timetable-data-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Time Slot</th>
                <th>Class Cohort</th>
                <th>Subject Name</th>
                <th>Faculty In-Charge</th>
                <th>Room / Lab</th>
                <th>Attendance Action</th>
              </tr>
            </thead>
            <tbody id="timetable-table-body">
              ${renderTimetableRows(timetable)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderTimetableRows(timetable) {
  if (timetable.length === 0) {
    return `<tr><td colspan="7" style="text-align: center; padding: 24px;">No timetable periods configured.</td></tr>`;
  }

  return timetable.map(t => `
    <tr>
      <td><strong>${t.dayOfWeek}</strong></td>
      <td>
        <span class="badge badge-neutral">${t.startTime} – ${t.endTime}</span>
      </td>
      <td><strong>${t.className}</strong></td>
      <td>
        <span class="badge badge-lavender">${t.subjectName}</span>
      </td>
      <td>
        <div style="font-weight: 600;">${t.teacherName}</div>
      </td>
      <td>
        <span style="font-family: var(--font-mono); font-size: 12px;">${t.room}</span>
      </td>
      <td>
        <button class="btn btn-primary btn-sm" onclick="window.appRouter.startClassAttendanceSession('${t.classId}')">
          Launch Session
        </button>
      </td>
    </tr>
  `).join('');
}

window.timetableViewApp = {
  filterSchedule() {
    const day = document.getElementById('timetable-filter-day')?.value || 'ALL';
    const rows = document.querySelectorAll('#timetable-table-body tr');
    rows.forEach(row => {
      if (day === 'ALL') {
        row.style.display = '';
      } else {
        const text = row.querySelector('td')?.textContent || '';
        row.style.display = text.includes(day) ? '' : 'none';
      }
    });
  },

  openAddPeriodModal() {
    window.appRouter.openAddPeriodModal();
  }
};
