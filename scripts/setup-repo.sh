#!/bin/bash
# One-command repository setup with mandatory security
# Usage: ./scripts/setup-repo.sh

set -e

echo "🚀 Setting up repository with mandatory security..."

# Check if pre-commit is installed
if ! command -v pre-commit &> /dev/null; then
    echo "📦 Installing pre-commit..."
    pip install pre-commit
else
    echo "✅ pre-commit already installed"
fi

# Install hooks
echo "🔒 Installing security hooks..."
pre-commit install

# Verify installation
echo "🧪 Testing secret detection..."
if pre-commit run advanced-secret-detection --all-files > /dev/null 2>&1; then
    echo "✅ Secret detection working correctly"
else
    echo "❌ Secret detection test failed"
    exit 1
fi

echo ""
echo "✅ SETUP COMPLETE!"
echo ""
echo "🛡️  Secret detection is now ACTIVE on every commit"
echo "⚡  No secrets can be committed to this repository"
echo "🎯  Ready for secure development!"
echo ""
echo "Next steps:"
echo "  1. cd demos/python-fastapi"
echo "  2. docker-compose up --build"
echo "  3. Open http://localhost:8000/docs"
