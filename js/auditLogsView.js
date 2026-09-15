// ============================================================================
// ATTENDAI AUDIT LOGS VIEW
// Team: NEXT GEN | Project: AI ATTENDANCE SYSTEM
// Immutable Audit Trail, Event Timestamps, Security & Regulatory Compliance
// ============================================================================

import { db } from './database.js';

export function renderAuditLogsView() {
  const logs = db.getAuditLogs();

  return `
    <div class="view-container">
      <div class="view-header-row">
        <div class="view-title-group">
          <h1>Institutional Audit Logs</h1>
          <p>Chronological immutable records of all administrative actions, attendance modifications, and biometric sessions.</p>
        </div>
        <div class="view-actions-group">
          <button class="btn btn-secondary btn-sm" onclick="window.auditLogsViewApp.exportAuditCSV()">
            Export Audit Trail (.CSV)
          </button>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title-box">
            <h2>Audit Events</h2>
            <p>${logs.length} Recorded Institutional Activities</p>
          </div>
          <input type="text" id="audit-search-input" placeholder="Search by action, user, or entity..." class="form-input" style="width: 260px;" oninput="window.auditLogsViewApp.filterLogs(this.value)" />
        </div>

        <div class="table-responsive">
          <table class="data-table" id="audit-data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action Identifier</th>
                <th>Performed By</th>
                <th>Target Scope / Entity</th>
                <th>Event Metadata & Parameters</th>
              </tr>
            </thead>
            <tbody id="audit-table-body">
              ${renderAuditRows(logs)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderAuditRows(logs) {
  if (logs.length === 0) {
    return `<tr><td colspan="5" style="text-align: center; padding: 24px;">No audit events recorded yet.</td></tr>`;
  }

  return logs.map(l => `
    <tr>
      <td style="font-family: var(--font-mono); font-size: 11.5px; color: var(--text-muted); white-space: nowrap;">
        ${l.timestamp}
      </td>
      <td>
        <span class="badge badge-${l.action.includes('ENDED') || l.action.includes('APPROVED') ? 'present' : l.action.includes('STARTED') || l.action.includes('CREATED') ? 'lavender' : 'neutral'}">
          ${l.action}
        </span>
      </td>
      <td><strong>${l.user}</strong></td>
      <td>${l.entity || '—'}</td>
      <td style="font-family: var(--font-mono); font-size: 11.5px; color: var(--text-secondary); max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(l.details)}">
        ${escapeHtml(l.details)}
      </td>
    </tr>
  `).join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

window.auditLogsViewApp = {
  filterLogs(query) {
    const q = query.toLowerCase();
    const rows = document.querySelectorAll('#audit-table-body tr');
    rows.forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  },

  exportAuditCSV() {
    const logs = db.getAuditLogs();
    let csv = `Timestamp,Action,Performed By,Target Entity,Details\n`;
    for (const l of logs) {
      csv += `"${l.timestamp}","${l.action}","${l.user}","${l.entity || ''}","${(l.details || '').replace(/"/g, '""')}"\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AttendAI_Audit_Trail_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
};
