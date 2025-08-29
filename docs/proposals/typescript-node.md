# TypeScript/Node.js Application Demo Proposal

## Overview

This demo showcases a modern TypeScript/Node.js application with Express.js, demonstrating best practices for JavaScript/TypeScript development in containerized environments with comprehensive CI/CD pipelines.

## Application Design

### Project: E-commerce Product API
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh tokens
- **Validation**: Zod for runtime type validation
- **Testing**: Jest with Supertest for API testing
- **Documentation**: OpenAPI 3.0 with Swagger UI

### Features
- RESTful API for product catalog management
- User authentication with role-based access control
- File upload for product images
- Search and filtering with MongoDB aggregation
- Rate limiting and request validation
- Real-time notifications with WebSockets
- Background job processing with Bull
- Comprehensive API documentation

### Directory Structure
```
demos/typescript-node/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── environment.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── product.controller.ts
│   │   └── user.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── error.middleware.ts
│   ├── models/
│   │   ├── User.ts
│   │   └── Product.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── product.routes.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── product.service.ts
│   │   └── email.service.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── validators.ts
│   │   └── helpers.ts
│   └── types/
│       ├── auth.types.ts
│       ├── api.types.ts
│       └── database.types.ts
├── tests/
│   ├── unit/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── utils/
│   ├── integration/
│   │   └── api/
│   └── fixtures/
│       └── data.ts
├── docker/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── docker-entrypoint.sh
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── security.yml
│       └── release.yml
├── docs/
│   ├── api.md
│   └── deployment.md
├── scripts/
│   ├── build.sh
│   ├── test.sh
│   └── lint.sh
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.build.json
├── jest.config.js
├── .eslintrc.js
├── .prettierrc
├── docker-compose.yml
├── docker-compose.dev.yml
├── .dockerignore
├── .gitignore
├── container-structure-test.yaml
└── README.md
```

## Docker Strategy

### Multi-Stage Production Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci --only=development

# Copy source code
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install security updates and create user
RUN apk update && apk upgrade && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --chown=nextjs:nodejs docker/docker-entrypoint.sh ./

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]
```

### Development Dockerfile
```dockerfile
FROM node:18-alpine AS development

# Install development tools
RUN apk add --no-cache git

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies including dev
RUN npm install

# Copy configuration files
COPY tsconfig*.json ./
COPY jest.config.js ./
COPY .eslintrc.js ./
COPY .prettierrc ./

VOLUME ["/app/src", "/app/tests"]

EXPOSE 3000 9229
CMD ["npm", "run", "dev"]
```

## CI/CD Pipeline Features

### 1. Code Quality & Linting
```yaml
quality:
  runs-on: ubuntu-latest
  strategy:
    matrix:
      node-version: [16, 18, 20]
  steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Type checking
      run: npm run type-check
      
    - name: Linting
      run: npm run lint
      
    - name: Format check
      run: npm run format:check
      
    - name: Build check
      run: npm run build
      
    - name: Bundle analysis
      run: npm run analyze
```

### 2. Testing Strategy
```yaml
test:
  runs-on: ubuntu-latest
  services:
    mongodb:
      image: mongo:6.0
      env:
        MONGO_INITDB_ROOT_USERNAME: admin
        MONGO_INITDB_ROOT_PASSWORD: password
      options: >-
        --health-cmd "mongosh --eval 'db.adminCommand(\"ping\")'"
        --health-interval 10s
        --health-timeout 5s
        --health-retries 5
    redis:
      image: redis:7-alpine
      options: >-
        --health-cmd "redis-cli ping"
        --health-interval 10s
        --health-timeout 5s
        --health-retries 5
        
  steps:
    - name: Run unit tests
      run: npm run test:unit
      
    - name: Run integration tests
      env:
        MONGODB_URL: mongodb://admin:password@localhost:27017/testdb?authSource=admin
        REDIS_URL: redis://localhost:6379
      run: npm run test:integration
      
    - name: Run e2e tests
      run: npm run test:e2e
      
    - name: Generate coverage report
      run: npm run test:coverage
      
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
```

### 3. Security & Dependency Scanning
```yaml
security:
  runs-on: ubuntu-latest
  steps:
    - name: npm audit
      run: npm audit --audit-level=high
      
    - name: Dependency vulnerability scan
      uses: ossf/scorecard-action@v2
      with:
        results_file: results.sarif
        results_format: sarif
        
    - name: CodeQL security scan
      uses: github/codeql-action/init@v2
      with:
        languages: javascript
        queries: security-and-quality
        
    - name: Build Docker image
      run: docker build -t typescript-node:test .
      
    - name: Container security scan
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: typescript-node:test
        format: sarif
        output: trivy-results.sarif
```

### 4. Performance Testing
```yaml
performance:
  runs-on: ubuntu-latest
  steps:
    - name: Start application
      run: |
        docker-compose up -d
        sleep 30
        
    - name: Install Artillery
      run: npm install -g artillery
      
    - name: Load testing
      run: |
        artillery quick --count 100 --num 10 http://localhost:3000/api/products
        
    - name: Stress testing
      run: |
        artillery run tests/performance/stress-test.yml
        
    - name: Memory leak detection
      run: |
        node --expose-gc tests/performance/memory-test.js
