import { useMemo, useState } from 'react';
import { useLegalDocs, useLegalMutation } from '../../lib/queries';
import { api } from '../../lib/api';
import type { AdminLegalDoc } from '../../lib/types';
import {
  PageHeader,
  Card,
  Button,
  Input,
  Badge,
  Spinner,
  ErrorState,
  InlineError,
} from '../../components/ui';

const AUDIENCE_LABEL: Record<string, string> = {
  ALL: 'Todos',
  CLIENT: 'Clientes',
  PROVIDER: 'Profissionais',
};

interface LegalForm {
  slug: string;
  version: string;
  title: string;
  audience: string;
  requiresAcceptance: boolean;
  summary: string;
  contentHtml: string;
}

interface EditorState {
  mode: 'create' | 'edit';
  id?: string;
  lockSlug: boolean;
  form: LegalForm;
}

const emptyForm = (): LegalForm => ({
  slug: '',
  version: new Date().toISOString().slice(0, 10),
  title: '',
  audience: 'ALL',
  requiresAcceptance: false,
  summary: '',
  contentHtml: '',
});

export function LegalPage() {
  const { data, isLoading, isError, error } = useLegalDocs();
  const [editor, setEditor] = useState<EditorState | null>(null);

  const groups = useMemo(() => {
    const map = new Map<string, AdminLegalDoc[]>();
    for (const d of data ?? []) {
      const arr = map.get(d.slug) ?? [];
      arr.push(d);
      map.set(d.slug, arr);
    }
    return [...map.entries()].map(([slug, versions]) => ({ slug, versions }));
  }, [data]);

  function startNewVersion(src: AdminLegalDoc) {
    setEditor({
      mode: 'create',
      lockSlug: true,
      form: {
        slug: src.slug,
        version: '',
        title: src.title,
        audience: src.audience,
        requiresAcceptance: src.requiresAcceptance,
        summary: src.summary ?? '',
        contentHtml: src.contentHtml,
      },
    });
  }

  function startEdit(doc: AdminLegalDoc) {
    setEditor({
      mode: 'edit',
      id: doc.id,
      lockSlug: true,
      form: {
        slug: doc.slug,
        version: doc.version,
        title: doc.title,
        audience: doc.audience,
        requiresAcceptance: doc.requiresAcceptance,
        summary: doc.summary ?? '',
        contentHtml: doc.contentHtml,
      },
    });
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Documentos legais"
        subtitle="Termos, políticas e conduta. Publicar com “exigir aceite” força o novo aceite dos usuários."
      />

      {!editor && (
        <Button onClick={() => setEditor({ mode: 'create', lockSlug: false, form: emptyForm() })}>
          Novo documento
        </Button>
      )}

      {editor && <LegalEditor state={editor} onClose={() => setEditor(null)} />}

      {isLoading && <Spinner />}
      {isError && <ErrorState message={(error as Error).message} />}

      {groups.map((g) => (
        <SlugGroup
          key={g.slug}
          slug={g.slug}
          versions={g.versions}
          onEdit={startEdit}
          onNewVersion={startNewVersion}
        />
      ))}
    </div>
  );
}

function SlugGroup({
  slug,
  versions,
  onEdit,
  onNewVersion,
}: {
  slug: string;
  versions: AdminLegalDoc[];
  onEdit: (d: AdminLegalDoc) => void;
  onNewVersion: (d: AdminLegalDoc) => void;
}) {
  const publish = useLegalMutation((id: string) => api.publishLegal(id));
  // "Vigente" = publicado mais recente (publishedAt desc). A lista já vem createdAt desc.
  const current =
    [...versions]
      .filter((v) => v.isPublished)
      .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))[0] ?? null;
  const title = versions[0]?.title ?? slug;

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold">{title}</p>
          <p className="text-xs text-text-muted">
            {slug} · {AUDIENCE_LABEL[versions[0]?.audience] ?? versions[0]?.audience}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => onNewVersion(current ?? versions[0])}>
          Nova versão
        </Button>
      </div>

      <div className="mt-3 divide-y divide-border border-t border-border">
        {versions.map((v) => (
          <div key={v.id} className="flex flex-wrap items-center gap-2 py-2.5">
            <span className="font-mono text-xs text-text-muted">v{v.version}</span>
            {v.isPublished ? (
              <Badge tone="success">{v.id === current?.id ? 'Vigente' : 'Publicado'}</Badge>
            ) : (
              <Badge tone="neutral">Rascunho</Badge>
            )}
            {v.requiresAcceptance && <Badge tone="warning">Exige aceite</Badge>}
            <span className="ml-auto flex gap-2">
              {!v.isPublished && (
                <>
                  <Button variant="secondary" size="sm" onClick={() => onEdit(v)}>
                    Editar
                  </Button>
                  <Button size="sm" loading={publish.isPending} onClick={() => publish.mutate(v.id)}>
                    Publicar
                  </Button>
                </>
              )}
            </span>
          </div>
        ))}
      </div>
      <InlineError message={publish.isError ? (publish.error as Error).message : null} />
    </Card>
  );
}

