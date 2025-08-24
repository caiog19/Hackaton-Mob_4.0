import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from 'react-icons/fc';
import { FaApple, FaEye, FaEyeSlash } from 'react-icons/fa'; 
import api from "../../services/api";
import "../AuthCss/Auth.css";

import busBg from "../../assets/bus_bg.png";
import logo from "../../assets/logo_ixplana.png";

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [showPassword, setShowPassword] = useState(false); 

  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      nav("/home");
    } catch (error) {
      setErr(error?.response?.data?.error || "Falha ao logar");
    }
  }

  return (
    <div className="login-page">
      <img src={busBg} alt="" className="bg-bus" aria-hidden="true" />
      <div className="login-wrap">
        <img src={logo} alt="iXplanabus" className="brand-logo" />
        <div className="card">
          <h1 className="title">Entrar</h1>
          <form onSubmit={onSubmit} className="form">
            <label className="label" htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              placeholder="E-mail"
              value={form.email}
              onChange={onChange}
              required
              autoComplete="email"
            />

            <label className="label" htmlFor="password">Senha</label>
            <div className="input-wrap">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="input"
                placeholder="Senha"
                value={form.password}
                onChange={onChange}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)} 
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="row links">
              <button type="button" className="link-btn">Esqueci minha senha</button>
              <Link to="/signup" className="link-btn">Criar conta</Link>
            </div>

            <button type="submit" className="btn-primary">Entrar</button>
          </form>
          <div className="divider"><span>OU</span></div>
          <button type="button" className="btn-social">
            <FcGoogle size={22} />
            Continuar com Google
          </button>
          <button type="button" className="btn-social">
            <FaApple size={24} />
            Continuar com o Apple
          </button>
          {err && <p className="error">{err}</p>}
        </div>
      </div>
    </div>
  );
}