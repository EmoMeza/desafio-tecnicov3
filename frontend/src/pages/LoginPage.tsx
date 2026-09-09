import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../auth/use-auth';
import { ApiError } from '../lib/api';

const TEST_ACCOUNTS = [
  { email: 'admin@riesgo.cl', password: 'Admin123!', access: 'Cualquier RUT' },
  { email: 'ana@riesgo.cl', password: 'Ana123!', access: '12.345.678-5' },
  { email: 'bruno@riesgo.cl', password: 'Bruno123!', access: '15.834.966-3' },
];

function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'INVALID_CREDENTIALS') return 'El correo o la contraseña no son correctos.';
    if (error.code === 'VALIDATION_ERROR') return 'Revisa el correo y la contraseña ingresados.';
    if (error.code === 'NETWORK') return 'No se pudo conectar con el servidor. Intenta de nuevo.';
  }
  return 'No se pudo iniciar sesión. Intenta de nuevo.';
}

export function LoginPage() {
  const { login, isAuthenticated, sessionExpired } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  async function submit() {
    if (email.trim() === '' || password === '') {
      setError('Ingresa tu correo y contraseña.');
      return;
    }
    setError(null);
    setPending(true);
    try {
      await login(email.trim(), password);
      void navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(describeError(err));
      setPending(false);
    }
  }

  return (
    <section className="max-w-sm">
      <h1 className="text-[26px] font-semibold tracking-tight">Iniciar sesión</h1>
      <p className="mt-2 text-ink-soft">Consulta el score financiero de un RUT.</p>

      {sessionExpired && (
        <p className="mt-5 border-l-2 border-line pl-3 text-[14px] text-ink-soft">
          Tu sesión expiró. Vuelve a iniciar sesión para continuar.
        </p>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        noValidate
        className="mt-6 space-y-4"
      >
        <div>
          <label htmlFor="email" className="field-label">
            Correo
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
            }}
            className="field-input"
            placeholder="tu@correo.cl"
          />
        </div>

        <div>
          <label htmlFor="password" className="field-label">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
            className="field-input"
          />
        </div>

        {error !== null && (
          <p role="alert" className="border-l-2 border-risk-low pl-3 text-[14px] text-risk-low">
            {error}
          </p>
        )}

        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? 'Entrando…' : 'Iniciar sesión'}
        </button>
      </form>

      <div className="mt-10 border-t border-line pt-5">
        <p className="text-[13px] font-medium text-ink-soft">Cuentas de prueba</p>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-left text-ink-soft">
                <th className="pb-1.5 pr-4 font-medium">Correo</th>
                <th className="pb-1.5 pr-4 font-medium">Contraseña</th>
                <th className="pb-1.5 font-medium">Puede consultar</th>
              </tr>
            </thead>
            <tbody className="font-mono text-ink">
              {TEST_ACCOUNTS.map((account) => (
                <tr key={account.email}>
                  <td className="py-0.5 pr-4">{account.email}</td>
                  <td className="py-0.5 pr-4">{account.password}</td>
                  <td className="py-0.5">{account.access}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
