import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginSignup from "./pages/LoginSignup";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthProvider";
import { ProblemProvider } from "./context/ProblemProvider";
import Question from "./pages/Question";
import ProblemSet from "./pages/ProblemSet";
import CreateMeeting from "./Interview/CreateMeeting";
import MeetingRoom from "./Interview/MeetingRoom";
import Whiteboard from "./Components/WhiteBoard";
import VideoPanel from "./Screens/VideoPanel";
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
              <Route path="/create-meeting" element={<CreateMeeting />} />
              <Route path="/room/:roomId" element={<MeetingRoom />} />
              <Route path="/video" element={<VideoPanel />} />
              <Route path="/whiteBoard" element={<Whiteboard />} />
              <Route path="/problemset/:id" element={<Question />} />
            </Routes>
          </ProblemProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
