import React, { useState, useEffect } from 'react';
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
import PageLoader from '../../components/PageLoader';
import { staffAPI, appointmentsAPI } from '../../api';
import { getCategoryIcon } from '../../config/categories';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowRightOnRectangleIcon } from 'react-native-heroicons/outline';
import { rf, rw, PAGE_PADDING, isSmallScreen } from '../../config/responsive';

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

const StaffDashboardScreen = () => {
  const [appointments, setAppointments] = useState([]);
  const [todayStr, setTodayStr] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('today');
  const { logout } = useAuth();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await staffAPI.getMyAppointments();
      setAppointments(response.data?.appointments || []);
      setTodayStr(response.data?.today || new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error('Error loading staff dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const handleComplete = async (id) => {
    Alert.alert(
      'Complete Appointment',
      'Have you completed this appointment?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Mark Done', 
          style: 'default',
          onPress: async () => {
            try {
              await appointmentsAPI.update(id, { status: 'COMPLETED' });
              setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'COMPLETED' } : a));
            } catch (err) {
              Alert.alert('Error', 'Failed to update appointment status.');
            }
          }
        }
      ]
    );
  };

  const displayed = filter === 'today' ? appointments.filter(a => a.appointment_date === todayStr) : appointments;
  const todayPending = appointments.filter(a => a.appointment_date === todayStr && a.status === 'BOOKED').length;
  const totalCompleted = appointments.filter(a => a.status === 'COMPLETED').length;

  const dateFormatted = todayStr 
    ? new Date(todayStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) 
    : '';

  const renderAppointment = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.customerBox}>
          <Text style={styles.customerName}>{item.customer?.name || '—'}</Text>
          <Text style={styles.customerPhone}>{item.customer?.phone || '—'}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>

      <View style={styles.businessBox}>
        <Text style={styles.businessIcon}>{getCategoryIcon(item.business?.category)}</Text>
        <Text style={styles.businessName}>{item.business?.name || '—'}</Text>
      </View>

      <View style={styles.detailsBox}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Service</Text>
          <Text style={styles.detailValue}>{item.service?.name || '—'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date • Time</Text>
          <Text style={styles.detailValue}>{item.appointment_date} • {item.appointment_time?.slice(0,5)}</Text>
        </View>
      </View>

      {item.status === 'BOOKED' && (
        <View style={styles.cardFooter}>
           <TouchableOpacity
            style={styles.doneButton}
            onPress={() => handleComplete(item.id)}
          >
            <Text style={styles.doneButtonText}>✓ Mark as Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading && !refreshing) {
    return <PageLoader message="Loading schedule..." />;
  }

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
              <View style={styles.headerText}>
                <Text style={styles.title}>My Schedule</Text>
                <Text style={styles.subtitle}>{dateFormatted}</Text>
              </View>
              <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                <ArrowRightOnRectangleIcon size={rw(18)} color="#ef4444" />
                {!isSmallScreen && <Text style={styles.logoutText}>Logout</Text>}
              </TouchableOpacity>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <View style={styles.statCardInner}>
                  <Text style={[styles.statNumber, {color: primaryColor}]}>{todayPending}</Text>
                  <Text style={styles.statLabel}>Pending Today</Text>
                </View>
              </View>
              <View style={styles.statCard}>
                <View style={styles.statCardInner}>
                  <Text style={[styles.statNumber, {color: '#16a34a'}]}>{totalCompleted}</Text>
                  <Text style={styles.statLabel}>Completed Total</Text>
                </View>
              </View>
            </View>

            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[styles.filterButton, filter === 'today' ? styles.activeFilter : styles.inactiveFilter]}
                onPress={() => setFilter('today')}
              >
                <Text style={[styles.filterButtonText, filter === 'today' ? styles.activeFilterText : styles.inactiveFilterText]}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, filter === 'all' ? styles.activeFilter : styles.inactiveFilter]}
                onPress={() => setFilter('all')}
              >
                <Text style={[styles.filterButtonText, filter === 'all' ? styles.activeFilterText : styles.inactiveFilterText]}>All</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {filter === 'today' ? 'No appointments today.' : 'No appointments found.'}
            </Text>
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
  list: {
    padding: PAGE_PADDING,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: rw(20),
  },
  headerText: {
    flex: 1,
    paddingRight: rw(10),
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rw(10),
    paddingVertical: rw(8),
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    gap: 4,
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: '700',
    fontSize: rf(13),
    marginLeft: 4,
  },
  title: {
    fontSize: rf(24),
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: rf(12),
    color: '#64748b',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: rw(18),
    marginHorizontal: -4,
  },
  statCard: {
    flex: 1,
    paddingHorizontal: 4,
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
    fontSize: rf(28),
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: rf(11),
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
    paddingHorizontal: 20,
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
    marginBottom: 12,
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
  businessBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  businessIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  businessName: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  detailsBox: {
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
  cardFooter: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  doneButton: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#d1fae5',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#059669', // emerald-600
    fontSize: 14,
    fontWeight: '600',
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

export default StaffDashboardScreen;
