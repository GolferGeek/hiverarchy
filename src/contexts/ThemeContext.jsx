import { createContext, useContext, useState, useMemo, useEffect } from 'react'
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material'
import { createTheme } from '@mui/material/styles'
import { lightTheme, darkTheme } from '../theme'

const ColorModeContext = createContext({ toggleColorMode: () => {}, toggleAutoMode: () => {}, mode: 'light', isAuto: false })

export function useColorMode() {
  return useContext(ColorModeContext)
}

export function ThemeProvider({ children }) {
  const storedMode = localStorage.getItem('colorMode')
  const storedAuto = localStorage.getItem('autoMode') === 'true'
  
  const [mode, setMode] = useState(storedMode || 'light')
  const [isAuto, setIsAuto] = useState(storedAuto || true) // Default to auto mode
  const [systemPreference, setSystemPreference] = useState('light')

  // Initialize and handle system preference
  useEffect(() => {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemPreference(prefersDarkMode.matches ? 'dark' : 'light')

    const handleChange = (e) => {
      setSystemPreference(e.matches ? 'dark' : 'light')
    }

    prefersDarkMode.addEventListener('change', handleChange)
    return () => prefersDarkMode.removeEventListener('change', handleChange)
  }, [])

  // Update mode based on system preference when auto mode is enabled
  useEffect(() => {
    if (isAuto) {
      setMode(systemPreference)
    }
  }, [isAuto, systemPreference])

  // Persist settings
  useEffect(() => {
    localStorage.setItem('colorMode', mode)
    localStorage.setItem('autoMode', isAuto.toString())
    document.documentElement.setAttribute('data-theme', mode)
  }, [mode, isAuto])

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        if (!isAuto) {
          setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))
        }
      },
      toggleAutoMode: () => {
        setIsAuto(prev => !prev)
      },
      mode,
      isAuto,
    }),
    [mode, isAuto]
  )

  const theme = useMemo(
    () => createTheme(mode === 'light' ? lightTheme : darkTheme),
    [mode]
  )

  return (
    <ColorModeContext.Provider value={colorMode}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ColorModeContext.Provider>
  )
} 