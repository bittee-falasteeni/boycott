# GitHub Upload Guide

## What to Upload

Upload **ALL files and folders** from the `dist` folder:
- ✅ `index.html` (main game file)
- ✅ `assets/` folder (entire folder with all subfolders)
  - `assets/audio/` (all 27 WebM audio files)
  - `assets/` (all images, fonts, etc.)
- ✅ `bittee-logo.svg`
- ✅ `not_found.html` (if present)

**How to upload:**
1. Go to your repository: https://github.com/nfreajah/bittee
2. Click **"Add file"** → **"Upload files"**
3. **Drag and drop** the entire contents of the `dist` folder
   - Select all files and folders
   - Make sure `assets/` folder and all its contents are included
4. Scroll down to commit section

## Commit Message

### Main Commit Message (Required):
```
Initial commit - Bittee Falasteeni game
```

### Extended Description (Optional but Recommended):
```
Complete game build with all assets, audio files, and game code. Ready for GitHub Pages deployment.

Includes:
- Full game implementation with Phaser 3
- All audio assets (27 WebM files)
- All image assets and sprites
- Complete game logic and UI
```

**OR shorter version:**
```
Complete game build with all assets and code. Ready for GitHub Pages deployment.
```

## After Upload

1. Click **"Commit changes"**
2. Go to **Settings** → **Pages**
3. Enable GitHub Pages:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/ (root)**
   - Click **Save**
4. Wait 1-2 minutes for deployment
5. Your game will be live at: **https://nfreajah.github.io/bittee/**