function LegalEditor({ state, onClose }: { state: EditorState; onClose: () => void }) {
  const [form, setForm] = useState<LegalForm>(state.form);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof LegalForm>(k: K) => (v: LegalForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  const save = useLegalMutation((f: LegalForm) =>
    state.mode === 'edit' && state.id
      ? api.updateLegal(state.id, {
          title: f.title,
          audience: f.audience,
          contentHtml: f.contentHtml,
          summary: f.summary,
          requiresAcceptance: f.requiresAcceptance,
          version: f.version,
        })
      : api.createLegal({
          slug: f.slug.trim(),
          version: f.version.trim(),
          title: f.title.trim(),
          audience: f.audience,
          contentHtml: f.contentHtml,
          summary: f.summary || undefined,
          requiresAcceptance: f.requiresAcceptance,
        }),
  );

  async function onSave() {
    setError(null);
    if (!form.slug.trim() || !form.version.trim() || !form.title.trim() || !form.contentHtml.trim()) {
      setError('Preencha slug, versão, título e conteúdo.');
      return;
    }
    try {
      await save.mutateAsync(form);
      onClose();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <Card className="space-y-4 border-primary/40 p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">
          {state.mode === 'edit' ? 'Editar rascunho' : 'Novo documento / versão'}
        </h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Fechar
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-xs text-text-muted">Slug</span>
          <Input
            value={form.slug}
            disabled={state.lockSlug}
            onChange={(e) => set('slug')(e.target.value)}
            placeholder="terms, privacy, conduct, refund, provider-terms…"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs text-text-muted">Versão</span>
          <Input value={form.version} onChange={(e) => set('version')(e.target.value)} placeholder="2026-08-01" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs text-text-muted">Título</span>
          <Input value={form.title} onChange={(e) => set('title')(e.target.value)} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs text-text-muted">Público</span>
          <select
            value={form.audience}
            onChange={(e) => set('audience')(e.target.value)}
            className="w-full rounded-medium border border-border bg-card px-3 py-2 text-sm"
          >
            <option value="ALL">Todos</option>
            <option value="CLIENT">Clientes</option>
            <option value="PROVIDER">Profissionais</option>
          </select>
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.requiresAcceptance}
          onChange={(e) => set('requiresAcceptance')(e.target.checked)}
          className="h-4 w-4"
        />
        Exigir aceite (ao publicar, força novo aceite de quem ainda não aceitou esta versão)
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-xs text-text-muted">Resumo / introdução (opcional)</span>
        <textarea
          value={form.summary}
          onChange={(e) => set('summary')(e.target.value)}
          rows={2}
          className="w-full rounded-medium border border-border bg-card px-3 py-2 text-sm"
        />
      </label>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs text-text-muted">Conteúdo (HTML)</span>
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            className="text-xs text-primary hover:underline"
          >
            {preview ? 'Editar HTML' : 'Pré-visualizar'}
          </button>
        </div>
        {preview ? (
          <div
            className="prose-legal max-h-[420px] overflow-auto rounded-medium border border-border bg-card p-4 text-sm"
            // Conteúdo confiável (escrito pelo admin) — renderizado como HTML.
            dangerouslySetInnerHTML={{ __html: form.contentHtml }}
          />
        ) : (
          <textarea
            value={form.contentHtml}
            onChange={(e) => set('contentHtml')(e.target.value)}
            rows={16}
            className="w-full rounded-medium border border-border bg-card px-3 py-2 font-mono text-xs"
            placeholder="<h2>1. Título</h2>\n<p>Parágrafo…</p>"
          />
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={() => void onSave()} loading={save.isPending}>
          {state.mode === 'edit' ? 'Salvar rascunho' : 'Criar rascunho'}
        </Button>
        <span className="text-xs text-text-muted">Rascunhos não afetam o público até serem publicados.</span>
      </div>
      <InlineError message={error} />
    </Card>
  );
}
