'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmModal } from './ConfirmModal';

type Evento = {
  id?: string;
  titulo: string;
  descricao: string | null;
  start_at: string;
  end_at: string | null;
  location: string | null;
  rede: string;
  is_paid: boolean;
  price_cents: number | null;
  vagas_total: number | null;
  vagas_alerta: number | null;
  published: boolean;
};

interface EventoFormProps {
  evento?: Evento;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  onDelete?: () => Promise<void>;
}

function toDatetimeLocal(iso: string | null) {
  if (!iso) return '';
  return iso.slice(0, 16);
}

const INPUT = 'w-full bg-stone-900 border border-stone-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-stone-400 text-xs font-medium uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

export function EventoForm({ evento, action, submitLabel, onDelete }: EventoFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleting] = useTransition();
  const [isPaid, setIsPaid] = useState(evento?.is_paid ?? false);
  const [published, setPublished] = useState(evento?.published ?? false);
  const [vagasTotal, setVagasTotal] = useState(evento?.vagas_total?.toString() ?? '');
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.currentTarget);
    fd.set('is_paid', isPaid ? 'true' : 'false');
    fd.set('published', published ? 'true' : 'false');
    startTransition(async () => {
      try { await action(fd); } catch (err) { setError((err as Error).message); }
    });
  }

  function confirmDelete() {
    setShowDeleteModal(false);
    startDeleting(async () => { await onDelete!(); });
  }

  return (
    <>
      <ConfirmModal
        open={showDeleteModal}
        title="Excluir evento"
        message="Tem certeza? O evento será removido do app imediatamente. Esta ação não pode ser desfeita."
        confirmLabel="Sim, excluir"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {error && (
          <div className="bg-red-950/40 border border-red-900 text-red-400 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <Field label="Título *">
          <input name="titulo" required defaultValue={evento?.titulo ?? ''}
            className={INPUT} placeholder="Ex: Culto de domingo" />
        </Field>

        <Field label="Descrição">
          <textarea name="descricao" rows={3} defaultValue={evento?.descricao ?? ''}
            className={`${INPUT} resize-none`} placeholder="Descrição do evento..." />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Início *">
            <input name="start_at" type="datetime-local" required
              defaultValue={toDatetimeLocal(evento?.start_at ?? null)} className={INPUT} />
          </Field>
          <Field label="Término">
            <input name="end_at" type="datetime-local"
              defaultValue={toDatetimeLocal(evento?.end_at ?? null)} className={INPUT} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Local">
            <input name="location" defaultValue={evento?.location ?? ''}
              className={INPUT} placeholder="Templo principal" />
          </Field>
          <Field label="Rede">
            <select name="rede" defaultValue={evento?.rede ?? 'todos'} className={INPUT}>
              <option value="todos">Todos</option>
              <option value="homens">Homens</option>
              <option value="mulheres">Mulheres</option>
              <option value="jovem">Jovem</option>
              <option value="casais">Casais</option>
              <option value="kids">Kids</option>
            </select>
          </Field>
        </div>

        <Field label="Vagas totais (deixe vazio para ilimitado)">
          <input
            name="vagas_total"
            type="number"
            min="1"
            value={vagasTotal}
            onChange={(e) => setVagasTotal(e.target.value)}
            className={INPUT}
            placeholder="Ex: 100"
          />
        </Field>

        {vagasTotal && (
          <Field label="Alertar vagas a partir de">
            <input
              name="vagas_alerta"
              type="number"
              min="1"
              max={parseInt(vagasTotal) - 1}
              defaultValue={evento?.vagas_alerta ?? ''}
              className={INPUT}
              placeholder={`Ex: 10 (exibe "10 vagas restantes" no app)`}
            />
            <p className="text-stone-500 text-xs mt-1">
              Deve ser menor que o total de vagas ({vagasTotal})
            </p>
          </Field>
        )}

        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setIsPaid(!isPaid)}
            className={`w-10 h-6 rounded-full transition-colors ${isPaid ? 'bg-amber-500' : 'bg-stone-700'}`}>
            <span className={`block w-4 h-4 bg-white rounded-full mx-1 transition-transform ${isPaid ? 'translate-x-4' : ''}`} />
          </button>
          <span className="text-stone-300 text-sm">Evento pago</span>
        </div>

        {isPaid && (
          <Field label="Valor (R$)">
            <input name="price" type="number" step="0.01" min="0"
              defaultValue={evento?.price_cents ? (evento.price_cents / 100).toFixed(2) : ''}
              className={INPUT} placeholder="0,00" />
          </Field>
        )}

        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setPublished(!published)}
            className={`w-10 h-6 rounded-full transition-colors ${published ? 'bg-green-600' : 'bg-stone-700'}`}>
            <span className={`block w-4 h-4 bg-white rounded-full mx-1 transition-transform ${published ? 'translate-x-4' : ''}`} />
          </button>
          <span className="text-stone-300 text-sm">
            {published ? 'Publicado (visível no app)' : 'Rascunho (oculto no app)'}
          </span>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={isPending}
            className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors">
            {isPending ? 'Salvando...' : submitLabel}
          </button>
          <button type="button" onClick={() => router.back()}
            className="text-stone-400 hover:text-white text-sm transition-colors px-4 py-2.5">
            Cancelar
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              disabled={isDeleting}
              className="ml-auto text-red-400 hover:text-red-300 disabled:opacity-50 text-sm transition-colors px-4 py-2.5"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir evento'}
            </button>
          )}
        </div>
      </form>
    </>
  );
}
