# Makefile for Container Management

.PHONY: help build-all list-packages build-bun build-fnm build-kkfileview build-libreoffice-nogui build-nvm build-subversion

help:
	@echo "Container Management Makefile"
	@echo ""
	@echo "Usage:"
	@echo "  make list-packages                    - List all available packages"
	@echo "  make build-all                        - Build all packages"
	@echo "  make build-<package-name>            - Build specific package"
	@echo "  make test-<package-name>             - Test specific package"

list-packages:
	@echo "Available packages:"
	@find packages/* -maxdepth 0 -type d -exec basename {} \;

build-all: build-bun build-fnm build-kkfileview build-libreoffice-nogui build-nvm build-subversion

build-bun:
	@echo "Building bun container..."
	docker build -t containers-actions/bun:latest packages/bun

build-fnm:
	@echo "Building fnm container..."
	docker build -t containers-actions/fnm:latest packages/fnm

build-kkfileview:
	@echo "Building kkfileview container..."
	docker build -t containers-actions/kkfileview:latest packages/kkfileview

build-libreoffice-nogui:
	@echo "Building libreoffice-nogui container..."
	docker build -t containers-actions/libreoffice-nogui:latest packages/libreoffice-nogui

build-nvm:
	@echo "Building nvm container..."
	docker build -t containers-actions/nvm:latest packages/nvm

build-subversion:
	@echo "Building subversion container..."
	docker build -t containers-actions/subversion:latest packages/subversion

test-bun:
	@echo "Testing bun container..."
	docker run --rm containers-actions/bun:latest bun --version

test-fnm:
	@echo "Testing fnm container..."
	docker run --rm containers-actions/fnm:latest fnm --version

test-kkfileview:
	@echo "Testing kkfileview container..."
	docker run --rm containers-actions/kkfileview:latest

test-libreoffice-nogui:
	@echo "Testing libreoffice-nogui container..."
	docker run --rm containers-actions/libreoffice-nogui:latest soffice --version

test-nvm:
	@echo "Testing nvm container..."
	docker run --rm containers-actions/nvm:latest nvm --version

test-subversion:
	@echo "Testing subversion container..."
	docker run --rm containers-actions/subversion:latest svn --version