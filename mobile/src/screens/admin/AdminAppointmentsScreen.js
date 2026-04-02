import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { appointmentsAPI } from '../../api';
import { useFocusEffect } from '@react-navigation/native';
import PageLoader from '../../components/PageLoader';
import { rf, rw, PAGE_PADDING } from '../../config/responsive';

const primaryColor = '#2563eb'; // blue-600

const StatusBadge = ({ status }) => {
  const getStyle = () => {
    switch(status) {
      case 'BOOKED': return { bg: '#dcfce7', text: '#166534' }; 
      case 'COMPLETED': return { bg: '#dbeafe', text: '#1e40af' }; 
      case 'CANCELLED': return { bg: '#fee2e2', text: '#991b1b' }; 
      case 'NO_SHOW': return { bg: '#ffedd5', text: '#9a3412' }; 
      default: return { bg: '#f1f5f9', text: '#475569' }; 
    }
  };
  const s = getStyle();
  return (
    <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
      <Text style={[styles.statusText, { color: s.text }]}>{status}</Text>
    </View>
  );
}

const AdminAppointmentsScreen = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  useFocusEffect(
    useCallback(() => {
      loadAppointments();
    }, [])
  );

  const loadAppointments = async () => {
    try {
      const response = await appointmentsAPI.getBusiness();
      setAppointments(response.data || []);
    } catch (error) {
      console.error('Error loading admin appointments', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAppointments();
  };

  const today = new Date().toISOString().split('T')[0];

  const displayed = appointments.filter(a => {
    if (filter === 'today')     return a.appointment_date === today;
    if (filter === 'booked')    return a.status === 'BOOKED';
    if (filter === 'completed') return a.status === 'COMPLETED';
    if (filter === 'cancelled') return a.status === 'CANCELLED';
    return true;
  });

  const renderAppointment = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.customerBox}>
          <Text style={styles.customerName} numberOfLines={1}>{item.customer?.name || '—'}</Text>
          <Text style={styles.customerPhone}>{item.customer?.phone || '—'}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>

      <View style={styles.detailsBox}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Service • Staff</Text>
          <Text style={styles.detailValue}>{item.service?.name || '—'} • {item.staff?.name || '—'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date • Time</Text>
          <Text style={styles.detailValue}>{item.appointment_date} • {item.appointment_time?.slice(0,5)}</Text>
        </View>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return <PageLoader message="Loading appointments..." />;
  }

  const statTotal = appointments.length;
  const statBooked = appointments.filter(a => a.status === 'BOOKED').length;
  const statCompleted = appointments.filter(a => a.status === 'COMPLETED').length;
  const statCancelled = appointments.filter(a => a.status === 'CANCELLED').length;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={displayed}
        renderItem={renderAppointment}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={primaryColor} />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.title}>Appointments</Text>
              <Text style={styles.subtitle}>All appointments at your business</Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <View style={styles.statCardInner}>
                  <Text style={[styles.statNumber, {color: '#0f172a'}]}>{statTotal}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
              </View>
              <View style={styles.statCard}>
                <View style={styles.statCardInner}>
                  <Text style={[styles.statNumber, {color: primaryColor}]}>{statBooked}</Text>
                  <Text style={styles.statLabel}>Booked</Text>
                </View>
              </View>
              <View style={styles.statCard}>
                <View style={styles.statCardInner}>
                  <Text style={[styles.statNumber, {color: '#16a34a'}]}>{statCompleted}</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
              </View>
              <View style={styles.statCard}>
                <View style={styles.statCardInner}>
                  <Text style={[styles.statNumber, {color: '#dc2626'}]}>{statCancelled}</Text>
                  <Text style={styles.statLabel}>Cancelled</Text>
                </View>
              </View>
            </View>

            <View style={styles.filterContainer}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {['all','today','booked','completed','cancelled'].map(f => (
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
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No appointments found.</Text>
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
    padding: PAGE_PADDING,
    paddingBottom: 40,
  },
  header: {
    marginBottom: rw(20),
  },
  title: {
    fontSize: rf(24),
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: rf(13),
    color: '#64748b',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: rw(16),
    marginHorizontal: -4,
  },
  statCard: {
    width: '50%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  statCardInner: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: rw(14),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statNumber: {
    fontSize: rf(22),
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: rf(11),
    color: '#64748b',
    fontWeight: '500',
  },
  filterContainer: {
    marginBottom: rw(16),
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
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
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  customerBox: {
    flex: 1,
    marginRight: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 13,
    color: '#64748b',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  detailsBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1e293b',
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
  },
});

export default AdminAppointmentsScreen;
