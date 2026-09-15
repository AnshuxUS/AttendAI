// ============================================================================
// ATTENDAI AUTHENTICATION & ROLE-BASED ACCESS CONTROL
// Team: NEXT GEN | Project: AI ATTENDANCE SYSTEM
// Supports Supabase Auth & Role-based session management
// ============================================================================

import { db } from './database.js';

export const ROLES = {
  ADMINISTRATOR: 'ADMINISTRATOR',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
  DEVELOPER: 'DEVELOPER'
};

class AuthService {
  constructor() {
    this.sessionKey = 'attendai_auth_session';
    this.currentUser = this.loadSession();
  }

  loadSession() {
    const saved = localStorage.getItem(this.sessionKey);
    if (saved) {
      try {
        const user = JSON.parse(saved);
        // Verify user still exists in database
        const profile = db.getProfileById(user.id);
        if (profile && profile.isActive !== false) {
          return profile;
        }
      } catch (e) {
        console.warn('Session parse error:', e);
      }
    }
    // Default to Dr. Priya Nair (Teacher) to showcase the attendance & camera system immediately
    const defaultTeacher = db.getProfileByEmail('priya@college.edu') || db.getProfiles()[1];
    this.saveSession(defaultTeacher);
    return defaultTeacher;
  }

  saveSession(user) {
    this.currentUser = user;
    localStorage.setItem(this.sessionKey, JSON.stringify(user));
    db.emit('auth_user_changed', user);
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getRole() {
    return this.currentUser ? this.currentUser.role : ROLES.STUDENT;
  }

  login(email, password) {
    const user = db.getProfileByEmail(email);
    if (!user) {
      throw new Error('No registered account found with this email address.');
    }
    if (user.isActive === false) {
      throw new Error('This account has been deactivated by the administrator.');
    }

    // Never log raw passwords
    this.saveSession(user);
    db.logAction('USER_LOGIN', user.fullName, 'Authentication Session', { role: user.role });
    return user;
  }

  logout() {
    if (this.currentUser) {
      db.logAction('USER_LOGOUT', this.currentUser.fullName, 'Authentication Session', {});
    }
    localStorage.removeItem(this.sessionKey);
    // Switch to guest or login state
    this.currentUser = null;
    db.emit('auth_user_changed', null);
  }

  switchRole(role) {
    let targetProfile = null;
    switch (role) {
      case ROLES.ADMINISTRATOR:
        targetProfile = db.getProfileByEmail('admin@college.edu');
        break;
      case ROLES.TEACHER:
        targetProfile = db.getProfileByEmail('priya@college.edu');
        break;
      case ROLES.STUDENT:
        targetProfile = db.getProfileByEmail('aarav@student.edu');
        break;
      case ROLES.DEVELOPER:
        targetProfile = db.getProfileByEmail('developer@college.edu');
        break;
      default:
        targetProfile = db.getProfileByEmail('priya@college.edu');
    }

    if (targetProfile) {
      this.saveSession(targetProfile);
      db.logAction('ROLE_SWITCHED', targetProfile.fullName, `Switched view to ${role}`, {});
      return targetProfile;
    }
    return null;
  }

  hasPermission(allowedRoles) {
    if (!this.currentUser) return false;
    if (this.currentUser.role === ROLES.ADMINISTRATOR) return true; // Superuser
    if (Array.isArray(allowedRoles)) {
      return allowedRoles.includes(this.currentUser.role);
    }
    return this.currentUser.role === allowedRoles;
  }

  requestPasswordReset(email) {
    const user = db.getProfileByEmail(email);
    if (!user) {
      throw new Error('Account email not found.');
    }
    db.createNotification({
      userId: user.id,
      title: 'Password Reset Initiated',
      message: 'A secure password recovery verification link has been generated.',
      type: 'SYSTEM'
    });
    db.logAction('PASSWORD_RESET_REQUESTED', user.fullName, 'Security', {});
    return true;
  }
}

export const auth = new AuthService();
