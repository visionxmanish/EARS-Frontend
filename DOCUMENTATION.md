# EARS Frontend Documentation

This document provides comprehensive guidance on using the technologies integrated into this React starter project.

## Table of Contents

1. [Zustand State Management](#zustand-state-management)
2. [React Router](#react-router)
3. [Axios HTTP Client](#axios-http-client)
4. [Project Structure](#project-structure)

---

## Zustand State Management

Zustand is a lightweight state management library that provides a simple and intuitive API for managing global state in React applications.

### Basic Usage

#### Creating a Store

Stores are created using the `create` function from Zustand. Here's an example from `src/store/useExampleStore.ts`:

```typescript
import { create } from 'zustand';

interface ExampleState {
  count: number;
  user: { name: string; email: string } | null;
  increment: () => void;
  decrement: () => void;
  setUser: (user: { name: string; email: string } | null) => void;
}

export const useExampleStore = create<ExampleState>((set) => ({
  count: 0,
  user: null,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  setUser: (user) => set({ user }),
}));
```

#### Using a Store in Components

```typescript
import { useExampleStore } from '../store/useExampleStore';

function MyComponent() {
  // Access the entire store
  const { count, increment, decrement } = useExampleStore();
  
  // Or select specific parts (better for performance)
  const count = useExampleStore((state) => state.count);
  const increment = useExampleStore((state) => state.increment);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
    </div>
  );
}
```

### Advanced Patterns

#### Async Actions

```typescript
export const useUserStore = create<UserState>((set) => ({
  users: [],
  isLoading: false,
  error: null,
  
  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const users = await api.get('/users');
      set({ users, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
```

#### Computed Values

```typescript
// In your component
const totalUsers = useUserStore((state) => state.users.length);
```

#### Persisting State (localStorage)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
    }),
    {
      name: 'auth-storage', // localStorage key
    }
  )
);
```

### Best Practices

1. **Keep stores focused**: Create separate stores for different domains (auth, user, products, etc.)
2. **Use TypeScript**: Always define interfaces for your store state
3. **Selective subscriptions**: Use selectors to prevent unnecessary re-renders
4. **Immutable updates**: Always return new objects/arrays when updating state

---

## React Router

React Router enables client-side routing in your React application, allowing you to create a single-page application with multiple views.

### Basic Setup

The router is configured in `src/router/index.tsx`:

```typescript
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
```

### Navigation

#### Using Link Component

```typescript
import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
    </nav>
  );
}
```

#### Programmatic Navigation

```typescript
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/about');
    // Or with state
    navigate('/about', { state: { from: 'home' } });
    // Or replace current history entry
    navigate('/about', { replace: true });
  };
  
  return <button onClick={handleClick}>Go to About</button>;
}
```

### Route Parameters

#### Defining Routes with Parameters

```typescript
const router = createBrowserRouter([
  {
    path: '/users/:userId',
    element: <UserProfile />,
  },
]);
```

#### Accessing Route Parameters

```typescript
import { useParams } from 'react-router-dom';

function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  // Use userId to fetch user data
  return <div>User ID: {userId}</div>;
}
```

### Query Parameters

```typescript
import { useSearchParams } from 'react-router-dom';

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q');
  
  const updateQuery = (newQuery: string) => {
    setSearchParams({ q: newQuery });
  };
  
  return <div>Search: {query}</div>;
}
```

### Protected Routes

```typescript
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.token !== null);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Usage in router
{
  path: '/dashboard',
  element: (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  ),
}
```

### Nested Routes

```typescript
const router = createBrowserRouter([
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardHome /> },
      { path: 'settings', element: <Settings /> },
      { path: 'profile', element: <Profile /> },
    ],
  },
]);
```

### Location State

```typescript
import { useLocation } from 'react-router-dom';

function MyComponent() {
  const location = useLocation();
  const state = location.state; // Access passed state
  
  return <div>From: {state?.from}</div>;
}
```

---

## Axios HTTP Client

Axios is a promise-based HTTP client for making API requests. It's configured with interceptors for authentication and error handling.

### Configuration

The axios instance is configured in `src/lib/axios.ts` with:
- Base URL from environment variables
- Request timeout
- Default headers
- Request interceptor for authentication tokens
- Response interceptor for error handling

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Basic Usage

#### Using the API Helper

```typescript
import { api } from '../lib/api';

// GET request
const users = await api.get('/users');

// POST request
const newUser = await api.post('/users', {
  name: 'John Doe',
  email: 'john@example.com',
});

// PUT request
const updatedUser = await api.put('/users/123', {
  name: 'Jane Doe',
});

// DELETE request
await api.delete('/users/123');

// PATCH request
const patchedUser = await api.patch('/users/123', {
  email: 'newemail@example.com',
});
```

#### Using the Axios Instance Directly

```typescript
import apiClient from '../lib/axios';

