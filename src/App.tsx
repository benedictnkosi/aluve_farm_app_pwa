// App.tsx
import React, { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { auth, provider } from "../firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import Layout from "./layout";
import { router } from "./router"; // Assuming you have a separate router file

const App = () => {
  useEffect(() => {
    const signIn = async () => {
      try {
        const result = await signInWithPopup(auth, provider);
        console.log(result.user);
      } catch (error) {
        console.error(error);
      }
    };
    signIn();
  }, []);

  return (
    <React.StrictMode>
      <Layout>
        <RouterProvider router={router} />
      </Layout>
    </React.StrictMode>
  );
};

export default App;