import {
  Archive,
  CloudDownload,
  FolderClosed,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react-native';
import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import SettingsHero from '../../../components/SettingsHero';
import SettingsHeroArt from '../../../components/SettingsHeroArt';
import { Card, Row, Rule, SectionLabel } from '../../../components/SettingsRows';
import { AS_DATA } from '../../../data/advocateSettings';
import { advForensicRed, advSettingsPage as t, font, ink } from '../../../constants/theme';

// Advocate settings — data & documents (design/254).
//
// ⚠ STATIC, NOT WIRED — AND TWO OF THESE ROWS ARE LEGAL OBLIGATIONS, NOT
// DECORATION. "Download My Data" and "Delete Account" are the DPDP Act's
// portability and erasure duties. They are DRAWN here and WIRED TO NOTHING,
// deliberately and on instruction: there is no export, no deletion, no
// confirmation step and no backend. Whoever implements them needs to treat
// them as compliance work, not as two more buttons.
//
// Nothing else on the screen is wired either: "Personal Information",
// "Download Account Data", "My Documents" and "Storage" all open nothing, and
// the storage figures are drawn values.
//
// ⚠ NEVER ELLIPSIZE. The export clips three subtitles, at "your acc",
// "inform" and "Legalitt acc". All three are stored and rendered whole.
//
// ⚠ This export draws no hero card and no info icon, and its title wraps to
// two lines — all three differ from design/251 and design/253.

const ICONS = {
  user: UserRound,
  archive: Archive,
  folder: FolderClosed,
  cloud: CloudDownload,
  trash: Trash2,
};

export default function AdvocateDataScreen() {
  const d = AS_DATA;
  const icon = (name: string, colour: string) => {
    const Icon = ICONS[name as keyof typeof ICONS];
    return <Icon size={t.tileGlyph} color={colour} strokeWidth={1.8} />;
  };

  return (
    <SettingsHero
      eyebrow={d.eyebrow}
      title={d.title}
      pill={d.pill}
      h1={d.h1}
      sub={d.sub}
      art={<SettingsHeroArt width={190} height={t.artH} subject="vault" />}
      heroCard={false}
      showInfo={false}
      roundBack={false}
      alignLeft
    >
      <SectionLabel title={d.yourDataTitle} />
      <Card>
        {d.yourData.map((r, i) => (
          <Fragment key={r.title}>
            {i > 0 ? <Rule /> : null}
            <Row first={i === 0} icon={icon(r.icon, '#4D463D')} title={r.title} sub={r.sub} chevron />
          </Fragment>
        ))}
      </Card>

      <SectionLabel title={d.documentsTitle} />
      <Card>
        {d.documents.map((r, i) => (
          <Fragment key={r.title}>
            {i > 0 ? <Rule /> : null}
            <Row
              first={i === 0}
              icon={icon(r.icon, '#4D463D')}
              title={r.title}
              sub={r.sub}
              pill={r.pill}
              pillTone="neutral"
              chevron
            />
          </Fragment>
        ))}
      </Card>

      <SectionLabel title={d.actionsTitle} />
      <Card>
        {d.actions.map((r, i) => (
          <Fragment key={r.title}>
            {i > 0 ? <Rule /> : null}
            <Row
              first={i === 0}
              icon={icon(r.icon, r.danger ? advForensicRed.declineColour : '#4D463D')}
              tileBg={r.danger ? '#FDEAEA' : undefined}
              title={r.title}
              sub={r.sub}
              danger={r.danger ? advForensicRed.declineColour : undefined}
              chevron
            />
          </Fragment>
        ))}
      </Card>

      <View style={styles.note}>
        <View style={styles.noteTile}>
          <ShieldCheck size={t.noteGlyph} color={ink.accent} strokeWidth={1.8} />
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
    backgroundColor: '#E8E4E1',
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
