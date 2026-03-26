import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { businessAPI, appointmentsAPI, staffAPI } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { getCategoryIcon } from '../../config/categories';
import { Ionicons } from '@expo/vector-icons';
import PageLoader from '../../components/PageLoader';

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

const StatCard = ({ label, value, icon, bgColor, textColor }) => (
  <View style={[styles.statCard, { backgroundColor: bgColor }]}>
    <View style={styles.statIconWrap}>
      <Text style={styles.statIcon}>{icon}</Text>
    </View>
    <View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={[styles.statLabel, { color: textColor }]}>{label}</Text>
    </View>
  </View>
);

const AdminDashboardScreen = () => {
  const [stats, setStats] = useState({
    appointments: [],
    services: [],
    staff: [],
  });
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const [appointmentsRes, servicesRes, staffRes] = await Promise.all([
        appointmentsAPI.getBusiness(),
        businessAPI.getServices(user.business_id),
        businessAPI.getStaff(user.business_id),
      ]);
      setStats({
        appointments: appointmentsRes.data || [],
        services: servicesRes.data || [],
        staff: staffRes.data || [],
      });
    } catch (error) {
      console.error('API Error in AdminDashboard:', error?.response?.data || error.message);
      Alert.alert('Error', error?.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayCount = stats.appointments.filter(a => a.appointment_date === today && a.status === 'BOOKED').length;
  const recentAppointments = stats.appointments.slice(0, 8);
  const catIcon = getCategoryIcon(user?.businessCategory);

  if (loading) {
    return <PageLoader message="Loading dashboard..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={[styles.header, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }]}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={styles.pageTitle}>Admin Dashboard</Text>
            <Text style={styles.pageSubtitle}>Manage your business operations</Text>
          </View>
          <TouchableOpacity onPress={logout} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fee2e2', borderRadius: 8 }}>
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 14 }}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileBox}>
          <View style={styles.profileIconBox}>
            <Text style={styles.profileIconText}>{catIcon || '🏢'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileTitle}>{user?.businessName || 'Dashboard'}</Text>
            <Text style={styles.profileSubtitle}>{user?.businessCategory} · Business overview</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatCard label="Total Appointments" value={stats.appointments.length} icon="📅" bgColor="#eff6ff" textColor="#1e40af" />
          <StatCard label="Today's Bookings"   value={todayCount}                icon="🕐" bgColor="#fffbeb" textColor="#92400e" />
          <StatCard label="Staff Members"      value={stats.staff.length}        icon="👤" bgColor="#faf5ff" textColor="#6b21a8" />
          <StatCard label="Services"           value={stats.services.length}     icon="✂️" bgColor="#ecfdf5" textColor="#065f46" />
        </View>

        <View style={styles.tableCard}>
          <View style={styles.tableCardHeader}>
            <Text style={styles.tableCardTitle}>Recent Appointments</Text>
          </View>
          
          <View style={styles.tableBody}>
            {recentAppointments.length === 0 ? (
              <View style={styles.tableEmpty}>
                <Text style={styles.tableEmptyText}>No appointments yet.</Text>
              </View>
            ) : (
              recentAppointments.map((a, index) => (
                <View key={a.id} style={[styles.appointmentRow, index !== recentAppointments.length - 1 && styles.borderBottom]}>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6}}>
                    <Text style={styles.aptCustomer} numberOfLines={1}>{a.customer?.name || '—'}</Text>
                    <StatusBadge status={a.status} />
                  </View>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Text style={styles.aptService} numberOfLines={1}>{a.service?.name || '—'} · {a.staff?.name || '—'}</Text>
                    <Text style={styles.aptDate}>{a.appointment_date}  {a.appointment_time?.slice(0,5)}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eff6ff', // blue-50 equivalent
  },
  content: {
    padding: 20,
    paddingBottom: 40,
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
  header: {
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 12,
  },
  profileIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileIconText: {
    fontSize: 28,
  },
  profileTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  profileSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statIconWrap: {
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  tableCardHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  tableCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  tableBody: {
    backgroundColor: '#ffffff',
  },
  tableEmpty: {
    padding: 32,
    alignItems: 'center',
  },
  tableEmptyText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  appointmentRow: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  aptCustomer: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    flex: 1,
    marginRight: 8,
  },
  aptService: {
    fontSize: 13,
    color: '#64748b',
    flex: 1,
    marginRight: 8,
  },
  aptDate: {
    fontSize: 13,
    color: '#334155',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
});

export default AdminDashboardScreen;
