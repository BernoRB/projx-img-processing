import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { router } from './controllers';
import { queueConsumerService } from './services/queue-consumer.service';

const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api', router);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
});

// Queue consumer
if (process.env.NODE_ENV !== 'test') {
  queueConsumerService.startProcessingConsumer()
    .catch(err => console.error('Failed to start queue consumer:', err));
  
  process.on('SIGTERM', () => {
    queueConsumerService.stopConsumer();
  });
  
  process.on('SIGINT', () => {
    queueConsumerService.stopConsumer();
  });
}

export default app