// Settings
const savedSettings = JSON.parse(localStorage.getItem("fhsbs-settings"))
if (savedSettings) {
  document.body.classList = `theme-${savedSettings.theme}`
  if (savedSettings.theme === "custom") {
    const background = savedSettings.customTheme.background
    const foreground = savedSettings.customTheme.foreground
    const radius = savedSettings.customTheme.radius
    if (background) {
      document.documentElement.style.setProperty('--background', background)
    }
    if (foreground) {
      document.documentElement.style.setProperty('--foreground', foreground)
    }
    if (radius) {
      document.documentElement.style.setProperty('--radius', radius)
    }
  }
}

// Menu
const menuIcon = document.getElementById("menu-icon")
const menu = document.getElementById("menu")

menuIcon.addEventListener("click", () => {
  menu.classList.toggle("open")
})
