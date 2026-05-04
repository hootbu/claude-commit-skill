---
name: commit
description: Create intelligent git commits following Conventional Commits. Use when the user says "/commit", asks to commit changes, or wants to create git commits. Supports single commit mode (staged changes only) and batch mode (analyzes all changes, groups related ones into multiple logical commits). Triggers on "/commit", "/commit --all", "commit my changes", "commit this".
---

# Intelligent Commit

Create precise, well-structured git commits with automatic change analysis and optional batch grouping.

## Step 0: Show Usage Info

Before doing anything else, display this table to the user:

```
/commit                Staged changes → single commit. Nothing staged → auto batch mode. (English)
/commit --all          Analyze all changes, group into multiple logical commits. (English)
/commit -tr            Commit in Turkish / Türkçe commit mesajı
/commit -en            Commit in English (default)
/commit --all -tr      Batch mode in Turkish
/commit --push         Commit, then auto-push to origin (no flag → asks first)
/commit --all --push   Batch mode, then auto-push at the end
/commit --help / -h    Show this help table and exit
```

If the user passed `--help` or `-h`, **stop here** — do not proceed to the commit flow. The help table above is the complete output.

Otherwise, proceed to gather context.

## Step 0.5: Parse Flags

Parse all flags from the user's input:

| Flag | Behavior |
|------|----------|
| `--help` / `-h` | Show help and exit |
| `--all` | Batch mode (group all changes into multiple commits) |
| `--push` | Auto-push after commit(s); without this flag, the skill asks before pushing |
| `-tr` | Turkish commit messages |
| `-en` | English commit messages (default) |

Flags can be combined (e.g., `/commit --all --push -tr`). Store all chosen flags for the steps that follow.

## Step 1: Gather Context

Run these commands in parallel:

```bash
git status
git diff --cached --stat
git diff --cached
git diff --stat
git log --oneline -10
git branch --show-current
```

For large staged diffs (>500 lines total), use `git diff --cached --stat` first, then selectively read key files with `git diff --cached -- <file>`.

## Step 1.5: Detect Issue References

Scan for issue/ticket references to add as commit footers.

**Sources, in priority order:**

1. **Branch name** (from `git branch --show-current`):

   | Pattern | Footer |
   |---------|--------|
   | `feature/PROJ-123-foo`, `fix/PROJ-123-bar` (uppercase prefix + number) | `Refs: PROJ-123` |
   | `feature/123-foo`, `fix/123-bar`, `123-foo`, `issue-123-foo` | `Closes #123` |
   | No match (e.g. `main`, `dev`, descriptive-only branch) | No footer |

2. **Diff content**: GitHub-style `#123` references appearing in changed code (only when clearly tied to the change, not pre-existing comments).

3. **User-provided**: if the user mentions an issue number in chat before `/commit`, include it.

**Footer rules:**
- Placed after the body, separated by a blank line
- One reference per line
- `Closes #N` for GitHub-style issues; `Refs: KEY-N` for JIRA-style tickets
- Multiple references allowed
- If both `BREAKING CHANGE:` and issue refs exist, `BREAKING CHANGE:` comes first, then a blank line, then issue refs

Example:
```
fix(auth): handle expired refresh tokens

- catch 401 from refresh endpoint and force re-login
- clear secure storage on auth failure

Closes #234
```

If no reference is detected, omit the footer entirely. Do not invent or guess issue numbers.

## Step 2: Determine Mode

| Condition | Mode |
|-----------|------|
| User passed `--all` | **Batch** (all changes) |
| Staged changes exist, no flag | **Single** (staged only) |
| Nothing staged, unstaged/untracked exist | **Batch** (auto-detected, inform user) |
| No changes at all | **Abort**: "No changes to commit." |
| Merge conflict markers in status | **Abort**: "Resolve merge conflicts before committing." |

When auto-switching to batch: inform the user "Nothing staged. Analyzing all changes for batch commit."

## Single Commit Mode

### Analyze

Read `git diff --cached` output. Skip binary file contents. For lock files (package-lock.json, yarn.lock, etc.), note their presence but do not base the message on their contents.

### Generate Commit Message

Format: `type(scope): concise imperative description`

**Type selection:**

| Type | When |
|------|------|
| `feat` | New functionality or capability |
| `fix` | Bug fix or error correction |
| `refactor` | Code restructuring, no behavior change |
| `perf` | Performance improvement |
| `style` | Formatting, whitespace only |
| `docs` | Documentation only |
| `test` | Adding or updating tests |
| `chore` | Build, tooling, dependencies, config |
| `ci` | CI/CD pipeline changes |
| `security` | Security hardening or vulnerability fix |
| `revert` | Reverting a previous commit |

**Breaking changes:**

When a change breaks backward compatibility, append `!` after the type/scope and add a `BREAKING CHANGE:` footer.

Detect a breaking change when any of these apply:
- **Public API**: function/method removed, signature changed, required parameter added
- **Schema**: column/table dropped, type changed, NOT NULL added without default
- **Config**: env var or config key removed/renamed, default behavior reversed
- **HTTP**: route removed, response shape changed, status code semantics changed
- **Library exports**: exported symbol removed or renamed

The `BREAKING CHANGE:` footer goes after the body (blank line separated) and explains:
1. What broke
2. Migration path for existing callers

Example:
```
feat(api)!: drop legacy /v1 user endpoints

- remove /api/v1/users route handler
- update internal callers to use /api/v2/users
- return 410 Gone for /v1 paths

BREAKING CHANGE: clients calling /api/v1/users must migrate
to /api/v2/users. The `name` field is renamed to `full_name`.
```

