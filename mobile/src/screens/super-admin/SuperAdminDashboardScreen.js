import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import PageLoader from '../../components/PageLoader';
import { superAdminAPI, businessAPI, appointmentsAPI } from '../../api';
import { getCategoryIcon } from '../../config/categories';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowRightOnRectangleIcon } from 'react-native-heroicons/outline';
import { useNavigation } from '@react-navigation/native';
import { rf, rw, PAGE_PADDING, isSmallScreen } from '../../config/responsive';

const primaryColor = '#2563eb'; // blue-600

const StatCard = ({ label, value, icon, bgColor, textColor }) => (
  <View style={styles.statCard}>
    <View style={[styles.statCardInner, { backgroundColor: bgColor }]}>
      <View style={styles.statIconWrap}>
        <Text style={styles.statIcon}>{icon}</Text>
      </View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={[styles.statLabel, { color: textColor }]}>{label}</Text>
      </View>
    </View>
  </View>
);

const QuickActionCard = ({ title, subtitle, onPress, icon, bgColor }) => (
  <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: bgColor }]} onPress={onPress}>
    <View style={styles.quickActionIcon}>
      <Text style={styles.quickActionIconText}>{icon}</Text>
    </View>
    <View style={styles.quickActionContent}>
      <Text style={styles.quickActionTitle}>{title}</Text>
      <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
    </View>
    <Text style={styles.quickActionArrow}>→</Text>
  </TouchableOpacity>
);

