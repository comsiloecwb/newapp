'use client';

import { useRouter } from 'next/navigation';

interface BackButtonProps {
  href?: string;
  label?: string;
}

export function BackButton({ href, label = 'Voltar' }: BackButtonProps) {
  const router = useRouter();

  function handleClick() {
    if (href) router.push(href);
    else router.back();
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1.5 text-stone-400 hover:text-white text-sm transition-colors mb-6"
    >
      <span className="text-base">←</span>
      {label}
    </button>
  );
}
