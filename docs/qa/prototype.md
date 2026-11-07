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
