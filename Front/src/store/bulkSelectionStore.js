import { create } from 'zustand'

export const useBulkSelectionStore = create((set, get) => ({
  selectedItems: new Map(), // Key: `${grupo_id}-${color_id}`, Value: { grupo_id, color_id }
  
  toggleItem: (grupoId, colorId) => {
    set((state) => {
      const newSelected = new Map(state.selectedItems)
      const key = `${grupoId}-${colorId}`
      
      if (newSelected.has(key)) {
        newSelected.delete(key)
      } else {
        newSelected.set(key, { grupo_id: grupoId, color_id: colorId })
      }
      
      return { selectedItems: newSelected }
    })
  },
  
  selectAll: (items) => {
    // items should be an array of { grupo_id, color_id }
    set(() => {
      const newSelected = new Map()
      items.forEach(item => {
        newSelected.set(`${item.grupo_id}-${item.color_id}`, item)
      })
      return { selectedItems: newSelected }
    })
  },
  
  clearSelection: () => {
    set({ selectedItems: new Map() })
  },
  
  isSelected: (grupoId, colorId) => {
    return get().selectedItems.has(`${grupoId}-${colorId}`)
  }
}))
