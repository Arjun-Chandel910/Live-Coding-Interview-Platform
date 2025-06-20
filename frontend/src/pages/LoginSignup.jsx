import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import GoogleIcon from "@mui/icons-material/Google";

function LoginSignup() {
  const [isLogin, setIsLogin] = useState(true);

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => console.log(tokenResponse),
    redirect_uri: "http://localhost:5173",
  });

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-2xl shadow-lg">
        {/* Toggle Buttons */}
        <div className="flex justify-center mb-6">
          <button
            className={`px-4 py-2 text-sm font-semibold rounded-l-full ${
              isLogin ? "bg-white text-black" : "bg-gray-800 text-white"
            }`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`px-4 py-2 text-sm font-semibold rounded-r-full ${
              !isLogin ? "bg-white text-black" : "bg-gray-800 text-white"
            }`}
            onClick={() => setIsLogin(false)}
          >
            Signup
          </button>
        </div>

        {/* Form */}
        <form className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm mb-1">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-md outline-none focus:ring-2 focus:ring-white"
              />
            </div>
          )}
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-3 py-2 bg-gray-800 text-white rounded-md outline-none focus:ring-2 focus:ring-white"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-gray-800 text-white rounded-md outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm mb-1">Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-md outline-none focus:ring-2 focus:ring-white"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-4 bg-white text-black py-2 rounded-md font-semibold hover:bg-gray-300 transition"
          >
            {isLogin ? "Login" : "Signup"}
          </button>
        </form>

        {/* Google Login */}
        <div
          onClick={login}
          className="w-full mt-4 bg-white text-black flex items-center justify-center gap-2 py-2 rounded-md font-semibold cursor-pointer hover:bg-gray-300 transition"
        >
          <GoogleIcon />
          Sign in with Google
        </div>
      </div>
    </div>
  );
}

export default LoginSignup;
