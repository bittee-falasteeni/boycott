# Quick Fix for 404 Errors

## The Issue
Files exist locally but aren't loading on GitHub Pages. This means they're either:
- Not uploaded to GitHub yet
- In the wrong location on GitHub
- GitHub Pages hasn't updated (wait 1-2 minutes)

## Quick Test

**Test 1: Check if files are on GitHub**
Visit: https://github.com/nfreajah/bittee/tree/main/assets

**If you see files:** They're uploaded but maybe in wrong location
**If you see nothing:** Files aren't uploaded yet

**Test 2: Check if GitHub Pages can access files**
Visit: https://nfreajah.github.io/bittee/assets/cairo.jpg

**If image shows:** Files are correct, game should work
**If 404 error:** Files are missing or in wrong location

## The Fix

### Step 1: Check Repository Structure
Visit: https://github.com/nfreajah/bittee

**Do you see a `bittee/` subfolder?**
- ❌ **YES** → This is the problem! Delete it.
- ✅ **NO** → Good, continue to Step 2

### Step 2: Upload Files

**Option A: Upload Everything (Easiest)**
1. Go to: https://github.com/nfreajah/bittee
2. Click "Add file" → "Upload files"
3. Open Finder and navigate to: `~/Desktop/Bittee/bittee-falasteeni/dist/assets`
4. Select ALL files and folders inside `assets/`
5. Drag them into GitHub upload area
6. Make sure the path shows `assets/` (not `bittee/assets/`)
7. Commit message: "Upload all game assets"
8. Click "Commit changes"
9. Wait 1-2 minutes for GitHub Pages to update

**Option B: If Option A doesn't work, upload in folders**

1. **Upload images:**
   - Go to `assets/` folder on GitHub
   - Upload all `.png` and `.jpg` files from `dist/assets/`
   - Keep them in `assets/` (not in a subfolder)

2. **Upload audio:**
   - Create `audio/` folder inside `assets/` on GitHub
   - Upload all `.webm` files from `dist/assets/audio/` to `assets/audio/`

3. **Upload power-ups:**
   - Create `bittee/` folder inside `assets/` on GitHub
   - Upload files from `dist/assets/bittee/` to `assets/bittee/`

### Step 3: Verify

After uploading, test:
- https://nfreajah.github.io/bittee/assets/cairo.jpg (should show image)
- https://nfreajah.github.io/bittee/assets/audio/palestine-8bit.webm (should download)

If these work, your game should load!

## Common Mistakes

❌ **Uploading to `bittee/assets/` instead of `assets/`**
- Creates nested folder that's too deep
- Solution: Delete nested folder, upload to root `assets/`

❌ **Not maintaining folder structure**
- Audio must be in `assets/audio/` subfolder
- Power-ups must be in `assets/bittee/` subfolder

❌ **Not waiting for GitHub Pages**
- Changes take 1-2 minutes to update
- Solution: Wait and refresh browser

## Still Not Working?

1. Clear browser cache (Cmd+Shift+R on Mac)
2. Check browser console for exact 404 paths
3. Verify files are at exact paths shown in console errors
4. Make sure no files are in nested `bittee/bittee/assets/` folders

