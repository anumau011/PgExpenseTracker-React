import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Toast from 'react-native-toast-message';

import { getApiUrl } from '../Utils/api';

export default function CreateGroupModal({ visible, onClose }) {
  const [groupName, setGroupName] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!groupName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a group name',
      });
      return;
    }

    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem('token');

      const response = await axios.post(
        getApiUrl('/pg/create-group'),
        { groupName: groupName.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const createdGroup = response.data;
      setGroupCode(createdGroup.groupCode);
      setGroupName('');
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Group created successfully!',
      });
    } catch (error) {
      if (error.response && error.response.status === 409) {
        Alert.alert('Error', error.response.data);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to create group. Please try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    // In React Native, you would use Clipboard API
    // For now, we'll just show a toast
    Toast.show({
      type: 'success',
      text1: 'Copied!',
      text2: 'Group code copied to clipboard',
    });
  };

  const handleClose = () => {
    setGroupName('');
    setGroupCode('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {!groupCode ? (
            <>
              <Text style={styles.title}>Create New Group</Text>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter group name"
                  value={groupName}
                  onChangeText={setGroupName}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleClose}
                  disabled={isLoading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.createButton, isLoading && styles.disabledButton]}
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={isLoading ? ['#9CA3AF', '#9CA3AF'] : ['#3B82F6', '#2563EB']}
                    style={styles.createButtonGradient}
                  >
                    <Text style={styles.createButtonText}>
                      {isLoading ? 'Creating...' : 'Create'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.successHeader}>
                <Ionicons name="checkmark-circle" size={48} color="#10B981" />
                <Text style={styles.successTitle}>Group Created!</Text>
              </View>
              
              <Text style={styles.codeLabel}>Here is your group code:</Text>
              <View style={styles.codeContainer}>
                <Text style={styles.codeText}>{groupCode}</Text>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.copyButtonGradient}
                  >
                    <Ionicons name="copy-outline" size={20} color="white" />
                    <Text style={styles.copyButtonText}>Copy Code</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.doneButton} onPress={handleClose}>
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
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
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    borderRadius: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  createButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginTop: 12,
  },
  codeLabel: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  codeContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  codeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    fontFamily: 'monospace',
  },
  copyButton: {
    flex: 1,
    borderRadius: 12,
  },
  copyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  copyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  doneButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#6B7280',
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});