import React, { useContext, useEffect } from "react";
import { Context } from "./main";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home from "./components/pages/Home";
import Register from "./components/pages/Register";
import Login from "./components/pages/Login";
import Blogs from "./components/pages/Blogs";
import SingleBlog from "./components/pages/SingleBlog";
import About from "./components/pages/About";
import AllAuthors from "./components/pages/AllAuthors";
import Dashboard from "./components/pages/Dashboard";
import UpdateBlog from "./components/pages/UpdateBlog";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import axios from "axios";
import { Toaster } from "react-hot-toast";

function App() {
  const { isAuthenticated, setIsAuthenticated, user, setUser, setBlogs } =
    useContext(Context);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/v1/user/myprofile",
          { withCredentials: true }
        );
        setUser(data.user);
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        setUser({});
      }
    };

    const fetchBlogs = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/v1/blog/all",
          { withCredentials: true }
        );

        setBlogs(data.allBlogs);
      } catch (error) {
        setBlogs([]);
      }
    };

    fetchUser();
    fetchBlogs();
  }, [isAuthenticated, user]);

  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blog/:id" element={<SingleBlog />} />
          <Route path="/about" element={<About />} />
          <Route path="/authors" element={<AllAuthors />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/blog/update/:id" element={<UpdateBlog />} />
        </Routes>
        <Footer />
        <Toaster />
      </BrowserRouter>
    </>
  );
}

export default App;
