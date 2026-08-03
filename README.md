# dotfiles

Factory AI-themed configs for macOS and Linux.

## What's included

| Component | Config | Notes |
|-----------|--------|-------|
| **Ghostty** | `ghostty/` | Factory color theme |
| **Kitty** | `kitty/` | Factory theme + custom Python tab bar |
| **Tmux** | `tmux/` | Factory status bar and pane borders |
| **Zsh** | `shell/zshrc` | Factory prompt, ls/grep/man/diff colors |
| **Bash** | `shell/bashrc` | Same as zsh, for headless Linux boxes |
| **Obsidian** | `obsidian/` | Factory theme (dark+light), callouts, plugins |
| **Fonts** | auto-downloaded | JetBrains Mono |

## Install

```bash
git clone https://github.com/sagaragas/dotfiles.git ~/dotfiles
cd ~/dotfiles
./install.sh
```

Optional: pass a custom vault path (default is `~/notes/Work`):

```bash
./install.sh ~/my-vault
```

Every run starts with a check report (in sync / would overwrite / new)
and asks before changing anything. Flags: `--check` prints the report
and exits without touching anything, `-y` skips the prompt.

## Updating an existing machine

```bash
cd ~/dotfiles
git pull
./install.sh
```

Everything is idempotent: files already in sync are skipped, fonts and
plugins are only fetched when missing, and personal aliases in
`~/.aliases.local` are never touched.

The script detects the OS and skips GUI apps (ghostty, kitty, obsidian) on headless Linux. Fonts go to `~/Library/Fonts` on macOS and `~/.local/share/fonts` on Linux.

## Color palette

Everything (terminals, tmux, shell, obsidian) shares the Factory AI palette:

| Role | Hex |
|------|-----|
| Accent (orange) | `#ef6f2e` |
| Background | `#020202` |
| Surface / border | `#1f1d1c` |
| Text | `#d6d3d2` |
| Muted | `#8a8380` |
| Cursor | `#ef6f2e` |
| Selection | `#ef6f2e` |

ANSI slots:

| Slot | Normal | Bright |
|------|--------|--------|
| black | `#1f1d1c` | `#5c5855` |
| red | `#f87171` | `#fca5a5` |
| green | `#34d399` | `#6ee7b7` |
| yellow | `#ef6f2e` | `#ffb86c` |
| blue | `#60a5fa` | `#93c5fd` |
| magenta | `#c084fc` | `#d8b4fe` |
| cyan | `#22d3ee` | `#67e8f9` |
| white | `#d6d3d2` | `#eae7e6` |

## Structure

```
dotfiles/
├── install.sh           # OS-aware installer
├── ghostty/
│   ├── config
│   └── factory          # color theme
├── kitty/
│   ├── kitty.conf
│   ├── factory-theme.conf  # color theme
│   ├── tab_bar.py
│   └── window_title_bar.py
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
    ├── configs/
    └── templates/
```
