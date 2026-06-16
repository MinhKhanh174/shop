import { articles } from '../data/siteConfig'
import { BLOG_ARTICLE_DETAILS } from '../data/blogArticleDetails'
import { ROUTES } from '../config/routes'
import { buildArticleThumb } from './articleThumb'

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function enrichArticle(article) {
  const detail = BLOG_ARTICLE_DETAILS[article.id] ?? article.detail ?? {}
  const coverTone = detail.coverTone ?? ['#cbd5e1', '#e2e8f0']

  return {
    ...article,
    ...detail,
    thumb: buildArticleThumb(article.title, coverTone),
  }
}

export const blogArticles = articles.map(enrichArticle)

export function getBlogArticleById(articleId) {
  const normalized = normalizeText(articleId)

  return (
    blogArticles.find((article) => normalizeText(article.id) === normalized || normalizeText(article.slug) === normalized) ??
    null
  )
}

export function getRelatedBlogArticleForProduct(product) {
  if (!product) {
    return blogArticles[0] ?? null
  }

  const productText = normalizeText(
    [product.name, product.brand, product.description, product.source?.category, product.source?.title, product.id]
      .filter(Boolean)
      .join(' '),
  )

  const bestMatch = blogArticles
    .map((article) => {
      const keywords = article.keywords ?? []
      const score = keywords.reduce((total, keyword) => (productText.includes(normalizeText(keyword)) ? total + 3 : total), 0)

      return { article, score }
    })
    .sort((left, right) => right.score - left.score)[0]

  return bestMatch?.score > 0 ? bestMatch.article : blogArticles[0] ?? null
}

export function buildBlogArticlePath(article) {
  const articleId = typeof article === 'string' ? article : article?.id
  return ROUTES.BLOG_DETAIL.replace(':articleId', articleId ?? '')
}
