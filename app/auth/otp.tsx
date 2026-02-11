import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

const OTP_LENGTH = 6;

export default function OTPScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(digit => digit !== '') && newOtp.length === OTP_LENGTH) {
      setTimeout(() => handleVerify(), 300);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Phone Authentication',
        'Phone authentication is not yet implemented. Please use email/password sign up instead.',
        [
          {
            text: 'Go to Sign Up',
            onPress: () => router.replace('/auth/signup'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to verify OTP');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.background, '#1A1A2E']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Enter OTP</Text>
            <Text style={styles.subtitle}>
              We&apos;ve sent a 6-digit code to{"\n"}
              <Text style={styles.phone}>+1 (555) 123-4567</Text>
            </Text>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <View key={index} style={styles.otpInputWrapper}>
                <TextInput
                  ref={(ref) => { inputRefs.current[index] = ref; }}
                  style={[
                    styles.otpInput,
                    digit ? styles.otpInputFilled : null,
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              </View>
            ))}
          </View>

          <TouchableOpacity activeOpacity={0.7} style={styles.resendButton}>
            <Text style={styles.resendText}>
              Didn&apos;t receive code? <Text style={styles.resendLink}>Resend</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.verifyButton}
            onPress={handleVerify}
            activeOpacity={0.8}
            disabled={isVerifying}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.verifyButtonText}>
                {isVerifying ? 'Verifying...' : 'Verify & Continue'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  header: {
    marginTop: 48,
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  phone: {
    color: Colors.text,
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 8,
  },
  otpInputWrapper: {
    flex: 1,
  },
  otpInput: {
    height: 64,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
  },
  otpInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  resendButton: {
    alignItems: 'center',
    marginBottom: 32,
  },
  resendText: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
  resendLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
  verifyButton: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  gradientButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '600',
  },
});
