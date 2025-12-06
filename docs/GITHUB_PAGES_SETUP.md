# GitHub Pages Setup - Complete Game

## Step 1: Update Existing Repository or Create New One

You have two options:

### Option A: Use Existing `bittee` Repository (Recommended)
Since you already have `bittee` repository with audio files, we'll add the game files there.

### Option B: Create New Repository
Create a new repository specifically for the game.

## Step 2: Prepare Files

The `dist` folder is ready with all files including audio. We'll upload everything.

## Step 3: Upload to GitHub

### If Using Existing `bittee` Repository:

```bash
cd ~/Desktop/Bittee/bittee-falasteeni
cd ../bittee  # Go to your existing bittee repo
git pull  # Make sure it's up to date

# Copy all dist files to repository
cp -r ../bittee-falasteeni/dist/* .

# Add, commit, and push
git add .
git commit -m "Add complete Bittee Falasteeni game"
git push
```

### If Creating New Repository:

1. Create new repo on GitHub (public, for GitHub Pages)
2. Clone it:
   ```bash
   cd ~/Desktop/Bittee
   git clone https://github.com/bittee-falasteeni/[repo-name].git
   cd [repo-name]
   ```
3. Copy dist files:
   ```bash
   cp -r ../bittee-falasteeni/dist/* .
   ```
4. Commit and push:
   ```bash
   git add .
   git commit -m "Initial commit - Bittee Falasteeni game"
   git push -u origin main
   ```

## Step 4: Enable GitHub Pages

1. Go to repository Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main` (or `master`)
4. Folder: `/ (root)`
5. Click Save

## Step 5: Your Game URL

After deployment (1-2 minutes), your game will be at:
- `https://bittee-falasteeni.github.io/bittee/` (if using existing repo)
- `https://bittee-falasteeni.github.io/[repo-name]/` (if new repo)

## Step 6: Update Base Path (If Needed)

If your repo name is different from the root, you may need to update `vite.config.ts` base path.

Let me know which option you prefer and I'll guide you through it!

