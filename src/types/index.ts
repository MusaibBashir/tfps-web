export interface User {
  id: string
  username: string
  name: string
  email: string
  hostel: string
  year: number
  domain: string
  is_admin: boolean
  created_at: string
}

export interface Equipment {
  id: string
  name: string
  type: string
  subtype: string | null
  parent_id: string | null
  ownership_type: "student" | "hall"
  owner_id: string | null
  status: "available" | "in_use" | "maintenance"
  image_url: string | null
  details: string | null
  created_at: string
}

export interface EquipmentLog {
  id: string
  equipment_id: string
  user_id: string
  checkout_time: string
  expected_return_time: string | null
  return_time: string | null
  created_at: string
  user?: User
}

export interface Event {
  id: string
  title: string
  description: string | null
  location: string | null
  event_type: "shoot" | "screening" | "other"
  start_time: string
  end_time: string
  created_by: string
  is_approved: boolean
  approved_by: string | null
  is_open: boolean
  max_participants: number | null
  created_at: string
  creator?: User
  approver?: User
  participants?: EventParticipant[]
}

export interface EventParticipant {
  id: string
  event_id: string
  user_id: string
  joined_at: string
  role: "creator" | "participant"
  user?: User
}

export interface EquipmentRequest {
  id: string
  equipment_id: string
  event_id: string
  requester_id: string
  status: "pending" | "approved" | "rejected" | "received" | "returned"
  approved_by: string | null
  forwarded_to: string | null
  notes: string | null
  created_at: string
  equipment?: Equipment
  events?: Event
  requester?: User
  approver?: User
  forwarded_user?: User
}
