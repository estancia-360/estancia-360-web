import { createBrowserRouter } from "react-router";
import { LandingPage } from "@/pages/landing-page";
import { LoginPage } from "@/pages/login-page";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { RequireActivePlan } from "@/features/subscriptions/components/require-active-plan";
import { RanchLayout } from "@/features/ranch/layout/ranch-layout";
import { RanchPickerPage } from "@/features/ranch/pages/ranch-picker-page";
import { RanchOverviewPage } from "@/features/ranch/pages/ranch-overview-page";
import { RanchTeamPage } from "@/features/ranch/pages/ranch-team-page";
import { PasturesPage } from "@/features/pastures/pages/pastures-page";
import { RequireProductionType } from "@/features/ranch/components/require-production-type";
import { AnimalsPage } from "@/features/animals/pages/animals-page";
import { CriaPage } from "@/features/cria/pages/cria-page";
import { RearingPage } from "@/features/rearing/pages/rearing-page";
import { FatteningPage } from "@/features/fattening/pages/fattening-page";
import { MovementsPage } from "@/features/movements/pages/movements-page";
import { HealthPage } from "@/features/health/pages/health-page";
import { PRODUCTION_TYPE_IDS } from "@/features/subscriptions/types";
import { AdminLayout } from "@/features/admin/layout/admin-layout";
import { AdminMetricsPage } from "@/features/admin/pages/admin-metrics-page";
import { AdminSubscriptionsPage } from "@/features/admin/pages/admin-subscriptions-page";
import { AdminUsersPage } from "@/features/admin/pages/admin-users-page";
import { BulkImportMenuPage } from "@/features/bulk-import/pages/bulk-import-menu-page";
import { AnimalsImportPage } from "@/features/bulk-import/pages/animals-import-page";
import { WeightsImportPage } from "@/features/bulk-import/pages/weights-import-page";
import { GestationImportPage } from "@/features/bulk-import/pages/gestation-import-page";
import { HealthImportPage } from "@/features/bulk-import/pages/health-import-page";
import { MovementsImportPage } from "@/features/bulk-import/pages/movements-import-page";

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
      { path: "potreros", element: <PasturesPage /> },
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
            <RearingPage />
          </RequireProductionType>
        ),
      },
      {
        path: "engorde",
        element: (
          <RequireProductionType idProductionType={PRODUCTION_TYPE_IDS.ENGORDE} moduleName="Engorde">
            <FatteningPage />
          </RequireProductionType>
        ),
      },
      { path: "sanidad", element: <HealthPage /> },
      { path: "movimientos", element: <MovementsPage /> },
      {
        path: "cargas-masivas",
        children: [
          { index: true, element: <BulkImportMenuPage /> },
          { path: "animales", element: <AnimalsImportPage /> },
          { path: "pesajes", element: <WeightsImportPage /> },
          {
            path: "gestacion",
            element: (
              <RequireProductionType idProductionType={PRODUCTION_TYPE_IDS.CRIA} moduleName="Cría">
                <GestationImportPage />
              </RequireProductionType>
            ),
          },
          { path: "sanidad", element: <HealthImportPage /> },
          { path: "movimientos", element: <MovementsImportPage /> },
        ],
      },
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
