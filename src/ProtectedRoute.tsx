// ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig";
import { Spinner } from "flowbite-react";
import React from "react";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <React.Fragment>
        <div className="text-center">
          <Spinner aria-label="Extra large spinner example" size="xl" />
        </div>
      </React.Fragment>
    );
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
