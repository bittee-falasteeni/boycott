# GitHub Repository Setup Guide for Audio Assets

## Repository Settings

### Basic Information
- **Repository name**: `bittee`
- **Owner**: `bittee-falasteeni`
- **Description**: `Audio assets for Bittee Falasteeni game - Hosted via GitHub Pages for cross-platform compatibility`
- **Visibility**: ✅ **Public** (REQUIRED - GitHub Pages free tier only works with public repos)

### Initialization Options
- ✅ **Add a README file** - Yes, recommended
- ✅ **Add .gitignore** - Optional (not needed for just audio files)
- ✅ **Choose a license** - Yes, recommended (MIT License is good for open source)

## Best File Type for Audio

**Use WebM format** - This is what we've already converted to. WebM is:
- ✅ Widely supported by modern browsers
- ✅ Good compression (smaller file sizes)
- ✅ Open standard (no licensing issues)
- ✅ Works well with Phaser.js audio system
- ✅ Served efficiently via GitHub Pages

## After Creating the Repository

1. **Clone the repository:**
   ```bash
   git clone https://github.com/bittee-falasteeni/bittee.git
   cd bittee
   ```

2. **Copy audio files:**
   ```bash
   cp ../bittee-falasteeni/public/assets/audio/*.webm .
   ```

3. **Commit and push:**
   ```bash
   git add *.webm
   git commit -m "Add audio assets for Bittee Falasteeni game"
   git push
   ```

4. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` (or `master`)
   - Folder: `/ (root)`
   - Click Save

5. **Update game code** to load from GitHub Pages URL:
   - Base URL: `https://bittee-falasteeni.github.io/bittee/`
   - Example: `https://bittee-falasteeni.github.io/bittee/bittee-mawtini1.webm`

## README.md Content Suggestion

```markdown
# Bittee Audio Assets

Audio assets repository for the [Bittee Falasteeni](https://bittee-falasteeni.neocities.org) game.

This repository hosts audio files in WebM format, served via GitHub Pages for compatibility with hosting platforms that restrict audio file uploads.

## Usage

Audio files are accessed via GitHub Pages:
- Base URL: `https://bittee-falasteeni.github.io/bittee/`
- Example: `https://bittee-falasteeni.github.io/bittee/bittee-mawtini1.webm`

## License

[Your chosen license - MIT recommended]
```

## License Recommendation

**MIT License** is a good choice because:
- ✅ Permissive (allows commercial use)
- ✅ Simple and widely understood
- ✅ Compatible with most projects
- ✅ Good for open source games

