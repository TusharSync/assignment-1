#!/bin/bash

# Create necessary directories
mkdir -p ./data ./config

# Start MinIO with Docker Compose
docker compose up -d
