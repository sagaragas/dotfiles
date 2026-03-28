# Agents

Instructions for AI coding agents working in this repo.

## Overview

This is a dotfiles repo. Configs are stored here and copied to their destinations by `install.sh`. There are no symlinks -- the installer overwrites target files.

## Conventions

- **Color palette**: All configs use the Factory AI palette. Primary accent is `#ef6f2e` (orange). Background is `#020202`. See the palette table in README.md.
- **Fonts**: Geist (sans) and Geist Mono. Never reference Nerd Font variants -- they're not installed.
- **No symlinks**: `install.sh` uses `cp -f`, not `ln -s`.
- **OS-aware**: The installer detects `Darwin` vs `Linux`. GUI app configs (ghostty, kitty, obsidian) are skipped on headless Linux. Zsh configs are skipped if zsh isn't installed.
- **Shell parity**: `zshrc` and `bashrc` should have the same color environment (ls, grep, man, diff). The zsh version has zsh-specific features (completion styles, `%~` prompt). The bash version uses GNU equivalents (`ls --color=auto`, `\w` prompt, `shopt`).

## File layout

```
ghostty/config         → ~/.config/ghostty/config
ghostty/factory        → ~/.config/ghostty/themes/factory
kitty/kitty.conf       → ~/.config/kitty/kitty.conf
kitty/factory-theme.conf → ~/.config/kitty/factory-theme.conf
kitty/factory-tab_bar.py → ~/.config/kitty/tab_bar.py
shell/zshrc            → ~/.zshrc
shell/zshenv           → ~/.zshenv
shell/zprofile         → ~/.zprofile
shell/bashrc           → ~/.bashrc
tmux/tmux.conf         → ~/.tmux.conf
obsidian/*             → ~/notes/Home/.obsidian/
```

## Rules

- Keep color values consistent across all configs. If the accent changes, update ghostty, kitty, tmux, zshrc, bashrc, and the obsidian theme.
- Don't add dependencies that aren't already used. The shell configs have zero external dependencies beyond coreutils.
- `install.sh` output uses Factory-colored formatting (orange headers, green checkmarks). Maintain the `header()`, `ok()`, `skip()`, `info()` functions.
- The obsidian Factory Droids plugin lives in `obsidian/factory-droids-plugin/`. It's a TypeScript project built with esbuild. The installer copies source to the vault and runs `npm install && npm run build`.
- Don't commit `.DS_Store`, `.entire/`, `.factory/`, or `.conductor/` (covered by `.gitignore`).
