import { useState, useEffect, useMemo, useCallback } from "react";
import { useGroup } from "../Context/GroupContext";
import { Plus, Users, TrendingUp, Settings, LogOut, IndianRupee, User,ArrowRight ,ArrowLeft } from 'lucide-react';
import { calculateBalances, getTotalExpenses } from "../Utils/Calculation";
import { useUser } from "../Context/CurrentUserIdContext";
import { ExpenseList } from "./ExpenseList";
import { MemberList } from "./MemberList";
import { AddExpenseModal } from "./AddExpenseModal";

export function GroupDashboard() {
  const [activeTab, setActiveTab] = useState('expenses');
  const [showAddExpenses, setShowAddExpenses] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Date setup for previous month as default
  const today = new Date();
  const initialMonth = today.getMonth();
  const initialYear = today.getFullYear();

  const previousMonth = initialMonth === 0 ? 11 : initialMonth - 1;
  const previousYear = initialMonth === 0 ? initialYear - 1 : initialYear;

  const [selectedMonth, setSelectedMonth] = useState(previousMonth);
  const [selectedYear, setSelectedYear] = useState(previousYear);

  const { currentGroup, fetchGroup, currentBalance } = useGroup();
  const { currentUserId } = useUser();

  // Handle expense deletion
  const handleExpenseDeleted = useCallback(async (deletedExpenseId) => {
    // Refresh the group data to update all calculations
    try {
      await fetchGroup();
    } catch (error) {
      console.error('Error refreshing group data:', error);
    }
  }, [fetchGroup]);

  // Calculate total expenses (all-time)
  const totalExpense = useMemo(() => {
    return getTotalExpenses(currentGroup?.expenses || []);
  }, [currentGroup?.expenses]);

  // Filter current month expenses
  const currentMonthExpenses = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    return (currentGroup?.expenses || []).filter(exp => {
      const date = new Date(exp.paymentDate);
      return date.getMonth() === month && date.getFullYear() === year;
    });
  }, [currentGroup?.expenses]);

  // Calculate current month totals
  const totalCurrentMonthExpense = useMemo(() => {
    return getTotalExpenses(currentMonthExpenses);
  }, [currentMonthExpenses]);

  // Helper function to filter user expenses
  const getUserExpenses = useCallback((expenses, userId, users) => {
    if (!userId || !users) return [];
    
    const currentUser = users.find(user => 
      user.userId === userId || 
      user.userId === String(userId) ||
      String(user.userId) === String(userId)
    );
    
    return expenses.filter(exp => {
      return exp.paidBy === userId ||
             exp.userId === userId ||
             exp.paidBy === String(userId) ||
             exp.userId === String(userId) ||
             String(exp.paidBy) === String(userId) ||
             String(exp.userId) === String(userId) ||
             (currentUser && exp.paidBy === currentUser.name) ||
             (currentUser && exp.paidBy === currentUser.username);
    });
  }, []);

  // Calculate current user's current month expense
  const currentUserCurrentMonthExpense = useMemo(() => {
    if (!currentGroup?.users || !currentUserId || !currentMonthExpenses.length) return 0;
    
    const userExpenses = getUserExpenses(currentMonthExpenses, currentUserId, currentGroup.users);
    return userExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  }, [currentMonthExpenses, currentUserId, currentGroup?.users, getUserExpenses]);

  // Calculate each user's current month expenses (for MemberList)
  const currentMonthUserExpenses = useMemo(() => {
    if (!currentGroup?.users || currentMonthExpenses.length === 0) return [];
    
    return currentGroup.users.map(user => {
      const userExpenses = getUserExpenses(currentMonthExpenses, user.userId, currentGroup.users);
      const totalSpent = userExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
      
      return {
        userId: user.userId,
        totalSpent: totalSpent
      };
    });
  }, [currentGroup?.users, currentMonthExpenses, getUserExpenses]);
  
  // Filter expenses based on selected month and year
  const filteredExpenses = useMemo(() => {
    if (!currentGroup?.expenses) return [];
    
    return currentGroup.expenses.filter(exp => {
      const date = new Date(exp.paymentDate);
      return (
        date.getMonth() === selectedMonth &&
        date.getFullYear() === selectedYear
      );
    });
  }, [currentGroup?.expenses, selectedMonth, selectedYear]);

  // Calculate total expenses for filtered period
  const totalFilteredExpense = useMemo(() => {
    return getTotalExpenses(filteredExpenses);
  }, [filteredExpenses]);

  // Calculate each user's expense for the selected month (previous tab)
  const filteredUserExpenses = useMemo(() => {
    if (!currentGroup?.users || filteredExpenses.length === 0) return [];
    
    return currentGroup.users.map(user => {
      const userExpenses = getUserExpenses(filteredExpenses, user.userId, currentGroup.users);
      const totalSpent = userExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
      
      return {
        userId: user.userId,
        totalSpent: totalSpent
      };
    });
  }, [currentGroup?.users, filteredExpenses, getUserExpenses]);

  // Calculate current user's expense for selected month (previous tab)
  const currentUserExpense = useMemo(() => {
    if (!currentGroup?.users || !currentUserId || !filteredExpenses.length) return 0;
    
    const userExpenses = getUserExpenses(filteredExpenses, currentUserId, currentGroup.users);
    return userExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  }, [filteredExpenses, currentUserId, currentGroup?.users, getUserExpenses]);

  // Load group data on component mount
  useEffect(() => {
    const loadGroupData = async () => {
      if (currentUserId) {
        if (!currentGroup) {
          setIsLoading(true);
          try {
            await fetchGroup();
          } catch (error) {
            console.error('Error fetching group:', error);
          } finally {
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
      }
    };

    loadGroupData();
  }, [currentUserId, currentGroup, fetchGroup]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading group...</p>
        </div>
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view your group.</p>
        </div>
      </div>
    );
  }

  if (!currentGroup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <p className="text-gray-600">No group found. Please create or join a group.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Left Side: Group Info */}
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg mr-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate max-w-48 sm:max-w-none">
                  {currentGroup.groupName}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">Code: {currentGroup.groupCode}</p>
              </div>
            </div>

            {/* Right Side: Add Expense Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddExpenses(true)}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-[1.02] transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </button>
            </div>
          </div>
        </div>
      </header>


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600">Total Expenses</p>
                <div className="flex items-center gap-1 sm:gap-2 mt-1">
                  <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                    {activeTab === 'previous' 
                      ? totalFilteredExpense.toFixed(2) 
                      : activeTab === 'expenses'
                      ? totalCurrentMonthExpense.toFixed(2)
                      : activeTab === 'members'
                      ? totalCurrentMonthExpense.toFixed(2)
                      : totalExpense.toFixed(2)}
                  </p>
                </div>
              </div>
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600">Total Members</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">
                  {currentGroup.users?.length || 0}
                </p>
              </div>
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600 flex-shrink-0" />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600">Your Total Spent</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600 mt-1 truncate">
                  ₹ {activeTab === 'previous'
                    ? currentUserExpense.toFixed(2)
                    : activeTab === 'expenses'
                    ? currentUserCurrentMonthExpense.toFixed(2)
                    : activeTab === 'members'
                    ? currentUserCurrentMonthExpense.toFixed(2)
                    : typeof currentBalance === 'number'
                    ? currentBalance.toFixed(2)
                    : '0.00'}
                </p>
              </div>
              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full flex items-center justify-center bg-green-100 text-green-600 flex-shrink-0">
                <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
          <nav className="border-b border-gray-200 overflow-x-auto scrollbar-hide">
            <div className="flex space-x-2 sm:space-x-4 px-4 sm:px-6 min-w-max">
              {/* Current month expenses tab */}
              <button
                onClick={() => setActiveTab('expenses')}
                className={`py-3 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === 'expenses'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Expenses ({currentMonthExpenses?.length || 0})
              </button>
              
              {/* Members tab */}
              <button
                onClick={() => setActiveTab('members')}
                className={`py-3 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === 'members'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Members ({currentGroup.users?.length || 0})
              </button>
              
              {/* Previous months tab */}
              <button
                onClick={() => setActiveTab('previous')}
                className={`py-3 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === 'previous'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Previous Months
              </button>
            </div>
          </nav>

          <div className="p-4 sm:p-6">
            {/* Current month expenses */}
            {activeTab === 'expenses' && (
              <ExpenseList 
                expenses={currentMonthExpenses || []} 
                onExpenseDeleted={handleExpenseDeleted}
              />
            )}
            
            {/* Members with their balances */}
            {activeTab === 'members' && (
              Array.isArray(currentGroup.users) && currentGroup.users.length > 0 ? (
                <MemberList users={currentGroup.users} balances={currentMonthUserExpenses} />
              ) : (
                <p className="text-center text-gray-500">No members found.</p>
              )
            )}
            
            {/* Previous months content */}
            {activeTab === 'previous' && (
              <>
                <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  {/* Month navigation buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (selectedMonth === 0) {
                          setSelectedMonth(11);
                          setSelectedYear(prev => prev - 1);
                        } else {
                          setSelectedMonth(prev => prev - 1);
                        }
                      }}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <span className="text-gray-700 font-medium text-sm sm:text-base px-2 sm:px-4 py-1 bg-gray-50 rounded-lg">
                      {new Date(selectedYear, selectedMonth).toLocaleString('default', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    <button
                      onClick={() => {
                        if (selectedMonth === 11) {
                          setSelectedMonth(0);
                          setSelectedYear(prev => prev + 1);
                        } else {
                          setSelectedMonth(prev => prev + 1);
                        }
                      }}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>

                  {/* Month & Year dropdowns */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                      value={selectedMonth}
                      onChange={e => setSelectedMonth(Number(e.target.value))}
                      className="flex-1 sm:flex-none border border-gray-300 rounded-md px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-700 bg-white"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i}>
                          {new Date(0, i).toLocaleString('default', { month: 'long' })}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedYear}
                      onChange={e => setSelectedYear(Number(e.target.value))}
                      className="flex-1 sm:flex-none border border-gray-300 rounded-md px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-700 bg-white"
                    >
                      {Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() - 2 + i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Member expenses summary */}
                {filteredUserExpenses.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Member Expenses for {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h3>
                    <MemberList users={currentGroup.users} balances={filteredUserExpenses} />
                  </div>
                )}

                {/* Detailed expense list */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Details</h3>
                  <ExpenseList 
                    expenses={filteredExpenses} 
                    onExpenseDeleted={handleExpenseDeleted}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Add Expense Modal */}
      {showAddExpenses && (
        <AddExpenseModal
          isOpen={showAddExpenses}
          onClose={() => setShowAddExpenses(false)}
        />
      )}
    </div>
  );
}
