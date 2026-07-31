'use client';

import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';

interface Palavra {
  id?: string;
  titulo: string;
  texto: string;
  pregador: string | null;
  versiculo: string | null;
  data: string;
  published: boolean;
}

interface Props {
  palavra?: Palavra;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  onDelete?: (formData: FormData) => Promise<void>;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-stone-950 font-semibold rounded-lg px-5 py-2.5 text-sm transition-colors flex items-center gap-2"
    >
      {pending && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {pending ? 'Salvando...' : label}
    </button>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-red-500 hover:text-red-400 disabled:opacity-50 text-sm transition-colors"
    >
      {pending ? 'Excluindo...' : 'Excluir palavra'}
    </button>
  );
}

const INPUT = 'w-full bg-stone-900 border border-stone-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors';

export function PalavraForm({ palavra, action, submitLabel, onDelete }: Props) {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-2xl space-y-8">
      <form action={action} className="space-y-5">
        <div>
          <label className="block text-stone-400 text-xs font-medium mb-1.5 uppercase tracking-wide">Título *</label>
          <input
            name="titulo"
            required
            defaultValue={palavra?.titulo ?? ''}
            className={INPUT}
            placeholder="Título da palavra"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-stone-400 text-xs font-medium mb-1.5 uppercase tracking-wide">Pregador</label>
            <input
              name="pregador"
              defaultValue={palavra?.pregador ?? ''}
              className={INPUT}
              placeholder="Nome do pregador"
            />
          </div>
          <div>
            <label className="block text-stone-400 text-xs font-medium mb-1.5 uppercase tracking-wide">Data *</label>
            <input
              name="data"
              type="date"
              required
              defaultValue={palavra?.data ?? today}
              className={INPUT}
            />
          </div>
        </div>

        <div>
          <label className="block text-stone-400 text-xs font-medium mb-1.5 uppercase tracking-wide">Versículo base</label>
          <input
            name="versiculo"
            defaultValue={palavra?.versiculo ?? ''}
            className={INPUT}
            placeholder="Ex: João 3:16"
          />
        </div>

        <div>
          <label className="block text-stone-400 text-xs font-medium mb-1.5 uppercase tracking-wide">Texto / Resumo *</label>
          <textarea
            name="texto"
            required
            defaultValue={palavra?.texto ?? ''}
            rows={8}
            className={`${INPUT} resize-none`}
            placeholder="Escreva o texto da palavra..."
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                name="published"
                value="true"
                defaultChecked={palavra?.published ?? false}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-stone-700 rounded-full peer peer-checked:bg-amber-500 transition-colors" />
              <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
            </div>
            <span className="text-stone-300 text-sm">Publicar no app</span>
          </label>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2.5 rounded-lg border border-stone-700 text-stone-400 hover:text-white text-sm transition-colors"
            >
              Cancelar
            </button>
            <SubmitButton label={submitLabel} />
          </div>
        </div>
      </form>

      {onDelete && (
        <form
          action={onDelete}
          onSubmit={(e) => {
            if (!confirm('Tem certeza que deseja excluir esta palavra?')) e.preventDefault();
          }}
        >
          <DeleteButton />
        </form>
      )}
    </div>
  );
}
