import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Toast from 'react-native-toast-message';

// Context and utilities
import { useGroup } from '../Context/GroupContext';
import { useUser } from '../Context/CurrentUserIdContext';
import { calculateBalances, getTotalExpenses } from '../Utils/Calculation';
import { getApiUrl } from '../Utils/api';

// Components
import ExpenseList from './ExpenseList';
import MemberList from './MemberList';
import AddExpenseModal from './AddExpenseModal';

export default function GroupDashboard({ navigation }) {
  // === STATE MANAGEMENT ===
  const [activeTab, setActiveTab] = useState('expenses');
  const [showAddExpenses, setShowAddExpenses] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Delete confirmation modal state
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // === DATE INITIALIZATION ===
  const today = new Date();
  const initialMonth = today.getMonth();
  const initialYear = today.getFullYear();
  const previousMonth = initialMonth === 0 ? 11 : initialMonth - 1;
  const previousYear = initialMonth === 0 ? initialYear - 1 : initialYear;
  
  const [selectedMonth, setSelectedMonth] = useState(previousMonth);
  const [selectedYear, setSelectedYear] = useState(previousYear);

  // === CONTEXT HOOKS ===
  const { currentGroup, fetchGroup, fetchInitialGroup, currentBalance } = useGroup();
  const { currentUserId } = useUser();

  // === COMPUTED VALUES (MEMOIZED) ===
  const totalExpense = useMemo(() => {
    return getTotalExpenses(currentGroup?.expenses || []);
  }, [currentGroup?.expenses]);

  const currentMonthExpenses = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return (currentGroup?.expenses || []).filter(expense => {
      const expenseDate = new Date(expense.paymentDate);
      return expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear;
    });
  }, [currentGroup?.expenses]);

  const totalCurrentMonthExpense = useMemo(() => {
    return getTotalExpenses(currentMonthExpenses);
  }, [currentMonthExpenses]);

  // === UTILITY FUNCTIONS ===
  const getUserExpenses = useCallback((expenses, userId, users) => {
    if (!userId || !users) return [];
    
    const currentUser = users.find(user => 
      user.userId === userId || 
      user.userId === String(userId) ||
      String(user.userId) === String(userId)
    );
    
    return expenses.filter(expense => {
      return expense.paidBy === userId ||
             expense.userId === userId ||
             expense.paidBy === String(userId) ||
             expense.userId === String(userId) ||
             String(expense.paidBy) === String(userId) ||
             String(expense.userId) === String(userId) ||
             (currentUser && expense.paidBy === currentUser.name) ||
             (currentUser && expense.paidBy === currentUser.username);
    });
  }, []);

  const currentUserCurrentMonthExpense = useMemo(() => {
    if (!currentGroup?.users || !currentUserId || !currentMonthExpenses.length) {
      return 0;
    }
    
    const userExpenses = getUserExpenses(currentMonthExpenses, currentUserId, currentGroup.users);
    return userExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  }, [currentMonthExpenses, currentUserId, currentGroup?.users, getUserExpenses]);

  const currentMonthUserExpenses = useMemo(() => {
    if (!currentGroup?.users || currentMonthExpenses.length === 0) return [];
    
    return currentGroup.users.map(user => {
      const userExpenses = getUserExpenses(currentMonthExpenses, user.userId, currentGroup.users);
      const totalSpent = userExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
      
      return {
        userId: user.userId,
        totalSpent: totalSpent
      };
    });
  }, [currentGroup?.users, currentMonthExpenses, getUserExpenses]);

  // === EXPENSE DELETION HANDLERS ===
  const handleExpenseDeleted = useCallback(async (deletedExpenseId) => {
    try {
      await fetchGroup();
    } catch (error) {
      console.error('Error refreshing group data after deletion:', error);
    }
  }, [fetchGroup]);

  const handleDeleteRequest = useCallback((expense) => {
    setExpenseToDelete(expense);
  }, []);

  const handleDelete = async (expenseId) => {
    const token = await AsyncStorage.getItem("token");
    setIsDeleting(true);
    
    try {
      await axios.delete(getApiUrl(`/pg/delete/expense/${expenseId}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Expense deleted successfully!',
      });
      
      setExpenseToDelete(null);
      await handleExpenseDeleted(expenseId);
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Something went wrong";
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // === EFFECTS ===
  useEffect(() => {
    const loadGroupData = async () => {
      if (!currentUserId) return;
      
      if (!currentGroup) {
        setIsLoading(true);
        try {
          await fetchInitialGroup();
        } catch (error) {
          console.error('Error fetching initial group data:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadGroupData();
  }, [currentUserId, currentGroup, fetchInitialGroup]);

  // === REFRESH HANDLER ===
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchGroup();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchGroup]);

  // === LOADING AND ERROR STATES ===
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading group...</Text>
      </View>
    );
  }

  if (!currentUserId) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Please log in to view your group.</Text>
      </View>
    );
  }

  if (!currentGroup) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No group found. Please create or join a group.</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Landing')}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // === RENDER ===
  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.9)']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.groupInfo}>
            <View style={styles.groupIcon}>
              <Ionicons name="people" size={24} color="white" />
            </View>
            <View style={styles.groupDetails}>
              <Text style={styles.groupName} numberOfLines={1}>
                {currentGroup.groupName}
              </Text>
              <Text style={styles.groupCode}>
                Code: {currentGroup.groupCode}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddExpenses(true)}
          >
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              style={styles.addButtonGradient}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.addButtonText}>Add</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              style={styles.statCardGradient}
            >
              <Ionicons name="trending-up" size={24} color="white" />
              <Text style={styles.statValue}>
                ₹{totalCurrentMonthExpense.toFixed(2)}
              </Text>
              <Text style={styles.statLabel}>Total Expenses</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={['#6366F1', '#4F46E5']}
              style={styles.statCardGradient}
            >
              <Ionicons name="people" size={24} color="white" />
              <Text style={styles.statValue}>
                {currentGroup.users?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Members</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.statCardGradient}
            >
              <Ionicons name="wallet" size={24} color="white" />
              <Text style={styles.statValue}>
                ₹{currentUserCurrentMonthExpense.toFixed(2)}
              </Text>
              <Text style={styles.statLabel}>Your Spent</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'expenses' && styles.activeTab]}
            onPress={() => setActiveTab('expenses')}
          >
            <Text style={[styles.tabText, activeTab === 'expenses' && styles.activeTabText]}>
              Expenses ({currentMonthExpenses?.length || 0})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'members' && styles.activeTab]}
            onPress={() => setActiveTab('members')}
          >
            <Text style={[styles.tabText, activeTab === 'members' && styles.activeTabText]}>
              Members ({currentGroup.users?.length || 0})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'expenses' && (
            <ExpenseList 
              expenses={currentMonthExpenses || []} 
              onExpenseDeleted={handleExpenseDeleted}
              onDeleteRequest={handleDeleteRequest}
            />
          )}
          
          {activeTab === 'members' && (
            Array.isArray(currentGroup.users) && currentGroup.users.length > 0 ? (
              <MemberList 
                users={currentGroup.users} 
                balances={currentMonthUserExpenses} 
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No members found.</Text>
              </View>
            )
          )}
        </View>
      </ScrollView>

      {/* Add Expense Modal */}
      {showAddExpenses && (
        <AddExpenseModal
          visible={showAddExpenses}
          onClose={() => setShowAddExpenses(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {expenseToDelete && (
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModal}>
            <Text style={styles.deleteModalTitle}>Confirm Deletion</Text>
            <Text style={styles.deleteModalText}>
              Are you sure you want to delete the expense "{expenseToDelete.description}" 
              of ₹{expenseToDelete.amount.toFixed(2)}?
            </Text>
            
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.cancelDeleteButton}
                onPress={() => setExpenseToDelete(null)}
                disabled={isDeleting}
              >
                <Text style={styles.cancelDeleteButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.confirmDeleteButton, isDeleting && styles.disabledButton]}
                onPress={() => handleDelete(expenseToDelete.id)}
                disabled={isDeleting}
              >
                <Text style={styles.confirmDeleteButtonText}>
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  groupIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  groupDetails: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  groupCode: {
    fontSize: 12,
    color: '#6B7280',
  },
  addButton: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardGradient: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: 'white',
  },
  tabContent: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  deleteModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  deleteModalText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelDeleteButtonText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  confirmDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmDeleteButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});