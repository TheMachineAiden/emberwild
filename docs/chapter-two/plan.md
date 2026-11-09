# Chapter two planning draft — The Returning Light

Status: playable entry proof in development. Chapter one remains the released baseline.

## Current evidence

Baseline before expansion: src/data.js + src/engine.js. Existing areas Briarwick, Sedgeway, Saltwind Rise, Stillglass Vault, Lantern Crown; eight stable species IDs. Existing resolution: creatures shelter sparks, Alder shares the light, beacon relights. Historical docs/brief.md and docs/levels.md contain obsolete Swedish names and old tower sequence: do not implement those. Existing team max6 blocks capture when full; no reserve. Existing combat: four types, neutral/typed attack, Guard restores3HP, draught, switch, Catch, free flee from wild; no speed/status/ability model. Stats and type advantages must make battle roles honest within these rules.

## Causal outline

The restored beacon reveals a procession of sheltered sparks returning along an old coastal channel. A disused tide gate prevents creatures reaching the protected nursery at Glassreed Basin. Players learn why it was closed, distinguish safe water movement from a dangerous surge, restore a gentle passage and show the remaining guardian the channel is safe. Chapter one remains resolved and lit throughout. No villain who secretly undid the first ending.

Proposed collective in-world term: sparkwards, creatures that shelter and carry sparks. Introduce naturally in one keeper line; avoid globally replacing useful terms like companion in every sentence. Review all8 display names, retain strong existing identities; Lunamoth is most generic. No trademark/exclusivity claim. Stable species IDs and old captured teams never change.

## Three connected areas

1. Wrackwater Reach: entry via new eastern ridge path available after complete=true; visible shoreline trail, shore camp and inspection of an empty channel. Two discoverable fixed wild encounters. Teach reading environmental evidence before operating the weir; one keeper record establishes creatures need sheltered shallows, not full tidal force. Free return west and free recovery. Existing completed saves see clear objective and changed Tamsin/Perrin guidance; fresh saves unlock at original ending. Entry landmark visible at phone camera size.
2. Bellwether Weir: two branches from a central safe path expose complementary evidence about outlet height and worn watermarks. Small three-control diversion puzzle uses relationships, not an ordered list. On a wrong trial show where the water went, preserve HP/items and permit immediate reset. Correct diversion persistently opens east and visibly changes channel flow. At least two clues needed and unique valid arrangement verified before implementation. No solution in objective/reset/failure. One optional keeper practice battle uses contrasting type/HP roles, never gates clues behind grind. Two additional fixed wild encounters reachable before puzzle.
3. Glassreed Basin: sheltered destination, two final fixed encounters plus optional habitat loop. Protector battle comes after seeing safe channel; success opens the last barrier, sparks visibly settle into the reeds, keeper acknowledges creatures can move freely while beacon stays lit. Free rest before challenge. Backtrack and retry remain possible; all6 new species remain obtainable after completion.

## New species candidates (not final naming/art)

| Working display name | Stable new ID | Silhouette / identity | Habitat | Role within existing combat |
| --- | --- | --- | --- | --- |
| Siltippet | siltippet | small cuttlefish, broad rippling mantle, warm pearl held beneath | Reach tidal pool | Tide durable pivot, lower attack |
| Coaldrill | coaldrill | compact coal mole, shovel forepaws, ember nose | Reach dry wrack bank | Ember higher attack, vulnerable HP |
| Vesperknot | vesperknot | folded bat with long knot-like ear and broad sail wings | Weir sheltered underside | Gale neutral-match attacker |
| Bractisel | bractisel | upright orchid mantis, leaf forearms sheltering a spark | Weir reed margin | Moss high attack, low HP |
| Kelpurl | kelpurl | upright curled seahorse, kelp crown and lit throat pouch | Basin shallow channel | Tide balanced alternative |
| Peatuff | peatuff | squat peat toad, moss saddle and glowing throat | Basin reed shelf | Moss high-HP anchor |

Names and anatomy need individual review against existing roster and rendered source contact sheet. No recolours. Every new species gets retained generated/authored source, deterministic front/back production PNG and live battle review. Existing Rillfin and Brinecrest are fish/newt; Kelpurl upright curl and Siltippet mantle must be visibly distinct. Existing Buddle snail and Brambleboar stocky boar must remain distinct from Peatuff squat toad.

## Collection and save fork

