# 3D assets: Tripo AI models, compression and upload

The website ships with **original 3D models built in code** (`src/components/three/models/`), so it looks
complete without any external files. Models you generate in Tripo AI replace them one by one, from the admin
panel, with no code change.

| Slot (Admin → Site settings → 3D models) | Where it appears | Built-in model |
|---|---|---|
| Hero emblem | Home hero (cinematic intro, mouse tilt, idle spin, scroll) | Gold medallion with serif N, double ring, sapphire diamond |
| Custom Software | Home card, Services list, service page | Dark laptop + phone with floating gold UI panels |
| Blockchain | Home card, Services list, blockchain / smart-contract pages | Glass blocks linked by gold chains |
| Cybersecurity | Home card, Services list, service page | Gold and steel shield, circuit lines, blue core |
| NS Exchange | Home NS Exchange section (pinned, turns on scroll), NS Exchange page, Fintech page | Gold coin stacks + blue candlestick hologram |

## 1. Generate in Tripo AI (tripo3d.ai → Text to 3D)

Use these prompts exactly. Generate 3–4 variants each and keep the cleanest silhouette.

| Slot | Prompt |
|---|---|
| Hero emblem | Luxury gold emblem medallion with a serif letter N in the centre, thin double ring border, polished brushed gold, small sapphire-blue diamond on top, studio lighting |
| Blockchain | Floating translucent glass cubes connected by thin gold chains, blockchain blocks, minimal, premium |
| Cybersecurity | Futuristic gold and dark-steel shield with engraved circuit lines, glowing blue core |
| Custom Software | Sleek dark laptop and phone with floating gold UI panels and code windows |
| NS Exchange | Abstract gold coin stack with blue candlestick chart hologram |

Settings: **PBR textures on**, **quad/clean topology**, target **≤ 30k faces** (hero ≤ 50k). Export **GLB**.

Material targets (fix in Blender if Tripo's output differs):
- Gold: base colour `#E3A93B`, **metalness 0.9, roughness 0.25**
- Dark steel: `#1A2130`, metalness 0.85, roughness 0.35–0.4
- Blue accents / glow: `#3D6BFF`, add emission (the site's bloom picks it up in the hero)
- Glass: transmission 1, roughness ≈ 0.05, IOR 1.45

Lighting does **not** need to be baked: the site lights every model with a procedural studio HDR environment
for real reflections, plus a light that follows the cursor in the hero.

## 2. Clean up (optional, Blender 4.x)

1. Import the GLB, apply scale, set origin to geometry centre, face the model towards **−Y** (Blender front view).
2. Delete hidden/inside faces and stray floating parts. Decimate if above the face budget.
3. Check materials match the targets above. Remove any baked lighting from base-colour textures.
4. Textures: 1024 px is enough (2048 for the hero). Export GLB with "+Y up".

## 3. Compress (each file must be **under 1.5 MB**)

```bash
npx @gltf-transform/cli optimize input.glb output.glb --compress draco --texture-compress webp --texture-size 1024
```

Meshopt instead of Draco also works (`--compress meshopt`). Both decoders are self-hosted on the site
(`/public/draco`, Meshopt is built in), so no third-party CDN is contacted. Check the result:

```bash
npx @gltf-transform/cli inspect output.glb
```

## 4. Upload and switch on

1. **Admin → Media library → Upload**: choose the `.glb`. The file is checked to be a real glTF 2.0 binary;
   a warning is shown if it is over 1.5 MB.
2. Click **Copy URL** on its card.
3. **Admin → Site settings → 3D models**: paste the URL into the matching slot and **Save**.

The model is centred and scaled to fit automatically. If a model ever fails to load, the built-in model is
shown instead, so the page never breaks. Clear the field to go back to the built-in model.

## 5. Static images for low-power devices

Visitors with *reduced motion* switched on, *Data Saver*, no WebGL, very little memory, or no GPU acceleration
see still images instead of live 3D: `public/images/3d/<slot>.webp`. Phones and modest laptops get the
live 3D at a lower quality (lower pixel ratio, no bloom, no glass refraction, fewer particles).
After changing a model, regenerate the stills with the site running locally:

```bash
node scripts/render-stills.mjs http://localhost:3000
```

(needs Playwright with Chromium: `npm i -g playwright && npx playwright install chromium`), then commit the
updated `public/images/3d/*.webp`.

For testing, any page accepts `?3d=high`, `?3d=lite` or `?3d=off` to force a quality tier for that visit.

## 6. Where the code lives

```
src/components/three/state.ts        quality tiers, pointer/scroll/intro state (no three.js import)
src/components/three/runtime.ts      studio environment, brand colours
src/components/three/models/*.tsx    built-in models (Crest, Blockchain, Shield, Devices, Exchange, TechOrbit)
src/components/three/Scene.tsx       lights, GLB loader (Draco/Meshopt), fallbacks
src/components/three/HeroCanvas.tsx  hero canvas: bloom, gold dust, cursor light, cinematic intro director
src/components/three/ViewCanvas.tsx  one shared WebGL canvas for every in-page model
src/components/three/ModelView.tsx   lazy in-page model with still-image fallback
src/components/experience/*          smooth scroll, cursor, starfield, magnetic buttons, tilt cards,
                                     text reveals, page transitions, preloader, cookieless analytics
```
