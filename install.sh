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

# kitty
link "$DOTFILES_DIR/kitty/kitty.conf" "$HOME/.config/kitty/kitty.conf"
link "$DOTFILES_DIR/kitty/tab_bar.py" "$HOME/.config/kitty/tab_bar.py"

# shell
link "$DOTFILES_DIR/shell/zshrc"    "$HOME/.zshrc"
link "$DOTFILES_DIR/shell/zshenv"   "$HOME/.zshenv"
link "$DOTFILES_DIR/shell/zprofile" "$HOME/.zprofile"
link "$DOTFILES_DIR/shell/bashrc"   "$HOME/.bashrc"

# tmux
link "$DOTFILES_DIR/tmux/tmux.conf" "$HOME/.tmux.conf"

echo "done"
