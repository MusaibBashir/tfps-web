# TFPS Club Website

A comprehensive web application for managing the Technology Film and Photography Society's equipment, events, and members.

## Features

- **User Authentication**
  - Role-based access control (Admin/Member)
  - Secure login system
  - User profile management

- **Equipment Management**
  - Browse available equipment
  - Detailed equipment information
  - Equipment status tracking
  - Support for equipment hierarchies (e.g., cameras with lenses)
  - Equipment request system

- **Event Management**
  - Create and manage events
  - Event approval workflow
  - Calendar view with filtering
  - Event types: shoots, screenings, and others

- **Member Management**
  - Member directory
  - Detailed member profiles
  - Domain-based filtering
  - Equipment ownership tracking

- **Request System**
  - Equipment request workflow
  - Status tracking
  - Approval system
  - Usage logging

## Tech Stack

- **Frontend**
  - React 18
  - TypeScript
  - Tailwind CSS
  - Lucide React (icons)
  - React Router
  - date-fns
  - Zustand (state management)

- **Backend**
  - Supabase (Backend as a Service)
  - PostgreSQL database
  - Row Level Security (RLS)

## Project Structure

```
tfps-club-website/
├── public/
│   └── camera-icon.svg
├── src/
│   ├── components/
│   │   ├── AddEquipmentForm.tsx
│   │   ├── AddUserForm.tsx
│   │   ├── EventModal.tsx
│   │   ├── Layout.tsx
│   │   ├── Navbar.tsx
│   │   └── RequestEquipmentModal.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── SupabaseContext.tsx
│   ├── database/
│   │   └── supabase-setup.md
│   ├── pages/
│   │   ├── AdminPage.tsx
│   │   ├── CalendarPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── EquipmentDetailPage.tsx
│   │   ├── EquipmentPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── MemberDetailPage.tsx
│   │   ├── MembersPage.tsx
│   │   └── RequestsPage.tsx
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── supabase.ts
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── .env
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Setup Instructions

1. **Clone the repository**
```bash
git clone <repository-url>
cd tfps-club-website
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**
   - Create a new Supabase project
   - Copy your project URL and anon key
   - Create a `.env` file with your Supabase credentials:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```
   - Follow the database setup instructions in `src/database/supabase-setup.md`

4. **Start the development server**
```bash
npm run dev
```

5. **Build for production**
```bash
npm run build
```

## Database Schema

### Users Table
- Stores member information
- Includes authentication details
- Tracks admin status

### Equipment Table
- Manages all photography and film equipment
- Supports equipment hierarchies
- Tracks ownership and status

### Events Table
- Stores event information
- Handles event approval workflow
- Links events with equipment requests

### Equipment Requests Table
- Manages equipment borrowing requests
- Tracks request status
- Links users, equipment, and events

### Equipment Logs Table
- Records equipment usage history
- Tracks checkout and return times
- Maintains audit trail

## Security

- Row Level Security (RLS) policies ensure data access control
- User authentication required for all operations
- Role-based access control for admin functions
- Secure password handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details
