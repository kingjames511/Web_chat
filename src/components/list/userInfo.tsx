import { useUserStore } from "../../store/store";
import { useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
  arrayUnion,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";

const UserInfo = () => {
  const { currentUser } = useUserStore();
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", searchQuery.trim()));
      const querySnapshot = await getDocs(q);

      console.log("Query:", searchQuery.trim());
      console.log("Results count:", querySnapshot.size);

      const results: any[] = [];
      querySnapshot.forEach((doc) => {
        console.log("Found user:", doc.id, doc.data());
        if (doc.id !== currentUser.id) {
          results.push({ id: doc.id, ...doc.data() });
        }
      });

      setSearchResults(results);
      console.log("Final results:", results);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleAddUser = async (user: any) => {
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");

    try {
      const newChatRef = doc(chatRef);
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        message: [],
      });

      await updateDoc(doc(userChatsRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });
      await updateDoc(doc(userChatsRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: Date.now(),
        }),
      });
      console.log("successfully");
    } catch (error) {}
    console.log("Adding user:", user);
    // Close modal after adding
    setShowModal(false);
    setSearchQuery("");
    setSearchResults([]);
  };
  console.log(searchResults, "here");

  return (
    <section className="mx-4 px-4 w-full relative">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <img src="./avatar.png" className="w-10 h-10 rounded-full" alt="" />
          <h2 className="text-lg font-medium">{currentUser.username}</h2>
        </div>
        <div className="flex gap-4">
          <img src="./more.png" alt="" className="w-5 h-5 cursor-pointer" />
          <img src="./video.png" alt="" className="w-5 h-5 cursor-pointer" />
          <img src="./edit.png" alt="" className="w-5 h-5 cursor-pointer" />
        </div>
      </div>

      {/* the search bar container */}
      <div className="flex gap-3 items-center mb-6">
        <div className="flex items-center gap-3 flex-[2] p-3 bg-slate-900/75 rounded-lg">
          <img src="./search.png" className="w-5 h-5" alt="" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none border-none w-full text-sm"
          />
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-slate-900/75 p-3 rounded-lg hover:bg-slate-800/75 transition-colors"
        >
          <img src="./plus.png" className="w-5 h-5" alt="" />
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-96 max-w-[90%]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add User to Chat</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {/* Search Bar */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by username..."
                className="flex-1 px-4 py-2 bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                onClick={handleSearch}
                disabled={searching}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {searching ? "..." : "Search"}
              </button>
            </div>

            {/* Search Results */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {searchResults.length === 0 && !searching && searchQuery && (
                <p className="text-center text-gray-400 py-4">No users found</p>
              )}

              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar || "./avatar.png"}
                      className="w-10 h-10 rounded-full"
                      alt=""
                    />
                    <div>
                      <h4 className="font-medium text-sm">{user.username}</h4>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddUser(user)}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default UserInfo;
