'use client';
import { useFormStatus } from 'react-dom';

interface Props {
  label: string;
  pendingLabel?: string;
  className?: string;
}

export function SubmitButton({ label, pendingLabel, className }: Props) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={className ?? 'w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-stone-950 font-semibold text-sm px-4 py-3 rounded-lg transition-colors'}
    >
      {pending ? (pendingLabel ?? 'Aguarde...') : label}
    </button>
  );
}
