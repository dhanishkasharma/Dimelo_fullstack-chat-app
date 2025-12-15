import {create} from 'zustand';
import {toast} from 'react-hot-toast';
import {axiosInstance} from "../lib/axios";
import {useAuthStore} from "./useAuthStore";

export const useChatStore = create((set,get) => ({
    messages:[],
    users:[],
    selectedUser:null,
    isUsersLoading:false,
    isMessageLoading:false,




    getUsers:async()=>{
        set({isUsersLoading:true});
        try {
            const res = await axiosInstance.get('/messages/users');
            set({users: res.data});
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users.');
        } finally {
            set({isUsersLoading:false});
        }
    },
    getMessages:async (user)=>{
        set({isMessageLoading:true});
        try {
            const res = await axiosInstance.get(`/messages/${user._id}`);
            set({messages: res.data, selectedUser: user});
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Failed to load messages.');
        } finally {
            set({isMessageLoading:false});
        }
    },
    sendMessage: async (messageData) => {
  const { selectedUser, messages } = get();

  try {
    const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData); // ✅ Pass messageData
    set({ messages: [...messages, res.data] });
  } catch (error) {
    console.error("Send message error:", error);
    toast.error(error?.response?.data?.message || "Failed to send message");
  }
},
   subscribeToMessages:()=>{
     const {selectedUser}=get();
     if(!selectedUser) return;
     const socket=useAuthStore.getState().socket;
       if (!socket) return;

     socket.on("newMessage",(newMessage)=>{
        if(newMessage.senderId !== selectedUser._id) return;
        set({
            messages:[...get().messages,newMessage],
        });
     });

   },
   unsubscribeFromMessages:()=>{
    const socket=useAuthStore.getState().socket;
       if (!socket) return;
    socket.off("newMessage");
   },

    setSelectedUser: (selectedUser)=>set({selectedUser}),


}));
