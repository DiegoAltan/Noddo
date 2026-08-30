import { C, FONT, SERIF, FONDOS, CSS } from "../estilos/tema.js";
import { pantalla, mini } from "../estilos/compartidos.js";
import { supabaseConfigurado } from "../lib/supabaseClient.js";
import Noddo from "../ui/Noddo.jsx";
import { useAuth } from "./AuthProvider.jsx";

export default function LoginProfesional({ onVolver }) {
  const { entrarConGoogle, entrarModoPrueba } = useAuth();

  return (
    <div
      className="nd"
      style={{
        ...pantalla,
        background: FONDOS.bruma.bg,
        fontFamily: FONT,
        color: C.ink,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <style>{CSS}</style>
      <div
        style={{
          width: "min(360px, 100%)",
          background: C.panel,
          border: `1px solid ${C.hair}`,
          borderRadius: 16,
          padding: "36px 32px",
          boxShadow: "0 24px 60px -24px rgba(22,50,63,.35)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
          <Noddo tamano={19} />
        </div>
        <p style={{ textAlign: "center", fontSize: 12.5, color: C.inkSoft, marginTop: 4, marginBottom: 32 }}>
          Acceso profesional
        </p>

        {!supabaseConfigurado ? (
          <>
            <p style={{ fontSize: 12.5, color: C.peligro, lineHeight: 1.5, marginTop: 0 }}>
              Falta configurar Supabase (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) para
              poder iniciar sesión con Google.
            </p>
            <button
              className="nd-btn"
              onClick={entrarModoPrueba}
              style={{
                width: "100%",
                padding: "12px 16px",
                fontFamily: FONT,
                fontSize: 13.5,
                border: `1px dashed ${C.borde}`,
                borderRadius: 8,
                background: "transparent",
                color: C.inkSoft,
                cursor: "pointer",
              }}
            >
              Entrar en modo de prueba
            </button>
            <p style={{ fontSize: 11, color: C.inkTenue, lineHeight: 1.5, marginBottom: 0 }}>
              Temporal, solo mientras pruebas la app: entra con un perfil ficticio y
              guarda los lienzos en este navegador, no en Supabase.
            </p>
          </>
        ) : (
          <button
            className="nd-btn"
            onClick={entrarConGoogle}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "12px 16px",
              fontFamily: FONT,
              fontSize: 13.5,
              border: `1px solid ${C.borde}`,
              borderRadius: 8,
              background: C.panel,
              color: C.ink,
              cursor: "pointer",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.87c2.27-2.09 3.57-5.17 3.57-8.8Z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.87-3c-1.08.72-2.46 1.15-4.08 1.15-3.14 0-5.8-2.12-6.75-4.96H1.26v3.11A12 12 0 0 0 12 24Z" />
              <path fill="#FBBC05" d="M5.25 14.29a7.2 7.2 0 0 1 0-4.58V6.6H1.26a12 12 0 0 0 0 10.8l3.99-3.11Z" />
              <path fill="#EA4335" d="M12 4.75c1.76 0 3.35.6 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.26 6.6l3.99 3.11C6.2 6.87 8.86 4.75 12 4.75Z" />
            </svg>
            Continuar con Google
          </button>
        )}

        <button
          className="nd-mini"
          style={{ ...mini, display: "block", margin: "20px auto 0", textAlign: "center" }}
          onClick={onVolver}
        >
          Volver
        </button>
      </div>
    </div>
  );
}
