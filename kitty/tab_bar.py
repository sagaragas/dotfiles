from kitty.boss import get_boss
from kitty.fast_data_types import Screen, add_timer
from kitty.tab_bar import DrawData, ExtraData, TabBarData, as_rgb, draw_title

# Moonfly palette
PALETTE = [
    {"bg": "#74b2ff", "fg": "#080808"},  # blue
    {"bg": "#8cc85f", "fg": "#080808"},  # green
    {"bg": "#ae81ff", "fg": "#080808"},  # violet
    {"bg": "#cf87e8", "fg": "#080808"},  # magenta
    {"bg": "#ff5454", "fg": "#080808"},  # red
    {"bg": "#79dac8", "fg": "#080808"},  # cyan
    {"bg": "#e3c78a", "fg": "#080808"},  # yellow
    {"bg": "#ff5189", "fg": "#080808"},  # crimson
    {"bg": "#36c692", "fg": "#080808"},  # turquoise
]

DIM_FACTOR = 0.4
INACTIVE_FG = (189, 189, 189)

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
