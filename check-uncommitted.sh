#!/bin/bash
# Script to check for uncommitted changes in the repository
# Usage: ./check-uncommitted.sh [--strict]
#
# Exit codes:
#   0 - No uncommitted changes
#   1 - Uncommitted changes detected
#   2 - Error occurred

set -e

STRICT_MODE=false

# Parse arguments
if [ "$1" == "--strict" ]; then
    STRICT_MODE=true
fi

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "🔍 Checking for uncommitted changes..."
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}✗ Error: Not a git repository${NC}"
    exit 2
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    echo -e "${YELLOW}⚠  Uncommitted changes detected:${NC}"
    echo ""
    
    # Show status
    git status --short
    echo ""
    
    # Show modified files count
    MODIFIED_COUNT=$(git diff --name-only | wc -l)
    STAGED_COUNT=$(git diff --cached --name-only | wc -l)
    UNTRACKED_COUNT=$(git ls-files --others --exclude-standard | wc -l)
    
    echo "Summary:"
    echo "  - Modified files: $MODIFIED_COUNT"
    echo "  - Staged files: $STAGED_COUNT"
    echo "  - Untracked files: $UNTRACKED_COUNT"
    echo ""
    
    if [ "$STRICT_MODE" = true ]; then
        echo -e "${RED}✗ Cannot proceed in strict mode with uncommitted changes${NC}"
        exit 1
    else
        echo -e "${YELLOW}ℹ  You can:${NC}"
        echo "  1. Commit your changes: git add . && git commit -m 'your message'"
        echo "  2. Stash your changes: git stash"
        echo "  3. Discard your changes: git checkout -- ."
        echo ""
        exit 1
    fi
else
    echo -e "${GREEN}✓ Working tree is clean${NC}"
    echo "No uncommitted changes detected."
    exit 0
fi
