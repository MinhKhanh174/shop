import { CategoryStrip } from '../../../components/layout/CategoryStrip'

export function ShortcutSection({ categoryItems = [] }) {
  return (
    <section className="section section--tight" aria-label="Nổi bật danh mục">
      <CategoryStrip categoryItems={categoryItems} />
    </section>
  )
}
