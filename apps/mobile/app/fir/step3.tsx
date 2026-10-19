import { previewNotice } from '../../components/PreviewNotice';
import { router, type Href } from 'expo-router';
import {
  ArrowRight, BadgeCheck, ChevronDown, ChevronRight, Eye, Gavel, IdCard, Phone,
  SquarePen, Trash2, UserPlus, UserRoundCheck, UserRoundX, UsersRound,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import FirShell from '../../components/FirShell';
import { colors, firStep3 as t, font, ink } from '../../constants/theme';

type Accused = { id: string; name: string; phone: string; alias: string; primary: boolean };
type Witness = { id: string; name: string; role: string; phone: string; presence: string };

// design/44's sample entries.
const INITIAL_ACCUSED: Accused[] = [
  { id: 'a1', name: 'Unknown Caller / Impersonator', phone: '+91 91234 56789', alias: 'Alias: "Ramesh Sharma – Branch Ops"', primary: true },
];
const INITIAL_WITNESSES: Witness[] = [
  { id: 'w1', name: 'Rajesh Kumar Verma', role: 'Eyewitness / Colleague', phone: '+91 98111 22334', presence: 'Present during call' },
];

const COMPLAINANT = {
  fullName: 'Arvind S. Kashyap',
  contact: '+91 98765 43210',
  residence: 'Flat 402, Royal Palms, Sector 18, Noida, UP - 201301',
};

// Step 3 — People Involved (design/44). Add and Remove work against local state;
// the Edit links are inert, as specified.
export default function FirStep3Screen() {
  const [accused, setAccused] = useState<Accused[]>(INITIAL_ACCUSED);
  const [witnesses, setWitnesses] = useState<Witness[]>(INITIAL_WITNESSES);
  const [nextId, setNextId] = useState(2);

  const addAccused = () => {
    setAccused((list) => [...list, { id: `a${nextId}`, name: 'Unnamed Accused', phone: '', alias: '', primary: false }]);
    setNextId((n) => n + 1);
  };
  const addWitness = () => {
    setWitnesses((list) => [...list, { id: `w${nextId}`, name: 'Unnamed Witness', role: 'Witness', phone: '', presence: '' }]);
    setNextId((n) => n + 1);
  };

  return (
    <FirShell step={3} title="People Involved" showHelp>
      <View style={[styles.card, styles.firstCard]}>
        <View style={styles.headRow}>
          <View style={styles.headIcon}>
            <UserRoundCheck size={t.headIconGlyph} color={ink.accent} />
          </View>
          <Text style={styles.headTitle}>Complainant</Text>
          <View style={styles.primaryChip}>
            <View style={styles.primaryDot} />
            <Text style={styles.primaryChipText}>Primary (You)</Text>
          </View>
          <Pressable onPress={() => previewNotice("Edit")} accessibilityRole="button" style={styles.edit}>
            <SquarePen size={t.editIcon} color={ink.accent} />
            <Text style={styles.editText}>Edit</Text>
          </Pressable>
        </View>

        <View style={styles.panel}>
          <View style={styles.panelRow}>
            <Text style={styles.rowLabel}>Full Name</Text>
            <Text style={styles.rowValue}>{COMPLAINANT.fullName}</Text>
          </View>
          <View style={[styles.panelRow, styles.panelRowSpaced]}>
            <Text style={styles.rowLabel}>Contact</Text>
            <View style={styles.contactValue}>
              <Text style={styles.rowValue}>{COMPLAINANT.contact}</Text>
              <BadgeCheck size={t.lineIcon} color={t.verified} />
            </View>
          </View>
          <Text style={[styles.rowLabel, styles.panelRowSpaced]}>Registered Residence</Text>
          <Text style={styles.address}>{COMPLAINANT.residence}</Text>
        </View>

        <View style={styles.footRow}>
          <Gavel size={t.footIcon} color={colors.textBody} />
          <Text style={styles.footText}>Statutory Complainant / Informant under BNSS § 173</Text>
        </View>
      </View>

      <SectionHeading title="Accused / Opposite Party" count={accused.length} description="Add individuals or unknown suspects involved in the incident." />
      {accused.map((a) => (
        <View key={a.id} style={styles.sectionCard}>
          <View style={styles.headRow}>
            <View style={styles.headIcon}>
              <UserRoundX size={t.headIconGlyph} color={ink.accent} />
            </View>
            <View style={styles.headText}>
              <Text style={styles.name}>{a.name}</Text>
              {a.primary && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>Primary Accused</Text>
                </View>
              )}
            </View>
            <ChevronDown size={t.nameChevron} color={colors.textBody} />
          </View>
          {(a.phone || a.alias) && (
            <View style={styles.panel}>
              {a.phone && (
                <View style={styles.lineRow}>
                  <Phone size={t.lineIcon} color={colors.textBody} />
                  <Text style={styles.lineText}>{a.phone}</Text>
                </View>
              )}
              {a.alias && (
                <View style={[styles.lineRow, styles.lineRowSpaced]}>
                  <IdCard size={t.lineIcon} color={colors.textBody} />
                  <Text style={styles.lineText}>{a.alias}</Text>
                </View>
              )}
            </View>
          )}
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={() => setAccused((l) => l.filter((x) => x.id !== a.id))} style={styles.action}>
              <Trash2 size={t.actionIcon} color={t.removeColour} />
              <Text style={[styles.actionText, styles.removeText]}>Remove</Text>
            </Pressable>
            <Text style={styles.actionSep}>•</Text>
            <Pressable onPress={() => router.push('/fir/step1' as Href)} accessibilityRole="button" style={styles.action}>
              <SquarePen size={t.actionIcon} color={colors.textPrimary} />
              <Text style={styles.actionText}>Edit Details</Text>
            </Pressable>
          </View>
        </View>
      ))}
      <AddButton icon={UserPlus} label="+ Add Accused / Opposite Party" onPress={addAccused} />

      <SectionHeading title="Witnesses" count={witnesses.length} description="Persons present during or immediately after the incident." />
      {witnesses.map((w) => (
        <View key={w.id} style={styles.sectionCard}>
          <View style={styles.headRow}>
            <View style={styles.headIcon}>
              <Eye size={t.headIconGlyph} color={colors.textBody} />
            </View>
            <View style={styles.headText}>
              <Text style={styles.name}>{w.name}</Text>
              <View style={styles.roleRow}>
            <View style={styles.keyTag}>
              <Text style={styles.keyTagText}>Key Witness</Text>
            </View>
                <Text style={styles.roleText}>• {w.role}</Text>
              </View>
            </View>
            <ChevronRight size={t.nameChevron} color={colors.textBody} />
          </View>
          {(w.phone || w.presence) && (
            <View style={styles.panel}>
              <View style={styles.lineRow}>
                <Phone size={t.lineIcon} color={colors.textBody} />
                <Text style={styles.lineText}>{w.phone}</Text>
                <View style={styles.spacer} />
                <Text style={styles.presence}>{w.presence}</Text>
              </View>
            </View>
          )}
          {/* design/44's witness card carries only Edit Statement Note — there is no
              Remove control on it, unlike the accused card. Left as drawn. */}
          <View style={styles.actions}>
            <Pressable onPress={() => router.push('/fir/step2' as Href)} accessibilityRole="button" style={styles.action}>
              <SquarePen size={t.actionIcon} color={colors.textPrimary} />
              <Text style={styles.actionText}>Edit Statement Note</Text>
            </Pressable>
          </View>
        </View>
      ))}
      <AddButton icon={UsersRound} label="+ Add Witness" onPress={addWitness} />

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/fir/step4')}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.buttonText}>Continue to Evidence &amp; Documents</Text>
        <ArrowRight size={t.buttonIcon} color={ink.onBrand} />
      </Pressable>
    </FirShell>
  );
}

