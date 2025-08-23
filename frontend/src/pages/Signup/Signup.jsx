import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function Signup() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr(''); setMsg('');
    try {
      await api.post('/auth/register', form);
      setMsg('Cadastro realizado! Faça login.');
      setTimeout(() => nav('/login'), 800);
    } catch (error) {
      setErr(error?.response?.data?.error || 'Falha ao cadastrar');
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Cadastro</h1>
      <form onSubmit={onSubmit}>
        <div>
          <label>Nome</label><br />
          <input name="name" value={form.name} onChange={onChange} />
        </div>
        <div>
          <label>Email</label><br />
          <input name="email" type="email" value={form.email} onChange={onChange} required />
        </div>
        <div>
          <label>Senha</label><br />
          <input name="password" type="password" value={form.password} onChange={onChange} required />
        </div>
        <button type="submit">Criar conta</button>
      </form>
      {msg && <p style={{ color: 'green' }}>{msg}</p>}
      {err && <p style={{ color: 'crimson' }}>{err}</p>}
      <p>Já possui conta? <Link to="/login">Entrar</Link></p>
    </div>
  );
}
