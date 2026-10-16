import { previewNotice } from '../../../components/PreviewNotice';
import { router, type Href } from 'expo-router';
import { UserRound, Video } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import AdvToolHeader from '../../../components/AdvToolHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { AT_APPT_DETAILS } from '../../../data/advocateTools';
import { advApptDetails as t, font, ink } from '../../../constants/theme';

// Advocate — appointment details (design/273).
//
// Built as drawn, including:
// ⚠ Note 16 — design/273 double-prints the "Case" label, one word over
//   another. Rendered once.
// ⚠ The "Actions" label and the two buttons sit on a 20pt gutter where the two
//   cards above them sit on 21pt.
// ⚠ The export puts a PHOTOGRAPH in the client card. No photography ships with
//   this prototype, so the house convention is used — a brand circle with the
//   UserRound glyph, as components/AdvocateCasesList already does.
//
// "Join Consultation" opens the consultation video screen (no calling vendor
// behind it — none is scoped). "View Case" has no destination here.
export default function AdvocateAppointmentDetailsScreen() {
  const d = AT_APPT_DETAILS;

  return (
    <View style={styles.screen}>
      <AdvToolHeader title={d.title} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.client}>
          <View style={styles.avatar}>
            <UserRound size={t.avatarGlyph} color={ink.onBrand} strokeWidth={1.8} />
          </View>
          <View style={styles.clientCol}>
            <Text style={styles.name} {...shrinkToFit(0.8)}>
              {d.client.name}
            </Text>
            <Text style={styles.matter} {...shrinkToFit(0.8)}>
              {d.client.matter}
            </Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText} {...shrinkToFit(0.8)}>
              {d.client.status}
            </Text>
          </View>
        </View>

        <View style={styles.rows}>
          {d.rows.map((r) => (
            <View key={r.label} style={[styles.row, r.icon && styles.rowTall]}>
              <Text style={styles.rowLabel} {...shrinkToFit(0.8)}>
                {r.label}
              </Text>
              {r.icon ? (
                <Video
                  size={t.rowIcon}
                  color={t.rowIconColour}
                  strokeWidth={2}
                  style={styles.rowIcon}
                />
              ) : null}
              <Text style={styles.rowValue} {...shrinkToFit(0.8)}>
                {r.value}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.actions}>{d.actions}</Text>

        <Pressable onPress={() => router.push('/advocate/consultation/la-2026-1048/video' as Href)} accessibilityRole="button" style={({ pressed }) => [styles.join, pressed && styles.pressed]}>
          <Video size={t.joinGlyph} color={ink.onBrand} strokeWidth={2} />
          <Text style={styles.joinText} {...shrinkToFit(0.8)}>
            {d.join}
          </Text>
        </Pressable>

        <Pressable onPress={() => previewNotice(d.viewCase)} accessibilityRole="button" style={({ pressed }) => [styles.view, pressed && styles.pressed]}>
          <Text style={styles.viewText} {...shrinkToFit(0.8)}>
            {d.viewCase}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  content: { paddingBottom: t.contentBottom },

  client: {
    marginTop: t.cardTop,
    marginHorizontal: t.padX,
    height: t.clientH,
    borderRadius: t.cardRadius,
    backgroundColor: t.cardBg,
    paddingLeft: t.clientPadX,
    paddingRight: t.chipPadRight,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: t.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientCol: { flex: 1, marginLeft: t.avatarGap },
  name: {
    fontFamily: font.appHeading,
    fontSize: t.nameSize,
    lineHeight: t.nameLine,
    color: t.ink,
  },
  matter: {
    marginTop: t.matterTop,
    fontFamily: font.appSemi,
    fontSize: t.matterSize,
    color: t.matterColour,
  },
  chip: {
    height: t.chipH,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: t.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: { fontFamily: font.appBody, fontSize: t.chipSize, color: t.chipColour },

  rows: {
    marginTop: t.rowsTop,
    marginHorizontal: t.padX,
    borderRadius: t.cardRadius,
    backgroundColor: t.cardBg,
    paddingHorizontal: t.rowsPadX,
    paddingTop: t.rowsPadTop,
    paddingBottom: t.rowsPadBottom,
  },
  row: { minHeight: t.rowPitch, flexDirection: 'row', alignItems: 'center' },
  rowTall: { minHeight: t.rowIconPitch },
  rowLabel: { width: t.labelW, fontFamily: font.appBody, fontSize: t.rowSize, color: t.ink },
  rowIcon: { marginRight: t.rowIconGap },
  rowValue: { flex: 1, fontFamily: font.appBody, fontSize: t.rowSize, color: t.ink },

  actions: {
    marginTop: t.actionsTop,
    marginHorizontal: t.actionPadX,
    fontFamily: font.appHeading,
    fontSize: t.actionsSize,
    color: t.ink,
  },
  join: {
    marginTop: t.joinTop,
    marginHorizontal: t.actionPadX,
    height: t.btnH,
    borderRadius: t.btnRadius,
    backgroundColor: t.joinBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinText: {
    marginLeft: t.joinGap,
    fontFamily: font.appSemi,
    fontSize: t.btnSize,
    color: ink.onBrand,
  },
  view: {
    marginTop: t.viewTop,
    marginHorizontal: t.actionPadX,
    height: t.btnH,
    borderRadius: t.btnRadius,
    borderWidth: 1,
    borderColor: t.viewBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewText: { fontFamily: font.appSemi, fontSize: t.btnSize, color: t.viewBorder },
  pressed: { opacity: 0.85 },
});
