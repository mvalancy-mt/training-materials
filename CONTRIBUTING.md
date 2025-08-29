# Contributing to Training Materials

## 🚨 MANDATORY FIRST STEP

**Before making ANY changes, you MUST run this setup:**

```bash
pip install pre-commit && pre-commit install
```

**This is NON-NEGOTIABLE. All pull requests from repositories without pre-commit hooks will be rejected.**

## Why This Matters

- **🚫 Prevents secrets** from being committed (API keys, AWS credentials, passwords)
- **🔒 Protects the organization** from credential exposure
- **⚡ Saves CI/CD costs** by catching issues locally
- **📋 Ensures code quality** through automated checks

## Verification

Test your setup works:
```bash
# This should BLOCK the commit:
echo 'api_key = "sk_test_1234567890abcdef"' > test.py
git add test.py && git commit -m "test"
# Expected: ❌ COMMIT BLOCKED: Secrets detected!

# Clean up
rm test.py && git reset HEAD
```

## Contributing Process

1. **Fork the repository**
2. **🚨 MANDATORY: Run setup** (`pip install pre-commit && pre-commit install`)
3. **Create feature branch** following naming convention: `feature/description`
4. **Push branch immediately** (PUSH FIRST, WORK SECOND - see README.md)
5. **Make changes** with frequent commits
6. **Submit pull request** to `develop` branch

## Branch Strategy

- `main` - Production ready (protected, ultra-strict CI)
- `develop` - Integration branch (protected, comprehensive CI)
- `feature/*` - New features (basic CI)
- `bugfix/*` - Bug fixes (basic CI)
- `hotfix/*` - Production emergency fixes (ultra-strict CI)

## Code Standards

- **Security**: No secrets in code - use environment variables
- **Quality**: All pre-commit checks must pass
- **Testing**: Include tests for new functionality
- **Documentation**: Update README.md for significant changes

## Pre-commit Hooks

The following checks run automatically on every commit:

- **🔍 Advanced Secret Detection** (6 patterns: API keys, JWT tokens, passwords, AWS credentials)
- **🔒 Private Key Detection**
- **📝 Code Formatting** (language-specific)
- **🛡️ Security Analysis** (Bandit for Python)
- **✅ Syntax Validation** (YAML, JSON)

## Questions?

1. Read [SETUP.md](SETUP.md) for setup details
2. Check existing [GitHub Issues](https://github.com/mvalancy-mt/training-materials/issues)
3. Create new issue if needed

---

**Remember: The first command you run in any new repository should be:**
```bash
pip install pre-commit && pre-commit install
```

**No exceptions. This is mandatory for all contributors.**
