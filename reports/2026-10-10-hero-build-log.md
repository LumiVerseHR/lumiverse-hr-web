# Hero build log: laser-cut exhibits (2026-10-10)

Running notes for a possible blog post. Every number here comes from the code or a render.

## Starting point
- Hero = one Blender scene (`site/design-src/hero-laptop.blend`), rendered once with Cycles into separate
  layers from a single camera (1600x1100): `stage` (turntable + figures), `wire` (Freestyle lines only),
  `solid-<product>` (laptop with a real screenshot on the screen). They line up exactly because the camera is fixed.
- The browser animates only the reveal. Four canvas "beams" from the logo dot walk 2D edge paths
  projected from the 3D geometry (`laptop-paths.json`), revealing the wire still through a 26px stroke mask. Then one
  cut line sweeps down and unclips the solid layer. No WebGL, so the CPU stays idle between cuts.

## Feedback this round
1. The cutting laser is too heavy: make it thinner and more transparent.
2. The wireframe should glow gold, like the concept image, not salmon-white.
3. Always the same laptop gets boring: add a monitor and an ultrawide workstation.
4. The low-poly red figures were placeholders from the 3D era: make them high fidelity.

## Decisions
- Figures: there is no 3D generator here, but Qwen-Image (via our ComfyUI API) produces a convincing
  "architectural scale-model figure in matte coral resin" photo in about 16s. Rather than paste it into the
  stage still, it goes into Blender as an alpha-mapped card at the old figure positions. That way it casts a real
  shadow on the turntable and acts as a holdout in the device layers, so a device behind a figure stays behind it.
- Screens show real product UI at the device's native ratio, never stretched:
  - Monitor: Titlomat captured live at 1920x1080 with Playwright. Its cookie bar was dismissed with "Samo nužni".
  - Ultrawide: the Bridj dashboard. The window inside our existing case-study shot turned out to be 2.33:1,
    almost exactly 21:9. We cropped the letterbox, padded the sides with the app's own white and used it as is.
    (A live 2560px capture of bridj.ai was too empty to read as a workstation.)
- Each product sits on the device its users actually work on: Moj Kolega on a webshop owner's laptop,
  Titlomat on a creator's monitor, Bridj on an analyst's ultrawide desk.

## How the new devices were built (Blender 5.2, scripted through MCP)
- Monitor: a 3.6 x 2.07 graphite panel tilted back 5°, a 16:9 screen plane, a back housing, a neck and a plate foot.
- Workstation: an ultrawide curved on a radius of 5.2 (a 4.7 chord), generated ring by ring with bmesh so the
  screen's UVs run exactly along the arc. The screen height is derived from the arc length, so the screen is exactly 64:27.
  An aluminium keyboard (16x5 key grid) and a mouse complete the desk.
- One render pass per layer, from the same camera:
  - `stage` (figures on the plinth).
  - `solid-<product>`: the turntable is a shadow catcher and the figure cards are holdouts.
  - `wire-<device>`: Freestyle lines only, with a transparent material override.
- The wireframe colour moved from salmon-white (1.0, 0.86, 0.78) to gold (1.0, 0.72, 0.30). Hidden edges are deep
  amber at 45% opacity. A three-step gold drop-shadow in CSS adds the glow.

## Laser paths, generated rather than hand-picked
- Before: a hand-written list of laptop outlines (`laptop-paths.json`).
- Now: one exporter for any device. It takes every mesh edge that is a boundary or bends more than 0.5 rad,
  projects it through the render camera, chains segments that share endpoints into polylines, and orders them
  nearest-neighbour so a beam sweeps instead of jumping. Each of the four beams owns a few parts of the device
  (frame / screen / stand / keyboard).
- Check: the laptop's computed box (379, 221, 756x584) matches the earlier hand-measured box (384, 224, 746x576).
- Size: 33 KB of whole-pixel coordinates for all three devices.

## Laser weight
- The beam from the logo went from a 5px halo at 20% plus a 1.1px core at 80% to a 3px halo at 10% plus a 0.75px core at 50%.
- The cut line went from 2px at 90% to 1.2px at 60%.
- The burn point at each head shrank from a 20px to a 15px radius and turned gold, matching the lines it leaves.

## Fixes found along the way
- The wireframe's opacity transition also ran when it reappeared, so the first 600ms of every trace was dimmed.
  It now fades only on the way out.
