import { useState } from 'react';
import { useCategories, useCategoryMutation } from '../../lib/queries';
import { api } from '../../lib/api';
import type { Category } from '../../lib/types';
import { CategoryIcon, ICON_OPTIONS } from '../../lib/categoryIcons';
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

export function CategoriesPage() {
  const { data, isLoading, isError, error } = useCategories();

  return (
    <div className="space-y-6">
      <PageHeader title="Categorias" subtitle="Serviços disponíveis e seus ícones." />

      <CategoryCreator />

      {isLoading && <Spinner />}
      {isError && <ErrorState message={(error as Error).message} />}

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
    <Card className="p-4">
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
        <Badge tone={category.isActive ? 'success' : 'neutral'}>{category.isActive ? 'Ativa' : 'Inativa'}</Badge>
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
        <Button variant="secondary" size="sm" onClick={() => toggle.mutate({ id: category.id, isActive: !category.isActive })}>
          {category.isActive ? 'Desativar' : 'Ativar'}
        </Button>
      </div>
    </Card>
  );
}

function CategoryCreator() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [iconKey, setIconKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const create = useCategoryMutation((args: { slug: string; name: string; iconKey?: string }) => api.createCategory(args));

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
    <Card className="p-4">
      <h2 className="mb-3 font-semibold">Nova categoria</h2>
      <form onSubmit={onCreate} className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Input
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
            }}
            placeholder="Nome (ex.: Jardinagem)"
            className="min-w-56 flex-1"
          />
          <Input required value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug" className="w-40" />
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-text-muted">Ícone</p>
          <IconPicker value={iconKey} onSelect={setIconKey} />
        </div>
        <Button type="submit" loading={create.isPending}>
          Criar categoria
        </Button>
      </form>
      <InlineError message={error} />
    </Card>
  );
}
