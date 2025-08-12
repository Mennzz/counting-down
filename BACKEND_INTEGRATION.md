# Backend Integration Guide

This project has been updated to fetch todo data from a backend API instead of using local state.

## Development Setup

### Option 1: Using the Mock Server (Recommended for Development)

1. Install dependencies:
```bash
npm install
```

2. Start both the mock server and frontend development server:
```bash
npm run dev:full
```

This will start:
- Mock API server on `http://localhost:3001`
- Frontend development server on `http://localhost:8080`

### Option 2: Start Services Separately

1. Start the mock server:
```bash
npm run mock-server
```

2. In another terminal, start the frontend:
```bash
npm run dev
```

## API Endpoints

The mock server provides the following endpoints:

- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo
- `POST /api/todos/:id/toggle-completion` - Toggle completion status of a todo
- `GET /health` - Health check


## Production Configuration

To use a production backend, update the `API_BASE_URL` in `src/services/api.ts`:

```typescript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-api.com/api'  // Update this URL
  : 'http://localhost:3001/api';
```

## Features

- **React Query Integration**: Efficient data fetching with automatic caching, background refetching, and error handling
- **Optimistic Updates**: UI updates immediately while API calls are in progress
- **Loading States**: Visual feedback during API operations
- **Error Handling**: Toast notifications for API errors
- **Offline Support**: React Query provides automatic retry and caching capabilities

## API Schema

### Todo Object
```typescript
interface Todo {
  id: number;
  text: string;
  completed: boolean;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}
```

### Create Todo Request
```typescript
interface CreateTodoRequest {
  text: string;
  category: string;
}
```

### Update Todo Request
```typescript
interface UpdateTodoRequest {
  text?: string;
  completed?: boolean;
  category?: string;
}
```

## Backend Implementation Notes

For a production backend, ensure your API:

1. **CORS Configuration**: Allow requests from your frontend domain
2. **Input Validation**: Validate all incoming data
3. **Error Handling**: Return appropriate HTTP status codes and error messages
4. **Authentication**: Add authentication if needed
5. **Rate Limiting**: Implement rate limiting to prevent abuse
6. **Database**: Use a proper database instead of in-memory storage

### Example Backend Technologies

- **Node.js + Express + MongoDB**
- **Python + FastAPI + PostgreSQL**
- **Ruby on Rails + PostgreSQL**
- **Go + Gin + SQLite**
- **PHP + Laravel + MySQL**

The frontend will work with any backend that implements the same API contract.
