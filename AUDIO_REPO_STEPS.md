# Step-by-Step: Upload Audio Files to GitHub

## Step 1: Create Repository on GitHub

1. Go to: https://github.com/new
2. **Repository name**: `bittee`
3. **Owner**: Select `bittee-falasteeni`
4. **Description**: `Audio assets for Bittee Falasteeni game - Hosted via GitHub Pages for cross-platform compatibility`
5. **Visibility**: ✅ **Public** (REQUIRED for GitHub Pages)
6. **Initialize this repository with**:
   - ✅ Add a README file
   - ❌ Add .gitignore (not needed for just audio files)
   - ✅ Choose a license → Select **MIT License**
7. Click **"Create repository"**

## Step 2: Clone Repository Locally

Open terminal and run:

```bash
cd ~/Desktop/Bittee
git clone https://github.com/bittee-falasteeni/bittee.git
cd bittee
```

## Step 3: Copy Audio Files

```bash
cp ../bittee-falasteeni/public/assets/audio/*.webm .
```

This copies all 27 WebM audio files to the repository.

## Step 4: Verify Files

```bash
ls -1 *.webm | wc -l
```

Should show: `27`

## Step 5: Add, Commit, and Push

```bash
git add *.webm
git commit -m "Add audio assets for Bittee Falasteeni game"
git push
```

## Step 6: Enable GitHub Pages

1. Go to your repository on GitHub: https://github.com/bittee-falasteeni/bittee
2. Click **Settings** (top menu)
3. Click **Pages** (left sidebar)
4. Under **Source**:
   - Select: **Deploy from a branch**
   - Branch: **main** (or `master` if that's your default)
   - Folder: **/ (root)**
5. Click **Save**
6. Wait 1-2 minutes for GitHub Pages to deploy

## Step 7: Get Your Audio URL

Your audio files will be available at:
- Base URL: `https://bittee-falasteeni.github.io/bittee/`
- Example file: `https://bittee-falasteeni.github.io/bittee/bittee-mawtini1.webm`

## Step 8: Test URL

Open in browser to verify:
```
https://bittee-falasteeni.github.io/bittee/bittee-mawtini1.webm
```

You should hear the audio or see it downloading.

## Step 9: Update Game Code

After confirming GitHub Pages works, I'll update your code to load from GitHub Pages URLs.

---

**Ready? Start with Step 1!** Let me know when you've completed Step 6 (enabled GitHub Pages) and I'll update the code for you.

