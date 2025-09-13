import { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.schema.createTable('recurring_slots', (t) => {
    t.increments('id').primary();
    t.integer('weekday').notNullable();
    t.time('start_time').notNullable();
    t.time('end_time').notNullable();
    t.integer('owner_id').nullable();
    t.timestamps(true, true);
  });

  await knex.schema.createTable('slot_exceptions', (t) => {
    t.increments('id').primary();
    t.integer('recurring_slot_id').unsigned().references('id').inTable('recurring_slots').onDelete('CASCADE').nullable();
    t.date('date').notNullable();
    t.enu('type', ['modified', 'deleted']).notNullable();
    t.time('start_time').nullable();
    t.time('end_time').nullable();
    t.integer('owner_id').nullable();
    t.timestamps(true, true);
    t.unique(['recurring_slot_id', 'date']);
  });
}

export async function down(knex: Knex) {
  await knex.schema.dropTableIfExists('slot_exceptions');
  await knex.schema.dropTableIfExists('recurring_slots');
}
