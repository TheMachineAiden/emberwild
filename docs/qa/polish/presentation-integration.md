# Battle environments and human motion

The coast, meadow and closed Lantern Crown chamber now use retained original
raster masters. The coast foreground is calmer than the first scene study;
all three export at240×120 logical pixels enlarged nearest-neighbour to480×240.
Western Sedgeway uses meadow; eastern Sedgeway and Saltwind Rise use coast;
the actual Alder encounter uses the Crown chamber. No additional fights were added.

Contact positions are authored per environment, then projected through the same
centred cover crop as its background. All16 creature front/back exports have an
opaque bottom at row59, with contact at60/64 of the frame. Native renders inspected:
coast with Buddle/Rillfin at844×390 and Brinecrest/Wickit at1280×800, meadow with
Lunamoth/Wickit at667×375, Crown with Brambleboar/Brinecrest back at667×375.
The feet meet the upper platform surface rather than the ledge face. The desktop
field has a bounded height and adjacent stats/commands; landscape arrangement
and native text remain full size. See the retained images in [scenes](scenes/).

The protagonist now has restrained opposing arm and leg poses, with an invariant
head and bottom contact row. Normal keyboard walk and Shift+direction input were
exercised in all four directions at844×390; observed draw calls used the new
directional frames with zero canvas reallocations. The sparse sprint-south trace
observed one moving pose; this is not a physical120Hz or continuous-motion verdict.
The native world screenshot and enlarged gait sheet support silhouette review.
Matching human art covers Rowan, Maren, Alder, Perrin, Tamsin and Mira. Trainers
use their controller's actual facing and approach progress. A normal north step
into Rowan's LOS produced notice, west-facing standing/walk1/walk2 draws, then
one battle. Source pixel rows and every exported human PNG were compared exactly.

The encounter takeover now keeps the world large through the rotating sweep,
with amber-edged dark spokes; opposed entrances settle with a small overshoot,
then stats appear. Duration, input gating and the integrated musical opening are
unchanged. A normal-input shore encounter with unmodified timers recorded
takeover1079.6ms → entrances1648.0ms → ready2359.4ms:1279.8ms total, inert true
through both stages, Fight focused and overlay removed at ready. The two
`entry-*-keyframe.png` images are explicitly paused presentation diagnostics,
with animation times280/300ms, not real-time timing evidence. Audio remained off.

70 local tests pass, including crop projection, encounter lifecycle, XP crossings,
trainer LOS, audio cleanup and60/120Hz movement math. No console errors/warnings
were observed after the normal encounter. This integration checkpoint still
needs the final responsive/motion, save and scoped offline/update regression pass.
Browser emulation does not establish physical-device refresh or installation;
audio scheduling/export evidence does not establish listening quality.
