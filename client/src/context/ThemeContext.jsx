import { createContext, useContext, useEffect, useState } from 'react'
import { getItem, setItem } from '../lib/safeStorage.js'

const ThemeContext = createContext(null)

export const useTheme = () => useContext(ThemeContext)

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const saved = getItem('theme')
    return saved ? saved === 'dark' : true // default dark
  })

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }
    setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
      {children}
    </ThemeContext.Provider>
  )
}
