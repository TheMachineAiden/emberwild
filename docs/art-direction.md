# Emberwild raster direction

## Player task and identity

The world should read as a small Nordic coastal settlement where warm embers are precious. Mossy stone, reed beds, copper roofs and a pale lighthouse establish place; creatures repeat the ember shape as a small bright body feature. Warm light belongs to creatures and destinations, rather than every surface. Distinguish paths, grass, water and impassable cliffs by edge shape and texture as well as hue.

Three layout directions considered: a large ornamental handheld frame (recognizable but consumes mobile space); a storybook panel with large illustrations (less useful for spatial navigation); a restrained game window with compact utility controls and parchment dialogue. Use the third. The map and battle occupy attention; controls remain large on touch screens. Keep the direct top-down grid vocabulary of early handheld RPGs, with richer coastal silhouettes and a limited dusk palette rather than copied maps or creatures.

## Asset contract

World logical tile: 24×24. Existing collision and NPC coordinates remain authoritative. Ground tiles repeat on their edges. Characters are 16×24 with bottom-center foot anchors; props may exceed one tile visually but cannot silently enlarge collision. World camera may show a smaller region on mobile to preserve recognizability. Final environment visuals are raster assets drawn as images, with no geometric placeholders.

Battle creature frame: transparent 64×64 logical pixels, nearest-neighbor scaling, bottom-center anchor (32,60), silhouette kept inside 4px padding. Front/right-facing enemy pose and back/left-facing player pose must show the same anatomy and palette. No shadows baked across frame boundaries. Export individual front/back PNGs from retained sources using deterministic crop/downsample settings. No text in source sheets. Use a dark blue-green outline, two main shade steps, one warm highlight; retain broad flat clusters at small sizes.

Palette roles: deep sea outline #20323b, shadow green #3e5c54, reed green #879967, sand #ded2a1, amber #efb765, pale light #f5e7c0. Creature-specific accents may extend this palette. No smooth gradients or glossy vector treatment. Pixel borders should remain crisp at actual play size.

First acceptance sample: Glimra, a small ember fox with charcoal legs, cream muzzle/chest, large angular ears, and a curled tail holding a teardrop ember. Front and rear poses must be distinct and recognizable at 64px. Integrate that sample in starter and battle views before scaling production to all eight species.

## Prototype review

390×844 world capture retained in `qa/screenshots/mobile-world.png`: controls and parchment feedback are readable, no horizontal clipping. World markers are visibly tiny and generic. Final sprites plus a closer mobile camera should address identity and legibility. No final-art acceptance is implied by the greybox functional proof.

## Creature source batch review

Seven sheets retained; contact sheet in `qa/screenshots/creature-source-review.png`. Silhouettes are varied and front/rear anatomy is readable for Strila, Knopp and Tuvling. Vippa and Kolkrabb contain visible cell borders; Ljuskrön has a border and its rear is too close to the front silhouette. Daggla has an opaque pale background despite the transparency request. These are unapproved sources pending extraction/cleanup or regeneration. Do not export those defects as final sprites. Inspect all 64px derivatives on the actual battle background before acceptance.
