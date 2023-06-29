const themeSelect = document.getElementById("themeSelect")
const custom = document.getElementById("custom")
const backgroundSelect = document.getElementById("backgroundSelect")
const foregroundSelect = document.getElementById("foregroundSelect")
const radiusInput = document.getElementById("radiusInput")
const save = document.getElementById("save")

let settings = {
  theme: "system",
  customTheme: {},
}

async function loadSettings() {
  const savedSettings = JSON.parse(localStorage.getItem("fhsbs-settings"))
  if (savedSettings) {
    settings = savedSettings
    themeSelect.value = settings.theme
    if (settings.theme === "custom") {
      const background = settings.customTheme.background
      const foreground = settings.customTheme.foreground
      const radius = settings.customTheme.radius
      if (background) {
        backgroundSelect.value = background
      }
      if (foreground) {
        foregroundSelect.value = foreground
      }
      if (radius) {
        radiusInput.value = radius
      }
      custom.hidden = false
    }
    themeSelect.disabled = false
    save.disabled = false
  } else {
    themeSelect.disabled = false
    save.disabled = false
  }
}
loadSettings()

Coloris({
  alpha: false,
  format: 'hsl',
  closeButton: true,
  swatches: [
    'hsl(202 22% 90%)',
    'hsl(213 22% 10%)',
  ],
});


function saveSettings() {
  settings.saveDate = new Date
  localStorage.setItem("fhsbs-settings", JSON.stringify(settings))
}

themeSelect.addEventListener("change", () => {
  const theme = themeSelect.value
  document.body.classList = `theme-${theme}`
  if (theme === "custom") {
    custom.hidden = false
  } else {
    document.documentElement.style.removeProperty('--background');
    document.documentElement.style.removeProperty('--foreground');
    document.documentElement.style.removeProperty('--radius');
    settings.customTheme = {}
    custom.hidden = true
  }
  settings.theme = theme
  saveSettings()
})

backgroundSelect.addEventListener("change", () => {
  const background = backgroundSelect.value
  document.documentElement.style.setProperty('--background', background);
  settings.customTheme.background = background
  saveSettings()
})
foregroundSelect.addEventListener("change", () => {
  const foreground = foregroundSelect.value
  document.documentElement.style.setProperty('--foreground', foreground);
  settings.customTheme.foreground = foreground
  saveSettings()
})
radiusInput.addEventListener("change", () => {
  const radius = radiusInput.value
  document.documentElement.style.setProperty('--radius', radius);
  settings.customTheme.radius = radius
  saveSettings()
})

save.addEventListener("click", saveSettings)