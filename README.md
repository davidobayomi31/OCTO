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
- `app.js` has two parts:
  - the 3D web, and the spider that walks off it, weaves its home and goes inside
  - the panels and the scroll effects
- `smudges.svg` is the chalk-smudge texture for the board.

## Settings

The settings are at the top of `app.js`:

- `LINKS.apply` takes the Typeform application link.
- `LINKS.vsl` takes an optional pitch video, either a YouTube link or an .mp4 file.
- `SPOTS_TAKEN` is the number of Founding 10 spots already filled.

## Phone and laptop

Phone is the priority, since most traffic comes from phones. On phone:
- The eight legs show as a list on a silk thread.
- Testimonials are a swipe row.
- "How to join" is a vertical timeline.
- The small crawling spider hangs on a thread down the right margin, so it never covers text.
- Every tap target is at least 44px.

## Saved hero versions

- **Current (main):** the spider leaves the web, walks to an empty spot, weaves its home in one scroll and goes inside on the next.
- **Build your web:** the spider spins the web one leg (one step) at a time, then gold sparks get caught in it. It's saved on the `hero-build-your-web` branch, and as a copy in `versions/build-your-web/`. To view it, open http://localhost:8731/versions/build-your-web/ while the local server runs.
