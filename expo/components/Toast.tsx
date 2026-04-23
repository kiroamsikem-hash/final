import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;
const toastListeners: Array<(toast: ToastMessage) => void> = [];

export const toast = {
  success: (message: string) => {
    if (Platform.OS !== 'web') return;
    const id = ++toastId;
    toastListeners.forEach(listener => listener({ id, message, type: 'success' }));
  },
  error: (message: string) => {
    if (Platform.OS !== 'web') return;
    const id = ++toastId;
    toastListeners.forEach(listener => listener({ id, message, type: 'error' }));
  },
  info: (message: string) => {
    if (Platform.OS !== 'web') return;
    const id = ++toastId;
    toastListeners.forEach(listener => listener({ id, message, type: 'info' }));
  },
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const listener = (toast: ToastMessage) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 3000);
    };
    toastListeners.push(listener);
    return () => {
      const index = toastListeners.indexOf(listener);
      if (index > -1) toastListeners.splice(index, 1);
    };
  }, []);

  if (Platform.OS !== 'web') return null;

  return (
    <View style={styles.container}>
      {toasts.map(toast => (
        <ToastItem key={toast.id} {...toast} />
      ))}
    </View>
  );
}

function ToastItem({ message, type }: ToastMessage) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-20));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} color="#10b981" />;
      case 'error':
        return <XCircle size={20} color="#ef4444" />;
      case 'info':
        return <AlertCircle size={20} color="#3b82f6" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#10b98120';
      case 'error':
        return '#ef444420';
      case 'info':
        return '#3b82f620';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'info':
        return '#3b82f6';
    }
  };

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {getIcon()}
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    pointerEvents: 'none',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    minWidth: 300,
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  message: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});
