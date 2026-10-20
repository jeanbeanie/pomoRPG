# PomoRPG

> Have you done your part in the war against procrastination?

## Overview

PomoRPG is a gamified pomodoro productivity tool inspired by Role Playing Games (RPGs). Set a timer dedicated to completing tasks without distraction while your loyal adventurer battles monsters and completes quests in the background. Staying focused rewards you with experience points (XP).

**Current Version:** 0.6.0

## Features

- **Pomodoro Timer** - Focus sessions with customizable work/break intervals
- **XP System** - Earn experience points for completed pomodoro cycles
- **Adventure System** - Your adventurer battles monsters while you work
- **Boss Battles** - Every 4 pomodoro cycles triggers special encounters with bonus rewards
- **Streak Tracking** - Monitor and maintain daily consistency
- **Adventure Log** - Review your progress and achievements

## How to Use

1. **Choose Your Quest** - Select a project or task you want to work on
2. **Start Your Timer** - Set a pomodoro (default: 25 minutes) and work without distractions
3. **Adventure Unfolds** - Your adventurer battles monsters while you maintain focus
4. **Earn Rewards** - Complete the cycle to earn XP and check your adventure log
5. **Face Bosses** - Every 4th pomodoro triggers a boss battle with bonus XP and rewards
6. **Build Momentum** - Repeat to develop consistency and focus over time

### Hardcore Mode

For an extra challenge, enable hardcore mode with strict rules:
- Fixed 5-minute break periods only
- Timer pausing disabled
- "Clean runs" earn special bonuses and badges in your adventure log

## Status

Essential features are functional. The core loop is ready to help build consistency and focus, with many enhancements planned.

## Roadmap

- [ ] Enhanced adventure log with richer flavor text
- [ ] Project suggestions based on work history
- [ ] Boss battle summary screens and specialized bonuses
- [ ] Weekly milestone bonuses for long-term goal progression
- [ ] Full hardcore mode implementation
- [ ] Clean run achievement system with tiered rewards
- [ ] Visual polish: animations and sound effects
- [ ] Rebuild the skill tree from scratch
- [ ] Automated tests and a lint step in CI
- [ ] Break up App.tsx into smaller screen components

## Known Issues

- [ ] Tab title flash on session end likely stops almost immediately
- [ ] `accountXpBoost` upgrade has no effect
- [ ] Skipping the upgrade choice applies the attack upgrade automatically
- [ ] Gold is earned but never saved or spent
- [ ] Boss fights give no rewards (the Features list claims bonus XP)
- [ ] Normal breaks have no break timer, only hardcore breaks do
- [ ] `loadSave` writes to localStorage on every read, and `getBossProgress` calls it on every render
- [ ] Reset Data clears storage twice (`resetSave` and `resetPomoRpgStorage` overlap)

---

**Remember:** Every pomodoro cycle completed is a win.