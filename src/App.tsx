import { RouterProvider } from "react-router/dom";
import { appRouter } from "@/app/app-router";
import { AuthProvider } from "@/features/auth/context/auth-context";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={appRouter} />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
