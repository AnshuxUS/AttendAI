// ============================================================================
// ATTENDAI USER MANAGEMENT VIEW (ADMINISTRATOR ONLY)
// Team: NEXT GEN | Project: AI ATTENDANCE SYSTEM
// User directory, Role assignment, Account deactivation, Password reset triggers
// ============================================================================

import { db } from './database.js';
import { auth, ROLES } from './auth.js';

export function renderUserManagementView() {
  const profiles = db.getProfiles();

  return `
    <div class="view-container">
      <div class="view-header-row">
        <div class="view-title-group">
          <h1>Institutional User Management</h1>
          <p>Provision accounts, assign institutional roles, deactivate credentials, and audit security access.</p>
        </div>
        <div class="view-actions-group">
          <button class="btn btn-primary" onclick="window.userManagementViewApp.openCreateUserModal()">
            <span>+ Create New User</span>
          </button>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title-box">
            <h2>Registered Institutional Users</h2>
            <p>${profiles.length} Active System Accounts</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <input type="text" id="user-search-input" placeholder="Search by name, ID, or email..." class="form-input" style="width: 240px;" oninput="window.userManagementViewApp.filterUsers()" />
            <select id="user-filter-role" class="form-select" style="width: 160px;" onchange="window.userManagementViewApp.filterUsers()">
              <option value="ALL">All Roles</option>
              <option value="ADMINISTRATOR">Administrators</option>
              <option value="TEACHER">Teachers</option>
              <option value="STUDENT">Students</option>
              <option value="DEVELOPER">Developers</option>
            </select>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table" id="users-data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>User ID</th>
                <th>Assigned Role</th>
                <th>Department</th>
                <th>Phone Contact</th>
                <th>Account Status</th>
                <th style="text-align: right;">Administrative Action</th>
              </tr>
            </thead>
            <tbody id="users-table-body">
              ${renderUserRows(profiles)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderUserRows(profiles) {
  if (profiles.length === 0) {
    return `<tr><td colspan="7" style="text-align: center; padding: 24px;">No users found.</td></tr>`;
  }

  return profiles.map(u => `
    <tr>
      <td>
        <div class="table-user-cell">
          <img src="${u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}" class="table-user-avatar" alt="${u.fullName}" />
          <div class="table-user-meta">
            <span class="table-user-name">${u.fullName}</span>
            <span class="table-user-sub">${u.email}</span>
          </div>
        </div>
      </td>
      <td><strong>${u.userCode}</strong></td>
      <td>
        <span class="badge badge-${u.role === 'ADMINISTRATOR' ? 'late' : u.role === 'TEACHER' ? 'present' : u.role === 'STUDENT' ? 'lavender' : 'neutral'}">
          ${u.role}
        </span>
      </td>
      <td>${u.department || 'Computer Applications'}</td>
      <td>${u.phone || '—'}</td>
      <td>
        <span class="badge badge-${u.isActive !== false ? 'present' : 'absent'}">
          ${u.isActive !== false ? 'Active' : 'Deactivated'}
        </span>
      </td>
      <td style="text-align: right; white-space: nowrap;">
        <button class="btn btn-secondary btn-sm" onclick="window.userManagementViewApp.resetPasswordPrompt('${u.email}')" title="Reset Password">
          Reset PWD
        </button>
        ${u.isActive !== false ? `
          <button class="btn btn-secondary btn-sm" style="color: var(--color-absent);" onclick="window.userManagementViewApp.toggleStatus('${u.id}', false)">
            Deactivate
          </button>
        ` : `
          <button class="btn btn-secondary btn-sm" style="color: var(--color-present);" onclick="window.userManagementViewApp.toggleStatus('${u.id}', true)">
            Reactivate
          </button>
        `}
      </td>
    </tr>
  `).join('');
}

window.userManagementViewApp = {
  filterUsers() {
    const q = document.getElementById('user-search-input')?.value.toLowerCase() || '';
    const role = document.getElementById('user-filter-role')?.value || 'ALL';

    const rows = document.querySelectorAll('#users-table-body tr');
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      const matchesQuery = text.includes(q);
      const matchesRole = (role === 'ALL') || text.includes(role.toLowerCase());
      row.style.display = (matchesQuery && matchesRole) ? '' : 'none';
    });
  },

  openCreateUserModal() {
    window.appRouter.openCreateUserModal();
  },

  resetPasswordPrompt(email) {
    try {
      auth.requestPasswordReset(email);
      window.appRouter.showToast(`Password recovery link dispatched to ${email}`);
    } catch (err) {
      alert(err.message);
    }
  },

  toggleStatus(userId, makeActive) {
    db.updateProfile(userId, { isActive: makeActive });
    window.appRouter.renderCurrentView();
    window.appRouter.showToast(`Account status updated to ${makeActive ? 'Active' : 'Deactivated'}`);
  }
};
