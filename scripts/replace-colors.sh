#!/bin/bash
# Script to replace hardcoded Tailwind color classes with design system tokens
# This ensures consistent branding throughout the app

set -e

echo "Starting color class replacement..."

# Blue replacements → primary
echo "Replacing blue colors with primary tokens..."

# Text colors
find app components -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' \
  -e 's/text-blue-600/text-primary/g' \
  -e 's/text-blue-700/text-primary/g' \
  -e 's/text-blue-800/text-primary/g' \
  {} \;

# Background colors
find app components -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' \
  -e 's/bg-blue-600/bg-primary/g' \
  -e 's/bg-blue-700/bg-primary/g' \
  -e 's/bg-blue-50/bg-primary\/10/g' \
  -e 's/bg-blue-100/bg-primary\/20/g' \
  {} \;

# Border colors
find app components -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' \
  -e 's/border-blue-500/border-primary/g' \
  -e 's/border-blue-600/border-primary/g' \
  {} \;

# Ring/focus colors
find app components -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' \
  -e 's/ring-blue-500/ring-primary/g' \
  -e 's/focus:ring-blue-500/focus:ring-primary/g' \
  {} \;

# Hover states
find app components -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' \
  -e 's/hover:text-blue-600/hover:text-primary/g' \
  -e 's/hover:bg-blue-600/hover:bg-primary/g' \
  -e 's/hover:bg-blue-50/hover:bg-primary\/10/g' \
  -e 's/hover:border-blue-500/hover:border-primary/g' \
  {} \;

# Red/destructive replacements
echo "Replacing red colors with destructive tokens..."

find app components -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' \
  -e 's/text-red-600/text-destructive/g' \
  -e 's/text-red-700/text-destructive/g' \
  -e 's/bg-red-50/bg-destructive\/10/g' \
  -e 's/bg-red-100/bg-destructive\/20/g' \
  -e 's/hover:bg-red-50/hover:bg-destructive\/10/g' \
  -e 's/border-red-500/border-destructive/g' \
  -e 's/ring-red-500/ring-destructive/g' \
  -e 's/focus:ring-red-500/focus:ring-destructive/g' \
  {} \;

# Purple/indigo/orange colors → accent (using primary)
echo "Replacing purple/indigo/orange colors with primary..."

find app components -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' \
  -e 's/text-purple-600/text-primary/g' \
  -e 's/bg-purple-50/bg-primary\/10/g' \
  -e 's/hover:bg-purple-50/hover:bg-primary\/10/g' \
  -e 's/hover:border-purple-500/hover:border-primary/g' \
  -e 's/focus:ring-purple-500/focus:ring-primary/g' \
  -e 's/text-indigo-600/text-primary/g' \
  -e 's/bg-indigo-50/bg-primary\/10/g' \
  -e 's/hover:bg-indigo-50/hover:bg-primary\/10/g' \
  -e 's/hover:border-indigo-500/hover:border-primary/g' \
  -e 's/focus:ring-indigo-500/focus:ring-primary/g' \
  -e 's/text-orange-600/text-primary/g' \
  -e 's/bg-orange-50/bg-primary\/10/g' \
  -e 's/hover:bg-orange-50/hover:bg-primary\/10/g' \
  -e 's/hover:border-orange-500/hover:border-primary/g' \
  -e 's/focus:ring-orange-500/focus:ring-primary/g' \
  {} \;

# Yellow colors → warning (we'll use a lighter primary or keep yellow for now)
echo "Replacing yellow colors..."

find app components -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' \
  -e 's/text-yellow-600/text-primary/g' \
  -e 's/bg-yellow-50/bg-primary\/10/g' \
  -e 's/hover:bg-yellow-50/hover:bg-primary\/10/g' \
  -e 's/hover:border-yellow-500/hover:border-primary/g' \
  -e 's/focus:ring-yellow-500/focus:ring-primary/g' \
  {} \;

echo "✅ Color replacement complete!"
echo ""
echo "Summary of replacements:"
echo "- Blue → primary tokens"
echo "- Red → destructive tokens"
echo "- Purple/Indigo/Orange → primary tokens (accent colors)"
echo "- Yellow → primary tokens"
echo ""
echo "Next steps:"
echo "1. Review changes: git diff"
echo "2. Test locally: npm run dev"
echo "3. Run build: npm run build"
