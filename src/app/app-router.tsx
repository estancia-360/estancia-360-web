import { createBrowserRouter } from "react-router";
import { LandingPage } from "@/pages/landing-page";
import { LoginPage } from "@/pages/login-page";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { RequireActivePlan } from "@/features/subscriptions/components/require-active-plan";
import { RanchLayout } from "@/features/ranch/layout/ranch-layout";
import { RanchOverviewPage } from "@/features/ranch/pages/ranch-overview-page";
import { ModuleComingSoon } from "@/features/ranch/components/module-coming-soon";
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
        <RequireActivePlan>
          <RanchLayout />
        </RequireActivePlan>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <RanchOverviewPage /> },
      { path: "animales", element: <ModuleComingSoon moduleName="Animales" /> },
      { path: "cria", element: <ModuleComingSoon moduleName="Cría" /> },
      { path: "recria", element: <ModuleComingSoon moduleName="Recría" /> },
      { path: "engorde", element: <ModuleComingSoon moduleName="Engorde" /> },
      { path: "sanidad", element: <ModuleComingSoon moduleName="Sanidad" /> },
      { path: "movimientos", element: <ModuleComingSoon moduleName="Movimientos" /> },
    ],
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
