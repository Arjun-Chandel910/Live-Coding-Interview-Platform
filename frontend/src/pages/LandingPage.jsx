import React from "react";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-10 py-6 shadow-md border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white tracking-wide">
          CodeCrush
        </h1>
        <div className="space-x-6">
          <button className="hover:text-gray-400">Features</button>
          <button className="hover:text-gray-400">Practice</button>
          <button className="hover:text-gray-400">Interview</button>
          <button
            className="hover:text-gray-400"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="text-center py-32 px-6 md:px-0">
        <h2 className="text-5xl font-extrabold mb-6 leading-tight">
          Master Coding. Ace Interviews.
        </h2>
        <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
          Practice coding problems, get real-time feedback, and crack top tech
          interviews with ease.
        </p>
        <div className="space-x-4">
          <button className="bg-white text-black px-6 py-3 font-semibold rounded-full hover:bg-gray-300 transition duration-300">
            Start Practicing
          </button>
          <button className="border border-white px-6 py-3 font-semibold rounded-full hover:bg-gray-700 transition duration-300">
            Book Mock Interview
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10">
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
              className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700"
            >
              <h3 className="text-xl font-bold mb-4">{item.title}</h3>
              <p className="text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="text-center py-28 px-4">
        <h3 className="text-3xl font-bold mb-6">
          Ready to become a coding beast?
        </h3>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Start solving real-world problems and prepare for your next big
          interview — now.
        </p>
        <button className="bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-gray-300 transition">
          Get Started
        </button>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-10 text-gray-500 text-sm border-t border-gray-700">
        &copy; {new Date().getFullYear()} CodeCrush. All rights reserved.
      </footer>
    </div>
  );
}

export default LandingPage;
