import { createBrowserRouter } from "react-router";
import { LandingPage } from "@/pages/landing-page";
import { LoginPage } from "@/pages/login-page";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { RequireActivePlan } from "@/features/subscriptions/components/require-active-plan";
import { RanchLayout } from "@/features/ranch/layout/ranch-layout";
import { RanchPickerPage } from "@/features/ranch/pages/ranch-picker-page";
import { RanchOverviewPage } from "@/features/ranch/pages/ranch-overview-page";
import { RanchTeamPage } from "@/features/ranch/pages/ranch-team-page";
import { ModuleComingSoon } from "@/features/ranch/components/module-coming-soon";
import { RequireProductionType } from "@/features/ranch/components/require-production-type";
import { AnimalsPage } from "@/features/animals/pages/animals-page";
import { CriaPage } from "@/features/cria/pages/cria-page";
import { PRODUCTION_TYPE_IDS } from "@/features/subscriptions/types";
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
    path: "/ranches",
    element: (
      <ProtectedRoute>
        <RanchPickerPage />
      </ProtectedRoute>
    ),
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
      { path: "equipo", element: <RanchTeamPage /> },
      { path: "animales", element: <AnimalsPage /> },
      {
        path: "cria",
        element: (
          <RequireProductionType idProductionType={PRODUCTION_TYPE_IDS.CRIA} moduleName="Cría">
            <CriaPage />
          </RequireProductionType>
        ),
      },
      {
        path: "recria",
        element: (
          <RequireProductionType idProductionType={PRODUCTION_TYPE_IDS.RECRIA} moduleName="Recría">
            <ModuleComingSoon moduleName="Recría" />
          </RequireProductionType>
        ),
      },
      {
        path: "engorde",
        element: (
          <RequireProductionType idProductionType={PRODUCTION_TYPE_IDS.ENGORDE} moduleName="Engorde">
            <ModuleComingSoon moduleName="Engorde" />
          </RequireProductionType>
        ),
      },
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
