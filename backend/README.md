# Backend for "Opening the Black Box: Explaining Zero-Shot Cost Models for Databases" M.Sc. Thesis

## Overview

- [Overview](#overview)
- [General Information](#general-information)
- [Quick production setup](#quick-production-setup)
- [Development Setup](#development-setup)
- [Environmental Variables](#environmental-variables)
  - [Base](#base)
  - [ML](#ml)
  - [Query](#query)
  - [Evaluation](#evaluation)
  - [Minimal config example](#minimal-config-example)


## General Information

This directory contains a backend part of a project that was developed in terms of *"Opening the Black Box: Explaining Zero-Shot Cost Models for Databases"* M.Sc. Thesis.

Based on:
- [Python 3.11](https://www.python.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- Original zero-shot cost models implementation [(private)](https://github.com/DataManagementLab/zero-shot-learned-db) [(public)](https://github.com/DataManagementLab/zero-shot-cost-estimation)

## Quick production setup

0. You may want to start a full demo app with docker-compose, see ["Quick production setup" section in main README](../README.md#quick-production-setup) instead. Otherwise, continue here:
1. Copy **zero-shot-data** into the root of the **backend** directory
2. *(Optional)* Install psql `apt-get install postgresql-client-16` and copy **zs_queries.backup** into [./src](./src/)
3. Make sure to have docker installed
4. Setup Postgres database
    ```console
    docker network create expl-zs-network
    docker run --name expl-zs-postgres --env    POSTGRES_PASSWORD=mysecretpassword --network    expl-zs-network -d postgres
    ```
5. Build image and run docker container
    ```console
    docker build -t expl-zs-backend-image .
    docker run --name expl-zs-backend --env     db_password=mysecretpassword --network expl-zs-network -p     5240:80 -d expl-zs-backend-image
    ```

## Development Setup

1. Install Python 3.11
2. Make sure to have docker installed
3. Copy **zero-shot-data** into the root of the **backend** directory (or set corresponding environmental variables, see [Environmental Variables, ML section](#ml))
4.  *(Optional)* Install psql `apt-get install postgresql-client-16` and copy **zs_queries.backup** into [./src](./src/)
5. Setup Postgres database
    ```console
    docker run --name expl-zs-postgres-dev -e     POSTGRES_PASSWORD=mysecretpassword -d postgres
    ```
6. Create a minimal **.env** file in [./src/.env](./src/.env) (see [Minimal config example](#minimal-config-example))
7. Install graphviz:
    ```console
    apt-get update
    apt-get install graphviz graphviz-dev
    ```
8. Create and activate python virtual environment:
    ```console
    python -m venv venv
    source venv/bin/activate
    ```
9. Install packages:
    ```console
    pip install --upgrade setuptools
    pip install --upgrade pip
    pip install torch==2.1.2 torchvision==0.16.2    torchaudio==2.1.2 --index-url https://download.pytorch.   org/whl/rocm5.6
    pip install --no-cache-dir dgl -f https://data.dgl.ai/    wheels/torch-2.1/repo.html
    pip install -r ./requirements/dev.txt
    ```
10. Run backend:
    ```console
    cd src
    uvicorn main:app
    ```

## Environmental Variables

### Base

- **cors_origins** (**REQUIRED** for web): list of allowed CORS origins, needed to work with web UI. Example for local development: *["http://localhost:5173", "http://127.0.0.1:5173"]*
- **db_host** (default *"localhost"*): host for db connection
- **db_port** (default *"5432"*): port for db connection
- **db_user** (default *"postgres"*): user for db connection
- **db_password** (**REQUIRED**): password for db connection
- **db_log** (default *"False*"): if "True" all SQL operations will be logged to *src/sqlalchemy.log*

### ML
- **ml__base_data_dir** (default *"./zero-shot-data"*): full path to the directory with query workloads and trained zero-shot cost models
- **ml__statistics_file** (default *"statistics_workload_combined.json"*): relative path to workload statistics file (relative to *ml__base_data_dir*)
- **ml__zs_model_dir** (default *"evaluation/models"*): relative path to directory with zero-shot cost models (relative to *ml__base_data_dir*)
- **ml__load_only_first_model_from_runs_config** (default *"True"*): if "True", loads only first model from *saved_runs_config_file*. Setting it to "False" can be useful for evaluation with different models
-*** *ml__hyperparameters_file**** (default *"zero_shot_learned_db/experiments/tuned_hyperparameters/tune_best_config.json"*): relative path to hyperparameters file (relative to [src](src))
- **ml__device** (default *"cpu"*): PyTorch device that is used for inference
- **ml__explainers_log** (default *"False"*): if "True", logs some parts of explainer execution to console
- **ml__plans_cache_max_size** (default *"10*"): number of parsed query graphs that is stored in cache

### Query

- **query__db_name** (default *"zs_queries"*): database that will be created for storing needed data
- **query__saved_runs_config_file** (default *"saved_runs_config.json"*): file with data sets to be stored in a database for later use in evaluations and demo web application. Default value points to [src/saved_runs_config.json](src/saved_runs_config.json)
- **query__datasets_runs_dir** (default *"runs/parsed_plans"*): relative path to directory with parsed plans (relative to *ml__base_data_dir*)
- **query__datasets_runs_raw_dir** (default *"runs/raw"*): relative path to directory with raw plans (relative to *ml__base_data_dir*)

### Evaluation

- **eval__results_dir** (default *"evaluation_results"*): relative path to directory where plots from evaluations should be stored (relative to [src](src))
- **eval__max_table_count** (default *"5"*): maximum number of tables in query for evaluation, e.g. with default value queries with table counts 1-5 will be evaluated
- **eval__max_plans_per_table_count** (default *"100*"): maximum number of queries that is captured for evaluation per table count, e.g. with default value will be captured 100 queries with 1 table, 100 queries with 2 tables, etc.
- **eval__evaluate_fidelity_params** (default *"False"*): if True, different fidelity params will be evaluated (see *fidelity_test_thresholds* in [src/evaluation/router.py](src/evaluation/router.py))
- **eval__use_binary_fidelity** (default *"False"*): use binary fidelity instead of range one for evaluation

### Minimal config example

```properties
cors_origins=["http://localhost:5173", "http://127.0.0.1:5173"]
db_password="mysecretpassword"
```
