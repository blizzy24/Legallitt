import DemoPressable from '../components/DemoPressable';
import { router } from 'expo-router';
import { ArrowRight, CircleQuestionMark, Headset } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { buttonShadow, callback as k, colors, font, ink } from '../constants/theme';

// Request a Callback (design/36). Its fields are a third style again: white and
// elevated, with the label above the field rather than inside it.
function FixtureCallbackScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + k.top, paddingBottom: insets.bottom + k.cardGap }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={10} onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'))}>
            <Text style={styles.backGlyph}>←</Text>
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.title}>Request a Callback</Text>
            <Text style={styles.subtitle}>Get expert assistance from our Legal Support Team.</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.card}>
          <View style={styles.iconBox}>
            <CircleQuestionMark size={k.icon} color={ink.accent} />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Need a little help?</Text>
            <Text style={styles.cardBody}>
              Our Legal Support Team will contact you to understand your requirement and guide you through the next steps.
            </Text>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>YOUR DETAILS</Text>
          <Text style={styles.sectionNote}>* Required fields</Text>
        </View>

        <Label text="Full Name" />
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Enter your full name"
          placeholderTextColor={ink.hint}
          accessibilityLabel="Full Name"
          autoComplete="name"
          style={styles.field}
        />

        <View style={styles.labelSpacer}>
          <Label text="Mobile Number" />
        </View>
        <View style={styles.mobileRow}>
          <View style={styles.prefix}>
            <Text style={styles.prefixText}>+91</Text>
          </View>
          <TextInput
            value={mobile}
            onChangeText={setMobile}
            placeholder="Enter your mobile number"
            placeholderTextColor={ink.hint}
            accessibilityLabel="Mobile Number"
            keyboardType="phone-pad"
            style={[styles.field, styles.mobileField]}
          />
        </View>

        <View style={styles.info}>
          <Headset size={k.infoIcon} color={ink.accent} />
          <Text style={styles.infoText}>Our team will review your request and contact you in 24 hours</Text>
        </View>

        <DemoPressable accessibilityRole="button" style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <Text style={styles.buttonText}>Request Callback</Text>
          <ArrowRight size={k.buttonIcon} color={ink.onBrand} />
        </DemoPressable>

        <Text style={styles.footer}>Your information will be used only to process your callback request.</Text>
      </ScrollView>
    </View>
  );
}

function Label({ text }: { text: string }) {
  return (
    <Text style={styles.label}>
      {text} <Text style={styles.star}>*</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  content: {
    paddingHorizontal: k.padX,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  backGlyph: {
    width: k.backIcon,
    fontFamily: font.appBody,
    fontSize: k.backIcon,
    lineHeight: k.titleLineHeight,
    color: colors.textPrimary,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
    marginLeft: k.backGap,
  },
  title: {
    fontFamily: font.appHeading,
    fontSize: k.titleSize,
    lineHeight: k.titleLineHeight,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: k.subtitleGap,
    fontFamily: font.appBody,
    fontSize: k.subtitleSize,
    lineHeight: k.subtitleLineHeight,
    color: colors.textBody,
  },
  divider: {
    marginTop: k.dividerGap,
    height: 1,
    backgroundColor: colors.border,
  },
  card: {
    marginTop: k.cardGap,
    borderRadius: k.cardRadius,
    backgroundColor: k.cardBg,
    padding: k.cardPad,
    paddingBottom: k.cardPadBottom,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: k.iconBox,
    height: k.iconBox,
    borderRadius: k.iconBoxRadius,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: k.iconGap,
  },
  cardText: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    marginTop: k.cardTitleGap,
    fontFamily: font.appHeading,
    fontSize: k.cardTitleSize,
    color: colors.textPrimary,
  },
  cardBody: {
    marginTop: k.cardBodyGap,
    fontFamily: font.appBody,
    fontSize: k.cardBodySize,
    lineHeight: k.cardBodyLineHeight,
    color: colors.textBody,
  },
  sectionRow: {
    marginTop: k.sectionGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontFamily: font.appSemi,
    fontSize: k.sectionSize,
    letterSpacing: k.sectionSpacing,
    color: ink.accent,
  },
  sectionNote: {
    fontFamily: font.appBody,
    fontSize: k.sectionNoteSize,
    color: k.note,
  },
  label: {
    marginTop: k.labelGap,
    fontFamily: font.appSemi,
    fontSize: k.labelSize,
    color: k.label,
  },
  labelSpacer: {
    marginTop: k.labelGapAfter - k.labelGap,
  },
  star: {
    color: colors.brand,
  },
  field: {
    marginTop: k.fieldGap,
    height: k.fieldHeight,
    borderRadius: k.fieldRadius,
    backgroundColor: k.fieldBg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: k.fieldPadX,
    fontFamily: font.appBody,
    fontSize: k.fieldTextSize,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  mobileRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  prefix: {
    marginTop: k.fieldGap,
    width: k.prefixWidth,
    height: k.fieldHeight,
    borderTopLeftRadius: k.fieldRadius,
    borderBottomLeftRadius: k.fieldRadius,
    backgroundColor: k.prefixBg,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefixText: {
    fontFamily: font.appBody,
    fontSize: k.prefixTextSize,
    color: colors.textPrimary,
  },
  mobileField: {
    flex: 1,
    minWidth: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  info: {
    marginTop: k.infoGap,
    height: k.infoHeight,
    borderRadius: k.fieldRadius,
    backgroundColor: k.infoBg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: k.infoPadX,
    flexDirection: 'row',
    alignItems: 'center',
    gap: k.infoIconGap,
  },
  infoText: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: k.infoTextSize,
    color: colors.textBody,
  },
  button: {
    marginTop: k.buttonGap,
    height: k.buttonHeight,
    borderRadius: k.buttonRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: k.buttonIconGap,
    ...buttonShadow,
  },
  pressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontFamily: font.appSemi,
    fontSize: k.buttonTextSize,
    color: ink.onBrand,
  },
  footer: {
    marginTop: k.footerGap,
    alignSelf: 'center',
    maxWidth: k.footerMaxWidth,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: k.footerSize,
    lineHeight: k.footerLineHeight,
    color: k.footer,
  },
});

import {RequestCallback} from '../features/messages/Support';
import {DATA_SOURCE as LIVE_DATA_SOURCE} from '../lib/data-source';
export default function LiveScreen() { return LIVE_DATA_SOURCE === 'api' ? <RequestCallback/> : <FixtureCallbackScreen/>; }
