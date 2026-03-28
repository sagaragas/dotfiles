#!/usr/bin/env bash
set -euo pipefail

DOTFILES="$(cd "$(dirname "$0")" && pwd)"
VAULT="${1:-$HOME/notes/Home}"
OS="$(uname -s)"

# ── Colors ──────────────────────────────────────────────────────────────
R='\033[0m'
O='\033[38;2;239;111;46m'  # factory orange
G='\033[38;2;52;211;153m'  # green
D='\033[38;2;138;131;128m' # dim
W='\033[38;2;214;211;210m' # white

header()  { printf "\n${O}━━━ %s${R}\n" "$1"; }
ok()      { printf "  ${G}✓${R} %s\n" "$1"; }
skip()    { printf "  ${D}· %s (skipped)${R}\n" "$1"; }
info()    { printf "  ${D}%s${R}\n" "$1"; }

printf "\n"
printf "  ${O}┌──────────────────────────────────┐${R}\n"
printf "  ${O}│${W}  Sagar's Dotfiles                ${O}│${R}\n"
printf "  ${O}│${D}  %-33s${O}│${R}\n" "$OS"
printf "  ${O}└──────────────────────────────────┘${R}\n"

# ── Helpers ─────────────────────────────────────────────────────────────
put() {
  mkdir -p "$(dirname "$2")"
  cp -f "$1" "$2"
}

has() { command -v "$1" &>/dev/null; }

download_plugin() {
  local repo="$1" dir="$2"
  mkdir -p "$dir"
  curl -sL "https://github.com/$repo/releases/latest/download/main.js"       -o "$dir/main.js"
  curl -sL "https://github.com/$repo/releases/latest/download/manifest.json" -o "$dir/manifest.json"
  curl -sL "https://github.com/$repo/releases/latest/download/styles.css"    -o "$dir/styles.css" 2>/dev/null || true
}

# ── Fonts ───────────────────────────────────────────────────────────────
header "Fonts"
[ "$OS" = "Darwin" ] && FONT_DIR="$HOME/Library/Fonts" || FONT_DIR="$HOME/.local/share/fonts"

