import { useState } from 'react';
import { useAuth } from '../auth/use-auth';
import { ScoreResult } from '../components/ScoreResult';
import { ApiError, api } from '../lib/api';
import { formatRutInput, isValidRut } from '../lib/rut';
import type { ScoreResponse } from '../types/api';

function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'INVALID_RUT') return 'El RUT ingresado no es válido.';
    if (error.code === 'FORBIDDEN_RUT') return 'Solo puedes consultar tu propio RUT.';
    if (error.code === 'NETWORK') return 'No se pudo conectar con el servidor. Intenta de nuevo.';
  }
  return 'No se pudo obtener el score. Intenta de nuevo.';
}

export function ScorePage() {
  const { user, token } = useAuth();

  const [rut, setRut] = useState(() => user?.rut ?? '');
  const [result, setResult] = useState<ScoreResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit() {
    if (!isValidRut(rut)) {
      setError('El RUT ingresado no es válido.');
      setResult(null);
      return;
    }

    setError(null);
    setPending(true);
    try {
      const data = await api.score(rut, token ?? '');
      setResult(data);
    } catch (err) {
      setError(describeError(err));
      setResult(null);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mx-auto my-auto w-full max-w-md py-12">
      <h1 className="text-[26px] font-semibold tracking-tight">Consulta de score</h1>
      <p className="mt-2 text-ink-soft">
        Ingresa un RUT para ver su score financiero, un valor entre 0 y 100.
      </p>

      {user?.role === 'user' && (
        <p className="mt-4 border-l-2 border-line pl-3 text-[13px] text-ink-soft">
          Como usuario solo puedes consultar tu propio RUT.
        </p>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        noValidate
        className="mt-6"
      >
        <label htmlFor="rut" className="field-label">
          RUT
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="rut"
            name="rut"
            inputMode="text"
            autoComplete="off"
            value={rut}
            onChange={(event) => {
              setRut(formatRutInput(event.target.value));
            }}
            placeholder="12.345.678-5"
            className="field-input font-mono sm:flex-1"
          />
          <button type="submit" disabled={pending} className="btn-primary w-full sm:w-auto sm:px-6">
            {pending ? 'Consultando…' : 'Consultar'}
          </button>
        </div>

        {error !== null && (
          <p
            role="alert"
            className="mt-3 border-l-2 border-risk-low pl-3 text-[14px] text-risk-low"
          >
            {error}
          </p>
        )}
      </form>

      {result !== null && <ScoreResult data={result} />}
    </section>
  );
}
