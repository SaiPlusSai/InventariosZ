export const colorDictionary = {
  // Básicos
  "blanco": "#FFFFFF",
  "negro": "#000000",
  "gris": "#808080",
  "plata": "#C0C0C0",
  "plateado": "#C0C0C0",

  // Tierra y Piel
  "cafe": "#6F4E37",
  "café": "#6F4E37",
  "marrón": "#8B4513",
  "marron": "#8B4513",
  "beige": "#F5F5DC",
  "caqui": "#F0E68C",
  "khaki": "#F0E68C",
  "camel": "#C19A6B",
  "arena": "#F4A460",
  "chocolate": "#D2691E",

  // Rojos y Rosas
  "rojo": "#FF0000",
  "vino": "#722F37",
  "bordó": "#722F37",
  "bordo": "#722F37",
  "rosado": "#FFC0CB",
  "rosa": "#FFC0CB",
  "fucsia": "#FF00FF",
  "coral": "#FF7F50",

  // Azules
  "azul": "#0000FF",
  "celeste": "#87CEEB",
  "azul marino": "#000080",
  "marino": "#000080",
  "turquesa": "#40E0D0",
  "cian": "#00FFFF",

  // Verdes
  "verde": "#008000",
  "verde militar": "#4B5320",
  "olivo": "#808000",
  "menta": "#98FF98",
  "esmeralda": "#50C878",

  // Cálidos
  "amarillo": "#FFFF00",
  "mostaza": "#FFDB58",
  "naranja": "#FFA500",
  "dorado": "#FFD700",

  // Morados
  "morado": "#800080",
  "purpura": "#800080",
  "púrpura": "#800080",
  "lila": "#C8A2C8"
}

export function getHexFromColorName(name) {
  if (!name) return ''
  const normalized = name.trim().toLowerCase()
  return colorDictionary[normalized] || ''
}
