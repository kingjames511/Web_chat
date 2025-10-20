import { create } from 'zustand'
import { useUserStore } from './store'
interface chatStore {
   chatId: string
   User: any | null
    isCurrentUserBlocked: boolean,
    isRecieverBlocked: boolean,
    changeChat:(chatId : string, user : any) => void,
    changeBlockStatus: () => void,
}

export const chatStore = create<chatStore>((set) => ({
    chatId: '',
    User: null,
    isCurrentUserBlocked: false,
    isRecieverBlocked: false,
   

    //actions 
    changeChat: async (chatId : string, user :any)=> {
        const currentUser  = useUserStore.getState().currentUser


        //check if the current user is blocked
        if(user.blocked.includes(currentUser.id)){
            return set({
                chatId,
                User: null,
                isCurrentUserBlocked: true,
                isRecieverBlocked: false,
            })
        }
        //check if the reciever is blocked
       else if(currentUser.blocked.includes(user.id)){
            return set({
                chatId,
                User: user,
                isCurrentUserBlocked: false,
                isRecieverBlocked: true
            })
        }else {
            return set({
                chatId,
                User: user,
                isRecieverBlocked: false,
                isCurrentUserBlocked: false
            })
        }
    },
    changeBlockStatus: () => {
         set((state)=> ({ ...state, isRecieverBlocked: !state.isRecieverBlocked}))
    }
}))