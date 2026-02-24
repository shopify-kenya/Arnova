#!/bin/bash
# Setup script for Arnova git hooks

echo "🔧 Setting up git hooks for Arnova..."

# Make hooks executable
chmod +x .githooks/pre-commit
chmod +x .githooks/commit-msg

# Install hooks
git config core.hooksPath .githooks

echo "✅ Git hooks installed successfully!"
echo ""
echo "Hooks installed:"
echo "  - pre-commit: Formats code and runs linting"
echo "  - commit-msg: Validates commit message format"
echo ""
echo "To run manually:"
echo "  ./githooks/pre-commit"
echo "  ./githooks/commit-msg <commit-message-file>"