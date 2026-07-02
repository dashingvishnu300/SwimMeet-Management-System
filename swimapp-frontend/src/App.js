import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import Navbar from './components/Navbar';
import Footer from "./components/Footer";

// Pages — Existing (Day 1-4)
import NotFound from "./pages/NotFound";
import Login    from './pages/Login';
import Register from './pages/Register';
import Meets    from './pages/Meets';

// Pages — Day 5 & 6
import MeetDetail         from './pages/MeetDetail';
import OrganizerDashboard from './pages/OrganizerDashboard';
import HeatSheets         from './pages/HeatSheets';
import ResultsEntry       from './pages/ResultsEntry';
import MedalTally         from './pages/MedalTally';
import CreateMeet         from './pages/CreateMeet';
import EditMeet           from './pages/EditMeet';
import EventAssignment    from './pages/EventAssignment';
import SwimmerRegistration from './pages/SwimmerRegistration';
import MyRegistrations     from './pages/MyRegistrations';
import CoachDashboard from './pages/CoachDashboard';
import FinalsResults from './pages/FinalsResults';
import SwimmerDashboard from './pages/SwimmerDashboard';
import MyCertificates from "./pages/MyCertificates";
import PublishResultsCenter from './pages/PublishResultsCenter';
import RecordsCenter from './pages/RecordsCenter';
import SwimmerProfile from './pages/SwimmerProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import PendingOrganizers from './pages/admin/PendingOrganizers';
import ApprovedOrganizers from './pages/admin/ApprovedOrganizers';
import RejectedOrganizers from './pages/admin/RejectedOrganizers';
import OrganizerDetails from './pages/admin/OrganizerDetails';
import ChangePassword from './pages/ChangePassword';
import ForgotPassword from './pages/ForgotPassword';
import Associations from './pages/Associations';
import OrganizerRequests from './pages/admin/OrganizerRequests';
// ─────────────────────────────────────────────
// Route Guards

// ─────────────────────────────────────────────

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={loadingStyle}>🌊 Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function RoleRoute({ children, role }) {

  const { user, loading } = useAuth();

  if (loading)
    return <div style={loadingStyle}>🌊 Loading…</div>;

  if (!user)
    return <Navigate to="/login" replace />;

  const userRole =
    user?.role?.name ?? user?.role;

  if (userRole !== role)
    return <Navigate to="/meets" replace />;

  return children;

}

const loadingStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1526 100%)',
  color: '#64748b',
  fontSize: '16px',
  fontFamily: "'Segoe UI', system-ui, sans-serif",
};

// ─────────────────────────────────────────────
// App Shell
// ─────────────────────────────────────────────

function AppShell() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />

      <Routes>
  {/* Public */}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route
  path="/forgot-password"
  element={<ForgotPassword />}
/>
  <Route path="/meets" element={<Meets />} />
  <Route
  path="/change-password"
  element={
    <PrivateRoute>
      <ChangePassword />
    </PrivateRoute>
  }
/>

  {/* Dashboard */}
  {/* Coach Dashboard */}
<Route
  path="/coach"
  element={
    <RoleRoute role="coach">
      <CoachDashboard />
    </RoleRoute>
  }
/>

  <Route path="/dashboard" element={<RoleRoute role="organizer"><OrganizerDashboard /></RoleRoute>} />

  {/* Create Meet */}
  <Route path="/meets/create" element={<RoleRoute role="organizer"><CreateMeet /></RoleRoute>} />

  {/* Edit Meet */}
  <Route path="/meets/:id/edit" element={<RoleRoute role="organizer"><EditMeet /></RoleRoute>} />

  {/* Event Assignment */}
  <Route path="/meets/:id/events" element={<RoleRoute role="organizer"><EventAssignment /></RoleRoute>} />

  {/* ✅ Swimmer Registration */}
  <Route path="/meets/:id/register" element={<PrivateRoute><SwimmerRegistration /></PrivateRoute>} />

  <Route path="/swimmer/dashboard"  element={<SwimmerDashboard />}/>

  <Route
    path="/my-certificates"
    element={<MyCertificates />}
/>

  {/* Heat Sheets */}
  <Route path="/meets/:id/heats" element={<HeatSheets />} />

  {/* Results */}
  <Route path="/meets/:id/results" element={<ResultsEntry />} />

  <Route
  path="/meets/:id/finals"
  element={
    <RoleRoute role="organizer">
      <FinalsResults />
    </RoleRoute>
  }
/>

<Route
  path="/meets/:id/publish"
  element={
    <RoleRoute role="organizer">
      <PublishResultsCenter />
    </RoleRoute>
  }
/>

<Route
  path="/admin/associations"
  element={
    <RoleRoute role="admin">
      <Associations />
    </RoleRoute>
  }
/>

<Route
  path="/admin/organizers"
  element={
    <RoleRoute role="admin">
      <OrganizerRequests />
    </RoleRoute>
  }
/>

<Route
  path="/profile"
  element={<SwimmerProfile />}
/>

<Route
  path="/admin"
  element={
    <RoleRoute role="admin">
      <AdminDashboard />
    </RoleRoute>
  }
/>
<Route
  path="/admin/pending"
  element={
    <RoleRoute role="admin">
      <PendingOrganizers />
    </RoleRoute>
  }
/>

<Route
  path="/admin/approved"
  element={
    <RoleRoute role="admin">
      <ApprovedOrganizers />
    </RoleRoute>
  }
/>

<Route
  path="/admin/rejected"
  element={
    <RoleRoute role="admin">
      <RejectedOrganizers />
    </RoleRoute>
  }
/>

<Route
  path="/swimmers/:id"
  element={<SwimmerProfile />}
/>

<Route
  path="/records"
  element={<RecordsCenter />}
/>

  {/* Medal Tally */}
  <Route path="/meets/:id/medals" element={<MedalTally />} />

  {/* ── My Registrations ── */}
<Route
  path="/my-registrations"
  element={
    <PrivateRoute>
      <MyRegistrations />
    </PrivateRoute>
  }
/>

<Route
  path="/admin/organizers/:id"
  element={
    <RoleRoute role="admin">
      <OrganizerDetails />
    </RoleRoute>
  }
/>

  {/* Meet Detail - LAST */}
  <Route path="/meets/:id" element={<MeetDetail />} />

  {/* Default */}
  <Route
  path="/"
  element={
    user
      ? (
        (user.role?.name ?? user.role) === 'admin'
          ? <Navigate to="/admin" replace />
  
        : (user.role?.name ?? user.role) === 'organizer'
          ? <Navigate to="/dashboard" replace />
  
        : (user.role?.name ?? user.role) === 'coach'
          ? <Navigate to="/coach" replace />
  
        : (user.role?.name ?? user.role) === 'swimmer'
          ? <Navigate to="/swimmer/dashboard" replace />
  
        : <Navigate to="/meets" replace />
      )
  
      : <Navigate to="/login" replace />
  }
/>

  {/* 404 */}
  <Route path="*" element={<NotFound />} /></Routes>
  <Footer />
    </>
  );
}

// ─────────────────────────────────────────────
// Root Export
// ─────────────────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppShell />
      </Router>
    </AuthProvider>
  );
}