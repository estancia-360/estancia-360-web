import { RouterProvider } from "react-router/dom";
import { appRouter } from "@/app/app-router";
import { AuthProvider } from "@/features/auth/context/auth-context";
import { ThemeProvider } from "@/features/theme/context/theme-context";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={appRouter} />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
