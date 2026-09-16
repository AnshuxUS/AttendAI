// ============================================================================
// ATTENDAI STUDENTS MANAGEMENT & PROFILE DRAWER
// Team: NEXT GEN | Project: AI ATTENDANCE SYSTEM
// Roster directory, attendance shortage alerts, slide-over student profile drawer
// ============================================================================

import { db } from './database.js';
import { auth, ROLES } from './auth.js';

export function renderStudentsView() {
  const students = db.getStudents();
  const isAdmin = auth.hasPermission(ROLES.ADMINISTRATOR);
  const settings = db.getSettings();
  const threshold = settings.attendanceThreshold || 75.0;

  const lowCount = students.filter(s => (s.attendanceRate || 0) < threshold).length;

  return `
    <div class="view-container">
      <div class="view-header-row">
        <div class="view-title-group">
          <h1>Student Directory</h1>
          <p>Academic profiles, enrolled cohorts, biometric roster, and cumulative attendance rates.</p>
        </div>
        <div class="view-actions-group">
          <button class="btn btn-primary" onclick="window.studentsViewApp.openAddStudentModal()">
            <span>+ Add Student</span>
          </button>
        </div>
      </div>

      <div class="metrics-grid">
        <div class="metric-card total">
          <div class="metric-top">
            <span class="metric-title">Total Enrolled</span>
            <span class="badge badge-lavender">BCA 1A</span>
          </div>
          <div class="metric-value">${students.length}</div>
          <span class="metric-trend trend-up">All active profiles</span>
        </div>
        <div class="metric-card present">
          <div class="metric-top">
            <span class="metric-title">Above Threshold (≥${threshold}%)</span>
            <span class="badge badge-present">Eligible</span>
          </div>
          <div class="metric-value">${students.length - lowCount}</div>
          <span class="metric-trend trend-up">Good academic standing</span>
        </div>
        <div class="metric-card ${lowCount > 0 ? 'absent' : 'present'}">
          <div class="metric-top">
            <span class="metric-title">Attendance Shortage</span>
            <span class="badge ${lowCount > 0 ? 'badge-absent' : 'badge-present'}">&lt;${threshold}%</span>
          </div>
          <div class="metric-value">${lowCount}</div>
          <span class="metric-trend ${lowCount > 0 ? 'trend-down' : 'trend-up'}">Requires notice</span>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title-box">
            <h2>Enrolled Students</h2>
            <p>Click on any student to open their comprehensive academic profile</p>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <input type="text" id="students-search-input" placeholder="Search by name, roll no, or email..." class="form-input" style="width: 240px;" oninput="window.studentsViewApp.filterStudents()" />
            <select id="students-filter-status" class="form-select" style="width: 160px;" onchange="window.studentsViewApp.filterStudents()">
              <option value="ALL">All Status</option>
              <option value="GOOD">Eligible (≥${threshold}%)</option>
              <option value="LOW">Shortage (&lt;${threshold}%)</option>
            </select>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student</th>
                <th>Student ID</th>
                <th>Class Cohort</th>
                <th>Contact</th>
                <th>Cumulative Attendance</th>
                <th>Eligibility Status</th>
                <th style="text-align: right;">Profile</th>
              </tr>
            </thead>
            <tbody id="students-table-body">
              ${renderStudentRows(students, threshold)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderStudentRows(students, threshold) {
  if (students.length === 0) {
    return `<tr><td colspan="8" style="text-align: center; padding: 30px;">No students enrolled yet.</td></tr>`;
  }

  return students.map(s => {
    const isGood = (s.attendanceRate || 0) >= threshold;
    return `
      <tr style="cursor: pointer;" onclick="window.studentsViewApp.openStudentProfile('${s.id}')">
        <td><strong>#${s.rollNumber || '—'}</strong></td>
        <td>
          <div class="table-user-cell">
            <img src="${s.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}" class="table-user-avatar" alt="${s.fullName}" />
            <div class="table-user-meta">
              <span class="table-user-name" style="display: flex; align-items: center; gap: 6px;">
                <span>${s.fullName}</span>
                <span class="biometric-status-seal" style="font-size: 9.5px; padding: 2px 6px;">AI Enrolled</span>
              </span>
              <span class="table-user-sub">${s.email}</span>
            </div>
          </div>
        </td>
        <td><span class="badge badge-neutral">${s.userCode || s.id}</span></td>
        <td>
          <strong>${s.classId === 'cls-2' ? 'BCA 2B' : 'BCA 1A'}</strong>
          <div style="font-size: 11px; color: var(--text-muted);">${s.department || 'Computer Applications'} • ${s.semester || 'Sem 1'}</div>
        </td>
        <td>${s.phone || '—'}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="flex: 1; min-width: 60px; height: 7px; background: var(--bg-surface-subtle); border-radius: var(--radius-full); overflow: hidden;">
              <div style="width: ${s.attendanceRate || 0}%; height: 100%; background: ${isGood ? 'var(--color-present)' : 'var(--color-absent)'};"></div>
            </div>
            <strong style="font-size: 12.5px; color: ${isGood ? 'var(--color-present)' : 'var(--color-absent)'};">${s.attendanceRate || 0}%</strong>
          </div>
        </td>
        <td>
          <span class="badge badge-${isGood ? 'present' : 'absent'}">
            ${isGood ? 'Eligible' : 'Shortage Warning'}
          </span>
        </td>
        <td style="text-align: right; white-space: nowrap;">
          <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); window.studentsViewApp.openStudentProfile('${s.id}')">
            View File
          </button>
          <button class="btn btn-secondary btn-sm" style="color: var(--color-absent); margin-left: 4px;" onclick="event.stopPropagation(); window.studentsViewApp.removeStudent('${s.id}', '${s.fullName}')" title="Remove Student">
            Remove
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// Global functions for profile drawer and filtering
window.studentsViewApp = {
  filterStudents() {
    const q = document.getElementById('students-search-input')?.value.toLowerCase() || '';
    const status = document.getElementById('students-filter-status')?.value || 'ALL';
    const settings = db.getSettings();
    const threshold = settings.attendanceThreshold || 75.0;

    const rows = document.querySelectorAll('#students-table-body tr');
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      const matchesQuery = text.includes(q);
      const isGood = !text.includes('shortage warning');

      let matchesStatus = true;
      if (status === 'GOOD') matchesStatus = isGood;
      if (status === 'LOW') matchesStatus = !isGood;

      row.style.display = (matchesQuery && matchesStatus) ? '' : 'none';
    });
  },

  openStudentProfile(studentId) {
    const student = db.getProfileById(studentId);
    if (!student) return;

    const pastSessions = db.getPastSessions();
    const studentRecords = [];
    for (const sess of pastSessions) {
      const r = sess.records.find(item => item.studentId === studentId);
      if (r) {
        studentRecords.push({
          sessionTitle: `${sess.className} - ${sess.subjectName}`,
          date: sess.startedAt.split('T')[0],
          duration: `${r.durationMinutes}m`,
          status: r.status,
          percentage: `${r.percentage}%`
        });
      }
    }

    const drawer = document.getElementById('app-drawer-panel');
    const backdrop = document.getElementById('app-drawer-backdrop');
    if (!drawer || !backdrop) return;

    const bio = student.biometricProfile || {
      status: 'ENROLLED',
      qualityScore: 98.4,
      livenessScore: 99.2,
      landmarkCount: 68,
      biometricHash: `BIO-${(student.id || '000').slice(-6).toUpperCase()}`
    };

    drawer.innerHTML = `
      <div class="drawer-header">
        <div style="display: flex; align-items: center; gap: 14px;">
          <img src="${student.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}" style="width: 52px; height: 52px; border-radius: var(--radius-md); object-fit: cover; border: 2px solid var(--color-lavender); box-shadow: 0 4px 12px rgba(125, 120, 218, 0.25);" />
          <div>
            <h2 style="font-size: 17px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
              <span>${student.fullName}</span>
              <span class="biometric-status-seal" style="font-size: 10px;">AI Verified</span>
            </h2>
            <div style="font-size: 12px; color: var(--text-muted);">${student.userCode || student.id} • Roll No: #${student.rollNumber || '—'}</div>
          </div>
        </div>
        <button class="modal-close-btn" onclick="window.studentsViewApp.closeDrawer()">✕</button>
      </div>

      <div class="drawer-body">
        <div class="card" style="padding: 16px; background: var(--bg-surface-subtle);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--text-secondary);">Cumulative Attendance</span>
            <span class="badge badge-${(student.attendanceRate || 0) >= 75 ? 'present' : 'absent'}">
              ${(student.attendanceRate || 0) >= 75 ? 'Academic Good Standing' : 'Shortage Warning'}
            </span>
          </div>
          <div style="font-family: var(--font-heading); font-size: 32px; font-weight: 800; margin-top: 6px; color: ${(student.attendanceRate || 0) >= 75 ? 'var(--color-present)' : 'var(--color-absent)'};">
            ${student.attendanceRate || 0}%
          </div>
          <div style="margin-top: 10px;">
            <div class="timeline-bar-container">
              <div class="timeline-bar">
                <div class="timeline-segment present" style="width: ${student.attendanceRate || 0}%;"></div>
                <div class="timeline-segment absent" style="width: ${100 - (student.attendanceRate || 0)}%;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- AI Facial Biometric Identity Card -->
        <div class="card" style="padding: 16px; background: rgba(14, 13, 27, 0.95); border: 1px solid rgba(157, 153, 232, 0.3);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: #A78BFA; letter-spacing: 0.04em;">
              Biometric Neural Identity
            </span>
            <span class="badge badge-present" style="font-size: 10px;">128-d Vector Enrolled</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-family: var(--font-mono); font-size: 11px;">
            <div>
              <span style="color: rgba(255,255,255,0.5); display: block;">Vector Hash</span>
              <strong style="color: #34D399;">${bio.biometricHash || 'BIO-DEFAULT'}</strong>
            </div>
            <div>
              <span style="color: rgba(255,255,255,0.5); display: block;">Quality Score</span>
              <strong style="color: #34D399;">${bio.qualityScore || 98.4}%</strong>
            </div>
            <div>
              <span style="color: rgba(255,255,255,0.5); display: block;">Landmark Points</span>
              <strong style="color: #FFFFFF;">${bio.landmarkCount || 68} Points Mesh</strong>
            </div>
            <div>
              <span style="color: rgba(255,255,255,0.5); display: block;">Liveness Check</span>
              <strong style="color: #34D399;">${bio.livenessScore || 99.2}%</strong>
            </div>
          </div>
          ${student.biometricNotes ? `
            <div style="margin-top: 10px; font-size: 11px; color: var(--color-lavender-soft); border-top: 1px solid rgba(255,255,255,0.08); padding-top: 8px;">
              <strong>Biometric Notes:</strong> ${student.biometricNotes}
            </div>
          ` : ''}
        </div>

        <!-- Academic & Personal Details -->
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <h3 style="font-size: 13px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">Academic & Personal Profile</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px;">
            <div>
              <span style="color: var(--text-muted); font-size: 11.5px; display: block;">Cohort</span>
              <strong>${student.classId === 'cls-2' ? 'BCA 2B' : 'BCA 1A (DBMS)'}</strong>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 11.5px; display: block;">Semester</span>
              <strong>${student.semester || 'Semester 1'}</strong>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 11.5px; display: block;">Department</span>
              <strong>${student.department || 'Computer Applications'}</strong>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 11.5px; display: block;">Date of Birth</span>
              <strong>${student.dob || '14 May 2006'}</strong>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 11.5px; display: block;">Gender</span>
              <strong>${student.gender || 'Not Specified'}</strong>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 11.5px; display: block;">Blood Group</span>
              <strong style="color: var(--color-absent);">${student.bloodGroup || 'O+'}</strong>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 11.5px; display: block;">College Email</span>
              <strong style="word-break: break-all;">${student.email}</strong>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 11.5px; display: block;">Phone Contact</span>
              <strong>${student.phone || '+91 99000 11223'}</strong>
            </div>
          </div>
        </div>

        <!-- Guardian & Emergency Information -->
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <h3 style="font-size: 13px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">Guardian & Emergency Contact</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; background: var(--bg-surface-subtle); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <div>
              <span style="color: var(--text-muted); font-size: 11.5px; display: block;">Parent / Guardian</span>
              <strong>${student.guardianName || 'Dr. Sharma / Guardian'}</strong>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 11.5px; display: block;">Emergency Phone</span>
              <strong>${student.guardianPhone || student.emergencyContact || student.phone || '+91 98110 54321'}</strong>
            </div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <h3 style="font-size: 14px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">Recent Session Attendance History</h3>
          ${studentRecords.length > 0 ? `
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Session</th>
                    <th>Date</th>
                    <th>Duration</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${studentRecords.map(rec => `
                    <tr>
                      <td><strong>${rec.sessionTitle}</strong></td>
                      <td>${rec.date}</td>
                      <td>${rec.duration}</td>
                      <td><span class="badge badge-${rec.status.toLowerCase()}">${rec.status}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : `
            <div class="empty-state" style="padding: 20px;">
              <p>No past session attendance logged yet.</p>
            </div>
          `}
        </div>

        <div style="margin-top: auto; padding-top: 16px; border-top: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick="window.studentsViewApp.requestCorrectionPrompt('${student.id}')">
              Submit Correction
            </button>
            <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="window.appRouter.navigateTo('reports')">
              Export Report
            </button>
          </div>
          <button class="btn btn-secondary btn-sm" style="color: var(--color-absent); border-color: rgba(239, 68, 68, 0.4);" onclick="window.studentsViewApp.removeStudent('${student.id}', '${student.fullName}')">
            🗑️ Remove Student from Class
          </button>
        </div>
      </div>
    `;

    backdrop.classList.add('open');
    drawer.classList.add('open');
  },

  closeDrawer() {
    document.getElementById('app-drawer-backdrop')?.classList.remove('open');
    document.getElementById('app-drawer-panel')?.classList.remove('open');
  },

  requestCorrectionPrompt(studentId) {
    this.closeDrawer();
    window.appRouter.navigateTo('attendance');
    setTimeout(() => {
      window.attendanceViewApp?.openCorrectionModal(studentId);
    }, 200);
  },

  openAddStudentModal() {
    window.appRouter.openAddStudentModal();
  },

  removeStudent(studentId, studentName) {
    if (confirm(`Are you sure you want to remove student "${studentName}" from the class roster?`)) {
      const success = db.deleteStudent(studentId);
      if (success) {
        this.closeDrawer();
        window.appRouter.renderCurrentView();
        window.appRouter.showToast(`Removed student "${studentName}" successfully.`);
      }
    }
  }
};