If both `BREAKING CHANGE:` and issue references exist, `BREAKING CHANGE:` comes first, then a blank line, then issue refs.

**Scope rules:**
- Derive from the primary directory or module affected
- Lowercase, single word when possible: `db`, `ui`, `api`, `auth`, `wizard`, `pdf`
- Omit scope if changes span 3+ unrelated modules
- Match scopes used in recent `git log` output when applicable

**Message rules:**
- Imperative mood ("add", "fix", "update" — not "added", "fixes", "updates")
- Lowercase first letter after colon
- Max 72 characters total (type + scope + description)
- No trailing period
- Be specific: "add retry logic for failed API calls" not "update API code"
- Focus on WHAT and WHY, not HOW

**Body (always required, bullet-point format):**
- Blank line after subject
- Each bullet starts with `- `
- Each bullet describes a single change/action
- Imperative mood (EN: "add", "remove", "update" / TR: "ekle", "kaldır", "güncelle")
- Wrap at 72 characters

**Language behavior:**

| Flag | `type(scope):` | Subject line | Body bullets |
|------|----------------|-------------|--------------|
| `-en` / default | English | English | English |
| `-tr` | English | Türkçe | Türkçe |

The `type(scope):` prefix always stays in English (conventional commits standard).

Example (Turkish):
```
feat(onboarding): compact layout ve dil seçici bottom sheet ekle

- SingleChildScrollView yapısını kaldır, Spacer tabanlı responsive layout'a geç
- Başlık fontunu 48→36, mosque ikonunu 80→64, spacing'leri küçült
- Yerine tek dil butonu (bayrak + ad + ▼) ve modal bottom sheet ekle
```

Example (English):
```
feat(auth): add token refresh logic for expired sessions

- Add automatic retry when access token returns 401
- Store refresh token in secure storage instead of shared prefs
- Remove manual logout on token expiry, replace with silent refresh
```

**NEVER include:**
- Co-Authored-By lines
- AI/tool attribution ("Generated by", "Created with")
- Emoji in commit messages
- Vague messages ("update code", "fix stuff", "minor changes")

### Execute

```bash
git commit -m "$(cat <<'EOF'
type(scope): subject line

- First change description
- Second change description
- Third change description
EOF
)"
```

Run `git status` after to verify success and display the result.

Then proceed to **Push** (below).

## Batch Commit Mode

### Step 1: Inventory Changes

```bash
git status --porcelain
```

Parse each line: status code + file path.

### Step 2: Group Changes

Read `references/grouping-algorithm.md` for the detailed grouping procedure.

**Quick summary:** Group files by logical affinity:
1. Co-dependent files (implementation + test, component + styles)
2. Manifest + lock file pairs (package.json + package-lock.json)
3. Same feature/module directory
4. Same change type (all config, all docs)
5. Remaining files form catch-all group

Target: 2-5 commits. Never exceed 7. If only 1 group results, fall back to single commit mode.

### Step 3: Present Plan

Display the commit plan before executing:

```
Proposed commits:

1. feat(wizard): add discount calculation to pricing step
   - src/components/wizard/PricingStep.tsx
   - src/lib/pricing.ts

2. fix(db): correct meeting balance view
   - supabase/migrations/20250102_fix_balance.sql

3. chore: update dependencies
   - package.json
   - package-lock.json
```

Ask: **"Proceed with these commits?"** and wait for user confirmation.

### Step 4: Execute Sequentially

For each group in order:

1. Reset staging area: `git reset` (only if previous staging exists)
2. Stage group files: `git add <file1> <file2> ...`
3. Generate commit message (same rules as single mode)
4. Execute: `git commit -m "..."`
5. Verify: `git status`

**If any commit fails** (pre-commit hook, etc.): stop immediately, report the error, do NOT continue to next group. Never use `--no-verify` unless the user explicitly requests it.

### Step 5: Summary

After all commits succeed:

```
Created 3 commits:
  abc1234 feat(wizard): add discount calculation to pricing step
  def5678 fix(db): correct meeting balance view
  ghi9012 chore: update dependencies
```

Then proceed to **Push** (below).

## Push

After commit(s) succeed, push behavior depends on the `--push` flag:

| Flag state | Behavior |
|------------|----------|
| `--push` present | Push immediately, no prompt |
| `--push` absent | Ask: `Push N new commit(s) to origin/<branch>? (y/N)` — empty input or `n` skips |

**Push command selection:**
- Branch has upstream tracking set: `git push`
- Branch has no upstream: `git push -u origin <branch>` (sets upstream)
- Detached HEAD: skip with message `Cannot push from detached HEAD`
- No remote named `origin`: skip with message `No 'origin' remote configured`

**On failure (rejected, non-fast-forward, network error, pre-push hook):**
- Report the git error verbatim
- Do NOT retry automatically
- Do NOT use `--force` or any force variant unless the user explicitly requests it later
- Tell the user to resolve the issue and run `git push` themselves

**On success:** show a one-line summary, e.g. `Pushed to origin/main (39d4112..a1b2c3d)`.

If the user declines the prompt, end with `Skipped push. Run \`git push\` when ready.`

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Binary files | Include in commit, do not analyze content, note as "add/update binary assets" |
| Lock files | Always group with their manifest file, never standalone commit |
| Very large diffs (>1000 lines/file) | Use `--stat` + read first 100 lines for context |
| Untracked files only | Stage and commit normally, usually `feat` or `chore` |
| Submodule changes | Note in message, do not analyze submodule internals |
| Pre-commit hook failure | Report clearly, do NOT retry, suggest user fix and re-run `/commit` |
| Empty staging after auto-detect | Switch to batch mode, inform user |
