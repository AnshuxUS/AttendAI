// ============================================================================
// ATTENDAI CLASSES VIEW
// Team: NEXT GEN | Project: AI ATTENDANCE SYSTEM
// Class roster, Teacher assignment, Capacity tracking, Session launcher
// ============================================================================

import { db } from './database.js';
import { auth, ROLES } from './auth.js';

export function renderClassesView() {
  const classes = db.getClasses();
  const isAdmin = auth.hasPermission(ROLES.ADMINISTRATOR);
  const currentUser = auth.getCurrentUser();

  return `
    <div class="view-container">
      <div class="view-header-row">
        <div class="view-title-group">
          <h1>Course Classes & Sections</h1>
          <p>Manage curriculum cohorts, room allocations, and direct attendance sessions.</p>
        </div>
        <div class="view-actions-group">
          ${isAdmin ? `
            <button class="btn btn-primary" onclick="window.appRouter.openCreateClassModal()">
              <span>+ Create Class</span>
            </button>
          ` : ''}
        </div>
      </div>

      <div class="metrics-grid">
        <div class="metric-card total">
          <div class="metric-top">
            <span class="metric-title">Active Classes</span>
            <span class="badge badge-lavender">${classes.length} Total</span>
          </div>
          <div class="metric-value">${classes.length}</div>
          <span class="metric-trend trend-up">All active for 2026-2027</span>
        </div>
        <div class="metric-card present">
          <div class="metric-top">
            <span class="metric-title">Enrolled Students</span>
            <span class="badge badge-present">BCA Cohort</span>
          </div>
          <div class="metric-value">${classes.reduce((sum, c) => sum + (c.enrolledCount || 0), 0)}</div>
          <span class="metric-trend trend-up">Active student bodies</span>
        </div>
        <div class="metric-card partial">
          <div class="metric-top">
            <span class="metric-title">Assigned Rooms</span>
            <span class="badge badge-neutral">Campus Labs</span>
          </div>
          <div class="metric-value">4</div>
          <span class="metric-trend">Labs & Lecture Theatres</span>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title-box">
            <h2>Department Classes Roster</h2>
            <p>Computer Applications Academic Year 2026-2027</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <input type="text" id="classes-search-input" placeholder="Search class, teacher, or subject..." class="form-input" style="width: 260px;" oninput="window.classesViewApp.filterClasses(this.value)" />
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table" id="classes-data-table">
            <thead>
              <tr>
                <th>Class Code</th>
                <th>Class Name</th>
                <th>Subject Name</th>
                <th>Assigned Faculty</th>
                <th>Classroom / Lab</th>
                <th>Enrolled</th>
                <th>Status</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody id="classes-table-body">
              ${renderClassRows(classes)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderClassRows(classes) {
  if (classes.length === 0) {
    return `<tr><td colspan="8" style="text-align: center; padding: 30px;">No classes registered yet.</td></tr>`;
  }

  const currentUser = auth.getCurrentUser();
  const isTeacher = currentUser?.role === ROLES.TEACHER;
  const isAdmin = currentUser?.role === ROLES.ADMINISTRATOR;

  return classes.map(c => `
    <tr>
      <td><strong>${c.classCode}</strong></td>
      <td>
        <div style="font-weight: 600; color: var(--text-primary);">${c.name}</div>
        <div style="font-size: 11.5px; color: var(--text-muted);">${c.course} • Year ${c.year}</div>
      </td>
      <td>
        <span class="badge badge-lavender">${c.subjectName}</span>
      </td>
      <td>
        <div style="font-weight: 600;">${c.teacherName}</div>
        <div style="font-size: 11px; color: var(--text-muted);">Faculty In-Charge</div>
      </td>
      <td>${c.roomNumber}</td>
      <td>
        <strong>${c.enrolledCount}</strong> / ${c.capacity}
      </td>
      <td>
        <span class="badge badge-${c.status === 'ACTIVE' ? 'present' : 'neutral'}">${c.status}</span>
      </td>
      <td style="text-align: right; white-space: nowrap;">
        <button class="btn btn-primary btn-sm" onclick="window.appRouter.startClassAttendanceSession('${c.id}')" title="Start Camera Attendance Session">
          Start Attendance
        </button>
        <button class="btn btn-secondary btn-sm" onclick="window.appRouter.navigateTo('students')" title="Manage Class Students">
          Students
        </button>
        <button class="btn btn-secondary btn-sm" onclick="window.appRouter.navigateTo('timetable')" title="View Timetable">
          Schedule
        </button>
      </td>
    </tr>
  `).join('');
}

// Attach filter helper to window
window.classesViewApp = {
  filterClasses(query) {
    const q = query.toLowerCase();
    const rows = document.querySelectorAll('#classes-table-body tr');
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(q) ? '' : 'none';
    });
  }
};
