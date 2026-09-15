// ============================================================================
// ATTENDAI SEED DATA
// Team: NEXT GEN | Project: AI ATTENDANCE SYSTEM
// High-fidelity production dataset for College BCA environment
// ============================================================================

export const SEED_DATA = {
  systemSettings: {
    institutionName: 'Apex Institute of Technology & Management',
    academicYear: '2026-2027',
    attendanceThreshold: 75.0,
    lateThresholdMinutes: 15,
    partialAttendanceThreshold: 50.0,
    defaultSessionDurationMinutes: 60,
    presenceVerificationIntervalSeconds: 15,
    missedDetectionToleranceCount: 3,
    cameraServiceStatus: 'ACTIVE',
    aiServiceStatus: 'ACTIVE',
    updatedAt: '2026-09-15T08:00:00Z'
  },

  profiles: [
    {
      id: 'adm-001',
      email: 'admin@college.edu',
      userCode: 'ADM-001',
      fullName: 'System Administrator',
      role: 'ADMINISTRATOR',
      phone: '+91 98110 22340',
      department: 'Dean of Academic Administration',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isActive: true,
      createdAt: '2026-01-10T09:00:00Z'
    },
    {
      id: 'tch-001',
      email: 'priya@college.edu',
      userCode: 'TCH-001',
      fullName: 'Dr. Priya Nair',
      role: 'TEACHER',
      phone: '+91 98201 55678',
      department: 'Computer Applications',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      isActive: true,
      createdAt: '2026-01-15T09:00:00Z'
    },
    {
      id: 'tch-002',
      email: 'rajesh@college.edu',
      userCode: 'TCH-002',
      fullName: 'Prof. Rajesh Kumar',
      role: 'TEACHER',
      phone: '+91 97112 44321',
      department: 'Computer Applications',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      isActive: true,
      createdAt: '2026-01-18T09:00:00Z'
    },
    {
      id: 'tch-003',
      email: 'sunita@college.edu',
      userCode: 'TCH-003',
      fullName: 'Dr. Sunita Rao',
      role: 'TEACHER',
      phone: '+91 98450 77890',
      department: 'Computer Applications',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      isActive: true,
      createdAt: '2026-01-20T09:00:00Z'
    },
    {
      id: 'stu-001',
      email: 'aarav@student.edu',
      userCode: 'STU-001',
      fullName: 'Aarav Sharma',
      role: 'STUDENT',
      rollNumber: '01',
      classId: 'cls-1',
      phone: '+91 99234 11223',
      department: 'Computer Applications',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      attendanceRate: 88.5,
      isActive: true,
      createdAt: '2026-07-01T09:00:00Z'
    },
    {
      id: 'stu-002',
      email: 'ananya@student.edu',
      userCode: 'STU-002',
      fullName: 'Ananya Verma',
      role: 'STUDENT',
      rollNumber: '02',
      classId: 'cls-1',
      phone: '+91 98334 22334',
      department: 'Computer Applications',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      attendanceRate: 94.2,
      isActive: true,
      createdAt: '2026-07-01T09:00:00Z'
    },
    {
      id: 'stu-003',
      email: 'rohan@student.edu',
      userCode: 'STU-003',
      fullName: 'Rohan Gupta',
      role: 'STUDENT',
      rollNumber: '03',
      classId: 'cls-1',
      phone: '+91 97445 33445',
      department: 'Computer Applications',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      attendanceRate: 71.0,
      isActive: true,
      createdAt: '2026-07-01T09:00:00Z'
    },
    {
      id: 'stu-004',
      email: 'priya.p@student.edu',
      userCode: 'STU-004',
      fullName: 'Priya Patel',
      role: 'STUDENT',
      rollNumber: '04',
      classId: 'cls-1',
      phone: '+91 96556 44556',
      department: 'Computer Applications',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      attendanceRate: 91.8,
      isActive: true,
      createdAt: '2026-07-01T09:00:00Z'
    },
    {
      id: 'stu-005',
      email: 'harish@student.edu',
      userCode: 'STU-005',
      fullName: 'Harish Verma',
      role: 'STUDENT',
      rollNumber: '05',
      classId: 'cls-1',
      phone: '+91 95667 55667',
      department: 'Computer Applications',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      attendanceRate: 58.0, // Low attendance flag
      isActive: true,
      createdAt: '2026-07-01T09:00:00Z'
    },
    {
      id: 'stu-006',
      email: 'sneha@student.edu',
      userCode: 'STU-006',
      fullName: 'Sneha Reddy',
      role: 'STUDENT',
      rollNumber: '06',
      classId: 'cls-1',
      phone: '+91 94778 66778',
      department: 'Computer Applications',
      avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
      attendanceRate: 83.4,
      isActive: true,
      createdAt: '2026-07-01T09:00:00Z'
    },
    {
      id: 'stu-007',
      email: 'vikram@student.edu',
      userCode: 'STU-007',
      fullName: 'Vikram Malhotra',
      role: 'STUDENT',
      rollNumber: '07',
      classId: 'cls-1',
      phone: '+91 93889 77889',
      department: 'Computer Applications',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      attendanceRate: 77.2,
      isActive: true,
      createdAt: '2026-07-01T09:00:00Z'
    },
    {
      id: 'stu-008',
      email: 'neha@student.edu',
      userCode: 'STU-008',
      fullName: 'Neha Joshi',
      role: 'STUDENT',
      rollNumber: '08',
      classId: 'cls-1',
      phone: '+91 92990 88990',
      department: 'Computer Applications',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      attendanceRate: 95.0,
      isActive: true,
      createdAt: '2026-07-01T09:00:00Z'
    },
    {
      id: 'stu-009',
      email: 'aditya@student.edu',
      userCode: 'STU-009',
      fullName: 'Aditya Singh',
      role: 'STUDENT',
      rollNumber: '09',
      classId: 'cls-1',
      phone: '+91 91001 99001',
      department: 'Computer Applications',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      attendanceRate: 64.5, // Low attendance flag
      isActive: true,
      createdAt: '2026-07-01T09:00:00Z'
    },
    {
      id: 'stu-010',
      email: 'kavya@student.edu',
      userCode: 'STU-010',
      fullName: 'Kavya Nair',
      role: 'STUDENT',
      rollNumber: '10',
      classId: 'cls-1',
      phone: '+91 90112 00112',
      department: 'Computer Applications',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      attendanceRate: 90.0,
      isActive: true,
      createdAt: '2026-07-01T09:00:00Z'
    },
    {
      id: 'dev-001',
      email: 'developer@college.edu',
      userCode: 'DEV-001',
      fullName: 'Alex Vance',
      role: 'DEVELOPER',
      phone: '+91 98888 12345',
      department: 'Core AI Systems Team',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z'
    }
  ],

  classes: [
    {
      id: 'cls-1',
      classCode: 'BCA-1A',
      name: 'BCA 1A',
      course: 'Bachelor of Computer Applications',
      year: 1,
      section: 'A',
      department: 'Computer Applications',
      academicYear: '2026-2027',
      teacherId: 'tch-001',
      teacherName: 'Dr. Priya Nair',
      subjectId: 'sub-101',
      subjectName: 'Database Management Systems',
      roomNumber: 'Lab 201',
      capacity: 60,
      enrolledCount: 10,
      status: 'ACTIVE'
    },
    {
      id: 'cls-2',
      classCode: 'BCA-2B',
      name: 'BCA 2B',
      course: 'Bachelor of Computer Applications',
      year: 2,
      section: 'B',
      department: 'Computer Applications',
      academicYear: '2026-2027',
      teacherId: 'tch-002',
      teacherName: 'Prof. Rajesh Kumar',
      subjectId: 'sub-201',
      subjectName: 'Data Structures & Algorithms',
      roomNumber: 'Room 304',
      capacity: 60,
      enrolledCount: 45,
      status: 'ACTIVE'
    },
    {
      id: 'cls-3',
      classCode: 'BCA-3A',
      name: 'BCA 3A',
      course: 'Bachelor of Computer Applications',
      year: 3,
      section: 'A',
      department: 'Computer Applications',
      academicYear: '2026-2027',
      teacherId: 'tch-003',
      teacherName: 'Dr. Sunita Rao',
      subjectId: 'sub-301',
      subjectName: 'Cloud Computing Architecture',
      roomNumber: 'Lab 102',
      capacity: 55,
      enrolledCount: 42,
      status: 'ACTIVE'
    },
    {
      id: 'cls-4',
      classCode: 'BCA-3B',
      name: 'BCA 3B',
      course: 'Bachelor of Computer Applications',
      year: 3,
      section: 'B',
      department: 'Computer Applications',
      academicYear: '2026-2027',
      teacherId: 'tch-001',
      teacherName: 'Dr. Priya Nair',
      subjectId: 'sub-302',
      subjectName: 'Artificial Intelligence & ML',
      roomNumber: 'Lab 301',
      capacity: 50,
      enrolledCount: 38,
      status: 'ACTIVE'
    }
  ],

  subjects: [
    { id: 'sub-101', subjectCode: 'BCA-101', name: 'Database Management Systems', credits: 4 },
    { id: 'sub-201', subjectCode: 'BCA-201', name: 'Data Structures & Algorithms', credits: 4 },
    { id: 'sub-301', subjectCode: 'BCA-301', name: 'Cloud Computing Architecture', credits: 3 },
    { id: 'sub-302', subjectCode: 'BCA-302', name: 'Artificial Intelligence & ML', credits: 4 },
    { id: 'sub-202', subjectCode: 'BCA-202', name: 'Operating Systems & Linux', credits: 3 }
  ],

  timetable: [
    { id: 'tt-1', dayOfWeek: 'Monday', startTime: '09:00', endTime: '10:00', classId: 'cls-1', className: 'BCA 1A', subjectName: 'Database Management Systems', teacherName: 'Dr. Priya Nair', room: 'Lab 201' },
    { id: 'tt-2', dayOfWeek: 'Monday', startTime: '10:15', endTime: '11:15', classId: 'cls-2', className: 'BCA 2B', subjectName: 'Data Structures & Algorithms', teacherName: 'Prof. Rajesh Kumar', room: 'Room 304' },
    { id: 'tt-3', dayOfWeek: 'Monday', startTime: '11:30', endTime: '12:30', classId: 'cls-3', className: 'BCA 3A', subjectName: 'Cloud Computing Architecture', teacherName: 'Dr. Sunita Rao', room: 'Lab 102' },
    { id: 'tt-4', dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '10:00', classId: 'cls-4', className: 'BCA 3B', subjectName: 'Artificial Intelligence & ML', teacherName: 'Dr. Priya Nair', room: 'Lab 301' },
    { id: 'tt-5', dayOfWeek: 'Tuesday', startTime: '10:15', endTime: '11:15', classId: 'cls-1', className: 'BCA 1A', subjectName: 'Database Management Systems', teacherName: 'Dr. Priya Nair', room: 'Lab 201' },
    { id: 'tt-6', dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '10:00', classId: 'cls-2', className: 'BCA 2B', subjectName: 'Data Structures & Algorithms', teacherName: 'Prof. Rajesh Kumar', room: 'Room 304' },
    { id: 'tt-7', dayOfWeek: 'Wednesday', startTime: '11:30', endTime: '12:30', classId: 'cls-1', className: 'BCA 1A', subjectName: 'Database Management Systems', teacherName: 'Dr. Priya Nair', room: 'Lab 201' },
    { id: 'tt-8', dayOfWeek: 'Thursday', startTime: '09:00', endTime: '10:00', classId: 'cls-3', className: 'BCA 3A', subjectName: 'Cloud Computing Architecture', teacherName: 'Dr. Sunita Rao', room: 'Lab 102' },
    { id: 'tt-9', dayOfWeek: 'Friday', startTime: '09:00', endTime: '10:00', classId: 'cls-1', className: 'BCA 1A', subjectName: 'Database Management Systems', teacherName: 'Dr. Priya Nair', room: 'Lab 201' },
    { id: 'tt-10', dayOfWeek: 'Friday', startTime: '10:15', endTime: '11:15', classId: 'cls-4', className: 'BCA 3B', subjectName: 'Artificial Intelligence & ML', teacherName: 'Dr. Priya Nair', room: 'Lab 301' }
  ],

  pastSessions: [
    {
      id: 'sess-101',
      classId: 'cls-1',
      className: 'BCA 1A',
      subjectName: 'Database Management Systems',
      teacherName: 'Dr. Priya Nair',
      startedAt: '2026-09-15T09:00:00Z',
      endedAt: '2026-09-15T10:00:00Z',
      durationMinutes: 60,
      status: 'COMPLETED',
      totalEnrolled: 10,
      totalPresent: 7,
      totalPartial: 1,
      totalLate: 1,
      totalAbsent: 1,
      totalUncertain: 0,
      averageAttendance: 82.5,
      records: [
        { studentId: 'stu-001', studentName: 'Aarav Sharma', rollNumber: '01', firstSeen: '09:02 AM', lastSeen: '09:58 AM', durationMinutes: 56, percentage: 93.3, status: 'PRESENT', method: 'AI_DETECTION' },
        { studentId: 'stu-002', studentName: 'Ananya Verma', rollNumber: '02', firstSeen: '09:01 AM', lastSeen: '09:59 AM', durationMinutes: 58, percentage: 96.7, status: 'PRESENT', method: 'AI_DETECTION' },
        { studentId: 'stu-003', studentName: 'Rohan Gupta', rollNumber: '03', firstSeen: '09:18 AM', lastSeen: '09:58 AM', durationMinutes: 40, percentage: 66.7, status: 'LATE', method: 'AI_DETECTION' },
        { studentId: 'stu-004', studentName: 'Priya Patel', rollNumber: '04', firstSeen: '09:03 AM', lastSeen: '09:57 AM', durationMinutes: 54, percentage: 90.0, status: 'PRESENT', method: 'AI_DETECTION' },
        { studentId: 'stu-005', studentName: 'Harish Verma', rollNumber: '05', firstSeen: '09:04 AM', lastSeen: '09:31 AM', durationMinutes: 27, percentage: 45.0, status: 'PARTIAL', method: 'AI_DETECTION' },
        { studentId: 'stu-006', studentName: 'Sneha Reddy', rollNumber: '06', firstSeen: '09:02 AM', lastSeen: '09:52 AM', durationMinutes: 50, percentage: 83.3, status: 'PRESENT', method: 'AI_DETECTION' },
        { studentId: 'stu-007', studentName: 'Vikram Malhotra', rollNumber: '07', firstSeen: '09:05 AM', lastSeen: '09:55 AM', durationMinutes: 50, percentage: 83.3, status: 'PRESENT', method: 'AI_DETECTION' },
        { studentId: 'stu-008', studentName: 'Neha Joshi', rollNumber: '08', firstSeen: '09:01 AM', lastSeen: '09:59 AM', durationMinutes: 58, percentage: 96.7, status: 'PRESENT', method: 'AI_DETECTION' },
        { studentId: 'stu-009', studentName: 'Aditya Singh', rollNumber: '09', firstSeen: null, lastSeen: null, durationMinutes: 0, percentage: 0.0, status: 'ABSENT', method: 'AI_DETECTION' },
        { studentId: 'stu-010', studentName: 'Kavya Nair', rollNumber: '10', firstSeen: '09:03 AM', lastSeen: '09:56 AM', durationMinutes: 53, percentage: 88.3, status: 'PRESENT', method: 'AI_DETECTION' }
      ]
    }
  ],

  corrections: [
    {
      id: 'corr-001',
      studentId: 'stu-005',
      studentName: 'Harish Verma',
      rollNumber: '05',
      className: 'BCA 1A',
      subjectName: 'Database Management Systems',
      sessionDate: '2026-09-15',
      currentDuration: 27,
      requestedDuration: 55,
      reason: 'Camera occlusion caused by projector beam during ER diagram demonstration in Lab 201. Student was present throughout.',
      teacherName: 'Dr. Priya Nair',
      status: 'PENDING',
      submittedAt: '2026-09-15T10:15:00Z'
    },
    {
      id: 'corr-002',
      studentId: 'stu-003',
      studentName: 'Rohan Gupta',
      rollNumber: '03',
      className: 'BCA 1A',
      subjectName: 'Database Management Systems',
      sessionDate: '2026-09-12',
      currentDuration: 30,
      requestedDuration: 50,
      reason: 'Late due to NSS volunteer meeting with Dean permission letter provided.',
      teacherName: 'Dr. Priya Nair',
      status: 'APPROVED',
      submittedAt: '2026-09-12T11:00:00Z',
      reviewedBy: 'System Administrator'
    }
  ],

  notifications: [
    {
      id: 'notif-1',
      userId: 'tch-001',
      title: 'Attendance Session Completed',
      message: 'BCA 1A Database Management Systems session concluded. 82.5% average attendance recorded.',
      type: 'SESSION',
      isRead: false,
      timestamp: '2026-09-15T10:01:00Z'
    },
    {
      id: 'notif-2',
      userId: 'adm-001',
      title: 'Correction Request Pending',
      message: 'Dr. Priya Nair submitted an attendance correction for Harish Verma (BCA 1A).',
      type: 'CORRECTION',
      isRead: false,
      timestamp: '2026-09-15T10:16:00Z'
    },
    {
      id: 'notif-3',
      userId: 'stu-001',
      title: 'Attendance Confirmed',
      message: 'Your attendance for Database Management Systems was confirmed as Present (93.3%).',
      type: 'RECORD',
      isRead: true,
      timestamp: '2026-09-15T10:00:00Z'
    },
    {
      id: 'notif-4',
      userId: 'all',
      title: 'Monthly Analytics Report Available',
      message: 'Departmental BCA Attendance Audit Report for August 2026 has been compiled.',
      type: 'ALERT',
      isRead: true,
      timestamp: '2026-09-14T17:00:00Z'
    }
  ],

  files: [
    {
      id: 'file-01',
      fileName: 'BCA_1A_DBMS_Attendance_Sept2026.csv',
      fileType: 'CSV Document',
      fileSize: '42.8 KB',
      category: 'REPORT',
      uploadedBy: 'Dr. Priya Nair',
      uploadDate: '2026-09-15',
      relatedClass: 'BCA 1A',
      accessRole: 'TEACHER'
    },
    {
      id: 'file-02',
      fileName: 'Apex_Attendance_Policy_Handbook_2026.pdf',
      fileType: 'PDF Document',
      fileSize: '1.8 MB',
      category: 'PDF',
      uploadedBy: 'System Administrator',
      uploadDate: '2026-08-01',
      relatedClass: 'All Classes',
      accessRole: 'ALL'
    },
    {
      id: 'file-03',
      fileName: 'BCA_Curriculum_Syllabus_2026_27.pdf',
      fileType: 'PDF Document',
      fileSize: '3.4 MB',
      category: 'CLASS_DOC',
      uploadedBy: 'System Administrator',
      uploadDate: '2026-07-20',
      relatedClass: 'BCA Department',
      accessRole: 'STUDENT'
    },
    {
      id: 'file-04',
      fileName: 'Lab_201_AI_Camera_Biometric_Consent_Form.pdf',
      fileType: 'PDF Document',
      fileSize: '650 KB',
      category: 'STUDENT_DOC',
      uploadedBy: 'Dr. Priya Nair',
      uploadDate: '2026-07-25',
      relatedClass: 'BCA 1A',
      accessRole: 'STUDENT'
    }
  ],

  auditLogs: [
    {
      id: 'log-101',
      action: 'ATTENDANCE_SESSION_STARTED',
      user: 'Dr. Priya Nair (TCH-001)',
      entity: 'BCA 1A / DBMS',
      details: 'Started camera biometric verification session in Lab 201',
      timestamp: '2026-09-15 09:00:12'
    },
    {
      id: 'log-102',
      action: 'ATTENDANCE_SESSION_ENDED',
      user: 'Dr. Priya Nair (TCH-001)',
      entity: 'BCA 1A / DBMS',
      details: 'Session completed. 7 Present, 1 Late, 1 Partial, 1 Absent',
      timestamp: '2026-09-15 10:00:04'
    },
    {
      id: 'log-103',
      action: 'CORRECTION_REQUESTED',
      user: 'Dr. Priya Nair (TCH-001)',
      entity: 'Harish Verma (STU-005)',
      details: 'Requested presence adjustment from 27m to 55m with explanation',
      timestamp: '2026-09-15 10:15:22'
    },
    {
      id: 'log-104',
      action: 'REPORT_EXPORTED_CSV',
      user: 'Dr. Priya Nair (TCH-001)',
      entity: 'BCA 1A Attendance Record',
      details: 'Exported session attendance roster in CSV format',
      timestamp: '2026-09-15 10:18:45'
    }
  ],

  aiAgents: [
    {
      id: 'agent-coord',
      name: 'AI Coordinator',
      role: 'Master Orchestrator',
      avatar: '⚡',
      status: 'READY',
      currentTask: 'Supervising active attendance session telemetry',
      completedTasks: 48,
      lastActivity: '10s ago'
    },
    {
      id: 'agent-pm',
      name: 'Product Manager',
      role: 'Requirements & Scope',
      avatar: '📋',
      status: 'READY',
      currentTask: 'Validating college attendance SLA criteria',
      completedTasks: 34,
      lastActivity: '2m ago'
    },
    {
      id: 'agent-ux',
      name: 'UI/UX Designer',
      role: 'Design System & Accessibility',
      avatar: '🎨',
      status: 'READY',
      currentTask: 'Ensuring high-contrast dark/light theme consistency',
      completedTasks: 41,
      lastActivity: '5m ago'
    },
    {
      id: 'agent-arch',
      name: 'Software Architect',
      role: 'System Components & Pipeline',
      avatar: '📐',
      status: 'READY',
      currentTask: 'Analyzing WebRTC frame pipeline throughput',
      completedTasks: 29,
      lastActivity: '1m ago'
    },
    {
      id: 'agent-dev',
      name: 'Developer',
      role: 'Frontend & Business Logic',
      avatar: '💻',
      status: 'READY',
      currentTask: 'Calculating real-time confirmed presence duration',
      completedTasks: 62,
      lastActivity: 'Just now'
    },
    {
      id: 'agent-db',
      name: 'Database Engineer',
      role: 'PostgreSQL & Supabase RLS',
      avatar: '🗄️',
      status: 'READY',
      currentTask: 'Optimizing attendance_presence_events index scans',
      completedTasks: 38,
      lastActivity: '4m ago'
    },
    {
      id: 'agent-sec',
      name: 'Security Engineer',
      role: 'Auth & Data Privacy',
      avatar: '🛡️',
      status: 'READY',
      currentTask: 'Verifying zero biometric video storage compliance',
      completedTasks: 27,
      lastActivity: '8m ago'
    },
    {
      id: 'agent-qa',
      name: 'QA Tester',
      role: 'Edge Cases & Workflows',
      avatar: '🧪',
      status: 'READY',
      currentTask: 'Testing missed detection tolerance & uncertain transitions',
      completedTasks: 55,
      lastActivity: '3m ago'
    },
    {
      id: 'agent-cr',
      name: 'Code Reviewer',
      role: 'Performance & Standards',
      avatar: '🔍',
      status: 'READY',
      currentTask: 'Enforcing zero-fake buttons & live DB queries rule',
      completedTasks: 49,
      lastActivity: '30s ago'
    }
  ]
};
