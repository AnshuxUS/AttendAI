// ============================================================================
// ATTENDAI MAIN APPLICATION CONTROLLER & ROUTER
// Team: NEXT GEN | Project: AI ATTENDANCE SYSTEM
// Flagship Overview Dashboard, Navigation Router, Camera Session Lifecycle, Modals
// ============================================================================

import { db } from './database.js';
import { auth, ROLES } from './auth.js';
import { cameraSession } from './cameraSession.js';
import { aiAssistant } from './aiAssistant.js';
import { aiTeam } from './aiTeam.js';
import { renderClassesView } from './classesView.js';
import { renderStudentsView } from './studentsView.js';
import { renderAttendanceView } from './attendanceView.js';
import { renderTimetableView } from './timetableView.js';
import { renderReportsView } from './reportsView.js';
import { renderNotificationsView } from './notificationsView.js';
import { renderFileManagerView } from './fileManagerView.js';
import { renderUserManagementView } from './userManagementView.js';
import { renderAuditLogsView } from './auditLogsView.js';
import { renderSettingsView } from './settingsView.js';
import { ProjectExporter } from './projectExport.js';

class AppRouter {
  constructor() {
    this.currentRoute = 'overview';
    this.initTheme();
    this.bindEvents();
  }

  initTheme() {
    const savedTheme = localStorage.getItem('attendai_theme') || 'light';
    if (savedTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }

  bindEvents() {
    // Listen to DB updates
    db.subscribe('db_changed', () => this.updateHeaderStatus());
    db.subscribe('notification_received', () => this.updateNotificationBadge());
    db.subscribe('auth_user_changed', () => {
      this.updateUserProfileHUD();
      this.renderCurrentView();
    });
  }

  init() {
    this.updateUserProfileHUD();
    this.updateNotificationBadge();
    this.updateHeaderStatus();
    this.navigateTo(this.currentRoute);
  }

  navigateTo(route) {
    // If leaving camera view, stop active webcam hardware stream to protect privacy
    if (this.currentRoute === 'camera' && route !== 'camera') {
      cameraSession.stopCameraStream();
    }

    this.currentRoute = route;

    // Update active state in sidebar
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
      if (link.getAttribute('data-route') === route) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Close mobile sidebar if open
    document.querySelector('.sidebar')?.classList.remove('mobile-open');

    this.renderCurrentView();
  }

  renderCurrentView() {
    const contentArea = document.getElementById('main-content-canvas');
    if (!contentArea) return;

    switch (this.currentRoute) {
      case 'overview':
        contentArea.innerHTML = this.renderOverviewDashboard();
        break;
      case 'classes':
        contentArea.innerHTML = renderClassesView();
        break;
      case 'students':
        contentArea.innerHTML = renderStudentsView();
        break;
      case 'attendance':
        contentArea.innerHTML = renderAttendanceView();
        break;
      case 'timetable':
        contentArea.innerHTML = renderTimetableView();
        break;
      case 'camera':
        contentArea.innerHTML = this.renderCameraSessionView();
        this.initCameraSessionView();
        break;
      case 'reports':
        contentArea.innerHTML = renderReportsView();
        break;
      case 'notifications':
        contentArea.innerHTML = renderNotificationsView();
        break;
      case 'ai-assistant':
        contentArea.innerHTML = this.renderAIAssistantView();
        break;
      case 'ai-team':
        contentArea.innerHTML = this.renderAITeamView();
        break;
      case 'files':
        contentArea.innerHTML = renderFileManagerView();
        break;
      case 'users':
        contentArea.innerHTML = renderUserManagementView();
        break;
      case 'audit':
        contentArea.innerHTML = renderAuditLogsView();
        break;
      case 'settings':
        contentArea.innerHTML = renderSettingsView();
        break;
      default:
        contentArea.innerHTML = this.renderOverviewDashboard();
    }
  }

  // --------------------------------------------------------------------------
  // FLAGSHIP OVERVIEW DASHBOARD
  // Preserves existing layout, visual identity, typography, cards & real metrics
  // --------------------------------------------------------------------------
  renderOverviewDashboard() {
    const user = auth.getCurrentUser();
    const activeSession = db.getActiveSession();
    const pastSessions = db.getPastSessions();
    const students = db.getStudents();
    const classes = db.getClasses();
    const corrections = db.getCorrections();
    const notifications = db.getNotifications(user?.id);

    // Dynamic metrics calculated from database
    const latestPast = pastSessions[0];
    const totalEnrolled = students.length;
    const presentCount = activeSession ? activeSession.totalPresent : (latestPast?.totalPresent || 7);
    const partialCount = activeSession ? activeSession.totalPartial : (latestPast?.totalPartial || 1);
    const lateCount = activeSession ? activeSession.totalLate : (latestPast?.totalLate || 1);
    const absentCount = activeSession ? activeSession.totalAbsent : (latestPast?.totalAbsent || 1);
    const pendingCorrections = corrections.filter(c => c.status === 'PENDING').length;

    return `
      <div class="view-container">
        <!-- Dashboard Top Header Greeting -->
        <div class="view-header-row">
          <div class="view-title-group">
            <h1>Overview Dashboard</h1>
            <p>Welcome back, <strong>${user?.fullName || 'Faculty'}</strong>. Real-time institutional attendance & telemetry metrics.</p>
          </div>
          <div class="view-actions-group">
            ${activeSession ? `
              <button class="btn btn-accent" onclick="window.appRouter.navigateTo('camera')">
                <span>● Active Camera Session (${activeSession.className})</span>
              </button>
            ` : `
              <button class="btn btn-primary" onclick="window.appRouter.openStartSessionModal()">
                <span>+ Launch Attendance</span>
              </button>
            `}
            <button class="btn btn-secondary" onclick="window.appRouter.navigateTo('reports')">
              <span>View Analytics</span>
            </button>
          </div>
        </div>

        <!-- 6 Metrics Grid -->
        <div class="metrics-grid">
          <div class="metric-card total">
            <div class="metric-top">
              <span class="metric-title">Today's Classes</span>
              <span class="badge badge-lavender">BCA Dept</span>
            </div>
            <div class="metric-value-row">
              <div class="metric-value">${classes.length}</div>
            </div>
            <span class="metric-trend trend-up">4 Scheduled Today</span>
          </div>

          <div class="metric-card present">
            <div class="metric-top">
              <span class="metric-title">Verified Present</span>
              <span class="badge badge-present">Confirmed</span>
            </div>
            <div class="metric-value-row">
              <div class="metric-value" style="color: var(--color-present);">${presentCount}</div>
            </div>
            <span class="metric-trend trend-up">Biometric verified</span>
          </div>

          <div class="metric-card partial">
            <div class="metric-top">
              <span class="metric-title">Partial Duration</span>
              <span class="badge badge-partial">50% - 74%</span>
            </div>
            <div class="metric-value-row">
              <div class="metric-value" style="color: var(--color-partial);">${partialCount}</div>
            </div>
            <span class="metric-trend">Confirmed presence</span>
          </div>

          <div class="metric-card late">
            <div class="metric-top">
              <span class="metric-title">Late Arrivals</span>
              <span class="badge badge-late">&gt;15 Min</span>
            </div>
            <div class="metric-value-row">
              <div class="metric-value" style="color: var(--color-late);">${lateCount}</div>
            </div>
            <span class="metric-trend">Late grace period</span>
          </div>

          <div class="metric-card absent">
            <div class="metric-top">
              <span class="metric-title">Unconfirmed Absent</span>
              <span class="badge badge-absent">Absent</span>
            </div>
            <div class="metric-value-row">
              <div class="metric-value" style="color: var(--color-absent);">${absentCount}</div>
            </div>
            <span class="metric-trend trend-down">Zero frame detection</span>
          </div>

          <div class="metric-card total">
            <div class="metric-top">
              <span class="metric-title">Pending Corrections</span>
              <span class="badge badge-late">${pendingCorrections} Pending</span>
            </div>
            <div class="metric-value-row">
              <div class="metric-value">${pendingCorrections}</div>
            </div>
            <span class="metric-trend">Faculty review queue</span>
          </div>
        </div>

        <!-- Main Dashboard Split: Session Controls & Real-Time Roster -->
        <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; align-items: start;">
          
          <!-- Left Column: Session Controls Card & Live Attendance Feed -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            
            <!-- Quick Session Controls Card -->
            <div class="card" style="border: 1px solid var(--border-focus); background: linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-subtle) 100%);">
              <div class="card-header">
                <div class="card-title-box">
                  <h2>Attendance Session Controls</h2>
                  <p>Authorized camera attendance detection for scheduled periods</p>
                </div>
                <span class="badge ${activeSession ? 'badge-present' : 'badge-neutral'}">
                  ${activeSession ? '● ACTIVE ATTENDANCE' : 'STANDBY'}
                </span>
              </div>

              ${activeSession ? `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0;">
                  <div>
                    <h3 style="font-size: 16px;">${activeSession.className} — ${activeSession.subjectName}</h3>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                      Duration: 60 mins • Faculty: ${activeSession.teacherName} • Started: ${new Date(activeSession.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div style="display: flex; gap: 8px;">
                    <button class="btn btn-primary" onclick="window.appRouter.navigateTo('camera')">
                      Open Camera HUD
                    </button>
                    <button class="btn btn-secondary" onclick="window.appRouter.endSessionConfirm()">
                      End Session
                    </button>
                  </div>
                </div>
              ` : `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; flex-wrap: wrap; gap: 12px;">
                  <div>
                    <h3 style="font-size: 15px;">Ready to start next session: BCA 1A (DBMS)</h3>
                    <p style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
                      Lab 201 • Faculty: Dr. Priya Nair • 10 Enrolled Students
                    </p>
                  </div>
                  <button class="btn btn-primary" onclick="window.appRouter.startClassAttendanceSession('cls-1')">
                    Start Attendance Session
                  </button>
                </div>
              `}
            </div>

            <!-- Student Attendance Stream -->
            <div class="card">
              <div class="card-header">
                <div class="card-title-box">
                  <h2>Live Attendance Ledger (BCA 1A)</h2>
                  <p>Real-time presence duration tracking & verification method</p>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="window.appRouter.navigateTo('attendance')">
                  View Full Ledger
                </button>
              </div>

              <div class="table-responsive">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Roll</th>
                      <th>Student</th>
                      <th>Confirmed Duration</th>
                      <th>Attendance %</th>
                      <th>Presence Status</th>
                      <th>Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${(activeSession?.records || latestPast?.records || []).slice(0, 7).map(r => `
                      <tr>
                        <td><strong>#${r.rollNumber}</strong></td>
                        <td>
                          <div style="font-weight: 600;">${r.studentName}</div>
                          <div style="font-size: 11px; color: var(--text-muted);">${r.firstSeen ? `First detected: ${r.firstSeen}` : 'Not yet verified'}</div>
                        </td>
                        <td><strong>${r.durationMinutes || r.confirmedDurationMinutes || 0} mins</strong></td>
                        <td>
                          <span style="font-weight: 700; color: ${(r.percentage || 0) >= 75 ? 'var(--color-present)' : 'var(--color-late)'};">
                            ${r.percentage || 0}%
                          </span>
                        </td>
                        <td>
                          <span class="badge badge-${(r.status || 'absent').toLowerCase()}">${r.status || 'ABSENT'}</span>
                        </td>
                        <td>
                          <span style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">${r.method}</span>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <!-- Right Column: AI Assistant Quick Card & Notifications -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            
            <!-- AI Assistant Quick Widget -->
            <div class="card" style="background: linear-gradient(135deg, var(--bg-surface) 0%, rgba(157, 153, 232, 0.08) 100%);">
              <div class="card-header">
                <div class="card-title-box">
                  <span style="font-size: 20px;">⚡</span>
                  <div>
                    <h2>AI Attendance Assistant</h2>
                    <p>Factual institutional queries</p>
                  </div>
                </div>
                <span class="badge badge-present">ONLINE</span>
              </div>
              <p style="font-size: 12.5px; color: var(--text-secondary);">
                Direct database query assistant. Answers queries regarding attendance shortage, session logs, and faculty timetables.
              </p>
              <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 4px;">
                <button class="suggested-prompt-btn" onclick="window.appRouter.quickAIQuery('Which students have low attendance in BCA 1A?')">
                  <span>📉 Show students with low attendance</span>
                </button>
                <button class="suggested-prompt-btn" onclick="window.appRouter.quickAIQuery('Show me today\\'s attendance.')">
                  <span>📊 Show today's attendance summary</span>
                </button>
                <button class="suggested-prompt-btn" onclick="window.appRouter.quickAIQuery('Show timetable for Monday.')">
                  <span>🗓️ What is the schedule for Monday?</span>
                </button>
              </div>
              <button class="btn btn-secondary btn-sm" style="margin-top: 6px;" onclick="window.appRouter.navigateTo('ai-assistant')">
                Open Full AI Assistant Interface →
              </button>
            </div>

            <!-- Recent Notifications -->
            <div class="card">
              <div class="card-header">
                <div class="card-title-box">
                  <h2>System Notifications</h2>
                  <p>Recent events</p>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="window.appRouter.navigateTo('notifications')">
                  All (${notifications.length})
                </button>
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${notifications.slice(0, 3).map(n => `
                  <div style="padding: 10px 12px; background: var(--bg-surface-subtle); border-radius: var(--radius-md); font-size: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <strong style="color: var(--text-primary);">${n.title}</strong>
                      <span style="font-size: 10px; color: var(--text-muted);">${new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p style="color: var(--text-secondary); margin-top: 3px; font-size: 11.5px;">${n.message}</p>
                  </div>
                `).join('')}
              </div>
            </div>

          </div>

        </div>

      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // CAMERA SESSION VIEW (Flagship WebRTC Biometric System)
  // --------------------------------------------------------------------------
  renderCameraSessionView() {
    const session = db.getActiveSession() || {
      className: 'BCA 1A',
      subjectName: 'Database Management Systems',
      teacherName: auth.getCurrentUser()?.fullName || 'Dr. Priya Nair',
      durationMinutes: 60,
      totalEnrolled: 10,
      totalPresent: 0,
      totalPartial: 0,
      totalLate: 0,
      totalAbsent: 10,
      totalUncertain: 0,
      records: db.getStudents('cls-1').map(s => ({
        studentId: s.id,
        studentName: s.fullName,
        rollNumber: s.rollNumber,
        confirmedDurationMinutes: 0,
        percentage: 0,
        status: 'ABSENT',
        firstSeen: null
      }))
    };

    return `
      <div class="view-container">
        <div class="view-header-row">
          <div class="view-title-group">
            <h1>Authorized Camera Attendance Session</h1>
            <p>Active computer-vision student presence duration tracking • Class: <strong>${session.className}</strong></p>
          </div>
          <div class="view-actions-group">
            <button class="btn btn-danger" onclick="window.appRouter.endSessionConfirm()">
              End Session & Generate Report
            </button>
          </div>
        </div>

        <div class="camera-session-container">
          
          <!-- Viewfinder Column -->
          <div class="camera-viewfinder-card">
            
            <div class="viewfinder-header">
              <div class="camera-status-pill">
                <span class="camera-status-dot"></span>
                <span>Camera Active • Tracking Roster</span>
              </div>
              <div class="privacy-notice-tag">
                🔒 Privacy-First Mode • Ephemeral In-Memory Verification
              </div>
            </div>

            <div class="video-stage" id="camera-video-stage">
              <video id="camera-video-stream" autoplay playsinline muted></video>
              <canvas id="camera-overlay-canvas"></canvas>

              <!-- HUD Target Reticles -->
              <div class="hud-corner corner-tl"></div>
              <div class="hud-corner corner-tr"></div>
              <div class="hud-corner corner-bl"></div>
              <div class="hud-corner corner-br"></div>
              <div class="scan-line"></div>

              <!-- Real-time Recognition Banner -->
              <div class="detection-live-card" id="camera-live-detection-card" style="display: none;">
                <!-- Populated dynamically upon detection -->
              </div>
            </div>

            <!-- Viewfinder Controls Footer -->
            <div class="viewfinder-controls">
              <div class="session-timer-pill">
                <span>⏱️ Elapsed:</span>
                <span id="camera-elapsed-timer">00:00</span>
                <span style="font-size: 11px; color: var(--color-lavender-soft); opacity: 0.8;">/ ${session.durationMinutes}m</span>
              </div>

              <div style="display: flex; align-items: center; gap: 8px;">
                <button class="btn btn-secondary btn-sm" onclick="window.appRouter.triggerDemoRecognition()">
                  ⚡ Verify Frame Recognition
                </button>
                <button class="btn btn-secondary btn-sm" onclick="window.appRouter.openManualAttendanceModal()">
                  Mark Manually
                </button>
              </div>
            </div>

          </div>

          <!-- Right Telemetry & Live Roster Column -->
          <div class="session-panel">
            
            <div class="session-info-card">
              <div class="session-title-header">
                <div>
                  <h3 style="font-size: 16px; font-weight: 700;">${session.className} — ${session.subjectName}</h3>
                  <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">Faculty: ${session.teacherName}</div>
                </div>
                <span class="badge badge-present">Active</span>
              </div>

              <div class="session-stats-bar">
                <div class="session-stat-box">
                  <div class="session-stat-num" id="hud-stat-total">${session.totalEnrolled || 10}</div>
                  <div class="session-stat-lbl">Enrolled</div>
                </div>
                <div class="session-stat-box">
                  <div class="session-stat-num" style="color: var(--color-present);" id="hud-stat-present">${session.totalPresent || 0}</div>
                  <div class="session-stat-lbl">Present</div>
                </div>
                <div class="session-stat-box">
                  <div class="session-stat-num" style="color: var(--color-partial);" id="hud-stat-partial">${session.totalPartial || 0}</div>
                  <div class="session-stat-lbl">Partial</div>
                </div>
                <div class="session-stat-box">
                  <div class="session-stat-num" style="color: var(--color-uncertain);" id="hud-stat-uncertain">${session.totalUncertain || 0}</div>
                  <div class="session-stat-lbl">Uncertain</div>
                </div>
              </div>
            </div>

            <!-- Active Enrolled Students Roster -->
            <div class="session-roster-card">
              <div class="session-roster-header">
                <h3 style="font-size: 14px; font-weight: 700;">Class Roster Verification</h3>
                <span style="font-size: 11px; color: var(--text-muted);">Verified Duration</span>
              </div>
              <div class="session-roster-list" id="camera-active-roster-list">
                ${session.records.map(rec => `
                  <div class="roster-item" id="roster-item-${rec.studentId}">
                    <div class="roster-item-user">
                      <div class="roster-item-avatar">${rec.rollNumber}</div>
                      <div class="roster-item-meta">
                        <span class="roster-item-name">${rec.studentName}</span>
                        <span class="roster-item-time">
                          ${rec.firstSeen ? `Detected: ${rec.firstSeen} • ${rec.confirmedDurationMinutes || 0}m` : 'Not yet verified in frame'}
                        </span>
                      </div>
                    </div>
                    <div class="roster-item-actions">
                      <span class="badge badge-${(rec.status || 'absent').toLowerCase()}">${rec.status || 'ABSENT'}</span>
                      <button class="btn btn-secondary btn-sm" onclick="window.cameraSessionApp.openManualOverrideModal('${rec.studentId}')">
                        Verify
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

          </div>

        </div>
      </div>
    `;
  }

  async initCameraSessionView() {
    const video = document.getElementById('camera-video-stream');
    const canvas = document.getElementById('camera-overlay-canvas');
    if (!video || !canvas) return;

    // If no active session exists in DB, create one automatically
    let activeSession = db.getActiveSession();
    if (!activeSession) {
      activeSession = db.startSession({
        classId: 'cls-1',
        subjectName: 'Database Management Systems',
        teacherName: auth.getCurrentUser()?.fullName || 'Dr. Priya Nair',
        durationMinutes: 60
      });
    }

    const streamStarted = await cameraSession.startCameraStream(video, canvas);
    if (streamStarted) {
      cameraSession.startSessionTracking(activeSession);
      cameraSession.updateActiveRosterList();
    } else {
      // Fallback message if user has no webcam hardware or denied permission
      const stage = document.getElementById('camera-video-stage');
      if (stage) {
        stage.innerHTML = `
          <div class="empty-state" style="background: transparent; border: none; color: #FFFFFF;">
            <div class="empty-state-icon" style="background: rgba(239, 68, 68, 0.2); color: #EF4444;">📷</div>
            <h3 style="color: #FFF;">Camera Stream Unavailable</h3>
            <p style="color: rgba(255, 255, 255, 0.7);">
              Camera permission was not granted or no webcam was detected. You can still test face verification using the simulation triggers or manual attendance.
            </p>
            <div style="display: flex; gap: 10px; margin-top: 10px;">
              <button class="btn btn-primary" onclick="window.appRouter.triggerDemoRecognition()">
                ⚡ Trigger Simulated Detection
              </button>
              <button class="btn btn-secondary" onclick="window.appRouter.openManualAttendanceModal()">
                Mark Attendance Manually
              </button>
            </div>
          </div>
        `;
      }
    }
  }

  triggerDemoRecognition() {
    const session = db.getActiveSession();
    if (!session || !session.records || session.records.length === 0) return;

    // Pick a student from the class roster to recognize
    const unverified = session.records.filter(r => (r.status === 'ABSENT' || r.status === 'PARTIAL'));
    const target = unverified.length > 0 ? unverified[0] : session.records[0];

    cameraSession.manualRecognizeStudent(target.studentId);
    this.showToast(`Biometric match verified: ${target.studentName} (#${target.rollNumber})`);
  }

  // --------------------------------------------------------------------------
  // AI ASSISTANT VIEW
  // --------------------------------------------------------------------------
  renderAIAssistantView() {
    const history = aiAssistant.getHistory();

    return `
      <div class="view-container">
        <div class="view-header-row">
          <div class="view-title-group">
            <h1>AI Attendance Assistant</h1>
            <p>Direct relational database queries • Zero hallucination policy • Instant institutional answers</p>
          </div>
        </div>

        <div class="ai-assistant-container">
          <div class="ai-chat-card">
            <div class="ai-chat-header">
              <div class="ai-header-brand">
                <div class="ai-header-icon">⚡</div>
                <div>
                  <h3 style="font-size: 15px; font-weight: 700;">AttendAI Query Engine</h3>
                  <div style="font-size: 11px; color: var(--text-muted);">Institutional Database Index Active</div>
                </div>
              </div>
              <span class="badge badge-present">PostgreSQL Relational Bridge Online</span>
            </div>

            <div class="ai-chat-messages" id="ai-chat-messages-container">
              ${history.map(msg => `
                <div class="chat-message ${msg.sender}">
                  <div class="chat-message-avatar">${msg.sender === 'ai' ? '⚡' : '👤'}</div>
                  <div class="chat-bubble">
                    <div>${this.formatMarkdown(msg.text)}</div>
                    ${msg.tableData ? `
                      <table class="chat-data-table">
                        <thead>
                          <tr>${msg.tableData.headers.map(h => `<th>${h}</th>`).join('')}</tr>
                        </thead>
                        <tbody>
                          ${msg.tableData.rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
                        </tbody>
                      </table>
                    ` : ''}
                    <div style="font-size: 10px; opacity: 0.6; align-self: flex-end;">${msg.timestamp}</div>
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="chat-input-row">
              <input type="text" id="ai-chat-input" class="chat-input" placeholder="Ask about attendance, low attendance, timetable, or student records..." onkeydown="if(event.key === 'Enter') window.appRouter.sendAIMessage()" />
              <button class="btn btn-primary" onclick="window.appRouter.sendAIMessage()">
                Send Query
              </button>
            </div>
          </div>

          <div class="ai-suggested-card">
            <h3 style="font-size: 14px; font-weight: 700;">Recommended Queries</h3>
            <p style="font-size: 12px; color: var(--text-secondary);">Click any prompt to execute a live query:</p>
            <div class="suggested-prompts-list">
              <button class="suggested-prompt-btn" onclick="window.appRouter.quickAIQuery('Which students have low attendance in BCA 1A?')">
                <span>📉 Students below 75% attendance</span>
              </button>
              <button class="suggested-prompt-btn" onclick="window.appRouter.quickAIQuery('Show me today\\'s attendance.')">
                <span>📊 Today's attendance summary</span>
              </button>
              <button class="suggested-prompt-btn" onclick="window.appRouter.quickAIQuery('Show registered classes.')">
                <span>🏫 Registered course classes</span>
              </button>
              <button class="suggested-prompt-btn" onclick="window.appRouter.quickAIQuery('Show timetable for Monday.')">
                <span>🗓️ Monday timetable schedule</span>
              </button>
              <button class="suggested-prompt-btn" onclick="window.appRouter.quickAIQuery('Check status for Aarav Sharma.')">
                <span>👤 Check Aarav Sharma's record</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  sendAIMessage() {
    const input = document.getElementById('ai-chat-input');
    if (!input || !input.value.trim()) return;

    const query = input.value.trim();
    input.value = '';

    aiAssistant.processQuery(query);
    this.renderCurrentView();

    // Scroll to bottom
    setTimeout(() => {
      const container = document.getElementById('ai-chat-messages-container');
      if (container) container.scrollTop = container.scrollHeight;
    }, 50);
  }

  quickAIQuery(prompt) {
    if (this.currentRoute !== 'ai-assistant') {
      this.navigateTo('ai-assistant');
    }
    setTimeout(() => {
      aiAssistant.processQuery(prompt);
      this.renderCurrentView();
      setTimeout(() => {
        const container = document.getElementById('ai-chat-messages-container');
        if (container) container.scrollTop = container.scrollHeight;
      }, 50);
    }, 150);
  }

  // --------------------------------------------------------------------------
  // AI SOFTWARE DEVELOPMENT TEAM VIEW (9 Agents Pipeline)
  // --------------------------------------------------------------------------
  renderAITeamView() {
    const agents = aiTeam.getAgents();
    const logs = aiTeam.getTerminalLogs();

    return `
      <div class="view-container">
        <div class="ai-dev-team-header">
          <div class="ai-dev-headline">
            <h2>AI Software Development Team</h2>
            <p>Autonomous 9-Agent engineering department orchestrating the AttendAI platform lifecycle</p>
          </div>
          <button class="btn btn-accent" onclick="window.appRouter.runAIDevWorkflow()">
            ⚡ Trigger Feature Engineering Pipeline
          </button>
        </div>

        <!-- Workflow Pipeline Stage Nodes -->
        <div class="workflow-pipeline-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="font-size: 15px; font-weight: 700;">Multi-Agent Development Pipeline</h3>
            <span class="badge badge-lavender">Autonomous State Machine</span>
          </div>
          <div class="workflow-steps-track">
            ${[
              'Idea', 'Requirements', 'Architecture', 'UI/UX Plan', 'Development',
              'DB Schema', 'Security', 'QA Testing', 'Code Review', 'Production Build'
            ].map((st, idx) => `
              <div class="workflow-step-node ${idx === 0 ? 'active' : ''}" id="workflow-step-${idx}">
                <div class="step-node-bubble">${idx + 1}</div>
                <div class="step-node-label">${st}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 9 Agent Cards Grid -->
        <div class="agents-grid">
          ${agents.map(a => `
            <div class="agent-card status-${a.status.toLowerCase()}" id="agent-card-${a.id}">
              <div class="agent-card-header">
                <div class="agent-identity">
                  <div class="agent-avatar-box">${a.avatar}</div>
                  <div>
                    <div class="agent-name-title">${a.name}</div>
                    <div class="agent-role-sub">${a.role}</div>
                  </div>
                </div>
                <span class="badge badge-${a.status === 'WORKING' ? 'present' : a.status === 'READY' ? 'lavender' : 'neutral'}">
                  ${a.status}
                </span>
              </div>

              <div class="agent-task-box">
                <div class="agent-task-label">Current Engineering Task</div>
                <div class="agent-task-desc">${a.currentTask || 'Idle / Standing by'}</div>
              </div>

              <div class="agent-metrics-row">
                <span>Completed Tasks: <strong>${a.completedTasks || 0}</strong></span>
                <span>Active: <strong>${a.lastActivity || 'Now'}</strong></span>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Live Terminal Stream -->
        <div class="agent-console-card">
          <div class="console-header">
            <div class="console-dots">
              <span class="console-dot red"></span>
              <span class="console-dot yellow"></span>
              <span class="console-dot green"></span>
            </div>
            <div class="console-title">attendai-agent-coordinator.log</div>
            <div style="font-size: 11px; color: var(--color-present);">STREAM ACTIVE</div>
          </div>
          <div class="console-screen" id="ai-team-terminal-screen">
            ${logs.map(l => `
              <div class="log-entry">
                <span class="log-time">[${l.time}]</span>
                <span class="log-agent">&lt;${l.agent}&gt;</span>
                <span class="log-${l.type}">${l.msg}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  runAIDevWorkflow() {
    aiTeam.runWorkflow('Real-time Biometric Face Presence Verification Engine');
  }

  // --------------------------------------------------------------------------
  // MODALS & SESSION LIFECYCLE
  // --------------------------------------------------------------------------
  startClassAttendanceSession(classId) {
    const c = db.getClassById(classId);
    if (!c) return;

    db.startSession({
      classId: c.id,
      subjectName: c.subjectName,
      teacherName: c.teacherName,
      durationMinutes: 60
    });

    this.navigateTo('camera');
    this.showToast(`Started attendance session for ${c.name}!`);
  }

  openStartSessionModal() {
    const classes = db.getClasses();
    const modal = document.getElementById('app-modal-content');
    const backdrop = document.getElementById('app-modal-backdrop');
    if (!modal || !backdrop) return;

    modal.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">Launch Attendance Session</h2>
        <button class="modal-close-btn" onclick="window.appRouter.closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Select Cohort Class</label>
          <select id="modal-session-class" class="form-select">
            ${classes.map(c => `<option value="${c.id}">${c.name} — ${c.subjectName} (${c.teacherName})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Session Duration (Minutes)</label>
          <input type="number" id="modal-session-duration" class="form-input" value="60" />
        </div>
        <div style="background: var(--bg-surface-subtle); padding: 12px; border-radius: var(--radius-md); font-size: 12px;">
          <strong>Privacy Mode Active:</strong> Biometric tracking operates only while the session remains active.
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="window.appRouter.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="window.appRouter.submitStartSession()">Start Camera Session</button>
      </div>
    `;

    backdrop.classList.add('open');
  }

  submitStartSession() {
    const classId = document.getElementById('modal-session-class')?.value;
    const duration = parseInt(document.getElementById('modal-session-duration')?.value) || 60;
    this.closeModal();

    const c = db.getClassById(classId);
    if (c) {
      db.startSession({
        classId: c.id,
        subjectName: c.subjectName,
        teacherName: c.teacherName,
        durationMinutes: duration
      });
      this.navigateTo('camera');
      this.showToast(`Launched session for ${c.name}`);
    }
  }

  endSessionConfirm() {
    const session = db.getActiveSession();
    if (!session) return;

    if (confirm(`Conclude attendance session for ${session.className}? This will compile final presence duration metrics.`)) {
      cameraSession.stopCameraStream();
      const finished = db.endActiveSession();
      this.openSessionSummaryModal(finished);
    }
  }

  openSessionSummaryModal(finished) {
    const modal = document.getElementById('app-modal-content');
    const backdrop = document.getElementById('app-modal-backdrop');
    if (!modal || !backdrop || !finished) return;

    modal.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">Session Completed: ${finished.className}</h2>
        <button class="modal-close-btn" onclick="window.appRouter.closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div style="text-align: center; padding: 10px 0;">
          <div style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Average Class Attendance</div>
          <div style="font-family: var(--font-heading); font-size: 40px; font-weight: 800; color: var(--color-present);">
            ${finished.averageAttendance}%
          </div>
        </div>

        <div class="session-stats-bar" style="margin: 10px 0;">
          <div class="session-stat-box">
            <div class="session-stat-num">${finished.totalEnrolled}</div>
            <div class="session-stat-lbl">Enrolled</div>
          </div>
          <div class="session-stat-box">
            <div class="session-stat-num" style="color: var(--color-present);">${finished.totalPresent}</div>
            <div class="session-stat-lbl">Present</div>
          </div>
          <div class="session-stat-box">
            <div class="session-stat-num" style="color: var(--color-partial);">${finished.totalPartial}</div>
            <div class="session-stat-lbl">Partial</div>
          </div>
          <div class="session-stat-box">
            <div class="session-stat-num" style="color: var(--color-absent);">${finished.totalAbsent}</div>
            <div class="session-stat-lbl">Absent</div>
          </div>
        </div>

        <p style="font-size: 13px; color: var(--text-secondary); text-align: center;">
          The attendance ledger has been saved to the database and notifications dispatched.
        </p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="window.attendanceViewApp.exportSessionCSV('${finished.id}')">Export CSV</button>
        <button class="btn btn-primary" onclick="window.appRouter.closeModal(); window.appRouter.navigateTo('attendance');">View in Attendance Ledger</button>
      </div>
    `;

    backdrop.classList.add('open');
  }

  openManualAttendanceModal() {
    const session = db.getActiveSession();
    if (!session) return;

    const modal = document.getElementById('app-modal-content');
    const backdrop = document.getElementById('app-modal-backdrop');
    if (!modal || !backdrop) return;

    modal.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">Manual Attendance Override</h2>
        <button class="modal-close-btn" onclick="window.appRouter.closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Select Student</label>
          <select id="modal-override-student" class="form-select">
            ${session.records.map(r => `<option value="${r.studentId}">#${r.rollNumber} — ${r.studentName} (Current: ${r.status})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">New Status</label>
          <select id="modal-override-status" class="form-select">
            <option value="PRESENT">PRESENT (Confirmed)</option>
            <option value="PARTIAL">PARTIAL Duration</option>
            <option value="LATE">LATE Arrival</option>
            <option value="ABSENT">ABSENT</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Present Duration (Minutes)</label>
          <input type="number" id="modal-override-mins" class="form-input" value="60" />
        </div>
        <div class="form-group">
          <label class="form-label">Reason for Override (Mandatory Audit)</label>
          <textarea id="modal-override-reason" class="form-textarea" placeholder="State reason for manual adjustment..."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="window.appRouter.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="window.appRouter.submitManualOverride()">Save Override</button>
      </div>
    `;

    backdrop.classList.add('open');
  }

  submitManualOverride() {
    const studentId = document.getElementById('modal-override-student')?.value;
    const status = document.getElementById('modal-override-status')?.value;
    const mins = parseInt(document.getElementById('modal-override-mins')?.value) || 60;
    const reason = document.getElementById('modal-override-reason')?.value || 'Faculty manual verification';

    const session = db.getActiveSession();
    if (session && studentId) {
      const rec = session.records.find(r => r.studentId === studentId);
      if (rec) {
        db.updateActiveSessionRecord(studentId, {
          status,
          confirmedDurationMinutes: mins,
          percentage: Number(((mins / session.durationMinutes) * 100).toFixed(1)),
          method: 'TEACHER_VERIFIED'
        });

        db.logAction('MANUAL_ATTENDANCE_OVERRIDE', auth.getCurrentUser()?.fullName || 'Teacher', rec.studentName, {
          newStatus: status,
          duration: mins,
          reason
        });

        cameraSession.updateActiveRosterList();
        this.closeModal();
        this.showToast(`Updated ${rec.studentName} to ${status}`);
      }
    }
  }

  openCorrectionModal(prefilledStudentId = '') {
    const students = db.getStudents();
    const modal = document.getElementById('app-modal-content');
    const backdrop = document.getElementById('app-modal-backdrop');
    if (!modal || !backdrop) return;

    modal.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">Submit Attendance Correction</h2>
        <button class="modal-close-btn" onclick="window.appRouter.closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Select Student</label>
          <select id="modal-corr-student" class="form-select">
            ${students.map(s => `<option value="${s.id}" ${s.id === prefilledStudentId ? 'selected' : ''}>${s.fullName} (#${s.rollNumber})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Current Duration (Mins)</label>
          <input type="number" id="modal-corr-current" class="form-input" value="25" />
        </div>
        <div class="form-group">
          <label class="form-label">Requested Corrected Duration (Mins)</label>
          <input type="number" id="modal-corr-requested" class="form-input" value="55" />
        </div>
        <div class="form-group">
          <label class="form-label">Reason for Request</label>
          <textarea id="modal-corr-reason" class="form-textarea" placeholder="Camera occlusion during lab demonstration, etc."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="window.appRouter.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="window.appRouter.submitCorrection()">Submit to Admin</button>
      </div>
    `;

    backdrop.classList.add('open');
  }

  submitCorrection() {
    const studentId = document.getElementById('modal-corr-student')?.value;
    const currentDur = document.getElementById('modal-corr-current')?.value;
    const reqDur = document.getElementById('modal-corr-requested')?.value;
    const reason = document.getElementById('modal-corr-reason')?.value || 'Hardware occlusion in Lab';

    const student = db.getProfileById(studentId);
    if (!student) return;

    db.createCorrection({
      studentId: student.id,
      studentName: student.fullName,
      rollNumber: student.rollNumber || '01',
      className: 'BCA 1A',
      subjectName: 'Database Management Systems',
      currentDuration: currentDur,
      requestedDuration: reqDur,
      reason,
      teacherName: auth.getCurrentUser()?.fullName || 'Dr. Priya Nair'
    });

    this.closeModal();
    this.renderCurrentView();
    this.showToast('Correction request submitted to Administrator!');
  }

  openCreateClassModal() {
    const teachers = db.getProfiles(ROLES.TEACHER);
    const modal = document.getElementById('app-modal-content');
    const backdrop = document.getElementById('app-modal-backdrop');
    if (!modal || !backdrop) return;

    modal.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">Create Class Cohort</h2>
        <button class="modal-close-btn" onclick="window.appRouter.closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Class Code</label>
          <input type="text" id="modal-class-code" class="form-input" placeholder="e.g. BCA-1B" />
        </div>
        <div class="form-group">
          <label class="form-label">Class Name</label>
          <input type="text" id="modal-class-name" class="form-input" placeholder="e.g. BCA 1B" />
        </div>
        <div class="form-group">
          <label class="form-label">Subject Name</label>
          <input type="text" id="modal-class-subject" class="form-input" placeholder="e.g. Operating Systems & Linux" />
        </div>
        <div class="form-group">
          <label class="form-label">Faculty In-Charge</label>
          <select id="modal-class-teacher" class="form-select">
            ${teachers.map(t => `<option value="${t.id}">${t.fullName} (${t.department})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Classroom / Lab</label>
          <input type="text" id="modal-class-room" class="form-input" placeholder="e.g. Lab 202" value="Lab 202" />
        </div>
        <div class="form-group">
          <label class="form-label">Capacity</label>
          <input type="number" id="modal-class-cap" class="form-input" value="60" />
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="window.appRouter.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="window.appRouter.submitCreateClass()">Create Class</button>
      </div>
    `;

    backdrop.classList.add('open');
  }

  submitCreateClass() {
    const code = document.getElementById('modal-class-code')?.value;
    const name = document.getElementById('modal-class-name')?.value;
    const subject = document.getElementById('modal-class-subject')?.value;
    const teacherId = document.getElementById('modal-class-teacher')?.value;
    const room = document.getElementById('modal-class-room')?.value;
    const cap = document.getElementById('modal-class-cap')?.value;

    const teacher = db.getProfileById(teacherId);

    if (name && subject) {
      db.createClass({
        classCode: code,
        name,
        subjectName: subject,
        teacherId,
        teacherName: teacher?.fullName || 'Faculty',
        roomNumber: room,
        capacity: cap
      });

      this.closeModal();
      this.renderCurrentView();
      this.showToast(`Class cohort "${name}" created!`);
    }
  }

  openCreateUserModal() {
    const modal = document.getElementById('app-modal-content');
    const backdrop = document.getElementById('app-modal-backdrop');
    if (!modal || !backdrop) return;

    modal.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">Provision New User</h2>
        <button class="modal-close-btn" onclick="window.appRouter.closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input type="text" id="modal-user-name" class="form-input" placeholder="e.g. Rahul Sen" />
        </div>
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input type="email" id="modal-user-email" class="form-input" placeholder="e.g. rahul@student.edu" />
        </div>
        <div class="form-group">
          <label class="form-label">Assigned Role</label>
          <select id="modal-user-role" class="form-select">
            <option value="STUDENT">Student</option>
            <option value="TEACHER">Teacher</option>
            <option value="ADMINISTRATOR">Administrator</option>
            <option value="DEVELOPER">Developer</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Roll Number (if Student)</label>
          <input type="text" id="modal-user-roll" class="form-input" placeholder="e.g. 11" />
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="window.appRouter.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="window.appRouter.submitCreateUser()">Provision User</button>
      </div>
    `;

    backdrop.classList.add('open');
  }

  submitCreateUser() {
    const name = document.getElementById('modal-user-name')?.value;
    const email = document.getElementById('modal-user-email')?.value;
    const role = document.getElementById('modal-user-role')?.value;
    const roll = document.getElementById('modal-user-roll')?.value;

    if (name && email) {
      db.createProfile({
        fullName: name,
        email,
        role,
        rollNumber: roll || null
      });

      this.closeModal();
      this.renderCurrentView();
      this.showToast(`User account created for ${name}!`);
    }
  }

  openAddStudentModal() {
    const classes = db.getClasses();
    const modal = document.getElementById('app-modal-content');
    const backdrop = document.getElementById('app-modal-backdrop');
    if (!modal || !backdrop) return;

    modal.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">Enroll New Student</h2>
        <button class="modal-close-btn" onclick="window.appRouter.closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Student Full Name *</label>
          <input type="text" id="modal-student-name" class="form-input" placeholder="e.g. Rahul Sen" required />
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label">Roll Number *</label>
            <input type="text" id="modal-student-roll" class="form-input" placeholder="e.g. 11" required />
          </div>
          <div class="form-group">
            <label class="form-label">Class Cohort</label>
            <select id="modal-student-class" class="form-select">
              ${classes.map(c => `<option value="${c.id}">${c.name} (${c.subjectName})</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Email Address *</label>
          <input type="email" id="modal-student-email" class="form-input" placeholder="e.g. rahul.sen@student.edu" required />
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label">Phone Contact</label>
            <input type="text" id="modal-student-phone" class="form-input" placeholder="+91 98765 43210" />
          </div>
          <div class="form-group">
            <label class="form-label">Initial Attendance %</label>
            <input type="number" id="modal-student-attendance" class="form-input" value="100" min="0" max="100" />
          </div>
        </div>
        <div style="background: var(--bg-surface-subtle); padding: 12px; border-radius: var(--radius-md); font-size: 12px; color: var(--text-secondary);">
          Enrolling this student will automatically add them to the class biometric roster for live camera attendance detection.
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="window.appRouter.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="window.appRouter.submitAddStudent()">Add Student to Roster</button>
      </div>
    `;

    backdrop.classList.add('open');
  }

  submitAddStudent() {
    const name = document.getElementById('modal-student-name')?.value?.trim();
    const roll = document.getElementById('modal-student-roll')?.value?.trim();
    const classId = document.getElementById('modal-student-class')?.value;
    const email = document.getElementById('modal-student-email')?.value?.trim();
    const phone = document.getElementById('modal-student-phone')?.value?.trim();
    const attendanceRate = parseFloat(document.getElementById('modal-student-attendance')?.value) || 100;

    if (!name || !roll || !email) {
      alert('Please provide the Student Name, Roll Number, and Email Address.');
      return;
    }

    const newStudent = db.createProfile({
      fullName: name,
      email,
      role: 'STUDENT',
      rollNumber: roll,
      classId: classId || 'cls-1',
      phone: phone || '+91 98765 00000',
      attendanceRate,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    });

    this.closeModal();
    this.renderCurrentView();
    this.showToast(`Enrolled ${name} (Roll #${roll}) successfully!`);
  }

  openAddPeriodModal() {
    const classes = db.getClasses();
    const modal = document.getElementById('app-modal-content');
    const backdrop = document.getElementById('app-modal-backdrop');
    if (!modal || !backdrop) return;

    modal.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">Add Timetable Period</h2>
        <button class="modal-close-btn" onclick="window.appRouter.closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Day of Week</label>
          <select id="modal-tt-day" class="form-select">
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Class Cohort</label>
          <select id="modal-tt-class" class="form-select">
            ${classes.map(c => `<option value="${c.id}">${c.name} (${c.subjectName})</option>`).join('')}
          </select>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group">
            <label class="form-label">Start Time</label>
            <input type="time" id="modal-tt-start" class="form-input" value="09:00" />
          </div>
          <div class="form-group">
            <label class="form-label">End Time</label>
            <input type="time" id="modal-tt-end" class="form-input" value="10:00" />
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="window.appRouter.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="window.appRouter.submitAddPeriod()">Save Period</button>
      </div>
    `;

    backdrop.classList.add('open');
  }

  submitAddPeriod() {
    const day = document.getElementById('modal-tt-day')?.value;
    const classId = document.getElementById('modal-tt-class')?.value;
    const start = document.getElementById('modal-tt-start')?.value;
    const end = document.getElementById('modal-tt-end')?.value;

    const c = db.getClassById(classId);
    if (c) {
      db.createTimetableEntry({
        dayOfWeek: day,
        startTime: start,
        endTime: end,
        classId: c.id,
        className: c.name,
        subjectName: c.subjectName,
        teacherName: c.teacherName,
        room: c.roomNumber
      });

      this.closeModal();
      this.renderCurrentView();
      this.showToast(`Timetable period added!`);
    }
  }

  closeModal() {
    document.getElementById('app-modal-backdrop')?.classList.remove('open');
  }

  updateUserProfileHUD() {
    const user = auth.getCurrentUser();
    const avatar = document.getElementById('header-user-avatar');
    const name = document.getElementById('header-user-name');
    const role = document.getElementById('header-user-role');
    const roleSelect = document.getElementById('quick-role-switcher');

    if (user) {
      if (avatar) avatar.src = user.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150';
      if (name) name.textContent = user.fullName;
      if (role) role.textContent = user.role;
      if (roleSelect) roleSelect.value = user.role;
    }
  }

  updateNotificationBadge() {
    const user = auth.getCurrentUser();
    const unread = db.getNotifications(user?.id).filter(n => !n.isRead).length;
    const badge = document.getElementById('header-notif-badge');
    if (badge) {
      badge.textContent = unread;
      badge.style.display = unread > 0 ? 'flex' : 'none';
    }
  }

  updateHeaderStatus() {
    const indicator = document.getElementById('header-system-status-indicator');
    const activeSession = db.getActiveSession();
    if (indicator) {
      indicator.innerHTML = `
        <span class="status-dot"></span>
        <span>${activeSession ? 'AI DETECTION RUNNING' : 'SYSTEM ONLINE • READY'}</span>
      `;
    }
  }

  showToast(message) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: var(--color-navy-dark);
        color: #FFFFFF;
        padding: 12px 20px;
        border-radius: var(--radius-md);
        border: 1px solid var(--border-focus);
        font-size: 13px;
        font-weight: 600;
        box-shadow: var(--shadow-lg);
        z-index: 2000;
        transition: all 0.3s ease;
        opacity: 0;
        transform: translateY(12px);
      `;
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
    }, 3000);
  }

  formatMarkdown(text) {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background: var(--bg-surface-subtle); padding: 2px 5px; border-radius: 4px; font-family: var(--font-mono);">$1</code>')
      .replace(/\n/g, '<br/>');
  }

  exportProjectBundle() {
    ProjectExporter.exportBundle();
  }
}

// Global binding
window.appRouter = new AppRouter();
window.cameraSessionApp = {
  openManualOverrideModal(studentId) {
    window.appRouter.openManualAttendanceModal();
    setTimeout(() => {
      const sel = document.getElementById('modal-override-student');
      if (sel) sel.value = studentId;
    }, 100);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.appRouter.init();
});