// With full control
const response = await apiClient.get('/users', {
  params: { page: 1, limit: 10 },
  headers: { 'Custom-Header': 'value' },
});
```

### TypeScript Support

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

// Typed API calls
const users = await api.get<User[]>('/users');
const user = await api.get<User>('/users/123');
const newUser = await api.post<User>('/users', userData);
```

### Error Handling

```typescript
import { api } from '../lib/api';

try {
  const data = await api.get('/users');
  // Handle success
} catch (error: any) {
  if (error.response) {
    // Server responded with error status
    console.error('Error status:', error.response.status);
    console.error('Error data:', error.response.data);
  } else if (error.request) {
    // Request made but no response
    console.error('No response received');
  } else {
    // Error setting up request
    console.error('Error:', error.message);
  }
}
```

### Custom API Modules

Create domain-specific API modules in `src/lib/api.ts`:

```typescript
export const userApi = {
  getUsers: () => api.get('/users'),
  getUserById: (id: string) => api.get(`/users/${id}`),
  createUser: (userData: any) => api.post('/users', userData),
  updateUser: (id: string, userData: any) => api.put(`/users/${id}`, userData),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
};

// Usage
import { userApi } from '../lib/api';
const users = await userApi.getUsers();
```

### Request Interceptors

The configured interceptor automatically adds authentication tokens:

```typescript
// Token is automatically added from localStorage
// You can modify this in src/lib/axios.ts
```

### Response Interceptors

The configured interceptor handles:
- 401 Unauthorized: Redirects to login and clears token
- You can extend this for other error codes

### Uploading Files

```typescript
import apiClient from '../lib/axios';

const formData = new FormData();
formData.append('file', file);

const response = await apiClient.post('/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
```

### Downloading Files

```typescript
import apiClient from '../lib/axios';

const response = await apiClient.get('/download/file.pdf', {
  responseType: 'blob',
});

const url = window.URL.createObjectURL(new Blob([response.data]));
const link = document.createElement('a');
link.href = url;
link.setAttribute('download', 'file.pdf');
document.body.appendChild(link);
link.click();
```

---

## Project Structure

```
earsfrontend/
├── src/
│   ├── components/          # Reusable React components
│   │   └── Layout.tsx      # Main layout with navigation
│   ├── lib/                # Utility libraries and configurations
│   │   ├── axios.ts        # Axios instance configuration
│   │   └── api.ts          # API helper functions
│   ├── pages/              # Page components (routes)
│   │   ├── Home.tsx
│   │   ├── About.tsx
│   │   └── NotFound.tsx
│   ├── router/             # Router configuration
│   │   └── index.tsx       # Main router setup
│   ├── store/              # Zustand stores
│   │   └── useExampleStore.ts
│   ├── App.tsx             # (Legacy, not used with router)
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── .env                    # Environment variables (create this)
└── package.json
```

### Adding New Features

1. **New Store**: Create a file in `src/store/` (e.g., `useAuthStore.ts`)
2. **New Page**: Create a file in `src/pages/` and add route in `src/router/index.tsx`
3. **New API Endpoint**: Add functions to `src/lib/api.ts` or create a new module
4. **New Component**: Create in `src/components/` and import where needed

---

## Quick Start Examples

### Example: Complete Feature with Store, API, and Route

1. **Create Store** (`src/store/useProductStore.ts`):
```typescript
import { create } from 'zustand';

interface Product {
  id: string;
  name: string;
  price: number;
}

interface ProductState {
  products: Product[];
  isLoading: boolean;
  fetchProducts: () => Promise<void>;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  isLoading: false,
  fetchProducts: async () => {
    set({ isLoading: true });
    const products = await api.get<Product[]>('/products');
    set({ products, isLoading: false });
  },
}));
```

2. **Create Page** (`src/pages/Products.tsx`):
```typescript
import { useEffect } from 'react';
import { useProductStore } from '../store/useProductStore';

export default function Products() {
  const { products, isLoading, fetchProducts } = useProductStore();
  
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Products</h1>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

3. **Add Route** (`src/router/index.tsx`):
```typescript
{
  path: 'products',
  element: <Products />,
}
```

---

## Additional Resources

- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [React Router Documentation](https://reactrouter.com/)
- [Axios Documentation](https://axios-http.com/)
- [React Documentation](https://react.dev/)

---

## Troubleshooting

### Common Issues

1. **CORS Errors**: Configure your backend to allow requests from your frontend origin
2. **401 Errors**: Ensure tokens are stored in localStorage with key 'authToken'
3. **Route Not Found**: Check that routes are properly nested in the router configuration
4. **State Not Updating**: Ensure you're using Zustand hooks correctly and not mutating state directly

---

Happy coding! 🚀

