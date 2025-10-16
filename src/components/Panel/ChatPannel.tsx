import { doc, onSnapshot } from "firebase/firestore";

import { useEffect } from "react";
import { db } from "../lib/firebase";
import { useState } from "react";

const ChatPanel = () => {
  const [chats, setChat] = useState(null);
  useEffect(() => {
    const subscribe = onSnapshot(
      doc(db, "chats", "jYFC967SCAcSRwQ1W6jF"),
      (res) => {
        setChat(res.data());
      }
    );
    return () => {
      subscribe();
    };
  }, []);
  const messages = [
    {
      id: 1,
      text: "Quam.",
      time: "1 min ago",
      isOwn: false,
    },
    {
      id: 2,
      text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus quis quae qui! Sint asperiores vero nobis deserunt vitae, repellendus, optio impedit alus reprehenderit dolorum nihil magnam alias, odit quam.",
      time: "1 min ago",
      isOwn: true,
    },
    {
      id: 3,
      text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus quis quae qui! Sint asperiores vero nobis deserunt vitae, repellendus, optio impedit alus reprehenderit dolorum nihil magnam alias, odit quam.",
      time: "1 min ago",
      isOwn: false,
    },
    {
      id: 4,
      image: "./photo.jpg",
      time: "1 min ago",
      isOwn: true,
    },
  ];

  return (
    <section className="flex-[2] h-[90vh] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-slate-700/30">
        <div className="flex items-center gap-3">
          <img src="./avatar.png" className="w-10 h-10 rounded-full" alt="" />
          <div>
            <h2 className="font-medium">Jane Doe</h2>
            <p className="text-xs text-gray-400">
              Lorem ipsum dolor sit amet...
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <img src="./phone.png" alt="" className="w-5 h-5 cursor-pointer" />
          <img src="./video.png" alt="" className="w-5 h-5 cursor-pointer" />
          <img src="./info.png" alt="" className="w-5 h-5 cursor-pointer" />
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${
              message.isOwn ? "items-end" : "items-start"
            }`}
          >
            {message.text && (
              <div
                className={`max-w-md p-3 rounded-lg ${
                  message.isOwn
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800/75 text-white"
                }`}
              >
                <p className="text-sm">{message.text}</p>
              </div>
            )}
            {message.image && (
              <div className="max-w-md">
                <img src={message.image} alt="" className="rounded-lg w-full" />
              </div>
            )}
            <span className="text-xs text-gray-400 mt-1">{message.time}</span>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-700/30">
        <div className="flex items-center gap-3">
          <button className="p-2">
            <img src="./img.png" alt="" className="w-5 h-5" />
          </button>
          <button className="p-2">
            <img src="./camera.png" alt="" className="w-5 h-5" />
          </button>
          <button className="p-2">
            <img src="./mic.png" alt="" className="w-5 h-5" />
          </button>
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 bg-slate-900/75 p-3 rounded-lg outline-none border-none text-sm"
          />
          <button className="bg-blue-600 p-3 rounded-lg hover:bg-blue-700 transition-colors">
            <img src="./emoji.png" alt="" className="w-5 h-5" />
          </button>
          <button className="bg-blue-600 p-3 rounded-lg hover:bg-blue-700 transition-colors">
            Send
          </button>
        </div>
      </div>
    </section>
  );
};

export default ChatPanel;
