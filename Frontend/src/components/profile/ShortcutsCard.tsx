import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Shortcut } from '@/types'

interface ShortcutsCardProps {
  shortcuts: (Shortcut | { name: string; color: string })[]
  onAddShortcut?: (name: string) => void
  onRemoveShortcut?: (id: string) => void
}

const defaultShortcuts = [
  { name: 'Art and drawing', color: 'from-orange-400 to-pink-400' },
  { name: 'Dribbble Pro', color: 'from-pink-400 to-red-400' },
  { name: 'Behance Creative', color: 'from-blue-400 to-cyan-400' },
  { name: 'One Piece Fan', color: 'from-yellow-400 to-orange-400' },
]

export const ShortcutsCard = ({
  shortcuts = [],
  onAddShortcut,
  onRemoveShortcut,
}: ShortcutsCardProps) => {
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')

  const handleAdd = () => {
    if (newName.trim()) {
      onAddShortcut?.(newName)
      setNewName('')
      setIsAdding(false)
    }
  }

  const displayShortcuts = shortcuts.length > 0 ? shortcuts : defaultShortcuts

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-dark-text">Your shortcuts</h3>
        <button className="text-primary-blue text-sm font-medium hover:underline">
          See all
        </button>
      </div>

      <div className="space-y-3">
        {displayShortcuts.map((shortcut, index) => (
          <div
            key={(shortcut as any).id || index}
            className="flex items-center gap-3 p-2 hover:bg-light-gray rounded-lg transition-colors group"
          >
            <div
              className={`w-10 h-10 rounded-full flex-shrink-0 bg-gradient-to-br ${
                defaultShortcuts[index]?.color || 'from-blue-400 to-blue-600'
              }`}
            />
            <span className="flex-1 text-sm text-dark-text">{shortcut.name}</span>
            {(shortcut as any).id && onRemoveShortcut && (
              <button
                onClick={() => onRemoveShortcut((shortcut as any).id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-secondary-text hover:text-red-500"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ))}

        {isAdding ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Shortcut name"
              className="flex-1 px-3 py-2 border border-border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
              autoFocus
            />
            <button
              onClick={handleAdd}
              className="btn-primary text-sm py-1 px-3"
            >
              Add
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center justify-center gap-2 p-2 text-primary-blue hover:bg-light-blue rounded-lg transition-colors"
          >
            <Plus size={18} />
            <span className="text-sm font-medium">Create shortcut</span>
          </button>
        )}
      </div>
    </div>
  )
}
