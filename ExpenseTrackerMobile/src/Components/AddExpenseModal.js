import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Toast from 'react-native-toast-message';

import { useGroup } from '../Context/GroupContext';
import { getApiUrl } from '../Utils/api';

export default function AddExpenseModal({ visible, onClose }) {
  const [amount, setAmount] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [allGroups, setAllGroups] = useState([]);
  const [selectedGroupsForExpense, setSelectedGroupsForExpense] = useState([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  
  const { fetchGroup, currentGroup, fetchAllGroups: contextFetchAllGroups } = useGroup();

  const commonTags = [
    'grocery', 'vegetables', 'fruits', 'bread', 'paneer', 'milk',
    'gas', 'rice', 'dal', 'atta', 'others'
  ];

  const getGroupId = (group) => group?.groupCode || group?.code || group?.id;

  useEffect(() => {
    if (visible) {
      const today = new Date();
      const dateString = today.toISOString().split('T')[0];
      setSelectedDate(dateString);
      fetchAllGroups();
    } else {
      setAllGroups([]);
      setSelectedGroupsForExpense([]);
    }
  }, [visible, currentGroup]);

  const fetchAllGroups = async () => {
    setIsLoadingGroups(true);
    try {
      const groups = await contextFetchAllGroups();
      setAllGroups(groups || []);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
      setAllGroups([]);
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const handleSubmit = async () => {
    if (!amount || tags.length === 0 || !selectedDate || !currentGroup) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill in all required fields',
      });
      return;
    }

    setIsLoading(true);

    const groupCodes = [
      getGroupId(currentGroup),
      ...selectedGroupsForExpense.map(group => getGroupId(group))
    ];

    const expense = {
      amount: Math.round(parseFloat(amount) * 100) / 100,
      paymentDate: selectedDate,
      tags: tags.filter(tag => tag.trim() !== ''),
      groupCodes: groupCodes
    };

    try {
      const token = await AsyncStorage.getItem('token');
      
      await axios.post(
        getApiUrl('/pg/addExpenseToGroups'),
        expense,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      await fetchGroup();
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Expense added successfully!',
      });
      handleClose();
    } catch (error) {
      console.error('Failed to add expense:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Error adding expense',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    const today = new Date();
    setSelectedDate(today.toISOString().split('T')[0]);
    setTags([]);
    setNewTag('');
    setSelectedGroupsForExpense([]);
    setAllGroups([]);
    setIsLoadingGroups(false);
    onClose();
  };

  const toggleGroupSelection = (group) => {
    const groupId = getGroupId(group);
    
    setSelectedGroupsForExpense(prev => {
      const isSelected = prev.some(selectedGroup => getGroupId(selectedGroup) === groupId);
      
      if (isSelected) {
        return prev.filter(selectedGroup => getGroupId(selectedGroup) !== groupId);
      } else {
        return [...prev, group];
      }
    });
  };

  const addTag = (tag) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setNewTag('');
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const suggestedTags = commonTags
    .filter(tag => !tags.includes(tag) && tag.includes(newTag.toLowerCase()))
    .slice(0, 8);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Add New Expense</Text>
              {currentGroup && (
                <View style={styles.groupInfo}>
                  <Text style={styles.groupInfoText}>
                    Adding to: <Text style={styles.groupName}>{currentGroup.groupName || currentGroup.name || 'Current Group'}</Text>
                  </Text>
                  {selectedGroupsForExpense.length > 0 && (
                    <Text style={styles.additionalGroups}>
                      + {selectedGroupsForExpense.length} additional group{selectedGroupsForExpense.length > 1 ? 's' : ''}
                    </Text>
                  )}
                </View>
              )}
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Amount Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                <Ionicons name="cash-outline" size={16} color="#374151" /> Amount
              </Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Tags Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                <Ionicons name="pricetag-outline" size={16} color="#374151" /> Tags
              </Text>

              {tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {tags.map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                      <TouchableOpacity onPress={() => removeTag(tag)}>
                        <Ionicons name="close" size={14} color="#3B82F6" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.tagInputContainer}>
                <TextInput
                  style={styles.tagInput}
                  value={newTag}
                  onChangeText={setNewTag}
                  placeholder="Add tags (e.g., grocery, milk)"
                  placeholderTextColor="#9CA3AF"
                />
                {newTag && (
                  <TouchableOpacity
                    onPress={() => addTag(newTag)}
                    style={styles.addTagButton}
                  >
                    <Ionicons name="add" size={20} color="#3B82F6" />
                  </TouchableOpacity>
                )}
              </View>

              {suggestedTags.length > 0 && (
                <View style={styles.suggestedTagsContainer}>
                  <Text style={styles.suggestedTagsLabel}>Suggested tags:</Text>
                  <View style={styles.suggestedTags}>
                    {suggestedTags.map((tag) => (
                      <TouchableOpacity
                        key={tag}
                        onPress={() => addTag(tag)}
                        style={styles.suggestedTag}
                      >
                        <Text style={styles.suggestedTagText}>{tag}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Date Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                <Ionicons name="calendar-outline" size={16} color="#374151" /> Date
              </Text>
              <TextInput
                style={styles.input}
                value={selectedDate}
                onChangeText={setSelectedDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Additional Groups Selection */}
            {(allGroups.length > 1 || isLoadingGroups) && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  <Ionicons name="people-outline" size={16} color="#374151" /> Want to add this expense to more groups?
                </Text>
                
                {isLoadingGroups ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading groups...</Text>
                  </View>
                ) : (
                  <View style={styles.groupsContainer}>
                    {(() => {
                      const currentGroupId = getGroupId(currentGroup);
                      const otherGroups = allGroups.filter(group => getGroupId(group) !== currentGroupId);

                      if (otherGroups.length === 0) {
                        return <Text style={styles.noGroupsText}>No other groups available</Text>;
                      }

                      return otherGroups.map((group) => {
                        const groupId = getGroupId(group);
                        const isSelected = selectedGroupsForExpense.some(selectedGroup => 
                          getGroupId(selectedGroup) === groupId
                        );
                        
                        return (
                          <TouchableOpacity
                            key={groupId}
                            onPress={() => toggleGroupSelection(group)}
                            style={[
                              styles.groupOption,
                              isSelected && styles.selectedGroupOption
                            ]}
                          >
                            {isSelected && (
                              <Ionicons name="checkmark" size={16} color="#3B82F6" />
                            )}
                            <Text style={[
                              styles.groupOptionText,
                              isSelected && styles.selectedGroupOptionText
                            ]}>
                              {group.groupName || group.name || 'Unnamed Group'}
                            </Text>
                          </TouchableOpacity>
                        );
                      });
                    })()}
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!amount || tags.length === 0 || !currentGroup || isLoading) && styles.disabledButton
              ]}
              onPress={handleSubmit}
              disabled={!amount || tags.length === 0 || !currentGroup || isLoading}
            >
              <LinearGradient
                colors={isLoading ? ['#9CA3AF', '#9CA3AF'] : ['#3B82F6', '#2563EB']}
                style={styles.submitButtonGradient}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? 'Adding...' : 'Add Expense'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  groupInfo: {
    marginTop: 4,
  },
  groupInfoText: {
    fontSize: 12,
    color: '#6B7280',
  },
  groupName: {
    fontWeight: '600',
    color: '#3B82F6',
  },
  additionalGroups: {
    fontSize: 10,
    color: '#10B981',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: 'white',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: 'white',
  },
  tagInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  addTagButton: {
    padding: 12,
  },
  suggestedTagsContainer: {
    marginTop: 12,
  },
  suggestedTagsLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  suggestedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestedTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  suggestedTagText: {
    fontSize: 12,
    color: '#374151',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  groupsContainer: {
    gap: 8,
  },
  groupOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    gap: 8,
  },
  selectedGroupOption: {
    backgroundColor: '#EBF4FF',
    borderColor: '#3B82F6',
  },
  groupOptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  selectedGroupOptionText: {
    color: '#3B82F6',
  },
  noGroupsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    borderRadius: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});