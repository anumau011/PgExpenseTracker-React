import React, { useEffect, useState } from 'react';
import {Plus,Users,ArrowRight,TrendingUp,LogIn,LogOut,User,} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import CreateGroupForm from './CreateGroupModal';
import JoinGroupModal from './JoinGroupModal';
import axios from 'axios';
import { GroupDashboard } from './GroupDashboard';
import { useGroup } from '../Context/GroupContext';
import { getApiUrl } from "../Utils/api";


export function LandingPage({
  
  onLogin: handleLoginClick,
  onLogout,
  
  isAuthenticated = false,
}) {
  const [showCreateGroupModal,setShowCreateGroupModal]=useState(false)
  const [showJoinGroupModal,setShowJoinGroupModal]=useState(false)
  const [showCreateEnterModal,setShowEnterGroupModal]=useState(false)
  
  
  
  const [hoveredCard, setHoveredCard] = useState(null);
  const [token, setToken] = useState(false);
  const navigate = useNavigate();

  const {setCurrentGroup}=useGroup()

  // Check token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(true);
    }
  }, []);

  const handleLogin = () => {
    if (handleLoginClick) {
      handleLoginClick();
    } else {
      navigate('/login');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(false);
    if (onLogout) {
      onLogout();
    }
  };
 
  //this will show the create group modal
  const onCreateGroup=()=>{
      setShowCreateGroupModal(true)
    }

  //this will show the join group modal 
  const onJoinGroup=()=>{
    setShowJoinGroupModal(true)
  }
  


  //this will help to enter to my group
  const handleEnterGroup = async () => {
    setShowEnterGroupModal(true)
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to enter a group.');
      return;
    }

    const response = await axios.get(getApiUrl('/pg/my-group'), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const group = response.data;
     setCurrentGroup(group)
    console.log(group)

    if (group?.id) {
      localStorage.setItem('currentGroupId', group.id);
      
      navigate(`/dashboard/`);
    } else {
      alert('You are not part of any group yet.');
    }
  } catch (error) {
    console.error('Error fetching group:', error);
    alert('Failed to fetch your group. Please try again.');
  }


};



  //this will show the enter group modal
  // const onEnterGroup=()=>{
  //     setShowEnterGroupModal(true)
  // }


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* --- Top Navigation --- */}
      <div className="absolute top-0 right-0 p-6 z-10">
        {token ? (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-lg border border-white/20">
              <User className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">Welcome</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors bg-white/70 backdrop-blur-sm border border-white/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-[1.02] transition-all shadow-lg cursor-pointer"
          >
            <LogIn className="h-5 w-5 mr-2" />
            Login
          </button>
        )}
      </div>

      {/* --- Hero Section --- */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 backdrop-blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            {/* Logo */}
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
            </div>

            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              {isAuthenticated
                ? `Welcome back, ${currentUser?.name || ''}!`
                : 'Split Bills & Track Expenses'}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              {isAuthenticated
                ? 'Manage your group expenses effortlessly. Create a new group or join an existing one.'
                : 'Split bills, track expenses, and manage group finances effortlessly. Perfect for roommates, friends, and travel groups.'}
            </p>

            

            {/* Action Cards */}
            {token && (
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <ActionCard
                  icon={<Plus className="h-6 w-6 text-white" />}
                  title="Create Group"
                  text="Start a new expense group and invite others to join"
                  color="from-blue-500 to-blue-600"
                  
                  onClick={onCreateGroup}
                  hovered={hoveredCard === 'create'}
                  setHovered={() => setHoveredCard('create')}
                />
                <ActionCard
                  icon={<Users className="h-6 w-6 text-white" />}
                  title="Join Group"
                  text="Enter a group code to join an existing expense group"
                  color="from-indigo-500 to-indigo-600"
                  onClick={onJoinGroup}
                  hovered={hoveredCard === 'join'}
                  setHovered={() => setHoveredCard('join')}
                />
                <ActionCard
                  icon={<LogIn className="h-6 w-6 text-white" />}
                  title="Enter Group"
                  text="Access your existing groups and continue tracking expenses"
                  color="from-green-500 to-green-600"
                  onClick={handleEnterGroup}
                  hovered={hoveredCard === 'enter'}
                  setHovered={() => setHoveredCard('enter')}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* //for rendering the create group form modal */}
     {showCreateGroupModal && (
  <CreateGroupForm
    onClose={() => setShowCreateGroupModal(false)}/>
)}
      {/* //for rendering the join group form modal */}
     {showJoinGroupModal && (
  <JoinGroupModal
    onClose={() => setShowJoinGroupModal(false)}/>
)}


      

      







      {/* --- Features Section --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose PG Expense Tracker?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Simplify group expense management with our intuitive and powerful features.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Users className="h-6 w-6 text-white" />}
            title="Easy Group Management"
            color="from-green-500 to-green-600"
            description="Create groups instantly and invite members with simple codes"
          />
          <FeatureCard
            icon={<TrendingUp className="h-6 w-6 text-white" />}
            title="Smart Expense Splitting"
            color="from-orange-500 to-orange-600"
            description="Automatically calculate who owes what with intelligent splitting"
          />
          <FeatureCard
            icon={<Plus className="h-6 w-6 text-white" />}
            title="Detailed Analytics"
            color="from-purple-500 to-purple-600"
            description="Track spending patterns and get insights into group expenses"
          />
        </div>
      </div>
    </div>
  );
}

// --- Reusable Action Card ---
function ActionCard({ icon, title, text, color, onClick, hovered, setHovered }) {
  return (
    <div
      className={`relative group cursor-pointer transform transition-all duration-300 ${
        hovered ? 'scale-105' : ''
      }`}
      onMouseEnter={setHovered}
      onMouseLeave={() => setHovered(null)}
      onClick={onClick}
    >
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:bg-white/80 transition-all duration-300">
        <div className="flex items-center justify-center mb-4">
          <div className={`p-3 bg-gradient-to-r ${color} rounded-xl`}>{icon}</div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{text}</p>
        <div className="flex items-center justify-center text-blue-600 font-medium">
          {title.includes('Enter') ? 'Enter Now' : title.includes('Join') ? 'Join Now' : 'Get Started'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

// --- Reusable Feature Card ---
function FeatureCard({ icon, title, description, color }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-4">
        <div className={`p-3 bg-gradient-to-r ${color} rounded-xl`}>{icon}</div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
