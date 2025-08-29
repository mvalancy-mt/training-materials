# Git Branching Strategy & CI/CD Workflow

## Overview

This document outlines the **GitFlow-inspired branching strategy** used throughout these training materials, emphasizing **ruthless branch management** and **temporary feature branches**.

## Branch Structure

```
┌─────────────────────────────────────────────────────────────┐
│                        BRANCH HIERARCHY                     │
└─────────────────────────────────────────────────────────────┘

main           ←─── PROTECTED (No direct pushes)
│              ←─── Ultra-strict CI/CD (100% test coverage)
│              ←─── Production releases only
│
├── develop    ←─── Integration branch (Work in Progress)  
│   │          ←─── Basic CI checks on push
│   │          ←─── Strict CI on PR to main
│   │
│   ├── feature/add-user-auth     ⚡ TEMPORARY
│   ├── feature/dashboard-ui      ⚡ TEMPORARY  
│   ├── hotfix/security-patch     ⚡ TEMPORARY
│   └── bugfix/login-validation   ⚡ TEMPORARY
│
└── Archive deleted after merge ☠️ RUTHLESS DELETION
```

## CI/CD Pipeline Strategy

### 🔥 Different CI Strictness Levels

| Branch Type | CI Trigger | Test Coverage | Security Scans | Container Build |
|-------------|------------|---------------|----------------|-----------------|
| `main` | Push/PR | **100%** Required | ✅ Full Suite | ✅ Multi-arch |
| `develop` | Push | **95%** Required | ✅ Full Suite | ✅ Basic |
| `feature/*` | Push | **90%** Required | ✅ Basic | ❌ Skip |
| `hotfix/*` | Push | **100%** Required | ✅ Full Suite | ✅ Basic |

### 🚨 Ultra-Strict PR Rules (main branch)

```yaml
# Only activated for PRs targeting main
strict-pr-checks:
  if: github.event_name == 'pull_request' && github.base_ref == 'main'
  steps:
    - name: 🛡️ Advanced Security Scanning
    - name: 📊 100% Code Coverage Required
    - name: 🔍 Zero Tolerance Quality Gates
    - name: 🧪 Integration Test Suite
```

## Workflow Examples

### 1. Feature Development

```bash
# Start from develop
git checkout develop
git pull origin develop

# Create temporary feature branch
git checkout -b feature/user-profile-api

# Work, commit, push
git add .
git commit -m "Add user profile endpoints"
git push -u origin feature/user-profile-api

# Create PR to develop (basic CI)
gh pr create --base develop --title "Add User Profile API"

# After merge - RUTHLESS DELETION 
git branch -d feature/user-profile-api
git push origin --delete feature/user-profile-api
```

### 2. Release Process

```bash
# When develop is ready for production
git checkout develop
git pull origin develop

# Create PR from develop → main (ULTRA-STRICT CI)
gh pr create --base main --title "Release v2.1.0"

# CI Pipeline runs with maximum strictness:
# ✅ 100% test coverage required
# ✅ Advanced security scanning  
# ✅ Container vulnerability scans
# ✅ Performance benchmarks
# ✅ Documentation updates

# After successful merge to main:
# 🚀 Automatic production deployment
# 🏷️ Git tag created automatically
# 📦 Container images built and published
```

### 3. Hotfix Workflow

```bash
# Critical production issue
git checkout main
git checkout -b hotfix/security-vulnerability

# Fix and test
git commit -m "Fix authentication bypass vulnerability"

# Push triggers strict CI (hotfix = production-ready)
git push -u origin hotfix/security-vulnerability

# PR directly to main (ultra-strict CI)
gh pr create --base main --title "SECURITY: Fix auth bypass"

# Emergency merge process
# After merge - immediate cleanup
git branch -d hotfix/security-vulnerability
git push origin --delete hotfix/security-vulnerability
```

## CI/CD Pipeline Visualization

```
┌─────────────────────────────────────────────────────────────┐
│                    CI/CD PIPELINE FLOW                     │
└─────────────────────────────────────────────────────────────┘

Push to feature/*
       │
       ├── 🧪 Basic Tests (90% coverage)
       ├── 🔍 Security Scan (basic)
       └── ✅ Code Quality Check

Push to develop  
       │
       ├── 🧪 Comprehensive Tests (95% coverage)
       ├── 🔍 Full Security Suite
       ├── 🐳 Container Build (basic)
       └── ✅ Integration Tests

PR to main (ULTRA-STRICT)
       │
       ├── 🚨 MANDATORY: 100% Test Coverage
       ├── 🛡️ Advanced Security Scanning
       ├── 🔍 Secret Detection (5 patterns)
       ├── 🐳 Multi-arch Container Build
       ├── 🎯 Performance Benchmarks  
       └── 📋 Detailed CI Summary Report

Push to main
       │
       ├── 🚀 Production Deployment
       ├── 🏷️ Automatic Git Tagging
       ├── 📦 Container Registry Push
       └── 📊 Monitoring & Alerts
```

