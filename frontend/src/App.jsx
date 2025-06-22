import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginSignup from "./pages/LoginSignup";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthProvider";
function App() {
  return (
    <div>
      <ToastContainer autoClose={2500} draggable />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginSignup />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
