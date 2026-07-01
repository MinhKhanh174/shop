import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { blogArticles, buildBlogArticlePath } from '../../utils/blogArticles'
import { buildArticleThumb } from '../../utils/articleThumb'
import './NewsPage.css'

function ArticleCard({ article, compact = false }) {
  const thumb = article.thumb ?? buildArticleThumb(article.title, ['#d8d8d8', '#f4f6f8'])

  return (
    <article className={`news-card${compact ? ' news-card--compact' : ''}`}>
      <Link to={buildBlogArticlePath(article)} className="news-card__thumb">
        <img src={thumb} alt={article.title} loading="lazy" />
      </Link>

      <div className="news-card__body">
        <h3>
          <Link to={buildBlogArticlePath(article)}>{article.title}</Link>
        </h3>
        <time>{article.date}</time>
        {!compact ? <p>{article.summary}</p> : null}
        <Link className="news-card__read" to={buildBlogArticlePath(article)}>
          Đọc tiếp
        </Link>
      </div>
    </article>
  )
}

function Sidebar({ title, articles = [] }) {
  return (
    <aside className="news-sidebar">
      <h2>{title}</h2>
      <div className="news-sidebar__list">
        {articles.map((article) => (
          <Link key={article.id} to={buildBlogArticlePath(article)} className="news-sidebar__item">
            <img src={article.thumb} alt={article.title} loading="lazy" />
            <span>{article.title}</span>
          </Link>
        ))}
      </div>
    </aside>
  )
}

export function ArticleListingPage({ title, category, sidebarTitle, sidebarCategory, crumbLabel }) {
  const filtered = blogArticles.filter((article) => article.category === category)
  const gridArticles = filtered.slice(0, 8)
  const featuredArticles = blogArticles.filter((article) => article.category === sidebarCategory).slice(0, 5)

  return (
    <div className="news-page">
      <div className="news-page__container">
        <nav className="news-breadcrumb" aria-label="Breadcrumb">
          <Link to={ROUTES.HOME}>Trang chủ</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <span>{crumbLabel}</span>
        </nav>

        <div className="news-page__layout">
          <section className="news-page__main">
            <h1>{title}</h1>
            <div className="news-grid">
              {gridArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>

          <Sidebar title={sidebarTitle} articles={featuredArticles} />
        </div>
      </div>
    </div>
  )
}
