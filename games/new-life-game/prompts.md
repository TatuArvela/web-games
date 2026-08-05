# New Life Game — Image generation prompts

Asset list for Midjourney web UI. Prompts are intentionally terse — the
attached **style reference** (a screenshot from an existing game in the
target janky-3D aesthetic) does the heavy lifting. The 16:9 aspect ratio
is set via the UI control; no `--ar`, `--style`, `--s`, or `--no`
parameters needed in the prompt.

## Workflow

1. Pick a **style reference**: a screenshot from an existing game in the
   target janky 90s/2000s low-poly 3D look (PSX/Saturn launch titles,
   Virtua Fighter 1, Tomb Raider 1, etc.). Drag it onto the MJ prompt bar
   (or use the image-reference / style-ref button) so MJ attaches it to
   every generation.
2. Set aspect ratio to **16:9** via the UI control.
3. Paste a prompt from below, submit, pick the best of the four outputs.
   **No upscale needed** — initial outputs are usable as-is.
4. Save to `images/bg/<name>.png`. Filename must match the header — the
   engine reads it directly from `scenes.js`.

## Status of existing assets

- **Character portraits** (`images/bob.png`, `willie.png`, `peter.png`,
  `loser.png`, `jam-dude.png`) are placeholders. They'll need regeneration
  in the matching style later.
- **Props** (`images/props/`) are **deferred** — finish the backgrounds
  first, then come back to props in a separate pass. The overlay system
  in the engine already supports them; the scenes already reference them.

---

## Backgrounds

26 unique backgrounds. Each block: filename, a one-sentence scene
reminder, then the prompt.

### `bg/outside.png`
Bob's / Willie's apartment building exterior.
```
Front of worn down, gray, poor tenement building
```

### `bg/inside.png`
Apartment living room interior, shared by Bob, Willie, Peter.
```
Cozy apartment living room with a brown couch, a small coffee table, and an empty kitchen doorway
```

### `bg/outsideWork.png`
Bob's office exterior.
```
Generic 1990s city office building exterior at dusk
```

### `bg/insideWork.png`
Office interior for Bob and Willie (interview).
```
Drab beige office cubicle with a desk, CRT monitor, and swivel chair
```

### `bg/loadingSky.png`
Behind the road-sign template for loading scenes.
```
Wide daytime sky in pale blue with a simple road in the lower third
```

### `bg/street.png`
Sidewalk between locations.
```
Empty urban sidewalk with brick storefronts and a lamp post
```

### `bg/bus.png`
Inside the bus — the bus always wins.
```
Interior of an empty city bus at night, viewed from behind the driver seat looking forward
```

### `bg/debug.png`
Hidden debug menu screens.
```
Retro CRT monitor screen filled with phosphor-green grid lines and ASCII pattern
```

### `bg/gameOver.png`
Default game-over screen.
```
Abstract dark void, deep black gradient bleeding into crimson at the bottom
```

### `bg/win.png`
Default win screen.
```
Bright golden trophy chamber with confetti suspended mid-air
```

### `bg/fight.png`
Loser vs Jam Dude.
```
Boxing ring viewed from the corner under a single overhead spotlight
```

### `bg/jam.png`
Same ring, jammified.
```
Boxing ring with the floor covered in glossy strawberry jam
```

### `bg/park.png`
Bob's park branch. Mushrooms, raccoon, bench variants render as overlays.
```
Urban park with an empty wooden bench
```

### `bg/garden.png`
The Tomato Man's domain — a city allotment next to Willie's apartment.
```
City allotment tomato garden with rows of staked plants heavy with red fruit
```

### `bg/gym.png`
Bob's gym branch.
```
Gym interior with mirrors on the back wall and racks of dumbbells in the distance
```

### `bg/depot.png`
Peter's bus depot.
```
Run-down city bus depot at dusk with cracked concrete and empty parking bays
```

### `bg/glow.png`
Peter's radioactive transcendence.
```
Industrial corridor saturated in radioactive neon green light
```

### `bg/trip.png`
Bob's mushroom trip / bad-shroom failure.
```
Psychedelic dreamscape with swirling magenta and cyan tunnels and floating fractal shapes
```

### `bg/cosmos.png`
Convergence, enlightenment, deep cuts.
```
Deep starfield with a swirling purple and navy nebula
```

### `bg/bar.png`
Bob's bar branch.
```
Dim dive bar interior with a long wooden bar, stools, and liquor shelves
```

### `bg/doctor.png`
Peter's medical branch.
```
Clean clinical examination room with pale green walls and an examination bed
```

### `bg/crash.png`
Peter's bus failure.
```
Aftermath of a car crash on a city street with smoke, twisted metal debris, and orange flames
```

### `bg/flowerShop.png`
Elli's Flower Shop (always expensive).
```
Small city flower shop interior with buckets of fresh flowers and a wooden counter
```

### `bg/tulipRoom.png`
Close-up of the €200 tulip.
```
Close-up of a single bright red tulip in a small ceramic pot on a wooden table
```

### `bg/brickWall.png`
Bob's dead-end easter egg.
```
Plain weathered red-brick wall filling the frame
```

### `bg/adSpace.png`
Bob's billboard dead end — "ADVERTISING SPACE FOR SALE. Call 555-LIFE."
```
Weathered roadside billboard with a blank advertising panel against a dull sky
```

