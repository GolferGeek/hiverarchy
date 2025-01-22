import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { InterestProvider } from './contexts/InterestContext'
import { ProfileProvider, useProfile } from './contexts/ProfileContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { AIProvider } from './services/ai/index.jsx'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Welcome from './components/Welcome'
import { lazy, Suspense, useEffect } from 'react'
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
const RouteGuard = ({ children }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()

  useEffect(() => {
    // Allow public routes: welcome page, login, signup, and viewing user blogs
    const publicPaths = ['/', '/login', '/signup']
    const isPublicPath = publicPaths.includes(location.pathname) || 
                        location.pathname.match(/^\/[^/]+$/) || // User's blog home
                        location.pathname.match(/^\/[^/]+\/post\/[^/]+$/) || // Viewing a post
                        location.pathname.match(/^\/[^/]+\/interest\/[^/]+$/) || // Interest page
                        location.pathname.match(/^\/[^/]+\/resume$/) // Resume page

    if (!user && !isPublicPath) {
      navigate('/')
    }
  }, [user, location, navigate])

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
                        <Route path="/welcome" element={<Welcome />} />
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
