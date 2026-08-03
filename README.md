# dotfiles

Factory AI-themed configs for macOS and Linux.

## What's included

| Component | Config | Notes |
|-----------|--------|-------|
| **Ghostty** | `ghostty/` | Moonfly color theme |
| **Kitty** | `kitty/` | Factory theme + custom Python tab bar |
| **Tmux** | `tmux/` | Moonfly status bar and pane borders |
| **Zsh** | `shell/zshrc` | Moonfly prompt, ls/grep/man/diff colors |
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

Terminal configs (ghostty, kitty, tmux, zsh, bash) share the Moonfly palette:

| Role | Hex |
|------|-----|
| Accent (blue) | `#74b2ff` |
| Background | `#080808` |
| Surface / border | `#323437` |
| Text | `#bdbdbd` |
| Muted | `#949494` |
| Cursor | `#9e9e9e` |
| Selection | `#b2ceee` |

ANSI slots:

| Slot | Normal | Bright |
|------|--------|--------|
| black | `#323437` | `#949494` |
| red | `#ff5454` | `#ff5189` |
| green | `#8cc85f` | `#36c692` |
| yellow | `#e3c78a` | `#c6c684` |
| blue | `#80a0ff` | `#74b2ff` |
| magenta | `#cf87e8` | `#ae81ff` |
| cyan | `#79dac8` | `#85dc85` |
| white | `#c6c6c6` | `#e4e4e4` |

The Obsidian theme is independent and keeps the Factory AI palette (`#ef6f2e` accent on `#020202`).

## Structure

```
dotfiles/
├── install.sh           # OS-aware installer
├── ghostty/
│   ├── config
│   └── moonfly          # color theme
├── kitty/
│   ├── kitty.conf
│   ├── moonfly.conf     # color theme
│   └── tab_bar.py
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
