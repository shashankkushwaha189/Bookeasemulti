import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { appointmentsAPI } from '../../api';
import { getCategoryIcon } from '../../config/categories';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import PageLoader from '../../components/PageLoader';

const primaryColor = '#2563eb'; // blue-600

const StatusBadge = ({ status }) => {
  const getStyle = () => {
    switch(status) {
      case 'BOOKED': return { bg: '#dcfce7', text: '#166534' }; // emerald
      case 'COMPLETED': return { bg: '#dbeafe', text: '#1e40af' }; // blue
      case 'CANCELLED': return { bg: '#fee2e2', text: '#991b1b' }; // red
      case 'NO_SHOW': return { bg: '#ffedd5', text: '#9a3412' }; // orange
      default: return { bg: '#f1f5f9', text: '#475569' }; // slate
    }
  };
  const s = getStyle();
  return (
    <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
      <Text style={[styles.statusText, { color: s.text }]}>{status}</Text>
    </View>
  );
}

const AppointmentCard = ({ appointment, onCancel }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.businessNameRow}>
          <View style={styles.iconBox}>
            <Text style={styles.categoryIcon}>
              {getCategoryIcon(appointment.business?.category) || '📌'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.businessName} numberOfLines={1}>
              {appointment.business?.name || '—'}
            </Text>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>{appointment.business?.category || '—'}</Text>
            </View>
          </View>
        </View>
        <StatusBadge status={appointment.status} />
      </View>

      <View style={styles.appointmentDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Service</Text>
          <Text style={styles.detailValue}>{appointment.service?.name || '—'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Staff</Text>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.detailValue}>{appointment.staff?.name || '—'}</Text>
            {appointment.staff?.specialization ? (
              <Text style={styles.detailSub}>{appointment.staff.specialization}</Text>
            ) : null}
          </View>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date & Time</Text>
          <Text style={styles.detailValue}>
            {appointment.appointment_date} at {appointment.appointment_time?.slice(0, 5) || '—'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Price</Text>
          <Text style={styles.detailValuePrice}>
            {appointment.business?.currency || '₹'}
            {parseFloat(appointment.service?.price || 0).toFixed(2)}
          </Text>
        </View>
      </View>

      {appointment.status === 'BOOKED' && (
        <View style={styles.cardFooter}>
           <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => onCancel(appointment.id)}
          >
            <Text style={styles.cancelButtonText}>Cancel Appointment</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const MyAppointmentsScreen = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      loadAppointments();
    }, [])
  );

  const loadAppointments = async () => {
    try {
      const response = await appointmentsAPI.getMy();
      setAppointments(response.data);
    } catch (error) {
      console.error('Error loading appointments:', error);
      Alert.alert('Error', 'Failed to load appointments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAppointments();
  };

  const handleCancel = async (appointmentId) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'Keep It', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await appointmentsAPI.update(appointmentId, { status: 'CANCELLED' });
              setAppointments(prev =>
                prev.map(a =>
                  a.id === appointmentId ? { ...a, status: 'CANCELLED' } : a
                )
              );
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to cancel appointment');
            }
          },
        },
      ]
    );
  };

  const today = new Date().toISOString().split('T')[0];

  const filteredAppointments = appointments.filter(a => {
    if (filter === 'upcoming') return a.appointment_date >= today && a.status === 'BOOKED';
    if (filter === 'history') return a.appointment_date < today || a.status !== 'BOOKED';
    return true;
  });

  const stats = {
    total: appointments.length,
    upcoming: appointments.filter(a => a.appointment_date >= today && a.status === 'BOOKED').length,
    completed: appointments.filter(a => a.status === 'COMPLETED').length,
  };

  if (loading) {
    return <PageLoader message="Loading appointments..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredAppointments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <AppointmentCard appointment={item} onCancel={handleCancel} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={primaryColor} />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>My Appointments</Text>
                <Text style={styles.subtitle}>All your bookings across businesses</Text>
              </View>
              <TouchableOpacity onPress={logout} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fee2e2', borderRadius: 8, marginRight: 12 }}>
                <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 14 }}>Logout</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerBookBtn} onPress={() => navigation.navigate('Browse')}>
                <Text style={styles.headerBookBtnText}>+ Book New</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statsContainer}>
              <View style={[styles.statCard, { borderColor: '#e2e8f0' }]}>
                <Text style={[styles.statNumber, { color: '#0f172a' }]}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={[styles.statCard, { borderColor: '#bfdbfe' }]}>
                <Text style={[styles.statNumber, { color: primaryColor }]}>{stats.upcoming}</Text>
                <Text style={styles.statLabel}>Upcoming</Text>
              </View>
              <View style={[styles.statCard, { borderColor: '#bbf7d0' }]}>
                <Text style={[styles.statNumber, { color: '#16a34a' }]}>{stats.completed}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
            </View>

            <View style={styles.filterContainer}>
              {['all', 'upcoming', 'history'].map(f => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterButton, filter === f ? styles.activeFilter : styles.inactiveFilter]}
                  onPress={() => setFilter(f)}
                >
                  <Text style={[styles.filterButtonText, filter === f ? styles.activeFilterText : styles.inactiveFilterText]}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="calendar-outline" size={32} color="#94a3b8" />
            </View>
            <Text style={styles.emptyTextTitle}>No appointments found</Text>
            <TouchableOpacity style={styles.emptyBookBtn} onPress={() => navigation.navigate('Browse')}>
              <Text style={styles.emptyBookBtnText}>Book Your First Appointment →</Text>
            </TouchableOpacity>
          </View>
        }
      />
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
  headerRow: {
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
  headerBookBtn: {
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
  headerBookBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  activeFilter: {
    backgroundColor: primaryColor,
    borderColor: primaryColor,
  },
  inactiveFilter: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#ffffff',
  },
  inactiveFilterText: {
    color: '#475569',
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
    marginBottom: 16,
  },
  businessNameRow: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIcon: {
    fontSize: 20,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  appointmentDetails: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  detailSub: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  detailValuePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: primaryColor,
  },
  cardFooter: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  cancelButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    backgroundColor: '#f1f5f9',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTextTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 16,
  },
  emptyBookBtn: {
    backgroundColor: primaryColor,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyBookBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MyAppointmentsScreen;
