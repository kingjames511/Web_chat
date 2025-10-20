import "./App.css";
import LandingPage from "./components/Home/LandingPage";
import Layout from "./components/layout";
import LoginPage from "./components/login";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import SignPage from "./components/Signup";
import { useUserStore } from "./store/store";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./components/lib/firebase";
import { Navigate } from "react-router-dom";
import { chatStore } from "./store/ChatStore";
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useUserStore();
  const { chatId } = chatStore();

  if (isLoading) {
    return <div>Loading...</div>; // Or your loading component
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  

  return <>{children}</>;
}

function App() {
  const { fetchUserInfo } = useUserStore();
  useEffect(() => {
    const unsubcrible = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserInfo(user.uid);
      }
    });
    return () => {
      unsubcrible();
    };
  }, [fetchUserInfo]);
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sign-in" element={<SignPage />} />

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
