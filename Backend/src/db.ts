import Knex from 'knex';
import knexConfig from '../knexfile';


const env = process.env.NODE_ENV || 'development';
export const knex = Knex(knexConfig[env]);
