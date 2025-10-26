
import ChatPannel from "./Panel/ChatPannel";
import Chatlist from "./list/chatlist.tsx";
import {useEffect, useState} from "react";
import {chatStore} from "../store/ChatStore.ts";


const Layout = () => {
    const [showChat, setShowChat] = useState(false);
    const {chatId} = chatStore()
    useEffect(() => {
        if (chatId && window.innerWidth < 768) {
            setShowChat(true);
        }
    }, [chatId]);

    const handleBackToList = () => {
        setShowChat(false);
    };
    return (
        <section className='flex justify-center items-center w-full'>
            <div className="flex   justify-center items-center w-[80%] overflow-hidden">
                <div className={`
        w-full md:w-96 lg:w-[400px] h-full overflow-y-auto overflow-x-hidden
        ${showChat ? 'hidden md:block' : 'block'}
      `}>
                    <Chatlist onChatSelect={() => setShowChat(true)}/>
                </div>

                {/* ChatPanel - Full screen on mobile, partial on desktop */}
                <div className={`
        flex-1 h-full overflow-hidden
        ${showChat ? 'block' : 'hidden md:block'}
      `}>
                    <ChatPannel onBack={handleBackToList} showBackButton={showChat}/>
                </div>

    </div>
        </section>
  );
};

export default Layout;
