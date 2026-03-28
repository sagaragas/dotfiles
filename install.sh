#!/usr/bin/env bash
set -euo pipefail

DOTFILES_DIR="$(cd "$(dirname "$0")" && pwd)"

link() {
  local src="$1" dst="$2"
  mkdir -p "$(dirname "$dst")"
  if [ -L "$dst" ]; then
    rm "$dst"
  elif [ -e "$dst" ]; then
    echo "backing up $dst -> ${dst}.bak"
    mv "$dst" "${dst}.bak"
  fi
  ln -s "$src" "$dst"
  echo "linked $dst -> $src"
}

# ─── Ghostty ────────────────────────────────────────────────────────────
link "$DOTFILES_DIR/ghostty/config" "$HOME/.config/ghostty/config"
mkdir -p "$HOME/.config/ghostty/themes"
cp "$DOTFILES_DIR/ghostty/factory" "$HOME/.config/ghostty/themes/factory"
echo "copied ghostty factory theme"

# ─── Kitty ──────────────────────────────────────────────────────────────
link "$DOTFILES_DIR/kitty/kitty.conf"          "$HOME/.config/kitty/kitty.conf"
link "$DOTFILES_DIR/kitty/factory-tab_bar.py"  "$HOME/.config/kitty/tab_bar.py"
link "$DOTFILES_DIR/kitty/factory-theme.conf"  "$HOME/.config/kitty/factory-theme.conf"

# ─── Shell ──────────────────────────────────────────────────────────────
link "$DOTFILES_DIR/shell/zshrc"    "$HOME/.zshrc"
link "$DOTFILES_DIR/shell/zshenv"   "$HOME/.zshenv"
link "$DOTFILES_DIR/shell/zprofile" "$HOME/.zprofile"
link "$DOTFILES_DIR/shell/bashrc"   "$HOME/.bashrc"

# ─── Tmux ───────────────────────────────────────────────────────────────
link "$DOTFILES_DIR/tmux/tmux.conf" "$HOME/.tmux.conf"

# ─── Fonts (Geist) ─────────────────────────────────────────────────────
if [ ! -f "$HOME/Library/Fonts/GeistMono-Regular.otf" ]; then
  echo "installing Geist fonts..."
  TMPDIR=$(mktemp -d)
  curl -sL "https://github.com/vercel/geist-font/releases/download/1.8.0/geist-font-1.8.0.zip" \
    -o "$TMPDIR/geist.zip"
  unzip -qo "$TMPDIR/geist.zip" -d "$TMPDIR/geist"
  cp "$TMPDIR"/geist/geist-font-*/fonts/Geist/otf/*.otf "$HOME/Library/Fonts/"
  cp "$TMPDIR"/geist/geist-font-*/fonts/GeistMono/otf/*.otf "$HOME/Library/Fonts/"
  rm -rf "$TMPDIR"
  echo "installed Geist + Geist Mono fonts"
else
  echo "Geist fonts already installed"
fi

echo ""
echo "done. restart terminal + obsidian to apply."
echo ""
echo "manual steps:"
echo "  1. open obsidian, enable community plugins, enable: factory-droids, obsidian-hider, calendar-beta, obsidian-style-settings, obsidian-kanban"
echo "  2. tmux: run 'tmux source-file ~/.tmux.conf'"
