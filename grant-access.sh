#!/bin/bash

# Script to grant someone access to the Cloud Run service
# Usage: ./grant-access.sh email@example.com

if [ -z "$1" ]; then
    echo "Usage: ./grant-access.sh email@example.com"
    echo ""
    echo "Example:"
    echo "  ./grant-access.sh boss@multnomah.gov"
    exit 1
fi

EMAIL="$1"

echo "Granting access to: $EMAIL"
gcloud run services add-iam-policy-binding lobbyist-registration \
  --region=us-west1 \
  --member="user:$EMAIL" \
  --role=roles/run.invoker

echo ""
echo "✅ Access granted!"
echo ""
echo "Share this URL with $EMAIL:"
echo "https://lobbyist-registration-zzp44w3snq-uw.a.run.app"
echo ""
echo "They will need to:"
echo "1. Visit the URL"
echo "2. Sign in with their Google account ($EMAIL)"
echo "3. They'll be redirected to the app"
