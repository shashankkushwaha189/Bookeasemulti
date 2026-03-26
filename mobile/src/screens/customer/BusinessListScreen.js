import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import PageLoader from '../../components/PageLoader';
import { businessAPI } from '../../api';
import { getCategoryIcon } from '../../config/categories';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

const primaryColor = '#2563eb'; // blue-600

const CATEGORIES = [
  { label: 'Healthcare', value: 'Healthcare', icon: '🏥' },
  { label: 'Dental', value: 'Dental', icon: '🦷' },
  { label: 'Salon', value: 'Salon', icon: '✂️' },
  { label: 'Spa', value: 'Spa', icon: '💆' },
  { label: 'Fitness', value: 'Fitness', icon: '💪' },
  { label: 'Veterinary', value: 'Veterinary', icon: '🐾' },
];

const BusinessCard = ({ business, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={() => onPress(business)} activeOpacity={0.9}>
    <View style={styles.cardHeader}>
      <View style={styles.iconContainer}>
        <Text style={styles.categoryIcon}>{getCategoryIcon(business.category) || '📌'}</Text>
      </View>
      <View style={styles.businessInfo}>
        <Text style={styles.businessName}>{business.name}</Text>
        <View style={styles.tagsContainer}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{business.category}</Text>
          </View>
          {business.speciality ? (
            <Text style={styles.specialityText}>{business.speciality}</Text>
          ) : null}
        </View>
        {business.address ? (
          <Text style={styles.addressText} numberOfLines={1}>📍 {business.address}</Text>
        ) : null}
        {business.phone ? (
          <Text style={styles.phoneText}>📞 {business.phone}</Text>
        ) : null}
        {business.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {business.description}
          </Text>
        ) : null}
      </View>
    </View>
    <View style={styles.cardFooter}>
      <TouchableOpacity style={styles.bookButton} onPress={() => onPress(business)}>
        <Text style={styles.bookButtonText}>Book Appointment →</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

const BusinessListScreen = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const navigation = useNavigation();
  const { logout } = useAuth();

  useEffect(() => {
    loadBusinesses();
  }, []);

  useEffect(() => {
    const filtered = businesses.filter(business => {
      const matchSearch = business.name.toLowerCase().includes(search.toLowerCase()) ||
                          (business.speciality || '').toLowerCase().includes(search.toLowerCase());
      const matchCat = catFilter === 'All' || business.category === catFilter;
      return matchSearch && matchCat;
    });
    setFilteredBusinesses(filtered);
  }, [search, catFilter, businesses]);

  const loadBusinesses = async () => {
    try {
      const response = await businessAPI.getAll();
      setBusinesses(response.data);
      setFilteredBusinesses(response.data);
    } catch (error) {
      console.error('Error loading businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessPress = (business) => {
    navigation.navigate('BusinessDetail', { businessId: business.id });
  };

  const renderBusiness = ({ item }) => (
    <BusinessCard business={item} onPress={handleBusinessPress} />
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }]}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={styles.title}>Find & Book</Text>
          <Text style={styles.subtitle}>Browse businesses and book appointments instantly</Text>
        </View>
        <TouchableOpacity onPress={logout} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fee2e2', borderRadius: 8 }}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 14 }}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search businesses, speciality..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity 
            style={[styles.filterBtn, catFilter === 'All' ? styles.filterBtnActive : styles.filterBtnInactive]}
            onPress={() => setCatFilter('All')}
          >
            <Text style={catFilter === 'All' ? styles.filterTextActive : styles.filterTextInactive}>🏢 All</Text>
          </TouchableOpacity>
          {CATEGORIES.map(cat => (
            <TouchableOpacity 
              key={cat.value} 
              style={[styles.filterBtn, catFilter === cat.value ? styles.filterBtnActive : styles.filterBtnInactive]}
              onPress={() => setCatFilter(cat.value)}
            >
              <Text style={catFilter === cat.value ? styles.filterTextActive : styles.filterTextInactive}>
                {cat.icon} {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <PageLoader message="Loading businesses..." />
      ) : (
        <FlatList
          data={filteredBusinesses}
          renderItem={renderBusiness}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No businesses found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#0f172a',
  },
  filterContainer: {
    marginBottom: 15,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  filterBtnActive: {
    backgroundColor: primaryColor,
    borderColor: primaryColor,
  },
  filterBtnInactive: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
  },
  filterTextActive: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextInactive: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#dbeafe', // primary-100
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIcon: {
    fontSize: 24,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
    gap: 6,
  },
  categoryPill: {
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
  specialityText: {
    fontSize: 12,
    color: primaryColor,
    fontWeight: '600',
    marginLeft: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  phoneText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
    marginTop: 8,
  },
  cardFooter: {
    marginTop: 4,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  bookButton: {
    backgroundColor: primaryColor,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#94a3b8',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
  },
});

export default BusinessListScreen;
