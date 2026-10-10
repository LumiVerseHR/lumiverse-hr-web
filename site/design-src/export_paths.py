"""Export the laser paths for every exhibit (run inside Blender after posing the devices).

Every hard mesh edge (a boundary, or a bend sharper than 0.5 rad) is projected through the render
camera into render pixels, chained into polylines where segments share an endpoint, ordered
nearest-neighbour so a beam sweeps instead of jumping, and split between four beams by part.
Writes src/content/hero-paths.json:
  {frame: [w, h], devices: {<device>: {box: [x, y, w, h], beams: [[[x, y], ...], ...] x4}}}

    exec(open(".../export_paths.py").read()); export_paths()
"""

import json
import math
from collections import defaultdict

import bmesh
import bpy
from bpy_extras.object_utils import world_to_camera_view

OUT = "/Users/tjauk/LumiVerseHR/lumiverse-hr-web/site/src/content/hero-paths.json"
W, H = 1600, 1100

# Each beam owns a few parts of the device, so the four heads work in different places at once.
GROUPS = {
    "laptop": [["Lid", "Bezel"], ["Screen"], ["Base", "Trackpad"], ["KeyWell"] + [f"Key_{r}_{c}" for r in range(5) for c in range(14)]],
    "monitor": [["MonPanel", "MonBack"], ["MonBezel", "MonScreen"], ["MonNeck", "MonFoot"], []],
    "workstation": [["UWPanel", "UWBack"], ["UWBezel", "UWScreen"], ["UWNeck", "UWFoot", "Mouse"], ["KbBase", "KbKeys"]],
}


def _px(v):
    p = world_to_camera_view(bpy.context.scene, bpy.context.scene.camera, v)
    return (round(p.x * W), round((1 - p.y) * H))


def _edges(o, angle=0.5):
    bm = bmesh.new()
    bm.from_mesh(o.data)
    mw = o.matrix_world
    out = []
    for e in bm.edges:
        if e.is_boundary or len(e.link_faces) != 2 or e.calc_face_angle(0) > angle:
            a, b = _px(mw @ e.verts[0].co), _px(mw @ e.verts[1].co)
            if a != b:
                out.append((a, b))
    bm.free()
    return out


def _chain(segs):
    adj = defaultdict(list)
    for i, (a, b) in enumerate(segs):
        adj[a].append(i)
        adj[b].append(i)
    used = [False] * len(segs)
    lines = []
    for i in range(len(segs)):
        if used[i]:
            continue
        used[i] = True
        line = list(segs[i])
        for at_end in (True, False):
            while True:
                tip = line[-1] if at_end else line[0]
                nxt = next((j for j in adj[tip] if not used[j]), None)
                if nxt is None:
                    break
                used[nxt] = True
                p, q = segs[nxt]
                other = q if p == tip else p
                line.append(other) if at_end else line.insert(0, other)
        lines.append(line)
    return lines


def _order(lines, start):
    out, cur, rest = [], start, lines[:]
    while rest:
        i = min(range(len(rest)), key=lambda k: min(math.dist(cur, rest[k][0]), math.dist(cur, rest[k][-1])))
        line = rest.pop(i)
        if math.dist(cur, line[-1]) < math.dist(cur, line[0]):
            line = line[::-1]
        out.append(line)
        cur = line[-1]
    return out


def _length(line):
    return sum(math.dist(line[i - 1], line[i]) for i in range(1, len(line)))


def export_paths():
    # Objects in a viewport-hidden collection are not re-evaluated, so their matrix_world can be
    # stale after a move. Show every device while reading, then put the viewport back.
    hidden = {c: c.hide_viewport for c in (bpy.data.collections[n] for n in ("Laptop", "Monitor", "Workstation"))}
    for c in hidden:
        c.hide_viewport = False
    bpy.context.view_layer.update()
    try:
        _export()
    finally:
        for c, h in hidden.items():
            c.hide_viewport = h


def _export():
    res = {"frame": [W, H], "devices": {}}
    for dev, groups in GROUPS.items():
        beams = [_chain([s for n in names for s in _edges(bpy.data.objects[n])]) for names in groups]
        if not groups[3]:
            # No fourth part: the longest beam's work is shared with the idle one.
            ls = _order(beams[0], (W, 0))
            half, acc, a, b = sum(map(_length, ls)) / 2, 0, [], []
            for line in ls:
                (a if acc < half else b).append(line)
                acc += _length(line)
            beams[0], beams[3] = a, b
        out, pts = [], []
        for lines in beams:
            lines = _order(lines, (W, 0))
            out.append([[list(p) for p in line] for line in lines])
            pts += [p for line in lines for p in line]
        xs, ys = [p[0] for p in pts], [p[1] for p in pts]
        box = [min(xs) - 6, min(ys) - 6, max(xs) - min(xs) + 12, max(ys) - min(ys) + 12]
        res["devices"][dev] = {"box": box, "beams": out}
        print(dev, box, [round(sum(map(_length, b))) for b in out])
    with open(OUT, "w") as f:
        json.dump(res, f, separators=(",", ":"))
