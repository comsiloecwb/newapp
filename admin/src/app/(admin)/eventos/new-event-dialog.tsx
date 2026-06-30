'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

export function NewEventDialog({ churchId }: { churchId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', location: '',
    start_at: '', end_at: '',
    is_paid: false, price_cents: '',
    capacity: '', published: false,
  });

  function set(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.from('events').insert({
      church_id: churchId,
      title: form.title,
      description: form.description,
      location: form.location,
      start_at: new Date(form.start_at).toISOString(),
      end_at: form.end_at ? new Date(form.end_at).toISOString() : new Date(form.start_at).toISOString(),
      is_paid: form.is_paid,
      price_cents: form.is_paid && form.price_cents ? Math.round(parseFloat(form.price_cents) * 100) : null,
      capacity: form.capacity ? parseInt(form.capacity) : null,
      published: form.published,
    });

    setLoading(false);
    if (!error) {
      setOpen(false);
      setForm({ title: '', description: '', location: '', start_at: '', end_at: '', is_paid: false, price_cents: '', capacity: '', published: false });
      router.refresh();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center gap-2 rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800">
        <Plus size={16} /> Novo evento
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo evento</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label>Título *</Label>
            <Input value={form.title} onChange={(e) => set('title', e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label>Descrição</Label>
            <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Início *</Label>
              <Input type="datetime-local" value={form.start_at} onChange={(e) => set('start_at', e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label>Fim</Label>
              <Input type="datetime-local" value={form.end_at} onChange={(e) => set('end_at', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Local</Label>
              <Input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Templo Principal" />
            </div>
            <div className="space-y-1">
              <Label>Capacidade</Label>
              <Input type="number" value={form.capacity} onChange={(e) => set('capacity', e.target.value)} placeholder="Ilimitada" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_paid} onChange={(e) => set('is_paid', e.target.checked)} className="rounded" />
              <span className="text-sm">Evento pago</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.published} onChange={(e) => set('published', e.target.checked)} className="rounded" />
              <span className="text-sm">Publicar agora</span>
            </label>
          </div>
          {form.is_paid && (
            <div className="space-y-1">
              <Label>Valor (R$)</Label>
              <Input type="number" step="0.01" value={form.price_cents} onChange={(e) => set('price_cents', e.target.value)} placeholder="0,00" />
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Criar evento'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
