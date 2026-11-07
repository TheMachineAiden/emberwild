# Implementation review

Rules, map/species content, rendering and scores/synthesis have separate files. Changed source was formatted with Prettier 3.6.2 for readable editing; the formatter is not a runtime dependency.

Review identified and corrected: choosing a starter could overwrite a prior save without resuming it; valid saves now resume at boot, while a confirmed New adventure control starts an intentional replacement. Rapid double clicks could take two combat turns; the UI now ignores another combat action for 180ms. Long continued play could exceed the save decoder's level limit; experience stops at level 100. Existing rule/score tests pass. Boot, restart cancellation, rapid double action, and level-cap behavior still need focused verification.

The static build allowlists runtime files and records the exact clean checkout revision. Retained source art and QA artifacts stay outside that output. Main visual/playable review, browser error/retry and audio lifecycle checks remain separate from this implementation review.
