# Agents

Instructions for AI coding agents working in this repo.

## Overview

This is a dotfiles repo. Configs are stored here and copied to their destinations by `install.sh`. There are no symlinks -- the installer overwrites target files.

## Conventions

- **Color palette**: Everything (ghostty, kitty, tmux, zshrc, bashrc, obsidian) uses the Factory AI palette. Accent is `#ef6f2e` (orange), background `#020202`, surface `#1f1d1c`, text `#d6d3d2`, muted `#8a8380`. See the palette tables in README.md.
- **Fonts**: JetBrains Mono everywhere mono (kitty, ghostty, obsidian). Obsidian UI uses system sans (SF Pro). install.sh installs JetBrains Mono. Never reference Nerd Font variants.
- **No symlinks**: `install.sh` uses `cp -f`, not `ln -s`.
- **OS-aware**: The installer detects `Darwin` vs `Linux`. GUI app configs (ghostty, kitty, obsidian) are skipped on headless Linux. Zsh configs are skipped if zsh isn't installed.
- **Shell parity**: `zshrc` and `bashrc` should have the same color environment (ls, grep, man, diff). The zsh version has zsh-specific features (completion styles, `%~` prompt). The bash version uses GNU equivalents (`ls --color=auto`, `\w` prompt, `shopt`).
- **No personal aliases**: Aliases that reference private hosts, IPs, or paths never go in the repo. `zshrc`/`bashrc` source `~/.aliases.local` if it exists; `shell/aliases.local.example` is the template. Keep repo files free of usernames, home paths, and internal hostnames too.

## File layout

```
ghostty/config         → ~/.config/ghostty/config
ghostty/factory        → ~/.config/ghostty/themes/factory
kitty/kitty.conf       → ~/.config/kitty/kitty.conf
kitty/factory-theme.conf → ~/.config/kitty/factory-theme.conf
kitty/tab_bar.py       → ~/.config/kitty/tab_bar.py
kitty/window_title_bar.py → ~/.config/kitty/window_title_bar.py
shell/zshrc            → ~/.zshrc
shell/zshenv           → ~/.zshenv
shell/zprofile         → ~/.zprofile
shell/bashrc           → ~/.bashrc
shell/aliases.local.example → template for ~/.aliases.local (copied manually, never committed)
tmux/tmux.conf         → ~/.tmux.conf
obsidian/*             → ~/notes/Work/.obsidian/  (override with ./install.sh <vault>)
```

## Rules

- Keep color values consistent across the terminal configs. If the terminal accent changes, update ghostty, kitty (including `tab_bar.py`), tmux, zshrc, and bashrc together.
- Don't add dependencies that aren't already used. The shell configs have zero external dependencies beyond coreutils.
- `install.sh` output uses Factory-colored formatting (orange headers, green checkmarks). Maintain the `header()`, `ok()`, `skip()`, `info()` functions.
- Don't commit `.DS_Store`, `.entire/`, `.factory/`, or `.conductor/` (covered by `.gitignore`).
