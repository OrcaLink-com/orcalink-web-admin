import { LuStar } from 'react-icons/lu';
import { useModerateReview, useReviews } from '../../lib/queries';
import { PageHeader, Card, Button, Badge, Spinner, ErrorState, EmptyState } from '../../components/ui';

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-warning">
      {Array.from({ length: 5 }).map((_, i) => (
        <LuStar key={i} size={15} className={i < rating ? 'fill-current' : 'text-border'} />
      ))}
    </span>
  );
}

export function ReviewsPage() {
  const { data, isLoading, isError, error } = useReviews();
  const moderate = useModerateReview();

  return (
    <div className="space-y-5">
      <PageHeader title="Avaliações" subtitle="Modere avaliações impróprias sem apagar o histórico." />

      {isLoading && <Spinner />}
      {isError && <ErrorState message={(error as Error).message} />}

      {data && (
        <div className="space-y-3">
          {data.map((r) => (
            <Card key={r.id} className={`p-4 ${r.isHidden ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Stars rating={r.rating} />
                  {r.isHidden && <Badge tone="danger">Oculta</Badge>}
                </div>
                <Button variant="secondary" size="sm" onClick={() => moderate.mutate({ id: r.id, isHidden: !r.isHidden })}>
                  {r.isHidden ? 'Reexibir' : 'Ocultar'}
                </Button>
              </div>
              {r.comment && <p className="mt-2 text-sm">{r.comment}</p>}
              <p className="mt-1 text-xs text-text-muted">por {r.authorName}</p>
            </Card>
          ))}
          {data.length === 0 && <EmptyState icon={<LuStar size={26} />} title="Nenhuma avaliação ainda" />}
        </div>
      )}
    </div>
  );
}
