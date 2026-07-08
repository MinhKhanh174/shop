import { useEffect, useMemo, useState } from 'react'
import { Edit3, Loader2, Plus, Search, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

import AdminBadge from '../components/ui/AdminBadge'
import AdminButton from '../components/ui/AdminButton'
import AdminModal from '../components/ui/AdminModal'
import AdminTable from '../components/ui/AdminTable'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatAdminDate, formatAdminStatus } from '../utils/adminDisplayMapper'
import {
  calculateDiscountedPrice,
  addProduct,
  deleteProduct,
  getProductCategories,
  getProductCategoryLabel,
  getProducts,
  updateProduct,
} from '../services/adminProductService'

const cardBase = 'rounded-[28px] border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]'
const fieldBase =
  'mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400'
const textAreaBase = `${fieldBase} min-h-[120px] resize-y`
const WARRANTY_OPTIONS = ['1 tháng', '3 tháng', '6 tháng', '12 tháng']
const SHIPPING_OPTIONS = ['1-2 ngày', '2-4 ngày', '4-6 ngày', 'Sau 7 ngày']
const RETURN_OPTIONS = ['30 ngày', '60 ngày', '90 ngày', '120 ngày']
const CUSTOM_POLICY_VALUE = '__custom__'

function formatDate(value) {
  return formatAdminDate(value, '-')
}

function statusTone(status) {
  const normalized = normalizeText(status).toLowerCase()
  return normalized === 'active' || normalized === 'đang bán' ? 'success' : 'neutral'
}

function statusLabel(status) {
  return formatAdminStatus(status, 'Ngừng bán')
}

function createInitialForm() {
  return {
    title: '',
    description: '',
    category: '',
    brand: '',
    brandCustom: '',
    sku: '',
    tags: '',
    price: '',
    discountPercentage: '0',
    stock: '0',
    minimumOrderQuantity: '1',
    thumbnail: '',
    images: '',
    rating: '0',
    availabilityStatus: '',
    warrantyInformation: '',
    warrantyInformationCustom: '',
    shippingInformation: '',
    shippingInformationCustom: '',
    returnPolicy: '',
    returnPolicyCustom: '',
  }
}

function listValueToText(value) {
  if (Array.isArray(value)) {
    return value.join('\n')
  }

  return normalizeText(value)
}

function deriveOriginalPriceForForm(product, raw) {
  const directOriginalPrice = Number(raw.originalPrice ?? product?.originalPrice)

  if (Number.isFinite(directOriginalPrice) && directOriginalPrice > 0) {
    return directOriginalPrice
  }

  const discountPercentage = Number(raw.discountPercentage ?? product?.discountPercentage ?? 0)
  const safeDiscount = Number.isFinite(discountPercentage) ? Math.min(100, Math.max(0, discountPercentage)) : 0
  const currentPrice = Number(raw.price ?? product?.price ?? 0)

  if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
    return 0
  }

  if (safeDiscount <= 0) {
    return currentPrice
  }

  const divisor = 1 - safeDiscount / 100

  if (divisor <= 0) {
    return currentPrice
  }

  return Math.max(0, Math.round(currentPrice / divisor))
}

function pickKnownOption(value, options = []) {
  const normalized = normalizeText(value)
  if (!normalized) {
    return ''
  }

  return options.includes(normalized) ? normalized : CUSTOM_POLICY_VALUE
}

function buildProductFormFromProduct(product, brandOptions = []) {
  const raw = product && typeof product.raw === 'object' ? product.raw : {}
  const resolvedBrand = normalizeText(raw.brand ?? product?.brand, '')
  const resolvedWarranty = normalizeText(raw.warrantyInformation ?? product?.warrantyInformation, '')
  const resolvedShipping = normalizeText(raw.shippingInformation ?? product?.shippingInformation, '')
  const resolvedReturnPolicy = normalizeText(raw.returnPolicy ?? product?.returnPolicy, '')
  const stock = Number.parseInt(raw.stock ?? product?.stock ?? 0, 10)
  const originalPrice = deriveOriginalPriceForForm(product, raw)

  return {
    title: normalizeText(raw.title ?? product?.name, ''),
    description: normalizeText(raw.description ?? product?.description, ''),
    category: normalizeText(raw.category ?? product?.category, ''),
    brand: pickKnownOption(resolvedBrand, brandOptions),
    brandCustom: brandOptions.includes(resolvedBrand) ? '' : resolvedBrand,
    sku: normalizeText(raw.sku ?? product?.sku, ''),
    tags: listValueToText(raw.tags ?? product?.tags),
    price: normalizeText(originalPrice, ''),
    discountPercentage: normalizeText(raw.discountPercentage ?? product?.discountPercentage, '0'),
    stock: normalizeText(raw.stock ?? product?.stock, '0'),
    minimumOrderQuantity: normalizeText(raw.minimumOrderQuantity ?? product?.minimumOrderQuantity, '1'),
    thumbnail: normalizeText(raw.thumbnail ?? product?.thumbnail ?? product?.image, ''),
    images: listValueToText(raw.images ?? product?.images),
    rating: normalizeText(raw.rating ?? product?.rating, '0'),
    availabilityStatus: normalizeProductStatusValue(
      raw.availabilityStatus ?? raw.status ?? product?.status,
      normalizeProductStatusValue(product?.status, stock > 0 ? 'active' : 'inactive'),
    ),
    warrantyInformation: pickKnownOption(resolvedWarranty, WARRANTY_OPTIONS),
    warrantyInformationCustom: WARRANTY_OPTIONS.includes(resolvedWarranty) ? '' : resolvedWarranty,
    shippingInformation: pickKnownOption(resolvedShipping, SHIPPING_OPTIONS),
    shippingInformationCustom: SHIPPING_OPTIONS.includes(resolvedShipping) ? '' : resolvedShipping,
    returnPolicy: pickKnownOption(resolvedReturnPolicy, RETURN_OPTIONS),
    returnPolicyCustom: RETURN_OPTIONS.includes(resolvedReturnPolicy) ? '' : resolvedReturnPolicy,
  }
}

