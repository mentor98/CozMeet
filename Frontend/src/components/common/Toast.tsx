import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  onClose?: () => void
}

export const Toast = ({ message, type = 'info', duration = 3000, onClose }: ToastProps) => {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!visible) return null

  const bgColor = {
    success: 'bg-green-100 border-green-300',
    error: 'bg-red-100 border-red-300',
    info: 'bg-blue-100 border-blue-300',
  }[type]

  const textColor = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800',
  }[type]

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} border rounded-lg p-4 flex items-center gap-2 z-50`}>
      <span className={textColor}>{message}</span>
      <button
        onClick={() => setVisible(false)}
        className="text-gray-500 hover:text-gray-700"
      >
        <X size={16} />
      </button>
    </div>
  )
}
