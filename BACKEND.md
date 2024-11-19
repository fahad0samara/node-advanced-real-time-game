## 🖥️ Game Backend Development Guide

This guide explains the backend architecture and how to extend it.

### 🏗️ Project Structure

```
src/
├── auth/           # Authentication logic
├── models/         # Database models
├── routes/         # API routes
├── services/       # Business logic
├── websocket/      # Real-time communication
├── utils/          # Utility functions
└── config.ts       # Configuration

```

### 🔧 Adding New Features

1. Create Model:
```typescript
// src/models/feature.ts
import mongoose, { Schema } from 'mongoose';

const featureSchema = new Schema({
  // Define schema
});

export const FeatureModel = mongoose.model('Feature', featureSchema);
```

2. Create Service:
```typescript
// src/services/featureService.ts
export class FeatureService {
  private static instance: FeatureService;

  static getInstance(): FeatureService {
    if (!FeatureService.instance) {
      FeatureService.instance = new FeatureService();
    }
    return FeatureService.instance;
  }

  async handleFeature() {
    // Implement feature logic
  }
}
```

3. Add Routes:
```typescript
// src/routes/feature.ts
import { Router } from 'express';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.post('/feature', requireAuth, async (req, res) => {
  // Implement route handler
});

export const featureRoutes = router;
```

### 🔍 Debugging

1. Enable Debug Logs:
```bash
DEBUG=game:* npm run dev
```

2. Monitor WebSocket:
```typescript
socket.onAny((event, ...args) => {
  console.log(`[WebSocket] ${event}:`, args);
});
```

### 🧪 Testing

1. Unit Tests:
```typescript
// __tests__/feature.test.ts
describe('Feature', () => {
  it('should handle feature correctly', async () => {
    // Write test
  });
});
```

2. Integration Tests:
```typescript
// __tests__/integration/feature.test.ts
import request from 'supertest';
import { app } from '../../src/app';

describe('Feature API', () => {
  it('should create feature', async () => {
    const response = await request(app)
      .post('/api/feature')
      .send({ /* test data */ });
    
    expect(response.status).toBe(200);
  });
});
```

### 📈 Performance Optimization

1. Caching:
```typescript
const cacheKey = `feature:${id}`;
let data = await redisClient.get(cacheKey);

if (!data) {
  data = await fetchFeatureData(id);
  await redisClient.set(cacheKey, JSON.stringify(data), {
    EX: 3600 // 1 hour
  });
}
```

2. Database Indexing:
```typescript
featureSchema.index({ field: 1 });
featureSchema.index({ field1: 1, field2: -1 });
```

### 🔐 Security Best Practices

1. Input Validation:
```typescript
const schema = z.object({
  field: z.string().min(3).max(50)
});

const validated = schema.parse(input);
```

2. Rate Limiting:
```typescript
const limiter = new RateLimiter({
  points: 10,
  duration: 1
});

async function handleRequest(userId: string) {
  const result = await limiter.consume(userId);
  if (result.remainingPoints <= 0) {
    throw new Error('Rate limit exceeded');
  }
}
```

### 🚀 Deployment

1. Docker:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

2. Kubernetes:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: game-backend
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: game-backend
          image: game-backend:latest
          ports:
            - containerPort: 3000
```