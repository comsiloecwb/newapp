import { BackButton } from '@/components/BackButton';
import { createCelula } from '../actions';

export default function NovaCelulaPage() {
  return (
    <div className="p-8 max-w-xl">
      <BackButton href="/celulas" label="Voltar para Células" />
      <div className="mb-8 mt-4">
        <h1 className="text-white text-2xl font-semibold">Nova célula</h1>
        <p className="text-stone-400 text-sm mt-1">Preencha as informações do grupo</p>
      </div>
      <form action={createCelula} className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-stone-400 text-xs font-medium uppercase tracking-wide">Nome *</label>
          <input
            name="nome" required autoFocus
            className="w-full bg-stone-900 border border-stone-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            placeholder="Ex: Célula Centro, Jovens Sul..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-stone-400 text-xs font-medium uppercase tracking-wide">Dia da semana</label>
            <select
              name="dia_semana"
              className="w-full bg-stone-900 border border-stone-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            >
              <option value="">Selecionar</option>
              <option value="segunda">Segunda</option>
              <option value="terca">Terça</option>
              <option value="quarta">Quarta</option>
              <option value="quinta">Quinta</option>
              <option value="sexta">Sexta</option>
              <option value="sabado">Sábado</option>
              <option value="domingo">Domingo</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-stone-400 text-xs font-medium uppercase tracking-wide">Horário</label>
            <input
              name="horario"
              className="w-full bg-stone-900 border border-stone-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="Ex: 19h30"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-stone-400 text-xs font-medium uppercase tracking-wide">Bairro</label>
          <input
            name="bairro"
            className="w-full bg-stone-900 border border-stone-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            placeholder="Ex: Centro, Jardins..."
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-stone-400 text-xs font-medium uppercase tracking-wide">Endereço completo</label>
          <input
            name="endereco_completo"
            className="w-full bg-stone-900 border border-stone-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            placeholder="Rua, número, complemento..."
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-stone-400 text-xs font-medium uppercase tracking-wide">Telefone de contato</label>
          <input
            name="contato_telefone"
            className="w-full bg-stone-900 border border-stone-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            placeholder="(11) 99999-9999"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-sm px-4 py-3 rounded-lg transition-colors"
        >
          Criar célula
        </button>
      </form>
    </div>
  );
}
