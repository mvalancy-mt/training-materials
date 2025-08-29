#!/bin/bash
# Advanced Secret Detection Script
# Detects 5 types of secrets with high precision patterns
# Usage: ./scripts/detect-secrets.sh [files...]

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Exit codes
EXIT_SUCCESS=0
EXIT_SECRETS_FOUND=1

# Initialize counters
total_secrets=0
files_with_secrets=0

echo -e "${GREEN}🔍 Running Advanced Secret Detection...${NC}"

# Get list of files to scan
if [ $# -eq 0 ]; then
    # Scan all tracked files if no arguments provided
    files=$(git ls-files 2>/dev/null || find . -type f -not -path './.git/*')
else
    files="$@"
fi

# Secret patterns (6 types) - comprehensive AWS detection
pattern_names=("API_KEY" "JWT_TOKEN" "PASSWORD" "AWS_ACCESS_KEY" "AWS_SECRET_KEY" "GENERIC_SECRET")
pattern_api_key='(api[_-]?key|apikey).*[:=].*[a-zA-Z0-9_-]{16,}'
pattern_jwt_token='eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*'
pattern_password='password.*[:=].*[a-zA-Z0-9!@#$%^&*()_+-=]{8,}'
pattern_aws_access_key='AKIA[0-9A-Z]{16}'
pattern_aws_secret_key='(aws[_-]?secret|AWS[_-]?SECRET).*[:=].*[a-zA-Z0-9+/]{40}'
pattern_generic_secret='(secret|token).*[:=].*[a-zA-Z0-9_+/=-]{20,}'

# Function to check a single file
check_file() {
    local file="$1"
    local file_has_secrets=false

    # Skip binary files and common exclusions
    if [[ "$file" =~ \.(jpg|jpeg|png|gif|pdf|zip|tar|gz|exe|dll|so|dylib)$ ]] || \
       [[ "$file" =~ ^\.(git|vscode)/ ]] || \
       [[ "$file" == "package-lock.json" ]] || \
       [[ "$file" == "yarn.lock" ]]; then
        return
    fi

    # Skip if file doesn't exist or is empty
    if [[ ! -f "$file" ]] || [[ ! -s "$file" ]]; then
        return
    fi

    # Check each pattern
    for pattern_name in "${pattern_names[@]}"; do
        # Get pattern by name
        case $pattern_name in
            "API_KEY") pattern="$pattern_api_key" ;;
            "JWT_TOKEN") pattern="$pattern_jwt_token" ;;
            "PASSWORD") pattern="$pattern_password" ;;
            "AWS_ACCESS_KEY") pattern="$pattern_aws_access_key" ;;
            "AWS_SECRET_KEY") pattern="$pattern_aws_secret_key" ;;
            "GENERIC_SECRET") pattern="$pattern_generic_secret" ;;
        esac

        # Use grep with extended regex (compatible with macOS)
        if grep -iEn "$pattern" "$file" >/dev/null 2>&1; then
            if [[ "$file_has_secrets" == false ]]; then
                echo -e "${RED}❌ Secrets found in: $file${NC}"
                file_has_secrets=true
                files_with_secrets=$((files_with_secrets + 1))
            fi

            # Show the matching lines
            echo -e "${YELLOW}   $pattern_name detected:${NC}"
            grep -iEn "$pattern" "$file" | head -3 | while IFS= read -r line; do
                echo "     $line"
            done
            total_secrets=$((total_secrets + 1))
        fi
    done
}

# Process each file
while IFS= read -r file; do
    [[ -n "$file" ]] && check_file "$file"
done <<< "$files"

# Summary
echo ""
echo -e "${GREEN}🎯 Secret Detection Summary:${NC}"
echo "   Total secrets found: $total_secrets"
echo "   Files with secrets: $files_with_secrets"

# Exit with error if secrets found
if [ $total_secrets -gt 0 ]; then
    echo -e "${RED}❌ COMMIT BLOCKED: Secrets detected!${NC}"
    echo -e "${YELLOW}💡 Please remove secrets before committing.${NC}"
    echo -e "${YELLOW}   Consider using environment variables or secure vaults.${NC}"
    exit $EXIT_SECRETS_FOUND
fi

echo -e "${GREEN}✅ No secrets detected. Safe to commit!${NC}"
exit $EXIT_SUCCESS