const SuperAdminDashboardScreen = () => {
  const [stats, setStats] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { logout } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, bizRes, aptRes] = await Promise.all([
        superAdminAPI.getStats(),
        businessAPI.getAllAdmin(),
        appointmentsAPI.getAll(),
      ]);
      setStats(statsRes.data);
      setBusinesses(bizRes.data || []);
      setAppointments(aptRes.data || []);
    } catch (error) {
      console.error('Error loading super admin dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'BOOKED': return { bg: '#dcfce7', text: '#166534' }; 
      case 'COMPLETED': return { bg: '#dbeafe', text: '#1e40af' }; 
      case 'CANCELLED': return { bg: '#fee2e2', text: '#991b1b' }; 
      default: return { bg: '#f1f5f9', text: '#475569' }; 
    }
  };

  if (loading) {
    return <PageLoader message="Loading dashboard..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.pageTitle}>Super Admin</Text>
            <Text style={styles.pageSubtitle}>System-wide aggregate overview</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <ArrowRightOnRectangleIcon size={rw(18)} color="#ef4444" />
            {!isSmallScreen && <Text style={styles.logoutText}>Logout</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <StatCard label="Total Businesses"   value={stats?.businesses  || 0} icon="🏢" bgColor="#eff6ff" textColor="#1e40af" />
          <StatCard label="Total Staff"        value={stats?.staff       || 0} icon="👤" bgColor="#faf5ff" textColor="#6b21a8" />
          <StatCard label="Total Customers"    value={stats?.customers   || 0} icon="👥" bgColor="#ecfdf5" textColor="#065f46" />
          <StatCard label="Total Appointments" value={stats?.appointments|| 0} icon="📅" bgColor="#fffbeb" textColor="#92400e" />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionCard 
              title="Manage Businesses" 
              subtitle="View and edit all businesses" 
              onPress={() => navigation.navigate('Businesses')}
              icon="🏢"
              bgColor="#dbeafe"
            />
            <QuickActionCard 
              title="Manage Users" 
              subtitle="Edit user credentials" 
              onPress={() => navigation.navigate('Users')}
              icon="👥"
              bgColor="#dcfce7"
            />
            <QuickActionCard 
              title="View Analytics" 
              subtitle="System-wide statistics" 
              onPress={() => navigation.navigate('Analytics')}
              icon="📊"
              bgColor="#fef3c7"
            />
            <QuickActionCard 
              title="Recent Activity" 
              subtitle="Latest appointments" 
              onPress={() => {}}
              icon="🕐"
              bgColor="#f3e8ff"
            />
          </View>
        </View>

        {/* Businesses Overview */}
        <View style={styles.cardSection}>
          <View style={styles.cardSectionHeader}>
            <Text style={styles.sectionTitle}>Businesses Overview</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Businesses')}>
              <Text style={styles.manageLink}>Manage all →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.listBody}>
            {businesses.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No businesses registered.</Text>
              </View>
            ) : (
              businesses.slice(0, 6).map((b, i) => (
                <View key={b.id} style={[styles.rowItem, i !== businesses.slice(0, 6).length - 1 && styles.rowBorder]}>
                  <View style={styles.rowMain}>
                    <Text style={styles.rowTitle} numberOfLines={1}>
                      {getCategoryIcon(b.category)} {b.name}
                    </Text>
                    <View style={styles.metricsRow}>
                      <Text style={styles.metricsText}>Staff: {b.staffCount}</Text>
                      <Text style={styles.metricsDot}> • </Text>
                      <Text style={styles.metricsText}>Services: {b.serviceCount}</Text>
                      <Text style={styles.metricsDot}> • </Text>
                      <Text style={styles.metricsText}>Apts: {b.appointmentCount}</Text>
                    </View>
                  </View>
                  <View style={styles.rowAction}>
                    <View style={[styles.badge, b.is_active ? styles.badgeActive : styles.badgeInactive]}>
                      <Text style={[styles.badgeText, b.is_active ? styles.badgeTextActive : styles.badgeTextInactive]}>
                        {b.is_active ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Recent Appointments */}
        <View style={styles.cardSection}>
          <View style={styles.cardSectionHeader}>
            <Text style={styles.sectionTitle}>Recent Appointments</Text>
          </View>

          <View style={styles.listBody}>
            {appointments.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No appointments platform-wide.</Text>
              </View>
            ) : (
              appointments.slice(0, 10).map((a, i) => {
                const colors = getStatusStyle(a.status);
                return (
                  <View key={a.id} style={[styles.rowItem, i !== appointments.slice(0, 10).length - 1 && styles.rowBorder]}>
                    <View style={styles.rowMain}>
                      <Text style={styles.rowTitle} numberOfLines={1}>
                         {getCategoryIcon(a.business?.category)} {a.business?.name || '—'}
                      </Text>
                      <Text style={styles.rowDesc} numberOfLines={1}>
                        {a.customer?.name || '—'}  •  {a.service?.name || '—'}  •  {a.staff?.name || '—'}
                      </Text>
                      <Text style={styles.rowDate}>{a.appointment_date}</Text>
                    </View>
                    <View style={styles.rowAction}>
                      <View style={[styles.badge, { backgroundColor: colors.bg }]}>
                        <Text style={[styles.badgeText, { color: colors.text }]}>{a.status}</Text>
                      </View>
                    </View>
                  </View>
                );
              })
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: rw(20),
    marginHorizontal: -6,
  },
  statCard: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  statCardInner: {
    borderRadius: 16,
    padding: rw(16),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconWrap: {
    marginBottom: rw(10),
  },
  statIcon: {
    fontSize: rf(22),
  },
  statValue: {
    fontSize: rf(24),
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: rf(10),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickActionIconText: {
    fontSize: 18,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  quickActionArrow: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
  cardSection: {
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
    marginBottom: 24,
  },
  cardSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  manageLink: {
    fontSize: 14,
    fontWeight: '500',
    color: primaryColor,
  },
  listBody: {
    backgroundColor: '#ffffff',
  },
  emptyBox: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  rowMain: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  rowDesc: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 4,
  },
  rowDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metricsText: {
    fontSize: 12,
    color: '#64748b',
  },
  metricsDot: {
    fontSize: 12,
    color: '#cbd5e1',
    marginHorizontal: 4,
  },
  rowAction: {
    alignItems: 'flex-end',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
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
});

export default SuperAdminDashboardScreen;
