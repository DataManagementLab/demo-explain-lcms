# Frontend for "Opening the Black Box: Explaining Zero-Shot Cost Models for Databases" M.Sc. Thesis

## Overview

- [Overview](#overview)
- [General Information](#general-information)
- [Quick production setup](#quick-production-setup)
- [Development Setup](#development-setup)
- [Environmental Variables](#environmental-variables)

## General Information

This directory contains a frontend part of a project that was developed in terms of *"Opening the Black Box: Explaining Zero-Shot Cost Models for Databases"* M.Sc. Thesis.

Based on:
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [D3.js](https://d3js.org/)

## Quick production setup

0. You may want to start a full demo app with docker-compose, see ["Quick production setup" section in main README](../README.md#quick-production-setup) instead. Otherwise, continue here:
1. Setup backend, see ["Quick production setup" section in backend README](../backend/README.md#quick-production-setup)
2. Build image and run docker container
    ```sh
    docker build --build-arg BACKEND_URL=http://127.0.0.1:5240/ -t expl-zs-frontend-image .
    docker run --name expl-zs-frontend -p 5241:80 -d expl-zs-frontend-image
    ```


## Development Setup

1. Setup backend, see ["Quick production setup" section in backend README](../backend/README.md#development-setup)
2. Install [pnpm](https://pnpm.io/installation)
3. Install dependencies: `pnpm install`
4. Run app `pnpm dev`

## Environmental Variables

- **VITE_BACKEND_URL** (default "http://127.0.0.1:8000/"): backend URL