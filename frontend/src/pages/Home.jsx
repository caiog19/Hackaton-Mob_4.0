import { useNavigate } from 'react-router-dom';

export default function Home() {
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    nav('/login');
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Home (protegida)</h1>
      <p>Bem-vindo{user?.name ? `, ${user.name}` : ''}!</p>
      <button onClick={logout}>Sair</button>
    </div>
  );
}
