/* eslint-disable @typescript-eslint/no-var-requires */
const { Client } = require('pg');
const NodeEnvironment = require('jest-environment-node');
const { nanoid } = require('nanoid');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const prismaBinary = './node_modules/.bin/prisma';

class PrismaTestEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);

    // Generate a unique schema identifier for this test context
    this.schema = `test_${nanoid()}`;

    let connectionString = process.env.DATABASE_URL;

    const schema = connectionString.match(/\?schema=([^&\n]+)/);

    if (!schema) {
      // if connection string doesnt have a schema, then
      // check to see if there are any query strings.
      // if there is, append to it
      // otherwise, create
      connectionString += connectionString.includes('?') ? `&schema=${this.schema}` : `?schema=${this.schema}`;
    } else {
      // if the connection string already has a schema, lets replace with ours
      connectionString = connectionString.replace(`schema=${schema[1]}`, `schema=${this.schema}`);
    }

    // Generate the pg connection string for the test schema
    this.connectionString = connectionString;
  }

  async setup() {
    // Set the required environment variable to contain the connection string
    // to our database test schema
    process.env.DATABASE_URL = this.connectionString;
    this.global.process.env.DATABASE_URL = this.connectionString;

    // Run the migrations to ensure our schema has the required structure
    const out = await exec(`${prismaBinary} migrate deploy`);

    if (out.stderr) {
      console.warn(out);
      throw new Error('Error while running migrate deploy on test enviromment setup');
    }

    return super.setup();
  }

  async teardown() {
    // Drop the schema after the tests have completed
    const client = new Client({
      connectionString: this.connectionString,
    });
    await client.connect();
    await client.query(`DROP SCHEMA IF EXISTS "${this.schema}" CASCADE`);
    await client.end();
  }
}

module.exports = PrismaTestEnvironment;
