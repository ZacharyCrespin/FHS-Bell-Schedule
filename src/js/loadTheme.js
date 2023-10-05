function loadSettings() {
  let savedSettings = localStorage.getItem('fhsbs-settings')

  if (savedSettings) {
    savedSettings = JSON.parse(savedSettings)
    document.body.setAttribute('theme', savedSettings.theme)
    if (savedSettings.theme == 'custom') {
      document.documentElement.style.setProperty("--background", savedSettings.customTheme.background);
      document.documentElement.style.setProperty("--foreground", savedSettings.customTheme.foreground);
      document.documentElement.style.setProperty("--secondary", savedSettings.customTheme.secondary);
      document.documentElement.style.setProperty("--tertiary", savedSettings.customTheme.tertiary);
    }
  }
}
loadSettings()