function normalizeText(value) {
  return String(value ?? '').trim()
}

function isValidUrl(value) {
  const text = normalizeText(value)

  if (!text) {
    return true
  }

  try {
    const url = new URL(text)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function splitListValue(value) {
  return String(value ?? '')
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function resolvePolicyValue(value, customValue) {
  const selectedValue = normalizeText(value)

  if (selectedValue === CUSTOM_POLICY_VALUE) {
    return normalizeText(customValue)
  }

  return selectedValue
}

function generateSku(title) {
  const base = normalizeText(title)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 18)

  const suffix = Date.now().toString().slice(-5)

  return `TS-${base || 'PRODUCT'}-${suffix}`
}

function deriveProductStatus(stock) {
  return stock > 0 ? 'active' : 'inactive'
}

function normalizeProductStatusValue(value, fallback = '') {
  const normalized = normalizeText(value).toLowerCase()

  if (normalized === 'active' || normalized === 'inactive') {
    return normalized
  }

  return normalizeText(fallback)
}

function matchProduct(sourceProduct, targetProduct) {
  if (!sourceProduct || !targetProduct) {
    return false
  }

  const sourceKeys = [sourceProduct.id, sourceProduct.localId, sourceProduct.remoteId]
    .map((key) => normalizeText(key))
    .filter(Boolean)

  const targetKeys = [targetProduct.id, targetProduct.localId, targetProduct.remoteId]
    .map((key) => normalizeText(key))
    .filter(Boolean)

  return sourceKeys.some((key) => targetKeys.includes(key))
}

function validateCreateForm(form, options = {}) {
  const errors = {}
  const title = normalizeText(form.title)
  const description = normalizeText(form.description)
  const category = normalizeText(form.category)
  const brandSelection = normalizeText(form.brand)
  const brand = resolvePolicyValue(form.brand, form.brandCustom)
  const sku = normalizeText(form.sku) || generateSku(title)
  const tags = splitListValue(form.tags)
  const images = splitListValue(form.images)
  const thumbnail = normalizeText(form.thumbnail)
  const warrantySelection = normalizeText(form.warrantyInformation)
  const shippingSelection = normalizeText(form.shippingInformation)
  const returnSelection = normalizeText(form.returnPolicy)
  const warrantyInformation = resolvePolicyValue(form.warrantyInformation, form.warrantyInformationCustom)
  const shippingInformation = resolvePolicyValue(form.shippingInformation, form.shippingInformationCustom)
  const returnPolicy = resolvePolicyValue(form.returnPolicy, form.returnPolicyCustom)

  const originalPrice = Number(form.price)
  const discountPercentage = Number(form.discountPercentage)
  const stock = Number.parseInt(form.stock, 10)
  const minimumOrderQuantity = Number.parseInt(form.minimumOrderQuantity, 10)
  const rating = Number(form.rating)
  const availabilityStatus = normalizeProductStatusValue(form.availabilityStatus)
  const statusFallback = normalizeProductStatusValue(options.statusFallback)

  if (title.length < 3) {
    errors.title = 'Tên sản phẩm là bắt buộc và phải có ít nhất 3 ký tự.'
  } else if (title.length > 120) {
    errors.title = 'Tên sản phẩm không được vượt quá 120 ký tự.'
  }

  if (description.length < 10) {
    errors.description = 'Mô tả là bắt buộc và phải có ít nhất 10 ký tự.'
  }

  if (!category) {
    errors.category = 'Danh mục là bắt buộc.'
  }

  if (!brand) {
    errors.brand = 'Thương hiệu là bắt buộc.'
  }

  if (brandSelection === CUSTOM_POLICY_VALUE && !brand) {
    errors.brandCustom = 'Vui lòng nhập thương hiệu mới.'
  }

  if (!Number.isFinite(originalPrice) || originalPrice <= 0) {
    errors.price = 'Giá gốc phải là số lớn hơn 0.'
  }

  if (!Number.isInteger(stock) || stock < 0) {
    errors.stock = 'Tồn kho phải là số nguyên lớn hơn hoặc bằng 0.'
  }

  if (!Number.isFinite(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {
    errors.discountPercentage = 'Giảm giá phải nằm trong khoảng 0 đến 100.'
  }

  if (!Number.isInteger(minimumOrderQuantity) || minimumOrderQuantity < 1) {
    errors.minimumOrderQuantity = 'Số lượng đặt tối thiểu phải lớn hơn hoặc bằng 1.'
  }

  if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
    errors.rating = 'Điểm đánh giá phải nằm trong khoảng 0 đến 5.'
  }

  if (thumbnail && !isValidUrl(thumbnail)) {
    errors.thumbnail = 'Ảnh đại diện phải là một URL hợp lệ.'
  }

  if (images.some((image) => !isValidUrl(image))) {
    errors.images = 'Mỗi URL ảnh trong danh sách phải hợp lệ.'
  }

  if (warrantySelection === CUSTOM_POLICY_VALUE && !warrantyInformation) {
    errors.warrantyInformationCustom = 'Vui lòng nhập thời hạn bảo hành khác.'
  }

  if (shippingSelection === CUSTOM_POLICY_VALUE && !shippingInformation) {
    errors.shippingInformationCustom = 'Vui lòng nhập thời gian vận chuyển khác.'
  }

  if (returnSelection === CUSTOM_POLICY_VALUE && !returnPolicy) {
    errors.returnPolicyCustom = 'Vui lòng nhập thời hạn đổi trả khác.'
  }

  const price = calculateDiscountedPrice(originalPrice, discountPercentage)

  const payload = {
    title,
    description,
    category,
    brand,
    sku,
    tags,
    originalPrice,
    price,
    discountPercentage,
    stock,
    minimumOrderQuantity,
    thumbnail,
    images,
    rating,
    status: availabilityStatus || statusFallback || deriveProductStatus(stock),
    availabilityStatus: availabilityStatus || statusFallback || deriveProductStatus(stock),
    warrantyInformation,
    shippingInformation,
    returnPolicy,
  }

  return {
    errors,
    payload,
  }
}

function FieldError({ message }) {
  if (!message) {
    return null
  }

  return <p className="mt-2 text-xs font-medium text-rose-600">{message}</p>
}

function Section({ title, description, children }) {
  return (
    <section className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</h3>
        {description ? <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}
function EmptyState() {
  return (
    <div className={`${cardBase} px-6 py-16 text-center`}>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Search size={22} />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-950">Không tìm thấy sản phẩm</h3>
      <p className="mt-2 text-sm text-slate-500">Hãy thay đổi từ khóa tìm kiếm hoặc bộ lọc để xem dữ liệu phù hợp hơn.</p>
    </div>
  )
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [categoryItems, setCategoryItems] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createForm, setCreateForm] = useState(() => createInitialForm())
  const [createErrors, setCreateErrors] = useState({})
  const [isCreating, setIsCreating] = useState(false)
  const [createApiError, setCreateApiError] = useState('')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [editForm, setEditForm] = useState(() => createInitialForm())
  const [editInitialForm, setEditInitialForm] = useState(() => createInitialForm())
  const [editErrors, setEditErrors] = useState({})
  const [isEditing, setIsEditing] = useState(false)
  const [editApiError, setEditApiError] = useState('')
  const [productToDelete, setProductToDelete] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    let active = true

    void Promise.allSettled([getProducts(), getProductCategories()]).then(([productsResult, categoriesResult]) => {
      if (!active) {
        return
      }

      if (productsResult.status === 'fulfilled') {
        setProducts(productsResult.value)
      }

      if (categoriesResult.status === 'fulfilled') {
        setCategoryItems(categoriesResult.value)
      }
    })

    return () => {
      active = false
    }
  }, [])

  const categories = useMemo(() => {
    const fallbackCategories = Array.from(new Set(products.map((product) => product.category).filter(Boolean))).map((key) => ({
      key,
      sidebarLabel: getProductCategoryLabel(key),
    }))

    return ['all', ...((categoryItems.length ? categoryItems : fallbackCategories).map((item) => item.key))]
  }, [categoryItems, products])

  const categoryOptions = useMemo(() => {
    const fallbackCategories = Array.from(new Set(products.map((product) => product.category).filter(Boolean))).map((key) => ({
      key,
      sidebarLabel: getProductCategoryLabel(key),
    }))

    return categoryItems.length ? categoryItems : fallbackCategories
  }, [categoryItems, products])

  const brandOptions = useMemo(() => {
    return Array.from(new Set(products.map((product) => product.brand).filter(Boolean)))
  }, [products])

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        [product.name, product.sku, product.brand, product.category].some((value) =>
          String(value ?? '').toLowerCase().includes(normalizedSearch),
        )

      const matchesCategory = category === 'all' || product.category === category
      const matchesStatus = status === 'all' || product.status === status

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [category, products, search, status])

  const handleOpenCreateModal = () => {
    setCreateForm(createInitialForm())
    setCreateErrors({})
    setCreateApiError('')
    setIsCreateModalOpen(true)
  }

  const handleCloseCreateModal = () => {
    if (isCreating) {
      return
    }

    setIsCreateModalOpen(false)
    setCreateForm(createInitialForm())
    setCreateErrors({})
    setCreateApiError('')
  }

  const handleOpenEditModal = (product) => {
    if (!product || isEditing) {
      return
    }

    const nextForm = buildProductFormFromProduct(product, brandOptions)

    setEditProduct(product)
    setEditForm(nextForm)
    setEditInitialForm(nextForm)
    setEditErrors({})
    setEditApiError('')
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    if (isEditing) {
      return
    }

    if (JSON.stringify(editForm) !== JSON.stringify(editInitialForm)) {
      const shouldClose = window.confirm('Bạn có thay đổi chưa lưu. Đóng mà không lưu?')
      if (!shouldClose) {
        return
      }
    }

    setIsEditModalOpen(false)
    setEditProduct(null)
    setEditForm(createInitialForm())
    setEditInitialForm(createInitialForm())
    setEditErrors({})
    setEditApiError('')
  }

  const handleOpenDeleteModal = (product) => {
    if (!product || isDeleting) {
      return
    }

    setProductToDelete(product)
    setDeleteError('')
    setIsDeleteModalOpen(true)
  }

  const handleCloseDeleteModal = () => {
    if (isDeleting) {
      return
    }

    setIsDeleteModalOpen(false)
    setProductToDelete(null)
    setDeleteError('')
  }

  const handleCreateChange = (event) => {
    const { name, value } = event.target
    const policyCustomFields = {
      brand: 'brandCustom',
      warrantyInformation: 'warrantyInformationCustom',
      shippingInformation: 'shippingInformationCustom',
      returnPolicy: 'returnPolicyCustom',
    }

    setCreateForm((current) => ({
      ...current,
      [name]: value,
      ...(policyCustomFields[name] && value !== CUSTOM_POLICY_VALUE
        ? { [policyCustomFields[name]]: '' }
        : {}),
    }))

    if (createErrors[name]) {
      setCreateErrors((current) => {
        const nextErrors = { ...current }
        delete nextErrors[name]
        return nextErrors
      })
    }

    if (policyCustomFields[name]) {
      setCreateErrors((current) => {
        if (!current[policyCustomFields[name]]) {
          return current
        }

        const nextErrors = { ...current }
        delete nextErrors[policyCustomFields[name]]
        return nextErrors
      })
    }

    if (createApiError) {
      setCreateApiError('')
    }
  }

  const handleEditChange = (event) => {
    const { name, value } = event.target
    const policyCustomFields = {
      brand: 'brandCustom',
      warrantyInformation: 'warrantyInformationCustom',
      shippingInformation: 'shippingInformationCustom',
      returnPolicy: 'returnPolicyCustom',
    }

    setEditForm((current) => ({
      ...current,
      [name]: value,
      ...(policyCustomFields[name] && value !== CUSTOM_POLICY_VALUE
        ? { [policyCustomFields[name]]: '' }
        : {}),
    }))

    if (editErrors[name]) {
      setEditErrors((current) => {
        const nextErrors = { ...current }
        delete nextErrors[name]
        return nextErrors
      })
    }

    if (policyCustomFields[name]) {
      setEditErrors((current) => {
        if (!current[policyCustomFields[name]]) {
          return current
        }

        const nextErrors = { ...current }
        delete nextErrors[policyCustomFields[name]]
        return nextErrors
      })
    }

    if (editApiError) {
      setEditApiError('')
    }
  }

  const removeProductFromState = (removedProduct) => {
    if (!removedProduct) {
      return
    }

    setProducts((current) =>
      current.filter((item) => {
        const itemIds = [item.id, item.localId, item.remoteId].map((key) => String(key ?? '').trim()).filter(Boolean)
        const removedIds = [removedProduct.id, removedProduct.localId, removedProduct.remoteId]
          .map((key) => String(key ?? '').trim())
          .filter(Boolean)

        return !itemIds.some((key) => removedIds.includes(key))
      }),
    )
  }

  const replaceProductInState = (updatedProduct) => {
    if (!updatedProduct) {
      return
    }

    setProducts((current) =>
      current.map((item) => {
        if (matchProduct(item, updatedProduct)) {
          return updatedProduct
        }

        return item
      }),
    )
  }

  const handleCreateSubmit = async (event) => {
    event.preventDefault()

    if (isCreating) {
      return
    }

    const { errors, payload } = validateCreateForm(createForm)

    if (Object.keys(errors).length) {
      setCreateErrors(errors)
      return
    }

    setIsCreating(true)
    setCreateApiError('')

    try {
      const createdProduct = await addProduct(payload)
      const productName = createdProduct?.name || payload.title || 'sản phẩm'

      setProducts((current) => [createdProduct, ...current])
      setIsCreateModalOpen(false)
      setCreateForm(createInitialForm())
      setCreateErrors({})
      toast.success(`Đã lưu sản phẩm ${productName}.`)
    } catch (error) {
      setCreateApiError(error instanceof Error ? error.message : 'Không thể thêm sản phẩm. Vui lòng thử lại.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()

    if (isEditing || !editProduct) {
      return
    }

    const { errors, payload } = validateCreateForm(editForm, {
      statusFallback: editProduct?.status,
    })

    if (Object.keys(errors).length) {
      setEditErrors(errors)
      return
    }

    setIsEditing(true)
    setEditApiError('')

    try {
      const updatedProduct = await updateProduct(editProduct, payload)
      const productName = updatedProduct?.name || payload.title || editProduct?.name || 'sản phẩm'

      replaceProductInState(updatedProduct)
      setEditProduct(updatedProduct)
      setIsEditModalOpen(false)
      setEditForm(createInitialForm())
      setEditInitialForm(createInitialForm())
      setEditErrors({})
      toast.success(`Đã lưu sản phẩm ${productName}.`)
    } catch (error) {
      setEditApiError(error instanceof Error ? error.message : 'Không thể lưu thay đổi. Vui lòng thử lại.')
    } finally {
      setIsEditing(false)
    }
  }

  const handleDeleteSubmit = async (event) => {
    event.preventDefault()

    if (isDeleting || !productToDelete) {
      return
    }

    setIsDeleting(true)
    setDeleteError('')

    try {
      const deletedProduct = await deleteProduct(productToDelete)
      const productName = deletedProduct?.name || productToDelete?.name || 'sản phẩm'

      removeProductFromState(deletedProduct || productToDelete)
      setIsDeleteModalOpen(false)
      setProductToDelete(null)
      toast.success(`Đã xóa sản phẩm ${productName}.`)
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Không thể xóa sản phẩm. Vui lòng thử lại.')
    } finally {
      setIsDeleting(false)
    }
  }

  const createFooter = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className={`text-xs leading-5 text-rose-600 ${Object.keys(createErrors).length ? '' : 'invisible'}`}>
        Có thông tin còn thiếu hoặc chưa đúng. Vui lòng kiểm tra lại các trường được đánh dấu bên trên.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <AdminButton variant="secondary" type="button" onClick={handleCloseCreateModal} disabled={isCreating}>
          Hủy
        </AdminButton>
        <AdminButton type="submit" form="admin-product-create-form" disabled={isCreating}>
          {isCreating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Đang lưu...
            </>
          ) : (
            'Lưu sản phẩm'
          )}
        </AdminButton>
      </div>
    </div>
  )

  const editFooter = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className={`text-xs leading-5 text-rose-600 ${Object.keys(editErrors).length ? '' : 'invisible'}`}>
        Có thông tin còn thiếu hoặc chưa đúng. Vui lòng kiểm tra lại các trường được đánh dấu bên trên.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <AdminButton variant="secondary" type="button" onClick={handleCloseEditModal} disabled={isEditing}>
          Hủy
        </AdminButton>
        <AdminButton type="submit" form="admin-product-edit-form" disabled={isEditing}>
          {isEditing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Đang lưu...
            </>
          ) : (
            'Lưu thay đổi'
          )}
        </AdminButton>
      </div>
    </div>
  )

  const deleteFooter = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className={`text-xs leading-5 text-rose-600 ${deleteError ? '' : 'invisible'}`}>
        {deleteError || 'Xóa sản phẩm sẽ loại bỏ dữ liệu khỏi danh sách hiện tại.'}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <AdminButton variant="secondary" type="button" onClick={handleCloseDeleteModal} disabled={isDeleting}>
          Hủy
        </AdminButton>
        <AdminButton variant="danger" type="submit" form="admin-product-delete-form" disabled={isDeleting}>
          {isDeleting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Đang xóa...
            </>
          ) : (
            'Xác nhận xóa'
          )}
        </AdminButton>
      </div>
    </div>
  )

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Quản lý cửa hàng</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Quản lý sản phẩm</h1>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            Theo dõi danh mục sản phẩm, tồn kho và trạng thái bán hàng trong giao diện quản trị gọn gàng, dễ đọc.
          </p>
        </div>

        <AdminButton onClick={handleOpenCreateModal}>
          <Plus size={16} />
          Thêm sản phẩm
        </AdminButton>
      </div>

      <div className={`${cardBase} space-y-4 p-5`}>
        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr]">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-colors focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
            <Search size={16} className="shrink-0 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm kiếm sản phẩm, SKU, thương hiệu..."
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-colors focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
            <span className="whitespace-nowrap text-sm font-medium text-slate-500">Danh mục</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="ml-auto w-full bg-transparent text-sm text-slate-700 outline-none"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === 'all' ? 'Tất cả danh mục' : getProductCategoryLabel(item)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-colors focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
            <span className="whitespace-nowrap text-sm font-medium text-slate-500">Trạng thái</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="ml-auto w-full bg-transparent text-sm text-slate-700 outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang bán</option>
              <option value="inactive">Ngừng bán</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-sm text-slate-600">
            Hiển thị <span className="font-semibold text-slate-950">{filteredProducts.length.toLocaleString('vi-VN')}</span> /{' '}
            <span className="font-semibold text-slate-950">{products.length.toLocaleString('vi-VN')}</span> sản phẩm
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <AdminBadge tone="info">{categoryOptions.length} danh mục</AdminBadge>
            <AdminBadge tone="success">{products.filter((product) => product.status === 'active').length} đang bán</AdminBadge>
          </div>
        </div>
      </div>

      {filteredProducts.length ? (
        <AdminTable>
          <thead className="bg-slate-50/90">
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <th className="px-5 py-4">Hình ảnh</th>
              <th className="px-5 py-4">Mã SKU</th>
              <th className="px-5 py-4">Tên sản phẩm</th>
              <th className="px-5 py-4">Danh mục</th>
              <th className="px-5 py-4">Thương hiệu</th>
              <th className="px-5 py-4">Giá</th>
              <th className="px-5 py-4">Tồn kho</th>
              <th className="px-5 py-4">Trạng thái</th>
              <th className="px-5 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="text-sm text-slate-700 transition-colors hover:bg-slate-50/70">
                <td className="px-5 py-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-14 w-14 rounded-2xl border border-slate-200 object-cover shadow-sm"
                  />
                </td>
                <td className="px-5 py-4 font-medium text-slate-950">{product.sku}</td>
                <td className="px-5 py-4">
                  <div>
                    <p className="font-medium text-slate-950">{product.name}</p>
                    <p className="mt-1 text-xs text-slate-500">Ngày tạo: {formatDate(product.createdAt)}</p>
                  </div>
                </td>
                <td className="px-5 py-4">{product.categoryLabel ?? getProductCategoryLabel(product.category)}</td>
                <td className="px-5 py-4">{product.brand}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-950">{formatCurrency(product.price)}</span>
                    {Number(product.discountPercentage) > 0 && Number(product.originalPrice) > Number(product.price) ? (
                      <span className="text-xs text-slate-400 line-through">{formatCurrency(product.originalPrice)}</span>
                    ) : null}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                    {product.stock}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <AdminBadge tone={statusTone(product.status)}>{statusLabel(product.status)}</AdminBadge>
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <AdminButton variant="secondary" size="sm" onClick={() => handleOpenEditModal(product)}>
                      <Edit3 size={14} />
                      Sửa
                    </AdminButton>
                    <AdminButton variant="danger" size="sm" onClick={() => handleOpenDeleteModal(product)}>
                      <Trash2 size={14} />
                      Xóa
                    </AdminButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      ) : (
        <EmptyState />
      )}

      <AdminModal
        open={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        title="Thêm sản phẩm"
        description="Nh?p d? li?u s?n ph?m m?i."
        footer={createFooter}
      >
        <form id="admin-product-create-form" className="space-y-4" onSubmit={handleCreateSubmit}>
          {createApiError ? (
            <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800">
              {createApiError}
            </div>
          ) : null}

          <Section title="A. Thông tin cơ bản" description="Nhập các thông tin hiển thị chính của sản phẩm.">
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-600">Tên sản phẩm</span>
                <input
                  name="title"
                  value={createForm.title}
                  onChange={handleCreateChange}
                  disabled={isCreating}
                  className={fieldBase}
                  placeholder="Ví dụ: iPhone 15 Pro Max 256GB"
                />
                <FieldError message={createErrors.title} />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-600">Thương hiệu</span>
                <select
                  name="brand"
                  value={createForm.brand}
                  onChange={handleCreateChange}
                  disabled={isCreating}
                  className={fieldBase}
                >
                  <option value="">Chọn thương hiệu</option>
                  {brandOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                  <option value={CUSTOM_POLICY_VALUE}>Khác...</option>
                </select>
                <FieldError message={createErrors.brand} />
                {createForm.brand === CUSTOM_POLICY_VALUE ? (
                  <input
                    name="brandCustom"
                    value={createForm.brandCustom}
                    onChange={handleCreateChange}
                    disabled={isCreating}
                    className={fieldBase}
                    placeholder="Nhập thương hiệu mới"
                  />
                ) : null}
                <FieldError message={createErrors.brandCustom} />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-600">Danh mục</span>
                <select
                  name="category"
                  value={createForm.category}
                  onChange={handleCreateChange}
                  disabled={isCreating}
                  className={fieldBase}
                >
              <option value="">Chọn danh mục</option>
                  {categoryOptions.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.sidebarLabel ?? getProductCategoryLabel(item.key)}
                    </option>
                  ))}
                </select>
                <FieldError message={createErrors.category} />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-600">Mã SKU</span>
                <input
                  name="sku"
                  value={createForm.sku}
                  onChange={handleCreateChange}
                  disabled={isCreating}
                  className={fieldBase}
                  placeholder="Sẽ tự sinh nếu bỏ trống"
                />
              </label>

              <label className="block lg:col-span-2">
                <span className="text-sm font-medium text-slate-600">Thẻ</span>
                <textarea
                  name="tags"
                  value={createForm.tags}
                  onChange={handleCreateChange}
                  disabled={isCreating}
                  className={textAreaBase}
                  placeholder="Nhập nhiều tag, ngăn cách bằng dấu phẩy hoặc xuống dòng"
                />
              </label>

              <label className="block lg:col-span-2">
                <span className="text-sm font-medium text-slate-600">Mô tả</span>
                <textarea
                  name="description"
                  value={createForm.description}
                  onChange={handleCreateChange}
                  disabled={isCreating}
                  className={textAreaBase}
                  placeholder="Mô tả ngắn về sản phẩm..."
                />
                <FieldError message={createErrors.description} />
              </label>
            </div>
          </Section>

          <Section title="B. Giá và tồn kho" description="Các thông số giá, chiết khấu và số lượng tồn.">
            <div className="grid gap-4 lg:grid-cols-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-600">Giá bán gốc</span>
                <input
                  name="price"
                  value={createForm.price}
                  onChange={handleCreateChange}
                  disabled={isCreating}
                  type="number"
                  min="0"
                  step="0.01"
                  className={fieldBase}
                  placeholder="Ví dụ: 10000000"
                />
                <FieldError message={createErrors.price} />
                <p className="mt-2 text-xs text-slate-500">Bảng sẽ hiển thị giá sau khi trừ giảm giá.</p>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-600">Giảm giá (%)</span>
                <input
                  name="discountPercentage"
                  value={createForm.discountPercentage}
                  onChange={handleCreateChange}
                  disabled={isCreating}
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  className={fieldBase}
                  placeholder="0"
                />
                <FieldError message={createErrors.discountPercentage} />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-600">Tồn kho</span>
                <input
                  name="stock"
                  value={createForm.stock}
                  onChange={handleCreateChange}
                  disabled={isCreating}
                  type="number"
                  min="0"
                  step="1"
                  className={fieldBase}
                  placeholder="0"
                />
                <FieldError message={createErrors.stock} />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-600">Số lượng đặt tối thiểu</span>
                <input
                  name="minimumOrderQuantity"
                  value={createForm.minimumOrderQuantity}
                  onChange={handleCreateChange}
                  disabled={isCreating}
                  type="number"
                  min="1"
                  step="1"
                  className={fieldBase}
                  placeholder="1"
                />
                <FieldError message={createErrors.minimumOrderQuantity} />
              </label>
            </div>
          </Section>

          <Section title="C. Hình ảnh" description="Ảnh đại diện và bộ ảnh sản phẩm. Nhập nhiều URL bằng dấu phẩy hoặc xuống dòng.">
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-600">Ảnh đại diện</span>
                <input
                  name="thumbnail"
                  value={createForm.thumbnail}
                  onChange={handleCreateChange}
                  disabled={isCreating}
                  className={fieldBase}
                  placeholder="https://..."
                />
                <FieldError message={createErrors.thumbnail} />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-600">Danh sách ảnh</span>
                <textarea
                  name="images"
                  value={createForm.images}
                  onChange={handleCreateChange}
                  disabled={isCreating}
                  className={textAreaBase}
                  placeholder={`https://...\nhttps://...`}
                />
                <FieldError message={createErrors.images} />
              </label>
            </div>
          </Section>

          <Section title="D. Đánh giá / trạng thái" description="Thông số dùng để hiển thị tình trạng sản phẩm trên DummyJSON.">
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-600">Điểm đánh giá</span>
                <input
                  name="rating"
                  value={createForm.rating}
                  onChange={handleCreateChange}
                  disabled={isCreating}
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  className={fieldBase}
                  placeholder="0"
                />
                <FieldError message={createErrors.rating} />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-600">Trạng thái</span>
                <select
                  name="availabilityStatus"
                  value={createForm.availabilityStatus}
                  onChange={handleCreateChange}
                  disabled={isCreating}
                  className={fieldBase}
                >
                  <option value="">Tự động theo tồn kho</option>
                  <option value="active">Đang bán</option>
                  <option value="inactive">Ngừng bán</option>
                </select>
              </label>
            </div>
          </Section>

          <Section title="E. Chính sách" description="Các thông tin chính sách bổ sung từ DummyJSON.">
            <div className="grid gap-4 lg:grid-cols-3">
              <label className="block">
                <span className="text-sm font-medium text-slate-600">Bảo hành</span>
                <select
                  name="warrantyInformation"
                  value={createForm.warrantyInformation}
                  onChange={handleCreateChange}
                  disabled={isCreating}
                  className={fieldBase}
                >
                  <option value="">Chọn thời hạn bảo hành</option>
                  {WARRANTY_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                  <option value={CUSTOM_POLICY_VALUE}>Khác...</option>
                </select>
                {createForm.warrantyInformation === CUSTOM_POLICY_VALUE ? (
                  <input
                    name="warrantyInformationCustom"
                    value={createForm.warrantyInformationCustom}
                    onChange={handleCreateChange}
                    disabled={isCreating}
                    className={fieldBase}
                    placeholder="Nhập thời hạn bảo hành khác"
                  />
                ) : null}
                <FieldError message={createErrors.warrantyInformationCustom} />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-600">Vận chuyển</span>
                <select
                  name="shippingInformation"
                  value={createForm.shippingInformation}
                  onChange={handleCreateChange}
                  disabled={isCreating}
                  className={fieldBase}
                >
                  <option value="">Chọn thời gian vận chuyển</option>
                  {SHIPPING_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                  <option value={CUSTOM_POLICY_VALUE}>Khác...</option>
                </select>
                {createForm.shippingInformation === CUSTOM_POLICY_VALUE ? (
                  <input
                    name="shippingInformationCustom"
                    value={createForm.shippingInformationCustom}
                    onChange={handleCreateChange}
                    disabled={isCreating}
                    className={fieldBase}
                    placeholder="Nhập thời gian vận chuyển khác"
                  />
                ) : null}
                <FieldError message={createErrors.shippingInformationCustom} />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-600">Đổi trả</span>
                <select
                  name="returnPolicy"
                  value={createForm.returnPolicy}
                  onChange={handleCreateChange}
                  disabled={isCreating}
                  className={fieldBase}
                >
                  <option value="">Chọn thời hạn đổi trả</option>
                  {RETURN_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                  <option value={CUSTOM_POLICY_VALUE}>Khác...</option>
                </select>
                {createForm.returnPolicy === CUSTOM_POLICY_VALUE ? (
                  <input
                    name="returnPolicyCustom"
                    value={createForm.returnPolicyCustom}
                    onChange={handleCreateChange}
                    disabled={isCreating}
                    className={fieldBase}
                    placeholder="Nhập thời hạn đổi trả khác"
                  />
                ) : null}
                <FieldError message={createErrors.returnPolicyCustom} />
              </label>
            </div>
          </Section>
        </form>
      </AdminModal>

      <AdminModal
        open={isEditModalOpen}
        onClose={handleCloseEditModal}
        title="Sửa sản phẩm"
        description="Cập nhật thông tin sản phẩm đang chọn."
        footer={editFooter}
      >
        <form id="admin-product-edit-form" className="space-y-4" onSubmit={handleEditSubmit}>
          {editApiError ? (
            <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800">
              {editApiError}
            </div>
          ) : null}

          <Section title="Sửa sản phẩm" description="Cập nhật thông tin sản phẩm đang chọn.">
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-600">Tên sản phẩm</span>
                <input
                  name="title"
                  value={editForm.title}
                  onChange={handleEditChange}
                  disabled={isEditing}
                  className={fieldBase}
                  placeholder="Ví dụ: iPhone 15 Pro Max 256GB"
                />
                <FieldError message={editErrors.title} />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-600">Thương hiệu</span>
                <select
                  name="brand"
                  value={editForm.brand}
                  onChange={handleEditChange}
                  disabled={isEditing}
                  className={fieldBase}
                >
                  <option value="">Chọn thương hiệu</option>
                  {brandOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                  <option value={CUSTOM_POLICY_VALUE}>Khác...</option>
                </select>
                <FieldError message={editErrors.brand} />
                {editForm.brand === CUSTOM_POLICY_VALUE ? (
                  <input
                    name="brandCustom"
                    value={editForm.brandCustom}
                    onChange={handleEditChange}
                    disabled={isEditing}
                    className={fieldBase}
                    placeholder="Nhập thương hiệu mới"
                  />
                ) : null}
                <FieldError message={editErrors.brandCustom} />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-600">Danh mục</span>
                <select
                  name="category"
                  value={editForm.category}
                  onChange={handleEditChange}
                  disabled={isEditing}
                  className={fieldBase}
                >
              <option value="">Chọn danh mục</option>
                  {categoryOptions.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.sidebarLabel ?? getProductCategoryLabel(item.key)}
                    </option>
                  ))}
                </select>
                <FieldError message={editErrors.category} />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-600">Mã SKU</span>
                <input
                  name="sku"
                  value={editForm.sku}
                  onChange={handleEditChange}
                  disabled={isEditing}
                  className={fieldBase}
                  placeholder="Sẽ tự sinh nếu bỏ trống"
                />
              </label>

              <label className="block lg:col-span-2">
                <span className="text-sm font-medium text-slate-600">Thẻ</span>
                <textarea
                  name="tags"
                  value={editForm.tags}
                  onChange={handleEditChange}
                  disabled={isEditing}
                  className={textAreaBase}
                  placeholder="Nhập nhiều tag, ngăn cách bằng dấu phẩy hoặc xuống dòng"
                />
              </label>

              <label className="block lg:col-span-2">
                <span className="text-sm font-medium text-slate-600">Mô tả</span>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  disabled={isEditing}
                  className={textAreaBase}
                  placeholder="Mô tả ngắn về sản phẩm..."
                />
                <FieldError message={editErrors.description} />
              </label>
            </div>
          </Section>

          <Section title="Sửa sản phẩm" description="Cập nhật thông tin sản phẩm đang chọn.">
            <div className="grid gap-4 lg:grid-cols-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-600">Giá bán gốc</span>
                <input
                  name="price"
                  value={editForm.price}
                  onChange={handleEditChange}
                  disabled={isEditing}
                  type="number"
                  min="0"
                  step="0.01"
                  className={fieldBase}
                  placeholder="Ví dụ: 10000000"
                />
                <FieldError message={editErrors.price} />
                <p className="mt-2 text-xs text-slate-500">Bảng sẽ hiển thị giá sau khi trừ giảm giá.</p>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-600">Giảm giá (%)</span>
                <input
                  name="discountPercentage"
                  value={editForm.discountPercentage}
                  onChange={handleEditChange}
                  disabled={isEditing}
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  className={fieldBase}
                  placeholder="0"
                />
                <FieldError message={editErrors.discountPercentage} />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-600">Tồn kho</span>
                <input
                  name="stock"
                  value={editForm.stock}
                  onChange={handleEditChange}
                  disabled={isEditing}
                  type="number"
                  min="0"
                  step="1"
                  className={fieldBase}
                  placeholder="0"
                />
                <FieldError message={editErrors.stock} />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-600">Số lượng đặt tối thiểu</span>
                <input
                  name="minimumOrderQuantity"
                  value={editForm.minimumOrderQuantity}
                  onChange={handleEditChange}
                  disabled={isEditing}
                  type="number"
                  min="1"
                  step="1"
                  className={fieldBase}
                  placeholder="1"
                />
                <FieldError message={editErrors.minimumOrderQuantity} />
              </label>
            </div>
          </Section>

          <Section title="Sửa sản phẩm" description="Cập nhật thông tin sản phẩm đang chọn.">
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-600">Ảnh đại diện</span>
                <input
                  name="thumbnail"
                  value={editForm.thumbnail}
                  onChange={handleEditChange}
                  disabled={isEditing}
                  className={fieldBase}
                  placeholder="https://..."
                />
                <FieldError message={editErrors.thumbnail} />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-600">Danh sách ảnh</span>
                <textarea
                  name="images"
                  value={editForm.images}
                  onChange={handleEditChange}
                  disabled={isEditing}
                  className={textAreaBase}
                  placeholder={`https://...\nhttps://...`}
                />
                <FieldError message={editErrors.images} />
              </label>
            </div>
          </Section>

          <Section title="Sửa sản phẩm" description="Cập nhật thông tin sản phẩm đang chọn.">
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-600">Điểm đánh giá</span>
                <input
                  name="rating"
                  value={editForm.rating}
                  onChange={handleEditChange}
                  disabled={isEditing}
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  className={fieldBase}
                  placeholder="0"
                />
                <FieldError message={editErrors.rating} />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-600">Trạng thái</span>
                <select
                  name="availabilityStatus"
                  value={editForm.availabilityStatus}
                  onChange={handleEditChange}
                  disabled={isEditing}
                  className={fieldBase}
                >
                  <option value="">Tự động theo tồn kho</option>
                  <option value="active">Đang bán</option>
                  <option value="inactive">Ngừng bán</option>
                </select>
              </label>
            </div>
          </Section>

          <Section title="Sửa sản phẩm" description="Cập nhật thông tin sản phẩm đang chọn.">
            <div className="grid gap-4 lg:grid-cols-3">
              <label className="block">
                <span className="text-sm font-medium text-slate-600">Bảo hành</span>
                <select
                  name="warrantyInformation"
                  value={editForm.warrantyInformation}
                  onChange={handleEditChange}
                  disabled={isEditing}
                  className={fieldBase}
                >
                  <option value="">Chọn thời hạn bảo hành</option>
                  {WARRANTY_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                  <option value={CUSTOM_POLICY_VALUE}>Khác...</option>
                </select>
                {editForm.warrantyInformation === CUSTOM_POLICY_VALUE ? (
                  <input
                    name="warrantyInformationCustom"
                    value={editForm.warrantyInformationCustom}
                    onChange={handleEditChange}
                    disabled={isEditing}
                    className={fieldBase}
                    placeholder="Nhập thời hạn bảo hành khác"
                  />
                ) : null}
                <FieldError message={editErrors.warrantyInformationCustom} />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-600">Vận chuyển</span>
                <select
                  name="shippingInformation"
                  value={editForm.shippingInformation}
                  onChange={handleEditChange}
                  disabled={isEditing}
                  className={fieldBase}
                >
                  <option value="">Chọn thời gian vận chuyển</option>
                  {SHIPPING_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                  <option value={CUSTOM_POLICY_VALUE}>Khác...</option>
                </select>
                {editForm.shippingInformation === CUSTOM_POLICY_VALUE ? (
                  <input
                    name="shippingInformationCustom"
                    value={editForm.shippingInformationCustom}
                    onChange={handleEditChange}
                    disabled={isEditing}
                    className={fieldBase}
                    placeholder="Nhập thời gian vận chuyển khác"
                  />
                ) : null}
                <FieldError message={editErrors.shippingInformationCustom} />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-600">Đổi trả</span>
                <select
                  name="returnPolicy"
                  value={editForm.returnPolicy}
                  onChange={handleEditChange}
                  disabled={isEditing}
                  className={fieldBase}
                >
                  <option value="">Chọn thời hạn đổi trả</option>
                  {RETURN_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                  <option value={CUSTOM_POLICY_VALUE}>Khác...</option>
                </select>
                {editForm.returnPolicy === CUSTOM_POLICY_VALUE ? (
                  <input
                    name="returnPolicyCustom"
                    value={editForm.returnPolicyCustom}
                    onChange={handleEditChange}
                    disabled={isEditing}
                    className={fieldBase}
                    placeholder="Nhập thời hạn đổi trả khác"
                  />
                ) : null}
                <FieldError message={editErrors.returnPolicyCustom} />
              </label>
            </div>
          </Section>
        </form>
      </AdminModal>

      <AdminModal
        open={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        title="Xóa sản phẩm"
        description="Thao tác này sẽ xóa sản phẩm khỏi danh sách quản trị."
        footer={deleteFooter}
      >
        <form id="admin-product-delete-form" className="space-y-4" onSubmit={handleDeleteSubmit}>
          {productToDelete ? (
            <div className="space-y-4 rounded-[24px] border border-rose-200 bg-rose-50 p-4">
              <div className="flex items-start gap-4">
                {productToDelete.image ? (
                  <img
                    src={productToDelete.image}
                    alt={productToDelete.name}
                    className="h-16 w-16 shrink-0 rounded-2xl border border-rose-200 object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-rose-200 bg-white text-xs font-semibold uppercase text-rose-500">
                    Không có ảnh
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-rose-900">{productToDelete.name}</p>
                  <p className="mt-1 text-sm leading-6 text-rose-700">SKU: {productToDelete.sku}</p>
                  <p className="mt-2 text-sm leading-6 text-rose-700">
                    Bạn đang xóa sản phẩm này khỏi danh sách quản trị. Với sản phẩm remote, hệ thống sẽ ghi nhận
                    trạng thái xóa cục bộ để F5 vẫn giữ nguyên.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {deleteError ? (
            <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800">
              {deleteError}
            </div>
          ) : null}
        </form>
      </AdminModal>
    </section>
  )
}
