'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmModal } from '@/components/ConfirmModal';
import { showToast } from '@/components/Toast';

interface Membro {
  id: string;
  nome: string;
  email: string;
  role: string;
  is_lider: boolean;
  created_at: string;
}

const INPUT = 'w-full bg-stone-900 border border-stone-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors';
const LABEL = 'block text-stone-400 text-xs font-medium mb-1.5 uppercase tracking-wide';

export function MembroEditForm({ membro, currentUserRole }: { membro: Membro; currentUserRole: string }) {
  const router = useRouter();
  const [nome, setNome] = useState(membro.nome);
  const [role, setRole] = useState(membro.role);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isSuperadmin = membro.role === 'superadmin';

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/membros/${membro.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, role }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        showToast('erro');
        console.error(error);
        return;
      }
      showToast('atualizado');
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setShowDeleteModal(false);
    setDeleting(true);
    try {
      await fetch(`/api/membros/${membro.id}`, { method: 'DELETE' });
      showToast('excluido');
      router.push('/membros');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <ConfirmModal
        open={showDeleteModal}
        title="Excluir usuário"
        message={`Tem certeza que deseja excluir "${membro.nome}"? O acesso ao app será removido permanentemente.`}
        confirmLabel="Sim, excluir"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      <div className="space-y-5">
        <div className="bg-stone-800/40 border border-stone-700 rounded-xl p-6 space-y-5">
          <div>
            <label className={LABEL}>Nome</label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={isSuperadmin}
              className={INPUT}
            />
          </div>

          <div>
            <label className={LABEL}>E-mail</label>
            <input value={membro.email} disabled className={`${INPUT} opacity-50 cursor-not-allowed`} />
            <p className="text-stone-600 text-xs mt-1">O e-mail não pode ser alterado</p>
          </div>

          <div>
            <label className={LABEL}>Papel</label>
            {isSuperadmin ? (
              <input value="Superadmin" disabled className={`${INPUT} opacity-50 cursor-not-allowed`} />
            ) : (
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={INPUT}
              >
                <option value="visitor">Visitante</option>
                <option value="member">Membro</option>
                {currentUserRole === 'superadmin' && <option value="admin">Admin</option>}
              </select>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-stone-500 text-xs">
              Membro desde {new Date(membro.created_at).toLocaleDateString('pt-BR')}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.back()}
                className="px-4 py-2.5 rounded-lg border border-stone-700 text-stone-400 hover:text-white text-sm transition-colors"
              >
                Cancelar
              </button>
              {!isSuperadmin && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-stone-950 font-semibold rounded-lg px-5 py-2.5 text-sm transition-colors"
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              )}
            </div>
          </div>
        </div>

        {!isSuperadmin && (
          <div className="bg-red-950/20 border border-red-900/40 rounded-xl p-6">
            <h3 className="text-white font-medium text-sm mb-1">Zona de risco</h3>
            <p className="text-stone-400 text-xs mb-4">
              Excluir o usuário remove o acesso ao app permanentemente. Esta ação não pode ser desfeita.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={deleting}
              className="text-red-400 hover:text-red-300 border border-red-900/60 hover:border-red-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {deleting ? 'Excluindo...' : 'Excluir usuário'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
