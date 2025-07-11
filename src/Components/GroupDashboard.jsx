import { useState,useEffect } from "react"
import { useGroup } from "../Context/GroupContext"
import { Plus, Users, TrendingUp, Settings, LogOut, IndianRupee , User } from 'lucide-react';
import { calculateBalances, getTotalExpenses } from "../Utils/Calculation";
import { useUser } from "../Context/CurrentUserIdContext";
import { ExpenseList } from "./ExpenseList";
import { MemberList } from "./MemberList";
import { AddExpenseModal } from "./AddExpenseModal";


export function GroupDashboard(){
     const [activeTab,setActiveTab]=useState('expenses')
     const [showAddExpenses,setShowAddExpenses]=useState(false)

     const {currentGroup,setCurrentGroup}=useGroup()
     const {currentUserId,setCurrentUserId}=useUser()
     const [expenses,setExpenses]=useState([])
     const {currentBalance}=useGroup() 


    // Sync local expenses when currentGroup changes
    useEffect(() => {
    if (currentGroup?.expenses) {
      setExpenses(currentGroup.expenses);
    }
  }, [currentGroup]);

     
     //for calculating balances
     const balance =calculateBalances(currentGroup.expenses,currentGroup.users)

     //for calculating the total expenses
     const totalExpense=getTotalExpenses(currentGroup.expenses)

     //for calculating the  total expense my
     const currentUserBalance=balance.find(b => b.userId ===currentUserId);
     console.log("currentUserBalance:", currentUserBalance)

    // console.log(currentGroup)
    if (!currentGroup){
        // console.log(currentGroup)
        return <p>Loading group...</p>;

    } 
        
    

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg mr-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{currentGroup.groupName}</h1>
                <p className="text-sm text-gray-600">Code: {currentGroup.groupCode}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-2 bg-white/50 rounded-lg">
                <User className="h-4 w-4 text-gray-600" />
                {/* <span className="text-sm text-gray-700">{currentUser?.name}</span> */}
              </div>
              
              <button
                onClick={() => setShowAddExpenses(true)}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-[1.02] transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </button>
              
              <button
                // onClick={onLeaveGroup}
                className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                title="Leave Group"
              >
                <LogOut className="h-5 w-5" />
              </button>

              <button
                // onClick={onLogout}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <div className="flex items-center justify-between">
                <IndianRupee  className="h-5 w-5 "  />
                <p className="text-2xl font-bold text-gray-900">{totalExpense.toFixed(2)}</p>
                </div>

              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{currentGroup.users.length}</p>
              </div>
              <Users className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Your Total Spent</p>
                <p className="text-2xl font-bold text-green-600">
                  {typeof currentBalance === 'number' ? currentBalance.toFixed(2) : '0.00'}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full flex items-center justify-center bg-green-100 text-green-600">
                <IndianRupee  className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('expenses')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'expenses'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Expenses ({currentGroup.expenses.length})
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'members'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Members ({currentGroup.users.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'expenses' && (
              <ExpenseList expenses={currentGroup.expenses}  />
            )}
            {activeTab === 'members' && (
              Array.isArray(currentGroup.users) ? (
                <MemberList users={currentGroup.users} balances={balance} />
              ) : (
                <p>No members found.</p>
              )
            )}
          </div>
        </div>
      </div>
    if{setShowAddExpenses &&(
        <AddExpenseModal
          isOpen={showAddExpenses}
          onClose={() => setShowAddExpenses(false)}
          onAddExpense={(newExpense) => {
          setExpenses(prev => [...prev, newExpense]);
        }}
    />)} 
         

    </div>
  );
    

}