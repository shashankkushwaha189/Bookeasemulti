import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { staffAPI } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { getStaffLabel } from '../../config/categories';

import PageLoader from '../../components/PageLoader';

const primaryColor = '#2563eb'; // blue-600

const AdminStaffScreen = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  
  const emptyForm = { name: '', specialization: '', email: '', password: '' };
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { user } = useAuth();
  const staffLabel = getStaffLabel(user?.businessCategory) || 'Staff';

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      const response = await staffAPI.getAll();
      setStaff(response.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load staff members');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingStaff(null);
    setFormData(emptyForm);
    setErrorMsg('');
    setModalVisible(true);
  };

  const handleEdit = (s) => {
    setEditingStaff(s);
    setFormData({
      name: s.name,
      specialization: s.specialization || '',
      email: '',
      password: '',
    });
    setErrorMsg('');
    setModalVisible(true);
  };

  const handleDelete = (staffId) => {
    Alert.alert(
      'Delete Staff',
      `Are you sure you want to delete this ${staffLabel.toLowerCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await staffAPI.delete(staffId);
              setStaff(prev => prev.filter(s => s.id !== staffId));
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete staff member');
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    const { name, specialization, email, password } = formData;
    setErrorMsg('');

    if (!name || (!editingStaff && (!email || !password))) {
      setErrorMsg('Please fill in required fields');
      return;
    }
    if (!editingStaff && password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    try {
      if (editingStaff) {
        await staffAPI.update(editingStaff.id, { name, specialization });
      } else {
        await staffAPI.create({ name, specialization, email, password, businessId: user.business_id });
      }
      
      await loadStaff();
      setModalVisible(false);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to save staff member');
    } finally {
      setSaving(false);
    }
  };

  const renderStaff = ({ item, index }) => (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.indexBox}>
          <Text style={styles.indexText}>{index + 1}</Text>
        </View>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarText}>{item.name?.[0]?.toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.staffName}>{item.name}</Text>
          <Text style={styles.staffSpec}>{item.specialization || '—'}</Text>
          <Text style={styles.staffEmail}>{item.user?.email || '—'}</Text>
        </View>
      </View>
      
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.btnSecondary} onPress={() => handleEdit(item)}>
          <Text style={styles.btnSecondaryText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnDanger} onPress={() => handleDelete(item.id)}>
          <Text style={styles.btnDangerText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return <PageLoader message="Loading staff..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={staff}
        renderItem={renderStaff}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Staff</Text>
              <Text style={styles.subtitle}>Manage {staffLabel.toLowerCase()}s</Text>
            </View>
            <TouchableOpacity style={styles.headerAddBtn} onPress={handleAdd}>
              <Text style={styles.headerAddBtnText}>+ Add {staffLabel}</Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No {staffLabel.toLowerCase()}s yet.</Text>
            <TouchableOpacity style={styles.emptyAddBtn} onPress={handleAdd}>
              <Text style={styles.headerAddBtnText}>Add Your First {staffLabel}</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingStaff ? `Edit ${staffLabel}` : `Add ${staffLabel}`}</Text>
            </View>

            <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
              {errorMsg ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              ) : null}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Dr. Smith / Sara Khan"
                  value={formData.name}
                  onChangeText={(val) => setFormData({ ...formData, name: val })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Specialization</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Hair Stylist, Cardiologist..."
                  value={formData.specialization}
                  onChangeText={(val) => setFormData({ ...formData, specialization: val })}
                />
              </View>

              {!editingStaff && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="staff@business.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={formData.email}
                      onChangeText={(val) => setFormData({ ...formData, email: val })}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Min 6 characters"
                      secureTextEntry
                      value={formData.password}
                      onChangeText={(val) => setFormData({ ...formData, password: val })}
                    />
                  </View>
                </>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalBtnPrimary, saving && {opacity: 0.7}]} 
                  onPress={handleSave} 
                  disabled={saving}
                >
                  <Text style={styles.modalBtnPrimaryText}>{saving ? 'Saving...' : (editingStaff ? 'Update' : `Add ${staffLabel}`)}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalBtnSecondary} 
                  onPress={() => setModalVisible(false)}
                  disabled={saving}
                >
                  <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eff6ff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  list: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  headerAddBtn: {
    backgroundColor: primaryColor,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: primaryColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  headerAddBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  indexBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  indexText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#dbeafe', // primary-100
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1d4ed8', // primary-700
  },
  staffName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  staffSpec: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  staffEmail: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
    paddingTop: 12,
  },
  btnSecondary: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  btnSecondaryText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '500',
  },
  btnDanger: {
    backgroundColor: '#fee2e2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  btnDangerText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 16,
  },
  emptyAddBtn: {
    backgroundColor: primaryColor,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalBody: {
    padding: 20,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 40,
  },
  modalBtnPrimary: {
    flex: 1,
    backgroundColor: primaryColor,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalBtnPrimaryText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  modalBtnSecondary: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalBtnSecondaryText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default AdminStaffScreen;
