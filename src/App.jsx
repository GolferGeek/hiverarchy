import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { InterestProvider } from './contexts/InterestContext'
import { ThemeProvider } from './components/ThemeProvider'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import CoderPage from './pages/CoderPage'
import GolferPage from './pages/GolferPage'
import MentorPage from './pages/MentorPage'
import AgingPage from './pages/AgingPage'
import ViewPost from './pages/ViewPost'
import CreatePost from './pages/CreatePost'
import EditPost from './pages/EditPost'
import ManageInterests from './pages/ManageInterests'

function App() {
  return (
    <AuthProvider>
      <InterestProvider>
        <ThemeProvider>
          <Router basename="/gg-blog">
            <Navbar />
            <main className="container">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/coder" element={<CoderPage />} />
                <Route path="/golfer" element={<GolferPage />} />
                <Route path="/mentor" element={<MentorPage />} />
                <Route path="/aging" element={<AgingPage />} />
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
              </Routes>
            </main>
          </Router>
        </ThemeProvider>
      </InterestProvider>
    </AuthProvider>
  )
}

export default App
