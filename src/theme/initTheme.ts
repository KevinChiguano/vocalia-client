export const applyTheme = (theme: "light" | "dark") => {
  const root = document.documentElement;

  // Bloquea transiciones para evitar parpadeo
  root.classList.add("no-transition");

  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  // Guardar en localStorage
  localStorage.setItem("theme", theme);

  // Fuerza un reflow para que el navegador aplique el cambio sin transición
  // y luego removemos el bloqueo en el siguiente frame
  window.getComputedStyle(root).opacity; // force reflow

  requestAnimationFrame(() => {
    root.classList.remove("no-transition");
  });
};

// Inicialización inmediata (si no se hizo en el head)
const savedTheme = (localStorage.getItem("theme") as "light" | "dark") || "light";
applyTheme(savedTheme);