- The sheen's mask was hard-coded to the laptop silhouette. It is now a CSS variable per exhibit.
- Screens looked washed out under AgX. A 1.22 gamma plus emission 1.25 in the screen shader restored contrast.

## Cost
- 7 WebP layers, 328 KB in total. Still no WebGL, and nothing animates between cuts.

## Round 2: feedback on figures and orientation
- "The left figure overlaps the ultrawide, hovers over the plinth, and its shadow is weird."
- "Turn the screens toward the middle of the page, toward the viewer. People should look at the objects, not away."

### What was actually wrong
- **Mirrored cards.** The card's yaw was computed as `atan2(dy, dx) - 90°`, which faced its back to the camera.
  Emission shades both sides, so it still rendered, but mirrored, and the man looked away from the device.
  Fixed with `atan2(dx, -dy)`, so local -Y points at the camera and image-right is screen-right.
- **Hovering.** In the generated photo the camera looks down at the figure, so the back shoe sits 40px
  (3% of the figure height, about 3.4cm in scene units) above the front shoe. On a flat vertical card that becomes a gap
  under the back foot.
- **Weird shadow.** A flat card casts a flat cut-out shadow, and its reflection in the glossy plinth showed as dark
  mirrored legs.

### Fixes
- The cards no longer cast shadows or show in reflections. Each figure has an invisible stand-in mesh (the old
  low-poly figure, scaled to the card height) that only casts the shadow, so the shadow is a real 3D shadow
  attached at the feet.
- A soft elliptical contact shadow (black, radial falloff, 40% peak) sits under each pair of feet,
  pushed 3.5cm away from the camera so it lands under the soles rather than in front of them.
- The devices turn as one, through a root empty per device, by -28° toward the camera: 8.6° past facing it
  head-on, so the screens lean toward the headline. The keyboard moved 0.3 to the right to make room for the man.
- Placement is checked numerically: each figure's projected head must sit below the lowest projected point of
  every device it stands in front of. The man stands at (-2.2, -1.2) and the woman at (1.2, -2.28), symmetric in the frame.

### Pipeline lessons
- `matrix_world` is stale for objects in a viewport-hidden collection. The path exporter read the keyboard's old
  position until it learned to unhide every device before reading.
- Cycles turns a pixel black once a ray passes more than 8 transparent surfaces. With the wireframe's
  transparent material override, the monitor neck crossed bezel, panel, housing and neck, giving 1,431 black pixels.
  `transparent_max_bounces = 64` brought it to 0.
- Both steps now live in versioned scripts, `design-src/render_layers.py` and `design-src/export_paths.py`, so every
  render resets every flag (shadow catcher, holdout, visibility) instead of inheriting the last pass.

## Round 3: "shadows are missing or incorrect below the figurines"
### Diagnosis (measured, not guessed)
- The key is a spot at (6, -3, 8), so it throws both shadows to the left. The man stands 0.27 units from the left
  rim, and his shadow tip lands at radius 3.6 when the plinth's radius is 2.75. Almost all of it falls off the plinth.
- The plinth is near-black (albedo 0.006) and glossy. The bright patch the man stands in is not light falling on
  the surface. It is the mirror image of the 5x5 m fill panel. A figure cannot visibly shadow a reflection of a
  light that large.
- The stand-in meshes were blocky, so any sharp shadow showed the wrong shape.

### What did not work (kept here for honesty)
1. Crossed shadow cards facing the key plus a grey plinth: this killed the black-gallery look, and the man was still unshadowed.
2. Moving the key to the front right, then high front: the shadows went back toward the centre, but the man's spot
   is lit by the fill's reflection, so nothing showed.
3. Cycles light linking to stop the fill reaching the plinth: this fixed the reflection but turned the plinth grey.
Each attempt traded away the approved look to chase physical correctness.

### What shipped: planar shadows
- The lighting is exactly as approved. Each figure gets a planar shadow: its own alpha silhouette laid on the plinth
  along the real key-light direction, with length from similar triangles (man 1.29, woman 0.75).
- The silhouette is pre-blurred in four steps (3, 10, 22 and 36 px). It is sharp at the soles and soft toward the head, the way a
  penumbra widens with distance from the occluder, and fades from 95% to 30% opacity.
- The shader clips it at radius 2.71, so the man's shadow drops off the plinth edge like a real one.
- The contact shadows were reweighted, curve first and then a 55% peak. Before, the curve was applied after
  scaling and capped them at 13%.
