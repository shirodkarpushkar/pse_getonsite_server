# GetOnSite WebServer
Easy Uberisation of Containers and Heavy Machinery

[![Build and deploy Node.js app to Azure Web App - api-getonsite](https://github.com/shirodkarpushkar/pse_getonsite_server/actions/workflows/master_api-getonsite.yml/badge.svg?branch=develop)](https://github.com/shirodkarpushkar/pse_getonsite_server/actions/workflows/master_api-getonsite.yml)


---

## Prerequisites

- [Node.js](https://yarnpkg.com/en/docs/install)
- [Yarn](https://yarnpkg.com/en/docs/install)
- [NPM](https://docs.npmjs.com/getting-started/installing-node)
- [PostgreSQL](https://www.postgresql.org/download/) / [MySQL](https://www.mysql.com/downloads/) / [SQLite](https://www.sqlite.org/download.html)

## Setup

Clone the repository, install the dependencies and get started right away.

    $ git clone https://github.com/shirodkarpushkar/pse_getonsite_server
    $ cd pse_getonsite_server
    $ rm -rf .git
    $ yarn   # or npm install

Add environment variables in a .env file.

Finally, start the application.

    $ yarn start:dev (For development)
    $ NODE_ENV=production yarn start (For production)

Navigate to http://localhost:8848/api to verify installation.


