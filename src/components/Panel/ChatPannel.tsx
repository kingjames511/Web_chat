import {
    arrayUnion,
    doc,
    getDoc,
    onSnapshot,
    updateDoc,
    type DocumentData,
} from "firebase/firestore";

import {useEffect, useRef, useCallback, useMemo} from "react";
import { db } from "../lib/firebase";
import { useState } from "react";
import { chatStore } from "../../store/ChatStore";
import { useUserStore } from "../../store/store";
import {uploadImage} from "../utlis/upload";
import {ArrowLeft} from "lucide-react";

const ChatPanel = ({onBack, showBackButton}: { onBack?: () => void; showBackButton: boolean }) => {
    const {chatId, User} = chatStore();
    const {currentUser} = useUserStore();
    const [text, setText] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [chats, setChat] = useState<DocumentData | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Refs for auto-scrolling
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (chats?.message?.length) {
            messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
        }
    }, [chats?.message?.length]);

    useEffect(() => {
        if (!chatId) return;

        const subscribe = onSnapshot(
            doc(db, "chats", chatId),
            (res) => {
                setChat(res.data() ?? null);
            },
            (error) => {
                console.error("Error fetching chat:", error);
            }
        );

        return () => {
            subscribe();
        };
    }, [chatId]);

    // Cleanup image preview URL on unmount or when file changes
    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFile = e.target.files?.[0];

            if (!selectedFile) return;

            // Validate file type
            if (!selectedFile.type.startsWith("image/")) {
                alert("Please select an image file");
                return;
            }

            // Validate file size (10MB limit)
            const maxSize = 10 * 1024 * 1024;
            if (selectedFile.size > maxSize) {
                alert("Image must be less than 10MB");
                return;
            }

            // Revoke previous preview URL to avoid memory leaks
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }

            setFile(selectedFile);
            const previewUrl = URL.createObjectURL(selectedFile);
            setImagePreview(previewUrl);

            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        },
        [imagePreview]
    );

    const handleRemoveImage = useCallback(() => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
        setFile(null);
        setImagePreview("");
        setUploadProgress(0);
    }, [imagePreview]);

    const handleSend = useCallback(async () => {
        if (!text.trim() && !file) return;
        if (isSending) return;

        setIsSending(true);
        const messageText = text.trim();

        try {
            let imageUrl = null;

            // Upload image if present
            if (file) {
                setUploadProgress(50);
                imageUrl = await uploadImage(file);
                setUploadProgress(100);
            }

            // Add message to chat
            await updateDoc(doc(db, "chats", chatId), {
                message: arrayUnion({
                    senderId: currentUser.id,
                    text: messageText,
                    createdAt: Date.now(),
                    ...(imageUrl && {img: imageUrl}),
                }),
            });

            // Update user chats metadata
            const UserIDs = [currentUser.id, User.id];

            await Promise.all(
                UserIDs.map(async (uid) => {
                    const userChatsRef = doc(db, "userchats", uid);
                    const userChatsSnapShot = await getDoc(userChatsRef);

                    if (userChatsSnapShot.exists()) {
                        const userchatsData = userChatsSnapShot.data();
                        const chatIndex = userchatsData.chats.findIndex(
                            (chat: any) => chat.chatId === chatId
                        );

                        if (chatIndex !== -1) {
                            userchatsData.chats[chatIndex].lastMessage =
                                messageText || "Image";
                            userchatsData.chats[chatIndex].isSeen = uid === currentUser.id;
                            userchatsData.chats[chatIndex].updatedAt = Date.now();

                            await updateDoc(userChatsRef, {
                                chats: userchatsData.chats,
                            });
                        }
                    }
                })
            );

            // Clear input and image preview
            setText("");
            handleRemoveImage();
        } catch (err) {
            console.error("Error sending message:", err);
            alert("Failed to send message. Please try again.");
        } finally {
            setIsSending(false);
            setUploadProgress(0);
        }
    }, [
        text,
        file,
        isSending,
        chatId,
        currentUser?.id,
        User?.id,
        handleRemoveImage
    ]);

    // Handle Enter key to send
    const handleKeyPress = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        },
        [handleSend]
    );

    // Memoize messages to avoid unnecessary re-renders
    const messages = useMemo(() => chats?.message || [], [chats?.message]);

    return (
        <div className="flex flex-col h-screen w-full">
            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(24, 24, 27, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(63, 63, 70, 0.6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(82, 82, 91, 0.8);
        }
      `}</style>
            {/* Header */}
            <div
                className="flex items-center justify-between px-4 py-3 backdrop-blur-0 ">
                <div className="flex items-center gap-3">
                    {showBackButton && <button onClick={onBack}><ArrowLeft size={18}/></button>}
                    <span className="text-zinc-400 text-sm font-medium">To:</span>
                    <h2 className="text-white text-base capitalize font-medium">{User?.username || "Select a chat"}</h2>
                </div>
                <button className="p-2 hover:bg-zinc-800/50 rounded-lg transition-colors">
                    <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                </button>
            </div>

            {/* Date Divider */}
            {chatId && messages.length > 0 && (
                <div className="flex justify-center py-4">
                    <div className="b backdrop-blur-sm px-4 py-1.5 rounded-full">
                        <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Recents</span>
                    </div>
                </div>
            )}

            {/* Messages Container */}
            <div
                ref={messagesContainerRef}
                className="flex-1 custom-scrollbar overflow-y-auto px-4 py-4 space-y-4 scroll-smooth"

            >
                {!chatId ? (
                    <div className="flex items-center justify-center h-full text-zinc-500">
                        <div className="text-center">
                            <svg className="w-16 h-16 mx-auto mb-4 text-zinc-600" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                            </svg>
                            <p className="text-sm">Select a chat to start messaging</p>
                        </div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-zinc-500">
                        <p className="text-sm">No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((message: any, index: number) => {
                        const isOwn = currentUser.id === message.senderId;
                        return (
                            <div
                                key={`${message.createdAt}-${index}`}
                                className={`flex gap-3 ${isOwn ? "flex-row-reverse" : "flex-row"} items-end`}
                            >
                                {/* Avatar */}
                                {!isOwn && (
                                    <img
                                        src={User?.avatar || "./avatar.png"}
                                        alt="Avatar"
                                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                    />
                                )}

                                {/* Message Content */}
                                <div
                                    className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[75%] sm:max-w-[60%]`}>
                                    {message.img && (
                                        <div className="mb-2">
                                            <img
                                                src={message.img}
                                                alt="Shared image"
                                                className="rounded-2xl w-full object-cover max-h-64 shadow-lg"
                                                loading="lazy"
                                            />
                                        </div>
                                    )}
                                    {message.text && (
                                        <div
                                            className={`px-4 py-2.5 rounded-2xl shadow-md ${
                                                isOwn
                                                    ? "bg-slate-700 text-white rounded-br-sm"
                                                    : "bg-zinc-800/80 backdrop-blur-sm text-white rounded-bl-sm"
                                            }`}
                                        >
                                            <p className="text-sm leading-relaxed break-words">{message.text}</p>
                                        </div>
                                    )}
                                    <span className="text-xs text-zinc-500 mt-1 px-1">
                    {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                  </span>
                                </div>


                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef}/>
            </div>
            {/* Image Preview */}
            {imagePreview && (
                <div className="px-4 pb-2">
                    <div className="relative inline-block">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-h-32 rounded-xl object-cover shadow-lg"
                        />
                        <button
                            onClick={handleRemoveImage}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 shadow-lg"
                            disabled={isSending}
                        >
                            ×
                        </button>
                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <div
                                className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-700 rounded-b-xl overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 transition-all duration-300"
                                    style={{width: `${uploadProgress}%`}}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 backdrop-blur-sm border-t border-zinc-800/50">
                <div className="flex items-center gap-2">
                    {/* Add Attachment */}
                    <button className="p-2 hover:bg-zinc-800/50 rounded-lg transition-colors">
                        <label htmlFor="file-image" className="cursor-pointer">
                            <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                            </svg>
                            <input
                                ref={fileInputRef}
                                type="file"
                                id="file-image"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                                disabled={isSending}
                            />
                        </label>
                    </button>

                    {/* Input Field */}
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Type something..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isSending}
                            className="w-full  backdrop-blur-sm text-black text-xl placeholder-zinc-500 px-4 py-2 rounded-lg outline-none border border-zinc-700/50 focus:border-zinc-600 transition-colors disabled:opacity-50"
                        />
                    </div>

                    {/* Send Button */}
                    <button
                        onClick={handleSend}
                        disabled={isSending || (!text.trim() && !file)}
                        className="bg-green-900/50 hover:bg-green-900 text-white px-5 py-2.5 rounded-lg text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-lg"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatPanel;