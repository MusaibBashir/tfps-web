export interface User {
  id: string
  username: string
  name: string
  email: string
  hostel: string
  year: number
  domain: string
  is_admin: boolean
  favorite_movie?: string
  instagram_link?: string
  letterboxd_link?: string
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
  hall: string | null
  status: "available" | "in_use" | "maintenance"
  image_url: string | null
  details: string | null
  condition_notes: string | null
  last_damage_report: any | null
  created_at: string
}

export interface EquipmentLog {
  id: string
  equipment_id: string
  user_id: string
  checkout_time: string
  expected_return_time: string | null
  return_time: string | null
  transferred_to: string | null
  transfer_time: string | null
  created_at: string
  user?: User
  transferred_user?: User
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
  event_participants?: EventParticipant[]
}

export interface PublicEvent {
  id: string
  title: string
  description: string | null
  location: string | null
  event_type: "workshop" | "screening" | "exhibition" | "competition" | "other"
  start_time: string
  end_time: string
  max_participants: number | null
  registration_deadline: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface PublicEventRegistration {
  id: string
  publicevent_id: string
  name: string
  email: string
  phone: string | null
  additional_info: string | null
  registration_status: "registered" | "confirmed" | "cancelled"
  created_at: string
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
  event_id: string | null
  requester_id: string
  status: "pending" | "approved" | "rejected" | "received" | "returned"
  approved_by: string | null
  forwarded_to: string | null
  current_holder_id: string | null
  received_time: string | null
  returned_time: string | null
  return_condition: "perfect" | "damaged" | null
  damage_notes: string | null
  notes: string | null
  start_time: string | null
  end_time: string | null
  declined_reason: string | null
  auto_declined: boolean | null
  created_at: string
  equipment?: Equipment
  events?: Event
  requester?: User
  approver?: User
  forwarded_user?: User
  current_holder?: User
}

export interface DamageReport {
  id: string
  equipment_id: string
  reported_by: string
  damage_description: string
  severity: "minor" | "moderate" | "severe"
  reported_at: string
  repair_status: "pending" | "in_progress" | "completed"
  repair_notes: string | null
  created_at: string
  reporter?: User
}

export interface EquipmentTransfer {
  id: string
  equipment_id: string
  from_user_id: string
  to_user_id: string
  transfer_time: string
  notes: string | null
  created_at: string
  from_user?: User
  to_user?: User
}

export interface TimeConflict {
  conflicting_request_id: string
  requester_name: string
  start_time: string
  end_time: string
}
