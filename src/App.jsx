import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { InterestProvider } from './contexts/InterestContext'
import { ProfileProvider, useProfile } from './contexts/ProfileContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { AIProvider } from './services/ai/index.jsx'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Welcome from './components/Welcome'
import DocumentHead from './components/DocumentHead'
import { lazy, Suspense, useEffect, useState } from 'react'
import './styles/global.css'
import { shouldShowWelcomePage, getRedirectPath, isValidPath, getEffectiveUsername, getDomain, getPort } from './utils/urlUtils'
import { supabase } from './lib/supabase'
import { Box, CircularProgress } from '@mui/material'

const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const SignUp = lazy(() => import('./pages/SignUp'))
const ViewPost = lazy(() => import('./pages/ViewPost'))
const CreatePost = lazy(() => import('./pages/CreatePost'))
const EditPost = lazy(() => import('./pages/EditPost'))
const ManageInterests = lazy(() => import('./pages/ManageInterests'))
const InterestPage = lazy(() => import('./components/InterestPage'))
const UserProfile = lazy(() => import('./pages/UserProfile'))
const Posts = lazy(() => import('./pages/Posts'))
const Resume = lazy(() => import('./pages/Resume'))
const PostWriter = lazy(() => import('./pages/PostWriter'))

// Route guard component to check for username
const RouteGuard = ({ children }) => {
  const { user } = useAuth()
  const { blogProfile, setBlogProfile, loading: profileLoading } = useProfile()
  const location = useLocation()
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(true)
  const [redirectTo, setRedirectTo] = useState(null)

  // Skip redirection for auth routes
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup'
  
  // Log route navigation to help with debugging
  useEffect(() => {
    // Check if we're on localhost:4021
    const isLocalHierarchy = window.location.host === 'localhost:4021'
    
    console.log('RouteGuard navigation:', { 
      pathname: location.pathname,
      isLocalHierarchy,
      user: user?.email,
      blogProfile: blogProfile?.username,
      params: location.pathname.split('/').filter(Boolean)
    })
  }, [location.pathname, user, blogProfile])

  useEffect(() => {
    const setupBlogProfile = async () => {
      try {
        // Only set blog profile if it's not already set
        if (!blogProfile) {
          const username = await getEffectiveUsername(null)
          console.log('Setting up blog profile for username:', username)
          
          if (username) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('username', username)
              .single()

            if (profile) {
              console.log('Found profile:', profile)
              setBlogProfile(profile)
            } else {
              console.log('No profile found for username:', username)
            }
          }
        }
      } catch (error) {
        console.error('Error in setupBlogProfile:', error)
      } finally {
        setIsProcessing(false)
      }
    }

    setupBlogProfile()
  }, [blogProfile, setBlogProfile])

  // Check redirection in a separate effect
  useEffect(() => {
    const checkRedirection = async () => {
      // Skip redirection for auth routes
      if (isAuthRoute) {
        setIsProcessing(false)
        return
      }

      if (!isProcessing && !profileLoading) {
        const redirectPath = await getRedirectPath(location.pathname, blogProfile)
        console.log('Checking redirection:', { 
          currentPath: location.pathname, 
          redirectPath,
          blogProfile: blogProfile?.username
        })
        
        // Only redirect if:
        // 1. We have a redirect path
        // 2. The redirect path is different from current path
        // 3. We're not already in the process of redirecting
        if (redirectPath && redirectPath !== location.pathname && !redirectTo) {
          console.log(`Redirecting from ${location.pathname} to ${redirectPath}`)
          setRedirectTo(redirectPath)
        }
      }
    }

    checkRedirection()
  }, [location.pathname, blogProfile, isProcessing, profileLoading, isAuthRoute, redirectTo])

  // Handle navigation in useEffect, not during render
  useEffect(() => {
    // Only handle redirection if we have a redirect path and we're not on an auth route
    if (redirectTo && !isAuthRoute) {
      // Check for circular redirections
      if (redirectTo === location.pathname) {
        console.log('Prevented circular redirection to:', redirectTo)
        // Clear redirectTo to prevent further attempts
        setRedirectTo(null)
      } else {
        console.log('Navigating to:', redirectTo)
        navigate(redirectTo, { replace: true })
        // Clear redirectTo after navigation
        setRedirectTo(null)
      }
    }
    
    // Handle protected route redirections
    const isProtectedRoute = location.pathname.includes('/manage/') || 
                            location.pathname.includes('/create') || 
                            location.pathname.includes('/edit/') ||
                            location.pathname.includes('/writer/')
                          
    if (isProtectedRoute && !user && !isAuthRoute && !redirectTo) {
      console.log('Protected route access denied, redirecting to login')
      // Pass the current location as state so we can redirect back after login
      navigate('/login', { 
        replace: true,
        state: { from: location.pathname }
      })
    }
  }, [redirectTo, isAuthRoute, location.pathname, user, navigate, location])
