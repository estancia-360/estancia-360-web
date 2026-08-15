/**
 * Paleta categórica del dashboard, validada con `dataviz`'s validate_palette.js
 * (6 checks: lightness band, chroma floor, CVD separation, normal-vision floor,
 * contraste). Los 3 hues de módulo pasan todos los checks; `#3e5a99` es un azul
 * derivado del mismo matiz que --color-brand-blue-mid — la variable original
 * (#2e4170) falla lightness/chroma como marca de gráfico, es un tono pensado
 * para texto/iconos, no para datos. No cambiar estos hex sin re-validar.
 */
export const CHART_COLORS = {
  cria: "#e2772a",
  recria: "#3e5a99",
  engorde: "#336c38",
  ventas: "#336c38",
  compras: "#3e5a99",
  alerta: "#c45f18",
  /**
   * Gris de "de-énfasis" — patrón Emphasis de la skill (un hue + gris) para pares
   * donde un lado es el dato que importa y el otro es contexto (ej. preñada/vacía).
   * No participa del validador categórico (no es identidad entre pares, es contraste
   * de énfasis) — solo necesita contraste de texto adecuado, que sí cumple sobre blanco.
   */
  deemphasis: "#9c9686",
} as const;
