export const applyTheme = (theme: "light" | "dark") => {
  const root = document.documentElement;

  root.classList.add("no-transition");

  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  // Fuerza reflow y elimina bloqueo
  requestAnimationFrame(() => {
    root.classList.remove("no-transition");
  });
};

// inicial
const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
applyTheme(savedTheme ?? "light");
