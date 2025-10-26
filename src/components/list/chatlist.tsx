import {
    doc,
    getDoc,
    onSnapshot,
    updateDoc,
    collection,
    query,
    where,
    getDocs,
    setDoc,
    serverTimestamp,
    arrayUnion
} from "firebase/firestore";
import { useUserStore } from "../../store/store";
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { chatStore } from "../../store/ChatStore";

const ChatList = ({onChatSelect}: { onChatSelect?: () => void }) => {
    const {currentUser} = useUserStore();
    const {changeChat} = chatStore();
    const [chats, setChat] = useState<any[]>([]);
    const [showMenu, setShowMenu] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        const subscribe = onSnapshot(
            doc(db, "userchats", currentUser?.id),
            async (res) => {
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
                    const user = userDocSnap.data();
                    return {...item, user};
                });

                const chatData = await Promise.all(promises);
                console.log(chatData);
                setChat(chatData.sort((a: any, b: any) => b.updatedAt - a.updatedAt));
            }
        );
        return () => {
            subscribe();
        };
    }, [currentUser?.id]);

    const handleSelectChat = async (chat: any) => {
        const userchats = chats.map((item) => {
            const {user, ...rest} = item;
            return rest;
        });
        const chatIndex = userchats.findIndex(
            (item) => item.chatId === chat.chatId
        );

        userchats[chatIndex].seen = true;

        const userChatsRef = doc(db, "userchats", currentUser.id);
        try {
            await updateDoc(userChatsRef, {
                chats: userchats,
            });
            changeChat(chat.chatId, chat.user);

            if (onChatSelect) {
                onChatSelect()
            }
        } catch (err) {
            console.log(err);
        }


    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setSearching(true);
        try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("username", "==", searchQuery.trim()));
            const querySnapshot = await getDocs(q);

            const results: any[] = [];
            querySnapshot.forEach((doc) => {
                if (doc.id !== currentUser.id) {
                    results.push({id: doc.id, ...doc.data()});
                }
            });

            setSearchResults(results);
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
                messages: [],
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
            console.log("Chat created successfully");
        } catch (error) {
            console.error("Error adding user:", error);
        }

        setShowModal(false);
        setSearchQuery("");
        setSearchResults([]);
        setShowMenu(false);
    };

    return (
        <div className="w-full max-w-md min-h-screen  border-r border-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-800 rounded flex items-center justify-center">
                        <svg className="w-5 h-5 " fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                        </svg>
                    </div>
                    <h1 className="text-white text-lg font-semibold">{currentUser.username}</h1>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 hover:bg-zinc-800 rounded transition-colors"
                    >
                        <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M4 6h16M4 12h16M4 18h16"/>
                        </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {showMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowMenu(false)}
                            />
                            <div
                                className="absolute right-0 top-full mt-2 w-48 bg-zinc-800 rounded-lg shadow-lg z-20 border border-zinc-700">
                                <button
                                    onClick={() => {
                                        setShowModal(true);
                                        setShowMenu(false);
                                    }}
                                    className="w-full px-4 py-3 text-left text-white hover:bg-zinc-700 rounded-lg transition-colors flex items-center gap-3"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M12 4v16m8-8H4"/>
                                    </svg>
                                    Add New Friend
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Search Bar */}
            <div className="px-4 py-3 border-b border-zinc-800">
                <div className="w-full h-1 bg-zinc-700 rounded"></div>
            </div>

            {/* Recent Chats Header */}
            <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span className="text-zinc-500 text-sm font-medium uppercase tracking-wide">Recent Chats</span>
                    <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded-full font-medium">
            {chats.length}
          </span>
                </div>
                <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
            </div>

            {/* Chat List */}
            <div className="px-4">
                {chats.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500">
                        <p className="text-sm">No chats yet</p>
                        <p className="text-xs mt-1">Add a friend to start chatting</p>
                    </div>
                ) : (
                    chats.map((chat, index) => (
                        <div
                            key={chat.chatId}
                            onClick={() => handleSelectChat(chat)}
                            className={`flex items-center gap-3 py-3 cursor-pointer hover:bg-zinc-800/30 transition-colors ${
                                index !== chats.length - 1 ? 'border-b border-zinc-800/50' : ''
                            }`}
                        >
                            {/* Avatar with online status */}
                            <div className="relative flex-shrink-0">
                                <img
                                    src={chat.user?.avatar || "./avatar.png"}
                                    className="w-12 h-12 rounded-full object-cover"
                                    alt={chat.user?.username}
                                />
                                <div
                                    className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-900 bg-green-500"></div>
                            </div>

                            {/* Chat Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-white text-sm font-medium truncate">
                                        {chat.user?.username}
                                    </h3>
                                    <div className="w-2 h-2 rounded-full flex-shrink-0 bg-green-500"></div>
                                </div>
                                <p className="text-zinc-500 text-xs mt-0.5 truncate">
                                    {chat.lastMessage || "No messages yet"}
                                </p>
                            </div>

                            {/* Time and Unread Badge */}
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-zinc-500 text-xs">
                  {chat.updatedAt ? new Date(chat.updatedAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                  }) : ''}
                </span>
                                {!chat.seen && chat.lastMessage && (
                                    <div
                                        className="bg-emerald-500 text-white text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center">
                                        1
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Bottom Indicator */}
            <div className="flex justify-center py-4">
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div>
                </div>
            </div>

            {/* Add Friend Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-zinc-800 rounded-lg p-6 w-96 max-w-[90%]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-white">Add New Friend</h3>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setSearchQuery("");
                                    setSearchResults([]);
                                }}
                                className="text-zinc-400 hover:text-white text-2xl"
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
                                className="flex-1 px-4 py-2 bg-zinc-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                            <button
                                onClick={handleSearch}
                                disabled={searching}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 text-white"
                            >
                                {searching ? "..." : "Search"}
                            </button>
                        </div>

                        {/* Search Results */}
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {searchResults.length === 0 && !searching && searchQuery && (
                                <p className="text-center text-zinc-400 py-4">No users found</p>
                            )}

                            {searchResults.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between p-3 bg-zinc-700/50 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={user.avatar || "./avatar.png"}
                                            className="w-10 h-10 rounded-full"
                                            alt=""
                                        />
                                        <div>
                                            <h4 className="font-medium text-sm text-white">{user.username}</h4>
                                            <p className="text-xs text-zinc-400">{user.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAddUser(user)}
                                        className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors text-white"
                                    >
                                        Add
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatList;