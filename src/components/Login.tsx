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
          localStorage.setItem("farm_uid", userResponse.data.farm.uid);
        }
        sessionStorage.setItem("google_uid", userResponse.data.googleuid);
        navigate("/dashboard");
      }
    } catch(error) {
      console.error(error);
    }
  };

  const GoogleImage = "/images/login-image.png";
  return (
    <>
       <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center max-w-md">
        <img src={GoogleImage} alt="Google Logo" className="w-64 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
          ALUVE CROP APP
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4 mx-auto">
          Manage your crop farm with ease
        </p>
        <Button gradientDuoTone="greenToBlue" outline onClick={signIn} className="bg-blue-500 text-white py-2 px-4 rounded mx-auto">
          Login With Google
        </Button>
        {showToast && (
          <Toast className="mt-4">
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200">
              <HiExclamation className="h-5 w-5" />
            </div>
            <div className="ml-3 text-sm font-normal">
              Failed to register user. Please refresh and try again.
            </div>
            <Toast.Toggle />
          </Toast>
        )}
      </div>
    </div>
      
    </>
  );
};