// Profile Setup Screen

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../src/constants/colors';
import { FontSize, FontWeight } from '../../src/constants/typography';
import { Spacing, BorderRadius, TouchTarget } from '../../src/constants/spacing';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Avatar } from '../../src/components/ui/Avatar';
import { validateName, validateAge, validateCity } from '../../src/utils/validation';
import { Config } from '../../src/constants/config';

type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

const GENDERS: { id: Gender; label: string }[] = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'other', label: 'Other' },
  { id: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<string>('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [bio, setBio] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handlePickImage() {
    Alert.alert(
      'Profile Photo',
      'Choose how you would like to add your photo:',
      [
        {
          text: '📷 Take Photo',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Required', 'Camera access is needed to take a photo.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled && result.assets && result.assets[0]) {
              setPhoto(result.assets[0].uri);
            }
          },
        },
        {
          text: '🖼️ Choose from Gallery',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Required', 'Photo library access is needed to choose a photo.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled && result.assets && result.assets[0]) {
              setPhoto(result.assets[0].uri);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }

  function validate() {
    const errs: Record<string, string> = {};
    const nameErr = validateName(name);
    if (nameErr) errs.name = nameErr;
    const ageErr = validateAge(age);
    if (ageErr) errs.age = ageErr;
    const cityErr = validateCity(city);
    if (cityErr) errs.city = cityErr;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleContinue() {
    if (!validate()) return;
    router.push({
      pathname: '/(onboarding)/interests',
      params: {
        name,
        photo,
        age,
        gender: gender ?? '',
        city,
        area,
        bio,
      },
    });
  }

  const progress = 1 / 3;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.step}>Step 1 of 3</Text>
          <Text style={styles.title}>Tell us about yourself</Text>
          <Text style={styles.subtitle}>
            This helps us find activities and people that are right for you.
          </Text>

          {/* Avatar placeholder */}
          <TouchableOpacity
            style={styles.avatarSection}
            activeOpacity={0.7}
            onPress={handlePickImage}
            accessibilityRole="button"
            accessibilityLabel="Add profile photo"
          >
            <Avatar uri={photo} name={name || 'You'} size={88} />
            <View style={styles.avatarEdit}>
              <Text style={styles.avatarEditText}>📷</Text>
            </View>
            <Text style={styles.avatarHint}>{photo ? 'Change photo' : 'Add photo (optional)'}</Text>
          </TouchableOpacity>

          <Input
            label="Your Name *"
            placeholder="e.g. Rajesh Sharma"
            value={name}
            onChangeText={text => { setName(text); setErrors(e => ({ ...e, name: '' })); }}
            error={errors.name}
            autoCapitalize="words"
            returnKeyType="next"
          />

          <Input
            label={`Age * (${Config.MIN_AGE}+)`}
            placeholder="e.g. 64"
            value={age}
            onChangeText={text => { setAge(text.replace(/\D/g, '')); setErrors(e => ({ ...e, age: '' })); }}
            error={errors.age}
            keyboardType="number-pad"
            maxLength={3}
          />

          {/* Gender */}
          <View style={styles.genderSection}>
            <Text style={styles.sectionLabel}>GENDER (OPTIONAL)</Text>
            <View style={styles.genderGrid}>
              {GENDERS.map(g => (
                <TouchableOpacity
                  key={g.id}
                  style={[styles.genderBtn, gender === g.id ? styles.genderBtnSelected : undefined]}
                  onPress={() => setGender(g.id)}
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: gender === g.id }}
                >
                  <Text style={[styles.genderText, gender === g.id ? styles.genderTextSelected : undefined]}>
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Input
            label="City *"
            placeholder="e.g. Jaipur"
            value={city}
            onChangeText={text => { setCity(text); setErrors(e => ({ ...e, city: '' })); }}
            error={errors.city}
            autoCapitalize="words"
          />

          <Input
            label="Area / Locality"
            placeholder="e.g. Vaishali Nagar"
            value={area}
            onChangeText={setArea}
            autoCapitalize="words"
          />

          <Input
            label="About You (Optional)"
            placeholder="A few words about yourself, your interests, or what you're looking for..."
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            style={styles.bioInput}
          />

          <Button
            title="Continue"
            onPress={handleContinue}
            loading={loading}
            size="lg"
            style={styles.continueBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  step: {
    fontSize: FontSize.bodySm,
    fontWeight: FontWeight.semiBold,
    color: Colors.primary,
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  title: {
    fontSize: FontSize.h1,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.bodyLg,
    color: Colors.textSecondary,
    lineHeight: FontSize.bodyLg * 1.5,
    marginBottom: Spacing.xl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatarEdit: {
    position: 'absolute',
    bottom: 20,
    right: '33%',
    backgroundColor: Colors.secondary,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEditText: {
    fontSize: 14,
  },
  avatarHint: {
    fontSize: FontSize.bodySm,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  sectionLabel: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  genderSection: {
    marginBottom: Spacing.md,
  },
  genderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  genderBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundAlt,
    minHeight: TouchTarget.min,
    justifyContent: 'center',
  },
  genderBtnSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  genderText: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  genderTextSelected: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: Spacing.md,
  },
  continueBtn: {
    marginTop: Spacing.lg,
  },
});
