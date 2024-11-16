import { createContext, useContext, useState, useMemo, useEffect } from 'react'
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

const ColorModeContext = createContext({ toggleColorMode: () => {} })

export function ThemeProvider({ children }) {
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
  const [mode, setMode] = useState(prefersDarkMode ? 'dark' : 'light')

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      setMode(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))
      },
    }),
    []
  )

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === 'light' ? '#7c7157' : '#a39778',
            dark: mode === 'light' ? '#5c543f' : '#887e60',
            light: mode === 'light' ? '#9b8f6e' : '#c4b99c',
          },
          secondary: {
            main: mode === 'light' ? '#6b705c' : '#8b917d',
          },
          background: {
            default: mode === 'light' ? '#f8f7f4' : '#2a2826',
            paper: mode === 'light' ? '#ffffff' : '#353230',
          },
          text: {
            primary: mode === 'light' ? '#433f38' : '#e6e2d9',
            secondary: mode === 'light' ? '#6b6661' : '#b5b0a8',
          },
          error: {
            main: mode === 'light' ? '#b56b65' : '#c88d88',
          },
          warning: {
            main: mode === 'light' ? '#c4a256' : '#d4b87c',
          },
          success: {
            main: mode === 'light' ? '#7c9176' : '#96aa90',
          },
          divider: mode === 'light' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.06)',
        },
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: mode === 'light' ? '#ffffff' : '#353230',
                color: mode === 'light' ? '#433f38' : '#e6e2d9',
                boxShadow: mode === 'light' 
                  ? '0 1px 3px rgba(0,0,0,0.05)' 
                  : '0 1px 3px rgba(0,0,0,0.2)',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                boxShadow: 'none',
                ':hover': {
                  boxShadow: 'none',
                },
              },
              contained: {
                backgroundColor: mode === 'light' ? '#7c7157' : '#a39778',
                '&:hover': {
                  backgroundColor: mode === 'light' ? '#5c543f' : '#887e60',
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                boxShadow: mode === 'light' 
                  ? '0 1px 3px rgba(0,0,0,0.05)' 
                  : '0 1px 3px rgba(0,0,0,0.2)',
                border: mode === 'light' 
                  ? '1px solid rgba(0,0,0,0.05)' 
                  : '1px solid rgba(255,255,255,0.05)',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
        },
        typography: {
          h1: {
            color: mode === 'light' ? '#433f38' : '#e6e2d9',
          },
          h2: {
            color: mode === 'light' ? '#433f38' : '#e6e2d9',
          },
          h3: {
            color: mode === 'light' ? '#433f38' : '#e6e2d9',
          },
          h4: {
            color: mode === 'light' ? '#433f38' : '#e6e2d9',
          },
          h5: {
            color: mode === 'light' ? '#433f38' : '#e6e2d9',
          },
          h6: {
            color: mode === 'light' ? '#433f38' : '#e6e2d9',
          },
          body1: {
            color: mode === 'light' ? '#57534a' : '#d5d0c8',
          },
          body2: {
            color: mode === 'light' ? '#6b6661' : '#b5b0a8',
          },
        },
      }),
    [mode]
  )

  return (
    <ColorModeContext.Provider value={colorMode}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ColorModeContext.Provider>
  )
}

export const useColorMode = () => {
  return useContext(ColorModeContext)
} 