import { Mail, Lock, Loader } from "lucide-react";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/store";
import { useEffect } from "react";
export default function SignPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { fetchUserInfo, currentUser } = useUserStore();

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate("/home");
    } else {
      console.log(currentUser);
    }
  }, [currentUser, navigate]);
  const handleSignIn = async () => {
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      await fetchUserInfo(res.user.uid);
      navigate("/home");
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
    console.log(email, password);
  };
  console.log(currentUser);

  return (
      <div className="flex justify-center items-center h-full  text-white">
          <div className='flex justify-between  items-center h-screen w-[80%]'>
      {/* Left Section - Login Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-12 md:px-20">
        <div className="mb-12 ">
          <div className="items-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-full">
              <img
                src="./avatar.png"
                alt=""
                className="w-full h-full rounded-full"
              />
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-2">Sign In</h1>
        </div>

        <div className="space-y-6">
          {/* Email Input */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-transparent border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="w-full bg-transparent border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Sign In Button */}
          <button
            onClick={handleSignIn}
            className="w-full bg-transparent border border-gray-700 hover:border-white text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? <Loader /> : "login in"}
          </button>
        </div>

        {/* Sign Up Link */}
        <div className="mt-6">
          <p className="text-sm text-gray-400">
            dont have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-white hover:text-gray-300"
            >
              SiGIN UP
            </button>
          </p>
        </div>
      </div>

      {/* Right Section - Image/Content */}
              <div className="hidden md:flex md:w-1/2 h-full items-center justify-center p-12 relative overflow-hidden">
        <div className="text-center z-10">
          <h2 className="text-3xl font-light mb-4 leading-relaxed">
            A new way to experience real estate
            <br />
            in the infinite virtual space.
          </h2>
          <button className="text-sm uppercase tracking-wider border-b border-white pb-1 inline-block hover:opacity-80 transition-opacity">
            Learn More
          </button>
        </div>

        {/* Decorative Pattern */}
                  <div className="absolute right-0 top-60 w-96 h-96">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute border-2 border-gray-600"
              style={{
                width: `${(i + 1) * 30}px`,
                height: `${(i + 1) * 30}px`,
                bottom: "10%",
                right: "10%",
                transform: "rotate(45deg)",
                borderRadius: "8px",
              }}
            ></div>
          ))}
        </div>
      </div>
          </div>
    </div>
  );
}
