// ============================================================================
// ATTENDAI SETTINGS & SYSTEM CONFIGURATION
// Team: NEXT GEN | Project: AI ATTENDANCE SYSTEM
// Profile Settings, Dark/Light Themes, SLA Thresholds, Supabase Cloud Keys
// ============================================================================

import { db } from './database.js';
import { auth, ROLES } from './auth.js';

export function renderSettingsView() {
  const user = auth.getCurrentUser();
  const settings = db.getSettings();
  const isAdmin = auth.hasPermission(ROLES.ADMINISTRATOR);
  const currentTheme = localStorage.getItem('attendai_theme') || 'light';
  const supabaseConfig = db.loadSupabaseConfig();

  return `
    <div class="view-container">
      <div class="view-header-row">
        <div class="view-title-group">
          <h1>System & User Settings</h1>
          <p>Configure institutional SLA thresholds, theme preferences, biometric verification intervals, and cloud connections.</p>
        </div>
        <div class="view-actions-group">
          <button class="btn btn-primary" onclick="window.settingsViewApp.saveAllSettings()">
            <span>Save Preferences</span>
          </button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 20px;">
        
        <!-- User Profile Card -->
        <div class="card">
          <div class="card-header">
            <div class="card-title-box">
              <h2>Active Profile</h2>
              <p>Your institutional identification credentials</p>
            </div>
            <span class="badge badge-lavender">${user?.role}</span>
          </div>

          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 12px;">
            <img src="${user?.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}" style="width: 56px; height: 56px; border-radius: 50%; object-fit: cover;" />
            <div>
              <h3 style="font-size: 16px; font-weight: 700;">${user?.fullName}</h3>
              <div style="font-size: 12px; color: var(--text-muted);">${user?.userCode} • ${user?.email}</div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" id="setting-user-name" class="form-input" value="${user?.fullName || ''}" />
          </div>
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" class="form-input" value="${user?.email || ''}" disabled style="opacity: 0.7;" />
          </div>
          <div class="form-group">
            <label class="form-label">Phone Contact</label>
            <input type="text" id="setting-user-phone" class="form-input" value="${user?.phone || ''}" />
          </div>
        </div>

        <!-- Appearance & Theme Card -->
        <div class="card">
          <div class="card-header">
            <div class="card-title-box">
              <h2>Appearance & Design Theme</h2>
              <p>Select interface contrast and color mode</p>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <label class="form-label">Color Theme</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
              <button type="button" class="btn ${currentTheme === 'light' ? 'btn-primary' : 'btn-secondary'}" onclick="window.settingsViewApp.setTheme('light')">
                ☀️ Light
              </button>
              <button type="button" class="btn ${currentTheme === 'dark' ? 'btn-primary' : 'btn-secondary'}" onclick="window.settingsViewApp.setTheme('dark')">
                🌙 Dark
              </button>
              <button type="button" class="btn ${currentTheme === 'system' ? 'btn-primary' : 'btn-secondary'}" onclick="window.settingsViewApp.setTheme('system')">
                💻 System
              </button>
            </div>
            <p style="font-size: 11.5px; color: var(--text-muted); margin-top: 4px;">
              AttendAI preserves your preferred theme across all dashboards, camera HUD viewfinders, and reports.
            </p>
          </div>
        </div>

        <!-- Institutional Attendance Thresholds (Admin only editable) -->
        <div class="card">
          <div class="card-header">
            <div class="card-title-box">
              <h2>Attendance Thresholds & Rules</h2>
              <p>Configure institutional SLA criteria for eligibility</p>
            </div>
            ${isAdmin ? '<span class="badge badge-present">Administrator Access</span>' : '<span class="badge badge-neutral">Read Only</span>'}
          </div>

          <div class="form-group">
            <label class="form-label">Minimum Attendance Threshold (%)</label>
            <input type="number" id="setting-attendance-threshold" class="form-input" value="${settings.attendanceThreshold}" ${!isAdmin ? 'disabled' : ''} />
            <span style="font-size: 11px; color: var(--text-muted);">Standard university examination eligibility minimum is 75%.</span>
          </div>

          <div class="form-group">
            <label class="form-label">Late Arrival Grace Period (Minutes)</label>
            <input type="number" id="setting-late-threshold" class="form-input" value="${settings.lateThresholdMinutes}" ${!isAdmin ? 'disabled' : ''} />
            <span style="font-size: 11px; color: var(--text-muted);">Students first detected after this duration are classified as Late.</span>
          </div>

          <div class="form-group">
            <label class="form-label">Partial Attendance Threshold (%)</label>
            <input type="number" id="setting-partial-threshold" class="form-input" value="${settings.partialAttendanceThreshold}" ${!isAdmin ? 'disabled' : ''} />
          </div>
        </div>

        <!-- Biometric Camera & AI Settings -->
        <div class="card">
          <div class="card-header">
            <div class="card-title-box">
              <h2>Biometric Vision & Tolerances</h2>
              <p>Computer vision intervals and occlusion tolerance</p>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Presence Verification Check Interval (Seconds)</label>
            <input type="number" id="setting-verification-interval" class="form-input" value="${settings.presenceVerificationIntervalSeconds}" ${!isAdmin ? 'disabled' : ''} />
          </div>

          <div class="form-group">
            <label class="form-label">Missed Detection Tolerance Count</label>
            <input type="number" id="setting-tolerance-count" class="form-input" value="${settings.missedDetectionToleranceCount}" ${!isAdmin ? 'disabled' : ''} />
            <span style="font-size: 11px; color: var(--text-muted);">Number of consecutive missed checks before marking status as "Presence Uncertain".</span>
          </div>

          <div style="background: var(--bg-surface-subtle); padding: 12px; border-radius: var(--radius-md); font-size: 12px;">
            <div style="font-weight: 700; color: var(--color-present);">Privacy Compliance Active</div>
            <p style="color: var(--text-secondary); margin-top: 3px;">
              Raw webcam video streams are processed ephemerally in browser memory. No permanent video recordings are archived.
            </p>
          </div>
        </div>

        <!-- Supabase Cloud Connection -->
        <div class="card" style="grid-column: 1 / -1;">
          <div class="card-header">
            <div class="card-title-box">
              <h2>Supabase Cloud Database Connection</h2>
              <p>Connect your remote PostgreSQL Supabase database instance or run using local relational state</p>
            </div>
            <span class="badge ${supabaseConfig.isConnected ? 'badge-present' : 'badge-neutral'}">
              ${supabaseConfig.isConnected ? 'Cloud Connected' : 'Local Relational Database Active'}
            </span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div class="form-group">
              <label class="form-label">Supabase Project URL</label>
              <input type="text" id="setting-supabase-url" class="form-input" placeholder="https://your-project.supabase.co" value="${supabaseConfig.url || ''}" />
            </div>
            <div class="form-group">
              <label class="form-label">Supabase Anon Public Key</label>
              <input type="password" id="setting-supabase-key" class="form-input" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..." value="${supabaseConfig.anonKey || ''}" />
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
            <span style="font-size: 12px; color: var(--text-muted);">
              When provided, remote tables will sync with the PostgreSQL schema. When empty, AttendAI operates with zero external dependencies.
            </span>
            <button class="btn btn-secondary" onclick="window.settingsViewApp.testSupabaseConnection()">
              Save Cloud Config
            </button>
          </div>
        </div>

      </div>
    </div>
  `;
}

