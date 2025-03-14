# Opening the Black Box: Explaining Learned Cost Models For Databases
This directory contains the source code of our demo submission
*"Opening the Black Box: Explaining Zero-Shot Cost Models for Databases"*
. This project consists of [backend](./backend/) and [web based frontend](./web/).

## Overview

- [General Information](#general-information)
- [Quick production setup](#quick-production-setup)
- [Development Setup](#development-setup)



## Quick production setup

0. Clone repository and update submodules with `git submodule update --init`
1. Copy **zero-shot-data** into the root of the **backend** directory, so that it results in `/backend/zero-shot-data`
2. *(Optional)* Copy **zs_queries.backup** into [./backend/src](./backend/src/), so that it results in `/backend/src/zs_queries.backup`
3. Make sure to have docker installed
4. Run `docker-compose up --build -d`
5. If you skipped step 2, wait for database initialization (this can take some time)
6. Web frontend can be found at http://localhost:5241/ and backend docs can be found at http://localhost:5240/docs

## Development Setup

For development setup see development setup instructions in README files of the [backed](./backend/README.md#development-setup) and [frontend](./web/README.md#development-setup) projects.
