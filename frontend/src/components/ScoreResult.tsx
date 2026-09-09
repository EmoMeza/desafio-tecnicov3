import type { ScoreResponse } from '../types/api';

type BandKey = 'low' | 'mid' | 'high';

const BANDS: Record<BandKey, { label: string; color: string }> = {
  low: { label: 'Riesgo alto', color: 'var(--color-risk-low)' },
  mid: { label: 'Riesgo moderado', color: 'var(--color-risk-mid)' },
  high: { label: 'Riesgo bajo', color: 'var(--color-risk-high)' },
};

function bandFor(score: number): BandKey {
  if (score <= 39) return 'low';
  if (score <= 69) return 'mid';
  return 'high';
}

function formatFecha(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function ScoreResult({ data }: { data: ScoreResponse }) {
  const band = BANDS[bandFor(data.score)];
  const trackBackground = `linear-gradient(to right,
    color-mix(in srgb, var(--color-risk-low) 20%, var(--color-line)) 0% 40%,
    color-mix(in srgb, var(--color-risk-mid) 20%, var(--color-line)) 40% 70%,
    color-mix(in srgb, var(--color-risk-high) 20%, var(--color-line)) 70% 100%)`;

  return (
    <div className="panel mt-8 p-6">
      <p className="text-[13px] text-ink-soft">RUT consultado</p>
      <p className="font-mono text-[16px] text-ink">{data.rut}</p>

      <div className="mt-6 flex items-end gap-3">
        <span
          className="font-mono text-[64px] leading-none tracking-tight"
          style={{ color: band.color }}
        >
          {data.score}
        </span>
        <span className="pb-2 text-[15px] text-ink-soft">de 100</span>
      </div>
      <p className="mt-1.5 text-[14px] font-medium" style={{ color: band.color }}>
        {band.label}
      </p>

      <div className="mt-6">
        <div className="relative h-1.5 rounded-full" style={{ background: trackBackground }}>
          <span
            className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface"
            style={{
              left: `clamp(7px, ${String(data.score)}%, calc(100% - 7px))`,
              backgroundColor: band.color,
            }}
          />
        </div>
        <div className="mt-1.5 flex justify-between font-mono text-[11px] text-ink-soft">
          <span>0</span>
          <span>100</span>
        </div>
      </div>

      <p className="mt-6 border-t border-line pt-3 text-[13px] text-ink-soft">
        Consultado el {formatFecha(data.fecha)}
      </p>
    </div>
  );
}
