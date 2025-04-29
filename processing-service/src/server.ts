import app from './app';
import { config } from './config';

const PORT = config.port || 3001;

app.listen(PORT, () => {
  console.log(`Processing service running on port ${PORT}`)
})