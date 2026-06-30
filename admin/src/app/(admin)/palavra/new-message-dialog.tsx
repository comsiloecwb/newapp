'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

export function NewMessageDialog({ churchId }: { churchId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', preached_at: '', published: false });

  function set(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from('weekly_messages').insert({
      church_id: churchId,
      title: form.title,
      content: form.content,
      preached_at: form.preached_at || new Date().toISOString().split('T')[0],
      published: form.published,
    });
    setLoading(false);
    if (!error) {
      setOpen(false);
      setForm({ title: '', content: '', preached_at: '', published: false });
      router.refresh();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center gap-2 rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800">
        <Plus size={16} /> Nova mensagem
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Nova mensagem</DialogTitle></DialogHeader>
        <form action={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label>Título *</Label>
            <Input value={form.title} onChange={(e) => set('title', e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label>Conteúdo *</Label>
            <Textarea value={form.content} onChange={(e) => set('content', e.target.value)} rows={6} required />
          </div>
          <div className="space-y-1">
            <Label>Data do culto</Label>
            <Input type="date" value={form.preached_at} onChange={(e) => set('preached_at', e.target.value)} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.published} onChange={(e) => set('published', e.target.checked)} className="rounded" />
            <span className="text-sm">Publicar agora</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Publicar'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