---

## Overlays (deferred)

Props rendered on top of backgrounds via `scene.overlays` (engine support
already wired). Generate after the backgrounds are done.

**Workflow notes** for when you come back to these:
- Same style reference, same simple prompts.
- Generate on a flat neon-green background (`#00FF00`) for chroma-keying.
- Append `, centered on flat neon green background` to each prompt.
- After generation, run `rembg i in.png out.png` to alpha-cut.
- Save to `images/props/<name>.png`.

### `props/mushroom-glow.png`
```
Small mushroom with a glowing cyan cap
```

### `props/mushroom-bad.png`
```
Small mushroom with a dull purple-brown cap
```

### `props/bench-bob-face.png`
```
Wooden park bench with a bald man face faintly visible in the wood grain
```

### `props/bench-final-bob.png`
```
Wooden park bench fused with a bald man, his head and shoulders forming the backrest
```

### `props/pigeon.png`
```
Fat city pigeon in side view with a judgmental expression
```

### `props/raccoon-wallet.png`
```
Cartoon raccoon holding a small brown wallet with a smug expression
```

### `props/cheese-bottle.png`
```
Vintage glass bottle of pale yellow liquid with a blank label
```

### `props/magic-donkey.png`
```
Cartoon donkey with a faint magnetic shimmer around it
```

### `props/tomato-leaves.png`
```
Cluster of tomato vine leaves with a few small green tomatoes
```

### `props/tomato-pile.png`
```
Heap of ripe red tomatoes piled on the ground
```

### `props/tomato-man.png`
```
Looming silhouette of a very large man with a tomato-shaped head
```

### `props/fridge-glow.png`
```
1990s refrigerator with vivid green glow leaking from the door seal
```

### `props/phone-sticky.png`
```
Beige rotary phone on a side table next to a blank yellow sticky note
```

### `props/desk-drawer.png`
```
Open desk drawer revealing a hardcover book, a beige stapler, and a USB stick on a keychain
```

### `props/stapler.png`
```
Heavy beige 1990s office stapler
```

### `props/usb-stick.png`
```
Black USB stick on a keychain with a blank handwritten label
```

### `props/brain-manual.png`
```
Hardcover book with a stylized brain illustration on the cover
```

### `props/billboard.png`
```
Weathered roadside billboard frame with a blank inner panel
```

### `props/bus-front.png`
```
City bus head-on with headlights blazing and a faint green glow around the chassis
```

### `props/meltdown-lever.png`
```
Large red industrial lever on a yellow housing with warning stripes
```

### `props/bald-driver.png`
```
Silhouette of a bald bus driver from behind, faintly green-lit by the dashboard
```

### `props/debug-button-smart.png`
```
Cyan glowing wireframe rectangular button with a brain icon
```

### `props/debug-button-rich.png`
```
Gold glowing wireframe rectangular button with a dollar sign icon
```

### `props/debug-button-delete.png`
```
Red glowing wireframe rectangular button with an X icon
```

### `props/debug-button-mystery.png`
```
Magenta glowing wireframe rectangular button with three question marks
```

### `props/jukebox.png`
```
Vintage neon-lit jukebox with glowing red and yellow lights
```

### `props/bouncer.png`
```
Silhouette of an enormous bouncer easily three meters tall, mostly in shadow
```

### `props/bartender.png`
```
Bartender behind a bar wiping a glass with a neutral expression
```

### `props/deadlift-bar.png`
```
Loaded Olympic deadlift barbell with multiple plates on a gym floor
```

### `props/protein-cloud.png`
```
Faint translucent cloud of brown-yellow protein shake mist
```

### `props/mri-machine.png`
```
Large white MRI scanner with the bore glowing faintly green inside
```

### `props/doctor-poster.png`
```
Medical anatomy poster with a stylized human cross-section figure
```

### `props/cloning-chamber.png`
```
Tall vertical glass cylindrical chamber with a faint blue glow inside
```

### `props/clone-peter.png`
```
Silhouette of a cartoon man matching reference portrait, faintly glowing
```

### `props/jam-puddle.png`
```
Glossy bright red strawberry jam puddle with chunks of fruit visible
```

### `props/jam-tendril.png`
```
Thin strawberry jam tentacle rising upward out of a puddle
```

### `props/life-game-presence.png`
```
Faint geometric glowing eye with white and gold light, mostly translucent
```

### `props/tulip.png`
```
Single bright red tulip in a small ceramic pot
```

### `props/road-sign.png`
```
Wooden road sign on a post with a blank rectangular panel
```

### `props/elli-silhouette.png`
```
Silhouette of a stern florist holding a watering can, partially in shadow
```

---

## Asset wire-up checklist

When an image is ready:

1. Save as `images/bg/<name>.png` (backgrounds) or `images/props/<name>.png`
   (props). Filename must match the header above exactly.
2. Reference it from `scenes.js`:
   - Backgrounds are pre-wired via `BG.*` constants. Just drop the file in.
   - Props need `scene.overlays = [{ image: "images/props/<name>.png", x, y, w, h }]`
     on the scene that uses them. Coordinates are in rem (game's 1111×625
     logical space).
3. The engine (`engine.js`) renders `scene.bg` as a full-frame image and
   `scene.overlays` between background and portrait. A missing background
   image leaves the scene's dark `.bg` fill — so drop the file in to fill it.
