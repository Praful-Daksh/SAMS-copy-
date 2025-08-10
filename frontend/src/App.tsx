import { Toaster } from "@/common/components/ui/toaster";
import { Toaster as Sonner } from "@/common/components/ui/sonner";
import { TooltipProvider } from "@/common/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useAuthStore } from "@/modules/user-management1/store/authStore";
import ProtectedRoute from "@/modules/user-management1/components/ProtectedRoute";
import DashboardLayout from "@/common/components/dashboard/DashboardLayout";
import AuthPage from "@/modules/user-management1/pages/AuthPage";
import DashboardPage from "@/modules/user-management1/pages/DashboardPage";
import UnauthorizedPage from "@/common/pages/UnauthorizedPage";
import NotFound from "./common/pages/NotFound";
import React, { useEffect, lazy, Suspense } from "react";
import { Outlet } from "react-router-dom"; // Import Outlet
import TimetableDashboard from "@/modules/timetable2/pages/TimetableDashboard"; // Your TimetableDashboard page
import AdminDashboard from "@/modules/user-management1/components/dashboard/AdminDashboard"; // Import the actual AdminDashboard
import ProfilePage from "@/modules/user-management1/pages/Profile"; // Import the ProfilePage
import SettingsPage from "@/modules/user-management1/pages/Settings";
import ApprovalPending from "./modules/user-management1/components/postRegister";

const queryClient = new QueryClient();

// --- Placeholder Components for Timetable Management Module ---
// In a real scenario, you would import these from your Timetable Management module.
// e.g., import TimetableDashboard from '@/modules/timetable/pages/Dashboard';
const PlaceholderComponent = ({
  name,
  path,
}: {
  name: string;
  path: string;
}) => (
  <div className="p-6 bg-gray-50 rounded-lg shadow">
    <h2 className="text-xl font-semibold text-gray-700">
      Timetable Module: {name}
    </h2>
    <p className="text-sm text-gray-500">
      Current route (relative to timetable base): <code>{path}</code>
    </p>
    <p className="mt-2 text-gray-600">
      Content for the {name} page of the Timetable Management module will be
      rendered here.
    </p>
  </div>
);

const TimetableModuleDashboard = () => (
  <PlaceholderComponent name="Dashboard" path="/" />
);
const TimetableCreate = () => (
  <PlaceholderComponent name="Timetable Create" path="timetable/create" />
);
const FacultyManagement = () => (
  <PlaceholderComponent name="Faculty Management" path="faculty" />
);
const RoomManagement = () => (
  <PlaceholderComponent name="Room Management" path="rooms" />
);
const SubjectMapping = () => (
  <PlaceholderComponent name="Subject Mapping" path="subject-mapping" />
);
const TimetableReports = () => (
  <PlaceholderComponent name="Reports" path="reports" />
);
const TimetableConflicts = () => (
  <PlaceholderComponent name="Conflicts" path="conflicts" />
);
const TimetableModuleNotFound = () => (
  <PlaceholderComponent name="404 Not Found" path="*" />
);

const App = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const appBasePath = "/SAMS"; // Your GitHub Pages base path

  useEffect(() => {
    const redirect = sessionStorage.redirect;
    if (redirect) {
      delete sessionStorage.redirect; // Clear it so it doesn't run on every navigation

      const targetUrl = new URL(redirect);

      // Extract the path relative to your app's base
      // e.g., if redirect is https://user.github.io/SAMS/login?param=1
      // and appBasePath is /SAMS
      // then intendedPath will be /login
      let intendedPath = targetUrl.pathname;
      if (intendedPath.startsWith(appBasePath)) {
        intendedPath = intendedPath.substring(appBasePath.length);
      }

      // Ensure it starts with a slash if it's not empty, or default to root for the router
      if (!intendedPath) {
        intendedPath = "/";
      } else if (!intendedPath.startsWith("/")) {
        intendedPath = "/" + intendedPath;
      }

      const fullIntendedPath = intendedPath + targetUrl.search + targetUrl.hash;

      // Only navigate if the intended path is different from the current app path
      // location.pathname from useLocation is already relative to the BrowserRouter's basename.
      const currentAppRelativePath =
        location.pathname + location.search + location.hash;

      if (fullIntendedPath !== currentAppRelativePath) {
        navigate(fullIntendedPath, { replace: true });
      }
    }
  }, [navigate, location, appBasePath]); // Add dependencies

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {/* BrowserRouter is now in main.tsx with basename="/SAMS" */}
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <AuthPage />
              )
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <AuthPage />
              )
            }
          />

          <Route path="/register/request-sent" element={<ApprovalPending />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />

            {/* Admin Section */}
            <Route
              path="admin"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <Outlet />
                </ProtectedRoute>
              }
            >
              {/* Redirect /admin to /admin/dashboard */}
              <Route index element={<Navigate to="dashboard" replace />} />
              {/* Admin Dashboard */}
              <Route path="dashboard" element={<AdminDashboard />} />
              {/* Timetable Management */}
              <Route path="timetable" element={<TimetableDashboard />} />
              {/* ...other admin routes... */}
            </Route>
            {/*path to profile page*/}
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Error Routes */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