function SectionHeading({ title, count, description }: { title: string; count: number; description: string }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.countChip}>
          <Text style={styles.countChipText}>{count} Added</Text>
        </View>
      </View>
      <Text style={styles.sectionDesc}>{description}</Text>
    </View>
  );
}

function AddButton({ icon: Icon, label, onPress }: { icon: typeof UserPlus; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.add, pressed && styles.pressed]}>
      <Icon size={t.addIcon} color={colors.textPrimary} />
      <Text style={styles.addText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    paddingHorizontal: t.cardPad,
    paddingTop: t.cardPadTop,
    paddingBottom: t.cardPadBottom,
  },
  firstCard: {
    marginTop: 0,
  },
  sectionCard: {
    marginTop: t.sectionCardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    paddingHorizontal: t.cardPad,
    paddingTop: t.cardPadTop,
    paddingBottom: t.cardPadBottom,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headText: {
    flex: 1,
    minWidth: 0,
  },
  headIcon: {
    width: t.headIcon,
    height: t.headIcon,
    borderRadius: t.headIconRadius,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.headIconGap,
  },
  headTitle: {
    fontFamily: font.appHeading,
    fontSize: t.headTitleSize,
    color: colors.textPrimary,
  },
  name: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appHeading,
    fontSize: t.nameSize,
    color: colors.textPrimary,
  },
  primaryChip: {
    marginLeft: t.chipGap,
    height: t.chipHeight,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: t.primaryBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryDot: {
    width: t.chipDot,
    height: t.chipDot,
    borderRadius: t.chipDot / 2,
    backgroundColor: t.primaryDot,
    marginRight: t.chipDotGap,
  },
  primaryChipText: {
    fontFamily: font.appSemi,
    fontSize: t.chipSize,
    color: t.primaryText,
  },
  edit: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.editIconGap,
  },
  editText: {
    fontFamily: font.appSemi,
    fontSize: t.editSize,
    color: ink.accent,
  },
  panel: {
    marginTop: t.panelGap,
    borderRadius: t.panelRadius,
    backgroundColor: t.panelBg,
    padding: t.panelPad,
  },
  panelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  panelRowSpaced: {
    marginTop: t.rowGap,
  },
  rowLabel: {
    fontFamily: font.appBody,
    fontSize: t.rowLabelSize,
    color: colors.textBody,
  },
  rowValue: {
    fontFamily: font.appSemi,
    fontSize: t.rowValueSize,
    color: colors.textPrimary,
  },
  contactValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  address: {
    marginTop: t.addressGap,
    fontFamily: font.appBody,
    fontSize: t.rowValueSize,
    lineHeight: t.addressLineHeight,
    color: colors.textPrimary,
  },
  footRow: {
    marginTop: t.footGap,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.footIconGap,
  },
  footText: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.footSize,
    lineHeight: t.footLineHeight,
    color: colors.textBody,
  },
  section: {
    marginTop: t.sectionGap,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: font.appHeading,
    fontSize: t.sectionSize,
    color: colors.textPrimary,
  },
  countChip: {
    marginLeft: t.chipGap,
    height: t.tagHeight,
    borderRadius: t.tagHeight / 2,
    paddingHorizontal: t.tagPadX,
    backgroundColor: colors.iconChipBg,
    justifyContent: 'center',
  },
  countChipText: {
    fontFamily: font.appSemi,
    fontSize: t.tagSize,
    color: ink.accent,
  },
  sectionDesc: {
    marginTop: t.sectionDescGap,
    fontFamily: font.appBody,
    fontSize: t.sectionDescSize,
    lineHeight: t.sectionDescLineHeight,
    color: colors.textBody,
  },
  tag: {
    marginTop: t.tagGap,
    alignSelf: 'flex-start',
    height: t.tagHeight,
    borderRadius: t.tagRadius,
    paddingHorizontal: t.tagPadX,
    backgroundColor: t.tagBg,
    justifyContent: 'center',
  },
  tagText: {
    fontFamily: font.appSemi,
    fontSize: t.tagSize,
    color: t.tagText,
  },
  roleRow: {
    marginTop: t.roleGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  keyTag: {
    height: t.tagHeight,
    borderRadius: t.tagRadius,
    paddingHorizontal: t.tagPadX,
    backgroundColor: colors.iconChipBg,
    justifyContent: 'center',
  },
  keyTagText: {
    fontFamily: font.appSemi,
    fontSize: t.tagSize,
    color: colors.textPrimary,
  },
  roleText: {
    marginLeft: 7,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.roleSize,
    color: colors.textBody,
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.lineIconGap,
  },
  lineRowSpaced: {
    marginTop: t.lineGap,
  },
  lineText: {
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.lineSize,
    color: colors.textPrimary,
  },
  spacer: {
    flex: 1,
  },
  presence: {
    fontFamily: font.appBody,
    fontSize: t.footSize,
    color: colors.textBody,
  },
  actions: {
    marginTop: t.actionsGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.actionIconGap,
  },
  actionText: {
    fontFamily: font.appSemi,
    fontSize: t.actionSize,
    color: colors.textPrimary,
  },
  removeText: {
    color: t.removeColour,
  },
  actionSep: {
    marginHorizontal: t.actionSepGap,
    fontFamily: font.appBody,
    fontSize: t.actionSize,
    color: colors.textMuted,
  },
  add: {
    marginTop: t.addGap,
    height: t.addHeight,
    borderRadius: t.addRadius,
    backgroundColor: t.addBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.addIconGap,
  },
  addText: {
    fontFamily: font.appSemi,
    fontSize: t.addSize,
    color: colors.textPrimary,
  },
  button: {
    marginTop: t.buttonGap,
    height: t.buttonHeight,
    borderRadius: t.buttonRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.buttonIconGap,
  },
  pressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontFamily: font.appSemi,
    fontSize: t.buttonSize,
    color: ink.onBrand,
  },
});
