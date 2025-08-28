import React from "react";
import { useNavigate } from "react-router-dom";
import { ParallaxProvider } from "react-scroll-parallax";
import { useAuth } from "../context/AuthProvider";

function LandingPage() {
  const { authtoken, setAuthtoken, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <ParallaxProvider>
      <div className="min-h-screen flex flex-col justify-between bg-white text-black font-sans">
        {/* NAVBAR */}
        <nav className="w-full flex justify-between items-center px-8 py-4 border-b border-gray-200 shadow-sm">
          <h1 className="text-xl font-bold">CodeCrush</h1>
          <div className="space-x-4">
            <button className="hover:underline">Features</button>
            <button
              onClick={() => navigate("/problemset")}
              className="hover:underline"
            >
              Practice
            </button>
            <button
              className="hover:underline"
              onClick={() => navigate("/create-meeting")}
            >
              Start Interview
            </button>

            {/* Show Login or Logout depending on token */}
            {!authtoken ? (
              <button
                onClick={() => navigate("/login")}
                className="hover:underline"
              >
                Login
              </button>
            ) : (
              <button onClick={logout} className="hover:underline">
                Logout
              </button>
            )}
          </div>
        </nav>

        {/* MAIN CONTENT */}
        <main className="flex-grow">
          {/* HERO SECTION */}
          <section className="text-center py-16 px-6">
            <h2 className="text-3xl font-bold mb-4">
              Master Coding. Ace Interviews.
            </h2>
            <p className="text-gray-700 mb-6">
              Practice coding problems, get real-time feedback, and crack top
              tech interviews with ease.
            </p>
            <div className="space-x-4">
              <button className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800">
                Start Practicing
              </button>
              <button className="px-4 py-2 border border-black rounded hover:bg-gray-100">
                Book Mock Interview
              </button>
            </div>
          </section>

          {/* FEATURES SECTION */}
          <section className="py-16 px-6 grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Live Coding",
                desc: "Practice with an in-browser editor powered by Monaco and real-time code execution.",
              },
              {
                title: "Interview Mode",
                desc: "Join interview sessions with shared IDE, video chat, and hidden test cases.",
              },
              {
                title: "Smart Feedback",
                desc: "Get insights on time complexity, edge case handling and more with Judge0.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="border border-gray-200 p-6 rounded-lg shadow-sm"
              >
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </section>

          {/* CTA SECTION */}
          <section className="text-center py-20 px-6">
            <h3 className="text-2xl font-semibold mb-4">
              Ready to become a coding beast?
            </h3>
            <p className="text-gray-700 mb-6">
              Start solving real-world problems and prepare for your next big
              interview — now.
            </p>
            <button className="px-6 py-3 bg-black text-white rounded hover:bg-gray-800">
              Get Started
            </button>
          </section>
        </main>

        {/* FOOTER */}
        <footer className="w-full text-center py-6 text-sm text-gray-500 border-t border-gray-200">
          &copy; {new Date().getFullYear()} CodeCrush. All rights reserved.
        </footer>
      </div>
    </ParallaxProvider>
  );
}

export default LandingPage;
