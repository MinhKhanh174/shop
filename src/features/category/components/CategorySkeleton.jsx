export function CategorySkeleton() {
  return (
    <div className="category-page__skeleton" aria-hidden="true">
      <div className="category-page__skeleton-banner" />
      <div className="category-page__skeleton-layout">
        <div className="category-page__skeleton-sidebar">
          <div className="category-page__skeleton-line category-page__skeleton-line--lg" />
          <div className="category-page__skeleton-block" />
          <div className="category-page__skeleton-block" />
          <div className="category-page__skeleton-block" />
        </div>
        <div className="category-page__skeleton-content">
          <div className="category-page__skeleton-line" />
          <div className="category-page__skeleton-grid">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="category-page__skeleton-card">
                <div className="category-page__skeleton-card-media" />
                <div className="category-page__skeleton-card-body">
                  <div className="category-page__skeleton-line" />
                  <div className="category-page__skeleton-line category-page__skeleton-line--sm" />
                  <div className="category-page__skeleton-line category-page__skeleton-line--xs" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
