import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";

import { useEffect } from "react";
import { db } from "../lib/firebase";
import { useState } from "react";
import { chatStore } from "../../store/ChatStore";
import { useUserStore } from "../../store/store";

const ChatPanel = () => {
  const { chatId, User } = chatStore();
  const { currentUser } = useUserStore();
  const [text, setText] = useState<string>("");
  const [chats, setChat] = useState<DocumentData | null>(null);
  useEffect(() => {
    if (!chatId) return;
    const subscribe = onSnapshot(doc(db, "chats", chatId), (res) => {
      return setChat(res.data() ?? null);
    });
    return () => {
      subscribe();
    };
  }, [chatId]);

  const handleSend = async () => {
    if (!chatId) {
      console.warn("No chat selected. Can't send message.");
      return;
    }
    console.log("Sending message:", text);
    try {
      await updateDoc(doc(db, "chats", chatId), {
        message: arrayUnion({
          senderId: "currentUser.id",
          text,
          createdAt: Date.now(),
        }),
      });
      const UserIDs = [currentUser.id, User.id];
      UserIDs.forEach(async (uid) => {
        const userChatsRef = doc(db, "userchats", uid);
        const userChatsSnapShot = await getDoc(userChatsRef);

        if (userChatsSnapShot.exists()) {
          const userchatsData = userChatsSnapShot.data();

          const chatIndex = userchatsData.chats.findIndex(
            (chat: any) => chat.chatId === chatId
          );
          (userchatsData.chats[chatIndex].lastMessage = text),
            (userchatsData.chats[chatIndex].isSeen =
              uid === currentUser.id ? true : false),
            (userchatsData.chats[chatIndex].updatedAt = Date.now());

          await updateDoc(userChatsRef, {
            chats: userchatsData.chats,
          });
        }
      });
    } catch (err) {
      console.log(err);
    } finally {
      console.log("message sent");
      setText("");
    }
  };

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
        {chatId &&
          chats?.message?.map((message: any) => (
            <div
              key={message.id}
              className={`flex flex-col ${
                message.text ? "items-end" : "items-start"
              }`}
            >
              {message.text && (
                <div
                  className={`max-w-md p-3 rounded-lg ${
                    message.text
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800/75 text-white"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              )}
              {message.img && (
                <div className="max-w-md">
                  <img src={message.img} alt="" className="rounded-lg w-full" />
                </div>
              )}
              {/* <span className="text-xs text-gray-400 mt-1">{message.time}</span> */}
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
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 bg-slate-900/75 p-3 rounded-lg outline-none border-none text-sm"
          />
          <button className="bg-blue-600 p-3 rounded-lg hover:bg-blue-700 transition-colors">
            <img src="./emoji.png" alt="" className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleSend()}
            className="bg-blue-600 p-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </section>
  );
};

export default ChatPanel;
