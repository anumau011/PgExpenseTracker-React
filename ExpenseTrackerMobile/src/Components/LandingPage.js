import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import CreateGroupModal from './CreateGroupModal';
import JoinGroupModal from './JoinGroupModal';
import { useGroup } from '../Context/GroupContext';
import { useUser } from '../Context/CurrentUserIdContext';
import { getApiUrl } from '../Utils/api';

export default function LandingPage({ navigation }) {
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showJoinGroupModal, setShowJoinGroupModal] = useState(false);
  const [showGroupSelectionModal, setShowGroupSelectionModal] = useState(false);
  const [userGroups, setUserGroups] = useState([]);
  const [token, setToken] = useState(false);

  const { setCurrentGroup, fetchAllGroups } = useGroup();
  const { currentUserId } = useUser();

  // Check token on mount
  useEffect(() => {
    const checkToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          setToken(true);
        }
      } catch (error) {
        console.error('Error checking token:', error);
      }
    };

    checkToken();
  }, [currentUserId, fetchAllGroups]);

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setToken(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const onCreateGroup = () => {
    setShowCreateGroupModal(true);
  };

  const onJoinGroup = () => {
    setShowJoinGroupModal(true);
  };

  const handleEnterGroup = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'You must be logged in to enter a group.');
        return;
      }

      const response = await axios.get(getApiUrl('/pg/my-groups'), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const groups = response.data;
      console.log('User groups:', groups);

      if (Array.isArray(groups) && groups.length > 0) {
        if (groups.length === 1) {
          selectGroup(groups[0]);
        } else {
          setUserGroups(groups);
          setShowGroupSelectionModal(true);
        }
      } else if (groups && groups.id) {
        selectGroup(groups);
      } else {
        Alert.alert('No Groups', 'You are not part of any group yet. Please create or join a group first.');
      }
    } catch (error) {
      console.error('Error fetching user groups:', error);
      Alert.alert('Error', 'Failed to fetch your groups. Please try again.');
    }
  };

  const selectGroup = async (group) => {
    setCurrentGroup(group);
    try {
      await AsyncStorage.setItem('currentGroupId', group.id.toString());
    } catch (error) {
      console.error('Error storing group ID:', error);
    }
    setShowGroupSelectionModal(false);
    navigation.navigate('Dashboard');
  };

  const ActionCard = ({ icon, title, text, colors, onPress }) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <LinearGradient colors={colors} style={styles.actionCardGradient}>
        <View style={styles.actionCardContent}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={24} color="white" />
          </View>
          <Text style={styles.actionCardTitle}>{title}</Text>
          <Text style={styles.actionCardText}>{text}</Text>
          <View style={styles.actionCardFooter}>
            <Text style={styles.actionCardButton}>
              {title.includes('Enter') ? 'Enter Now' : title.includes('Join') ? 'Join Now' : 'Get Started'}
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#3B82F6" />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const FeatureCard = ({ icon, title, description, colors }) => (
    <View style={styles.featureCard}>
      <LinearGradient colors={colors} style={styles.featureIconContainer}>
        <Ionicons name={icon} size={24} color="white" />
      </LinearGradient>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  );

  const GroupSelectionModal = () => (
    <Modal
      visible={showGroupSelectionModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowGroupSelectionModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.groupSelectionModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose a Group</Text>
            <TouchableOpacity onPress={() => setShowGroupSelectionModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitle}>
            You're part of multiple groups. Please choose one to continue:
          </Text>
          <FlatList
            data={userGroups}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.groupItem}
                onPress={() => selectGroup(item)}
              >
                <View style={styles.groupItemContent}>
                  <View>
                    <Text style={styles.groupName}>{item.groupName}</Text>
                    <Text style={styles.groupCode}>Code: {item.groupCode}</Text>
                    <Text style={styles.groupMembers}>
                      {item.users?.length || 0} member{item.users?.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward" size={20} color="#666" />
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#EBF4FF', '#FFFFFF', '#EEF2FF']}
        style={styles.heroSection}
      >
        {/* Top Navigation */}
        <View style={styles.topNav}>
          {token ? (
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Ionicons name="log-in-outline" size={20} color="white" />
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Hero Content */}
        <View style={styles.heroContent}>
          <View style={styles.logoContainer}>
            <LinearGradient colors={['#3B82F6', '#6366F1']} style={styles.logo}>
              <Ionicons name="trending-up" size={32} color="white" />
            </LinearGradient>
          </View>
          <Text style={styles.heroTitle}>Track Expenses</Text>
          <Text style={styles.heroSubtitle}>
            Track expenses, and manage group finances effortlessly. Perfect for roommates, friends, and travel groups.
          </Text>

          {/* Action Cards */}
          {token && (
            <View style={styles.actionCardsContainer}>
              <ActionCard
                icon="add-circle-outline"
                title="Create Group"
                text="Start a new expense group and invite others to join"
                colors={['#3B82F6', '#2563EB']}
                onPress={onCreateGroup}
              />
              <ActionCard
                icon="people-outline"
                title="Join Group"
                text="Enter a group code to join an existing expense group"
                colors={['#6366F1', '#4F46E5']}
                onPress={onJoinGroup}
              />
              <ActionCard
                icon="log-in-outline"
                title="Enter Group"
                text="Access your existing groups and continue tracking expenses"
                colors={['#10B981', '#059669']}
                onPress={handleEnterGroup}
              />
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <Text style={styles.featuresTitle}>Why Choose PG Expense Tracker?</Text>
        <Text style={styles.featuresSubtitle}>
          Simplify group expense management with our intuitive and powerful features.
        </Text>

        <View style={styles.featuresGrid}>
          <FeatureCard
            icon="people-outline"
            title="Easy Group Management"
            description="Create groups instantly and invite members with simple codes"
            colors={['#10B981', '#059669']}
          />
          <FeatureCard
            icon="trending-up-outline"
            title="Track Together, Hassle-Free"
            description="Effortlessly record group expenses and keep everyone in sync"
            colors={['#F59E0B', '#D97706']}
          />
          <FeatureCard
            icon="analytics-outline"
            title="Detailed Analytics"
            description="Track spending patterns and get insights into group expenses"
            colors={['#8B5CF6', '#7C3AED']}
          />
        </View>
      </View>

      {/* Modals */}
      {showCreateGroupModal && (
        <CreateGroupModal
          visible={showCreateGroupModal}
          onClose={() => setShowCreateGroupModal(false)}
        />
      )}

      {showJoinGroupModal && (
        <JoinGroupModal
          visible={showJoinGroupModal}
          onClose={() => setShowJoinGroupModal(false)}
        />
      )}

      <GroupSelectionModal />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  heroSection: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  topNav: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: '500',
    marginLeft: 8,
  },
  heroContent: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  actionCardsContainer: {
    width: '100%',
  },
  actionCard: {
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  actionCardGradient: {
    borderRadius: 16,
  },
  actionCardContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    margin: 1,
    borderRadius: 15,
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  actionCardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  actionCardText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  actionCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionCardButton: {
    color: '#3B82F6',
    fontWeight: '600',
    marginRight: 8,
  },
  featuresSection: {
    padding: 20,
    paddingTop: 40,
  },
  featuresTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  featuresSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  featuresGrid: {
    gap: 24,
  },
  featureCard: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupSelectionModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    padding: 20,
    paddingTop: 16,
  },
  groupItem: {
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  groupItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  groupCode: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  groupMembers: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
});