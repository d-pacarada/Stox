import React, { useState, useEffect, useRef } from 'react';
import SidebarUser from '../assets/Components/SidebarUser';
import Header from "../assets/Components/Header";
import { Link, useNavigate } from 'react-router-dom';

function Purchase() {
  return (
     <div className="flex flex-col min-h-screen md:flex-row">
      <SidebarUser />
      <div className="flex-1 p-4 md:p-0 flex flex-col">
        <Header />
        </div>
       </div>
  )
}

export default Purchase