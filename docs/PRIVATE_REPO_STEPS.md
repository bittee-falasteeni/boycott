# Step-by-Step: Private GitHub Repository for Audio

## Step 1: Create Private Repository on GitHub

1. Go to: https://github.com/new
2. **Repository name**: `bittee-audio` (or any name you prefer)
3. **Owner**: Select `bittee-falasteeni`
4. **Description**: `Private audio assets for Bittee Falasteeni game`
5. **Visibility**: ✅ **Private** (this is important!)
6. **Initialize this repository with**:
   - ❌ Add a README file (not needed)
   - ❌ Add .gitignore (not needed)
   - ❌ Choose a license (not needed for private repo)
7. Click **"Create repository"**

## Step 2: Clone Repository Locally

Open terminal and run:

```bash
cd ~/Desktop/Bittee
git clone https://github.com/bittee-falasteeni/bittee-audio.git
cd bittee-audio
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

You may be prompted for GitHub credentials.

## Step 6: Get Your Raw File URLs

After pushing, your files will be accessible at:

**Base URL format:**
```
https://raw.githubusercontent.com/bittee-falasteeni/bittee-audio/main/[filename].webm
```

**Example URLs:**
- `https://raw.githubusercontent.com/bittee-falasteeni/bittee-audio/main/bittee-mawtini1.webm`
- `https://raw.githubusercontent.com/bittee-falasteeni/bittee-audio/main/bittee-mawtini2.webm`
- `https://raw.githubusercontent.com/bittee-falasteeni/bittee-audio/main/palestine-8bit.webm`
- etc.

## Step 7: Test URL

Open in browser to verify one file works:
```
https://raw.githubusercontent.com/bittee-falasteeni/bittee-audio/main/bittee-mawtini1.webm
```

You should hear the audio or see it downloading.

## Step 8: Update Game Code

After confirming the URL works, I'll update your code to load from these GitHub raw URLs.

---

**Important Notes:**
- ✅ Repository is **private** (not publicly searchable)
- ⚠️ Raw file URLs are accessible to anyone who knows them
- ✅ Files won't appear in public GitHub searches
- ✅ Good middle ground for copyright concerns

**Ready? Start with Step 1!** Let me know when you've completed Step 7 and I'll update the code.