```

## Testing Strategy

### Unit Tests with Jest
```typescript
// tests/unit/services/product.service.test.ts
import { ProductService } from '../../../src/services/product.service';
import { Product } from '../../../src/models/Product';

jest.mock('../../../src/models/Product');

describe('ProductService', () => {
  let productService: ProductService;
  const mockProduct = jest.mocked(Product);

  beforeEach(() => {
    productService = new ProductService();
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      const productData = {
        name: 'Test Product',
        price: 99.99,
        category: 'Electronics'
      };

      mockProduct.prototype.save.mockResolvedValue(productData);

      const result = await productService.createProduct(productData);

      expect(result).toEqual(productData);
      expect(mockProduct.prototype.save).toHaveBeenCalledTimes(1);
    });

    it('should throw error for invalid data', async () => {
      const invalidData = { name: '' };

      await expect(
        productService.createProduct(invalidData as any)
      ).rejects.toThrow('Invalid product data');
    });
  });
});
```

### Integration Tests
```typescript
// tests/integration/api/product.test.ts
import request from 'supertest';
import { app } from '../../../src/app';
import { connectTestDB, clearTestDB } from '../../fixtures/database';

describe('Product API Integration', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const productData = {
        name: 'Test Product',
        price: 99.99,
        category: 'Electronics',
        description: 'Test description'
      };

      const response = await request(app)
        .post('/api/products')
        .send(productData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: productData.name,
        price: productData.price,
        category: productData.category
      });
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = { name: '' };

      const response = await request(app)
        .post('/api/products')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });
});
```

## Configuration Files

### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### ESLint Configuration
```javascript
// .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'prettier'
  ],
  plugins: ['@typescript-eslint', 'security'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'security/detect-object-injection': 'warn',
    'security/detect-non-literal-fs-filename': 'warn'
  },
  env: {
    node: true,
    es2020: true
  }
};
```

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.ts'],
  testTimeout: 30000
};
```

## Container Structure Tests
```yaml
schemaVersion: 2.0.0
fileExistenceTests:
  - name: 'Application exists'
    path: '/app/dist'
    shouldExist: true
  - name: 'Package.json exists'
    path: '/app/package.json'
    shouldExist: true
  - name: 'Entry script exists'
    path: '/app/docker-entrypoint.sh'
    shouldExist: true
    permissions: '-rwxr-xr-x'
    
commandTests:
  - name: 'Node version'
    command: 'node'
    args: ['--version']
    expectedOutput: ['v18']
    
  - name: 'Non-root user'
    command: 'whoami'
    expectedOutput: ['nextjs']
    
  - name: 'Production dependencies only'
    command: 'sh'
    args: ['-c', 'ls node_modules | wc -l']
    exitCode: 0
    
  - name: 'TypeScript compilation check'
    command: 'node'
    args: ['-e', 'console.log("TypeScript compiled successfully")']
    expectedOutput: ['TypeScript compiled successfully']
```

## Advanced Features

### 1. Real-time Features with WebSockets
```typescript
// src/websocket/socketHandler.ts
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

export const setupWebSocket = (io: Server): void => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      socket.userId = (decoded as any).id;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);
    
    socket.on('join_room', (room) => {
      socket.join(room);
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });
};
```

### 2. Background Job Processing
```typescript
// src/jobs/emailQueue.ts
import Bull from 'bull';
import { sendEmail } from '../services/email.service';

export const emailQueue = new Bull('email queue', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379')
  }
});

emailQueue.process('send-welcome-email', async (job) => {
  const { email, name } = job.data;
  await sendEmail({
    to: email,
    subject: 'Welcome!',
    template: 'welcome',
    data: { name }
  });
});
```

## Learning Objectives

Engineers will learn:

1. **Modern TypeScript Development**
   - Advanced TypeScript features
   - Type-safe API development
   - Runtime type validation

2. **Express.js Best Practices**
   - Middleware patterns
   - Error handling
   - Request validation

3. **Testing Strategies**
   - Unit, integration, and E2E testing
   - Mocking and test doubles
   - Test coverage analysis

4. **Performance Optimization**
   - Bundle analysis
   - Memory leak detection
   - Load testing

5. **Production Readiness**
   - Logging and monitoring
   - Security best practices
   - Container optimization

## Prerequisites

- JavaScript/TypeScript basics
- Node.js fundamentals
- REST API concepts
- Docker basics

## Estimated Time

- **Setup**: 25 minutes
- **Code exploration**: 2-3 hours
- **Local development**: 45 minutes
- **CI/CD pipeline study**: 2-3 hours
- **Customization**: 3-5 hours

## Success Criteria

1. Application builds and runs in container
2. All tests pass in CI pipeline
3. API documentation is accessible
4. Security scans pass with no high-severity issues
5. Performance tests meet benchmarks
6. WebSocket functionality works correctly