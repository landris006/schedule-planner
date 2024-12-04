<h1 align="center">Schedule Planner</h1>

<div align="center">

[![Deploy](https://github.com/landris006/schedule-planner/actions/workflows/deploy.yml/badge.svg)](https://github.com/landris006/schedule-planner/actions/workflows/deploy.yml)

</div>

## Description

University schedule planner web application.

## Development
### Starting the server locally
You will need [Go](https://go.dev/dl/).

In the root of the project run:
`go run .`

(You can run the solver tests by running `go test -v` in the `solver/` directory. `-v` stands for verbose, otherwise it wouldn't display the logs.) 

### Starting the client locally
You will need NodeJs. ([Download from the official site](https://nodejs.org/en) or use [nvm](https://github.com/nvm-sh/nvm).)

1. Go into the `web/` directory.
2. `npm install` to install the dependencies.
3. `npm run dev` to start the development server.

## Deployment
New commits to the `main` branch automatically trigger a [deploy workflow](https://github.com/landris006/schedule-planner/blob/main/.github/workflows/deploy.yml), that builds and deploys the project to Azure.
