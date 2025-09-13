import { Request, Response } from 'express';
import { getOccurrences } from '../services/scheduler';

export async function fetchOccurrences(req: Request, res: Response) {
  try {
    const { start, end, owner_id } = req.query;
    if (!start || !end) return res.status(400).json({ error: 'start and end required' });
    const occ = await getOccurrences(String(start), String(end), owner_id ? Number(owner_id) : undefined);
    const grouped: Record<string, any[]> = {};
    for (const o of occ) {
      grouped[o.date] = grouped[o.date] || [];
      grouped[o.date].push(o);
    }
    return res.json({ occurrences: grouped });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal' });
  }
}
