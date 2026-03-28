#!/usr/bin/env bash
set -euo pipefail

DOTFILES_DIR="$(cd "$(dirname "$0")" && pwd)"
VAULT="${1:-$HOME/notes/Home}"

echo "┌─────────────────────────────────────┐"
echo "│  Sagar's Dotfiles                   │"
echo "│  vault: $VAULT"
echo "└─────────────────────────────────────┘"
echo ""

install() {
  local src="$1" dst="$2"
  mkdir -p "$(dirname "$dst")"
  cp -f "$src" "$dst"
  echo "  wrote $dst"
}

download_plugin() {
  local repo="$1" dir="$2"
  mkdir -p "$dir"
  echo "  downloading $repo..."
  curl -sL "https://github.com/$repo/releases/latest/download/main.js" -o "$dir/main.js"
  curl -sL "https://github.com/$repo/releases/latest/download/manifest.json" -o "$dir/manifest.json"
  curl -sL "https://github.com/$repo/releases/latest/download/styles.css" -o "$dir/styles.css" 2>/dev/null || true
}

# ═══════════════════════════════════════════════════════════════════════
# 1. FONTS
# ═══════════════════════════════════════════════════════════════════════
echo "▸ fonts"
if [ ! -f "$HOME/Library/Fonts/GeistMono-Regular.otf" ]; then
  TMPD=$(mktemp -d)
  curl -sL "https://github.com/vercel/geist-font/releases/download/1.8.0/geist-font-1.8.0.zip" \
    -o "$TMPD/geist.zip"
  unzip -qo "$TMPD/geist.zip" -d "$TMPD/geist"
  mkdir -p "$HOME/Library/Fonts"
  cp "$TMPD"/geist/geist-font-*/fonts/Geist/otf/*.otf "$HOME/Library/Fonts/"
  cp "$TMPD"/geist/geist-font-*/fonts/GeistMono/otf/*.otf "$HOME/Library/Fonts/"
  rm -rf "$TMPD"
  echo "  installed Geist + Geist Mono (43 files)"
else
  echo "  Geist fonts already installed"
fi

# ═══════════════════════════════════════════════════════════════════════
# 2. TERMINAL — Ghostty
# ═══════════════════════════════════════════════════════════════════════
echo "▸ ghostty"
install "$DOTFILES_DIR/ghostty/config" "$HOME/.config/ghostty/config"
mkdir -p "$HOME/.config/ghostty/themes"
cp "$DOTFILES_DIR/ghostty/factory" "$HOME/.config/ghostty/themes/factory"
echo "  copied factory theme"

# ═══════════════════════════════════════════════════════════════════════
# 3. TERMINAL — Kitty
# ═══════════════════════════════════════════════════════════════════════
echo "▸ kitty"
install "$DOTFILES_DIR/kitty/kitty.conf"          "$HOME/.config/kitty/kitty.conf"
install "$DOTFILES_DIR/kitty/factory-tab_bar.py"  "$HOME/.config/kitty/tab_bar.py"
install "$DOTFILES_DIR/kitty/factory-theme.conf"  "$HOME/.config/kitty/factory-theme.conf"

# ═══════════════════════════════════════════════════════════════════════
# 4. SHELL
# ═══════════════════════════════════════════════════════════════════════
echo "▸ shell"
install "$DOTFILES_DIR/shell/zshrc"    "$HOME/.zshrc"
install "$DOTFILES_DIR/shell/zshenv"   "$HOME/.zshenv"
install "$DOTFILES_DIR/shell/zprofile" "$HOME/.zprofile"
install "$DOTFILES_DIR/shell/bashrc"   "$HOME/.bashrc"

# ═══════════════════════════════════════════════════════════════════════
# 5. TMUX
# ═══════════════════════════════════════════════════════════════════════
echo "▸ tmux"
install "$DOTFILES_DIR/tmux/tmux.conf" "$HOME/.tmux.conf"

# ═══════════════════════════════════════════════════════════════════════
# 6. OBSIDIAN — Theme + Snippets
# ═══════════════════════════════════════════════════════════════════════
echo "▸ obsidian theme"
OBSIDIAN_DIR="$VAULT/.obsidian"
mkdir -p "$OBSIDIAN_DIR/themes/Factory" "$OBSIDIAN_DIR/snippets"

cp "$DOTFILES_DIR/obsidian/factory-theme.css" "$OBSIDIAN_DIR/themes/Factory/theme.css"
cp "$DOTFILES_DIR/obsidian/factory-theme-manifest.json" "$OBSIDIAN_DIR/themes/Factory/manifest.json"
cp "$DOTFILES_DIR/obsidian/factory-callouts.css" "$OBSIDIAN_DIR/snippets/factory-callouts.css"
echo "  installed Factory theme + callouts snippet"

# ═══════════════════════════════════════════════════════════════════════
# 7. OBSIDIAN — Configs
# ═══════════════════════════════════════════════════════════════════════
echo "▸ obsidian configs"
cp "$DOTFILES_DIR/obsidian/configs/appearance.json" "$OBSIDIAN_DIR/appearance.json"
cp "$DOTFILES_DIR/obsidian/configs/community-plugins.json" "$OBSIDIAN_DIR/community-plugins.json"
cp "$DOTFILES_DIR/obsidian/configs/daily-notes.json" "$OBSIDIAN_DIR/daily-notes.json"
echo "  wrote appearance, community-plugins, daily-notes"

# ═══════════════════════════════════════════════════════════════════════
# 8. OBSIDIAN — Plugins (download from GitHub releases)
# ═══════════════════════════════════════════════════════════════════════
echo "▸ obsidian plugins"
PLUGINS_DIR="$OBSIDIAN_DIR/plugins"

download_plugin "kepano/obsidian-hider" "$PLUGINS_DIR/obsidian-hider"
mkdir -p "$PLUGINS_DIR/obsidian-hider"
cp "$DOTFILES_DIR/obsidian/configs/hider.json" "$PLUGINS_DIR/obsidian-hider/data.json"

download_plugin "liamcain/obsidian-calendar-plugin" "$PLUGINS_DIR/calendar-beta"

download_plugin "mgmeyers/obsidian-style-settings" "$PLUGINS_DIR/obsidian-style-settings"
cp "$DOTFILES_DIR/obsidian/configs/style-settings.json" "$PLUGINS_DIR/obsidian-style-settings/data.json"

download_plugin "mgmeyers/obsidian-kanban" "$PLUGINS_DIR/obsidian-kanban"

# ═══════════════════════════════════════════════════════════════════════
# 9. OBSIDIAN — Factory Droids Plugin (build from source)
# ═══════════════════════════════════════════════════════════════════════
echo "▸ factory-droids plugin"
FD_DIR="$PLUGINS_DIR/factory-droids"
mkdir -p "$FD_DIR/src/views"

cp "$DOTFILES_DIR/obsidian/factory-droids-plugin/package.json" "$FD_DIR/"
cp "$DOTFILES_DIR/obsidian/factory-droids-plugin/manifest.json" "$FD_DIR/"
cp "$DOTFILES_DIR/obsidian/factory-droids-plugin/tsconfig.json" "$FD_DIR/"
cp "$DOTFILES_DIR/obsidian/factory-droids-plugin/esbuild.config.mjs" "$FD_DIR/"
cp "$DOTFILES_DIR/obsidian/factory-droids-plugin/styles.css" "$FD_DIR/"
cp "$DOTFILES_DIR"/obsidian/factory-droids-plugin/src/*.ts "$FD_DIR/src/"
cp "$DOTFILES_DIR"/obsidian/factory-droids-plugin/src/views/*.ts "$FD_DIR/src/views/"

if command -v npm &>/dev/null; then
  echo "  installing deps + building..."
  (cd "$FD_DIR" && npm install --silent 2>/dev/null && npm run build 2>/dev/null)
  echo "  built main.js"
else
  echo "  ⚠ npm not found — run 'cd $FD_DIR && npm install && npm run build' manually"
fi

# ═══════════════════════════════════════════════════════════════════════
# 10. OBSIDIAN — Vault structure + templates (mkdir -p is safe, won't touch existing files)
# ═══════════════════════════════════════════════════════════════════════
echo "▸ vault structure"
mkdir -p "$VAULT/Daily" "$VAULT/Templates" "$VAULT/Projects" \
         "$VAULT/Areas" "$VAULT/Resources" "$VAULT/Archive" "$VAULT/Clippings"
# only write template if it doesn't exist
if [ ! -f "$VAULT/Templates/Daily Note.md" ]; then
  cp "$DOTFILES_DIR/obsidian/templates/Daily Note.md" "$VAULT/Templates/Daily Note.md"
  echo "  created daily note template"
else
  echo "  daily note template already exists, skipped"
fi
echo "  ensured folders exist"

# ═══════════════════════════════════════════════════════════════════════
# DONE
# ═══════════════════════════════════════════════════════════════════════
echo ""
echo "┌─────────────────────────────────────┐"
echo "│  ✓ done                             │"
echo "│  restart terminal + obsidian        │"
echo "│  enable community plugins in        │"
echo "│  obsidian settings (one-time)       │"
echo "└─────────────────────────────────────┘"
