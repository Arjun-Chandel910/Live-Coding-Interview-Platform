import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginSignup from "./pages/LoginSignup";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthProvider";
import { ProblemProvider } from "./context/ProblemProvider";
import Question from "./pages/Question";
import ProblemSet from "./pages/ProblemSet";
import RoleAction from "./pages/Interview/RoleAction";
import { InterviewRoom } from "./pages/Interview/InterviewRoom";
function App() {
  return (
    <div>
      <ToastContainer autoClose={2500} draggable />
      <BrowserRouter>
        <AuthProvider>
          <ProblemProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginSignup />} />
              <Route path="/problemset" element={<ProblemSet />} />
              <Route path="/role" element={<RoleAction />} />
              <Route path="/interview/:id" element={<InterviewRoom />} />
              <Route path="/problemset/:id" element={<Question />} />
            </Routes>
          </ProblemProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
