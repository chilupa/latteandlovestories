/** Default theme stored in profiles.theme (jsonb) */
export const defaultTheme = {
  backgroundType: "gradient",
  background: "linear-gradient(165deg, #fdf2f8 0%, #fff7ed 45%, #faf5ff 100%)",
  accent: "#be185d",
  buttonStyle: "pill",
};

export function parseTheme(raw) {
  if (!raw || typeof raw !== "object") return { ...defaultTheme };
  return {
    ...defaultTheme,
    ...raw,
    backgroundType: raw.backgroundType ?? defaultTheme.backgroundType,
    background: raw.background ?? defaultTheme.background,
    accent: raw.accent ?? defaultTheme.accent,
    buttonStyle: raw.buttonStyle ?? defaultTheme.buttonStyle,
  };
}

export function themeToStyleVars(theme) {
  const t = parseTheme(theme);
  if (t.backgroundType === "solid") {
    return {
      backgroundColor: t.background,
      ["--profile-accent"]: t.accent,
    };
  }
  return {
    background: t.background,
    ["--profile-accent"]: t.accent,
  };
}
