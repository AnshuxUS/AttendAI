-- ============================================================================
-- ATTENDAI SUPABASE POSTGRESQL PRODUCTION SCHEMA
-- Team: NEXT GEN | Project: AI ATTENDANCE SYSTEM
-- ============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SYSTEM SETTINGS
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_name VARCHAR(255) NOT NULL DEFAULT 'Apex Institute of Technology & Management',
    academic_year VARCHAR(50) NOT NULL DEFAULT '2026-2027',
    attendance_threshold_percent NUMERIC(5,2) NOT NULL DEFAULT 75.00,
    late_threshold_minutes INTEGER NOT NULL DEFAULT 15,
    partial_attendance_threshold_percent NUMERIC(5,2) NOT NULL DEFAULT 50.00,
    default_session_duration_minutes INTEGER NOT NULL DEFAULT 60,
    presence_verification_interval_seconds INTEGER NOT NULL DEFAULT 15,
    missed_detection_tolerance_count INTEGER NOT NULL DEFAULT 3,
    camera_service_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    ai_service_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. USERS & PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    user_code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMINISTRATOR', 'TEACHER', 'STUDENT', 'DEVELOPER')),
    phone VARCHAR(50),
    department VARCHAR(100) DEFAULT 'Computer Applications',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CLASSES
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    course VARCHAR(100) NOT NULL DEFAULT 'BCA',
    year INTEGER NOT NULL DEFAULT 1,
    section VARCHAR(10) NOT NULL DEFAULT 'A',
    department VARCHAR(100) NOT NULL DEFAULT 'Computer Applications',
    academic_year VARCHAR(50) NOT NULL DEFAULT '2026-2027',
    teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    room_number VARCHAR(50) NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 60,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SUBJECTS
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    credits INTEGER NOT NULL DEFAULT 4,
    department VARCHAR(100) DEFAULT 'Computer Applications',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. STUDENTS (Profile extension)
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    roll_number VARCHAR(50) NOT NULL,
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    current_attendance_rate NUMERIC(5,2) DEFAULT 0.00,
    guardian_contact VARCHAR(50),
    enrolled_date DATE DEFAULT CURRENT_DATE
);

-- 6. TIMETABLE
CREATE TABLE IF NOT EXISTS timetable (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_of_week VARCHAR(20) NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    room VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. ATTENDANCE SESSIONS
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED')),
    total_enrolled INTEGER DEFAULT 0,
    total_present INTEGER DEFAULT 0,
    total_partial INTEGER DEFAULT 0,
    total_late INTEGER DEFAULT 0,
    total_absent INTEGER DEFAULT 0,
    average_attendance NUMERIC(5,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. ATTENDANCE RECORDS
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    first_seen_at TIMESTAMP WITH TIME ZONE,
    last_seen_at TIMESTAMP WITH TIME ZONE,
    present_duration_minutes INTEGER NOT NULL DEFAULT 0,
    attendance_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'ABSENT' CHECK (status IN ('PRESENT', 'PARTIAL', 'LATE', 'ABSENT', 'UNCERTAIN', 'MANUALLY_VERIFIED')),
    method VARCHAR(50) NOT NULL DEFAULT 'AI_DETECTION' CHECK (method IN ('AI_DETECTION', 'MANUAL', 'TEACHER_VERIFIED')),
    verification_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. ATTENDANCE PRESENCE EVENTS (Granular Duration Tracking)
CREATE TABLE IF NOT EXISTS attendance_presence_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attendance_record_id UUID NOT NULL REFERENCES attendance_records(id) ON DELETE CASCADE,
    detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    status VARCHAR(30) NOT NULL CHECK (status IN ('CONFIRMED', 'UNCERTAIN', 'MISSED', 'RESTORED')),
    confidence NUMERIC(4,3) DEFAULT 0.950,
    source VARCHAR(50) DEFAULT 'CAMERA_WEBRTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. ATTENDANCE CORRECTIONS
CREATE TABLE IF NOT EXISTS attendance_corrections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_id UUID NOT NULL REFERENCES attendance_records(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    current_duration INTEGER NOT NULL,
    requested_duration INTEGER NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'INFO' CHECK (type IN ('SESSION', 'RECORD', 'CORRECTION', 'ALERT', 'SYSTEM')),
    is_read BOOLEAN DEFAULT FALSE,
    related_record_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. FILE MANAGEMENT
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    file_path TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'GENERAL' CHECK (category IN ('REPORT', 'CSV', 'PDF', 'CLASS_DOC', 'STUDENT_DOC', 'PROJECT')),
    uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    access_role VARCHAR(50) DEFAULT 'TEACHER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(100) NOT NULL,
    performed_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    related_entity VARCHAR(100),
    entity_id UUID,
    details JSONB,
    ip_address VARCHAR(50) DEFAULT '127.0.0.1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. AI AGENTS & WORKFLOWS
CREATE TABLE IF NOT EXISTS ai_agents (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    avatar TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'READY' CHECK (status IN ('READY', 'WORKING', 'COMPLETED', 'WAITING', 'ERROR')),
    current_task TEXT,
    completed_tasks_count INTEGER DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    initiated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    current_stage VARCHAR(50) NOT NULL DEFAULT 'IDEA' CHECK (current_stage IN ('IDEA', 'REQUIREMENTS', 'ARCHITECTURE', 'CODE', 'TESTING', 'REVIEW', 'FINAL_BUILD')),
    status VARCHAR(30) DEFAULT 'IN_PROGRESS',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES FOR FAST QUERYING
CREATE INDEX IF NOT EXISTS idx_records_session ON attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_records_student ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_presence_record ON attendance_presence_events(attendance_record_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_timetable_class ON timetable(class_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_sessions_class ON attendance_sessions(class_id, started_at);
