# Debug 404 Error

## Things to Check:

### 1. Branch Name
GitHub might be using `master` instead of `main`. Try both:
- `https://raw.githubusercontent.com/bittee-falasteeni/bittee/main/bittee-mawtini1.webm`
- `https://raw.githubusercontent.com/bittee-falasteeni/bittee/master/bittee-mawtini1.webm`

### 2. Files in Subfolder?
If you uploaded files to a subfolder, the URL changes:
- Root: `https://raw.githubusercontent.com/bittee-falasteeni/bittee/main/bittee-mawtini1.webm`
- In folder: `https://raw.githubusercontent.com/bittee-falasteeni/bittee/main/audio/bittee-mawtini1.webm`

### 3. Verify Files Are Actually There
1. Go to: https://github.com/bittee-falasteeni/bittee
2. Check if you see the `.webm` files listed
3. Click on one file - what URL does it show?
4. Look at the "Raw" button URL

### 4. GitHub CDN Delay
Sometimes it takes 1-2 minutes for files to be available via raw URLs after upload.

### 5. Check Exact File Name
Make sure the filename matches exactly (case-sensitive):
- `bittee-mawtini1.webm` (not `Bittee-Mawtini1.webm`)

## Quick Test:

1. Go to: https://github.com/bittee-falasteeni/bittee
2. Click on any `.webm` file
3. Click the "Raw" button (top right)
4. Copy that exact URL
5. Test that URL in browser

That's the correct URL format!

