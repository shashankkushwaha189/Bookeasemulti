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
import { superAdminAPI } from '../../api';

import PageLoader from '../../components/PageLoader';

const primaryColor = '#2563eb';

const roleColors = {
  SUPER_ADMIN: { bg: '#f3e8ff', text: '#7e22ce' }, // purple
  ADMIN: { bg: '#dbeafe', text: '#1d4ed8' },       // blue
  STAFF: { bg: '#ccfbf1', text: '#0f766e' },       // teal
  CUSTOMER: { bg: '#dcfce7', text: '#15803d' },    // emerald
};

const SuperAdminUsersScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('email');
  const [sortOrder, setSortOrder] = useState('asc');

  const [editModal, setEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ email: '', role: '' });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await superAdminAPI.getUsers();
      setUsers(response.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  }).sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    if (sortBy === 'business') {
      aVal = a.business?.name || '';
      bVal = b.business?.name || '';
    }
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const openEdit = (user) => {
    setEditingUser(user);
    setEditForm({ 
      email: user.email, 
      role: user.role 
    });
    setErrorMsg('');
    setEditModal(true);
  };

  const closeEditModal = () => {
    setEditModal(false);
    setEditingUser(null);
    setEditForm({ email: '', role: '' });
    setErrorMsg('');
  };

  const handleUpdateUser = async () => {
    setSaving(true);
    setErrorMsg('');
    
    try {
      const updateData = {};
      if (editForm.email !== editingUser.email) updateData.email = editForm.email;
      if (editForm.role !== editingUser.role) updateData.role = editForm.role;
      
      const response = await superAdminAPI.updateUser(editingUser.id, updateData);
      setUsers(users.map(u => u.id === editingUser.id ? response.data : u));
      closeEditModal();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }
    
    setSaving(true);
    setErrorMsg('');
    
    try {
      await superAdminAPI.updateUser(editingUser.id, { password: newPassword });
      Alert.alert('Success', 'Password reset successfully');
      setShowPasswordReset(false);
      setNewPassword('');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setSaving(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const renderUser = ({ item: u }) => {
    const rColors = roleColors[u.role] || { bg: '#f3f4f6', text: '#374151' };
    const canEdit = u.role === 'ADMIN';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.userEmail} numberOfLines={1}>{u.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: rColors.bg }]}>
            <Text style={[styles.roleText, { color: rColors.text }]}>{u.role}</Text>
          </View>
        </View>

        <View style={styles.cardDetailRow}>
          <Text style={styles.detailLabel}>Business:</Text>
          <Text style={styles.detailValue} numberOfLines={1}>{u.business?.name || '—'}</Text>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={[styles.btnEdit, !canEdit && styles.btnDisabled]} 
            onPress={() => openEdit(u)}
            disabled={!canEdit}
          >
            <Text style={[styles.btnEditText, !canEdit && styles.btnTextDisabled]}>Edit</Text>
          </TouchableOpacity>
          {canEdit && (
            <TouchableOpacity 
              style={styles.btnPassword} 
              onPress={() => {
                setEditingUser(u);
                setShowPasswordReset(true);
                setNewPassword('');
                setErrorMsg('');
              }}
            >
              <Text style={styles.btnPasswordText}>Reset Password</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return <PageLoader message="Loading users..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filtered}
        renderItem={renderUser}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerArea}>
            <Text style={styles.pageTitle}>All Users</Text>
            <Text style={styles.pageSubtitle}>System-wide user accounts</Text>

            <View style={styles.controlsRow}>
              <View style={styles.searchBox}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search users..."
                  value={search}
                  onChangeText={setSearch}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.filterRowItems}>
              {['all', 'SUPER_ADMIN', 'ADMIN', 'STAFF', 'CUSTOMER'].map(f => (
                <TouchableOpacity 
                  key={f}
                  style={[styles.filterBtn, roleFilter === f ? styles.filterActive : styles.filterInactive]}
                  onPress={() => setRoleFilter(f)}
                >
                  <Text style={roleFilter === f ? styles.filterTextActive : styles.filterTextInactive}>
                    {f === 'all' ? 'All' : f.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.sortRow}>
              <Text style={styles.sortLabel}>Sort by:</Text>
              {['email', 'role', 'business'].map(field => (
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
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No users found.</Text>
          </View>
        }
      />

      <Modal visible={editModal} animationType="slide" transparent={true}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit User</Text>
            </View>

            <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
              {errorMsg ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              ) : null}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput 
                  style={styles.input} 
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={editForm.email} 
                  onChangeText={(val) => setEditForm({ ...editForm, email: val })} 
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Role</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginVertical: 4}}>
                   {['ADMIN', 'STAFF', 'CUSTOMER'].map(r => {
                     const isSuperAdmin = editingUser?.role === 'SUPER_ADMIN';
                     if (isSuperAdmin && r !== 'SUPER_ADMIN') return null; // Can't change super admin to others manually via UI without advanced picker logic, matching the web constraint
                     const isActive = editForm.role === r;
                     return (
                       <TouchableOpacity 
                         key={r} 
                         disabled={isSuperAdmin}
                         onPress={() => setEditForm({...editForm, role: r})}
                         style={[
                           styles.roleSelectBtn, 
                           isActive && styles.roleSelectBtnActive,
                           isSuperAdmin && { opacity: 0.5 }
                         ]}
                       >
                         <Text style={[styles.roleSelectText, isActive && styles.roleSelectTextActive]}>{r}</Text>
                       </TouchableOpacity>
                     )
                   })}
                </ScrollView>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtnPrimary, saving && {opacity: 0.7}]} onPress={handleUpdateUser} disabled={saving}>
                  <Text style={styles.modalBtnPrimaryText}>{saving ? 'Saving...' : 'Update'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalBtnSecondary} onPress={closeEditModal} disabled={saving}>
                  <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Password Reset Modal */}
      <Modal visible={showPasswordReset} animationType="slide" transparent={true}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reset Password</Text>
            </View>

            <View style={styles.modalBody}>
              {errorMsg ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              ) : null}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>User Email</Text>
                <Text style={styles.staticText}>{editingUser?.email}</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Enter new password (min 6 chars)"
                  secureTextEntry
                  value={newPassword} 
                  onChangeText={setNewPassword}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalBtnPrimary, saving && {opacity: 0.7}]} 
                  onPress={handlePasswordReset} 
                  disabled={saving}
                >
                  <Text style={styles.modalBtnPrimaryText}>
                    {saving ? 'Resetting...' : 'Reset Password'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalBtnSecondary} 
                  onPress={() => {
                    setShowPasswordReset(false);
                    setEditingUser(null);
                    setNewPassword('');
                    setErrorMsg('');
                  }} 
                  disabled={saving}
                >
                  <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
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
    marginBottom: 16,
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
    marginBottom: 20,
  },
  controlsRow: {
    marginBottom: 8,
  },
  searchBox: {
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  filterScroll: {
    marginBottom: 8,
  },
  filterRowItems: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 8,
    marginBottom: 16,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
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
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterActive: {
    backgroundColor: '#334155',
    borderColor: '#334155',
  },
  filterInactive: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
  },
  filterTextActive: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  filterTextInactive: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '500',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    marginRight: 12,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748b',
    marginRight: 4,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
  },
  cardActions: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
    alignItems: 'flex-start',
  },
  btnEdit: {
    backgroundColor: '#eff6ff',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  btnDisabled: {
    backgroundColor: '#f1f5f9',
  },
  btnEditText: {
    color: primaryColor,
    fontSize: 13,
    fontWeight: '600',
  },
  btnTextDisabled: {
    color: '#94a3b8',
  },
  btnPassword: {
    backgroundColor: '#fef3c7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  btnPasswordText: {
    color: '#b45309',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
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
    marginBottom: 20,
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
  roleSelectBtn: {
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#e2e8f0', 
    marginRight: 8
  },
  roleSelectBtnActive: {
    backgroundColor: primaryColor, 
    borderColor: primaryColor
  },
  roleSelectText: {
    color: '#475569',
    fontWeight: '500',
  },
  roleSelectTextActive: {
    color: '#ffffff'
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
  staticText: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
});

export default SuperAdminUsersScreen;
