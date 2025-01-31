import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { InterestProvider } from './contexts/InterestContext'
import { ProfileProvider, useProfile } from './contexts/ProfileContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { AIProvider } from './services/ai/index.jsx'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Welcome from './components/Welcome'
import { lazy, Suspense, useEffect, useState } from 'react'
import './styles/global.css'
import { shouldShowWelcomePage, getRedirectPath, isValidPath, getEffectiveUsername } from './utils/urlUtils'
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
  const [isProcessing, setIsProcessing] = useState(true)
  const [redirectTo, setRedirectTo] = useState(null)

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
      if (!isProcessing && !profileLoading) {
        const redirectPath = await getRedirectPath(location.pathname, blogProfile)
        console.log('Checking redirection:', { 
          currentPath: location.pathname, 
          redirectPath,
          blogProfile: blogProfile?.username
        })
        setRedirectTo(redirectPath)
      }
    }

    checkRedirection()
  }, [location.pathname, blogProfile, isProcessing, profileLoading])

  // Show loading state while processing or waiting for profile
  if (isProcessing || profileLoading) {
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

  // Handle redirection
  if (redirectTo) {
    console.log('Redirecting to:', redirectTo)
    return <Navigate to={redirectTo} replace />
  }

  // For protected routes, check user authentication
  const isProtectedRoute = location.pathname.includes('/manage/') || 
                          location.pathname.includes('/create') || 
                          location.pathname.includes('/edit/') ||
                          location.pathname.includes('/writer/')

  if (isProtectedRoute && !user) {
    console.log('Protected route access denied')
    return <Navigate to="/" replace />
  }

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
                <RouteGuard>
                  <Navbar />
                  <main className="container">
                    <Suspense fallback={<div>Loading...</div>}>
                      <Routes>
                        {/* Root route */}
                        <Route path="/" element={
                          shouldShowWelcomePage() ? 
                            <Welcome /> : 
                            <Home />
                        } />

                        {/* Auth routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<SignUp />} />
                        
                        {/* Direct routes (no username) */}
                        <Route path="/home" element={<Home />} />
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

                        {/* Catch-all route */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </Suspense>
                  </main>
                </RouteGuard>
              </AIProvider>
            </InterestProvider>
          </ProfileProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
