# Changelog

## Unreleased
### Added
- Real end of session alerts (chime sound + OS notification)
- Document title now flashes when a session ends and the tab isn't focused
### Fixed
- GitHub Pages deploy workflow could get stuck queued indefinitely; added a configure-pages step
### Changed
- Save format bumped to v3, old skill tree data is dropped on load
### Removed
- Skill tree and skill points, pending a rebuild

## v0.6.0 - May 10, 2026
### Added
- Centralized localStorage save/load logic with versioned migration (v1 → v2 save format), covering pomo sessions and adventure log
### Changed
- Replaced scattered localStorage reads/writes across the app with the new centralized storage module
- Cleaned up remaining `any` types in favor of `unknown` + type guards

## v0.5.0 - May 5, 2026
### Added
- Dark mode toggle
- Boss fight roll numbers shown in break summary results
### Changed
- Boss encounters now shown alongside regular run info in the break summary instead of replacing it
- Reset button now only clears pomoRPG prefixed keys, avoiding unrelated localStorage data
### Fixed
- Typo in adventure log aria-label

## v0.2.1 - April 13, 2026
### Added
- Hardcore mode: 5 minute locked break period
- Status line showing whether the current run is still "clean" while the timer is ticking

## v0.2.0 - April 11, 2026
### Added
- Hardcore mode toggle, clean run tracking, and break lock state (persisted to localStorage)
### Fixed
- Pausing or resetting the focus timer now correctly marks the run as unclean

## v0.1.3 - April 10, 2026
### Changed
- Expanded README with setup/usage instructions

## v0.1.2 - April 8, 2026
### Added
- Reset button to clear all progress (with confirmation)
- This changelog

## v0.1.1 - April 7, 2026
### Added
- Adventure log collapse/expand functionality

## v0.1.0
- Initial preview release (Pomodoro timer + XP + skill tree + adventure log)
