import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ExpenseList({ expenses, onExpenseDeleted, onDeleteRequest }) {
  const reversedExpenses = [...expenses].reverse();

  const renderExpenseItem = ({ item: expense }) => (
    <View style={styles.expenseCard}>
      <View style={styles.expenseContent}>
        <View style={styles.expenseIcon}>
          <Ionicons name="receipt-outline" size={20} color="#3B82F6" />
        </View>
        
        <View style={styles.expenseDetails}>
          <Text style={styles.expenseTitle}>{expense.description}</Text>
          <Text style={styles.expensePaidBy}>Paid by {expense.paidBy}</Text>
          <Text style={styles.expenseDate}>{expense.paymentDate}</Text>
          
          {expense.tags?.length > 0 && (
            <View style={styles.tagsContainer}>
              {expense.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        
        <View style={styles.expenseActions}>
          <Text style={styles.expenseAmount}>₹{expense.amount.toFixed(2)}</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDeleteRequest && onDeleteRequest(expense)}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (expenses.length === 0) {
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIcon}>
          <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
        </View>
        <Text style={styles.emptyTitle}>No expenses yet</Text>
        <Text style={styles.emptySubtitle}>Add your first expense to get started</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={reversedExpenses}
      renderItem={renderExpenseItem}
      keyExtractor={(item) => item.id.toString()}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 20,
  },
  expenseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  expenseContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EBF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  expensePaidBy: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  expenseDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    color: '#374151',
    fontWeight: '600',
  },
  expenseActions: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});