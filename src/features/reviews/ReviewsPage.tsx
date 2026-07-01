import { useModerateReview, useReviews } from '../../lib/queries';

export function ReviewsPage() {
  const { data, isLoading, isError, error } = useReviews();
  const moderate = useModerateReview();

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Avaliações</h1>

      {isLoading && <p className="text-text-muted">Carregando…</p>}
      {isError && <p className="text-danger">{(error as Error).message}</p>}

      {data && (
        <ul className="space-y-3">
          {data.map((r) => (
            <li
              key={r.id}
              className={`rounded-lg border p-3 ${r.isHidden ? 'border-border bg-card opacity-60' : 'border-border'}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-warning">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                <button
                  onClick={() => moderate.mutate({ id: r.id, isHidden: !r.isHidden })}
                  className="rounded border border-border px-2 py-1 text-xs"
                >
                  {r.isHidden ? 'Reexibir' : 'Ocultar'}
                </button>
              </div>
              {r.comment && <p className="mt-1 text-sm">{r.comment}</p>}
              <p className="mt-1 text-xs text-text-muted">
                por {r.authorName}
                {r.isHidden && ' · oculta'}
              </p>
            </li>
          ))}
          {data.length === 0 && <li className="text-text-muted">Nenhuma avaliação ainda.</li>}
        </ul>
      )}
    </div>
  );
}
