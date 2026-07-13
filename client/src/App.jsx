import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Resume from "./pages/Resume";
import StartInterview from "./pages/StartInterview";
import MockInterview from "./pages/MockInterview";
import InterviewResult from "./pages/InterviewResult";
import InterviewHistory from "./pages/InterviewHistory";
import Bookmarks from "./pages/Bookmarks";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/resume"
        element={
          <ProtectedRoute>
            <Layout>
              <Resume />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview/start"
        element={
          <ProtectedRoute>
            <Layout>
              <StartInterview />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview/mock/:id"
        element={
          <ProtectedRoute>
            <MockInterview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview/result/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <InterviewResult />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview/history"
        element={
          <ProtectedRoute>
            <Layout>
              <InterviewHistory />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookmarks"
        element={
          <ProtectedRoute>
            <Layout>
              <Bookmarks />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
