# Education Platform Frontend

A modern React TypeScript application for an educational platform with role-based authentication and dashboards.

## Features

- **Authentication System**

  - Login/Register with form validation
  - Forgot password functionality
  - JWT token management with automatic refresh
  - Role-based access control

- **Role-Based Dashboards**

  - Student Dashboard: Course tracking, assignments, grades
  - Teacher Dashboard: Course management, student progress
  - HOD Dashboard: Department management, faculty oversight
  - Principal Dashboard: Institution-wide management

- **Modern UI/UX**
  - Responsive design with Tailwind CSS
  - Beautiful gradients and animations
  - Toast notifications for user feedback
  - Loading states and error handling

## Tech Stack

- **React 18** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Headless UI** for accessible components
- **Heroicons** for icons
- **React Hook Form** with Yup validation
- **Axios** for API calls
- **React Hot Toast** for notifications

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Backend API running on port 5000

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
# Create .env file in the root directory
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_APP_NAME=Education Platform
```

3. Start the development server:

```bash
npm start
```

The application will open at `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout with navigation
│   ├── LoadingSpinner.tsx
│   └── ProtectedRoute.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state management
├── pages/              # Page components
│   ├── dashboards/     # Role-specific dashboards
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── ForgotPassword.tsx
│   └── Unauthorized.tsx
├── services/           # API services
│   └── api.ts         # HTTP client and API calls
├── types/              # TypeScript type definitions
│   └── auth.ts        # Authentication types
└── App.tsx            # Main app component with routing
```

## Authentication Flow

1. **Login/Register**: Users authenticate with username/password
2. **Token Storage**: JWT tokens stored in localStorage
3. **Auto Refresh**: Tokens automatically refreshed on expiry
4. **Role Checking**: Routes protected based on user roles
5. **Logout**: Tokens cleared and user redirected

## Role-Based Access

- **Student**: Access to student dashboard and profile
- **Teacher**: Student access + course management
- **HOD**: Teacher access + department management
- **Principal**: HOD access + institution-wide management

## API Integration

The frontend communicates with the backend API for:

- User authentication and authorization
- Dashboard data fetching
- Profile management
- Role-specific operations

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Environment Variables

- `REACT_APP_API_BASE_URL` - Backend API base URL
- `REACT_APP_APP_NAME` - Application name

## Contributing

1. Follow TypeScript best practices
2. Use functional components with hooks
3. Implement proper error handling
4. Add loading states for async operations
5. Follow the existing code structure

## Security Features

- JWT token management
- Automatic token refresh
- Role-based route protection
- Input validation and sanitization
- HTTPS-ready configuration

# AIValytics Dashboard

This project features a modern dashboard UI with a responsive sidebar navigation system.

## Sidebar Navigation

The sidebar provides easy access to all application features:

- The sidebar is responsive and adapts to both desktop and mobile views
- On mobile, the sidebar can be toggled using the menu button in the top navigation bar
- Each navigation item displays an icon and label
- The active route is highlighted and displays a right arrow indicator
- User profile information is displayed at the bottom of the sidebar

## Customizing the Sidebar

### Adding Navigation Items

Navigation items are defined in the `Layout.tsx` component. To add a new item:

1. Import the icon you want to use:

```jsx
import { NewIcon } from "@heroicons/react/24/outline";
```

2. Add a new item to the navigation array:

```jsx
navigation.push({
  name: "New Item",
  href: "/new-path",
  icon: NewIcon,
  current: location.pathname === "/new-path",
});
```

### Role-Based Navigation

The sidebar automatically shows different navigation items based on the user's role:

- Students see: Dashboard, Profile, Courses, Quizzes, Performance Report
- Teachers see: Dashboard, Profile, My Courses
- Principals see: Dashboard, Profile, My Courses, Admin Panel, Settings

## Theme Customization

The sidebar uses a dark theme with Tailwind CSS classes. To customize the appearance:

- Change background colors by modifying `bg-gray-900` and `bg-gray-800` classes
- Adjust text colors with `text-white`, `text-gray-300`, etc.
- Modify the active item highlight with `text-blue-400`

## Mobile Responsiveness

The sidebar automatically collapses on mobile devices:

- On desktop, the sidebar is always visible
- On mobile, a hamburger menu button toggles the sidebar
- The mobile sidebar slides in from the left when activated

## User Profile Section

The user profile section at the bottom of the sidebar displays:

- User avatar with first initial
- Username
- Role badge with appropriate color
- Logout button
