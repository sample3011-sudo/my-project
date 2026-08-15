const API_URL = import.meta.env['VITE_API_URL'] ?? 'http://localhost:8080';

export default function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', textAlign: 'center' }}>
      <h1>Sample CRM</h1>
      <p>Frontend is running. API is at: <code>{API_URL}</code></p>
    </div>
  );
}
