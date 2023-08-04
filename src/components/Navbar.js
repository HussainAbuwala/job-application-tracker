import React from "react";
import "./Navbar.css";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";

export default function Navbar() {
   const { currentUser, logout } = useAuth();
   const navigate = useNavigate();

   async function handleLogout() {
      try {
         await logout();
         navigate("/signin");
      } catch (error) {
         console.log(error);
      }
   }
   return (
      <nav className="navbar navbar-dark bg-dark p-2">
         {/* Left side - logo and text */}
         <div className="navbar-brand d-flex align-items-center">
            <Link to="/" className="dropdown-item">
               <img
                  src="https://www.svgrepo.com/show/530397/date.svg"
                  alt=""
                  width="30"
                  height="24"
                  class="d-inline-block align-text-top"
               />
               <span className="ml-2 app-title">AppliTracker</span>
            </Link>
         </div>

         {/* Right side - text and button */}
         <div className="ml-auto d-flex align-items-center">
            {currentUser && (
               <span className="text-white p-2">
                  Welcome Back,{" "}
                  <span className="text-info username">
                     {currentUser.email.split("@")[0]}!
                  </span>
               </span>
            )}
            {currentUser && (
               <div className="btn-group dropstart">
                  <button
                     type="button"
                     className="btn btn-light btn-sm dropdown-toggle"
                     data-bs-toggle="dropdown"
                     aria-expanded="false"
                  >
                     <i class="bi bi-menu-up"></i>
                  </button>
                  <ul className="dropdown-menu">
                     <li>
                        <button
                           onClick={handleLogout}
                           className="dropdown-item"
                        >
                           Sign Out
                        </button>
                     </li>
                     <li>
                        <Link to="/update-profile" className="dropdown-item">
                           Update Profile
                        </Link>
                     </li>
                  </ul>
               </div>
            )}
         </div>
      </nav>
   );
}
