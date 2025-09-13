import { Request, Response } from 'express';
import { knex } from '../db';
import { getOccurrences } from '../services/scheduler';

export async function modifyOccurrence(req: Request, res: Response) {
  try {
    const recurringId = Number(req.params.recurringId);
    const { date, start_time, end_time, owner_id } = req.body;
    if (!date || !start_time || !end_time) return res.status(400).json({ error: 'date, start_time, end_time required' });

    const dayOccurrences = await getOccurrences(date, date, owner_id);
    const filtered = dayOccurrences.filter(o => o.recurring_slot_id !== recurringId);
    if (filtered.length >= 2) return res.status(400).json({ error: 'Cannot modify: date already has 2 other slots' });

    const existing = await knex('slot_exceptions').where({ recurring_slot_id: recurringId, date }).first();
    if (existing) {
      await knex('slot_exceptions').where({ id: existing.id }).update({ type: 'modified', start_time, end_time, updated_at: knex.fn.now() } as any);
    } else {
      await knex('slot_exceptions').insert({ recurring_slot_id: recurringId, date, type: 'modified', start_time, end_time, owner_id });
    }
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal' });
  }
}

export async function deleteOccurrence(req: Request, res: Response) {
  try {
    const recurringId = Number(req.params.recurringId);
    const date = String(req.query.date);
    const owner_id = req.query.owner_id ? Number(req.query.owner_id) : undefined;
    if (!date) return res.status(400).json({ error: 'date query required' });

    const existing = await knex('slot_exceptions').where({ recurring_slot_id: recurringId, date }).first();
    if (existing) {
      await knex('slot_exceptions').where({ id: existing.id }).update({ type: 'deleted', start_time: null, end_time: null, updated_at: knex.fn.now() } as any);
    } else {
      await knex('slot_exceptions').insert({ recurring_slot_id: recurringId, date, type: 'deleted', owner_id });
    }
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal' });
  }
}
