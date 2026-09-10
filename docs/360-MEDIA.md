# 360° vehicle media

How the 360° viewer works, how to shoot a sequence, and how to attach one to a vehicle.

> ## ADMIN NOTE — read before publishing any 360 view
>
> **Every vehicle that shows a 360° view needs a properly captured image sequence of that exact vehicle, or a compatible hosted tour of that exact vehicle.**
>
> - Never fake a spin from a single photo, a similar car, a manufacturer render, or an AI-generated image. A shopper who drives out to see a car that doesn't match what they "spun" online is a lost sale and a complaint.
> - The sequence in `public/360/demo/` is a **rendered demonstration model**, not a photo of any vehicle. It is watermarked "DEMO 360 SEQUENCE · NOT A PHOTO OF THIS VEHICLE" and only shows in development (`NEXT_PUBLIC_SHOW_DEMO_360`).
> - It is currently attached to the **2016 Nissan Altima, stock N287963** (`exterior360Frames` + `exterior360IsDemo: true` in `data/inventory.json`). **Remove it before launch**: delete the `exterior360Frames` array and the `exterior360IsDemo` flag from that record, or replace them with a real capture. `npm run inventory:check` reports it as "uses DEMO 360 sequence".
> - A vehicle with no 360 media simply shows the photo gallery. That is a perfectly good listing; a fake spin is not.

## How the viewer works

`src/components/vehicle/Vehicle360Viewer.tsx` with the loader in `src/lib/media/frames.ts`. The vehicle page shows tabs (Photos / 360° Exterior / 360° Interior) via `src/components/vehicle/VehicleMedia.tsx`; the 360 tabs appear only when that vehicle actually has the media.

### Frame model

- A sequence is an ordered list of image URLs: `exterior360Frames: string[]` on the vehicle record.
- Supported lengths: **36** (10° steps, recommended), **48** (7.5°), or **72** (5°, smoothest and heaviest). Other counts still play, but `inventory:check` and the sync endpoint warn about them.
- **Frame 0 is the front three-quarter view** (the same angle you would choose for the main listing photo), so the still shown before anyone interacts looks like a normal hero shot.
- Frames must be evenly spaced and go all the way around; the viewer wraps from the last frame back to the first.

### Loading strategy

1. The vehicle's first photo is used as a poster, so nothing extra downloads on page load.
2. When the viewer comes within 300px of the viewport, frames around frame 0 (±2) preload.
3. When the shopper drags, presses a control, or presses "Start 360° view", the whole sequence streams in, six requests at a time, nearest to the current frame first, with a progress bar.
4. Images are decoded before display and kept in memory, so rotating never re-downloads.
5. While frames are still arriving, the nearest loaded frame is shown, so rotation never goes blank.

### Controls

