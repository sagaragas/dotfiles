# Show the pane's working directory in the window title bar instead of the
# program-set title. Loaded by kitty via window_title_template "{custom}".

import os

from kitty.fast_data_types import get_boss


def draw_window_title(data):
    try:
        boss = get_boss()
        window = boss.window_id_map.get(data.window_id) if boss else None
        cwd = window.cwd_of_child if window else None
    except Exception:
        cwd = None
    if not cwd:
        return data.title
    home = os.path.expanduser('~')
    if cwd == home:
        return '~'
    return os.path.basename(cwd.rstrip('/')) or '/'
