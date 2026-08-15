import { app } from './app';
import { env } from './config/env.config';

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Expense Tracker API running on http://localhost:${PORT}`);
});

