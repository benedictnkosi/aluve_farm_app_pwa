import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./index.scss";
import Layout from "./layout";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { Sales } from "./components/Sales";
import { Seedlings } from "./components/Seedlings";
import { Transplant } from "./components/Transplant";
import { Settings } from "./components/Settings";

import ProtectedRoute from "./ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/sales",
    element: (
      <ProtectedRoute>
        <Sales />
      </ProtectedRoute>
    ),
  },
  {
    path: "/seedlings",
    element: (
      <ProtectedRoute>
        <Seedlings />
      </ProtectedRoute>
    ),
  },
  {
    path: "/transplant",
    element: (
      <ProtectedRoute>
        <Transplant />
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
  },
]);

const App = () => {
  return (
    <React.StrictMode>
        <Layout>
          <RouterProvider router={router} />
        </Layout>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
