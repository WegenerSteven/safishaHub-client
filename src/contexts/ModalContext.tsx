import React, { createContext, useContext, useState } from 'react'

interface ModalContextType {
  isLoginOpen: boolean
  isRegisterOpen: boolean
  isAuthOpen: boolean
  openLogin: () => void
  openRegister: () => void
  openAuth: () => void
  closeLogin: () => void
  closeRegister: () => void
  closeAuth: () => void
  closeAll: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function useModal() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)

  const openLogin = () => {
    setIsRegisterOpen(false)
    setIsLoginOpen(true)
  }

  const openRegister = () => {
    setIsLoginOpen(false)
    setIsRegisterOpen(true)
  }

  const openAuth = () => {
    setIsLoginOpen(true)
  }

  const closeLogin = () => setIsLoginOpen(false)
  const closeRegister = () => setIsRegisterOpen(false)
  const closeAuth = () => {
    setIsLoginOpen(false)
    setIsRegisterOpen(false)
  }
  const closeAll = () => {
    setIsLoginOpen(false)
    setIsRegisterOpen(false)
  }

  const isAuthOpen = isLoginOpen || isRegisterOpen

  return (
    <ModalContext.Provider
      value={{
        isLoginOpen,
        isRegisterOpen,
        isAuthOpen,
        openLogin,
        openRegister,
        openAuth,
        closeLogin,
        closeRegister,
        closeAuth,
        closeAll,
      }}
    >
      {children}
    </ModalContext.Provider>
  )
}
