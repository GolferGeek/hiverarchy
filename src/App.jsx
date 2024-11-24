import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { InterestProvider } from './contexts/InterestContext'
import { SiteProfileProvider } from './contexts/SiteProfileContext'
import { ThemeProvider } from './components/ThemeProvider'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import { AuthStateHandler } from './components/AuthStateHandler'
import { lazy, Suspense } from 'react'

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

function App() {
  const defaultUsername = import.meta.env.VITE_DEFAULT_USERNAME

  return (
    <AuthProvider>
      <Router>
        <ThemeProvider>
          <AuthStateHandler />
          <main className="container">
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route path="/" element={<Navigate to={`/${defaultUsername}`} replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route
                  path="/:username/*"
                  element={
                    <SiteProfileProvider>
                      <InterestProvider>
                        <Navbar />
                        <Routes>
                          <Route index element={<Home />} />
                          <Route path=":interest" element={<InterestPage />} />
                          <Route path="resume" element={<Resume />} />
                          <Route
                            path="manage/posts"
                            element={
                              <ProtectedRoute>
                                <Posts />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="create-post"
                            element={
                              <ProtectedRoute>
                                <CreatePost />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="edit/:id"
                            element={
                              <ProtectedRoute>
                                <EditPost />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="manage/interests"
                            element={
                              <ProtectedRoute>
                                <ManageInterests />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="manage/profile"
                            element={
                              <ProtectedRoute>
                                <UserProfile />
                              </ProtectedRoute>
                            }
                          />
                        </Routes>
                      </InterestProvider>
                    </SiteProfileProvider>
                  }
                />
                <Route path="/post/:id" element={<ViewPost />} />
              </Routes>
            </Suspense>
          </main>
        </ThemeProvider>
      </Router>
    </AuthProvider>
  )
}

export default App
