#!/usr/bin/env python3
"""Convert Cloud Run DATABASE_URL to local proxy URL"""
import sys
import urllib.parse
import argparse

# Parse command line arguments
parser = argparse.ArgumentParser()
parser.add_argument('--port', type=int, default=5432, help='Cloud SQL Proxy port (default: 5432)')
args = parser.parse_args()

# Read DATABASE_URL from stdin
db_url = sys.stdin.read().strip()

# Parse the URL
parsed = urllib.parse.urlparse(db_url)

# Build local TCP connection string (Cloud SQL Proxy on 127.0.0.1)
local_url = f"postgresql://{parsed.username}:{parsed.password}@127.0.0.1:{args.port}{parsed.path}"

print(local_url)
