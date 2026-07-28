import { EventoForm } from '@/components/EventoForm';
import { createEvento } from '../actions';

export default function NovoEventoPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-white text-2xl font-semibold">Novo evento</h1>
        <p className="text-stone-400 text-sm mt-1">Preencha os dados e publique quando estiver pronto</p>
      </div>
      <EventoForm action={createEvento} submitLabel="Criar evento" />
    </div>
  );
}
