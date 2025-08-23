import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Login.css";

import busBg from "../assets/bus_bg.png";
import logo from "../assets/logo_ixplana.png";

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");

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
            <label className="label" htmlFor="email">
              E-mail
            </label>
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

            <label className="label" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              placeholder="Senha"
              value={form.password}
              onChange={onChange}
              required
              autoComplete="current-password"
            />

            <div className="row links">
              <button type="button" className="link-btn">
                Esqueci minha senha
              </button>
              <Link to="/signup" className="link-btn">
                Criar conta
              </Link>
            </div>

            <button type="submit" className="btn-primary">
              Entrar
            </button>
          </form>
          <div className="divider">
            <span>OU</span>
          </div>
          <button type="button" className="btn-social">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              preserveAspectRatio="x MidYMid"
              viewBox="0 0 256 262"
            >
              <path
                fill="#4285F4"
                d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.686H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027Z"
              />
              <path
                fill="#34A853"
                d="M130.55 261.1c35.24 0 64.838-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1Z"
              />
              <path
                fill="#FBBC05"
                d="M56.281 156.37c-2.756-8.123-4.351-16.8-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782Z"
              />
              <path
                fill="#EB4335"
                d="M130.55 50.479c19.205 0 36.344 6.698 50.073 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251Z"
              />
            </svg>
            Continuar com Google
          </button>
          <button type="button" className="btn-social">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="apple-svg"
            >
              <path d="M16.365 1.43c0 1.14-.406 2.077-1.216 2.81-.811.733-1.688 1.14-2.627 1.216-.129-.41-.193-.784-.193-1.124 0-1.091.444-2.034 1.332-2.83.888-.797 1.91-1.225 3.064-1.283.088.403.132.758.132 1.211zM20.571 13.51c-.044-2.356 1.951-3.495 2.041-3.549-1.11-1.64-2.84-1.862-3.449-1.894-1.477-.15-2.884.865-3.63.865-.744 0-1.917-.844-3.154-.82-1.625.024-3.135.951-3.97 2.415-1.688 2.935-.43 7.262 1.211 9.64.806 1.157 1.768 2.454 3.028 2.408 1.216-.047 1.672-.79 3.148-.79 1.478 0 1.887.79 3.157.765 1.31-.027 2.145-1.18 2.94-2.343.927-1.355 1.306-2.668 1.33-2.737-.028-.013-2.556-.981-2.51-3.996z" />
            </svg>
            Continuar com o Apple
          </button>

          {err && <p className="error">{err}</p>}
        </div>
      </div>
    </div>
  );
}
