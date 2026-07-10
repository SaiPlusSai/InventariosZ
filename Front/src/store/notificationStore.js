import { create } from 'zustand'

export const useNotificationStore = create((set) => ({
  isOpen: false,
  type: 'info', // 'error' | 'warning' | 'info' | 'success'
  title: '',
  message: '',
  
  showNotification: (type, title, message) => set({
    isOpen: true,
    type,
    title,
    message
  }),
  
  hideNotification: () => set({
    isOpen: false,
    // We intentionally don't clear the message/type immediately 
    // to prevent jarring layout shifts while the modal animates out.
  })
}))
