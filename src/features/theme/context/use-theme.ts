import { useContext } from "react";
import { ThemeContext, type ThemeContextValue } from "@/features/theme/context/theme-context-value";

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
  return context;
}
