import { useState } from 'react';
import { useCategories, useCategoryMutation } from '../../lib/queries';
import { api } from '../../lib/api';
import type { Category } from '../../lib/types';
import { CategoryIcon, ICON_OPTIONS } from '../../lib/categoryIcons';

export function CategoriesPage() {
  const { data, isLoading, isError, error } = useCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Categorias</h1>
        <p className="text-sm text-text-muted">Serviços disponíveis e seus ícones.</p>
      </div>

      <CategoryCreator />

      {isLoading && <p className="text-text-muted">Carregando…</p>}
      {isError && <p className="text-danger">{(error as Error).message}</p>}

      {data && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Grade de ícones selecionáveis. */
function IconPicker({ value, onSelect }: { value: string | null; onSelect: (key: string) => void }) {
  return (
    <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-10">
      {ICON_OPTIONS.map(({ key, Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onSelect(key)}
          title={key}
          className={`flex aspect-square items-center justify-center rounded-medium border transition-colors ${
            value === key
              ? 'border-primary bg-primary/15 text-primary'
              : 'border-border text-text-muted hover:bg-card-2 hover:text-foreground'
          }`}
        >
          <Icon size={18} />
        </button>
      ))}
    </div>
  );
}

function CategoryCard({ category }: { category: Category }) {
  const [editing, setEditing] = useState(false);
  const toggle = useCategoryMutation((args: { id: string; isActive: boolean }) =>
    api.updateCategory(args.id, { isActive: args.isActive }),
  );
  const setIcon = useCategoryMutation((args: { id: string; iconKey: string }) =>
    api.updateCategory(args.id, { iconKey: args.iconKey }),
  );

  return (
    <div className="rounded-large border border-border bg-card p-4 shadow-card">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setEditing((v) => !v)}
          title="Trocar ícone"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-medium bg-primary/15 text-primary hover:bg-primary/25"
        >
          <CategoryIcon iconKey={category.iconKey} size={22} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{category.name}</p>
          <p className="truncate text-xs text-text-muted">{category.slug}</p>
        </div>
        <span
          className={`rounded px-2 py-0.5 text-xs text-white ${
            category.isActive ? 'bg-status-finished' : 'bg-status-canceled'
          }`}
        >
          {category.isActive ? 'Ativa' : 'Inativa'}
        </span>
      </div>

      {editing && (
        <div className="mt-3 border-t border-border pt-3">
          <p className="mb-2 text-xs font-medium text-text-muted">Escolha um ícone</p>
          <IconPicker
            value={category.iconKey}
            onSelect={(key) => {
              setIcon.mutate({ id: category.id, iconKey: key });
              setEditing(false);
            }}
          />
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-text-muted">Ordem {category.sortOrder}</span>
        <button
          onClick={() => toggle.mutate({ id: category.id, isActive: !category.isActive })}
          className="rounded-medium border border-border px-2.5 py-1 text-xs hover:bg-card-2"
        >
          {category.isActive ? 'Desativar' : 'Ativar'}
        </button>
      </div>
    </div>
  );
}

function CategoryCreator() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [iconKey, setIconKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const create = useCategoryMutation((args: { slug: string; name: string; iconKey?: string }) =>
    api.createCategory(args),
  );

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await create.mutateAsync({ slug: slug.trim(), name: name.trim(), iconKey: iconKey ?? undefined });
      setName('');
      setSlug('');
      setIconKey(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="rounded-large border border-border bg-card p-4 shadow-card">
      <h2 className="mb-3 font-semibold">Nova categoria</h2>
      <form onSubmit={onCreate} className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <input
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slug)
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
            }}
            placeholder="Nome (ex.: Jardinagem)"
            className="flex-1 rounded-medium border border-border bg-bg px-3 py-2"
          />
          <input
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="slug"
            className="w-40 rounded-medium border border-border bg-bg px-3 py-2"
          />
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-text-muted">Ícone</p>
          <IconPicker value={iconKey} onSelect={setIconKey} />
        </div>
        <button
          type="submit"
          disabled={create.isPending}
          className="rounded-medium bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {create.isPending ? 'Criando…' : 'Criar categoria'}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
