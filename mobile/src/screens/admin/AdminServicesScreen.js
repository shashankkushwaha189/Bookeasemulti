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
import { servicesAPI } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { getServiceLabel } from '../../config/categories';

import PageLoader from '../../components/PageLoader';

const primaryColor = '#2563eb'; // blue-600

const AdminServicesScreen = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState(null);
  
  const emptyForm = { name: '', duration_minutes: '30', price: '' };
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { user } = useAuth();
  const serviceLabel = getServiceLabel(user?.businessCategory) || 'Service';

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await servicesAPI.getAll();
      setServices(response.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingService(null);
    setFormData(emptyForm);
    setErrorMsg('');
    setModalVisible(true);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      price: service.price ? service.price.toString() : '',
      duration_minutes: service.duration_minutes ? service.duration_minutes.toString() : '30',
    });
    setErrorMsg('');
    setModalVisible(true);
  };

  const handleDelete = (serviceId) => {
    Alert.alert(
      'Delete Service',
      'Are you sure you want to delete this service?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await servicesAPI.delete(serviceId);
              setServices(prev => prev.filter(s => s.id !== serviceId));
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete service');
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    const { name, price, duration_minutes } = formData;
    setErrorMsg('');

    if (!name || !price || !duration_minutes) {
      setErrorMsg('Please fill in all fields');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        price: parseFloat(price),
        duration_minutes: parseInt(duration_minutes),
        businessId: user.business_id,
      };

      if (editingService) {
        await servicesAPI.update(editingService.id, payload);
      } else {
        await servicesAPI.create(payload);
      }
      
      await loadServices();
      setModalVisible(false);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const renderService = ({ item, index }) => (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.indexBox}>
          <Text style={styles.indexText}>{index + 1}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.serviceName}>{item.name}</Text>
          <View style={styles.serviceMetaRow}>
            <Text style={styles.serviceMeta}>{item.duration_minutes} min</Text>
            <Text style={styles.serviceMetaDot}> • </Text>
            <Text style={styles.serviceMetaPrice}>₹{parseFloat(item.price || 0).toFixed(2)}</Text>
          </View>
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
    return <PageLoader message="Loading services..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={services}
        renderItem={renderService}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Services</Text>
              <Text style={styles.subtitle}>Manage {serviceLabel.toLowerCase()}s offered</Text>
            </View>
            <TouchableOpacity style={styles.headerAddBtn} onPress={handleAdd}>
              <Text style={styles.headerAddBtnText}>+ Add Service</Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No services yet. Add one to get started.</Text>
            <TouchableOpacity style={styles.emptyAddBtn} onPress={handleAdd}>
              <Text style={styles.headerAddBtnText}>Add Your First Service</Text>
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
              <Text style={styles.modalTitle}>{editingService ? 'Edit Service' : 'Add Service'}</Text>
            </View>

            <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
              {errorMsg ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              ) : null}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Haircut, Consultation..."
                  value={formData.name}
                  onChangeText={(val) => setFormData({ ...formData, name: val })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Duration (minutes)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="30"
                  keyboardType="numeric"
                  value={formData.duration_minutes}
                  onChangeText={(val) => setFormData({ ...formData, duration_minutes: val })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Price (₹)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  keyboardType="numeric"
                  value={formData.price}
                  onChangeText={(val) => setFormData({ ...formData, price: val })}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalBtnPrimary, saving && {opacity: 0.7}]} 
                  onPress={handleSave} 
                  disabled={saving}
                >
                  <Text style={styles.modalBtnPrimaryText}>{saving ? 'Saving...' : (editingService ? 'Update' : 'Add')}</Text>
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
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  serviceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceMeta: {
    fontSize: 14,
    color: '#64748b',
  },
  serviceMetaDot: {
    fontSize: 14,
    color: '#cbd5e1',
    marginHorizontal: 4,
  },
  serviceMetaPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
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

export default AdminServicesScreen;
