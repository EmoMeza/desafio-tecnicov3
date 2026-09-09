import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <section className="max-w-md">
      <p className="font-mono text-[44px] leading-none text-ink-soft">404</p>
      <h1 className="mt-4 text-[22px] font-semibold tracking-tight">No encontramos esta página</h1>
      <p className="mt-2 text-ink-soft">
        Revisa la dirección o vuelve al inicio para hacer una consulta.
      </p>
      <Link to="/" className="btn-primary mt-6">
        Ir al inicio
      </Link>
    </section>
  );
}
