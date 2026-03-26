import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Easing } from 'react-native';

const primaryColor = '#2563eb'; // blue-600

const PageLoader = ({ message = 'Loading...' }) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Spin animation for the ring
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation for the text
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 0.5,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]} />
      <Animated.Text style={[styles.text, { opacity: pulseValue }]}>
        {message}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eff6ff', // blue-50 equivalent
  },
  spinner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#dbeafe', // blue-100
    borderTopColor: primaryColor,
    marginBottom: 16,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b', // slate-500
    letterSpacing: 0.5,
  },
});

export default PageLoader;
