# Complete Upload Guide - Fix 404 Errors

## The Problem
Files are getting 404 errors because they're either:
1. Not uploaded yet
2. In the wrong location
3. GitHub Pages hasn't updated (can take 1-2 minutes)

## Step 1: Verify Files Exist Locally

Your files should be in: `dist/assets/`

Check that these key files exist:
- `dist/assets/cairo.jpg`
- `dist/assets/bittee-stand.png`
- `dist/assets/audio/palestine-8bit.webm`

## Step 2: Verify GitHub Repository Structure

Go to: https://github.com/nfreajah/bittee

**CORRECT structure:**
```
bittee/ (repository root)
├── index.html
├── bittee-logo.svg
├── assets/
│   ├── cairo.jpg  ← Should be HERE
│   ├── bittee-stand.png  ← Should be HERE
│   ├── audio/
│   │   └── palestine-8bit.webm  ← Should be HERE
│   └── bittee/
│       └── time.png  ← Should be HERE
```

**WRONG structure (if you see this, delete it):**
```
bittee/ (repository root)
└── bittee/ (subfolder - DELETE THIS!)
    └── assets/
        └── (files here - TOO DEEP!)
```

## Step 3: Test Direct URLs

After uploading, test these URLs in your browser:

1. **Image test:**
   - `https://nfreajah.github.io/bittee/assets/cairo.jpg`
   - Should show the Cairo image
   - If 404, file is missing or in wrong location

2. **Audio test:**
   - `https://nfreajah.github.io/bittee/assets/audio/palestine-8bit.webm`
   - Should download the audio file
   - If 404, file is missing or in wrong location

3. **Check GitHub directly:**
   - `https://github.com/nfreajah/bittee/tree/main/assets`
   - Should show all your image files
   - If empty, files aren't uploaded

## Step 4: Upload Process

### Option A: Upload Everything at Once (Recommended)

1. Go to: https://github.com/nfreajah/bittee
2. Click "Add file" → "Upload files"
3. Drag and drop the **entire `dist/assets` folder** from your computer
4. Make sure it uploads to the `assets/` folder at repository root (not in a subfolder)
5. Commit with message: "Upload all game assets"
6. Wait 1-2 minutes for GitHub Pages to update

### Option B: Upload in Batches (If Option A fails)

**Batch 1: Images (Level backgrounds)**
- Upload all `.jpg` files from `dist/assets/` to `assets/` folder
- Files: `cairo.jpg`, `gaza.jpg`, `paris.jpg`, etc.

**Batch 2: Images (Bittee sprites)**
- Upload all `bittee-*.png` files from `dist/assets/` to `assets/` folder
- Files: `bittee-stand.png`, `bittee-run-right1.png`, etc.

**Batch 3: Images (Other)**
- Upload remaining `.png` files from `dist/assets/` to `assets/` folder
- Files: `rock.png`, `jet.png`, `tank.png`, `info.png`, etc.

**Batch 4: Audio**
- Upload entire `audio/` folder from `dist/assets/audio/` to `assets/audio/` folder
- All `.webm` files

**Batch 5: Fonts**
- Upload `.ttf` files from `dist/assets/` to `assets/` folder
- Files: `Montserrat-Regular-*.ttf`, `Montserrat-Bold-*.ttf`

**Batch 6: Power-ups**
- Upload files from `dist/assets/bittee/` to `assets/bittee/` folder
- Files: `time.png`, `shield.png`, `life.png`

## Step 5: Verify After Upload

1. Wait 1-2 minutes for GitHub Pages to update
2. Test the game: https://nfreajah.github.io/bittee/
3. Check browser console for any remaining 404 errors
4. If still getting 404s, verify file locations using Step 3 URLs

## Common Mistakes

❌ **Uploading to `bittee/assets/` instead of `assets/`**
- This creates a nested folder that's too deep
- Solution: Delete nested folder, upload to root `assets/`

❌ **Uploading individual files instead of maintaining folder structure**
- Audio files must be in `assets/audio/` subfolder
- Power-ups must be in `assets/bittee/` subfolder

❌ **Not waiting for GitHub Pages to update**
- Changes can take 1-2 minutes to propagate
- Solution: Wait and refresh

## Quick Checklist

- [ ] All files exist in `dist/assets/` locally
- [ ] Files uploaded to `assets/` at repository root (not nested)
- [ ] Audio files in `assets/audio/` subfolder
- [ ] Power-ups in `assets/bittee/` subfolder
- [ ] Test URLs work (Step 3)
- [ ] Waited 1-2 minutes after upload
- [ ] Game loads without 404 errors

