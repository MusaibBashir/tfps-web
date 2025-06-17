# TFPS Website
A comprehensive web application for managing TFPS operations, equipment requests, member management, and event scheduling. Built with modern web technologies and designed for seamless user experience.

##  Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **date-fns** - Modern date utility library

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Authentication & authorization

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **TypeScript** - Static type checking

<pre> ## Project Structure ```plaintext src/ ├── components/ # Reusable UI components │ ├── AddEquipmentForm.tsx │ ├── AddUserForm.tsx │ ├── EquipmentStatusModal.tsx │ ├── EventModal.tsx │ ├── Layout.tsx │ ├── Navbar.tsx │ └── RequestEquipmentModal.tsx ├── contexts/ # React Context providers │ ├── AuthContext.tsx │ └── SupabaseContext.tsx ├── pages/ # Main application pages │ ├── AdminPage.tsx │ ├── CalendarPage.tsx │ ├── DashboardPage.tsx │ ├── EquipmentDetailPage.tsx │ ├── EquipmentPage.tsx │ ├── HomePage.tsx │ ├── LoginPage.tsx │ ├── MemberDetailPage.tsx │ ├── MembersPage.tsx │ ├── ProfilePage.tsx │ └── RequestsPage.tsx ├── types/ # TypeScript type definitions │ └── index.ts ├── utils/ # Utility functions │ ├── supabase.ts │ └── timezone.ts ├── App.tsx # Main application component ├── main.tsx # Application entry point └── index.css # Global styles public/ ├── camera-icon.svg # Custom SVG icon └── index.html # HTML template ``` </pre>

## Features

### Authentication & Authorization
- **Secure Login System** - Username/password authentication
- **Role-based Access Control** - Admin and regular user permissions
- **Session Management** - Persistent login sessions
- **Protected Routes** - Route-level access control

### Member Management
- **Member Directory** - Browse all club members
- **Detailed Profiles** - View member information, equipment owned, and activity
- **Search & Filter** - Find members by name, hostel, year, or domain
- **Admin Controls** - Add new members, manage user roles

### Equipment Management
- **Equipment Catalog** - Browse available equipment with detailed information
- **Ownership Tracking** - Student-owned vs hall-owned equipment
- **Status Management** - Available, in-use, maintenance status
- **Equipment Requests** - Request equipment for events or personal use
- **Approval Workflow** - Owner/admin approval system
- **Handover System** - Transfer equipment between users
- **Damage Reporting** - Report and track equipment damage
- **Usage Logs** - Complete history of equipment usage

### Event Management
- **Calendar View** - Visual calendar interface for events
- **Event Creation** - Create shoots, screenings, and other events
- **Event Types** - Categorized events (shoot, screening, other)
- **Participant Management** - Open events with participant limits
- **Event-based Equipment Requests** - Link equipment requests to specific events
- **IST Timezone Support** - All times displayed in Indian Standard Time

### Request Management
- **Equipment Request System** - Comprehensive request workflow
- **Status Tracking** - Pending, approved, received, returned status
- **Forwarding System** - Forward requests to appropriate users
- **Return Management** - Handle equipment returns with condition reporting
- **Automated Workflows** - Auto-forward requests when equipment is in use
- **Conflict Detection** - Prevent double-booking of equipment

### Dashboard & Analytics
- **Personal Dashboard** - Overview of user's equipment and requests
- **Statistics** - Member count, equipment count, pending requests
- **Recent Activity** - Latest equipment requests and status changes
- **Equipment in Possession** - Track what equipment user currently has
- **Upcoming Events** - View and join upcoming events

### User Experience
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Modern UI** - Clean, intuitive interface with Tailwind CSS
- **Real-time Updates** - Live data updates using Supabase
- **Loading States** - Smooth loading indicators
- **Error Handling** - Graceful error messages and fallbacks
- **Accessibility** - Screen reader friendly, keyboard navigation

## Implementation Details

### Database Schema
- **Users Table** - Member information, roles, and preferences
- **Equipment Table** - Equipment details, ownership, and status
- **Equipment Requests** - Request workflow and status tracking
- **Equipment Logs** - Usage history and transfer records
- **Events Table** - Event information and scheduling
- **Event Participants** - Event participation tracking
- **Damage Reports** - Equipment damage tracking
- **Equipment Transfers** - Transfer history between users

### Key Technical Features
- **TypeScript Integration** - Full type safety across the application
- **Context-based State Management** - React Context for global state
- **Custom Hooks** - Reusable logic for data fetching and state management
- **Timezone Handling** - Proper IST timezone conversion and display
- **Route Protection** - Secure routing with authentication checks
- **Form Validation** - Client-side validation with error handling
- **Modal System** - Reusable modal components for forms and details
- **Search & Filtering** - Advanced filtering capabilities across all pages


## Usage

### For Regular Users
1. **Login** with your credentials
2. **Browse Equipment** - View available equipment and request items
3. **Manage Requests** - Track your equipment requests and returns
4. **Join Events** - Participate in upcoming shoots and screenings
5. **Update Profile** - Manage your personal information

### For Admins
1. **Member Management** - Add new members and manage user roles
2. **Equipment Management** - Add new equipment and manage inventory
3. **Request Approval** - Approve/reject equipment requests
4. **Event Management** - Create and manage society events
5. **System Overview** - Monitor overall system usage and statistics

## Acknowledgments

- Built with love for the amazing community at TFPS
- Special thanks to the governers for their support and contributions
- Inspired by the need for better equipment and event management
- Thanks to the open-source community and youtube for the amazing tools, libraries and tutorials.

---

**TFPS** - We are a collective of passionate filmmakers, photographers and storytellers bonding over our shared love for expression and art. Through collaboration, we bend ideas into reality, shaping thoughts into frames.
