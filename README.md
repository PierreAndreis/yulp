# Yulp

A full stack restaurant review application built using modern web practices.

[![Run in Insomnia}](https://insomnia.rest/images/run.svg)](https://insomnia.rest/run/?label=Restaurant%20Review%20API&uri=https%3A%2F%2Fgit.toptal.com%2Fscreening%2FPierre-Ortega%2F-%2Fblob%2Fmain%2Finsomnia-schema.json)

## Features

- Ability to login and register as an user or restaurant owner
- Restaurant Owners can create restaurants and reply to reviews
- Users can view restaurants and its reviews, and can leave review to a restaurant
- Admins can edit/delete users, restaurants and reviews

## Requirements

- Postgres
- Node 14>
- Yarn 1.x

## Running the app

Before anything, be sure to install all dependencies by running `yarn install` in the root of the project.

A local `.env` file is needed to configure the application. Clone the existing `.env.example` file and rename it to `.env`. Once that is done, modify the existing environment variables values to configure the application.

<details><summary>Run a local postgres database</summary>
<p>

You can get [Docker](https://docs.docker.com/get-docker/) and run a database locally by running the command `docker-compose up` in the root of the directory.

This command will start up a postgres database in the local port `5432` using the credentials given on `database.env` file.

</p>
</details>

<details><summary>Migrate and seed the database</summary>
<p>

First run `yarn db:deploy`. Once that is complete, you can run `yarn db:seed` to seed your database.

These commands will run the migrations on your database and create a initial admin account.

</p>
</details>

<details><summary>Run in development mode</summary>
<p>

Simple running `yarn dev` will start up both client and server application.

</p>
</details>

<details><summary>Build and deploy for production</summary>
<p>

`yarn build` will build both client and server.

This build command will produce an application bundle for the client in the folder `dist` inside client directory. These files can be served over a static hosting service.

To run the server application, `yarn start` will start in production mode after a build.

</p>
</details>

<br />

## Available Scripts

`start` Start the production built API server. Requires build first<br />
`build` Build both client and server <br />
`docs` Start a documentation app for the API on port 9999<br />
`serve` Start a local server to serve the static assets generated from the client build<br />
`dev` Run both client and server locally, watching changes and reloading<br />

## Database Scripts

`db:seed` Seed your database <br />
`db:reset` Reset your database and reapply migrations <br />
`db:db` Compare your schema with the database and create migrations based on changes <br />
`db:deploy` Deploy your migrations <br />
`db:generate` Generate Prisma typings <br />
`db:studio` Initiate [Prisma Studio](https://www.prisma.io/studio) <br />

## Technology used

### Client

- Vite
- React
- Chakra UI
- React Query

### Server

- Prisma
- Postgres
- NodeJS

## Screenshots

![Login](./images/login.png 'Login')
![Login](./images/restaurants-owner.png 'Restaurant List')
![Login](./images/restaurant-details.png 'Restaurant Details')
