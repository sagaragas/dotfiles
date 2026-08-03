# Agents

Instructions for AI coding agents working in this repo.

## Overview

This is a dotfiles repo. Configs are stored here and copied to their destinations by `install.sh`. There are no symlinks -- the installer overwrites target files.

## Conventions

- **Color palette**: Terminal configs (ghostty, kitty, tmux, zshrc, bashrc) use Moonfly. Accent is `#74b2ff` (blue), background `#080808`, surface `#323437`, text `#bdbdbd`, muted `#949494`. The obsidian theme is separate and still uses the Factory AI palette (`#ef6f2e` on `#020202`). See the palette tables in README.md.
- **Fonts**: Geist (sans) and Geist Mono (ghostty), JetBrains Mono (kitty). install.sh installs all three. Never reference Nerd Font variants.
- **No symlinks**: `install.sh` uses `cp -f`, not `ln -s`.
- **OS-aware**: The installer detects `Darwin` vs `Linux`. GUI app configs (ghostty, kitty, obsidian) are skipped on headless Linux. Zsh configs are skipped if zsh isn't installed.
- **Shell parity**: `zshrc` and `bashrc` should have the same color environment (ls, grep, man, diff). The zsh version has zsh-specific features (completion styles, `%~` prompt). The bash version uses GNU equivalents (`ls --color=auto`, `\w` prompt, `shopt`).
- **No personal aliases**: Aliases that reference private hosts, IPs, or paths never go in the repo. `zshrc`/`bashrc` source `~/.aliases.local` if it exists; `shell/aliases.local.example` is the template. Keep repo files free of usernames, home paths, and internal hostnames too.

## File layout

```
ghostty/config         → ~/.config/ghostty/config
ghostty/moonfly        → ~/.config/ghostty/themes/moonfly
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
- The obsidian Factory Droids plugin lives in `obsidian/factory-droids-plugin/`. It's a TypeScript project built with esbuild. The installer copies source to the vault and runs `npm install && npm run build`.
- Don't commit `.DS_Store`, `.entire/`, `.factory/`, or `.conductor/` (covered by `.gitignore`).