// Show loading state while processing or waiting for profile
if ((isProcessing || profileLoading) && !isAuthRoute) {
  console.log('RouteGuard loading:', { isProcessing, profileLoading })
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <CircularProgress />
    </Box>
  )
}

// Return children without conditional navigation in render phase
return children
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <ProfileProvider>
            <InterestProvider>
              <AIProvider>
                <DocumentHead />
                <Suspense fallback={<div>Loading...</div>}>
                  <Routes>
                    {/* Auth routes - outside RouteGuard */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />

                    {/* All other routes - inside RouteGuard */}
                    <Route path="*" element={
                      <RouteGuard>
                        <>
                          <Navbar />
                          <main className="container">
                            <Routes>
                              {/* Root route */}
                              <Route path="/" element={
                                shouldShowWelcomePage() ? 
                                  <Welcome /> : 
                                  <Home />
                              } />
                              
                              {/* Direct routes (no username) */}
                              <Route path="/resume" element={<Resume />} />
                              <Route path="/post/:id" element={<ViewPost />} />
                              <Route path="/interest/:interest" element={<InterestPage />} />
                              <Route path="/create" element={
                                <ProtectedRoute>
                                  <CreatePost />
                                </ProtectedRoute>
                              } />
                              <Route path="/edit/:id" element={
                                <ProtectedRoute>
                                  <EditPost />
                                </ProtectedRoute>
                              } />
                              <Route path="/writer/:id" element={
                                <ProtectedRoute>
                                  <PostWriter />
                                </ProtectedRoute>
                              } />
                              <Route path="/manage/interests" element={
                                <ProtectedRoute>
                                  <ManageInterests />
                                </ProtectedRoute>
                              } />
                              <Route path="/manage/profile" element={
                                <ProtectedRoute>
                                  <UserProfile />
                                </ProtectedRoute>
                              } />
                              <Route path="/manage/posts" element={
                                <ProtectedRoute>
                                  <Posts />
                                </ProtectedRoute>
                              } />
                              
                              {/* Username prefixed routes (for hiverarchy.com) */}
                              <Route path="/:username">
                                <Route index element={<Home />} />
                                <Route path="resume" element={<Resume />} />
                                <Route path="post/:id" element={<ViewPost />} />
                                <Route path="interest/:interest" element={<InterestPage />} />
                                <Route path="create" element={
                                  <ProtectedRoute>
                                    <CreatePost />
                                  </ProtectedRoute>
                                } />
                                <Route path="edit/:id" element={
                                  <ProtectedRoute>
                                    <EditPost />
                                  </ProtectedRoute>
                                } />
                                <Route path="writer/:id" element={
                                  <ProtectedRoute>
                                    <PostWriter />
                                  </ProtectedRoute>
                                } />
                                <Route path="manage/interests" element={
                                  <ProtectedRoute>
                                    <ManageInterests />
                                  </ProtectedRoute>
                                } />
                                <Route path="manage/profile" element={
                                  <ProtectedRoute>
                                    <UserProfile />
                                  </ProtectedRoute>
                                } />
                                <Route path="manage/posts" element={
                                  <ProtectedRoute>
                                    <Posts />
                                  </ProtectedRoute>
                                } />
                              </Route>
                            </Routes>
                          </main>
                        </>
                      </RouteGuard>
                    } />
                  </Routes>
                </Suspense>
              </AIProvider>
            </InterestProvider>
          </ProfileProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
