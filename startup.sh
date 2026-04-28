#!/bin/bash

set -e

echo "VaultCore Startup Script"
echo "========================"

# Check if Docker is running
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed"
    exit 1
fi

echo "Building and starting services..."

# Build and start services
docker-compose up -d

echo ""
echo "Services are starting..."
echo "Wait a few moments for services to be fully ready"
echo ""
echo "Service URLs:"
echo "  Frontend:   http://localhost:3000"
echo "  Backend:    http://localhost:3001"
echo "  AI Service: http://localhost:5000"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop:      docker-compose down"
