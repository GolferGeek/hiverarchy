import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useColorMode } from './ThemeProvider'
import { 
  AppBar, 
  Toolbar, 
  Button, 
  IconButton, 
  Box,
  useTheme 
} from '@mui/material'
import { Brightness4, Brightness7 } from '@mui/icons-material'

function Navbar() {
  const { user, signOut } = useAuth()
  const { toggleColorMode } = useColorMode()
  const theme = useTheme()

  const linkStyle = {
    textDecoration: 'none',
    color: theme.palette.mode === 'dark' ? '#fff' : 'inherit'
  }

  return (
    <AppBar position="sticky" color="default">
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Link to="/" style={linkStyle}>
          <Button color="inherit" sx={{ fontSize: '1.25rem' }}>
            GolferGeek
          </Button>
        </Link>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Link to="/coder" style={linkStyle}>
            <Button color="inherit">Coder</Button>
          </Link>
          <Link to="/golfer" style={linkStyle}>
            <Button color="inherit">Golfer</Button>
          </Link>
          <Link to="/mentor" style={linkStyle}>
            <Button color="inherit">Mentor</Button>
          </Link>
          <Link to="/aging" style={linkStyle}>
            <Button color="inherit">Aging</Button>
          </Link>

          <IconButton onClick={toggleColorMode} color="inherit">
            {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          {user ? (
            <>
              <Link to="/create" style={linkStyle}>
                <Button variant="contained" color="primary">
                  Create Post
                </Button>
              </Link>
              <Button 
                onClick={signOut} 
                color="inherit"
                variant="outlined"
                sx={{ color: theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Link to="/login" style={linkStyle}>
              <Button variant="contained" color="primary">
                Login
              </Button>
            </Link>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar 