import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Shield } from 'lucide-react-native';
import Colors  from '../../constants/colors';

export default function PrivacySettings() {
  const router = useRouter();
  const [showOnline, setShowOnline] = useState(true);
  const [allowScreenshots, setAllowScreenshots] = useState(false);
  const [readReceipts, setReadReceipts] = useState(true);

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: Colors.text }]}>Privacy</Text>
        <Shield size={24} color={Colors.primary} />
      </View>

      <View style={[styles.section, { borderBottomColor: Colors.border }]}>
        <View style={styles.settingItem}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: Colors.text }]}>Show Online Status</Text>
            <Text style={[styles.description, { color: Colors.textSecondary }]}>
              Let others see when you're online
            </Text>
          </View>
          <Switch
            value={showOnline}
            onValueChange={setShowOnline}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={showOnline ? Colors.primary : Colors.textSecondary}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: Colors.text }]}>Read Receipts</Text>
            <Text style={[styles.description, { color: Colors.textSecondary }]}>
              Let others know when you read messages
            </Text>
          </View>
          <Switch
            value={readReceipts}
            onValueChange={setReadReceipts}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={readReceipts ? Colors.primary : Colors.textSecondary}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: Colors.text }]}>Allow Screenshots</Text>
            <Text style={[styles.description, { color: Colors.textSecondary }]}>
              Prevent screenshots in private chats
            </Text>
          </View>
          <Switch
            value={allowScreenshots}
            onValueChange={setAllowScreenshots}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={allowScreenshots ? Colors.primary : Colors.textSecondary}
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