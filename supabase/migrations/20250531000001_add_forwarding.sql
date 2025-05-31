-- Add forwarding capability to equipment requests
ALTER TABLE equipment_requests 
ADD COLUMN forwarded_to UUID REFERENCES users(id);

-- Add comment to clarify the field
COMMENT ON COLUMN equipment_requests.forwarded_to IS 'User to whom the request has been forwarded by an admin';
