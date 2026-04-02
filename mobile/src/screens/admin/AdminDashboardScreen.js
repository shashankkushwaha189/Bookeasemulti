import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { businessAPI, appointmentsAPI, staffAPI } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { getCategoryIcon } from '../../config/categories';
import { ArrowRightOnRectangleIcon, CalendarIcon, ClockIcon, UserGroupIcon, ScissorsIcon } from 'react-native-heroicons/outline';
import PageLoader from '../../components/PageLoader';
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

const StatCard = ({ label, value, icon, bgColor, textColor }) => (
  <View style={styles.statCard}>
    <View style={[styles.statCardInner, { backgroundColor: bgColor }]}>
      <View style={styles.statIconWrap}>
        {icon}
      </View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={[styles.statLabel, { color: textColor }]}>{label}</Text>
      </View>
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.pageTitle}>Admin Dashboard</Text>
            <Text style={styles.pageSubtitle}>Manage your business operations</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <ArrowRightOnRectangleIcon size={rw(18)} color="#ef4444" />
            {!isSmallScreen && <Text style={styles.logoutText}>Logout</Text>}
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
          <StatCard label="Total Appointments" value={stats.appointments.length} icon={<CalendarIcon size={24} color="#1e40af" />} bgColor="#eff6ff" textColor="#1e40af" />
          <StatCard label="Today's Bookings"   value={todayCount}                icon={<ClockIcon size={24} color="#92400e" />} bgColor="#fffbeb" textColor="#92400e" />
          <StatCard label="Staff Members"      value={stats.staff.length}        icon={<UserGroupIcon size={24} color="#6b21a8" />} bgColor="#faf5ff" textColor="#6b21a8" />
          <StatCard label="Services"           value={stats.services.length}     icon={<ScissorsIcon size={24} color="#065f46" />} bgColor="#ecfdf5" textColor="#065f46" />
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eff6ff',
  },
  content: {
    padding: PAGE_PADDING,
    paddingBottom: 40,
  },
  headerRow: {
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
  pageTitle: {
    fontSize: rf(24),
    fontWeight: '800',
    color: '#0f172a',
  },
  pageSubtitle: {
    fontSize: rf(13),
    color: '#64748b',
    marginTop: 4,
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: rw(24),
    marginTop: 0,
  },
  profileIconBox: {
    width: rw(50),
    height: rw(50),
    borderRadius: rw(14),
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: rw(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileIconText: {
    fontSize: rf(24),
  },
  profileTitle: {
    fontSize: rf(17),
    fontWeight: '700',
    color: '#0f172a',
  },
  profileSubtitle: {
    fontSize: rf(13),
    color: '#64748b',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: rw(24),
    marginHorizontal: -6,
  },
  statCard: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  statCardInner: {
    borderRadius: 12,
    padding: rw(14),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statIconWrap: {
    marginBottom: rw(6),
  },
  statValue: {
    fontSize: rf(22),
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: rf(11),
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
    paddingHorizontal: rw(16),
    paddingVertical: rw(14),
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  tableCardTitle: {
    fontSize: rf(15),
    fontWeight: '600',
    color: '#1e293b',
  },
  tableBody: {
    backgroundColor: '#ffffff',
  },
  tableEmpty: {
    padding: rw(28),
    alignItems: 'center',
  },
  tableEmptyText: {
    color: '#94a3b8',
    fontSize: rf(13),
  },
  appointmentRow: {
    paddingVertical: rw(14),
    paddingHorizontal: rw(14),
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  aptCustomer: {
    fontSize: rf(14),
    fontWeight: '600',
    color: '#0f172a',
    flex: 1,
    marginRight: rw(8),
  },
  aptService: {
    fontSize: rf(12),
    color: '#64748b',
    flex: 1,
    marginRight: rw(8),
  },
  aptDate: {
    fontSize: rf(12),
    color: '#334155',
  },
  statusBadge: {
    paddingHorizontal: rw(7),
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: rf(10),
    fontWeight: '600',
  },
});

export default AdminDashboardScreen;
