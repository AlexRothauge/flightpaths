# Flight Paths

## Installation and setup

1. Ensure you have pulled with git lfs pull
2. Run `yarn install`
3. Create a `.env` file in the `packages/backend/` directory and set the variables
4. Start docker-compose found in `docker/`
5. Run `yarn main:dev setup-mongo`
6. Run `yarn generate:api` in `packages/backend/` to generate necessary files for API setup.
7. Run `yarn generate:api:local` in `packages/frontend/` to generate necessary files for API setup.

## Usage

1. Run `yarn main:dev import-csv [csv-file...]` to import csv files in a directory, i.e. `yarn main:dev import-csv flightData/*` and wait for the program to finish
2. Run `yarn main:dev generate-image --help` to get the possible parameters and examples
3. Run `yarn main:dev start-server` in `packages/backend/` to start backend as web service.
4. Run `yarn dev` in `packages/frontend/` to start frontend.

# Testing

## Frontend

Since vuetify does not provide any testing utilities nor documentation on how to write unit test non have been written.

## Data Import over scheduler

1. Go into `packages/dataImport` and run
   1. `conda create -n traffic -c conda-forge python=3.10 traffic`
   2. `conda activate traffic`
   3. `conda install --file requirements.txt -n traffic`
2. Create a `.env` file in the `packages/dataImport/` directory and set the variables
3. Register a scheduler (i.e. `crontab -e`) with the following params (every 15 minutes) `*/15 * * * * /path_to_traffic_conda_environment_python_executable /path_to_project/packages/data/main.py`
4. Over time is fills the db with data from the last month
