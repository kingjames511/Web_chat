import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { useUserStore } from "../../store/store";
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { chatStore } from "../../store/ChatStore";

const ChatList = () => {
  const { currentUser } = useUserStore();
  const { changeChat } = chatStore();
  const [chats, setChat] = useState<any[]>([]); // Fixed: Changed from "" to []

  useEffect(() => {
    const subscribe = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        // Added async here
        const data = res.data();
        if (!data || !data.chats) {
          console.log("no chats found");
          setChat([]);
          return;
        }
        const items = data.chats;
        const promises = items.map(async (item: any) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);
          const user = userDocSnap.data(); // Fixed: Changed from userDocRef to userDocSnap
          return { ...item, user };
        });

        const chatData = await Promise.all(promises); // Fixed: Changed from promises.all to Promise.all and added await
        console.log(chatData);
        setChat(chatData.sort((a: any, b: any) => b.updatedAt - a.updatedAt));
      }
    );
    return () => {
      subscribe();
    };
  }, [currentUser.id]);

  const handleSelectChat = (chat: any) => {
    changeChat(chat.chatId, chat.user);
  };

  return (
    <section className="mx-4 px-4 w-full">
      <div className="space-y-1">
        {chats.map((chat: any) => (
          <div
            key={chat.id}
            onClick={() => handleSelectChat(chat)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-900/50 cursor-pointer transition-colors border-b border-slate-700/30"
          >
            <img
              src={chat.user.avatar || "./avatar.png"}
              className="w-12 h-12 rounded-full"
              alt=""
            />

            <div className="flex flex-col">
              <h3 className="font-medium text-sm">{chat.user.username}</h3>
              <p className="text-xs text-gray-400">{chat.lastMessage}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ChatList;
