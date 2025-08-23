import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');

  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      nav('/home');
    } catch (error) {
      setErr(error?.response?.data?.error || 'Falha ao logar');
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Login</h1>
      <form onSubmit={onSubmit}>
        <div>
          <label>Email</label><br />
          <input name="email" type="email" value={form.email} onChange={onChange} required />
        </div>
        <div>
          <label>Senha</label><br />
          <input name="password" type="password" value={form.password} onChange={onChange} required />
        </div>
        <button type="submit">Entrar</button>
      </form>
      {err && <p style={{ color: 'crimson' }}>{err}</p>}
      <p>Não tem conta? <Link to="/signup">Cadastrar</Link></p>
    </div>
  );
}