## Branch Protection Rules

### Main Branch Protection 🔒

```yaml
branch_protection_rules:
  main:
    protect: true
    required_status_checks:
      strict: true
      contexts:
        - "Security & Quality Analysis"
        - "Container Build & Security Scan" 
        - "Strict PR Review"
    enforce_admins: true
    require_pull_request_reviews:
      required_approving_review_count: 2
      dismiss_stale_reviews: true
      restrict_pushes: true
    restrictions:
      push: [] # Nobody can push directly
```

### Develop Branch Protection ⚡

```yaml
branch_protection_rules:
  develop:
    protect: true  
    required_status_checks:
      contexts:
        - "Security & Quality Analysis"
    require_pull_request_reviews:
      required_approving_review_count: 1
```

## Key Principles

### ☠️ Ruthless Branch Management

1. **Temporary Branches**: All `feature/*`, `bugfix/*`, `hotfix/*` branches are TEMPORARY
2. **Immediate Deletion**: Delete branches immediately after merge
3. **No Long-lived Features**: Features should be small, frequent, and short-lived
4. **Clean History**: Maintain clean, linear history on `main` and `develop`

### 🚨 CI/CD Strictness Escalation  

1. **Feature Branches**: Basic validation (fast feedback)
2. **Develop Branch**: Comprehensive testing (integration ready)
3. **Main Branch PRs**: Ultra-strict validation (production ready)
4. **Main Branch**: Automatic deployment (production release)

### 🔄 Continuous Integration Philosophy

- **Fast Feedback**: Quick CI on feature branches
- **Comprehensive Validation**: Full suite on integration
- **Zero Tolerance**: No exceptions for production

## Security Integration

### 🔍 Secret Detection Patterns

The CI pipeline includes advanced secret detection for:

```bash
# API Keys & Tokens
- name: API Key Detection
  pattern: '(?i)(api[_-]?key|apikey|token)["\s]*[:=]["\s]*[a-zA-Z0-9]{20,}'
  
# JWT Tokens  
- name: JWT Token Detection
  pattern: 'eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+'

# AWS Credentials
- name: AWS Credential Detection  
  pattern: 'AKIA[0-9A-Z]{16}'

# Database URLs
- name: Database URL Detection
  pattern: '(?i)(mysql|postgres|mongodb|redis)://[^\s]+'

# Generic Secrets
- name: Generic Secret Detection
  pattern: '(?i)(password|passwd|secret|key)["\s]*[:=]["\s]*[^\s"\n]{8,}'
```

## Monitoring & Metrics

### 📊 CI/CD Pipeline Summary

Each pipeline run generates a comprehensive summary:

```markdown
🎯 CI/CD Pipeline Summary

Pipeline: ✅ SUCCESS | Duration: 2m 34s | Score: 98/100

┌──────────────────────┬────────────────┬──────────┬────────────────┐
│ Stage                │ Status         │ Duration │ Score          │
├──────────────────────┼────────────────┼──────────┼────────────────┤
│ 🔍 Secret Detection  │ ✅ CLEAN       │ 12s      │ 100/100 ✅     │
│ 🛡️ Security Analysis │ ✅ PASSED      │ 18s      │ 95/100 ✅      │
│ ✅ Code Quality      │ ✅ PASSED      │ 9s       │ 100/100 ✅     │
│ 🧪 Tests & Coverage  │ ✅ 99% COV     │ 24s      │ 99/100 ✅      │
│ 🐳 Container Build   │ ✅ BUILT       │ 1m 31s   │ 100/100 ✅     │
└──────────────────────┴────────────────┴──────────┴────────────────┘

- **Triggered by**: mvalancy 👤
- **Commit**: `8d3b43f` by Claude  
- **Commit Message**: *Fix test to handle empty error messages gracefully*
- **Files Changed**: 1 modified, 0 added, 0 removed
```

This branching strategy ensures **ruthless efficiency**, **maximum security**, and **production confidence** while maintaining **developer velocity** and **code quality**.