if [ ! -f "$FONT_DIR/GeistMono-Regular.otf" ]; then
  TMPD=$(mktemp -d)
  curl -sL "https://github.com/vercel/geist-font/releases/download/1.8.0/geist-font-1.8.0.zip" -o "$TMPD/geist.zip"
  unzip -qo "$TMPD/geist.zip" -d "$TMPD/geist"
  mkdir -p "$FONT_DIR"
  cp "$TMPD"/geist/geist-font-*/fonts/Geist/otf/*.otf     "$FONT_DIR/"
  cp "$TMPD"/geist/geist-font-*/fonts/GeistMono/otf/*.otf "$FONT_DIR/"
  rm -rf "$TMPD"
  [ "$OS" = "Linux" ] && has fc-cache && fc-cache -f "$FONT_DIR"
  ok "Geist + Geist Mono"
else
  ok "Geist fonts already installed"
fi

# ── Ghostty ─────────────────────────────────────────────────────────────
header "Ghostty"
if [ "$OS" = "Darwin" ] || has ghostty; then
  put "$DOTFILES/ghostty/config" "$HOME/.config/ghostty/config"
  mkdir -p "$HOME/.config/ghostty/themes"
  cp -f "$DOTFILES/ghostty/factory" "$HOME/.config/ghostty/themes/factory"
  ok "config + factory theme"
else
  skip "not installed"
fi

# ── Kitty ───────────────────────────────────────────────────────────────
header "Kitty"
if [ "$OS" = "Darwin" ] || has kitty; then
  put "$DOTFILES/kitty/kitty.conf"         "$HOME/.config/kitty/kitty.conf"
  put "$DOTFILES/kitty/factory-tab_bar.py" "$HOME/.config/kitty/tab_bar.py"
  put "$DOTFILES/kitty/factory-theme.conf" "$HOME/.config/kitty/factory-theme.conf"
  ok "config + factory theme + tab bar"
else
  skip "not installed"
fi

# ── Shell ───────────────────────────────────────────────────────────────
header "Shell"
if has zsh; then
  put "$DOTFILES/shell/zshrc"    "$HOME/.zshrc"
  put "$DOTFILES/shell/zshenv"   "$HOME/.zshenv"
  put "$DOTFILES/shell/zprofile" "$HOME/.zprofile"
  ok "zshrc, zshenv, zprofile"
else
  skip "zsh not found"
fi
put "$DOTFILES/shell/bashrc" "$HOME/.bashrc"
ok "bashrc"

# ── Tmux ────────────────────────────────────────────────────────────────
header "Tmux"
put "$DOTFILES/tmux/tmux.conf" "$HOME/.tmux.conf"
ok "tmux.conf"

# ── Obsidian ────────────────────────────────────────────────────────────
header "Obsidian"
if [ "$OS" = "Darwin" ] || has obsidian || [ -d "$VAULT/.obsidian" ]; then
  OBS="$VAULT/.obsidian"
  PLUG="$OBS/plugins"

  # theme + snippets
  mkdir -p "$OBS/themes/Factory" "$OBS/snippets"
  cp -f "$DOTFILES/obsidian/factory-theme.css"           "$OBS/themes/Factory/theme.css"
  cp -f "$DOTFILES/obsidian/factory-theme-manifest.json" "$OBS/themes/Factory/manifest.json"
  cp -f "$DOTFILES/obsidian/factory-callouts.css"        "$OBS/snippets/factory-callouts.css"
  ok "Factory theme + callouts"

  # configs
  cp -f "$DOTFILES/obsidian/configs/appearance.json"        "$OBS/"
  cp -f "$DOTFILES/obsidian/configs/community-plugins.json" "$OBS/"
  cp -f "$DOTFILES/obsidian/configs/daily-notes.json"       "$OBS/"
  ok "appearance, plugins, daily-notes"

  # community plugins
  download_plugin "kepano/obsidian-hider"               "$PLUG/obsidian-hider"
  cp -f "$DOTFILES/obsidian/configs/hider.json"         "$PLUG/obsidian-hider/data.json"
  download_plugin "liamcain/obsidian-calendar-plugin"    "$PLUG/calendar-beta"
  download_plugin "mgmeyers/obsidian-style-settings"     "$PLUG/obsidian-style-settings"
  cp -f "$DOTFILES/obsidian/configs/style-settings.json" "$PLUG/obsidian-style-settings/data.json"
  download_plugin "mgmeyers/obsidian-kanban"             "$PLUG/obsidian-kanban"
  ok "hider, calendar, style-settings, kanban"

  # factory-droids plugin
  FD="$PLUG/factory-droids"
  mkdir -p "$FD/src/views"
  for f in package.json manifest.json tsconfig.json esbuild.config.mjs styles.css; do
    cp -f "$DOTFILES/obsidian/factory-droids-plugin/$f" "$FD/"
  done
  cp "$DOTFILES"/obsidian/factory-droids-plugin/src/*.ts       "$FD/src/"
  cp "$DOTFILES"/obsidian/factory-droids-plugin/src/views/*.ts "$FD/src/views/"
  if has npm; then
    (cd "$FD" && npm install --silent 2>/dev/null && npm run build 2>/dev/null)
    ok "factory-droids plugin (built)"
  else
    info "factory-droids plugin (npm not found, build manually)"
  fi

  # vault folders
  mkdir -p "$VAULT"/{Daily,Templates,Projects,Areas,Resources,Archive,Clippings}
  [ ! -f "$VAULT/Templates/Daily Note.md" ] && \
    cp "$DOTFILES/obsidian/templates/Daily Note.md" "$VAULT/Templates/Daily Note.md"
  ok "vault structure"
else
  skip "not installed"
fi

# ── Done ────────────────────────────────────────────────────────────────
NEXT="restart terminal"
([ "$OS" = "Darwin" ] || has obsidian || [ -d "$VAULT/.obsidian" ]) && NEXT="restart terminal + obsidian"

printf "\n"
printf "  ${G}┌──────────────────────────────────┐${R}\n"
printf "  ${G}│${W}  done — ${D}%-24s${G}│${R}\n" "$NEXT"
printf "  ${G}└──────────────────────────────────┘${R}\n"
printf "\n"
