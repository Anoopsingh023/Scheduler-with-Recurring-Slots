import { knex } from '../db';
import { eachDayOfInterval, format } from 'date-fns';

export type Occurrence = {
  date: string;
  start_time: string;
  end_time: string;
  source: 'recurring' | 'modified';
  recurring_slot_id?: number | null;
  exception_id?: number | null;
};

export async function getOccurrences(startDate: string, endDate: string, ownerId?: number): Promise<Occurrence[]> {
  const recurring = await knex('recurring_slots').modify((q: any) => ownerId ? q.where('owner_id', ownerId) : q);
  const exceptions = await knex('slot_exceptions').whereBetween('date', [startDate, endDate]).modify((q: any) => ownerId ? q.where('owner_id', ownerId) : q);

  const excMap = new Map<string, any>();
  for (const e of exceptions) excMap.set(`${e.recurring_slot_id}|${format(new Date(e.date), 'yyyy-MM-dd')}`, e);

  const days = eachDayOfInterval({ start: new Date(startDate), end: new Date(endDate) });
  const out: Occurrence[] = [];

  for (const day of days) {
    const dateStr = format(day, 'yyyy-MM-dd');
    const weekday = day.getDay();
    const matched = recurring.filter((r: any) => r.weekday === weekday);
    for (const r of matched) {
      const key = `${r.id}|${dateStr}`;
      const e = excMap.get(key);
      if (e) {
        if (e.type === 'deleted') continue;
        if (e.type === 'modified') {
          out.push({ date: dateStr, start_time: e.start_time, end_time: e.end_time, source: 'modified', recurring_slot_id: r.id, exception_id: e.id });
        }
      } else {
        out.push({ date: dateStr, start_time: r.start_time, end_time: r.end_time, source: 'recurring', recurring_slot_id: r.id });
      }
    }
  }

  return out;
}
