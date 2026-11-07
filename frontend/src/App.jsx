
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { useAuth } from "./context/AuthContext.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import SkillsPage from "./pages/SkillsPage.jsx";
import BrowseProjects from "./pages/BrowseProjects.jsx";
import CreateProject from "./pages/CreateProject.jsx";
import ProjectDetails from "./pages/ProjectDetails.jsx";

import TeamManagement from "./pages/TeamManagement.jsx";
import MyInvitationsRequests from "./pages/MyInvitationsRequests.jsx";
import TeamJoinRequests from "./pages/TeamJoinRequests.jsx";
import TeamInvitations from "./pages/TeamInvitations.jsx";
import MyProfile from "./pages/MyProfile.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";

import "./App.css";

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="app-loading">Loading SkillSync...</div>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to={isAuthenticated ? "/dashboard" : "/login"}
            replace
          />
        }
      />

      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to="/dashboard" replace />
            : <Login />
        }
      />

      <Route
        path="/register"
        element={
          isAuthenticated
            ? <Navigate to="/dashboard" replace />
            : <Register />
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MyProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/skills"
        element={
          <ProtectedRoute>
            <SkillsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <BrowseProjects />
          </ProtectedRoute>
        }
      />

      <Route
        path="/projects/create"
        element={
          <ProtectedRoute>
            <CreateProject />
          </ProtectedRoute>
        }
      />

      <Route
        path="/projects/:projectId"
        element={
          <ProtectedRoute>
            <ProjectDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-activity"
        element={
          <ProtectedRoute>
            <MyInvitationsRequests />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teams/:teamId"
        element={
          <ProtectedRoute>
            <TeamManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teams/:teamId/requests"
        element={
          <ProtectedRoute>
            <TeamJoinRequests />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teams/:teamId/invitations"
        element={
          <ProtectedRoute>
            <TeamInvitations />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