Camp reserve: optional companions array defaults empty for old saves. Catch while travelling team is full sends new companion to reserve with explicit feedback. Free camp/Mira swap keeps six active and at least one usable active companion. No new account, backend, discard or broad inventory overhaul. Validate active+reserve species/HP fields with current save constraints. The reserve holds64 companions; a full reserve blocks capture before a vessel is spent. This is needed for all14 collection in one save and must be playable on667.

## Worked progression / early cancellation

Legacy complete save -> ridge eastern route becomes reachable, original flags all unchanged -> Reach keeper record and first optional wild discovery -> leave/flee: no false discovery or gate flag, safe immediate retry -> inspect both Weir evidence branches -> adjust/test wrong setting: only local water state resets, no HP/items -> correct setting: persist diversion flag, east opens -> Basin observe destination/rest -> guardian battle loss: existing recovery preserves gate/old flags and route remains reachable; victory sets separate chapter2 completion flag, never overwrites complete -> return world/save/reload: lit original beacon + gentle channel both stay true. No required capture/species/count.

## Proof before production

After phase1 release, implement entry plus one fixed wild encounter and return path using existing environment rasters and one representative new species source. Test completed-old-save entry, fresh unlock, flee/retry/Catch, full-team reserve path and reload. Personally play and inspect844/667; review the concrete integration. Then proceed remaining five source species and all three connected areas after proof is sound.

## Acceptance inventory

Full beginning-to-ending chapter2 native play; all6 obtainable with a full starting team; optional battles/discoveries; deduction fairness after reading all reachable text; loss/retry/backtrack; old and new saves; original chapter still resolved; HUD/music gesture lifecycle; offline cache/update; 844/667 light/dark/battle/companion screens. At least two exploratory checks: leave during partial weir state then save/reload, and return to chapter1 after chapter2 loss/finish. Record measured observations; no unmeasured playtime claim.

## Weir rule agreement

The challenge uses pool height and flow rather than another wick allocation. Three gates are binary and individually labelled: Cliff feeds the pool floor, Reed drains at a middle sill, Foam drains below that sill. The player has an explicit Test flow interaction and a separate Reset that shuts the gates. With inflow present, the lowest open outlet sets the level. The reed roots end between the lower cut and middle sill; nest cups sit just above that sill. Flow must keep the roots wet and the cups dry.

The upper relief identifies the three pipe heights; a keeper record explains the lowest-outlet rule; the lower bank's root tips and nest cups establish the required level. No single clue specifies gate positions. Clues are on two traversable branches and remain readable after success. Ordinary objectives describe helping the return passage. Gate interactions report only their own open/shut state. Test feedback reports observable dry, low, rising or steady water, with no health/item cost. Incorrect trials retain settings to permit reasoned adjustment. Reset is always reachable; success is permanent and opens the basin.

Worked rule check: all shut gives no inflow. Opening an outlet without inflow remains dry. Inflow with a lower outlet exposes the reed roots; shutting every outlet makes water rise. Only inflow with the middle outlet available and the lower cut sealed gives the required through-flow beneath the nest cups. Leaving or saving during an experiment retains the three binary settings; solved saves retain the channel and entry regardless of old partial data.

## Naming review

| Existing stable ID | Display decision | Identity judgment |
| --- | --- | --- |
| glimra | Keep Wickit | Short, lively wick/kit association fits the ember fox. |
| strila | Keep Rillfin | Clear flowing-water identity and easy to say. |
| knopp | Keep Buddle | Compact, soft bud-like sound suits the moss snail. |
| vippa | Rename Lunamoth to Velune | A more individual name while retaining its moon-wing identity and stable saved ID. |
| kolkrabb | Keep Cinderclaw | Strong silhouette-linked identity for the ember crab. |
| tuvling | Keep Brambleboar | Distinct bristled woodland personality; long but readable in current cards. |
| daggla | Keep Brinecrest | Coastal wave-plate identity distinguishes it from Rillfin. |
| ljuskron | Keep Dawncrest | Warm beacon payoff and regal silhouette suit the rare creature. |

New names Siltippet, Coaldrill, Vesperknot, Bractisel, Kelpurl and Peatuff describe six distinct silhouettes and personalities. Sparkward/sparkwards is introduced naturally through the return journey; ordinary companion/team wording remains useful. These are creative naming choices without an exclusivity claim.
