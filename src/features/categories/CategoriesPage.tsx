import { useState } from 'react';
import { useCategories, useCategoryMutation } from '../../lib/queries';
import { api } from '../../lib/api';
import type { Category } from '../../lib/types';

export function CategoriesPage() {
  const { data, isLoading, isError, error } = useCategories();

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Categorias</h1>

      <CategoryCreator />

      {isLoading && <p className="text-text-muted">Carregando…</p>}
      {isError && <p className="text-danger">{(error as Error).message}</p>}

      {data && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-card text-left text-text-muted">
              <tr>
                <th className="px-3 py-2">Ordem</th>
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2">Slug</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((c) => (
                <CategoryRow key={c.id} category={c} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CategoryRow({ category }: { category: Category }) {
  const toggle = useCategoryMutation((args: { id: string; isActive: boolean }) =>
    api.updateCategory(args.id, { isActive: args.isActive }),
  );
  return (
    <tr>
      <td className="px-3 py-2 text-text-muted">{category.sortOrder}</td>
      <td className="px-3 py-2 font-medium">{category.name}</td>
      <td className="px-3 py-2 text-text-muted">{category.slug}</td>
      <td className="px-3 py-2">
        <span
          className={`rounded px-2 py-0.5 text-xs text-white ${
            category.isActive ? 'bg-status-finished' : 'bg-status-canceled'
          }`}
        >
          {category.isActive ? 'Ativa' : 'Inativa'}
        </span>
      </td>
      <td className="px-3 py-2">
        <button
          onClick={() => toggle.mutate({ id: category.id, isActive: !category.isActive })}
          className="rounded border border-border px-2 py-1 text-xs"
        >
          {category.isActive ? 'Desativar' : 'Ativar'}
        </button>
      </td>
    </tr>
  );
}

function CategoryCreator() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState<string | null>(null);
  const create = useCategoryMutation((args: { slug: string; name: string }) =>
    api.createCategory(args),
  );

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await create.mutateAsync({ slug: slug.trim(), name: name.trim() });
      setName('');
      setSlug('');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h2 className="mb-2 font-medium">Nova categoria</h2>
      <form onSubmit={onCreate} className="flex flex-wrap gap-2">
        <input
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
          }}
          placeholder="Nome (ex.: Jardinagem)"
          className="flex-1 rounded-md border border-border bg-bg px-3 py-2"
        />
        <input
          required
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="slug"
          className="w-40 rounded-md border border-border bg-bg px-3 py-2"
        />
        <button
          type="submit"
          disabled={create.isPending}
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Criar
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