window.settingsViewApp = {
  setTheme(theme) {
    localStorage.setItem('attendai_theme', theme);
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
    window.appRouter.renderCurrentView();
    window.appRouter.showToast(`Switched theme to ${theme}`);
  },

  saveAllSettings() {
    const user = auth.getCurrentUser();
    const newName = document.getElementById('setting-user-name')?.value;
    const newPhone = document.getElementById('setting-user-phone')?.value;

    if (user && newName) {
      db.updateProfile(user.id, { fullName: newName, phone: newPhone });
      auth.saveSession({ ...user, fullName: newName, phone: newPhone });
    }

    if (auth.hasPermission(ROLES.ADMINISTRATOR)) {
      const attThresh = parseFloat(document.getElementById('setting-attendance-threshold')?.value) || 75.0;
      const lateThresh = parseInt(document.getElementById('setting-late-threshold')?.value) || 15;
      const partThresh = parseFloat(document.getElementById('setting-partial-threshold')?.value) || 50.0;
      const verInterval = parseInt(document.getElementById('setting-verification-interval')?.value) || 15;
      const tolCount = parseInt(document.getElementById('setting-tolerance-count')?.value) || 3;

      db.updateSettings({
        attendanceThreshold: attThresh,
        lateThresholdMinutes: lateThresh,
        partialAttendanceThreshold: partThresh,
        presenceVerificationIntervalSeconds: verInterval,
        missedDetectionToleranceCount: tolCount
      });
    }

    window.appRouter.renderCurrentView();
    window.appRouter.showToast('Settings saved successfully!');
  },

  testSupabaseConnection() {
    const url = document.getElementById('setting-supabase-url')?.value || '';
    const key = document.getElementById('setting-supabase-key')?.value || '';

    db.saveSupabaseConfig(url, key);
    window.appRouter.renderCurrentView();
    window.appRouter.showToast(url ? 'Supabase cloud configuration saved!' : 'Switched to local database mode.');
  }
};
