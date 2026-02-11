import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Eye } from 'lucide-react-native';
import  Colors  from '../../constants/colors';

export default function StealthSettings() {
  const router = useRouter();
  const [stealthMode, setStealthMode] = useState(false);
  const [hideNotifications, setHideNotifications] = useState(false);

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: Colors.text }]}>Stealth Mode</Text>
        <Eye size={24} color={Colors.primary} />
      </View>

      <View style={[styles.section, { borderBottomColor: Colors.border }]}>
        <View style={styles.settingItem}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: Colors.text }]}>Stealth Mode</Text>
            <Text style={[styles.description, { color: Colors.textSecondary }]}>
              Hide app from recent apps and lock it completely
            </Text>
          </View>
          <Switch
            value={stealthMode}
            onValueChange={setStealthMode}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={stealthMode ? Colors.primary : Colors.textSecondary}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: Colors.text }]}>Hide Notifications</Text>
            <Text style={[styles.description, { color: Colors.textSecondary }]}>
              Don't show message previews in notifications
            </Text>
          </View>
          <Switch
            value={hideNotifications}
            onValueChange={setHideNotifications}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={hideNotifications ? Colors.primary : Colors.textSecondary}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
  },
});