# Higgsfield prompts (paste into Claude chat, with the Higgsfield connector on)

Paste one block at a time. Each block is a complete message. For the three that start from a
screenshot, attach the named image from this repo to the same message.

After each one finishes, download the MP4 and save it in `drafts/footage/` with the filename
shown. Use the file you liked best if you run a prompt more than once.

---

## 1. `nib-ink.mp4`: gold ink line on ink paper (footer)

> Use Higgsfield with my free unlimited generations. Model: Seedance 2.5, text-to-video, 1080p,
> 21:9, 6 seconds, no audio.
>
> Prompt: "Abstract motion graphic, seamless slow loop. Extreme macro of a single fine line of
> muted antique gold ink being drawn left to right across warm near-black paper by an unseen
> calligraphy nib. The line swells thicker and thinner with pressure, like Bodoni letterforms.
> Faint paper fibres, soft raking light from the left, very shallow depth of field. Locked-off
> camera. No hands, no pen, no text, no letters, no logos, no people, no sparkles, no glow. Calm,
> editorial, high-end print studio."
>
> Generate 2 variants.

## 2. `nib-cream.mp4`: ink line on cream paper (Projects heading)

> Use Higgsfield with my free unlimited generations. Model: Seedance 2.5, text-to-video, 1080p,
> 21:9, 6 seconds, no audio.
>
> Prompt: "Abstract motion graphic, seamless slow loop. Extreme macro of a fine near-black ink
> line drawn left to right across warm cream cotton paper (colour close to #efe8dc) by an unseen
> pointed nib. The stroke swells and thins with pressure and leaves a slight wet sheen that dries
> matte. Paper texture visible, soft daylight, shallow depth of field, locked-off top-down camera.
> No hands, no pen, no text, no letters, no logos, no people, no colour other than cream and ink.
> Quiet and minimal."
>
> Generate 2 variants.

## 3. `signal-matrix.mp4`: Signal's dot-matrix landing page coming alive

Attach: `assets/img/signal-1.jpg`

> Use Higgsfield with my free unlimited generations. Model: Seedance 2.5, omni_reference mode,
> attached image as the start_image, 1080p, aspect ratio auto (match the image), 5 seconds,
> no audio.
>
> Prompt: "This exact website screenshot, animated subtly. The grey dot-matrix pattern in the
> background shimmers: individual dots and triangles brighten and dim in a slow wave moving left to
> right, like a live signal. The large black word 'signal', the white headline, the paragraph and
> both buttons stay perfectly still and unchanged, pixel for pixel. Camera completely locked. No
> new elements, no new text, no zoom, no colour change."
>
> Generate 2 variants.

## 4. `findmyseat-map.mp4`: slow camera move across the real occupancy map

Attach: `assets/img/shot-findmyseat.jpg`

> Use Higgsfield with my free unlimited generations. Model: Seedance 2.5, omni_reference mode,
> attached image as the start_image, 1080p, aspect ratio auto, 5 seconds, no audio.
>
> Prompt: "This exact dashboard screenshot, filmed as a slow, smooth camera push-in from the
> full view towards the middle tables, like a screen-recording zoom. Nothing in the interface
> changes: same seats, same colours, same labels, same layout. No new elements, no text changes,
> no people, no lens effects. Clean and steady."
>
> Generate 2 variants.

## 5. `gripguardian.mp4`: the real prototype mouse, slow parallax

Attach: `assets/img/gripguardian.jpg`

> Use Higgsfield with my free unlimited generations. Model: Seedance 2.5, omni_reference mode,
> attached image as the start_image, 1080p, aspect ratio 4:3, 5 seconds, no audio.
>
> Prompt: "This exact photo of a hand-built sensor mouse prototype on a wooden desk, with a very
> slow, gentle camera dolly to the right and slight parallax, as if filmed on a slider. The mouse,
> wires, sensors and circuit board stay exactly as they are: no new parts, no hands, no glowing
> lights, no text. Natural office light, documentary look, slightly soft focus on the background."
>
> Generate 2 variants.

---

## What to check before keeping a clip

- No warped or invented text. Clips 3 and 4 are the risky ones, so read the labels frame by frame.
- No new objects, hands or people.
- 1 and 2 should loop without a visible jump from the last frame back to the first. If one jumps,
  keep it anyway: I can crossfade the loop in code.

Discard anything that looks like stock AI footage. Fewer clips is fine.
