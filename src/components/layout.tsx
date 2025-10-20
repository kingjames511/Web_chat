import React from "react";
import Page from "./list/page";
import ChatPannel from "./Panel/ChatPannel";
import UserDetail from "./UserDetail/UserDetail";
import { chatStore } from "../store/ChatStore";

const Layout = () => {
  const { chatId } = chatStore();
  return (
    <div className="flex">
      <Page />
      <ChatPannel />

      <UserDetail />
    </div>
  );
};

export default Layout;
