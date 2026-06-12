import { create } from 'zustand'

export const useHomeStore = create((set) => ({
  selectedBrand: 'Apple',
  setSelectedBrand: (selectedBrand) => set({ selectedBrand }),
  isCategoryMenuOpen: false,
  openCategoryMenu: () => set({ isCategoryMenuOpen: true }),
  closeCategoryMenu: () => set({ isCategoryMenuOpen: false }),
  toggleCategoryMenu: () => set((state) => ({ isCategoryMenuOpen: !state.isCategoryMenuOpen })),
}))
