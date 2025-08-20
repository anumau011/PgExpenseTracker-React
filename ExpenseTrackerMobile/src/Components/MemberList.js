import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function MemberList({ users, balances }) {
  const getTotalSpent = (userId) => {
    return balances.find(b => b.userId === userId)?.totalSpent || 0;
  };

  const totalGroupSpending = balances.reduce((sum, balance) => sum + balance.totalSpent, 0);

  const renderMemberItem = ({ item: user }) => {
    const totalSpent = getTotalSpent(user.userId);
    const percentage = totalGroupSpending > 0 ? (totalSpent / totalGroupSpending) * 100 : 0;
    
    return (
      <View style={styles.memberCard}>
        <View style={styles.memberContent}>
          <View style={styles.memberInfo}>
            <LinearGradient
              colors={['#3B82F6', '#6366F1']}
              style={styles.memberAvatar}
            >
              <Ionicons name="person" size={24} color="white" />
            </LinearGradient>
            
            <View style={styles.memberDetails}>
              <Text style={styles.memberName}>{user.name}</Text>
              <Text style={styles.memberPercentage}>
                {percentage.toFixed(1)}% of total
              </Text>
              
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(percentage, 100)}%` }
                  ]}
                />
              </View>
            </View>
          </View>
          
          <View style={styles.memberSpending}>
            <Text style={styles.spentAmount}>₹{totalSpent.toFixed(2)}</Text>
            <View style={styles.spentIcon}>
              <Ionicons name="wallet-outline" size={20} color="#10B981" />
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (users.length === 0) {
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIcon}>
          <Ionicons name="people-outline" size={48} color="#9CA3AF" />
        </View>
        <Text style={styles.emptyTitle}>No members yet</Text>
        <Text style={styles.emptySubtitle}>Invite others to join your group</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={users}
      renderItem={renderMemberItem}
      keyExtractor={(item) => item.userId.toString()}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 20,
  },
  memberCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  memberContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  memberPercentage: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  memberSpending: {
    alignItems: 'flex-end',
  },
  spentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 8,
  },
  spentIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
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