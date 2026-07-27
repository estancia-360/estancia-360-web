import { createBrowserRouter } from "react-router";
import { LandingPage } from "@/pages/landing-page";
import { LoginPage } from "@/pages/login-page";
import { RanchDashboardPage } from "@/pages/ranch-dashboard-page";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { AdminLayout } from "@/features/admin/layout/admin-layout";
import { AdminMetricsPage } from "@/features/admin/pages/admin-metrics-page";
import { AdminSubscriptionsPage } from "@/features/admin/pages/admin-subscriptions-page";
import { AdminUsersPage } from "@/features/admin/pages/admin-users-page";

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <RanchDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute requireAdmin>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminMetricsPage /> },
      { path: "subscriptions", element: <AdminSubscriptionsPage /> },
      { path: "users", element: <AdminUsersPage /> },
    ],
  },
]);
