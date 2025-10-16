import { Mail, Lock, Loader, User } from "lucide-react";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./lib/firebase";
import { uploadImage } from "./utlis/upload";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const seletedFile = e.target.files?.[0];

    if (!seletedFile?.type.startsWith("image/")) {
      setMessage("please make sure you seletected a picture");
      return;
    }
    if (seletedFile.size > 10 * 1024 * 1024) {
      setMessage("must be less than 10mb");
      return;
    }

    setFile(seletedFile);
    setMessage("");
  };
  const HandleUpload = async () => {
    if (!file) {
      toast.warn("please select file");
      return;
    }
    setUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      if (imageUrl) {
        setUrl(imageUrl);
        setMessage("done uploading");
        console.log("upload done", imageUrl);
      } else {
        setMessage("error");
        console.log("error");
      }
    } catch (error) {
      console.log("upload fail,", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const data = {
        username,
        email,
        avatar: url,
        id: res.user.uid,
        blocked: [],
      };
      const dataChat = {
        chat: [],
      };
      await setDoc(doc(db, "users", res.user.uid), data);

      await setDoc(doc(db, "userchats", res.user.uid), dataChat);

      navigate("/sign-in");
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
    console.log(email, password);
  };

  return (
    <div className="flex h-[90vh] bg-black text-white">
      {/* Left Section - Login Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-12 md:px-20">
        <div className="mb-12 flex justify-between">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-full">
              <img
                src={url ? url : "./avatar.png"}
                alt=""
                className="w-full h-full rounded-full"
              />
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-2">Sign In</h1>
        </div>

        <div className="space-y-6">
          {/* username input */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full bg-transparent border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

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

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Profile picture
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                placeholder="Enter your email"
                className="w-full bg-transparent border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Sign In Button */}
          <div className="w-full flex justify-between items-center gap-3">
            <button
              onClick={handleSignIn}
              className="w-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? <Loader /> : "SiGIN Up"}
            </button>
            <button
              onClick={HandleUpload}
              className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {uploading ? <Loader /> : "Upload pic"}
            </button>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="mt-6">
          <p className="text-sm text-gray-400">
            Already have an account?{" "}
            <button className="text-white hover:text-gray-300">SiGIN</button>
          </p>
        </div>
      </div>

      {/* Right Section - Image/Content */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-gray-800 to-gray-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="text-center z-10">
          <h2 className="text-3xl font-light mb-4 leading-relaxed">
            A new way to experience real Discussion
            <br />
            in the infinite virtual space.
          </h2>
          <button className="text-sm uppercase tracking-wider border-b border-white pb-1 inline-block hover:opacity-80 transition-opacity">
            Learn More
          </button>
        </div>

        {/* Decorative Pattern */}
        <div className="absolute right-0 bottom-0 w-96 h-96">
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
  );
}
