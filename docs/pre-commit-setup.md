# Pre-Commit Hook Setup

## Overview
Pre-commit hooks run locally **before** commits are created, preventing secrets and quality issues from entering the repository. This is more efficient than CI/CD detection because issues are caught immediately.

## Quick Setup

```bash
# Install pre-commit (one-time setup)
pip install pre-commit

# Install hooks for this repository
pre-commit install

# Test hooks on all files (optional)
pre-commit run --all-files
```

## What Gets Checked

### 🔍 Advanced Secret Detection (6 Patterns)
- **API Keys**: `api_key=abc123...`, `apikey: "sk_test_..."`
- **JWT Tokens**: `eyJhbGciOiJIUzI1NiIs...` (full JWT format)
- **Passwords**: `password="secretpass123"` (8+ characters)
- **AWS Access Keys**: `AKIAIOSFODNN7EXAMPLE` (all AWS key formats)
- **AWS Secret Keys**: `aws_secret="wJalrXUtnFEMI/..."` (40-char base64)
- **Generic Secrets**: `secret_token="base64string=="` (20+ characters)

### 🛡️ Built-in Security
- Private key detection
- YAML/JSON syntax validation
- Code formatting (Python with Black)
- Python security analysis (Bandit)

## Workflow Integration

```mermaid
graph LR
    A[Developer writes code] --> B[git add .]
    B --> C[git commit -m "..."]
    C --> D[Pre-commit hooks run]
    D --> E{Secrets found?}
    E -->|Yes| F[❌ COMMIT BLOCKED]
    E -->|No| G[✅ Commit succeeds]
    F --> H[Fix secrets, retry]
    G --> I[git push]
```

## Manual Testing

```bash
# Test secret detection only
scripts/detect-secrets.sh

# Test specific files
scripts/detect-secrets.sh src/main.py

# Run all pre-commit hooks
pre-commit run --all-files

# Skip hooks for emergency commits (NOT RECOMMENDED)
git commit --no-verify -m "Emergency fix"
```

## Benefits vs CI/CD Detection

| Aspect | Pre-Commit | CI/CD Only |
|--------|------------|-----------|
| **Speed** | Instant local feedback | Wait for CI pipeline |
| **Privacy** | Secrets never leave local machine | Secrets in git history |
| **Cost** | Free local execution | Uses CI/CD minutes |
| **Enforcement** | Blocks commits immediately | Requires discipline to check |
| **Team Sync** | Consistent across all developers | Only on push events |

## Troubleshooting

### Hook Installation Issues
```bash
# Reinstall hooks
pre-commit clean
pre-commit install

# Update hook versions
pre-commit autoupdate
```

### False Positives
Edit `.pre-commit-config.yaml` to exclude specific files:
```yaml
exclude: |
  (?x)(
    test_secrets\.py|
    example_config\.json
  )
```

### Performance
Pre-commit hooks only scan **staged files** by default, making them very fast. Use `--all-files` only when needed.

## Integration with Branch Protection

The pre-commit approach works perfectly with our branching strategy:
- **Feature branches**: Developers catch issues locally before pushing
- **Develop branch**: Only clean commits make it through
- **Main branch**: Extra CI/CD validation as final safety net

This creates a **defense in depth** approach: local hooks + CI/CD validation.
