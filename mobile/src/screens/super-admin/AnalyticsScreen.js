import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { superAdminAPI, businessAPI, appointmentsAPI } from '../../api';
import { getCategoryIcon } from '../../config/categories';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import PageLoader from '../../components/PageLoader';

const primaryColor = '#2563eb';

const StatCard = ({ label, value, icon, bgColor, textColor, trend }) => (
  <View style={[styles.statCard, { backgroundColor: bgColor }]}>
    <View style={styles.statIconWrap}>
      <Text style={styles.statIcon}>{icon}</Text>
    </View>
    <View style={styles.statContent}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={[styles.statLabel, { color: textColor }]}>{label}</Text>
      {trend && (
        <View style={styles.trendRow}>
          <Ionicons 
            name={trend.type === 'up' ? 'trending-up' : 'trending-down'} 
            size={12} 
            color={trend.type === 'up' ? '#10b981' : '#ef4444'} 
          />
          <Text style={[styles.trendText, { color: trend.type === 'up' ? '#10b981' : '#ef4444' }]}>
            {trend.value}
          </Text>
        </View>
      )}
    </View>
  </View>
);

const CategoryPerformanceCard = ({ category, data }) => (
  <View style={styles.categoryCard}>
    <View style={styles.categoryHeader}>
      <Text style={styles.categoryIcon}>{getCategoryIcon(category)}</Text>
      <Text style={styles.categoryName}>{category}</Text>
      <Text style={styles.categoryCount}>{data.count} businesses</Text>
    </View>
    <View style={styles.categoryMetrics}>
      <View style={styles.metricItem}>
        <Text style={styles.metricValue}>{data.appointments}</Text>
        <Text style={styles.metricLabel}>Appointments</Text>
      </View>
      <View style={styles.metricItem}>
        <Text style={styles.metricValue}>{data.staff}</Text>
        <Text style={styles.metricLabel}>Staff</Text>
      </View>
      <View style={styles.metricItem}>
        <Text style={styles.metricValue}>{data.revenue}</Text>
        <Text style={styles.metricLabel}>Revenue</Text>
      </View>
    </View>
  </View>
);

const AnalyticsScreen = () => {
  const [stats, setStats] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');
  
  const { logout } = useAuth();

  useEffect(() => {
    loadAnalyticsData();
  }, [timeFilter]);

  const loadAnalyticsData = async () => {
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
      console.error('Error loading analytics data', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryAnalytics = () => {
    const categoryData = {};
    
    businesses.forEach(business => {
      if (!categoryData[business.category]) {
        categoryData[business.category] = {
          count: 0,
          appointments: 0,
          staff: 0,
          revenue: 0,
        };
      }
      
      categoryData[business.category].count += 1;
      categoryData[business.category].staff += business.staffCount || 0;
      categoryData[business.category].appointments += business.appointmentCount || 0;
      categoryData[business.category].revenue += business.appointmentCount * 100; // Estimated revenue
    });

    return categoryData;
  };

  const getRecentGrowth = () => {
    // Simulated growth data - in real app, this would come from API
    return {
      businesses: { type: 'up', value: '+12%' },
      staff: { type: 'up', value: '+8%' },
      customers: { type: 'up', value: '+23%' },
      appointments: { type: 'up', value: '+15%' },
    };
  };

  const growth = getRecentGrowth();
  const categoryAnalytics = getCategoryAnalytics();

  if (loading) {
    return <PageLoader message="Loading analytics..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.pageTitle}>Analytics</Text>
            <Text style={styles.pageSubtitle}>System-wide performance metrics</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Time Filter */}
        <View style={styles.timeFilterRow}>
          {['all', 'month', 'week', 'day'].map(filter => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.timeFilterBtn,
                timeFilter === filter ? styles.timeFilterActive : styles.timeFilterInactive
              ]}
              onPress={() => setTimeFilter(filter)}
            >
              <Text style={[
                styles.timeFilterText,
                timeFilter === filter ? styles.timeFilterTextActive : styles.timeFilterTextInactive
              ]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overview Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard 
              label="Total Businesses"   
              value={stats?.businesses || 0} 
              icon="🏢" 
              bgColor="#eff6ff" 
              textColor="#1e40af"
              trend={growth.businesses}
            />
            <StatCard 
              label="Total Staff"        
              value={stats?.staff || 0} 
              icon="👤" 
              bgColor="#faf5ff" 
              textColor="#6b21a8"
              trend={growth.staff}
            />
            <StatCard 
              label="Total Customers"    
              value={stats?.customers || 0} 
              icon="👥" 
              bgColor="#ecfdf5" 
              textColor="#065f46"
              trend={growth.customers}
            />
            <StatCard 
              label="Total Appointments" 
              value={stats?.appointments || 0} 
              icon="📅" 
              bgColor="#fffbeb" 
              textColor="#92400e"
              trend={growth.appointments}
            />
          </View>
        </View>

        {/* Category Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Performance</Text>
          {Object.entries(categoryAnalytics).map(([category, data]) => (
            <CategoryPerformanceCard key={category} category={category} data={data} />
          ))}
        </View>

        {/* Recent Activity Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="calendar-outline" size={20} color={primaryColor} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Appointments Today</Text>
                <Text style={styles.activityValue}>
                  {appointments.filter(a => {
                    const today = new Date().toDateString();
                    return new Date(a.appointment_date).toDateString() === today;
                  }).length}
                </Text>
              </View>
            </View>
            
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="people-outline" size={20} color="#10b981" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>New Customers This Week</Text>
                <Text style={styles.activityValue}>+{Math.floor(Math.random() * 20) + 5}</Text>
              </View>
            </View>
            
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="trending-up-outline" size={20} color="#f59e0b" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Growth Rate</Text>
                <Text style={styles.activityValue}>+15.3%</Text>
              </View>
            </View>
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
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
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
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: 14,
  },
  timeFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  timeFilterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  timeFilterActive: {
    backgroundColor: primaryColor,
    borderColor: primaryColor,
  },
  timeFilterInactive: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
  },
  timeFilterTextActive: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  timeFilterTextInactive: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '500',
  },
  timeFilterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconWrap: {
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 24,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
  },
  categoryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    flex: 1,
  },
  categoryCount: {
    fontSize: 12,
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  activityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  activityValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
});

export default AnalyticsScreen;
