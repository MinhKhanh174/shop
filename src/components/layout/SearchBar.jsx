import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { ROUTES } from '../../config/routes'

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
  const deleteTimeoutRef = useRef(null)

  useEffect(() => {
    if (isFocused || searchTerm) return

    const currentMessage = searchHints[messageIndex]
    const typingSpeed = isDeleting ? 50 : 100

    if (deleteTimeoutRef.current) {
      clearTimeout(deleteTimeoutRef.current)
      deleteTimeoutRef.current = null
    }

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentMessage.length) {
          setPlaceholderText(currentMessage.substring(0, charIndex + 1))
          setCharIndex(charIndex + 1)
        } else {
          deleteTimeoutRef.current = setTimeout(() => {
            setIsDeleting(true)
          }, 1500)
        }
      } else {
        if (charIndex > 0) {
          setPlaceholderText(currentMessage.substring(0, charIndex - 1))
          setCharIndex(charIndex - 1)
        } else {
          setIsDeleting(false)
          setMessageIndex((prev) => (prev + 1) % searchHints.length)
        }
      }
    }, typingSpeed)

    return () => {
      clearTimeout(timeout)
      if (deleteTimeoutRef.current) {
        clearTimeout(deleteTimeoutRef.current)
        deleteTimeoutRef.current = null
      }
    }
  }, [isFocused, searchTerm, messageIndex, charIndex, isDeleting])

  const handleSearch = (event) => {
    event.preventDefault()

    const query = searchTerm.trim()
    if (!query) {
      toast('Nhập từ khóa để tìm kiếm', { icon: '🔎' })
      return
    }

    navigate(`${ROUTES.PRODUCTS}?q=${encodeURIComponent(query)}`)
  }

  return (
    <form className="searchbar" onSubmit={handleSearch}>
      <input
        type="search"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={isFocused || searchTerm ? '' : placeholderText}
        aria-label="Tìm sản phẩm"
      />
      <button type="submit" aria-label="Tìm kiếm">
        <Search size={18} className="searchbar__button-icon" />
      </button>
    </form>
  )
}
