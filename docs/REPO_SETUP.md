# GitHub Repository Setup Guide

## Repository Settings

### Name
`bittee`

### Description
```
Bittee Falasteeni - A retro-style platformer game built with Phaser 3. Help Bittee navigate through cities, avoid obstacles, and fight for freedom.
```

Or shorter:
```
Bittee Falasteeni - A retro platformer game built with Phaser 3
```

### Visibility
**Public** ✅
- GitHub Pages works with public repos (free tier)
- Even with Pro subscription, public is better for a game that should be accessible
- Private repos can use GitHub Pages, but it's less common for public-facing games

### .gitignore
**Yes, add it** ✅

Use this `.gitignore`:
```
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Build output
dist/
.vite/

# Environment
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Temporary files
*.tmp
.cache/
```

### License
**MIT License** ✅ (Recommended)
- Most permissive
- Allows others to use/modify
- Standard for open-source projects
- Good for games

Alternative: **Unlicense** (even more permissive, public domain)

### Copilot Prompt
**Skip it** ❌
- We already have all files ready
- No need for generated code
- Just upload the existing files

## After Repository Creation

1. **Clone the repository**:
   ```bash
   cd ~/Desktop/Bittee
   git clone https://github.com/nfreajah/bittee.git
   cd bittee
   ```

2. **Copy game files**:
   ```bash
   cp -r ../bittee-falasteeni/dist/* .
   ```

3. **Add, commit, push**:
   ```bash
   git add .
   git commit -m "Initial commit - Bittee Falasteeni game"
   git push -u origin main
   ```

4. **Enable GitHub Pages**:
   - Go to: Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main`
   - Folder: `/ (root)`
   - Save

5. **Your game URL**:
   `https://nfreajah.github.io/bittee/`

