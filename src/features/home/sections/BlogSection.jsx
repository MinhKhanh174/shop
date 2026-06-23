import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { articles } from '../../../data/siteConfig'
import { buildArticleThumb } from '../../../utils/articleThumb'
import { buildBlogArticlePath } from '../../../utils/blogArticles'

const columnConfigs = [
  {
    title: '24H CÔNG NGHỆ',
    category: '24H CÔNG NGHỆ',
    moreRoute: ROUTES.BLOG_NEWS,
    tones: [
      ['#c08a43', '#f7d9a0'],
      ['#a7d8d9', '#e8fbfb'],
      ['#e1c38d', '#f7e8c8'],
      ['#cdb39c', '#f0e2d6'],
    ],
  },
  {
    title: 'KINH NGHIỆM HAY - MẸO VẶT',
    category: 'KINH NGHIỆM HAY - MẸO VẶT',
    moreRoute: ROUTES.BLOG_TIPS,
    tones: [
      ['#d8d8d8', '#f4f6f8'],
      ['#1a1a1a', '#5d5d5d'],
      ['#444444', '#a3a3a3'],
      ['#c58a43', '#f1cf9a'],
    ],
  },
]

function buildRows(category, tones) {
  return articles
    .filter((article) => article.category === category)
    .slice(0, 4)
    .map((article, index) => ({
      ...article,
      thumb: buildArticleThumb(article.title, tones[index % tones.length]),
    }))
}

export function BlogSection() {
  const columns = columnConfigs.map((config) => ({
    ...config,
    rows: buildRows(config.category, config.tones),
  }))

  return (
    <section className="section section--articles">
      <div className="article-columns">
        {columns.map((column) => (
          <article key={column.title} className="article-column">
            <h2 className="article-column__title">{column.title}</h2>

            <div className="article-list">
              {column.rows.map((article) => (
                <Link
                  key={article.id}
                  to={buildBlogArticlePath(article)}
                  className="article-row"
                >
                  <div className="article-row__thumb">
                    <img src={article.thumb} alt={article.title} loading="lazy" />
                  </div>

                  <div className="article-row__body">
                    <h3>{article.title}</h3>
                    <time>{article.date}</time>
                    <p>{article.summary}</p>
                  </div>
                </Link>
              ))}
            </div>

            <Link to={column.moreRoute} className="article-more article-more--block">
              Xem tất cả
              <ChevronRight size={16} />
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
