# 🚨 MANDATORY SETUP - 2 Commands Only

**⚠️ REQUIRED FOR ALL REPOSITORIES - NO EXCEPTIONS**

## One-Time Setup (30 seconds)

```bash
# 1. Install pre-commit (one-time on your machine)
pip install pre-commit

# 2. Enable security hooks (run in each new repository)
pre-commit install
```

**✅ That's it!** Secret detection now runs automatically on every commit.

## What This Does

- **🚫 BLOCKS COMMITS** containing secrets (API keys, AWS credentials, passwords, tokens)
- **⚡ INSTANT FEEDBACK** - no waiting for CI/CD pipelines
- **🔒 PRIVACY PROTECTION** - secrets never leave your machine
- **📋 CODE QUALITY** - automatic formatting and linting

## Verification

Test it works:
```bash
# This should be blocked:
echo 'api_key = "sk_test_1234567890abcdef"' > test.py
git add test.py && git commit -m "test"
# ❌ COMMIT BLOCKED: Secrets detected!

# Clean up
rm test.py && git reset HEAD
```

## Emergency Override (NOT RECOMMENDED)

```bash
# Only for true emergencies - secrets will still be in git history
git commit --no-verify -m "Emergency commit"
```

---

**🎯 This setup is MANDATORY for all repositories using this CI/CD strategy.**
**No exceptions. No optional installations. No reading documentation first.**

**Just run the 2 commands above in every new repository. ✅**
