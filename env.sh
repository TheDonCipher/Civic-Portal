#!/bin/sh

# Replace environment variables in the main.js file
# This allows us to inject environment variables at runtime in Docker

set -e

JS_BUNDLE=$(find /usr/share/nginx/html/assets -name "*.js" | head -1)

# Replace environment variables in the JS bundle
if [ -n "$VITE_SUPABASE_URL" ]; then
  sed -i "s|VITE_SUPABASE_URL_PLACEHOLDER|${VITE_SUPABASE_URL}|g" $JS_BUNDLE
fi

if [ -n "$VITE_SUPABASE_ANON_KEY" ]; then
  sed -i "s|VITE_SUPABASE_ANON_KEY_PLACEHOLDER|${VITE_SUPABASE_ANON_KEY}|g" $JS_BUNDLE
fi

# Add any other environment variables you need to replace

echo "Environment variables injected into JS bundle"
