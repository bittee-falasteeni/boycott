# Upload All Missing Assets

## Problem
All images, fonts, and audio files are missing from GitHub, causing 404 errors.

## Solution: Upload All Assets

You need to upload everything from your `dist/assets/` folder to GitHub's `assets/` folder.

### Step 1: Go to Assets Folder
1. Visit: https://github.com/nfreajah/bittee
2. Navigate to the `assets/` folder (at repository root, not in a subfolder)

### Step 2: Upload in Batches

#### BATCH A: Image Files (~70 files)
**Upload all PNG and JPG files directly into `assets/` folder:**
- All `bittee-*.png` files (stand, crouch, run, jump, throw, taunt)
- `rock.png`, `rock1.png`
- All city backgrounds: `nyc.jpg`, `sydney.jpg`, `tokyo.jpg`, etc.
- All brand logos: `google.png`, `amazon.png`, `cocacola.png`, etc.
- `jet.png`, `tank.png`
- `info.png`
- `contrail1.png`, `contrail2.png`
- All `gaza*.jpg` files

**Commit Message:**
```
Add image assets
```

**Extended Description:**
```
Add all game sprites, city backgrounds, brand logos, and visual assets.
```

---

#### BATCH B: Font Files (2 files)
**Upload into `assets/` folder:**
- `Montserrat-Regular-DSMaiNLM.ttf`
- `Montserrat-Bold-zok-pVqG.ttf`

**Commit Message:**
```
Add font files
```

**Extended Description:**
```
Add Montserrat font files for game UI text.
```

---

#### BATCH C: Audio Folder (~27 files)
**Upload entire `audio/` folder into `assets/` folder:**
1. Click "Add file" → "Upload files"
2. Make sure you're in `assets/` folder
3. Create `audio/` subfolder if it doesn't exist
4. Upload all 27 WebM files from `dist/assets/audio/`

**Commit Message:**
```
Add audio assets
```

**Extended Description:**
```
Add all game audio files including background music, sound effects, and heartbeat sounds (27 WebM files).

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

#### BATCH D: Bittee Folder (3 files)
**Upload entire `bittee/` folder into `assets/` folder:**
1. Make sure you're in `assets/` folder
2. Create `bittee/` subfolder if it doesn't exist
3. Upload:
   - `life.png`
   - `shield.png`
   - `time.png`

**Commit Message:**
```
Add power-up icons
```

**Extended Description:**
```
Add power-up icon sprites (life, shield, time).
```

---

## Final Structure Should Be:
```
bittee/ (repository root)
├── index.html
├── bittee-logo.svg
└── assets/
    ├── index-BlH1aoK_.js
    ├── index-Dn9nF3Qo.css
    ├── *.png (all image files)
    ├── *.jpg (all background images)
    ├── *.ttf (font files)
    ├── audio/
    │   └── *.webm (all audio files)
    └── bittee/
        ├── life.png
        ├── shield.png
        └── time.png
```

## Quick Upload Option

If you want to upload everything at once (if under 100 files per batch):
1. Go to `assets/` folder
2. Upload all PNG/JPG files (split into 2 batches if needed)
3. Upload fonts
4. Upload audio folder
5. Upload bittee folder

After all assets are uploaded, the game should work!

