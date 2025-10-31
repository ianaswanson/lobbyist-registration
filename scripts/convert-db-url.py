#!/usr/bin/env python3
"""Convert Cloud Run DATABASE_URL to local proxy URL"""
import sys
import urllib.parse

# Read DATABASE_URL from stdin
db_url = sys.stdin.read().strip()

# Parse the URL
parsed = urllib.parse.urlparse(db_url)

# Build local TCP connection string (Cloud SQL Proxy on 127.0.0.1:5432)
local_url = f"postgresql://{parsed.username}:{parsed.password}@127.0.0.1:5432{parsed.path}"

print(local_url)
