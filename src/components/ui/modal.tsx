import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: string
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
}: ModalProps) {
  const [shouldRender, setShouldRender] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      document.body.style.overflow = 'hidden'
      setTimeout(() => setIsAnimating(true), 10) // Small delay for animation
    } else {
      setIsAnimating(false)
      setTimeout(() => {
        setShouldRender(false)
        document.body.style.overflow = 'unset'
      }, 300) // Match transition duration
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!shouldRender) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isAnimating ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-lg shadow-xl w-full ${maxWidth} max-h-[95vh] overflow-hidden transition-all duration-300 ${
          isAnimating
            ? 'transform scale-100 opacity-100'
            : 'transform scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          {children}
        </div>
      </div>
    </div>
  )
}
