# 🚀 GitHub Setup Guide

This guide walks you through setting up the GitHub README Game in your repository.

## Step-by-Step Setup

### 1. Install Dependencies

First, make sure you have Node.js installed (version 18 or higher). Then install the required packages:

```bash
npm install
```

This will install `@octokit/rest` which is needed for GitHub API interactions.

### 2. Configure GitHub Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Create a secret named `GROK_API_KEY`
   - **Value**: Your Grok API key from [X.AI](https://x.ai)
   - **Note**: You'll need to sign up for X.AI API access to get your key

### 3. Enable GitHub Actions

1. Go to **Settings** → **Actions** → **General**
2. Under **Workflow permissions**, select:
   - ✅ **Read and write permissions**
   - ✅ **Allow GitHub Actions to create and approve pull requests**
3. Click **Save**

### 4. Create the Game Label

1. Go to **Issues** → **Labels**
2. Click **New label**
3. Create a label with:
   - **Name**: `game-active` (or `game`)
   - **Color**: Choose a color (e.g., green `#0E8A16` or blue `#1D76DB`)
   - **Description**: "Active game session"
4. Click **Create label**

### 5. Test the Setup

1. Create a new issue in your repository
2. Add the `game-active` label to the issue
3. Comment on the issue: `I want to create a character named Test, a Warrior`
4. Check the **Actions** tab to see if the workflow runs
5. You should receive a comment response with your character details

## Troubleshooting

### Workflow Not Triggering

- ✅ Make sure the issue has the `game-active` label
- ✅ Check that GitHub Actions are enabled in repository settings
- ✅ Verify the workflow file is in `.github/workflows/game-action.yml`
- ✅ Check the Actions tab for any error messages

### API Errors

- ✅ Verify `GROK_API_KEY` secret is set correctly
- ✅ Check that your Grok API key is valid and has credits
- ✅ Look at the workflow logs for specific error messages

### Character Creation Not Working

- ✅ Make sure your comment includes both a name and class
- ✅ Format: "I want to create a character named [Name], a [Class]"
- ✅ Check that you don't already have a character in that issue

### State Not Saving

- ✅ Verify the workflow has write permissions for issues
- ✅ Check that the issue body is being updated (look at the issue after an action)

## Verification Checklist

- [ ] Dependencies installed (`npm install` completed)
- [ ] `GROK_API_KEY` secret added to repository
- [ ] GitHub Actions enabled with write permissions
- [ ] `game-active` label created
- [ ] Test issue created and labeled
- [ ] Test character created successfully
- [ ] Test action processed successfully

## Next Steps

Once everything is set up:

1. **Create your first game issue** using the issue template
2. **Invite friends** to create their own characters
3. **Start playing** by commenting actions
4. **Customize the lore** in `docs/lore.md` to match your world
5. **Adjust game mechanics** in the script files as needed

## API Key Setup (X.AI/Grok)

To get a Grok API key:

1. Visit [X.AI](https://x.ai) or the X.AI developer portal
2. Sign up or log in
3. Navigate to API settings
4. Generate a new API key
5. Copy the key and add it as `GROK_API_KEY` in GitHub secrets

**Note**: Make sure your API key has sufficient credits/quota for API calls.

---

That's it! Your game should now be ready to play. Create an issue and start your adventure! 🎮✨

