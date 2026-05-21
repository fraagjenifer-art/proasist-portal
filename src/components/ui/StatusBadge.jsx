import clsx from 'clsx'

const statusConfig = {
  'En análisis':      { bg: 'bg-slate-100',  text: 'text-slate-600',  dot: 'bg-slate-400' },
  'Disputa Ronda 1':  { bg: 'bg-blue-50',    text: 'text-blue-700',   dot: 'bg-blue-500' },
  'Disputa Ronda 2':  { bg: 'bg-amber-50',   text: 'text-amber-700',  dot: 'bg-amber-500' },
  'Disputa Ronda 3':  { bg: 'bg-orange-50',  text: 'text-orange-700', dot: 'bg-orange-500' },
  'Completado':       { bg: 'bg-green-50',   text: 'text-green-700',  dot: 'bg-green-500' },
  'Pausado':          { bg: 'bg-red-50',     text: 'text-red-700',    dot: 'bg-red-500' },
  'Pendiente':        { bg: 'bg-slate-100',  text: 'text-slate-600',  dot: 'bg-slate-400' },
  'En disputa':       { bg: 'bg-blue-50',    text: 'text-blue-700',   dot: 'bg-blue-500' },
  'Eliminado':        { bg: 'bg-green-50',   text: 'text-green-700',  dot: 'bg-green-500' },
  'Actualizado':      { bg: 'bg-teal-50',    text: 'text-teal-700',   dot: 'bg-teal-500' },
  'Verificado':       { bg: 'bg-purple-50',  text: 'text-purple-700', dot: 'bg-purple-500' },
}

export default function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig['En análisis']
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', cfg.bg, cfg.text)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', cfg.dot)} />
      {status}
    </span>
  )
}
