import { AdvocateAvatar } from '../../components/AdvocateAvatar';
import { router } from 'expo-router';
import { Star } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../constants/textFit';
import { LA_ADVOCATE } from '../../data/legalAdvice';
import { colors, font, ink, laRate as t } from '../../constants/theme';

// Rate & review (design/119-la-review-empty.png and design/120-la-completed-b.png —
// both file names are wrong; the batch's numbering is shifted by one).
//
// The two files are the same screen in two states: design/119 draws no stars
// selected, design/120 draws four. Both are reachable here because the stars are
// interactive and the "Rating(n/5)" label follows them, so neither state needs its
// own route.
//
// Nothing is posted. Cancel and Post both just leave the screen.
//
// REPORTED — design/119 shows "Rating(4/5)" above an EMPTY star row. The label is
// hard-coded in the file rather than following the stars, which is exactly the
// defect the brief asks to avoid; here it is wired to the selection.

const MAX = 5;

export default function LegalAdviceRateScreen() {
  const insets = useSafeAreaInsets();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  return (
    <View style={styles.screen}>
      {/* The dimmed screen behind the modal, as both files draw it. */}
      <ScrollView
        contentContainerStyle={[styles.behind, { paddingTop: insets.top + t.behindTitleTop }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.behindTitle}>Consultation Summary</Text>
        <Text style={styles.behindBody}>
          Thank you for consulting with our legal experts. We hope we were able to assist you with
          clarity and confidence
        </Text>

        <View style={styles.card}>
          <Text style={styles.title} {...shrinkToFit(0.8)}>
            Rate and review
          </Text>

          <View style={styles.row}>
            {/* Client-supplied replacement portrait; mapping in data/advocates.ts. */}
            <AdvocateAvatar name={LA_ADVOCATE.name} style={styles.photo}><Text style={styles.photoText}>{LA_ADVOCATE.initials}</Text></AdvocateAvatar>
            <View style={styles.rowText}>
              <Text style={styles.name} {...shrinkToFit(0.75)}>
                {LA_ADVOCATE.name}
              </Text>
              <Text style={styles.line} {...shrinkToFit(0.75)}>
                {LA_ADVOCATE.experience}
              </Text>
              <Text style={styles.line} {...shrinkToFit(0.75)}>
                {LA_ADVOCATE.practice} Expert
              </Text>
              <Text style={styles.line} {...shrinkToFit(0.75)}>
                {LA_ADVOCATE.rating} ({LA_ADVOCATE.reviews})
              </Text>
            </View>
            <Pressable accessibilityRole="button" style={styles.profile}>
              <Text style={styles.profileText} {...shrinkToFit(0.75)}>
                View Profile
              </Text>
            </Pressable>
          </View>

          <Text style={styles.rating} {...shrinkToFit(0.8)}>
            Rating({rating}/{MAX})
          </Text>

          <View style={styles.stars}>
            {Array.from({ length: MAX }, (_, i) => {
              const on = i < rating;
              return (
                <Pressable
                  key={i}
                  accessibilityRole="button"
                  accessibilityLabel={`${i + 1} star${i ? 's' : ''}`}
                  hitSlop={4}
                  onPress={() => setRating(i + 1 === rating ? 0 : i + 1)}
                  style={styles.starHit}
                >
                  <Star
                    size={t.star}
                    color={on ? t.starOn : t.starOff}
                    fill={on ? t.starOn : t.starOff}
                  />
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.reviewLabel} {...shrinkToFit(0.8)}>
            Review
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Type Your Review...."
            placeholderTextColor={colors.textMuted}
            multiline
            value={review}
            onChangeText={setReview}
          />

          <View style={styles.buttons}>
            <Pressable
              accessibilityRole="button"
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/legal-advice/completed'))}
              style={({ pressed }) => [styles.button, styles.cancel, pressed && styles.pressed]}
            >
              <Text style={styles.cancelLabel}>Cancel</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/legal-advice/completed'))}
              style={({ pressed }) => [styles.button, styles.post, pressed && styles.pressed]}
            >
              <Text style={styles.postLabel}>Post</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.backdrop },
  behind: { paddingHorizontal: t.padX, paddingBottom: 30 },
  behindTitle: {
    fontFamily: font.appHeading,
    fontSize: t.behindTitleSize,
    color: 'rgba(255,255,255,0.72)',
  },
  behindBody: {
    marginTop: t.behindBodyGap,
    fontFamily: font.appBody,
    fontSize: t.behindBodySize,
    lineHeight: t.behindBodyLineHeight,
    color: 'rgba(255,255,255,0.5)',
  },

  card: {
    marginTop: t.cardTop,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },
  title: { fontFamily: font.appBody, fontSize: t.titleSize, color: colors.textPrimary },

  row: {
    marginTop: t.rowGap,
    borderRadius: t.rowRadius,
    borderWidth: 1,
    borderColor: t.rowBorder,
    padding: t.rowPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  photo: {
    width: t.photo,
    height: t.photo,
    borderRadius: t.photo / 2,
    backgroundColor: colors.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: { fontFamily: font.appSemi, fontSize: 15, color: colors.brandDark },
  rowText: { flex: 1, minWidth: 0, marginLeft: t.photoGap, marginRight: 8 },
  name: { fontFamily: font.appHeading, fontSize: t.nameSize, color: colors.textPrimary },
  line: {
    marginTop: t.lineGap,
    fontFamily: font.appBody,
    fontSize: t.lineSize,
    color: colors.textBody,
  },
  profile: {
    minHeight: t.profileHeight,
    borderRadius: t.profileRadius,
    borderWidth: 1,
    borderColor: t.profileBorder,
    paddingHorizontal: t.profilePadX,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: { fontFamily: font.appBody, fontSize: t.profileSize, color: colors.textBody },

  rating: {
    marginTop: t.ratingGap,
    fontFamily: font.appHeading,
    fontSize: t.ratingSize,
    color: colors.textPrimary,
  },
  stars: { marginTop: t.starsGap, flexDirection: 'row' },
  starHit: { marginRight: t.starGap },

  reviewLabel: {
    marginTop: t.reviewGap,
    fontFamily: font.appBody,
    fontSize: t.reviewLabelSize,
    color: colors.textPrimary,
  },
  input: {
    marginTop: t.inputGap,
    height: t.inputHeight,
    borderRadius: t.inputRadius,
    borderWidth: 1,
    borderColor: t.inputBorder,
    padding: t.inputPad,
    textAlignVertical: 'top',
    fontFamily: font.appBody,
    fontSize: t.inputSize,
    color: colors.textPrimary,
    outlineWidth: 0,
  },

  buttons: { marginTop: t.buttonsGap, flexDirection: 'row', gap: t.buttonColGap },
  button: {
    flex: 1,
    minWidth: 0,
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  cancel: { borderWidth: 1, borderColor: t.cancelBorder },
  cancelLabel: { fontFamily: font.appBody, fontSize: t.buttonSize, color: colors.textBody },
  post: { backgroundColor: t.postBg },
  postLabel: { fontFamily: font.appBody, fontSize: t.buttonSize, color: ink.onBrand },
});
