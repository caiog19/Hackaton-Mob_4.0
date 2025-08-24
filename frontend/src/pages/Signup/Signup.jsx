import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 
import api from "../../services/api";
import "../AuthCss/Auth.css"; 

import busBg from "../../assets/bus_bg.png";
import logo from "../../assets/logo_ixplana.png";

export default function Signup() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [showPassword, setShowPassword] = useState(false); 

  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    try {
      await api.post("/auth/register", form);
      setMsg("Cadastro realizado com sucesso! Redirecionando...");
      setTimeout(() => nav("/login"), 1500); 
    } catch (error) {
      setErr(error?.response?.data?.error || "Falha ao cadastrar");
    }
  }

  return (
    <div className="login-page">
      <img src={busBg} alt="" className="bg-bus" aria-hidden="true" />
      <div className="login-wrap">
        <img src={logo} alt="iXplanabus" className="brand-logo" />
        <div className="card">
          <h1 className="title">Criar Conta</h1>
          <form onSubmit={onSubmit} className="form">
            <label className="label" htmlFor="name">
              Nome Completo
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="input"
              placeholder="Seu nome completo"
              value={form.name}
              onChange={onChange}
              required
              autoComplete="name"
            />
            <label className="label" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              placeholder="seu@email.com"
              value={form.email}
              onChange={onChange}
              required
              autoComplete="email"
            />
            <label className="label" htmlFor="password">
              Senha
            </label>
            <div className="input-wrap">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="input"
                placeholder="Crie uma senha forte"
                value={form.password}
                onChange={onChange}
                required
                autoComplete="new-password"
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
              <Link to="/login" className="link-btn">
                Já tenho uma conta
              </Link>
            </div>
            <button type="submit" className="btn-primary">
              Cadastrar
            </button>
          </form>
          {(err || msg) && (
            <p className={err ? "error" : "success"}>{err || msg}</p>
          )}
        </div>
      </div>
    </div>
  );
}