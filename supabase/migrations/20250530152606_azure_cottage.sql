-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    hostel TEXT NOT NULL,
    year INTEGER NOT NULL,
    domain TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create equipment table
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    subtype TEXT,
    parent_id UUID REFERENCES equipment(id),
    ownership_type TEXT NOT NULL,
    owner_id UUID REFERENCES users(id),
    status TEXT NOT NULL,
    image_url TEXT,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT equipment_ownership_type_check CHECK (ownership_type IN ('student', 'hall')),
    CONSTRAINT equipment_status_check CHECK (status IN ('available', 'in_use', 'maintenance'))
);

-- Create events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    event_type TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    is_approved BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT events_event_type_check CHECK (event_type IN ('shoot', 'screening', 'other'))
);

-- Create equipment_requests table
CREATE TABLE equipment_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id),
    event_id UUID NOT NULL REFERENCES events(id),
    requester_id UUID NOT NULL REFERENCES users(id),
    status TEXT NOT NULL,
    approved_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT equipment_requests_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'received', 'returned'))
);

-- Create equipment_logs table
CREATE TABLE equipment_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id),
    user_id UUID NOT NULL REFERENCES users(id),
    checkout_time TIMESTAMPTZ NOT NULL,
    expected_return_time TIMESTAMPTZ,
    return_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert sample users
INSERT INTO users (username, password, name, email, hostel, year, domain, is_admin)
VALUES
    ('admin', 'admin123', 'Admin User', 'admin@tfps.org', 'Hall 5', 3, 'Photography', true),
    ('john', 'john123', 'John Smith', 'john@tfps.org', 'Hall 3', 2, 'Cinematography', false),
    ('emma', 'emma123', 'Emma Wilson', 'emma@tfps.org', 'Hall 2', 1, 'Photography', false);

-- Insert sample equipment
INSERT INTO equipment (name, type, subtype, ownership_type, status, details)
VALUES
    ('Canon EOS R5', 'camera', 'Mirrorless', 'hall', 'available', 'Full-frame mirrorless camera with 45MP sensor'),
    ('Sony A7 III', 'camera', 'Mirrorless', 'hall', 'available', '24MP full-frame mirrorless camera'),
    ('RF 24-70mm f/2.8L', 'lens', 'Zoom', 'hall', 'available', 'Standard zoom lens for Canon RF mount'),
    ('Manfrotto MT190X3', 'tripod', null, 'hall', 'available', 'Professional aluminum tripod'),
    ('Godox SL-60W', 'light', 'LED', 'hall', 'available', '60W daylight-balanced LED light'),
    ('Zoom H6', 'audio', 'Recorder', 'hall', 'available', '6-input portable recorder');

-- Set parent_id for lenses
UPDATE equipment 
SET parent_id = (SELECT id FROM equipment WHERE name = 'Canon EOS R5')
WHERE name = 'RF 24-70mm f/2.8L';