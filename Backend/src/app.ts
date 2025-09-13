import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { fetchOccurrences } from './controllers/fetch';
import { createRecurring, updateRecurring } from './controllers/recurring';
import { modifyOccurrence, deleteOccurrence } from './controllers/occurrences';

const app = express();
app.use(cors());
app.use(json());

app.post('/api/recurring', createRecurring);
app.patch('/api/recurring/:id', updateRecurring);
app.get('/api/occurrences', fetchOccurrences);
app.put('/api/occurrences/:recurringId', modifyOccurrence);
app.delete('/api/occurrences/:recurringId', deleteOccurrence);

export default app;
