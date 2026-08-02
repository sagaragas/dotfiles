#!/usr/bin/env bash
set -euo pipefail

DOTFILES="$(cd "$(dirname "$0")" && pwd)"
VAULT="${1:-$HOME/notes/Work}"
OS="$(uname -s)"

# ── Colors ──────────────────────────────────────────────────────────────
R='\033[0m'
O='\033[38;2;239;111;46m'
G='\033[38;2;52;211;153m'
D='\033[38;2;138;131;128m'
W='\033[38;2;214;211;210m'

header()  { printf "\n${O}━━━ %s${R}\n" "$1"; }
ok()      { printf "  ${G}✓${R} %s\n" "$1"; }
skip()    { printf "  ${D}· %s (skipped)${R}\n" "$1"; }
info()    { printf "  ${D}%s${R}\n" "$1"; }

# pad $1 to width $2 with trailing spaces
pad() {
  local text="$1" width="$2"
  printf "%s" "$text"
  local len=${#text}
  local i; for (( i=len; i<width; i++ )); do printf " "; done
}

BOX_W=34

printf "\n"
printf "  ${O}┌$(printf '─%.0s' $(seq 1 $BOX_W))┐${R}\n"
printf "  ${O}│${W}  $(pad "Sagar's Dotfiles" $((BOX_W - 2)))${O}│${R}\n"
printf "  ${O}│${D}  $(pad "$OS" $((BOX_W - 2)))${O}│${R}\n"
printf "  ${O}└$(printf '─%.0s' $(seq 1 $BOX_W))┘${R}\n"

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
  cp -f "$DOTFILES/ghostty/flexoki-light" "$HOME/.config/ghostty/themes/flexoki-light"
  ok "config + flexoki-light theme"
else
  skip "not installed"
fi

# ── Kitty ───────────────────────────────────────────────────────────────
header "Kitty"
if [ "$OS" = "Darwin" ] || has kitty; then
  put "$DOTFILES/kitty/kitty.conf"         "$HOME/.config/kitty/kitty.conf"
  put "$DOTFILES/kitty/tab_bar.py"         "$HOME/.config/kitty/tab_bar.py"
  put "$DOTFILES/kitty/flexoki-light.conf" "$HOME/.config/kitty/flexoki-light.conf"
  ok "config + flexoki-light theme + tab bar"
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
HAS_OBSIDIAN=false
if [ "$OS" = "Darwin" ] || has obsidian || [ -d "$VAULT/.obsidian" ]; then
  HAS_OBSIDIAN=true
  OBS="$VAULT/.obsidian"
  PLUG="$OBS/plugins"

  mkdir -p "$OBS/themes/Factory" "$OBS/snippets"
  cp -f "$DOTFILES/obsidian/factory-theme.css"           "$OBS/themes/Factory/theme.css"
  cp -f "$DOTFILES/obsidian/factory-theme-manifest.json" "$OBS/themes/Factory/manifest.json"
  cp -f "$DOTFILES/obsidian/factory-callouts.css"        "$OBS/snippets/factory-callouts.css"
  ok "Factory theme + callouts"

  cp -f "$DOTFILES/obsidian/configs/appearance.json"        "$OBS/"
  cp -f "$DOTFILES/obsidian/configs/community-plugins.json" "$OBS/"
  cp -f "$DOTFILES/obsidian/configs/daily-notes.json"       "$OBS/"
  ok "appearance, plugins, daily-notes"

  download_plugin "kepano/obsidian-hider"               "$PLUG/obsidian-hider"
  cp -f "$DOTFILES/obsidian/configs/hider.json"         "$PLUG/obsidian-hider/data.json"
  download_plugin "liamcain/obsidian-calendar-plugin"    "$PLUG/calendar-beta"
  download_plugin "mgmeyers/obsidian-style-settings"     "$PLUG/obsidian-style-settings"
  cp -f "$DOTFILES/obsidian/configs/style-settings.json" "$PLUG/obsidian-style-settings/data.json"
  download_plugin "mgmeyers/obsidian-kanban"             "$PLUG/obsidian-kanban"
  ok "hider, calendar, style-settings, kanban"

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

  mkdir -p "$VAULT"/{Daily,Templates,Projects,Areas,Resources,Archive,Clippings}
  [ ! -f "$VAULT/Templates/Daily Note.md" ] && \
    cp "$DOTFILES/obsidian/templates/Daily Note.md" "$VAULT/Templates/Daily Note.md"
  ok "vault structure"
else
  skip "not installed"
fi

# ── Done ────────────────────────────────────────────────────────────────
NEXT="restart terminal"
$HAS_OBSIDIAN && NEXT="restart terminal + obsidian"

printf "\n"
printf "  ${G}┌$(printf '─%.0s' $(seq 1 $BOX_W))┐${R}\n"
printf "  ${G}│${W}  $(pad "done" $((BOX_W - 2)))${G}│${R}\n"
printf "  ${G}│${D}  $(pad "$NEXT" $((BOX_W - 2)))${G}│${R}\n"
printf "  ${G}└$(printf '─%.0s' $(seq 1 $BOX_W))┘${R}\n"
printf "\n"
