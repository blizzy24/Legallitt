import { CircleCheck, Gavel, Laptop, LogOut, RadioTower, ShieldCheck, Smartphone, Wifi } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import SettingsHero from '../../../components/SettingsHero';
import SettingsHeroArt from '../../../components/SettingsHeroArt';
import { Card, SectionLabel } from '../../../components/SettingsRows';
import { shrinkToFit } from '../../../constants/textFit';
import { AS_DEVICES } from '../../../data/advocateSettings';
import {
  advForensicRed,
  advSettingsPage as t,
  colors,
  font,
  ink,
  status,
} from '../../../constants/theme';

// Advocate settings — authorized devices (design/253).
//
// ⚠ NOTE 6 — THE HEADER IS THE WRONG SCREEN'S. design/253's header reads
// "DEVICE & PRIVACY / App Permissions", which is design/252's header verbatim,
// while the body of the page is Authorized Devices. Built exactly as drawn: the
// header says App Permissions here too. Not silently corrected.
//
// STATIC, NOT WIRED. There are no sessions and no auth in this project. "Sign
// Out" and "Sign Out All Other Devices" terminate nothing, and "Sync" syncs
// nothing. The IP addresses are drawn strings, already part-masked in the PNG.

export default function AdvocateDevicesScreen() {
  const d = AS_DEVICES;
  return (
    <SettingsHero
      eyebrow={d.eyebrow}
      title={d.title}
      pill={d.pill}
      h1={d.h1}
      sub={d.sub}
      art={<SettingsHeroArt width={190} height={t.artH} subject="devices" />}
    >
      <SectionLabel title={d.currentTitle} meta={d.currentMeta} />
      <Card>
        <View style={styles.row}>
          <View style={styles.tile}>
            <Laptop size={t.tileGlyph} color="#8C6B3F" strokeWidth={1.8} />
          </View>
          <View style={styles.col}>
            <Text style={styles.name} {...shrinkToFit(0.8)}>
              {d.current.name}
            </Text>
            <Text style={styles.sub}>{d.current.sub}</Text>
            <View style={styles.whereRow}>
              <View style={styles.dot} />
              <Text style={styles.where} {...shrinkToFit(0.8)}>
                {d.current.where}
              </Text>
            </View>
          </View>
          <View style={styles.currentPill}>
            <CircleCheck size={t.statusGlyph} color={status.active} strokeWidth={2} />
            <Text style={styles.currentPillText} {...shrinkToFit(0.8)}>
              {d.current.pill}
            </Text>
          </View>
        </View>
        <View style={styles.inner}>
          <ShieldCheck size={16} color="#8C6B3F" strokeWidth={1.8} />
          <Text style={styles.innerText}>{d.current.note}</Text>
        </View>
      </Card>

      <SectionLabel
        title={d.othersTitle}
        meta={d.othersAction}
        metaTone="#4D463D"
      />
      {d.others.map((o, i) => (
        <View key={o.name} style={i > 0 ? styles.otherGap : undefined}>
          <Card>
            <View style={styles.row}>
              <View style={styles.tile}>
                <Smartphone size={t.tileGlyph} color="#8C6B3F" strokeWidth={1.8} />
              </View>
              <View style={styles.col}>
                <Text style={styles.name} {...shrinkToFit(0.8)}>
                  {o.name}
                </Text>
                <Text style={styles.sub}>{o.sub}</Text>
                <Text style={styles.sub}>{o.where}</Text>
              </View>
              <View style={styles.signOutPill}>
                <Text style={styles.signOutText} {...shrinkToFit(0.8)}>
                  Sign Out
                </Text>
              </View>
            </View>
            <View style={styles.netRow}>
              {i === 0 ? (
                <Wifi size={16} color="#4D463D" strokeWidth={1.8} />
              ) : (
                <RadioTower size={16} color="#4D463D" strokeWidth={1.8} />
              )}
              <Text style={styles.netText} {...shrinkToFit(0.8)}>
                {o.net}
              </Text>
              <Text style={styles.ipText} {...shrinkToFit(0.8)}>
                {o.ip}
              </Text>
            </View>
          </Card>
        </View>
      ))}

      <View style={styles.signAll}>
        <LogOut size={20} color={advForensicRed.declineColour} strokeWidth={2} />
        <Text style={styles.signAllText} {...shrinkToFit(0.8)}>
          {d.signOutAll}
        </Text>
      </View>
      <Text style={styles.signAllNote}>{d.signOutNote}</Text>

      <View style={styles.note}>
        <View style={styles.noteTile}>
          <Gavel size={t.noteGlyph} color="#4D463D" strokeWidth={1.8} />
        </View>
        <Text style={styles.noteText}>{d.note}</Text>
      </View>
    </SettingsHero>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  tile: {
    width: t.tile,
    height: t.tile,
    borderRadius: t.tileRadius,
    backgroundColor: '#F6EFE4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.tileGap,
  },
  col: { flex: 1 },
  name: { fontFamily: font.appHeading, fontSize: t.rowTitleSize, color: '#1B1C1C' },
  sub: {
    marginTop: t.rowSubTop,
    fontFamily: font.appBody,
    fontSize: t.rowSubSize,
    lineHeight: t.rowSubLine,
    color: '#4D463D',
  },
  whereRow: { marginTop: t.rowSubTop, flexDirection: 'row', alignItems: 'center' },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: status.active,
    marginRight: 8,
  },
  where: { flex: 1, fontFamily: font.appSemi, fontSize: t.rowSubSize, color: '#0F7A4F' },
  currentPill: {
    marginLeft: 8,
    height: t.statusH,
    borderRadius: t.statusRadius,
    paddingHorizontal: t.statusPadX,
    backgroundColor: status.activeBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentPillText: {
    marginLeft: t.statusGap,
    fontFamily: font.appSemi,
    fontSize: t.statusSize,
    color: '#0F7A4F',
  },

  inner: {
    marginTop: 13,
    flexDirection: 'row',
    backgroundColor: '#F7F3EE',
    borderRadius: 12,
    padding: 12,
  },
  innerText: {
    flex: 1,
    marginLeft: 9,
    fontFamily: font.appBody,
    fontSize: 13.5,
    lineHeight: 18.5,
    color: '#4D463D',
  },

  otherGap: { marginTop: 14 },
  signOutPill: {
    marginLeft: 8,
    height: 38,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: '#FDEAEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    fontFamily: font.appHeading,
    fontSize: 15,
    color: advForensicRed.declineColour,
  },
  netRow: {
    marginTop: 13,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F4F2',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  netText: { flex: 1, marginLeft: 9, fontFamily: font.appSemi, fontSize: 14, color: '#4D463D' },
  ipText: { fontFamily: font.appSemi, fontSize: 14, color: '#4D463D' },

  signAll: {
    marginTop: 20,
    marginHorizontal: t.padX,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FDE2E2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signAllText: {
    marginLeft: 10,
    fontFamily: font.appHeading,
    fontSize: 17,
    color: advForensicRed.declineColour,
  },
  signAllNote: {
    marginTop: 13,
    marginHorizontal: t.padX,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: 14,
    color: '#4D463D',
  },

  note: {
    marginTop: t.noteTop,
    marginHorizontal: t.padX,
    flexDirection: 'row',
    backgroundColor: t.noteBg,
    borderRadius: t.noteRadius,
    padding: t.notePad,
  },
  noteTile: {
    width: t.noteTile,
    height: t.noteTile,
    borderRadius: t.noteTile / 2,
    backgroundColor: '#E8E4E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.noteGap,
  },
  noteText: {
    flex: 1,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLine,
    color: '#4D463D',
  },
});
