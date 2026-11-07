# Prototype verification inventory

Target: local development server, port 4387. Rule tests cover state transitions separately from browser input. Temporary geometry is not final art acceptance.

| State/control | Functional evidence needed | Rendered evidence needed |
| --- | --- | --- |
| Starter | Three choices; select once | Desktop and narrow touch layout |
| Walking | Arrow/WASD and touch buttons, collision, route transition | World and location label |
| Interaction | Neighbor guidance and free healer | Dialogue readability |
| Battle | Neutral/typed attack, guard, item, capture, switch, flee | HP, logs and menu fit |
| Team | Updated after capture, change active, close/reopen | Long team and fainted member |
| Save/load | Save, reload browser, load same team and position | Feedback and restored scene |
| Rival | Invalid capture/flee, victory persists | Trainer identity and result |
| Loss | Return healed to village, retry supplies | Clear recovery message |
| Exploratory | Blocked movement; unavailable/malformed save | No broken or misleading state |

Initial rule suite: 7 passing tests. JavaScript syntax, map dimensions, HTML/module/CSS HTTP responses pass. Hidden `.git` paths return 404. Ordinary-input, viewport and visual results are recorded below as performed; unrecorded inventory entries remain unverified.

## Ordinary-input pass

Desktop Chrome: chose Glimra, walked east with arrow keys to Sävstigen, entered grass and encountered Tuvling. A typed attack reduced its HP from 28 to 14 with effective-type feedback and one enemy response (Glimra 28 → 23). A capsule captured Tuvling; the result allowed only Continue. The team menu listed Glimra and Tuvling with their current HP. Escape closed the menu. Save → browser reload → Load restored route position 5,5 and the captured team. Walked back to Glödvik and interacted with the healer at position 5,6; full recovery and replenishment feedback appeared. No console warnings/errors during the pass.

Narrow touch emulation (390×844): changing device mode reloaded the page; Load restored the village save. All direction controls measured 48×44 CSS pixels and the interaction control 200×44; document width was 390 (no horizontal document overflow). Touch-control movement was checked separately. These metrics do not establish visual acceptance. Screenshots, dense battle fit, full mobile loop, rival and exploratory cases remain pending.

## Visual mobile review and correction

Retained `screenshots/mobile-world.png`, `mobile-battle-before.png` and `mobile-battle-fixed.png`, each reopened from the workspace. World: readable controls and feedback; tiny generic world markers require final art/camera work. Battle before fix: only two actions visible; internal scene scroll height 512 exceeded its 352px box and hid essential actions. Corrected scene layout to intrinsic document flow and removed disabled exploration controls during battle. At 390×844, revised battle shows all seven actions, both HP displays and log; scene client/scroll heights both 512, last button bottom 674, no horizontal overflow. No clipping found in that revised state. Creature circles remain explicitly temporary.

Normal touch-emulated controls after the fix: selected captured Tuvling through the switch menu; it became active and received exactly one visible enemy response (28→22 HP). Used a healing item and checked the resulting inventory/HP feedback. Full mobile chapter and final visual acceptance remain pending.

Glimra sample: retained RGBA source plus deterministic 64×64 front/back exports. Source and rear derivative inspected; starter integration reopened in `screenshots/glimra-starter.png`. Orange angular ears, curled ember tail and charcoal feet remain distinguishable at 64px, with adequate spacing in the starter card. Other creatures are still placeholders. Back-pose battle integration is implemented but rendered acceptance remains pending. Asset tooling uses Pillow 11.3.0 in a local ignored virtual environment.

Chapter-rule expansion: 10 tests pass, including locked exits, wrong-bowl reset, solved puzzle/save persistence, multi-creature trainer progression and keeper ending/save. The trainer-queue test deliberately uses a high-level fixture to isolate progression; it does not establish balance or ordinary chapter completion. New maps and ending still require normal-input and rendered review.

## First ordinary chapter traversal

Chrome mobile emulation 390×844, continuing the earlier captured-team save: walked to Liv, won with typed attacks, followed unlocked exit to Vindryggen. Used rest point; fought Edda's Vippa and Kolkrabb with neutral attacks and a tonic; Glimra reached level 5. Entered cellar, read inscription, interacted with water, moss and ember bowls in order, and walked through the newly open stairs. Rested at summit and challenged Signe: defeated Tuvling, Daggla and Ljuskrön using attacks and all three available tonics. Glimra finished with 2 HP before the final blow and levelled to 7 on victory. Captured Tuvling remained available as reserve. This is one successful starter/team path, not all-starter balance proof.

The ending appeared and its Return to world button worked. The completed world loaded from its auto-save. No debug state injection or RNG override was used; navigation/action input went through Chrome keyboard/click tools. The automated test fixture's high level was not used in this browser run. Traversal was performed quickly with known routes; the 20–30 minute first-player target has not been established and the current chapter may be shorter.

Rendered evidence: `screenshots/glimra-battle.png` shows readable rear silhouette and flame gap against the battle surface, complete menu and HP/log at mobile size. `screenshots/ending-prototype.png` shows readable ending and return control; disabled movement and repeated battle feedback are visually redundant and should be removed from the ending presentation. Score/audio inspection: no context before gesture; normal Sound click created a running context and 40 scheduled voices; normal mute click ended all 40. No listening judgment or full transition/visibility lifecycle signoff yet.

## Clean built-version recovery checks

Against revision fe172fe254a714eea22fe7f218d514ed9959613a on port 4388, mobile 390×844: chose Knopp, crossed to Sävstigen, reloaded and automatically resumed the saved route position. Clicked New adventure and dismissed confirmation; game and saved route remained intact. Started Liv's trainer battle; normal double-click on neutral attack produced exactly one 7-damage attack and one 8-damage reply (enemy38→31, ally34→26). Retained `screenshots/knopp-battle.png`: front/back sprites, HP/log and all actions are readable without clipping. Continued attacking without healing until loss; returned to village at5,6 with Knopp34/34, capsules6 and tonics3, and the retry state was auto-saved. No console errors. This deliberate loss does not imply Knopp is unviable; no items, capture or switching were used.

A new exploration pass adds three authored ember rescues and a field journal within the team menu. Two successful rescues plus Edda's trust open the cellar; fleeing leaves a rescue retryable. Thirteen rule/score tests pass. Rescue traversal, journal fit, gate messaging and resulting pacing require a fresh ordinary-input pass before chapter signoff.

Exploration revision: removed the additional two-rescue gate after design review. All three glödspår are optional, retryable and recorded in the journal. The existing trainer/puzzle progression remains sufficient. Thirteen tests still pass. Previous two-rescue requirements above describe a superseded candidate.
