import React from "react";
import Page from "./list/page";
import ChatPannel from "./Panel/ChatPannel";
import UserDetail from "./UserDetail/UserDetail";
const Layout = () => {
  return (
    <div className="flex">
      <Page />
      <ChatPannel />

      <UserDetail />
    </div>
  );
};

export default Layout;
