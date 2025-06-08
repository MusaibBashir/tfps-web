export interface User {
  id: string
  name: string
  username: string
  email: string
  password: string
  hostel: string
  year: number
  domain: string
  favorite_movie?: string
  instagram_link?: string
  letterboxd_link?: string
  created_at: string
}

export interface Equipment {
  id: string
  name: string
  type: string
  subtype?: string
  ownership_type: "society" | "student"
  owner_id: string
  status: "available" | "in_use" | "maintenance"
  image_url?: string
  details?: string
  created_at: string
}

export interface Event {
  id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  location?: string
  event_type: "shoot" | "screening" | "meeting" | "workshop" | "other"
  is_open: boolean
  created_by: string
  created_at: string
}

export interface Request {
  id: string
  user_id: string
  equipment_id: string
  event_id?: string
  start_time: string
  end_time: string
  status: "pending" | "approved" | "rejected" | "completed"
  notes?: string
  created_at: string
  forwarded_to?: string
}

export interface UserRole {
  id: string
  user_id: string
  role: "admin" | "member"
  created_at: string
}
