// ============================================================================
// ATTENDAI REPORTS & ANALYTICS VIEW
// Team: NEXT GEN | Project: AI ATTENDANCE SYSTEM
// Comprehensive Attendance Analytics, Status Distributions, CSV & PDF Export
// ============================================================================

import { db } from './database.js';
import { auth } from './auth.js';

export function renderReportsView() {
  const pastSessions = db.getPastSessions();
  const students = db.getStudents();
  const settings = db.getSettings();
  const threshold = settings.attendanceThreshold || 75.0;

  // Aggregate stats
  let totalPresentCount = 0;
  let totalPartialCount = 0;
  let totalLateCount = 0;
  let totalAbsentCount = 0;

  for (const s of pastSessions) {
    totalPresentCount += (s.totalPresent || 0);
    totalPartialCount += (s.totalPartial || 0);
    totalLateCount += (s.totalLate || 0);
    totalAbsentCount += (s.totalAbsent || 0);
  }

  const grandTotal = totalPresentCount + totalPartialCount + totalLateCount + totalAbsentCount || 1;
  const presentPct = ((totalPresentCount / grandTotal) * 100).toFixed(1);
  const partialPct = ((totalPartialCount / grandTotal) * 100).toFixed(1);
  const latePct = ((totalLateCount / grandTotal) * 100).toFixed(1);
  const absentPct = ((totalAbsentCount / grandTotal) * 100).toFixed(1);

  return `
    <div class="view-container">
      <div class="view-header-row">
        <div class="view-title-group">
          <h1>Attendance Analytics & Reports</h1>
          <p>Institutional attendance trends, threshold compliance, and verifiable ledger exports.</p>
        </div>
        <div class="view-actions-group">
          <button class="btn btn-secondary" onclick="window.reportsViewApp.exportCSV()">
            <span>Export CSV</span>
          </button>
          <button class="btn btn-primary" onclick="window.reportsViewApp.printPDF()">
            <span>Generate PDF Report</span>
          </button>
        </div>
      </div>

      <div class="metrics-grid">
        <div class="metric-card present">
          <div class="metric-top">
            <span class="metric-title">Verified Present</span>
            <span class="badge badge-present">${presentPct}%</span>
          </div>
          <div class="metric-value">${totalPresentCount}</div>
          <span class="metric-trend trend-up">Confirmed presence</span>
        </div>
        <div class="metric-card partial">
          <div class="metric-top">
            <span class="metric-title">Partial Attendance</span>
            <span class="badge badge-partial">${partialPct}%</span>
          </div>
          <div class="metric-value">${totalPartialCount}</div>
          <span class="metric-trend">50% - 74% duration</span>
        </div>
        <div class="metric-card late">
          <div class="metric-top">
            <span class="metric-title">Late Arrivals</span>
            <span class="badge badge-late">${latePct}%</span>
          </div>
          <div class="metric-value">${totalLateCount}</div>
          <span class="metric-trend">&gt;15 min delayed</span>
        </div>
        <div class="metric-card absent">
          <div class="metric-top">
            <span class="metric-title">Recorded Absent</span>
            <span class="badge badge-absent">${absentPct}%</span>
          </div>
          <div class="metric-value">${totalAbsentCount}</div>
          <span class="metric-trend trend-down">Zero confirmed presence</span>
        </div>
      </div>

      <!-- Graphical Distribution Card -->
      <div class="card">
        <div class="card-header">
          <div class="card-title-box">
            <h2>Institutional Attendance Breakdown</h2>
            <p>Aggregated presence distribution across completed academic sessions</p>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 14px; padding: 10px 0;">
          <div class="timeline-bar-container">
            <div class="timeline-bar" style="height: 18px;">
              <div class="timeline-segment present" style="width: ${presentPct}%;" title="Present: ${presentPct}%"></div>
              <div class="timeline-segment partial" style="width: ${partialPct}%; background-color: var(--color-partial);" title="Partial: ${partialPct}%"></div>
              <div class="timeline-segment late" style="width: ${latePct}%; background-color: var(--color-late);" title="Late: ${latePct}%"></div>
              <div class="timeline-segment absent" style="width: ${absentPct}%;" title="Absent: ${absentPct}%"></div>
            </div>
            <div class="timeline-legend" style="margin-top: 8px; font-size: 12px;">
              <div class="timeline-legend-item">
                <span class="legend-dot" style="background-color: var(--color-present);"></span>
                <span>Present (${presentPct}%)</span>
              </div>
              <div class="timeline-legend-item">
                <span class="legend-dot" style="background-color: var(--color-partial);"></span>
                <span>Partial (${partialPct}%)</span>
              </div>
              <div class="timeline-legend-item">
                <span class="legend-dot" style="background-color: var(--color-late);"></span>
                <span>Late (${latePct}%)</span>
              </div>
              <div class="timeline-legend-item">
                <span class="legend-dot" style="background-color: var(--color-absent);"></span>
                <span>Absent (${absentPct}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cohort Summary Table -->
      <div class="card">
        <div class="card-header">
          <div class="card-title-box">
            <h2>Student Attendance Compliance Roster</h2>
            <p>Institutional threshold check against minimum ${threshold}% attendance</p>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Student Code</th>
                <th>Class Cohort</th>
                <th>Cumulative %</th>
                <th>Institutional Compliance</th>
              </tr>
            </thead>
            <tbody>
              ${students.map(s => {
                const isGood = (s.attendanceRate || 0) >= threshold;
                return `
                  <tr>
                    <td><strong>#${s.rollNumber || '—'}</strong></td>
                    <td><strong>${s.fullName}</strong></td>
                    <td><span class="badge badge-neutral">${s.userCode}</span></td>
                    <td>BCA 1A</td>
                    <td><strong style="color: ${isGood ? 'var(--color-present)' : 'var(--color-absent)'}; font-size: 14px;">${s.attendanceRate || 0}%</strong></td>
                    <td>
                      <span class="badge badge-${isGood ? 'present' : 'absent'}">
                        ${isGood ? 'Eligible for Examination' : 'Attendance Shortage Notice'}
                      </span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

window.reportsViewApp = {
  exportCSV() {
    const students = db.getStudents();
    const settings = db.getSettings();

    let csv = `Institution Name,${settings.institutionName}\nAcademic Year,${settings.academicYear}\nExport Date,${new Date().toLocaleDateString()}\n\n`;
    csv += `Roll Number,Student ID,Student Name,Email,Cohort,Cumulative Attendance %,Compliance Status\n`;

    for (const s of students) {
      const status = (s.attendanceRate || 0) >= (settings.attendanceThreshold || 75) ? 'Eligible' : 'Shortage Warning';
      csv += `"${s.rollNumber}","${s.userCode}","${s.fullName}","${s.email}","BCA 1A",${s.attendanceRate || 0}%,"${status}"\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AttendAI_Departmental_Attendance_Report_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    db.logAction('REPORT_CSV_GENERATED', auth.getCurrentUser()?.fullName || 'User', 'Attendance Analytics', {});
  },

  printPDF() {
    db.logAction('REPORT_PDF_PRINTED', auth.getCurrentUser()?.fullName || 'User', 'Attendance Report', {});
    window.print();
  }
};
