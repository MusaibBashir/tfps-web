-- Make event_id optional in equipment_requests table
ALTER TABLE equipment_requests 
ALTER COLUMN event_id DROP NOT NULL;
