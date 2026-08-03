from kitty.boss import get_boss
from kitty.fast_data_types import Screen, add_timer
from kitty.tab_bar import DrawData, ExtraData, TabBarData, as_rgb, draw_title

# Factory palette
PALETTE = [
    {"bg": "#ef6f2e", "fg": "#020202"},  # orange
    {"bg": "#ffb86c", "fg": "#020202"},  # light orange
    {"bg": "#34d399", "fg": "#020202"},  # green
    {"bg": "#60a5fa", "fg": "#020202"},  # blue
    {"bg": "#c084fc", "fg": "#020202"},  # magenta
    {"bg": "#22d3ee", "fg": "#020202"},  # cyan
    {"bg": "#f87171", "fg": "#020202"},  # red
    {"bg": "#6ee7b7", "fg": "#020202"},  # mint
    {"bg": "#93c5fd", "fg": "#020202"},  # light blue
]

DIM_FACTOR = 0.4
INACTIVE_FG = (138, 131, 128)

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
        fg = as_rgb(_rgb_int(*INACTIVE_FG))

    draw_data = draw_data._replace(
        active_bg=bg, active_fg=fg,
        inactive_bg=bg, inactive_fg=fg,
    )

    return draw_title(draw_data, screen, tab, index, max_tab_length)
