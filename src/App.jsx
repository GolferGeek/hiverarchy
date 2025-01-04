import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { InterestProvider } from './contexts/InterestContext'
import { ProfileProvider, useProfile } from './contexts/ProfileContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { AIProvider } from './services/ai/index.jsx'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Welcome from './components/Welcome'
import { lazy, Suspense } from 'react'
import './styles/global.css'

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
function RouteGuard({ children }) {
  const { username } = useParams()
  const location = useLocation()
  const { user } = useAuth()
  const { userProfile, loading: profileLoading } = useProfile()

  // Skip guard for special routes
  if (location.pathname === '/login' || 
      location.pathname === '/signup') {
    return children
  }

  // If we're still loading the profile, show loading state
  if (profileLoading) {
    return children
  }

  // If logged in and have profile, ensure we're on the user's URL
  if (user && userProfile?.username) {
    const pathParts = location.pathname.split('/').filter(Boolean)
    
    // If we're on root or login page, or if username doesn't match
    if (location.pathname === '/' || 
        location.pathname === '/login' || 
        pathParts[0] !== userProfile.username) {
      
      // Get the path after the username (if any)
      const remainingPath = pathParts.length > 1 ? `/${pathParts.slice(1).join('/')}` : ''
      
      // Construct new path with user's username
      const newPath = `/${userProfile.username}${remainingPath}`
      
      console.log('RouteGuard: Redirecting to:', newPath)
      return <Navigate to={newPath} replace />
    }
  }

  // If not logged in and on root, show welcome page
  if (!user && location.pathname === '/') {
    return children
  }

  // If we have a username in the URL, allow access
  if (username) {
    return children
  }

  // For any other case, show the children
  return children
}

function App() {
  return (
    <BrowserRouter future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true
    }}>
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
                        {/* Public routes - no username needed */}
                        <Route path="/" element={<Welcome />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<SignUp />} />
                        
                        {/* Username-based routes */}
                        <Route path="/:username">
                          <Route index element={<Home />} />
                          <Route path="resume" element={<Resume />} />
                          <Route path="post/:id" element={<ViewPost />} />
                          <Route path="interest/:interest" element={<InterestPage />} />
                          
                          {/* Protected routes */}
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

                        {/* Show welcome page for unknown routes */}
                        <Route path="*" element={<Welcome />} />
                      </Routes>
                    </Suspense>
                  </main>
                </RouteGuard>
              </AIProvider>
            </InterestProvider>
          </ProfileProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
