import { useNavigate } from 'react-router-dom';
import { useExampleStore } from '../store/useExampleStore';

export default function About() {
  const navigate = useNavigate();
  const { count, user, setUser } = useExampleStore();

  const handleSetUser = () => {
    setUser({
      name: 'John Doe',
      email: 'john.doe@example.com',
    });
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">About Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Router Navigation Example</h2>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Home
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Zustand Store State</h2>
          <p className="mb-2">Current count: <strong>{count}</strong></p>
          <p className="mb-4">User: {user ? `${user.name} (${user.email})` : 'Not set'}</p>
          <button
            onClick={handleSetUser}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Set User in Store
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Project Information</h2>
          <p className="text-gray-600 mb-2">
            This is a starter React project with:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>React 19 with TypeScript</li>
            <li>Vite for build tooling</li>
            <li>Zustand for state management</li>
            <li>React Router for navigation</li>
            <li>Axios for HTTP requests</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

