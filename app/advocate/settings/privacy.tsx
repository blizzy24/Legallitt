import { ShieldCheck } from 'lucide-react-native';
import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import SettingsHero from '../../../components/SettingsHero';
import SettingsHeroArt from '../../../components/SettingsHeroArt';
import { Card, Row, Rule, SectionLabel } from '../../../components/SettingsRows';
import { AS_PRIVACY } from '../../../data/advocateSettings';
import { advSettingsPage as t, font, status } from '../../../constants/theme';

// Advocate settings — privacy (design/251).
//
// STATIC, NOT WIRED. Four toggles that do not toggle, two rows whose pills
// ("Verified Clients Only", "Filtered") are drawn values rather than choices,
// and nothing persisted anywhere.

export default function AdvocatePrivacyScreen() {
  const d = AS_PRIVACY;
  return (
    <SettingsHero
      eyebrow={d.eyebrow}
      title={d.title}
      pill={d.pill}
      h1={d.h1}
      sub={d.sub}
      art={<SettingsHeroArt width={190} height={t.artH} subject="eye" />}
    >
      <SectionLabel title={d.visibilityTitle} meta={d.visibilityMeta} metaTone={status.active} dot />
      <Card>
        {d.visibility.map((r, i) => (
          <Fragment key={r.title}>
            {i > 0 ? <Rule /> : null}
            <Row
              first={i === 0}
              title={r.title}
              sub={r.sub}
              toggle
            />
          </Fragment>
        ))}
      </Card>

      <SectionLabel title={d.commsTitle} />
      <Card>
        {d.comms.map((r, i) => (
          <Fragment key={r.title}>
            {i > 0 ? <Rule /> : null}
            <Row
              first={i === 0}
              title={r.title}
              sub={r.sub}
              toggle={r.toggle}
              pill={r.pill}
              pillTone="neutral"
              chevron={!r.toggle}
            />
          </Fragment>
        ))}
      </Card>

      <SectionLabel title={d.dataTitle} />
      <Card>
        {d.data.map((r, i) => (
          <Fragment key={r.title}>
            {i > 0 ? <Rule /> : null}
            <Row
              first={i === 0}
              title={r.title}
              sub={r.sub}
              toggle={r.toggle}
              chevron={!r.toggle}
            />
          </Fragment>
        ))}
      </Card>

      <View style={styles.note}>
        <View style={styles.noteTile}>
          <ShieldCheck size={t.noteGlyph} color="#FFFFFF" fill="#4D463D" strokeWidth={1.6} />
        </View>
        <View style={styles.noteCol}>
          <Text style={styles.noteTitle}>{d.note.title}</Text>
          <Text style={styles.noteText}>{d.note.body}</Text>
        </View>
      </View>
    </SettingsHero>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#F0E2CD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.noteGap,
  },
  noteCol: { flex: 1 },
  noteTitle: { fontFamily: font.appHeading, fontSize: 16, color: '#1B1C1C' },
  noteText: {
    marginTop: 3,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLine,
    color: '#4D463D',
  },
});
