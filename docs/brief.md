# Emberwild — chapter one

A Swedish-language, top-down creature RPG about bringing a silent coastal lighthouse back to life. The player leaves the sheltered village of Glödvik with one companion, discovers that wild creatures carry the missing light, and convinces the keeper to share rather than imprison their embers. Original setting, creatures, dialogue, pixel art and hardware-inspired music.

## Play and payoff

Explore → talk and discover → fight or capture → improve a team → heal and retry → reach the lighthouse. Target first session: 20–30 minutes, to be measured in ordinary play. Finish with the lighthouse illuminating the two routes and a return to a changed village; continued exploration remains available.

Three starters: Glimra (ember fox), Strila (tide newt), Knopp (moss dormouse). Five wild species: Vippa (wind moth), Kolkrabb (coal crab), Tuvling (moss boar), Daggla (tide snail), Ljuskrön (ember heron). Ember beats moss, moss beats tide, tide beats ember. Wind is neutral. Every creature has a neutral fallback move, a typed move and a defensive option. No move exhaustion.

Places: Glödvik (starter and free healer), Sävstigen (capture teaching, rival Liv), Vindryggen (trainer and keeper's seal), lighthouse cellar (short spatial puzzle with visible reset), lighthouse summit (keeper challenge). Gates explain their requirements. Losing returns the entire healed team to the village without losing creatures or story progress. Renewable capture items and a free retry supply prevent exhaustion traps.

Story beats: keeper Signe closed the beacon after embers began vanishing. Liv suspects the creatures are stealing them. Exploration reveals the creatures are keeping the embers alive. Two route encounters earn trust and open the lighthouse. The keeper's final battle tests a mixed team, then creatures voluntarily rekindle the beacon. Keep dialogue short and give an actionable purpose at every gate.

## Smallest playable proof

Choose starter in Glödvik → walk east to Sävstigen → enter grass → weaken and capture a creature → inspect changed team → save and reload → return to free healer. Include loss/retry, switching and an item. Greybox this loop first; it establishes rules and spatial anchors for raster artwork.

## Presentation and technology

Static browser ES modules, no runtime dependencies or accounts. Pure game rules separated from DOM/canvas presentation, data-driven maps/species/moves, versioned validated local saves. Desktop arrows/WASD, Enter/Space interaction, Escape menus, real touch buttons. Readable responsive battle menus. Brief impact effects, reduced-motion support, no animation-dependent decisions. Final world and creatures use retained authored/generated raster sources with consistent pixel scale, distinct front/back poses and deterministic asset exports. Prototype markers are temporary.

Music: independently editable event scores; village, routes, cellar, battle, keeper and victory/capture motifs. Hardware-inspired pulse/pulse/triangle with noise reserved for SFX; browser envelopes are a declared departure from strict hardware. A shared rising ember motif links exploration and ending. Audio starts only after a gesture; mute and page visibility stop all voices. Inspect scores and transitions separately from human listening.

## Delivery criteria

Ordinary-input desktop and mobile journey through ending; capture, loss/retry, save/reload, switching and items; rendered legibility and clipping review; score and lifecycle checks; personal playable review. Keep design targets distinct from measured playtime and observed behavior.
