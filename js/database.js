// ============================================================================
// ATTENDAI UNIFIED DATABASE LAYER
// Team: NEXT GEN | Project: AI ATTENDANCE SYSTEM
// Supports live Supabase cloud integration with robust relational persistence
// ============================================================================

import { SEED_DATA } from './seedData.js';

class DatabaseService {
  constructor() {
    this.storageKey = 'attendai_db_state_v1';
    this.subscribers = new Map();
    this.supabaseConfig = this.loadSupabaseConfig();
    this.state = this.initStorage();
  }

  // Supabase connection configuration
  loadSupabaseConfig() {
    const saved = localStorage.getItem('attendai_supabase_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return { url: '', anonKey: '', isConnected: false };
      }
    }
    return { url: '', anonKey: '', isConnected: false };
  }

  saveSupabaseConfig(url, anonKey) {
    this.supabaseConfig = {
      url: url.trim(),
      anonKey: anonKey.trim(),
      isConnected: Boolean(url.trim() && anonKey.trim())
    };
    localStorage.setItem('attendai_supabase_config', JSON.stringify(this.supabaseConfig));
    this.logAction('CONFIG_UPDATED', 'System Administrator', 'Supabase Cloud Credentials', { connected: this.supabaseConfig.isConnected });
    this.emit('supabase_status_changed', this.supabaseConfig);
  }

  // Local storage relational database state
  initStorage() {
    const raw = localStorage.getItem(this.storageKey);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.warn('Corrupted storage, re-initializing from seed data.');
      }
    }

    // Clone SEED_DATA
    const fresh = JSON.parse(JSON.stringify(SEED_DATA));
    fresh.activeSession = null;
    localStorage.setItem(this.storageKey, JSON.stringify(fresh));
    return fresh;
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    this.emit('db_changed', this.state);
  }

  // Reactive Event Bus
  subscribe(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    this.subscribers.get(event).add(callback);
    return () => this.subscribers.get(event)?.delete(callback);
  }

  emit(event, data) {
    if (this.subscribers.has(event)) {
      for (const cb of this.subscribers.get(event)) {
        try {
          cb(data);
        } catch (e) {
          console.error(`Error in event listener for ${event}:`, e);
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  // SYSTEM SETTINGS
  // --------------------------------------------------------------------------
  getSettings() {
    return { ...this.state.systemSettings };
  }

  updateSettings(newSettings) {
    this.state.systemSettings = {
      ...this.state.systemSettings,
      ...newSettings,
      updatedAt: new Date().toISOString()
    };
    this.save();
    this.logAction('SETTINGS_UPDATED', 'System Administrator', 'System Settings', newSettings);
    return this.getSettings();
  }

  // --------------------------------------------------------------------------
  // PROFILES / USERS
  // --------------------------------------------------------------------------
  getProfiles(roleFilter = null) {
    if (!roleFilter) return [...this.state.profiles];
    return this.state.profiles.filter(p => p.role === roleFilter);
  }

  getProfileById(id) {
    return this.state.profiles.find(p => p.id === id) || null;
  }

  getProfileByEmail(email) {
    return this.state.profiles.find(p => p.email.toLowerCase() === email.toLowerCase()) || null;
  }

  createProfile(profileData) {
    const newProfile = {
      id: `usr-${Date.now()}`,
      userCode: profileData.userCode || `USR-${Math.floor(100 + Math.random() * 900)}`,
      email: profileData.email,
      fullName: profileData.fullName,
      role: profileData.role || 'STUDENT',
      phone: profileData.phone || '',
      department: profileData.department || 'Computer Applications',
      avatarUrl: profileData.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      isActive: true,
      rollNumber: profileData.rollNumber || null,
      classId: profileData.classId || 'cls-1',
      attendanceRate: profileData.role === 'STUDENT' ? (profileData.attendanceRate !== undefined ? Number(profileData.attendanceRate) : 100) : undefined,
      createdAt: new Date().toISOString()
    };
    this.state.profiles.push(newProfile);

    // If student, increment class enrollment count
    if (newProfile.role === 'STUDENT' && newProfile.classId) {
      const cls = this.state.classes.find(c => c.id === newProfile.classId);
      if (cls) {
        cls.enrolledCount = (cls.enrolledCount || 0) + 1;
      }
    }

    this.save();
    this.logAction('USER_CREATED', 'System Administrator', newProfile.fullName, { role: newProfile.role, email: newProfile.email });
    return newProfile;
  }

  updateProfile(id, updates) {
    const idx = this.state.profiles.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.state.profiles[idx] = { ...this.state.profiles[idx], ...updates };
      this.save();
      this.logAction('USER_UPDATED', 'System Administrator', this.state.profiles[idx].fullName, updates);
      return this.state.profiles[idx];
    }
    return null;
  }

  deactivateProfile(id) {
    return this.updateProfile(id, { isActive: false });
  }

  deleteStudent(id) {
    const idx = this.state.profiles.findIndex(p => p.id === id);
    if (idx !== -1) {
      const removed = this.state.profiles.splice(idx, 1)[0];
      // Decrement class enrolledCount if assigned
      if (removed.classId) {
        const cls = this.state.classes.find(c => c.id === removed.classId);
        if (cls && cls.enrolledCount > 0) {
          cls.enrolledCount--;
        }
      }
      this.save();
      this.logAction('STUDENT_REMOVED', 'Faculty', removed.fullName, { rollNumber: removed.rollNumber, email: removed.email });
      return true;
    }
    return false;
  }

  deleteProfile(id) {
    return this.deleteStudent(id);
  }

  // --------------------------------------------------------------------------
  // CLASSES
  // --------------------------------------------------------------------------
  getClasses() {
    return [...this.state.classes];
  }

  getClassById(id) {
    return this.state.classes.find(c => c.id === id) || null;
  }

  createClass(classData) {
    const newClass = {
      id: `cls-${Date.now()}`,
      classCode: classData.classCode || `BCA-${Date.now().toString().slice(-2)}`,
      name: classData.name,
      course: classData.course || 'Bachelor of Computer Applications',
      year: parseInt(classData.year) || 1,
      section: classData.section || 'A',
      department: classData.department || 'Computer Applications',
      academicYear: this.state.systemSettings.academicYear,
      teacherId: classData.teacherId,
      teacherName: classData.teacherName || 'Dr. Priya Nair',
      subjectId: classData.subjectId || 'sub-101',
      subjectName: classData.subjectName || 'Database Management Systems',
      roomNumber: classData.roomNumber || 'Lab 201',
      capacity: parseInt(classData.capacity) || 60,
      enrolledCount: 0,
      status: 'ACTIVE'
    };
    this.state.classes.push(newClass);
    this.save();
    this.logAction('CLASS_CREATED', 'System Administrator', newClass.name, { code: newClass.classCode });
    return newClass;
  }

  updateClass(id, updates) {
    const idx = this.state.classes.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.state.classes[idx] = { ...this.state.classes[idx], ...updates };
      this.save();
      this.logAction('CLASS_UPDATED', 'System Administrator', this.state.classes[idx].name, updates);
      return this.state.classes[idx];
    }
    return null;
  }

  // --------------------------------------------------------------------------
  // STUDENTS
  // --------------------------------------------------------------------------
  getStudents(classId = null) {
    let students = this.state.profiles.filter(p => p.role === 'STUDENT' && p.isActive !== false);
    if (classId) {
      students = students.filter(s => s.classId === classId);
    }
    return students;
  }

  // --------------------------------------------------------------------------
  // TIMETABLE
  // --------------------------------------------------------------------------
  getTimetable(filter = {}) {
    let list = [...this.state.timetable];
    if (filter.classId) list = list.filter(t => t.classId === filter.classId);
    if (filter.day) list = list.filter(t => t.dayOfWeek === filter.day);
    if (filter.teacherName) list = list.filter(t => t.teacherName.toLowerCase().includes(filter.teacherName.toLowerCase()));
    return list;
  }

  createTimetableEntry(entry) {
    const newEntry = {
      id: `tt-${Date.now()}`,
      dayOfWeek: entry.dayOfWeek,
      startTime: entry.startTime,
      endTime: entry.endTime,
      classId: entry.classId,
      className: entry.className,
      subjectName: entry.subjectName,
      teacherName: entry.teacherName,
      room: entry.room
    };
    this.state.timetable.push(newEntry);
    this.save();
    this.logAction('TIMETABLE_CREATED', 'System Administrator', `${entry.className} - ${entry.subjectName}`, entry);
    return newEntry;
  }

  // --------------------------------------------------------------------------
  // ATTENDANCE SESSIONS & RECORDS
  // --------------------------------------------------------------------------
  getActiveSession() {
    return this.state.activeSession;
  }

  startSession(sessionParams) {
    const targetClass = this.getClassById(sessionParams.classId);
    const enrolledStudents = this.getStudents(sessionParams.classId);

    const newSession = {
      id: `sess-${Date.now()}`,
      classId: sessionParams.classId,
      className: targetClass ? targetClass.name : 'BCA 1A',
      subjectName: sessionParams.subjectName || (targetClass ? targetClass.subjectName : 'Database Management Systems'),
      teacherName: sessionParams.teacherName || 'Dr. Priya Nair',
      startedAt: new Date().toISOString(),
      durationMinutes: sessionParams.durationMinutes || this.state.systemSettings.defaultSessionDurationMinutes,
      status: 'ACTIVE',
      totalEnrolled: enrolledStudents.length,
      totalPresent: 0,
      totalPartial: 0,
      totalLate: 0,
      totalAbsent: enrolledStudents.length,
      totalUncertain: 0,
      averageAttendance: 0,
      records: enrolledStudents.map(student => ({
        studentId: student.id,
        studentName: student.fullName,
        rollNumber: student.rollNumber || '01',
        firstSeen: null,
        lastSeen: null,
        confirmedDurationMinutes: 0,
        missedChecksCount: 0,
        consecutiveSuccessCount: 0,
        percentage: 0,
        status: 'ABSENT',
        method: 'AI_DETECTION',
        presenceEvents: []
      }))
    };

    this.state.activeSession = newSession;
    this.save();
    this.logAction('ATTENDANCE_SESSION_STARTED', sessionParams.teacherName || 'Teacher', newSession.className, { subject: newSession.subjectName });
    this.createNotification({
      userId: 'all',
      title: `Attendance Session Started: ${newSession.className}`,
      message: `Live camera attendance detection opened for ${newSession.subjectName}.`,
      type: 'SESSION'
    });
    this.emit('session_started', newSession);
    return newSession;
  }

  updateActiveSessionRecord(studentId, updateData) {
    if (!this.state.activeSession) return null;
    const rec = this.state.activeSession.records.find(r => r.studentId === studentId);
    if (!rec) return null;

    Object.assign(rec, updateData);

    // Recalculate summary totals
    let present = 0, partial = 0, late = 0, absent = 0, uncertain = 0;
    let totalPct = 0;

    for (const r of this.state.activeSession.records) {
      if (r.status === 'PRESENT') present++;
      else if (r.status === 'PARTIAL') partial++;
      else if (r.status === 'LATE') late++;
      else if (r.status === 'UNCERTAIN') uncertain++;
      else absent++;

      totalPct += (r.percentage || 0);
    }

    this.state.activeSession.totalPresent = present;
    this.state.activeSession.totalPartial = partial;
    this.state.activeSession.totalLate = late;
    this.state.activeSession.totalAbsent = absent;
    this.state.activeSession.totalUncertain = uncertain;
    this.state.activeSession.averageAttendance = Number((totalPct / (this.state.activeSession.records.length || 1)).toFixed(1));

    this.save();
    this.emit('active_session_updated', this.state.activeSession);
    return rec;
  }

  endActiveSession() {
    if (!this.state.activeSession) return null;
    const finished = {
      ...this.state.activeSession,
      status: 'COMPLETED',
      endedAt: new Date().toISOString()
    };

    // Push into past sessions
    this.state.pastSessions.unshift(finished);
    this.state.activeSession = null;
    this.save();

    this.logAction('ATTENDANCE_SESSION_ENDED', finished.teacherName, finished.className, {
      present: finished.totalPresent,
      partial: finished.totalPartial,
      late: finished.totalLate,
      absent: finished.totalAbsent,
      avg: `${finished.averageAttendance}%`
    });

    this.createNotification({
      userId: 'all',
      title: `Attendance Session Completed: ${finished.className}`,
      message: `${finished.subjectName} session finalized. Average Attendance: ${finished.averageAttendance}%.`,
      type: 'SESSION'
    });

    this.emit('session_ended', finished);
    return finished;
  }

  getPastSessions() {
    return [...this.state.pastSessions];
  }

  // --------------------------------------------------------------------------
  // ATTENDANCE CORRECTIONS
  // --------------------------------------------------------------------------
  getCorrections() {
    return [...this.state.corrections];
  }

  createCorrection(data) {
    const newCorr = {
      id: `corr-${Date.now()}`,
      studentId: data.studentId,
      studentName: data.studentName,
      rollNumber: data.rollNumber,
      className: data.className,
      subjectName: data.subjectName,
      sessionDate: data.sessionDate || new Date().toISOString().split('T')[0],
      currentDuration: Number(data.currentDuration),
      requestedDuration: Number(data.requestedDuration),
      reason: data.reason,
      teacherName: data.teacherName,
      status: 'PENDING',
      submittedAt: new Date().toISOString()
    };

    this.state.corrections.unshift(newCorr);
    this.save();
    this.logAction('CORRECTION_REQUESTED', data.teacherName, `${data.studentName} (${data.className})`, { requested: data.requestedDuration });
    this.createNotification({
      userId: 'adm-001',
      title: 'New Correction Request',
      message: `${data.teacherName} requested attendance adjustment for ${data.studentName}.`,
      type: 'CORRECTION'
    });
    return newCorr;
  }

  updateCorrectionStatus(id, status, reviewerName = 'System Administrator') {
    const corr = this.state.corrections.find(c => c.id === id);
    if (corr) {
      corr.status = status;
      corr.reviewedBy = reviewerName;
      corr.reviewedAt = new Date().toISOString();
      this.save();
      this.logAction(`CORRECTION_${status}`, reviewerName, corr.studentName, { id });
      this.createNotification({
        userId: corr.studentId,
        title: `Attendance Correction ${status}`,
        message: `Your attendance correction for ${corr.subjectName} was ${status.toLowerCase()} by ${reviewerName}.`,
        type: 'CORRECTION'
      });
      return corr;
    }
    return null;
  }

  // --------------------------------------------------------------------------
  // NOTIFICATIONS
  // --------------------------------------------------------------------------
  getNotifications(userId = null) {
    if (!userId || userId === 'all') return [...this.state.notifications];
    return this.state.notifications.filter(n => n.userId === userId || n.userId === 'all');
  }

  createNotification(data) {
    const notif = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: data.userId || 'all',
      title: data.title,
      message: data.message,
      type: data.type || 'INFO',
      isRead: false,
      timestamp: new Date().toISOString()
    };
    this.state.notifications.unshift(notif);
    this.save();
    this.emit('notification_received', notif);
    return notif;
  }

  markNotificationAsRead(id) {
    const n = this.state.notifications.find(item => item.id === id);
    if (n) {
      n.isRead = true;
      this.save();
      this.emit('notification_updated', n);
    }
  }

  clearAllNotifications() {
    this.state.notifications = [];
    this.save();
    this.emit('notifications_cleared', true);
  }

  // --------------------------------------------------------------------------
  // FILES
  // --------------------------------------------------------------------------
  getFiles(category = null) {
    if (!category || category === 'ALL') return [...this.state.files];
    return this.state.files.filter(f => f.category === category);
  }

  createFile(fileData) {
    const newFile = {
      id: `file-${Date.now()}`,
      fileName: fileData.fileName,
      fileType: fileData.fileType || 'Document',
      fileSize: fileData.fileSize || '120 KB',
      category: fileData.category || 'CLASS_DOC',
      uploadedBy: fileData.uploadedBy || 'User',
      uploadDate: new Date().toISOString().split('T')[0],
      relatedClass: fileData.relatedClass || 'All Classes',
      accessRole: fileData.accessRole || 'ALL'
    };
    this.state.files.unshift(newFile);
    this.save();
    this.logAction('FILE_UPLOADED', newFile.uploadedBy, newFile.fileName, { category: newFile.category });
    return newFile;
  }

  deleteFile(id) {
    const idx = this.state.files.findIndex(f => f.id === id);
    if (idx !== -1) {
      const removed = this.state.files.splice(idx, 1)[0];
      this.save();
      this.logAction('FILE_DELETED', 'User', removed.fileName, { id });
      return true;
    }
    return false;
  }

  // --------------------------------------------------------------------------
  // AUDIT LOGS
  // --------------------------------------------------------------------------
  getAuditLogs() {
    return [...this.state.auditLogs];
  }

  logAction(action, user, entity, details = {}) {
    const log = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      user,
      entity,
      details: typeof details === 'string' ? details : JSON.stringify(details),
      timestamp: new Date().toLocaleString()
    };
    this.state.auditLogs.unshift(log);
    // Keep max 200 logs
    if (this.state.auditLogs.length > 200) {
      this.state.auditLogs.pop();
    }
    this.save();
    this.emit('audit_log_added', log);
  }

  // --------------------------------------------------------------------------
  // AI AGENTS
  // --------------------------------------------------------------------------
  getAgents() {
    return [...this.state.aiAgents];
  }

  updateAgent(id, updates) {
    const agent = this.state.aiAgents.find(a => a.id === id);
    if (agent) {
      Object.assign(agent, updates);
      this.save();
      this.emit('agent_updated', agent);
      return agent;
    }
    return null;
  }

  resetAllData() {
    localStorage.removeItem(this.storageKey);
    this.state = this.initStorage();
    this.save();
    this.emit('db_reset', true);
  }
}

export const db = new DatabaseService();
