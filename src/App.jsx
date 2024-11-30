import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { InterestProvider } from './contexts/InterestContext'
import { ProfileProvider } from './contexts/ProfileContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { AIProvider } from './services/ai/index.jsx'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
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
  const defaultUsername = import.meta.env.VITE_DEFAULT_USERNAME

  // Skip redirect for login and signup routes
  if (location.pathname === '/login' || 
      location.pathname === '/signup' || 
      location.pathname === '/') {
    return children
  }

  // Check if the path already starts with a username
  const pathParts = location.pathname.split('/').filter(Boolean)
  if (pathParts[0] === defaultUsername) {
    return children
  }

  // If we're not in a username route and not in a special route, redirect
  if (!username && !location.pathname.startsWith(`/${defaultUsername}`)) {
    const newPath = `/${defaultUsername}${location.pathname}`
    console.log('Redirecting to:', newPath)
    return <Navigate to={newPath} replace />
  }

  return children
}

function App() {
  const defaultUsername = import.meta.env.VITE_DEFAULT_USERNAME

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
                        {/* Redirect root to default username */}
                        <Route path="/" element={<Navigate to={`/${defaultUsername}`} replace />} />
                        
                        {/* Auth routes - no username needed */}
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

                        {/* Catch all route - redirect to default username */}
                        <Route path="*" element={<Navigate to={`/${defaultUsername}`} replace />} />
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
