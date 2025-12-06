# GitHub Upload - Batched Approach

GitHub limits uploads to 100 files at a time. Here's how to break it up:

## Batch 1: Essential Files (~3 files)
**Upload these first:**
- `index.html`
- `bittee-logo.svg`
- `not_found.html` (if it exists)

**Commit message:**
```
Initial commit - Core game files
```

**Extended description:**
```
Essential HTML and logo files for Bittee Falasteeni game.
```

---

## Batch 2: Audio Files (~27 files)
**Upload:**
- Entire `assets/audio/` folder (all WebM files)

**Commit message:**
```
Add audio assets
```

**Extended description:**
```
Add all game audio files including background music, sound effects, and heartbeat sounds (27 WebM files).
```

---

## Batch 3: Image Assets (~50 files)
**Upload:**
- All PNG files in `assets/` root (sprites, logos, etc.)
- All JPG files in `assets/` root (city backgrounds, etc.)

**Commit message:**
```
Add image assets
```

**Extended description:**
```
Add game sprites, city backgrounds, and brand logos (PNG and JPG files).
```

---

## Batch 4: Fonts and Subfolders (~10-20 files)
**Upload:**
- `assets/*.ttf` (font files)
- `assets/bittee/` folder (power-up icons)
- `assets/balls/` folder (if exists)
- `assets/index-*.js` (game code)
- `assets/index-*.css` (styles)

**Commit message:**
```
Add fonts, game code, and remaining assets
```

**Extended description:**
```
Add font files, compiled game code (JS/CSS), and power-up icons. Complete game build ready for deployment.
```

---

## After All Batches

1. Go to **Settings** → **Pages**
2. Enable GitHub Pages:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/ (root)**
3. Your game will be at: `https://nfreajah.github.io/bittee/`

