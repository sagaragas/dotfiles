local wezterm = require("wezterm")
local act = wezterm.action
local config = wezterm.config_builder()

config.enable_kitty_keyboard = true

local function pathname(cwd)
  local fallback = os.getenv("HOME") or "/"

  if not cwd then
    return fallback
  end

  if type(cwd) == "string" then
    local path = cwd:match("^file://[^/]*(/.*)$") or cwd
    return path ~= "" and path or fallback
  end

  local ok, path = pcall(function()
    return cwd.file_path
  end)

  return ok and path or fallback
end

local function basename(path)
  return path:match("([^/]+)/?$") or path
end

-- ─── Visual ─────────────────────────────────────────────────────────────
config.font = wezterm.font("Geist Mono")
config.font_size = 13
config.window_padding = {
  left = 10,
  right = 10,
  top = 10,
  bottom = 10,
}
config.window_background_opacity = 0.95
config.macos_window_background_blur = 20
config.default_cursor_style = "SteadyBar"
config.scrollback_lines = 10000
config.window_close_confirmation = "NeverPrompt"

config.colors = {
  foreground = "#000000",
  background = "#fbf7f0",
  cursor_bg = "#d00000",
  cursor_fg = "#fbf7f0",
  cursor_border = "#d00000",
  selection_bg = "#c2bcb5",
  selection_fg = "#000000",
  split = "#d00000",
  ansi = {
    "#000000",
    "#a60000",
    "#006800",
    "#6f5500",
    "#0031a9",
    "#721045",
    "#005e8b",
    "#a6a6a6",
  },
  brights = {
    "#595959",
    "#972500",
    "#00663f",
    "#884900",
    "#3548cf",
    "#531ab6",
    "#005f5f",
    "#595959",
  },
  tab_bar = {
    background = "#fbf7f0",
    active_tab = {
      bg_color = "#d00000",
      fg_color = "#fbf7f0",
      intensity = "Bold",
    },
    inactive_tab = {
      bg_color = "#c2bcb5",
      fg_color = "#000000",
    },
    inactive_tab_hover = {
      bg_color = "#a6a6a6",
      fg_color = "#000000",
    },
    new_tab = {
      bg_color = "#fbf7f0",
      fg_color = "#000000",
    },
    new_tab_hover = {
      bg_color = "#c2bcb5",
      fg_color = "#000000",
    },
  },
}
config.inactive_pane_hsb = {
  saturation = 0.8,
  brightness = 0.7,
}

-- ─── Tabs / Panes ───────────────────────────────────────────────────────
config.use_fancy_tab_bar = false
config.hide_tab_bar_if_only_one_tab = false
config.tab_max_width = 48

wezterm.on("format-tab-title", function(tab)
  local cwd = tab.active_pane and tab.active_pane.current_working_dir
  return {
    { Text = string.format(" %d: %s ", tab.tab_index + 1, basename(pathname(cwd))) },
  }
end)

-- ─── Workspaces ─────────────────────────────────────────────────────────
local function switch_to_workspace(window, pane, name)
  if not name or name == "" then
    return
  end

  window:perform_action(
    act.SwitchToWorkspace({
      name = name,
      spawn = {
        cwd = pathname(pane:get_current_working_dir()),
      },
    }),
    pane
  )
end

-- ─── Keybindings ────────────────────────────────────────────────────────
config.leader = {
  key = "Space",
  mods = "CTRL",
  timeout_milliseconds = 1000,
}

config.keys = {
  { key = "Enter", mods = "CTRL", action = act.SendString("\x1b[13;5u") },
  { key = "Enter", mods = "SHIFT", action = act.SendString("\x1b[13;2u") },
  { key = "t", mods = "CMD", action = act.SpawnTab("CurrentPaneDomain") },
  { key = "w", mods = "CMD", action = act.CloseCurrentTab({ confirm = false }) },
  { key = "1", mods = "CMD", action = act.ActivateTab(0) },
  { key = "2", mods = "CMD", action = act.ActivateTab(1) },
  { key = "3", mods = "CMD", action = act.ActivateTab(2) },
  { key = "4", mods = "CMD", action = act.ActivateTab(3) },
  { key = "5", mods = "CMD", action = act.ActivateTab(4) },
  { key = "6", mods = "CMD", action = act.ActivateTab(5) },
  { key = "7", mods = "CMD", action = act.ActivateTab(6) },
  { key = "8", mods = "CMD", action = act.ActivateTab(7) },
  { key = "9", mods = "CMD", action = act.ActivateTab(8) },
  { key = "[", mods = "CMD|SHIFT", action = act.ActivateTabRelative(-1) },
  { key = "]", mods = "CMD|SHIFT", action = act.ActivateTabRelative(1) },
  { key = "LeftArrow", mods = "CMD|SHIFT", action = act.MoveTabRelative(-1) },
  { key = "RightArrow", mods = "CMD|SHIFT", action = act.MoveTabRelative(1) },
  {
    key = "d",
    mods = "CMD",
    action = act.SplitHorizontal({ domain = "CurrentPaneDomain" }),
  },
  {
    key = "d",
    mods = "CMD|SHIFT",
    action = act.SplitVertical({ domain = "CurrentPaneDomain" }),
  },
  { key = "h", mods = "LEADER", action = act.ActivatePaneDirection("Left") },
  { key = "j", mods = "LEADER", action = act.ActivatePaneDirection("Down") },
  { key = "k", mods = "LEADER", action = act.ActivatePaneDirection("Up") },
  { key = "l", mods = "LEADER", action = act.ActivatePaneDirection("Right") },
  { key = "H", mods = "LEADER|SHIFT", action = act.AdjustPaneSize({ "Left", 5 }) },
  { key = "J", mods = "LEADER|SHIFT", action = act.AdjustPaneSize({ "Down", 5 }) },
  { key = "K", mods = "LEADER|SHIFT", action = act.AdjustPaneSize({ "Up", 5 }) },
  { key = "L", mods = "LEADER|SHIFT", action = act.AdjustPaneSize({ "Right", 5 }) },
  { key = "z", mods = "LEADER", action = act.TogglePaneZoomState },
  { key = "x", mods = "LEADER", action = act.CloseCurrentPane({ confirm = false }) },
  { key = "w", mods = "LEADER", action = act.ShowLauncherArgs({ flags = "WORKSPACES" }) },
  {
    key = "n",
    mods = "LEADER",
    action = act.PromptInputLine({
      description = "New workspace name",
      action = wezterm.action_callback(switch_to_workspace),
    }),
  },
  { key = "r", mods = "LEADER", action = act.ReloadConfiguration },
}

-- ─── Status ─────────────────────────────────────────────────────────────
wezterm.on("update-status", function(window)
  window:set_right_status(string.format("%s  %s", window:active_workspace(), wezterm.strftime("%H:%M")))
end)

return config
