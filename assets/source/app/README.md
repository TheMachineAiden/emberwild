# Wickit app emblem

The retained master adapts the existing Wickit sprite (assets/creatures/glimra-front.png) into an opaque app emblem. The central fox, cream cheeks and curled ember-tail preserve the game's creature identity. The flame shelters inside the tail rather than adding another character or landmark.

Created with the built-in image-generation tool from the existing sprite reference. Final prompt: transform the supplied Wickit pixel-art creature into one square, opaque dark-teal game icon; large pointed ears, pale cream cheeks/chest, dark eyes, curled orange tail sheltering a small amber flame; chunky stepped pixel-art edges, restrained palette, no text/border/UI/scenery, essential features centered for platform masking.

Run `.venv/bin/python scripts/export-app-icons.py` with requirements-art.txt to reproduce the normal192/512, maskable192/512, apple180 and favicon32 PNGs. Maskable derivatives add quiet margin by scaling the complete master to76%; no creature pixels are repainted. Source files and this note are excluded from runtime publication. The generated master remains the artwork authority; exports are deterministic derivatives.
