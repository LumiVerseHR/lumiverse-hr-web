"""Render the hero layers from hero-exhibits.blend (run inside Blender).

Every layer comes from the same camera, so the browser can stack them pixel-perfectly:
  stage.png             plinth, figures, their shadows, contacts and reflections
  solid-<product>.png   one device with its screen; plinth catches its shadow, figures cut holes
  wire-<device>.png     Freestyle edges of one device only, gold, everything else transparent

    exec(open(".../render_layers.py").read()); render_all(OUT)   # or render_layers(OUT, ["stage"])
"""

import os

import bpy

DEVICES = {"Laptop": ("laptop", "moj-kolega"), "Monitor": ("monitor", "titlomat"), "Workstation": ("workstation", "bridj")}


def _reset(show=None, stage=False):
    sc = bpy.context.scene
    vl = sc.view_layers[0]
    sc.render.use_freestyle = False
    vl.material_override = None
    for name in DEVICES:
        col = bpy.data.collections[name]
        col.hide_render = name != show
        col.hide_viewport = name != show
    for o in bpy.data.objects:
        o.is_holdout = False
        o.is_shadow_catcher = False
        o.hide_render = False
    figs = bpy.data.collections["Figures"].objects
    for o in figs:
        # Shadow stand-ins and contact shadows belong to the stage layer only, or they would
        # darken the plinth twice once the layers are stacked.
        if o.name.startswith(("Figure_", "Contact_")):
            o.hide_render = not stage
    bpy.data.objects["Floor"].is_shadow_catcher = True
    sc.render.film_transparent = True
    sc.render.resolution_percentage = 100
    sc.cycles.samples = 128
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA"


def _render(out, name):
    bpy.context.scene.render.filepath = os.path.join(out, name + ".png")
    bpy.ops.render.render(write_still=True)


def render_layers(out, which):
    sc = bpy.context.scene
    vl = sc.view_layers[0]
    cards = [o for o in bpy.data.collections["Figures"].objects if o.name.startswith("Card")]
    for item in which:
        if item == "stage":
            _reset(stage=True)
            _render(out, "stage")
            continue
        kind, dev = item.split(":")
        col = next(c for c, (d, _) in DEVICES.items() if d == dev)
        product = DEVICES[col][1]
        _reset(col)
        if kind == "solid":
            bpy.data.objects["Turntable"].is_shadow_catcher = True
            for c in cards:
                c.is_holdout = True
            _render(out, "solid-" + product)
        else:
            for o in cards:
                o.hide_render = True
            bpy.data.objects["Floor"].hide_render = True
            fs = vl.freestyle_settings
            for ls in fs.linesets:
                ls.collection = bpy.data.collections[col]
            sc.render.use_freestyle = True
            vl.use_freestyle = True
            vl.material_override = bpy.data.materials["invisible"]
            # Where a ray crosses bezel, panel, housing and neck it passes more transparent surfaces
            # than the default 8, and Cycles paints those pixels black.
            sc.cycles.transparent_max_bounces = 64
            _render(out, "wire-" + dev)
    _reset("Laptop")


def render_all(out):
    render_layers(out, ["stage"] + [f"{k}:{d}" for d, _ in DEVICES.values() for k in ("solid", "wire")])
