import { useMemo } from 'react'
import { ChevronRight } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ROUTES } from '../../config/routes'
import { useHomeData } from '../../hooks/useHomeData'
import { mapProductsToCards } from '../../utils/productMapper'
import { blogArticles, buildBlogArticlePath, getBlogArticleBySlug } from '../../utils/blogArticles'
import { ProductRail } from '../../shared/ui/ProductRail'
import './BlogDetailPage.css'

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function buildArticleRelatedProducts(remoteProducts, article) {
  const mappedProducts = mapProductsToCards(Array.isArray(remoteProducts) ? remoteProducts : [], { label: 'Trả góp 0%' })
  const keywords = Array.isArray(article?.keywords) ? article.keywords.map(normalizeText) : []

  if (!mappedProducts.length) return []

  const ranked = mappedProducts
    .map((product) => {
      const text = normalizeText([product.name, product.brand, product.category, product.perk].filter(Boolean).join(' '))
      const score = keywords.reduce((total, keyword) => (keyword && text.includes(keyword) ? total + 1 : total), 0)
      return { product, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)

  return (ranked.length ? ranked : mappedProducts.map((product) => ({ product, score: 0 }))).map(({ product }) => product)
}

function BlogBreadcrumb({ article }) {
  const categoryRoute = article.category === 'KINH NGHIỆM HAY - MẸO VẶT' ? ROUTES.BLOG_TIPS : ROUTES.BLOG_NEWS

  return (
    <nav className="blog-detail__breadcrumb" aria-label="Breadcrumb">
      <Link to={ROUTES.HOME}>Trang chủ</Link>
      <ChevronRight size={14} aria-hidden="true" />
      <Link to={categoryRoute}>{article.category}</Link>
      <ChevronRight size={14} aria-hidden="true" />
      <span>{article.title}</span>
    </nav>
  )
}

function RelatedArticles({ article }) {
  const relatedArticles = blogArticles.filter((item) => item.id !== article.id && item.category === article.category).slice(0, 5)

  return (
    <aside className="blog-detail__sidebar">
      <h2>TIN TỨC LIÊN QUAN</h2>
      <div className="blog-detail__related-list">
        {relatedArticles.map((item) => (
          <Link key={item.id} to={buildBlogArticlePath(item)} className="blog-detail__related-item">
            <img src={item.thumb} alt={item.title} loading="lazy" />
            <span>{item.title}</span>
          </Link>
        ))}
      </div>
    </aside>
  )
}

function RelatedProducts({ article }) {
  const { products: remoteProducts = [] } = useHomeData()
  const relatedProducts = useMemo(() => buildArticleRelatedProducts(remoteProducts, article).slice(0, 9), [remoteProducts, article])

  if (!relatedProducts.length) return null

  return (
    <ProductRail title="SẢN PHẨM LIÊN QUAN" products={relatedProducts} className="blog-detail__related-products" />
  )
}

export default function BlogDetailPage() {
  const { articleSlug } = useParams()
  const article = getBlogArticleBySlug(articleSlug)

  if (!article) {
    return (
      <div className="blog-detail">
        <div className="blog-detail__container">
          <div className="blog-detail__empty">
            <h1>Không tìm thấy bài viết</h1>
            <p>Bài viết này có thể đã bị xóa hoặc đường dẫn không còn hợp lệ.</p>
            <Link to={ROUTES.HOME} className="blog-detail__back">
              Quay về trang chủ
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="blog-detail">
      <div className="blog-detail__container">
        <BlogBreadcrumb article={article} />

        <div className="blog-detail__layout">
          <article className="blog-detail__main">
            <div className="blog-detail__hero">
              <img src={article.thumb} alt={article.title} loading="lazy" />
            </div>

            <header className="blog-detail__header">
              <h1>{article.title}</h1>
              <div className="blog-detail__meta">
                <span>Support EGANY</span>
                <time>{article.date}</time>
              </div>
            </header>

            <section className="blog-detail__intro">
              <h2>Nội dung bài viết</h2>
              <p>{article.summary}</p>
            </section>

            <div className="blog-detail__content">
              {article.sections?.map((section) => (
                <section key={section.heading} className="blog-detail__section">
                  <h3>{section.heading}</h3>
                  {section.paragraphs?.map((paragraph, index) => (
                    <p key={`${section.heading}-${index}`}>{paragraph}</p>
                  ))}
                </section>
              ))}
            </div>

            <RelatedProducts article={article} />

            <section className="blog-detail__comments">
              <h2>BÌNH LUẬN, HỎI ĐÁP</h2>
            </section>
          </article>

          <RelatedArticles article={article} />
        </div>
      </div>
    </div>
  )
}
