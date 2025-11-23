# Handling Uncommitted Changes

This document provides guidelines for managing uncommitted changes in the Arnav Abacus Academy repository.

## Overview

Uncommitted changes refer to modifications in your working directory that haven't been committed to the git history. Proper management of these changes is crucial for maintaining a clean and collaborative development workflow.

## Checking for Uncommitted Changes

### Using Helper Scripts

We provide helper scripts to check for uncommitted changes:

**Linux/macOS:**
```bash
./check-uncommitted.sh
```

**Windows (PowerShell):**
```powershell
./check-uncommitted.ps1
```

**Strict Mode:**
Both scripts support a strict mode that exits with an error code if changes are detected:

```bash
./check-uncommitted.sh --strict
```

```powershell
./check-uncommitted.ps1 -Strict
```

### Manual Git Commands

You can also check manually:

```bash
# Check status
git status

# See short status
git status --short

# Check if working tree is clean
git diff-index --quiet HEAD --
```

## Handling Uncommitted Changes

### 1. Commit Your Changes

If your changes are complete and ready:

```bash
# Stage all changes
git add .

# Or stage specific files
git add path/to/file

# Commit with a descriptive message
git commit -m "feat: add feature description"

# Push to remote
git push
```

### 2. Stash Your Changes

If you need to switch branches or pull updates but want to keep your work:

```bash
# Stash current changes
git stash save "work in progress on feature X"

# List stashes
git stash list

# Apply most recent stash
git stash apply

# Apply and remove stash
git stash pop

# Apply specific stash
git stash apply stash@{0}
```

### 3. Discard Your Changes

**⚠️ Warning: This is permanent and cannot be undone!**

```bash
# Discard changes to specific file
git checkout -- path/to/file

# Discard all changes
git checkout -- .

# Remove untracked files (dry run first)
git clean -n

# Remove untracked files
git clean -f

# Remove untracked files and directories
git clean -fd
```

### 4. Create a Temporary Branch

If you want to save your work but aren't ready to commit to the current branch:

```bash
# Create new branch with current changes
git checkout -b temp/my-work

# Commit changes
git add .
git commit -m "WIP: temporary work"

# Switch back to original branch
git checkout main

# Later, merge or cherry-pick from temp branch
```

## Common Scenarios

### Before Pulling Updates

```bash
# Option 1: Commit your changes
git add .
git commit -m "feat: my changes"
git pull

# Option 2: Stash, pull, then reapply
git stash
git pull
git stash pop
```

### Before Switching Branches

```bash
# Ensure clean working tree
git status

# If changes exist, commit or stash
git stash save "WIP on branch-name"

# Switch branches
git checkout other-branch

# Return and restore
git checkout original-branch
git stash pop
```

### Before Running Tests or Builds

Some operations require a clean working tree:

```bash
# Check for uncommitted changes
./check-uncommitted.sh --strict

# If changes exist, handle them appropriately
```

## Best Practices

### Development Workflow

1. **Commit frequently**: Small, focused commits are better than large ones
2. **Write clear commit messages**: Follow conventional commit format
3. **Don't commit sensitive data**: Never commit credentials, API keys, or secrets
4. **Test before committing**: Ensure your code works before committing
5. **Review your changes**: Use `git diff` before `git add`

### Commit Message Format

Follow conventional commits:

```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat: add student age calculation
fix: resolve attendance date validation issue
docs: update API endpoint documentation
refactor: simplify fee calculation logic
test: add unit tests for auth service
chore: update dependencies
```

### Files to Never Commit

The following should always be in `.gitignore`:

- `node_modules/`
- `.env` and `.env.local` files
- Build artifacts (`dist/`, `build/`, `.next/`)
- Database files (`*.db`, `*.sqlite`)
- Log files (`*.log`)
- IDE config files (`.vscode/`, `.idea/`)
- OS files (`.DS_Store`, `Thumbs.db`)

## Integrating with CI/CD

### Pre-commit Hooks

You can automate checks using git hooks. Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash
# Check for uncommitted changes before allowing commit
./check-uncommitted.sh --strict
```

### GitHub Actions

Add a workflow to check for uncommitted changes after build:

```yaml
- name: Check for uncommitted changes
  run: |
    if ! git diff-index --quiet HEAD --; then
      echo "Uncommitted changes detected after build!"
      git status
      exit 1
    fi
```

## Troubleshooting

### "Cannot pull with uncommitted changes"

```bash
# Commit your changes
git add .
git commit -m "feat: my changes"
git pull

# OR stash and reapply
git stash
git pull
git stash pop
```

### "Merge conflict after stash pop"

```bash
# Resolve conflicts manually
# Edit conflicting files

# Mark as resolved
git add <resolved-files>

# Drop the stash entry
git stash drop
```

### "Accidentally committed to wrong branch"

```bash
# Undo last commit but keep changes
git reset --soft HEAD~1

# Switch to correct branch
git checkout correct-branch

# Commit
git add .
git commit -m "your message"
```

## Tools and Commands Reference

### Viewing Changes

```bash
# Show unstaged changes
git diff

# Show staged changes
git diff --cached

# Show changes in specific file
git diff path/to/file

# Show last commit
git show HEAD
```

### Staging Changes

```bash
# Stage all changes
git add .

# Stage specific file
git add path/to/file

# Stage parts of a file interactively
git add -p path/to/file

# Unstage file
git reset HEAD path/to/file
```

### Undoing Changes

```bash
# Undo last commit, keep changes
git reset --soft HEAD~1

# Undo last commit, discard changes
git reset --hard HEAD~1

# Revert a specific commit (creates new commit)
git revert <commit-hash>
```

## Getting Help

If you're unsure about handling uncommitted changes:

1. Run `./check-uncommitted.sh` to see what's changed
2. Use `git status` for detailed information
3. Check this documentation for common scenarios
4. Ask the team for guidance
5. When in doubt, create a backup branch: `git checkout -b backup/my-work`

## Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Git Guides](https://github.com/git-guides)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Stash Documentation](https://git-scm.com/docs/git-stash)

---

Remember: When dealing with uncommitted changes, it's always safer to save your work (commit or stash) rather than discard it!
