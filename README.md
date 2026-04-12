# CreditPro - Intelligent Credit Application Scoring Platform

Clean, professional Next.js 16.1.4 application for credit application management with AI-powered scoring.

## Tech Stack

- **Next.js 16.1.4** (App Router)
- **TypeScript**
- **Tailwind CSS 4**
- **React 19**

## Features

### Public Pages
- **Landing Page** (`/`) - Marketing page with platform features
- **Login** (`/login`) - Authentication page (mock)
- **Register** (`/register`) - User registration (mock)

### Client Portal
- **Dashboard** - Overview with stats and quick actions
- **New Request** - Multi-step credit application form
- **My Requests** - List of all applications with filters
- **Request Details** - Track status, view score, QR code
- **Simulator** - Calculate payments and acceptance probability
- **Profile** - Manage personal and professional information

### Admin Dashboard
- **Dashboard** - KPIs, score distribution, recent requests
- **Requests** - Manage all applications with advanced filters
- **Request Details** - Review applications, AI score analysis, decision actions
- **Analytics** - Charts, trends, performance metrics
- **Settings** - System configuration

## Project Structure

```
/app
  /(public)
    page.tsx              # Landing page
    login/page.tsx        # Login
    register/page.tsx     # Register
  /client
    layout.tsx            # Client layout with navbar
    dashboard/page.tsx
    profile/page.tsx
    new-request/page.tsx
    requests/page.tsx
    request/[id]/page.tsx
    simulator/page.tsx
  /admin
    layout.tsx            # Admin layout with sidebar
    dashboard/page.tsx
    requests/page.tsx
    requests/[id]/page.tsx
    analytics/page.tsx
    settings/page.tsx

/components
  Navbar.tsx              # Client navigation
  Sidebar.tsx             # Admin navigation
  DashboardCard.tsx       # Stat cards
  DataTable.tsx           # Request tables
  StepForm.tsx            # Multi-step form
  FileUpload.tsx          # Document upload UI
  ScoreBadge.tsx          # Score display
  QRCodeCard.tsx          # QR code placeholder
  StatusTimeline.tsx      # Status tracking
  SimulatorCard.tsx       # Credit calculator

/lib
  mockData.ts             # Mock data and types
```

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000)

## Routes

### Public
- `/` - Landing page
- `/login` - Login (click either button to access portals)
- `/register` - Registration

### Public
- `/simulateur` - Credit simulator (no login; same tool as before, outside the client layout)

### Client
- `/client/dashboard` - Client dashboard
- `/client/new-request` - New credit request
- `/client/requests` - View all requests
- `/client/request/[id]` - Request details
- `/client/simulator` - Redirects to `/simulateur`
- `/client/profile` - User profile

### Admin
- `/admin/dashboard` - Admin dashboard
- `/admin/assistant` - Manage chat assistant keyword replies (Supabase table `assistant_replies`)
- `/admin/requests` - All requests
- `/admin/requests/[id]` - Request review
- `/admin/analytics` - Analytics
- `/admin/settings` - Settings

## Key Features

### Multi-Step Credit Application
- Personal information
- Professional situation
- Income & charges
- Credit details
- Document upload

### AI Score Analysis
- Income stability
- Payment capacity
- Document quality
- Risk assessment
- Overall score (Low/Medium/High)

### Credit Simulator
- Interactive sliders for amount, duration, income
- Real-time calculations
- Monthly payment estimation
- Acceptance probability
- Debt ratio calculation

### Admin Tools
- Comprehensive request management
- AI-powered scoring insights
- Decision workflows (Approve/Reject/Request Guarantees)
- Analytics and reporting
- Advanced filtering

## Design System

### Colors
- Primary Blue: `#2563EB`
- Success Green: `#10B981`
- Warning Yellow: `#F59E0B`
- Danger Red: `#EF4444`
- Neutral Gray: `#6B7280`

### Components
All components use Tailwind CSS with a clean, professional fintech aesthetic.

## Notes

- **UI Only** - No backend, database, or real authentication
- **Mock Data** - All data from `lib/mockData.ts`
- **Ready for Integration** - Clean structure for API connections
- **Responsive** - Works on all screen sizes
- **Type-Safe** - Full TypeScript support

## Next Steps (Backend Integration)

1. Replace mock data with API calls
2. Add Supabase authentication
3. Implement OCR for document processing
4. Connect real AI scoring API
5. Add QR code generation library
6. Implement real-time notifications

---

**CreditPro** - Built with Next.js 16.1.4 | PFE-level complexity
