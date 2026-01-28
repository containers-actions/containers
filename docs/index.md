# Documentation for Container Images

This documentation provides information about the container images in this repository.

## Architecture

Each container image follows a standard structure:

- **Dockerfile**: Defines the build process
- **tags.yml**: Specifies image tags
- **update.task.js**: Handles version updates
- **rootfs/**: Optional custom filesystem overlay
- **README.md**: Package-specific documentation

## Build System

The build system uses GitHub Actions to automatically build and publish container images.

## Supported Architectures

All images support multi-platform builds for:
- linux/amd64
- linux/arm64

## Update Process

The system automatically checks for new versions and creates pull requests when updates are available.