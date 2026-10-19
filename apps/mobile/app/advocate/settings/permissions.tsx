import {
  Bell,
  Camera,
  FolderClosed,
  MapPin,
  Mic,
  Settings2,
  ShieldCheck,
} from 'lucide-react-native';
import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import SettingsHero from '../../../components/SettingsHero';
import SettingsHeroArt from '../../../components/SettingsHeroArt';
import { Card, Row, Rule } from '../../../components/SettingsRows';
import { shrinkToFit } from '../../../constants/textFit';
import { AS_PERMISSIONS } from '../../../data/advocateSettings';
import { advSettingsPage as t, font, ink } from '../../../constants/theme';

// Advocate settings — app permissions (design/252).
//
// STATIC, NOT WIRED, AND THIS ONE IS EXPLICIT IN THE BRIEF. Not one of these
// rows calls an OS permission API. "Allowed" and "Not Allowed" are drawn
// labels, the chevrons open nothing, and "Open Settings" opens nothing — no
// Linking, no expo-permissions, nothing. The app requests no permission here.

const ICONS = { camera: Camera, mic: Mic, bell: Bell, folder: FolderClosed, pin: MapPin };

export default function AdvocatePermissionsScreen() {
  const d = AS_PERMISSIONS;
  return (
    <SettingsHero
      eyebrow={d.eyebrow}
      title={d.title}
      pill={d.pill}
      h1={d.h1}
      sub={d.sub}
      art={<SettingsHeroArt width={190} height={t.artH} subject="device" />}
      heroCard={false}
    >
      <View style={styles.gap} />
      <Card>
        {d.permissions.map((p, i) => {
          const Icon = ICONS[p.icon as keyof typeof ICONS];
          return (
            <Fragment key={p.title}>
              {i > 0 ? <Rule /> : null}
              <Row
                first={i === 0}
                icon={<Icon size={t.tileGlyph} color="#4D463D" strokeWidth={1.8} />}
                title={p.title}
                sub={p.sub}
                pill={p.status}
                pillTone={p.tone === 'allowed' ? 'allowed' : 'denied'}
                chevron
              />
            </Fragment>
          );
        })}
      </Card>

      <View style={styles.gap} />
      <Card>
        <Row
          first
          icon={<Settings2 size={t.tileGlyph} color="#4D463D" strokeWidth={1.8} />}
          title={d.system.title}
          sub={d.system.sub}
          trailing={
            <View style={styles.openBtn}>
              <Text style={styles.openText} {...shrinkToFit(0.8)}>
                {d.system.action}
              </Text>
            </View>
          }
        />
      </Card>

      <View style={styles.note}>
        <View style={styles.noteTile}>
          <ShieldCheck size={t.noteGlyph} color={ink.accent} strokeWidth={1.8} />
        </View>
        <Text style={styles.noteText}>{d.note}</Text>
      </View>
    </SettingsHero>
  );
}

const styles = StyleSheet.create({
  gap: { height: t.sectionTop + t.sectionGap },
  openBtn: {
    marginLeft: 10,
    height: 42,
    borderRadius: 10,
    paddingHorizontal: 16,
    backgroundColor: '#F4F1EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  openText: { fontFamily: font.appSemi, fontSize: 15, color: '#4D463D' },
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
    backgroundColor: '#FFFFFF',
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
