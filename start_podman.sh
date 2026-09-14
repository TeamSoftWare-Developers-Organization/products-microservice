#!/usr/bin/env bash
set -euo pipefail

if [ ! -f .env ]; then
  echo '.env is missing. Copy .env.example to .env and set secrets first.' >&2
  exit 1
fi

echo 'Starting MicroStore with Podman Compose...'
podman compose up -d
podman compose ps
