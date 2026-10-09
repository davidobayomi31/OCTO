# OCTA

The website for OCTO, a live mentorship in mindset and high-ticket closing. It's a static site, and its hero is a 3D chalkboard scene built with Three.js.

## Run it locally

From this folder, start a local server:

```bash
python3 -m http.server 8731
```

Then open http://localhost:8731/ in your browser.

## Files

- `index.html` holds the page structure and copy.
- `style.css` holds the chalkboard theme and the laptop and phone layouts.
- `app.js` has three parts:
  - the 3D web, the spider and its lair
  - the photos on the board
  - the panels and the scroll effects
- `smudges.svg` is the chalk-smudge texture for the board.

## Settings

The settings are at the top of `app.js`:

- `LINKS.apply` takes the Typeform application link.
- `LINKS.vsl` takes an optional pitch video, either a YouTube link or an .mp4 file.
- `SPOTS_TAKEN` is the number of Founding 10 spots already filled.

The photos on the board are placeholders from Unsplash. Swap them for real team photos in the `pinData` list in `app.js`.
