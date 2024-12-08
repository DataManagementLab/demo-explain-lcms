# Implementation for "Opening the Black Box: Explaining Zero-Shot Cost Models for Databases" M.Sc. Thesis

## Overview

- [Overview](#overview)
- [General Information](#general-information)
- [Quick production setup](#quick-production-setup)

## General Information

This directory contains a project that was developed in terms of *"Opening the Black Box: Explaining Zero-Shot Cost Models for Databases"* M.Sc. Thesis. This project consists of [backend](./backend/) and [web based frontend](./web/).


## Quick production setup

1. Copy **zero-shot-data** into the root of the **backend** directory
2. *(Optional)* Install psql `apt-get install postgresql-client-16` and copy **zs_queries.backup** into [./backend/src](./backend/src/)
3. Make sure to have docker installed
4. Run `docker-compose up --build -d`
5. If you skipped step 2, wait for database initialization
6. Web frontend can be found at http://localhost:5241/ and backend docs can be found at http://localhost:5240/docs