import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { buildSearchPath } from '../../constants/routes'
import { useProductSearchResults } from '../../features/product/hooks/useProductSearchResults'
import { getProductDetailPath } from '../../utils/productRoutes'

const searchHints = [
  'Nhập tên sản phẩm..',
  'Bạn cần tìm gì..',
  'Tìm kiếm điện thoại..',
  'Tìm kiếm laptop..',
  'Tìm kiếm phụ kiện..',
]

export function SearchBar() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [placeholderText, setPlaceholderText] = useState('')
  const [messageIndex, setMessageIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [debouncedTerm, setDebouncedTerm] = useState('')
  const { searchResults, loading } = useProductSearchResults(debouncedTerm)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedTerm(searchTerm.trim())
    }, 180)

    return () => window.clearTimeout(timeout)
  }, [searchTerm])

  useEffect(() => {
    if (isFocused || searchTerm) return undefined

    const currentMessage = searchHints[messageIndex]
    const typingSpeed = isDeleting ? 50 : 100

    const timeout = window.setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentMessage.length) {
          setPlaceholderText(currentMessage.substring(0, charIndex + 1))
          setCharIndex(charIndex + 1)
        } else {
          window.setTimeout(() => setIsDeleting(true), 1500)
        }
      } else if (charIndex > 0) {
        setPlaceholderText(currentMessage.substring(0, charIndex - 1))
        setCharIndex(charIndex - 1)
      } else {
        setIsDeleting(false)
        setMessageIndex((prev) => (prev + 1) % searchHints.length)
      }
    }, typingSpeed)

    return () => window.clearTimeout(timeout)
  }, [isFocused, searchTerm, messageIndex, charIndex, isDeleting])

  const suggestionItems = useMemo(() => searchResults.slice(0, 6), [searchResults])

  const handleSearch = (event) => {
    event.preventDefault()

    const query = searchTerm.trim()
    if (!query) {
      toast('Nhập từ khóa để tìm kiếm', { icon: '🔎' })
      return
    }

    navigate(buildSearchPath(query))
  }

  return (
    <div className="searchbar-wrap">
      <form className="searchbar" onSubmit={handleSearch}>
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            window.setTimeout(() => setIsFocused(false), 120)
          }}
          placeholder={isFocused || searchTerm ? '' : placeholderText}
          aria-label="Tìm sản phẩm"
        />
        <button type="submit" aria-label="Tìm kiếm">
          <Search size={18} className="searchbar__button-icon" />
        </button>
      </form>

      {isFocused && debouncedTerm ? (
        <div className="searchbar__suggestions" role="listbox" aria-label={`Kết quả tìm kiếm cho ${debouncedTerm}`}>
          <div className="searchbar__suggestions-header">
            <strong>Kết quả tìm kiếm cho {debouncedTerm}</strong>
            <Link to={buildSearchPath(debouncedTerm)}>Xem tất cả</Link>
          </div>

          {loading ? (
            <div className="searchbar__suggestions-empty">Đang tải...</div>
          ) : suggestionItems.length > 0 ? (
            <div className="searchbar__suggestions-list">
              {suggestionItems.map((product) => (
                <Link
                  key={product.id}
                  to={getProductDetailPath(product)}
                  className="searchbar__suggestion"
                  onMouseDown={(event) => event.preventDefault()}
                >
                  <img src={product.image} alt="" />
                  <div>
                    <span>{product.name}</span>
                    <strong>{product.priceText}</strong>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="searchbar__suggestions-empty">Không tìm thấy sản phẩm phù hợp.</div>
          )}
        </div>
      ) : null}
    </div>
  )
}
