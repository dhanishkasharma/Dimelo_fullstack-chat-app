import {create} from "zustand";

import {axiosInstance} from "../lib/axios";
import toast from "react-hot-toast";
import {io} from "socket.io-client";
const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001"
    : import.meta.env.VITE_BACKEND_URL;

// In your main.jsx or App.jsx

export const useAuthStore=create((set,get)=>({
   authUser:null,
   isSigningUp:false,
   isLoggingIn:false,
   isUpdatingProfile:false,

   isCheckingAuth:true,
   onlineUsers:[],
   socket:null,

   checkAuth: async()=>{
    try{
        const res=await axiosInstance.get("/auth/check");
        set({authUser:res.data});
        get().connectSocket();
    }catch(error){
        console.error("Error checking authentication:", error);
        // If there's an error, we assume the user is not authenticated
       set({authUser:null});
    }finally{
         set({isCheckingAuth:false});
    }
   },

   signup:async(data)=>{
    set({isSigningUp:true});
    try{
    const res=await axiosInstance.post("/auth/signup",data);
     set({authUser:res.data});
    toast.success("Signup successful!");
    get().connectSocket();
   
    }catch(error){
       toast.error("Signup failed. Please try again.");
    }finally{
        set({isSigningUp:false});
    }
   },
   login:async(data)=>{
       set({isLoggingIn:true});
       try{
        const res=await axiosInstance.post("/auth/login",data);
        set({authUser:res.data});
        toast.success("Login successful!");
        get().connectSocket();
       }catch(error){
        console.error("Error during login:", error);
        toast.error("Login failed. Please check your credentials.");
       const message=  error?.response?.data?.message || "Login failed. Please check your credentials.";
       toast.error(message);

       }finally{
        set({isLoggingIn:false});
       }
   },
   logout:async()=>{
    try{
     await axiosInstance.post("/auth/logout");
     set({authUser:null});
        toast.success("Logged out successfully!");
        get().disconnectSocket();
    }catch(error){
        console.error("Error during logout:", error);
        toast.error("Logout failed. Please try again.");
    }
   },
   updateProfile:async(data)=>{
    set({isUpdatingProfile:true});
    try{
        const res=await axiosInstance.post("/auth/update-profile",data);
        set({authUser:res.data});
        toast.success("Profile updated successfully!");

    }catch(error){
        console.error("Error updating profile:", error);
        const message=error?.response?.data?.message || "Profile update failed. Please try again.";
        toast.error(message);

    }finally{
        set({isUpdatingProfile:false});
    }
   },

   connectSocket:()=>{
    const {authUser}=get();
    if(!authUser || get().socket?.connected) return;
    const socket=io(BASE_URL,{
       withCredentials: true,
        query:{
            userId:authUser._id,
        },
    });
    socket.connect();
    socket.on("getOnlineUsers",(userIds)=>{
        set({onlineUsers:userIds})
    })
    set({socket:socket});

   },
   disconnectSocket:()=>{
    if(get().socket?.connected) get().socket.disconnect();
   },
}));
