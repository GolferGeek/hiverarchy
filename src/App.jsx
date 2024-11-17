import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { InterestProvider } from './contexts/InterestContext'
import { ThemeProvider } from './components/ThemeProvider'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import { lazy, Suspense } from 'react'

const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const SignUp = lazy(() => import('./pages/SignUp'))
const CoderPage = lazy(() => import('./pages/CoderPage'))
const GolferPage = lazy(() => import('./pages/GolferPage'))
const MentorPage = lazy(() => import('./pages/MentorPage'))
const AgingPage = lazy(() => import('./pages/AgingPage'))
const ViewPost = lazy(() => import('./pages/ViewPost'))
const CreatePost = lazy(() => import('./pages/CreatePost'))
const EditPost = lazy(() => import('./pages/EditPost'))
const ManageInterests = lazy(() => import('./pages/ManageInterests'))
const Resume = lazy(() => import('./pages/Resume'))

function App() {
  return (
    <AuthProvider>
      <InterestProvider>
        <ThemeProvider>
          <Router>
            <Navbar />
            <main className="container">
              <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/coder" element={<CoderPage />} />
                  <Route path="/golfer" element={<GolferPage />} />
                  <Route path="/mentor" element={<MentorPage />} />
                  <Route path="/older" element={<AgingPage />} />
                  <Route path="/post/:id" element={<ViewPost />} />
                  <Route
                    path="/create"
                    element={
                      <ProtectedRoute>
                        <CreatePost />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/edit/:id"
                    element={
                      <ProtectedRoute>
                        <EditPost />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/manage-interests"
                    element={
                      <ProtectedRoute>
                        <ManageInterests />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/resume" element={<Resume />} />
                </Routes>
              </Suspense>
            </main>
          </Router>
        </ThemeProvider>
      </InterestProvider>
    </AuthProvider>
  )
}

export default App
