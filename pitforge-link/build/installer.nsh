; PitForge Link — custom NSIS installer hooks

!macro customWelcomePage
  !define MUI_WELCOMEPAGE_TITLE "Welcome to PitForge Link Setup"
  !define MUI_WELCOMEPAGE_TEXT "This will install PitForge Link on your computer.$\r$\n$\r$\nOn first launch, a setup wizard will ask for your Le Mans Ultimate folder and install the telemetry plugin automatically.$\r$\n$\r$\nClick Next to continue."
!macroend

!macro customInstall
  ; Write install path hint for first-run wizard auto-detection
  WriteRegStr HKCU "Software\PitForge\Link" "InstallPath" "$INSTDIR"
!macroend

!macro customUnInstall
  DeleteRegKey HKCU "Software\PitForge\Link"
!macroend
