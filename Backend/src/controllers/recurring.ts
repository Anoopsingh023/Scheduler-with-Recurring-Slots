import { Request, Response } from 'express';
import { knex } from '../db';
import { addDays, format } from 'date-fns';
import { getOccurrences } from '../services/scheduler';

export async function createRecurring(req: Request, res: Response) {
  try {
    const { weekday, start_time, end_time, owner_id } = req.body;
    if (weekday === undefined || !start_time || !end_time) return res.status(400).json({ error: 'weekday/start_time/end_time required' });

    const today = new Date();
    const end = addDays(today, 7 * 52);
    const startStr = format(today, 'yyyy-MM-dd');
    const endStr = format(end, 'yyyy-MM-dd');

    const occurrences = await getOccurrences(startStr, endStr, owner_id);
    const counts = new Map<string, number>();
    for (const o of occurrences) counts.set(o.date, (counts.get(o.date) || 0) + 1);

    let d = new Date(today);
    while (d.getDay() !== weekday) d = addDays(d, 1);
    const dates: string[] = [];
    while (d <= end) { dates.push(format(d, 'yyyy-MM-dd')); d = addDays(d, 7); }

    for (const date of dates) {
      const c = counts.get(date) || 0;
      if (c >= 2) return res.status(400).json({ error: `Cannot create slot; date ${date} would exceed 2 slots` });
    }

    const [id] = await knex('recurring_slots').insert({ weekday, start_time, end_time, owner_id }).returning('id');
    return res.json({ id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal' });
  }
}

export async function updateRecurring(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const { start_time, end_time } = req.body;
    if (!start_time || !end_time) return res.status(400).json({ error: 'start_time and end_time required' });
    await knex('recurring_slots').where({ id }).update({ start_time, end_time, updated_at: knex.fn.now() } as any);
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal' });
  }
}
