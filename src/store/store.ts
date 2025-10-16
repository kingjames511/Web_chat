import { doc, getDoc } from 'firebase/firestore'
import { create } from 'zustand'
import { db } from '../components/lib/firebase'

interface UserStore {
    currentUser: any | null
    isLoading: boolean
    fetchUserInfo: (uid: string) => Promise<void>
}

export const useUserStore = create<UserStore>((set) => ({
    currentUser: null,
    isLoading: false,
    fetchUserInfo: async (uid: string) => {
        if (!uid) return set({ currentUser: null, isLoading: false })
        
        set({ isLoading: true }) // Set loading state at the start

        try {
            const docRef = doc(db, 'users', uid);
            const docSnap = await getDoc(docRef)
            
            if (docSnap.exists()) {
                set({ currentUser: docSnap.data(), isLoading: false })
                console.log('docs are here')
            } else {
                set({ currentUser: null, isLoading: false })
                console.log('no docs')
            }
        } catch (err) {
            console.log(err)
            set({ currentUser: null, isLoading: false })
        }
    }
}))