// ============================================================================
// ATTENDAI ATTENDANCE MANAGEMENT & CORRECTIONS
// Team: NEXT GEN | Project: AI ATTENDANCE SYSTEM
// Active/Past Sessions, Manual Attendance Overrides, Correction Approvals
// ============================================================================

import { db } from './database.js';
import { auth, ROLES } from './auth.js';

export function renderAttendanceView() {
  const activeSession = db.getActiveSession();
  const pastSessions = db.getPastSessions();
  const corrections = db.getCorrections();
  const isAdmin = auth.hasPermission(ROLES.ADMINISTRATOR);
  const isTeacher = auth.hasPermission([ROLES.TEACHER, ROLES.ADMINISTRATOR]);

  return `
    <div class="view-container">
      <div class="view-header-row">
        <div class="view-title-group">
          <h1>Institutional Attendance Records</h1>
          <p>Session telemetry, computer-vision logs, manual teacher verifications, and correction requests.</p>
        </div>
        <div class="view-actions-group">
          ${activeSession ? `
            <button class="btn btn-accent" onclick="window.appRouter.navigateTo('camera')">
              <span>● Live Camera Session (${activeSession.className})</span>
            </button>
          ` : `
            <button class="btn btn-primary" onclick="window.attendanceViewApp.openStartSessionModal()">
              <span>+ Start Attendance Session</span>
            </button>
          `}
          ${isTeacher ? `
            <button class="btn btn-secondary" onclick="window.attendanceViewApp.openCorrectionModal()">
              <span>Submit Correction</span>
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Active Session Status Card -->
      ${activeSession ? `
        <div class="card" style="border-left: 5px solid var(--color-present); background: linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-subtle) 100%);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
            <div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <span class="status-dot"></span>
                <h2 style="font-size: 18px;">Active Session: ${activeSession.className} — ${activeSession.subjectName}</h2>
              </div>
              <p style="margin-top: 4px; color: var(--text-secondary); font-size: 13px;">
                Faculty: <strong>${activeSession.teacherName}</strong> • Started: <strong>${new Date(activeSession.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
              </p>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="text-align: right;">
                <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Live Attendance</div>
                <div style="font-size: 20px; font-weight: 800; color: var(--color-present);">${activeSession.averageAttendance}%</div>
              </div>
              <button class="btn btn-primary" onclick="window.appRouter.navigateTo('camera')">
                Open Camera Viewfinder
              </button>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Corrections Section for Administrators and Teachers -->
      <div class="card">
        <div class="card-header">
          <div class="card-title-box">
            <h2>Attendance Correction Requests</h2>
            <p>Faculty-submitted adjustment requests with reason auditing</p>
          </div>
          <span class="badge badge-lavender">${corrections.filter(c => c.status === 'PENDING').length} Pending Review</span>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Class / Subject</th>
                <th>Current Duration</th>
                <th>Requested Duration</th>
                <th>Reason for Adjustment</th>
                <th>Submitted By</th>
                <th>Status</th>
                ${isAdmin ? '<th style="text-align: right;">Action</th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${renderCorrectionRows(corrections, isAdmin)}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Past Sessions Ledger -->
      <div class="card">
        <div class="card-header">
          <div class="card-title-box">
            <h2>Completed Attendance Sessions Ledger</h2>
            <p>Cryptographically verified duration audits per academic hour</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <input type="text" id="sessions-search-input" placeholder="Search sessions..." class="form-input" style="width: 220px;" oninput="window.attendanceViewApp.filterSessions(this.value)" />
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table" id="sessions-data-table">
            <thead>
              <tr>
                <th>Session ID</th>
                <th>Class Cohort</th>
                <th>Subject</th>
                <th>Faculty</th>
                <th>Duration</th>
                <th>Enrolled</th>
                <th>Present / Partial / Absent</th>
                <th>Avg Attendance</th>
                <th style="text-align: right;">Audit File</th>
              </tr>
            </thead>
            <tbody id="sessions-table-body">
              ${renderSessionRows(pastSessions)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderCorrectionRows(corrections, isAdmin) {
  if (corrections.length === 0) {
    return `<tr><td colspan="${isAdmin ? 8 : 7}" style="text-align: center; padding: 24px; color: var(--text-muted);">No attendance correction requests submitted.</td></tr>`;
  }

  return corrections.map(c => `
    <tr>
      <td>
        <strong>${c.studentName}</strong>
        <div style="font-size: 11px; color: var(--text-muted);">Roll No: #${c.rollNumber}</div>
      </td>
      <td>
        <div>${c.className}</div>
        <div style="font-size: 11px; color: var(--text-muted);">${c.subjectName}</div>
      </td>
      <td>${c.currentDuration} mins</td>
      <td><strong style="color: var(--color-present);">${c.requestedDuration} mins</strong></td>
      <td style="max-width: 240px; font-size: 12px; color: var(--text-secondary);">${c.reason}</td>
      <td>${c.teacherName}</td>
      <td>
        <span class="badge badge-${c.status === 'APPROVED' ? 'present' : c.status === 'PENDING' ? 'late' : 'absent'}">
          ${c.status}
        </span>
      </td>
      ${isAdmin ? `
        <td style="text-align: right; white-space: nowrap;">
          ${c.status === 'PENDING' ? `
            <button class="btn btn-primary btn-sm" onclick="window.attendanceViewApp.reviewCorrection('${c.id}', 'APPROVED')">Approve</button>
            <button class="btn btn-secondary btn-sm" onclick="window.attendanceViewApp.reviewCorrection('${c.id}', 'REJECTED')">Reject</button>
          ` : `<span style="font-size: 11px; color: var(--text-muted);">Reviewed</span>`}
        </td>
      ` : ''}
    </tr>
  `).join('');
}

function renderSessionRows(sessions) {
  if (sessions.length === 0) {
    return `<tr><td colspan="9" style="text-align: center; padding: 30px;">No completed attendance sessions logged yet.</td></tr>`;
  }

  return sessions.map(s => `
    <tr>
      <td><strong>${s.id}</strong></td>
      <td><strong>${s.className}</strong></td>
      <td><span class="badge badge-lavender">${s.subjectName}</span></td>
      <td>${s.teacherName}</td>
      <td>${s.durationMinutes} mins</td>
      <td>${s.totalEnrolled}</td>
      <td>
        <span style="color: var(--color-present); font-weight: 700;">${s.totalPresent}P</span> / 
        <span style="color: var(--color-late); font-weight: 700;">${s.totalLate || 0}L</span> / 
        <span style="color: var(--color-partial); font-weight: 700;">${s.totalPartial}Part</span> / 
        <span style="color: var(--color-absent); font-weight: 700;">${s.totalAbsent}A</span>
      </td>
      <td>
        <strong style="color: ${s.averageAttendance >= 75 ? 'var(--color-present)' : 'var(--color-late)'}; font-size: 14px;">
          ${s.averageAttendance}%
        </strong>
      </td>
      <td style="text-align: right; white-space: nowrap;">
        <button class="btn btn-secondary btn-sm" onclick="window.attendanceViewApp.exportSessionCSV('${s.id}')">
          Export CSV
        </button>
        <button class="btn btn-secondary btn-sm" onclick="window.attendanceViewApp.viewSessionDetails('${s.id}')">
          View Roster
        </button>
      </td>
    </tr>
  `).join('');
}

// Global functions for attendance actions
window.attendanceViewApp = {
  filterSessions(query) {
    const q = query.toLowerCase();
    const rows = document.querySelectorAll('#sessions-table-body tr');
    rows.forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  },

  openStartSessionModal() {
    window.appRouter.openStartSessionModal();
  },

  openCorrectionModal(prefilledStudentId = '') {
    window.appRouter.openCorrectionModal(prefilledStudentId);
  },

  reviewCorrection(id, decision) {
    const user = auth.getCurrentUser();
    db.updateCorrectionStatus(id, decision, user?.fullName || 'System Administrator');
    window.appRouter.renderCurrentView();
  },

  exportSessionCSV(sessionId) {
    const session = db.getPastSessions().find(s => s.id === sessionId);
    if (!session) return;

    let csv = `Student ID,Roll Number,Student Name,First Seen,Last Seen,Duration (Mins),Attendance %,Status,Method\n`;
    for (const r of session.records) {
      csv += `"${r.studentId}","${r.rollNumber}","${r.studentName}","${r.firstSeen || 'N/A'}","${r.lastSeen || 'N/A'}",${r.durationMinutes},${r.percentage}%,"${r.status}","${r.method}"\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AttendAI_${session.className}_${sessionId}_Attendance.csv`;
    link.click();
    URL.revokeObjectURL(url);

    db.logAction('CSV_EXPORTED', auth.getCurrentUser()?.fullName || 'User', session.className, { sessionId });
  },

  viewSessionDetails(sessionId) {
    const session = db.getPastSessions().find(s => s.id === sessionId);
    if (!session) return;

    const modal = document.getElementById('app-modal-content');
    const backdrop = document.getElementById('app-modal-backdrop');
    if (!modal || !backdrop) return;

    modal.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">Attendance Audit: ${session.className} — ${session.subjectName}</h2>
        <button class="modal-close-btn" onclick="window.appRouter.closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div style="display: flex; justify-content: space-between; font-size: 13px; color: var(--text-secondary);">
          <span>Faculty: <strong>${session.teacherName}</strong></span>
          <span>Date: <strong>${session.startedAt.split('T')[0]}</strong></span>
          <span>Avg Attendance: <strong style="color: var(--color-present);">${session.averageAttendance}%</strong></span>
        </div>
        <div class="table-responsive" style="max-height: 380px;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Roll</th>
                <th>Student</th>
                <th>First Seen</th>
                <th>Last Seen</th>
                <th>Confirmed Duration</th>
                <th>Percentage</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${session.records.map(r => `
                <tr>
                  <td>#${r.rollNumber}</td>
                  <td><strong>${r.studentName}</strong></td>
                  <td>${r.firstSeen || '—'}</td>
                  <td>${r.lastSeen || '—'}</td>
                  <td>${r.durationMinutes} mins</td>
                  <td>${r.percentage}%</td>
                  <td><span class="badge badge-${r.status.toLowerCase()}">${r.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="window.attendanceViewApp.exportSessionCSV('${session.id}')">Export CSV</button>
        <button class="btn btn-primary" onclick="window.appRouter.closeModal()">Close Audit</button>
      </div>
    `;

    backdrop.classList.add('open');
  }
};
