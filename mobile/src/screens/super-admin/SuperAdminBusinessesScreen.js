// Updated to fix metro bundler cache issue
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
import { businessAPI } from '../../api';
import { CATEGORIES, getCategoryIcon } from '../../config/categories';
import PageLoader from '../../components/PageLoader';

const primaryColor = '#2563eb'; // blue-600

const SuperAdminBusinessesScreen = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const emptyForm = { 
    name: '', category: 'Healthcare', address: '', phone: '', 
    description: '', speciality: '', currency: '₹', 
    adminEmail: '', adminPassword: '' 
  };
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [catFilter, setCatFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showInactive, setShowInactive] = useState(true);

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      const response = await businessAPI.getAllAdmin();
      setBusinesses(response.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load businesses');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingBusiness(null);
    setFormData(emptyForm);
    setErrorMsg('');
    setModalVisible(true);
  };

  const handleEdit = (b) => {
    setEditingBusiness(b);
    setFormData({
      name: b.name,
      category: b.category,
      address: b.address || '',
      phone: b.phone || '',
      description: b.description || '',
      speciality: b.speciality || '',
      currency: b.currency || '₹',
      adminEmail: '',
      adminPassword: ''
    });
    setErrorMsg('');
    setModalVisible(true);
  };

  const handleToggle = async (b) => {
    try {
      await businessAPI.update(b.id, { is_active: !b.is_active });
      loadBusinesses();
    } catch (error) {
      Alert.alert('Error', 'Failed to update business status');
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Business',
      'Delete this business and ALL its data? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await businessAPI.delete(id);
              setBusinesses(prev => prev.filter(b => b.id !== id));
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    const { name, category } = formData;
    setErrorMsg('');

    if (!name || !category) {
      setErrorMsg('Business Name and Category are required');
      return;
    }

    setSaving(true);
    try {
      if (editingBusiness) {
        await businessAPI.update(editingBusiness.id, {
          name: formData.name,
          category: formData.category,
          address: formData.address,
          phone: formData.phone,
          description: formData.description,
          speciality: formData.speciality,
          currency: formData.currency,
        });
      } else {
        await businessAPI.create(formData);
      }
      
      await loadBusinesses();
      setModalVisible(false);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to save business');
    } finally {
      setSaving(false);
    }
  };

  const filtered = catFilter === 'All' ? businesses : businesses.filter(b => b.category === catFilter);
  const displayBusinesses = showInactive ? filtered : filtered.filter(b => b.is_active);
  
  const sortedBusinesses = displayBusinesses.sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    if (sortBy === 'category') {
      aVal = a.category;
      bVal = b.category;
    } else if (sortBy === 'appointments') {
      aVal = a.appointmentCount || 0;
      bVal = b.appointmentCount || 0;
    }
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const renderBusiness = ({ item: b }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{getCategoryIcon(b.category)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.businessName} numberOfLines={1}>{b.name}</Text>
            <View style={styles.catPill}>
              <Text style={styles.catPillText}>{b.category}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.badge, b.is_active ? styles.badgeActive : styles.badgeInactive]}>
          <Text style={[styles.badgeText, b.is_active ? styles.badgeTextActive : styles.badgeTextInactive]}>
            {b.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      {b.speciality ? <Text style={styles.bSpec}>{b.speciality}</Text> : null}
      {b.address ? <Text style={styles.bDesc}>📍 {b.address}</Text> : null}
      {b.phone ? <Text style={styles.bDesc}>📞 {b.phone}</Text> : null}

      <View style={styles.countsRow}>
        <View style={styles.countBox}><Text style={styles.countText}>{b.staffCount} staff</Text></View>
        <View style={styles.countBox}><Text style={styles.countText}>{b.serviceCount} services</Text></View>
        <View style={styles.countBox}><Text style={styles.countText}>{b.appointmentCount} appts</Text></View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.btnSecondary} onPress={() => handleEdit(b)}>
          <Text style={styles.btnSecondaryText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={b.is_active ? styles.btnWarn : styles.btnSuccess} 
          onPress={() => handleToggle(b)}
        >
          <Text style={b.is_active ? styles.btnWarnText : styles.btnSuccessText}>
            {b.is_active ? 'Deactivate' : 'Activate'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnDanger} onPress={() => handleDelete(b.id)}>
          <Text style={styles.btnDangerText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return <PageLoader message="Loading businesses..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={sortedBusinesses}
        renderItem={renderBusiness}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerArea}>
            <View style={styles.headerTitleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.pageTitle}>Businesses</Text>
                <Text style={styles.pageSubtitle}>Manage all businesses</Text>
              </View>
              <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
                <Text style={styles.addBtnText}>+ Add Business</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <View style={styles.filterRow}>
                <TouchableOpacity 
                  style={[styles.filterBtn, catFilter === 'All' ? styles.filterActive : styles.filterInactive]}
                  onPress={() => setCatFilter('All')}
                >
                  <Text style={catFilter === 'All' ? styles.fTextActive : styles.fTextInactive}>
                    All ({businesses.length})
                  </Text>
                </TouchableOpacity>

                {CATEGORIES.map(cat => {
                   const count = businesses.filter(b => b.category === cat.value).length;
                   if (!count) return null;
                   const isActive = catFilter === cat.value;
                   return (
                     <TouchableOpacity 
                       key={cat.value} 
                       style={[styles.filterBtn, isActive ? styles.filterActive : styles.filterInactive]}
                       onPress={() => setCatFilter(cat.value)}
                     >
                       <Text style={isActive ? styles.fTextActive : styles.fTextInactive}>
                         {cat.icon} {cat.label} ({count})
                       </Text>
                     </TouchableOpacity>
                   )
                })}
              </View>
            </ScrollView>

            <View style={styles.controlsRow}>
              <View style={styles.sortRow}>
                <Text style={styles.sortLabel}>Sort by:</Text>
                {['name', 'category', 'appointments'].map(field => (
                  <TouchableOpacity
                    key={field}
                    style={[styles.sortBtn, sortBy === field && styles.sortBtnActive]}
                    onPress={() => handleSort(field)}
                  >
                    <Text style={sortBy === field ? styles.sortBtnTextActive : styles.sortBtnText}>
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </Text>
                    {sortBy === field && (
                      <Text style={styles.sortArrow}>
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              
              <TouchableOpacity 
                style={[styles.toggleBtn, showInactive && styles.toggleBtnActive]}
                onPress={() => setShowInactive(!showInactive)}
              >
                <Text style={showInactive ? styles.toggleBtnTextActive : styles.toggleBtnText}>
                  {showInactive ? 'Show Active Only' : 'Show All'}
                </Text>
              </TouchableOpacity>
            </View>
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
              <Text style={styles.modalTitle}>{editingBusiness ? 'Edit Business' : 'Add New Business'}</Text>
            </View>

            <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
              {errorMsg ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              ) : null}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Business Name *</Text>
                <TextInput style={styles.input} placeholder="e.g. Glamour Studio" value={formData.name} onChangeText={(val) => setFormData({ ...formData, name: val })} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category *</Text>
                {/* Fallback to simple picker by showing categories explicitly - or a mock dropdown in RN */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginVertical: 4}}>
                   {CATEGORIES.map(c => (
                     <TouchableOpacity 
                       key={c.value} 
                       onPress={() => setFormData({...formData, category: c.value})}
                       style={[{paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', marginRight: 8}, formData.category === c.value && {backgroundColor: primaryColor, borderColor: primaryColor}]}
                     >
                       <Text style={[formData.category === c.value && {color: 'white'}]}>{c.icon} {c.label}</Text>
                     </TouchableOpacity>
                   ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Speciality</Text>
                <TextInput style={styles.input} placeholder="e.g. Hair & Beauty, Cardiology..." value={formData.speciality} onChangeText={(val) => setFormData({ ...formData, speciality: val })} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Address</Text>
                <TextInput style={styles.input} placeholder="123 Main St, City" value={formData.address} onChangeText={(val) => setFormData({ ...formData, address: val })} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone</Text>
                <TextInput style={styles.input} placeholder="+91 9876543210" value={formData.phone} onChangeText={(val) => setFormData({ ...formData, phone: val })} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput style={[styles.input, {height: 80, textAlignVertical: 'top'}]} multiline numberOfLines={3} placeholder="About this business..." value={formData.description} onChangeText={(val) => setFormData({ ...formData, description: val })} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Currency Symbol</Text>
                <TextInput style={styles.input} placeholder="₹ or $ or €" value={formData.currency} onChangeText={(val) => setFormData({ ...formData, currency: val })} />
              </View>

              {!editingBusiness && (
                <View style={styles.adminSection}>
                  <Text style={styles.adminSectionLabel}>ADMIN ACCOUNT (OPTIONAL)</Text>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Admin Email</Text>
                    <TextInput style={styles.input} placeholder="admin@business.com" autoCapitalize="none" keyboardType="email-address" value={formData.adminEmail} onChangeText={(val) => setFormData({ ...formData, adminEmail: val })} />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Admin Password</Text>
                    <TextInput style={styles.input} placeholder="Min 6 characters" secureTextEntry value={formData.adminPassword} onChangeText={(val) => setFormData({ ...formData, adminPassword: val })} />
                  </View>
                </View>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtnPrimary, saving && {opacity: 0.7}]} onPress={handleSave} disabled={saving}>
                  <Text style={styles.modalBtnPrimaryText}>{saving ? 'Saving...' : (editingBusiness ? 'Update' : 'Create Business')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => setModalVisible(false)} disabled={saving}>
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
  list: {
    padding: 20,
    paddingBottom: 40,
  },
  headerArea: {
    marginBottom: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  addBtn: {
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
  addBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  filterScroll: {
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 8,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    gap: 4,
  },
  sortBtnActive: {
    backgroundColor: primaryColor,
  },
  sortBtnText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  sortBtnTextActive: {
    color: '#ffffff',
  },
  sortArrow: {
    fontSize: 10,
    fontWeight: '600',
  },
  toggleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  toggleBtnActive: {
    backgroundColor: primaryColor,
    borderColor: primaryColor,
  },
  toggleBtnText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  toggleBtnTextActive: {
    color: '#ffffff',
  },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  filterActive: {
    backgroundColor: primaryColor,
    borderColor: primaryColor,
  },
  filterInactive: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
  },
  fTextActive: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  fTextInactive: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '500',
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#dbeafe', 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
    marginRight: 8,
  },
  catPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  catPillText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeActive: {
    backgroundColor: '#dcfce7',
  },
  badgeInactive: {
    backgroundColor: '#fee2e2',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  badgeTextActive: {
    color: '#166534',
  },
  badgeTextInactive: {
    color: '#991b1b',
  },

  bSpec: {
    fontSize: 12,
    fontWeight: '600',
    color: primaryColor,
    marginBottom: 4,
  },
  bDesc: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },

  countsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    marginTop: 4,
  },
  countBox: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  countText: {
    fontSize: 11,
    color: '#475569',
  },

  cardActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  btnWarn: {
    flex: 1,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnWarnText: {
    color: '#b45309',
    fontSize: 12,
    fontWeight: '600',
  },
  btnSuccess: {
    flex: 1,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnSuccessText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '600',
  },
  btnDanger: {
    flex: 1,
    backgroundColor: '#fee2e2',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnDangerText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '600',
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
    maxHeight: '92%',
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
  adminSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
  },
  adminSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 12,
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

export default SuperAdminBusinessesScreen;
