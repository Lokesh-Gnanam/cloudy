import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Lock } from 'lucide-react-native';
import  Colors from '../../constants/colors';

export default function ChatLockSettings() {
  const router = useRouter();
  const [autoLock, setAutoLock] = useState(false);
  const [lockOnExit, setLockOnExit] = useState(true);

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: Colors.text }]}>Chat Lock</Text>
        <Lock size={24} color={Colors.primary} />
      </View>

      <View style={[styles.section, { borderBottomColor: Colors.border }]}>
        <View style={styles.settingItem}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: Colors.text }]}>Auto-Lock Chats</Text>
            <Text style={[styles.description, { color: Colors.textSecondary }]}>
              Lock chats automatically when app is paused
            </Text>
          </View>
          <Switch
            value={autoLock}
            onValueChange={setAutoLock}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={autoLock ? Colors.primary : Colors.textSecondary}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: Colors.text }]}>Lock on Exit</Text>
            <Text style={[styles.description, { color: Colors.textSecondary }]}>
              Lock selected chats when switching away
            </Text>
          </View>
          <Switch
            value={lockOnExit}
            onValueChange={setLockOnExit}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={lockOnExit ? Colors.primary : Colors.textSecondary}
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