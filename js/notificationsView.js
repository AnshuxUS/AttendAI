// ============================================================================
// ATTENDAI NOTIFICATIONS CENTER
// Team: NEXT GEN | Project: AI ATTENDANCE SYSTEM
// Real-time Event Alerts, Unread Counters, Notification Category Filters
// ============================================================================

import { db } from './database.js';
import { auth } from './auth.js';

export function renderNotificationsView() {
  const currentUser = auth.getCurrentUser();
  const notifications = db.getNotifications(currentUser?.id);

  return `
    <div class="view-container">
      <div class="view-header-row">
        <div class="view-title-group">
          <h1>Notifications Center</h1>
          <p>Real-time audit updates, session alerts, attendance receipts, and correction decisions.</p>
        </div>
        <div class="view-actions-group">
          <button class="btn btn-secondary btn-sm" onclick="window.notificationsViewApp.clearAll()">
            Clear All
          </button>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title-box">
            <h2>Inbox</h2>
            <p>${notifications.filter(n => !n.isRead).length} Unread Notifications</p>
          </div>
          <div style="display: flex; gap: 8px;">
            <select id="notif-filter-type" class="form-select" style="width: 160px;" onchange="window.notificationsViewApp.filterType()">
              <option value="ALL">All Categories</option>
              <option value="SESSION">Session Events</option>
              <option value="CORRECTION">Corrections</option>
              <option value="RECORD">Records</option>
              <option value="SYSTEM">System Notices</option>
            </select>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;" id="notifications-list-container">
          ${renderNotificationItems(notifications)}
        </div>
      </div>
    </div>
  `;
}

function renderNotificationItems(notifications) {
  if (notifications.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">🔔</div>
        <h3>No Notifications</h3>
        <p>You have caught up with all session announcements and attendance updates.</p>
      </div>
    `;
  }

  return notifications.map(n => `
    <div class="card" style="padding: 16px 20px; border-left: 4px solid ${n.isRead ? 'var(--border-color)' : 'var(--color-lavender)'}; background: ${n.isRead ? 'var(--bg-surface)' : 'var(--bg-surface-subtle)'};" data-type="${n.type}">
      <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 14px;">
        <div style="display: flex; gap: 12px; align-items: flex-start;">
          <span class="badge badge-${n.type === 'SESSION' ? 'present' : n.type === 'CORRECTION' ? 'late' : 'lavender'}" style="margin-top: 2px;">
            ${n.type}
          </span>
          <div>
            <div style="font-weight: 700; font-size: 14px; color: var(--text-primary);">${n.title}</div>
            <p style="color: var(--text-secondary); font-size: 13px; margin-top: 4px;">${n.message}</p>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">${new Date(n.timestamp).toLocaleString()}</div>
          </div>
        </div>
        ${!n.isRead ? `
          <button class="btn btn-secondary btn-sm" onclick="window.notificationsViewApp.markRead('${n.id}')">
            Mark Read
          </button>
        ` : ''}
      </div>
    </div>
  `).join('');
}

window.notificationsViewApp = {
  markRead(id) {
    db.markNotificationAsRead(id);
    window.appRouter.renderCurrentView();
    window.appRouter.updateNotificationBadge();
  },

  clearAll() {
    db.clearAllNotifications();
    window.appRouter.renderCurrentView();
    window.appRouter.updateNotificationBadge();
  },

  filterType() {
    const selected = document.getElementById('notif-filter-type')?.value || 'ALL';
    const items = document.querySelectorAll('#notifications-list-container > .card');
    items.forEach(el => {
      const type = el.getAttribute('data-type');
      el.style.display = (selected === 'ALL' || type === selected) ? '' : 'none';
    });
  }
};
