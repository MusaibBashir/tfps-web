-- Database schema for TFPS Club Website

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- In a real app, this would be hashed
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  hostel TEXT NOT NULL,
  year INTEGER NOT NULL,
  domain TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipment table
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  subtype TEXT,
  parent_id UUID REFERENCES equipment(id),
  ownership_type TEXT NOT NULL CHECK (ownership_type IN ('student', 'hall')),
  owner_id UUID REFERENCES users(id),
  status TEXT NOT NULL CHECK (status IN ('available', 'in_use', 'maintenance')),
  image_url TEXT,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('shoot', 'screening', 'other')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  is_approved BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipment requests table
CREATE TABLE equipment_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID NOT NULL REFERENCES equipment(id),
  event_id UUID NOT NULL REFERENCES events(id),
  requester_id UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'received', 'returned')),
  approved_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipment usage log
CREATE TABLE equipment_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID NOT NULL REFERENCES equipment(id),
  user_id UUID NOT NULL REFERENCES users(id),
  checkout_time TIMESTAMP WITH TIME ZONE NOT NULL,
  expected_return_time TIMESTAMP WITH TIME ZONE,
  return_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sample data: Users
INSERT INTO users (username, password, name, email, hostel, year, domain, is_admin) VALUES
('admin', 'password123', 'Admin User', 'admin@tfps.edu', 'Hall 3', 3, 'Photography', TRUE),
('jsmith', 'password123', 'John Smith', 'john@tfps.edu', 'Hall 2', 2, 'Cinematography', FALSE),
('ewilson', 'password123', 'Emma Wilson', 'emma@tfps.edu', 'Hall 1', 1, 'Photography', FALSE),
('achen', 'password123', 'Alex Chen', 'alex@tfps.edu', 'Hall 4', 4, 'Editing', FALSE),
('sjohnson', 'password123', 'Sarah Johnson', 'sarah@tfps.edu', 'Hall 3', 3, 'Cinematography', FALSE);

-- Sample data: Equipment
INSERT INTO equipment (name, type, subtype, ownership_type, owner_id, status, details) VALUES
('Canon EOS R5', 'camera', 'Mirrorless', 'hall', NULL, 'available', 'Full-frame mirrorless camera with 8K video capability'),
('Sony A7 III', 'camera', 'Mirrorless', 'student', (SELECT id FROM users WHERE username = 'ewilson'), 'available', 'Full-frame mirrorless camera with excellent low light performance'),
('Manfrotto Tripod', 'tripod', NULL, 'hall', NULL, 'available', 'Professional tripod with fluid head'),
('RØDE VideoMic Pro', 'audio', 'Shotgun Microphone', 'hall', NULL, 'available', 'Directional on-camera microphone'),
('Godox LED Light Panel', 'light', 'LED Panel', 'student', (SELECT id FROM users WHERE username = 'jsmith'), 'in_use', 'Bi-color LED panel with adjustable brightness');

-- Sample data: Equipment (Lenses)
INSERT INTO equipment (name, type, subtype, parent_id, ownership_type, owner_id, status, details) VALUES
('Canon RF 24-70mm f/2.8', 'lens', 'Zoom', (SELECT id FROM equipment WHERE name = 'Canon EOS R5'), 'hall', NULL, 'available', 'Standard zoom lens for Canon RF mount'),
('Canon RF 50mm f/1.2', 'lens', 'Prime', (SELECT id FROM equipment WHERE name = 'Canon EOS R5'), 'hall', NULL, 'available', 'Ultra-fast portrait lens for Canon RF mount');