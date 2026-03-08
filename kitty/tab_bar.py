from kitty.boss import get_boss
from kitty.fast_data_types import Screen, add_timer
from kitty.tab_bar import DrawData, ExtraData, TabBarData, as_rgb, draw_title

PALETTE = [
    {"bg": "#f38ba8", "fg": "#1e1e2e"},  # red
    {"bg": "#a6e3a1", "fg": "#1e1e2e"},  # green
    {"bg": "#89b4fa", "fg": "#1e1e2e"},  # blue
    {"bg": "#f9e2af", "fg": "#1e1e2e"},  # yellow
    {"bg": "#cba6f7", "fg": "#1e1e2e"},  # mauve
    {"bg": "#94e2d5", "fg": "#1e1e2e"},  # teal
    {"bg": "#fab387", "fg": "#1e1e2e"},  # peach
    {"bg": "#f5c2e7", "fg": "#1e1e2e"},  # pink
    {"bg": "#74c7ec", "fg": "#1e1e2e"},  # sapphire
]

DIM_FACTOR = 0.45

def _hex_to_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def _dim_rgb(r, g, b, factor):
    return int(r * factor), int(g * factor), int(b * factor)

def _rgb_int(r, g, b):
    return (r << 16) | (g << 8) | b

def draw_tab(
    draw_data: DrawData,
    screen: Screen,
    tab: TabBarData,
    before: int,
    max_tab_length: int,
    index: int,
    is_last: bool,
    extra_data: ExtraData,
) -> int:
    colors = PALETTE[(index - 1) % len(PALETTE)]
    bg_r, bg_g, bg_b = _hex_to_rgb(colors["bg"])
    fg_r, fg_g, fg_b = _hex_to_rgb(colors["fg"])

    if tab.is_active:
        bg = as_rgb(_rgb_int(bg_r, bg_g, bg_b))
        fg = as_rgb(_rgb_int(fg_r, fg_g, fg_b))
    else:
        dr, dg, db = _dim_rgb(bg_r, bg_g, bg_b, DIM_FACTOR)
        bg = as_rgb(_rgb_int(dr, dg, db))
        fg = as_rgb(_rgb_int(220, 220, 220))

    draw_data = draw_data._replace(
        active_bg=bg, active_fg=fg,
        inactive_bg=bg, inactive_fg=fg,
    )

    return draw_title(draw_data, screen, tab, index, max_tab_length)
