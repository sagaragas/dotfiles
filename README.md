# dotfiles

Factory AI-themed configs for macOS and Linux.

## What's included

| Component | Config | Notes |
|-----------|--------|-------|
| **Ghostty** | `ghostty/` | Custom Factory color theme |
| **Kitty** | `kitty/` | Factory theme + custom Python tab bar |
| **Tmux** | `tmux/` | Orange status bar, Factory pane borders |
| **Zsh** | `shell/zshrc` | Factory prompt, ls/grep/man/diff colors |
| **Bash** | `shell/bashrc` | Same as zsh, for headless Linux boxes |
| **Obsidian** | `obsidian/` | Factory theme (dark+light), callouts, plugins |
| **Fonts** | auto-downloaded | Geist + Geist Mono (Vercel) |

## Install

```bash
git clone https://github.com/sagaragas/dotfiles.git ~/dotfiles
cd ~/dotfiles
./install.sh
```

Optional: pass a custom vault path (default is `~/notes/Home`):

```bash
./install.sh ~/my-vault
```

The script detects the OS and skips GUI apps (ghostty, kitty, obsidian) on headless Linux. Fonts go to `~/Library/Fonts` on macOS and `~/.local/share/fonts` on Linux.

## Color palette

All configs share the same Factory AI palette:

| Role | Hex |
|------|-----|
| Accent (orange) | `#ef6f2e` |
| Background | `#020202` |
| Surface | `#1f1d1c` |
| Border | `#3d3a39` |
| Text | `#d6d3d2` |
| Muted | `#8a8380` |

## Structure

```
dotfiles/
├── install.sh           # OS-aware installer
├── ghostty/
│   ├── config
│   └── factory          # color theme
├── kitty/
│   ├── kitty.conf
│   ├── factory-theme.conf
│   └── factory-tab_bar.py
├── shell/
│   ├── zshrc
│   ├── zshenv
│   ├── zprofile
│   └── bashrc
├── tmux/
│   └── tmux.conf
└── obsidian/
    ├── factory-theme.css
    ├── factory-callouts.css
    ├── factory-droids-plugin/
    ├── configs/
    └── templates/
```
