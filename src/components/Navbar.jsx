import { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useInterests } from '../contexts/InterestContext'
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Button,
  MenuItem,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'

function Navbar() {
  const [anchorElNav, setAnchorElNav] = useState(null)
  const { user, signOut } = useAuth()
  const { interests, loading } = useInterests()

  useEffect(() => {
    console.log('Navbar interests:', interests)
  }, [interests])

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget)
  }

  const handleCloseNavMenu = () => {
    setAnchorElNav(null)
  }

  if (loading) {
    console.log('Navbar loading...')
    return null
  }

  if (!interests || interests.length === 0) {
    console.log('No interests available')
  }

  return (
    <AppBar position="static" sx={{ backgroundColor: 'primary.main' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Desktop Logo */}
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'white',
              textDecoration: 'none',
              flexGrow: 0,
            }}
          >
            GolferGeek
          </Typography>

          {/* Mobile Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {interests?.map((interest) => (
                <MenuItem 
                  key={interest.id} 
                  onClick={handleCloseNavMenu}
                  component={RouterLink}
                  to={interest.route_path}
                  sx={{ color: 'text.primary' }}
                >
                  <Typography textAlign="center">{interest.title}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Mobile Logo */}
          <Typography
            variant="h5"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 700,
              color: 'white',
              textDecoration: 'none',
            }}
          >
            GolferGeek
          </Typography>

          {/* Desktop Menu */}
          <Box sx={{ 
            flexGrow: 1, 
            display: { xs: 'none', md: 'flex' },
            justifyContent: 'center',
            gap: 2
          }}>
            {interests?.map((interest) => (
              <Button
                key={interest.id}
                component={RouterLink}
                to={interest.route_path}
                onClick={handleCloseNavMenu}
                sx={{ 
                  color: 'white', 
                  textTransform: 'none',
                  fontSize: '1rem',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                {interest.title}
              </Button>
            ))}
          </Box>

          {/* Auth Buttons */}
          <Box sx={{ flexGrow: 0, ml: 2 }}>
            {user ? (
              <>
                <Button
                  component={RouterLink}
                  to="/manage-interests"
                  sx={{ 
                    color: 'white',
                    mr: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                  variant="outlined"
                >
                  Manage Interests
                </Button>
                <Button
                  component={RouterLink}
                  to="/create"
                  sx={{ 
                    color: 'white',
                    mr: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                  variant="outlined"
                >
                  Create Post
                </Button>
                <Button
                  onClick={signOut}
                  sx={{ 
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                  variant="outlined"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  component={RouterLink}
                  to="/login"
                  sx={{ 
                    color: 'white',
                    mr: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                  variant="outlined"
                >
                  Login
                </Button>
                <Button
                  component={RouterLink}
                  to="/signup"
                  sx={{ 
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                  variant="outlined"
                >
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default Navbar