- **Drag or swipe** sideways to rotate (a full drag across the viewer ≈ one full turn). Vertical scrolling still works.
- **Rotate left/right buttons**, and a **play/pause auto-rotate** button (hidden when the visitor prefers reduced motion). Auto-rotate starts by itself only on desktop pointers, only after "Start 360° view", and stops on any interaction.
- **Zoom** with the +/− buttons, double-click/double-tap, pinch, or Ctrl + scroll (plain scrolling is never hijacked). When zoomed, dragging pans.
- **Reset view** and **full screen** (native fullscreen, with a CSS fallback for browsers that don't support it, closed with Escape).
- **Keyboard:** left/right arrows rotate (Shift = 5 frames), `+`/`-` zoom, `0` or `Home` resets, Space toggles auto-rotate. The stage is focusable and announces the current angle.

### Fallbacks

- If more than 30% of frames fail to load, the viewer replaces itself with "The 360° view couldn't load" and a **View photos** button that switches back to the gallery tab.
- If a vehicle has no frames but has `exterior360EmbedUrl`, the viewer shows a poster with a "Load exterior 360° tour" button and only then loads the iframe (nothing third-party loads unasked).
- `interior360Url` renders the same way as an "360° Interior" tab.
- No 360 media at all: no tabs, just the gallery.

### Analytics

The first interaction fires `vehicle_360_started` with `stock_number`, `frame_count`, and how it started (`drag`, `controls`, `start_button`, `zoom`, `wheel`, `fullscreen`, `auto_rotate`, or `embed_exterior` / `embed_interior`).

## Capture guidelines

Either method works. Consistency between frames matters far more than equipment.

**Turntable (best)**
- Camera on a tripod, fixed position, fixed height (about window height, roughly 1.2–1.4m), fixed distance, fixed focal length.
- Turntable rotates in equal steps: 10° for 36 frames, 7.5° for 48, 5° for 72. Shoot with a remote or timer; never bump the tripod.

**Walk-around (no turntable)**
- Mark a circle around the vehicle with tape or chalk: 36 marks at 10°, 48 at 7.5°.
- Tripod at the same height at every mark, aimed at the same point on the vehicle (roughly the center of the car at beltline height), same distance from the center every time.
- Walk in one direction only and shoot every mark. Don't skip and don't double-shoot.

**For every capture**
- Manual exposure, manual white balance, manual focus. Auto modes make the car flicker between frames.
- Even, indirect light. Overcast outdoors or a covered/indoor bay is ideal. Avoid harsh sun, moving shadows, and puddles that change.
- Wheels straight, doors and hood closed, nothing on the roof, plates and stickers as they'll be sold, interior tidy (it shows through the glass).
- Clean the vehicle first; water spots and dust are very visible when frames swap.
- Keep the background as consistent as possible: no people, no moving cars, no changing sky if you can help it.
- Keep the vehicle the same size and in the same place in every frame. Crop identically across the sequence.
- Shoot the interior 360 separately (a phone-based panorama tool or a hosted tour service) if you want the interior tab.

**Files**
- Export every frame at the same size: **1600×900** or **1920×1080**, 16:9 (the viewer stage is 16:9 and letterboxes anything else).
- **WebP** (or AVIF) at quality ~75. A 36-frame sequence should total roughly 3–8 MB. JPEG works but is larger.
- Name them in order with zero padding so they sort correctly: `frame-01.webp`, `frame-02.webp`, … `frame-36.webp`.
- Keep the originals. Re-cropping later is much easier from full-size files.

**Direction of travel**

Shoot in one direction and keep the file order matching the direction you walked (or the turntable turned). After you upload, open the vehicle page and drag: the car should follow your finger. If it spins the wrong way, simply reverse the order of the list — nothing else needs to change. Don't copy the demo sequence's direction or starting angle; it is a rendered test asset, and its first frame is a rear three-quarter view.

## Adding a sequence to a vehicle

### Option A — self-hosted frames

1. Put the files in `public/360/<stock-number>/` — for example `public/360/N246488/frame-01.webp` … `frame-36.webp`. Use the stock number exactly as it appears in the listing (lowercase is fine and is easier to type).
2. Reference them from the vehicle record in `data/inventory.json`:

```json
"exterior360Frames": [
  "/360/N246488/frame-01.webp",
  "/360/N246488/frame-02.webp",
  "… all 36 in order …",
  "/360/N246488/frame-36.webp"
],
"exterior360IsDemo": false,
```

`exterior360IsDemo` can simply be removed; it only exists to mark the demonstration sequence.

3. Run `npm run inventory:check` to confirm no warnings, then commit and redeploy (see [HANDOFF.md](HANDOFF.md#3-publish-your-changes)).

### Option B — frames on a CDN or image host

Use absolute URLs in the same array:

```json
"exterior360Frames": [
  "https://cdn.example.com/vehicles/N246488/frame-01.webp",
  "https://cdn.example.com/vehicles/N246488/frame-02.webp"
]
```

Frames are loaded as plain images (not through the Next.js image optimizer), so no host allow-list change is needed for them. Regular photos do need their host added to `images.remotePatterns` in `next.config.ts`.

### Option C — CSV import

`data/inventory-template.csv` has an `exterior_360_frames` column. Put the URLs in one cell separated by pipes, in order:

```
/360/N246488/frame-01.webp|/360/N246488/frame-02.webp|…|/360/N246488/frame-36.webp
```

Then `npm run inventory:import -- path/to/export.csv`. The same row also has `exterior_360_embed_url` and `interior_360_url`.

### Option D — hosted tour (no frames to manage)

If you use a 360 provider (Spincar, Fyusion, Impel, a Matterport-style interior tour, etc.), paste the embeddable URL for that specific vehicle:

```json
"exterior360EmbedUrl": "https://provider.example.com/tours/vin-1234/exterior",
"interior360Url": "https://provider.example.com/tours/vin-1234/interior"
```

Both must be `https://` URLs that are allowed to be framed by other sites (some providers require a separate "embed" URL). The iframe is only loaded after the visitor clicks, and it is allowed to use fullscreen, accelerometer, and gyroscope.

## Quality checklist for each sequence

- [ ] 36, 48, or 72 frames, evenly spaced, complete circle.
- [ ] Frame 0 is the front three-quarter view.
- [ ] Same exposure, white balance, framing, and background in every frame.
- [ ] It is the actual vehicle being sold, with its current wheels, trim, and condition.
- [ ] Files are 16:9, ~1600×900 or 1920×1080, WebP/AVIF, named in sorted order.
- [ ] Dragging spins the car the way it should; the spin doesn't jump or flicker.
- [ ] `npm run inventory:check` reports no 360 warnings for the vehicle.
- [ ] Tested on a phone over mobile data: the poster shows immediately and the sequence loads within a few seconds.
