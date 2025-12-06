# GitHub Upload Guide - Final Version

## File Upload Batches

GitHub limits uploads to 100 files at a time. Here's how to break it up:

---

## BATCH 1: Essential Files (~3 files)

**Upload these files:**
- `index.html`
- `bittee-logo.svg`
- `not_found.html` (if it exists)

**Commit Message:**
```
Initial commit - Core game files
```

**Extended Description:**
```
Essential HTML and logo files for Bittee Falasteeni game.
```

---

## BATCH 2: Audio Files (~35 files)

**Upload:**
- Entire `assets/audio/` folder (all WebM files)

**Commit Message:**
```
Add audio assets
```

**Extended Description:**
```
Add all game audio files including background music, sound effects, and heartbeat sounds (35 WebM files).

Music
Onadekom
Artists: Hawa Dafi, Busher, SJ
Album: Our Story (2015)
Provided by: DistroKid

Mawtini (موطني)
Original: Ibrahim Tuqan, Muhammad Fulayfil (1934)
Instrumental (1967): Recorded by: Derovolk
Chiptune - Provided by: Boo! Bros.

Palestine National Anthem
Fida'i - Revolutionary - فدائي
Original: Said Al Muzayin, Ali Ismael (1965)
Provided by: KSO 8-Bit Anthems

Ounadikom (Music I)
Artist: Ahmad Kaabour
Released: 2019
```

---

## BATCH 3: Image Assets - Part 1 (~35 files)

**Upload:**
- Select about 35 PNG/JPG files from `assets/` root folder
- Include sprites, city backgrounds, brand logos

**Commit Message:**
```
Add image assets (part 1)
```

**Extended Description:**
```
Add game sprites, city backgrounds, and brand logos - first batch of image assets.
```

---

## BATCH 4: Image Assets - Part 2 (~34 files)

**Upload:**
- Remaining PNG/JPG files from `assets/` root folder

**Commit Message:**
```
Add image assets (part 2)
```

**Extended Description:**
```
Add remaining image assets - second batch of sprites and backgrounds.
```

---

## BATCH 5: Remaining Assets (~10-15 files)

**Upload:**
- `assets/*.ttf` (font files)
- `assets/bittee/` folder (power-up icons)
- `assets/balls/` folder (if exists)
- `assets/index-*.js` (game code)
- `assets/index-*.css` (styles)
- `assets/info.png` (info icon)

**Commit Message:**
```
Add fonts, game code, and remaining assets
```

**Extended Description:**
```
Add font files, compiled game code (JS/CSS), power-up icons, and info icon. Complete game build ready for deployment.
```

---

## After All Batches

1. Go to **Settings** → **Pages**
2. Enable GitHub Pages:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/ (root)**
3. Your game will be at: `https://nfreajah.github.io/bittee/`

---

## Quick Reference

**Batch 1:** Essential files (3 files)
- Message: `Initial commit - Core game files`
- Description: `Essential HTML and logo files for Bittee Falasteeni game.`

**Batch 2:** Audio (35 files)
- Message: `Add audio assets`
- Description: (See full text above)

**Batch 3:** Images Part 1 (35 files)
- Message: `Add image assets (part 1)`
- Description: `Add game sprites, city backgrounds, and brand logos - first batch of image assets.`

**Batch 4:** Images Part 2 (34 files)
- Message: `Add image assets (part 2)`
- Description: `Add remaining image assets - second batch of sprites and backgrounds.`

**Batch 5:** Remaining (10-15 files)
- Message: `Add fonts, game code, and remaining assets`
- Description: `Add font files, compiled game code (JS/CSS), power-up icons, and info icon. Complete game build ready for deployment.`

