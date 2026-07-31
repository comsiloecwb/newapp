import { BackButton } from '@/components/BackButton';
import { createGrupo } from '../actions';

export default function NovoGrupoPage() {
  return (
    <div className="p-8 max-w-xl">
      <BackButton href="/grupos" label="Voltar para Grupos" />
      <div className="mb-8 mt-4">
        <h1 className="text-white text-2xl font-semibold">Novo grupo</h1>
        <p className="text-stone-400 text-sm mt-1">Crie um grupo e adicione membros depois</p>
      </div>
      <form action={createGrupo} className="space-y-6">
        <div className="space-y-1.5">
          <label className="block text-stone-400 text-xs font-medium uppercase tracking-wide">
            Nome do grupo *
          </label>
          <input
            name="nome"
            required
            autoFocus
            className="w-full bg-stone-900 border border-stone-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            placeholder="Ex: Jovens, Casais, Louvor..."
          />
        </div>
        <button
          type="submit"
          className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-sm px-4 py-3 rounded-lg transition-colors"
        >
          Criar grupo
        </button>
      </form>
    </div>
  );
}
