import { useEffect, useState } from "react";
import { Button, Spinner, Toast } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import { auth, provider } from "../../firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import axios from "axios";
import {  HiExclamation } from "react-icons/hi";
import React from "react";

const apiUrl = import.meta.env.VITE_API_URL;

export const Login: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [showToast, setShowToast] = useState(false);

  const navigate = useNavigate(); // Use the useNavigate hook

  useEffect(() => {
    setLoading(false);
    if(sessionStorage.getItem("google_uid")){
      navigate("/dashboard");
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="text-center">
        <Spinner aria-label="Extra large spinner example" size="xl" />
      </div>
    );
  }

  const signIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log(result.user.email);
      console.log(result.user.displayName);
      console.log(result.user.uid);
      const userResponse = await axios.get(`${apiUrl}/public/users/${result.user.uid}`);
      if (userResponse.data.message === 'User not found') {
        const response = await axios.post(`${apiUrl}/public/users/create`, {
          name: result.user.displayName,
          email: result.user.email,
          google_uid:result.user.uid,
        });
        if (response.data.status === 'OK') {
          sessionStorage.setItem("google_uid", result.user.uid);
          navigate("/dashboard");
        }else{
          setShowToast(true);
        }
      }else{
        if (userResponse.data.farm && userResponse.data.farm.uid) {
          sessionStorage.setItem("farm_uid", userResponse.data.farm.uid);
        }
        sessionStorage.setItem("google_uid", userResponse.data.googleuid);
        navigate("/dashboard");
      }
    } catch(error) {
      console.error(error);
    }
  };

  return (
    <>
      
      <Button onClick={signIn}>Login With Google</Button>
      {showToast && (
        <Toast>
          <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
            <HiExclamation className="h-5 w-5" />
          </div>
          <div className="ml-3 text-sm font-normal">Failed to register user. Please refresh and try again</div>
          <Toast.Toggle />
        </Toast>
      )}
    </>
  );
};