"use client";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, LoaderCircle } from "lucide-react";
import { getSupabase } from "@/lib/archive";
export default function AuthPage({
  enabled,
  onBack,
  announce,
}: {
  enabled: boolean;
  onBack: () => void;
  announce: (s: string) => void;
}) {
  const [signup, setSignup] = useState(false),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [show, setShow] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const oauth = async (provider: "google" | "apple") => {
    const c = await getSupabase();
    if (!c) return;
    const { error } = await c.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin + "/#perfil" },
    });
    if (error) setError(error.message);
  };
  return (
    <main className="auth-page">
      <div className="auth-backdrop" />
      <header>
        <button className="brand" onClick={onBack}>
          AFTERSCENE
        </button>
        <span>
          ¿Aún no tienes cuenta?{" "}
          <button onClick={() => setSignup((v) => !v)}>
            {signup ? "Iniciar sesión" : "Crear cuenta"}
          </button>
        </span>
      </header>
      <section className="auth-intro">
        <h1>AFTERSCENE</h1>
        <h2>
          Tu historia en
          <br />
          audiovisual vive aquí.
        </h2>
        <p>
          Guarda lo que ves. Recuerda lo que sientes.
          <br />
          Tu espacio personal para películas, series,
          <br />
          anime y k-dramas.
        </p>
      </section>
      <section className="auth-panel">
        <h2>{signup ? "Crear cuenta" : "Iniciar sesión"}</h2>
        <p>Continúa tu viaje en AFTERSCENE</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!enabled) return;
            setBusy(true);
            setError("");
            try {
              const c = await getSupabase();
              if (!c) throw Error("Conecta Supabase para usar cuentas.");
              const result = signup
                ? await c.auth.signUp({ email, password })
                : await c.auth.signInWithPassword({ email, password });
              if (result.error) throw result.error;
              if (signup && !result.data.session)
                announce("Revisa tu correo para confirmar tu cuenta.");
              else {
                announce("Bienvenido a tu archivo.");
                onBack();
              }
            } catch (e) {
              setError(
                e instanceof Error ? e.message : "No se pudo iniciar sesión.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            <Mail size={17} />
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              aria-label="Correo electrónico"
            />
          </label>
          <label>
            <Lock size={17} />
            <input
              type={show ? "text" : "password"}
              required
              minLength={8}
              autoComplete={signup ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              aria-label="Contraseña"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </label>
          <div className="auth-options">
            <span>
              <Lock size={12} />
              Conexión privada
            </span>
            <button type="button" onClick={onBack}>
              Explorar AFTERSCENE
            </button>
          </div>
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
          <button
            className="auth-primary"
            disabled={busy || !enabled}
            type="submit"
          >
            {busy ? <LoaderCircle className="spin" size={16} /> : null}
            {signup ? "Crear cuenta" : "Iniciar sesión"}
          </button>
        </form>
        <div className="auth-or">
          <i />
          <span>o continúa con</span>
          <i />
        </div>
        <button
          className="auth-provider"
          disabled={!enabled}
          onClick={() => oauth("google")}
        >
          <b className="google-g">G</b>Continuar con Google
        </button>
        <button
          className="auth-provider"
          disabled={!enabled}
          onClick={() => oauth("apple")}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M16.3 1c.1 1.3-.4 2.5-1.2 3.4-.9 1-2.1 1.5-3.2 1.4-.2-1.2.4-2.4 1.2-3.3C14 1.6 15.3 1 16.3 1zM20.4 17.7c-.5 1.1-.8 1.6-1.4 2.5-.8 1.1-1.9 2.6-3.2 2.6-1.1 0-1.5-.7-3-.7-1.6 0-2 .7-3.1.7-1.3 0-2.3-1.3-3.1-2.4C4.3 17.2 3.5 13 5 10.4c1-1.9 2.8-3 4.5-3 1.3 0 2.1.7 3.2.7 1 0 1.7-.7 3.2-.7 1.4 0 2.9.8 3.8 2.1-3.3 1.8-2.8 6.5.7 8.2z" />
          </svg>
          Continuar con Apple
        </button>
        {!enabled && (
          <div className="auth-local">
            <p>
              La versión actual guarda tu archivo en este navegador. Las cuentas
              se activan al conectar Supabase.
            </p>
            <button onClick={onBack}>
              Continuar en este dispositivo <ArrowLeft size={13} />
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
