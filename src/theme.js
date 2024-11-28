import { alpha } from '@mui/material/styles'

const baseTheme = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.01562em',
      marginBottom: '1rem',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.00833em',
      marginBottom: '0.875rem',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '0em',
      marginBottom: '0.75rem',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '0.00735em',
      marginBottom: '0.625rem',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '0em',
      marginBottom: '0.5rem',
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      letterSpacing: '0.0075em',
      marginBottom: '0.5rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 8,
  },
}

// Autumn color palette
const autumnColors = {
  russet: '#8B4513', // Deep brown
  maple: '#D2691E',  // Warm orange-brown
  harvest: '#CD853F', // Golden brown
  sage: '#556B2F',   // Deep olive green
  wheat: '#F5DEB3',  // Light warm beige
  auburn: '#A0522D', // Rich reddish-brown
}

export const lightTheme = {
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: {
      main: autumnColors.sage,
      light: '#6B8E23', // Lighter sage
      dark: '#3B4A1F',  // Darker sage
      contrastText: '#fff',
    },
    secondary: {
      main: autumnColors.maple,
      light: '#FF7F50', // Lighter orange-brown
      dark: '#8B4513', // Darker brown
      contrastText: '#fff',
    },
    background: {
      default: '#FAF9F6', // Warm off-white
      paper: '#FFFFFF',
    },
    text: {
      primary: autumnColors.russet,
      secondary: autumnColors.harvest,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px 0 rgba(139, 69, 19, 0.05)',
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '8px 20px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px 0 rgba(139, 69, 19, 0.2)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: autumnColors.sage,
        },
      },
    },
  },
}

export const darkTheme = {
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: autumnColors.maple,
      light: '#FF7F50', // Lighter orange-brown
      dark: '#8B4513', // Darker brown
      contrastText: '#fff',
    },
    secondary: {
      main: autumnColors.harvest,
      light: '#DEB887', // Lighter golden brown
      dark: '#8B5A2B', // Darker golden brown
      contrastText: '#fff',
    },
    background: {
      default: '#2C1810', // Deep brown background
      paper: '#3D2317', // Slightly lighter brown
    },
    text: {
      primary: autumnColors.wheat,
      secondary: alpha(autumnColors.wheat, 0.7),
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px 0 rgba(0,0,0,0.2)',
          borderRadius: 12,
          backgroundColor: '#3D2317',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '8px 20px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.3)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#2C1810',
        },
      },
    },
  },
}