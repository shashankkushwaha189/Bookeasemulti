import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
} from 'react-native';
import { businessAPI, appointmentsAPI } from '../../api';
import { getCategoryIcon, getStaffLabel, getServiceLabel } from '../../config/categories';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import PageLoader from '../../components/PageLoader';

const primaryColor = '#2563eb'; // blue-600
const TIME_SLOTS = ['09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00'];

const Row = ({ label, value }) => (
  <View style={styles.rowItem}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const BusinessDetailScreen = ({ route, navigation }) => {
  const { businessId } = route.params;
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  
  const [availableSlots, setAvailableSlots] = useState({ availableSlots: [], bookedSlots: [], allSlots: [] });
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const steps = ['Service', 'Staff', 'Date & Time', 'Confirm'];

  useEffect(() => {
    loadBusinessData();
  }, [businessId]);

  const loadBusinessData = async () => {
    try {
      const [businessRes, servicesRes, staffRes] = await Promise.all([
        businessAPI.getById(businessId),
        businessAPI.getServices(businessId),
        businessAPI.getStaff(businessId),
      ]);
      setBusiness(businessRes.data);
      setServices(servicesRes.data);
      setStaff(staffRes.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load business details');
    } finally {
      setLoading(false);
    }
  };

  const fetchSlotAvailability = async (date) => {
    if (!selectedService || !selectedStaff) return;
    setLoadingSlots(true);
    try {
      const response = await appointmentsAPI.getAvailableSlots({
        business_id: businessId,
        service_id: selectedService.id,
        staff_id: selectedStaff.id,
        date: date.toISOString().split('T')[0],
      });
      setAvailableSlots(response.data);
    } catch (error) {
      setAvailableSlots({ availableSlots: [], bookedSlots: [], allSlots: TIME_SLOTS });
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateChange = (event, selectedDateObj) => {
    setShowDatePicker(false);
    if (selectedDateObj) {
      setSelectedDate(selectedDateObj);
      setSelectedTime(''); // reset time
      fetchSlotAvailability(selectedDateObj);
    }
  };

  const handleBookingConfirm = async () => {
    setSubmitting(true);
    try {
      await appointmentsAPI.create({
        business_id: parseInt(businessId),
        service_id: selectedService.id,
        staff_id: selectedStaff.id,
        appointment_date: selectedDate.toISOString().split('T')[0],
        appointment_time: selectedTime + ':00',
      });

      Alert.alert('Success', 'Appointment booked successfully!', [
        { text: 'OK', onPress: () => {
          setBookingModalVisible(false);
          navigation.navigate('MyAppointments');
        }}
      ]);
      resetBooking();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const resetBooking = () => {
    setSelectedService(null);
    setSelectedStaff(null);
    setSelectedDate(new Date());
    setSelectedTime('');
    setAvailableSlots({ availableSlots: [], bookedSlots: [], allSlots: [] });
    setCurrentStep(0);
  };

  if (loading) {
    return <PageLoader message="Loading business details..." />;
  }

  const currency = business?.currency || '₹';
  const serviceLabel = getServiceLabel(business?.category) || 'Service';
  const staffLabel = getStaffLabel(business?.category) || 'Staff';

  const renderServiceSelection = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepContentTitle}>Choose a {serviceLabel}</Text>
      {services.length === 0 ? <Text style={styles.emptyText}>No services available.</Text> : null}
      
      {services.map((service) => (
        <TouchableOpacity
          key={service.id}
          style={[styles.optionCard, selectedService?.id === service.id && styles.selectedOptionCard]}
          onPress={() => {
            setSelectedService(service);
            setCurrentStep(1);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.optionRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>{service.name}</Text>
              <Text style={styles.optionSubtitle}>{service.duration_minutes} min</Text>
            </View>
            <Text style={styles.optionPrice}>{currency}{parseFloat(service.price).toFixed(2)}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStaffSelection = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepContentTitle}>Choose a {staffLabel}</Text>
      {staff.length === 0 ? <Text style={styles.emptyText}>No staff available.</Text> : null}
      
      {staff.map((s) => (
        <TouchableOpacity
          key={s.id}
          style={[styles.optionCard, selectedStaff?.id === s.id && styles.selectedOptionCard]}
          onPress={() => {
            setSelectedStaff(s);
            setCurrentStep(2);
            fetchSlotAvailability(selectedDate);
          }}
          activeOpacity={0.7}
        >
          <View style={[styles.optionRow, { justifyContent: 'flex-start' }]}>
            <View style={styles.staffAvatar}>
              <Text style={styles.staffAvatarText}>{s.name?.[0]?.toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.optionTitle}>{s.name}</Text>
              <Text style={styles.optionSubtitle}>{s.specialization || staffLabel}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.backBtn} onPress={() => setCurrentStep(0)}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDateTimeSelection = () => {
    const allSlots = availableSlots.allSlots || TIME_SLOTS;
    const bookedSlots = availableSlots.bookedSlots || [];
    
    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepContentTitle}>Pick Date & Time</Text>
        
        <View style={styles.cardBlock}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity style={styles.datePickerInput} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.datePickerText}>{selectedDate.toISOString().split('T')[0]}</Text>
            <Ionicons name="calendar-outline" size={20} color="#64748b" />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              minimumDate={new Date()}
              onChange={handleDateChange}
            />
          )}
        </View>

        <View style={styles.cardBlock}>
          <Text style={styles.label}>Available Times</Text>
          {loadingSlots ? (
            <Text style={styles.emptyText}>Loading available slots...</Text>
          ) : (
            <View style={styles.timeSlotsGrid}>
              {allSlots.map(t => {
                const isBooked = bookedSlots.includes(t);
                const isSelected = selectedTime === t;
                return (
                  <TouchableOpacity
                    key={t}
                    disabled={isBooked}
                    onPress={() => setSelectedTime(t)}
                    style={[
                      styles.timeSlotBtn,
                      isBooked && styles.timeSlotBooked,
                      isSelected && styles.timeSlotSelected
                    ]}
                  >
                    <Text style={[
                      styles.timeSlotText,
                      isBooked && styles.timeSlotTextBooked,
                      isSelected && styles.timeSlotTextSelected
                    ]}>
                      {isBooked ? 'Booked' : t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.navButtonsRow}>
          <TouchableOpacity style={styles.backBtnHalf} onPress={() => setCurrentStep(1)}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.nextBtnHalf, (!selectedDate || !selectedTime) && styles.disabledBtn]} 
            disabled={!selectedDate || !selectedTime}
            onPress={() => setCurrentStep(3)}
          >
            <Text style={styles.nextBtnText}>Next →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderBookingConfirmation = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepContentTitle}>Confirm Booking</Text>
      
      <View style={[styles.cardBlock, { padding: 0, overflow: 'hidden' }]}>
        <Row label="Business" value={business?.name} />
        <Row label="Category" value={business?.category} />
        <Row label={serviceLabel} value={selectedService?.name} />
        <Row label="Duration" value={`${selectedService?.duration_minutes} min`} />
        <Row label="Price" value={`${currency}${parseFloat(selectedService?.price || 0).toFixed(2)}`} />
        <Row label={staffLabel} value={selectedStaff?.name} />
        <Row label="Specialization" value={selectedStaff?.specialization || staffLabel} />
        <Row label="Date" value={selectedDate.toISOString().split('T')[0]} />
        <Row label="Time" value={selectedTime} />
      </View>

      <View style={styles.navButtonsRow}>
        <TouchableOpacity style={styles.backBtnHalf} onPress={() => setCurrentStep(2)}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.nextBtnHalf, submitting && styles.disabledBtn, {flex: 2}]} 
          disabled={submitting}
          onPress={handleBookingConfirm}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
             <Text style={styles.nextBtnText}>Confirm Booking</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <TouchableOpacity style={styles.backArrow} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={primaryColor} />
          <Text style={styles.backArrowText}>Back to Businesses</Text>
        </TouchableOpacity>

        {/* Business Hero Card */}
        <View style={styles.businessCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconBox}>
              <Text style={styles.iconText}>{getCategoryIcon(business?.category) || '📌'}</Text>
            </View>
            <View style={styles.infoCol}>
              <View style={styles.titleRow}>
                <Text style={styles.businessTitle}>{business?.name}</Text>
                <View style={styles.categoryPill}>
                  <Text style={styles.categoryPillText}>{business?.category}</Text>
                </View>
              </View>
              {business?.speciality ? <Text style={styles.specialityText}>{business.speciality}</Text> : null}
              {business?.address ? <Text style={styles.contactText}>📍 {business.address}</Text> : null}
              {business?.phone ? <Text style={styles.contactText}>📞 {business.phone}</Text> : null}
              {business?.description ? <Text style={styles.descText}>{business.description}</Text> : null}
            </View>
          </View>
        </View>

        <View style={styles.bookingPrompt}>
          <Text style={styles.bookingTitle}>Book an Appointment</Text>
          <TouchableOpacity style={styles.bigBookBtn} onPress={() => setBookingModalVisible(true)} activeOpacity={0.8}>
            <Text style={styles.bigBookBtnText}>Start Booking Flow</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Booking Modal Wizard */}
      <Modal visible={bookingModalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setBookingModalVisible(false)} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Book Appointment</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Stepper Logic */}
          <View style={styles.stepperContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16 }}>
              {steps.map((step, index) => (
                <View key={index} style={{ flex: 1, alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                    {/* Left Line */}
                    <View style={{ flex: 1, height: 2, backgroundColor: index === 0 ? 'transparent' : (index <= currentStep ? primaryColor : '#e2e8f0') }} />
                    
                    {/* Circle */}
                    <View style={[
                      styles.stepCircle, 
                      index < currentStep ? styles.stepCircleCompleted : index === currentStep ? styles.stepCircleActive : styles.stepCircleInactive
                    ]}>
                      {index < currentStep ? (
                        <Text style={styles.stepCheck}>✓</Text>
                      ) : (
                        <Text style={[
                          styles.stepNumber,
                          index === currentStep ? styles.stepNumberActive : styles.stepNumberInactive
                        ]}>{index + 1}</Text>
                      )}
                    </View>

                    {/* Right Line */}
                    <View style={{ flex: 1, height: 2, backgroundColor: index === steps.length - 1 ? 'transparent' : (index < currentStep ? primaryColor : '#e2e8f0') }} />
                  </View>
                  
                  {/* Label */}
                  <Text style={[
                    styles.stepLabel,
                    index <= currentStep ? styles.stepLabelActive : styles.stepLabelInactive,
                    { textAlign: 'center', marginTop: 8, fontSize: 11, paddingHorizontal: 2 }
                  ]}>{step}</Text>
                </View>
              ))}
            </View>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {currentStep === 0 && renderServiceSelection()}
            {currentStep === 1 && renderStaffSelection()}
            {currentStep === 2 && renderDateTimeSelection()}
            {currentStep === 3 && renderBookingConfirmation()}
          </ScrollView>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eff6ff', // blue-50 equivalent
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  backArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backArrowText: {
    color: primaryColor,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  businessCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#dbeafe', // primary-100
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 28,
  },
  infoCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  businessTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  categoryPill: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryPillText: {
    color: '#1d4ed8', // primary-700
    fontSize: 12,
    fontWeight: '600',
  },
  specialityText: {
    fontSize: 14,
    color: primaryColor,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 4,
  },
  contactText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  descText: {
    fontSize: 14,
    color: '#475569',
    marginTop: 8,
    lineHeight: 20,
  },
  bookingPrompt: {
    marginTop: 8,
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  bigBookBtn: {
    backgroundColor: primaryColor,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: primaryColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  bigBookBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Modal Styles
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalCloseBtn: {
    padding: 4,
  },
  stepperContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  stepItemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIndicatorRoot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  stepCircleCompleted: {
    backgroundColor: primaryColor,
    borderColor: primaryColor,
  },
  stepCircleActive: {
    backgroundColor: '#ffffff',
    borderColor: primaryColor,
  },
  stepCircleInactive: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
  },
  stepCheck: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepNumberActive: {
    color: primaryColor,
  },
  stepNumberInactive: {
    color: '#94a3b8',
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  stepLabelActive: {
    color: primaryColor,
  },
  stepLabelInactive: {
    color: '#94a3b8',
  },
  stepLine: {
    height: 2,
    width: 32,
    marginHorizontal: 12,
  },
  stepLineCompleted: {
    backgroundColor: primaryColor,
  },
  stepLineInactive: {
    backgroundColor: '#e2e8f0',
  },

  modalBody: {
    flex: 1,
    padding: 20,
  },
  stepContent: {
    paddingBottom: 40,
  },
  stepContentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  optionCard: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  selectedOptionCard: {
    borderColor: primaryColor,
    backgroundColor: '#eff6ff',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  optionPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: primaryColor,
  },
  staffAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  staffAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1d4ed8',
  },

  backBtn: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  backBtnText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
  },
  navButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  backBtnHalf: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnHalf: {
    flex: 1,
    backgroundColor: primaryColor,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledBtn: {
    backgroundColor: '#94a3b8',
    opacity: 0.7,
  },

  cardBlock: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 8,
  },
  datePickerInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
  },
  datePickerText: {
    fontSize: 16,
    color: '#0f172a',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlotBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    width: '23%',
  },
  timeSlotSelected: {
    backgroundColor: primaryColor,
    borderColor: primaryColor,
  },
  timeSlotBooked: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  timeSlotTextSelected: {
    color: '#ffffff',
  },
  timeSlotTextBooked: {
    color: '#ef4444',
  },

  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  rowLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
});

export default BusinessDetailScreen;
