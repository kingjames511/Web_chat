import UserInfo from "./userInfo";
import ChatList from "./chatlist";
import React from "react";

const Page = () => {
  return (
    <div className="flex-1 w-full">
      <UserInfo />
      <ChatList />
    </div>
  );
};

export default Page;
