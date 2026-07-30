import { PalavraForm } from '@/components/PalavraForm';
import { BackButton } from '@/components/BackButton';
import { createPalavra } from '../actions';

export default function NovaPalavraPage() {
  return (
    <div className="p-8">
      <BackButton href="/palavras" label="Voltar para Palavras" />
      <div className="mb-8">
        <h1 className="text-white text-2xl font-semibold">Nova palavra</h1>
        <p className="text-stone-400 text-sm mt-1">Adicione um sermão ou mensagem da semana</p>
      </div>
      <PalavraForm action={createPalavra} submitLabel="Criar palavra" />
    </div>
  );
}
