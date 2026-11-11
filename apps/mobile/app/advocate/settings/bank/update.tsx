import { router, type Href } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Building2,
  Check,
  CircleCheck,
  EyeOff,
  IdCard,
  Info,
  Landmark,
  Lock,
  MapPin,
  ShieldCheck,
  UserRound,
} from 'lucide-react-native';
import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../../constants/textFit';
import { AS_BANK_UPDATE } from '../../../../data/advocateSettings';
import { advBank as t, colors, font, ink, status } from '../../../../constants/theme';

// Advocate settings — update bank account (design/258).
//
// ⚠ NOTE 10 — THIS SCREEN RENDERS A FULL BANK ACCOUNT NUMBER IN PLAIN TEXT,
// TWICE: 987654324821 in the Account Number field and again in Confirm. Every
// other screen in this flow masks it to "•••• 4821", and the screen's own
// footnote says "sensitive banking information is partially hidden". Built
// exactly as drawn and flagged: whether a full account number should ever be
// echoed back on screen is a disclosure decision for the client, not a styling
// one. One string in data/advocateSettings.ts changes it.
//
// ⚠ STATIC, NOT WIRED — INCLUDING THE PENNY DROP. The card promises "a nominal
// test credit of ₹1 will be deposited to verify active ownership". No ₹1 is
// deposited. There is no payment rail, no bank API and no backend in this
// project. "Matches" and "Branch Verified" are drawn labels, the account type
// does not switch, and Continue only pushes to design/259's screen.

function Field({
  label,
  pill,
  hint,
  value,
  icon,
  helper,
  gap,
}: {
  label: string;
  pill?: string;
  hint?: string;
  value: string;
  icon?: ReactNode;
  helper?: string;
  gap?: boolean;
}) {
  return (
    <View style={gap ? { marginTop: t.fieldGap } : undefined}>
      <View style={styles.labelRow}>
        <Text style={styles.label} {...shrinkToFit(0.8)}>
          {label}
        </Text>
        {pill ? (
          <View style={styles.matchRow}>
            <CircleCheck size={16} color={status.active} strokeWidth={2} />
            <Text style={styles.matchText} {...shrinkToFit(0.8)}>
              {pill}
            </Text>
          </View>
        ) : null}
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      <View style={styles.input}>
        <Text style={styles.value} {...shrinkToFit(0.8)}>
          {value}
        </Text>
        {icon}
      </View>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}

function AdvocateBankUpdateScreen() {
  const insets = useSafeAreaInsets();
  const d = AS_BANK_UPDATE;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/advocate/settings/bank' as Href))}
        >
          <ArrowLeft size={t.backIcon} color="#1B1C1C" strokeWidth={2.2} />
        </Pressable>
        <Text style={styles.plainTitle} {...shrinkToFit(0.8)}>
          {d.title}
        </Text>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} strokeWidth={1.8} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowTile}>
            <Banknote size={16} color="#8C6B3F" strokeWidth={1.8} />
          </View>
          <Text style={styles.eyebrow}>{d.eyebrow}</Text>
        </View>
        <Text style={styles.h1} {...shrinkToFit(0.8)}>
          {d.h1}
        </Text>
        <Text style={styles.sub}>{d.sub}</Text>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.cardTile}>
              <Landmark size={22} color="#4D463D" strokeWidth={1.8} />
            </View>
            <View style={styles.cardCol}>
              <Text style={styles.cardTitle} {...shrinkToFit(0.8)}>
                {d.cardTitle}
              </Text>
              <Text style={styles.cardSub} {...shrinkToFit(0.8)}>
                {d.cardSub}
              </Text>
            </View>
            <View style={styles.linkPill}>
              <View style={styles.linkDot} />
              <Text style={styles.linkPillText} {...shrinkToFit(0.8)}>
                {d.cardPill}
              </Text>
            </View>
          </View>

          <View style={styles.fields}>
            <Field
              label={d.holder.label}
              hint={d.holder.hint}
              value={d.holder.value}
              icon={<IdCard size={20} color="#0F7A4F" strokeWidth={1.8} />}
            />
            <Field
              gap
              label={d.account.label}
              value={d.account.value}
              icon={<EyeOff size={20} color="#4D463D" strokeWidth={1.8} />}
            />
            <Field
              gap
              label={d.confirm.label}
              pill={d.confirm.pill}
              value={d.confirm.value}
              helper={d.confirm.helper}
            />
            <Field
              gap
              label={d.ifsc.label}
              pill={d.ifsc.pill}
              value={d.ifsc.value}
              icon={<CircleCheck size={20} color={status.active} strokeWidth={2} />}
            />
            <Field
              gap
              label={d.bankName.label}
              value={d.bankName.value}
              icon={<Building2 size={20} color="#4D463D" strokeWidth={1.8} />}
            />
            <Field
              gap
              label={d.branch.label}
              value={d.branch.value}
              icon={<MapPin size={20} color="#4D463D" strokeWidth={1.8} />}
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Text style={styles.typeTitle}>{d.typeTitle}</Text>
            <Text style={styles.hint}>{d.typeHint}</Text>
          </View>
          <View style={styles.types}>
            {d.types.map((ty, i) => (
              <View
                key={ty.title}
                style={[styles.type, ty.on && styles.typeOn, i > 0 && { marginLeft: t.typeGap }]}
              >
                <View style={styles.cardCol}>
                  <Text style={styles.typeName} {...shrinkToFit(0.8)}>
                    {ty.title}
                  </Text>
                  <Text style={styles.typeSub} {...shrinkToFit(0.8)}>
                    {ty.sub}
                  </Text>
                </View>
                <View style={[styles.typeDot, ty.on && styles.typeDotOn]}>
                  {ty.on ? <Check size={15} color="#FFFFFF" strokeWidth={3} /> : null}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.warn}>
          <View style={styles.warnTile}>
            <Info size={20} color="#8C6B3F" strokeWidth={1.8} />
          </View>
          <View style={styles.cardCol}>
            <Text style={styles.warnTitle}>{d.warn.title}</Text>
            <Text style={styles.warnBody}>{d.warn.body}</Text>
          </View>
        </View>

        <View style={styles.check}>
          <View style={styles.checkHead}>
            <View style={styles.checkTile}>
              <ShieldCheck size={22} color="#0F7A4F" strokeWidth={2} />
            </View>
            <View style={styles.cardCol}>
              <Text style={styles.checkTitle} {...shrinkToFit(0.8)}>
                {d.check.title}
              </Text>
              <Text style={styles.checkLead} {...shrinkToFit(0.8)}>
                {d.check.lead}
              </Text>
            </View>
          </View>
          <Text style={styles.checkBody}>{d.check.body}</Text>
          <View style={styles.neverRow}>
            <Lock size={18} color="#0F7A4F" strokeWidth={1.8} />
            <Text style={styles.neverText}>{d.check.never}</Text>
          </View>
        </View>

        <View style={styles.vaultRow}>
          <ShieldCheck size={17} color="#4D463D" strokeWidth={1.8} />
          <Text style={styles.vaultText} {...shrinkToFit(0.8)}>
            {d.vault}
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
          onPress={() => router.push('/advocate/settings/bank/verify' as Href)}
        >
          <View style={styles.cardCol}>
            <Text style={styles.ctaTitle} {...shrinkToFit(0.8)}>
              {d.ctaTitle}
            </Text>
            <Text style={styles.ctaSub} {...shrinkToFit(0.8)}>
              {d.ctaSub}
            </Text>
          </View>
          <Text style={styles.ctaAction} {...shrinkToFit(0.8)}>
            {d.ctaAction}
          </Text>
          <ArrowRight size={t.ctaGlyph} color={ink.onBrand} strokeWidth={2.2} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: t.padX,
    paddingBottom: t.headerPadBottom,
    borderBottomWidth: 2,
    borderBottomColor: '#E5DACA',
  },
  plainTitle: {
    flex: 1,
    marginLeft: 16,
    fontFamily: font.appHeading,
    fontSize: t.plainTitleSize,
    color: '#1B1C1C',
  },
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: '#6C5C45',
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingBottom: 26 },

  eyebrowRow: {
    marginTop: 14,
    marginHorizontal: t.padX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyebrowTile: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F6E8D6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  eyebrow: {
    fontFamily: font.appSemi,
    fontSize: 13,
    letterSpacing: 1,
    color: '#8C6B3F',
  },
  h1: {
    marginTop: 10,
    marginHorizontal: t.padX,
    fontFamily: font.appHeading,
    fontSize: 25,
    color: '#1B1C1C',
  },
  sub: {
    marginTop: 8,
    marginHorizontal: t.padX,
    fontFamily: font.appBody,
    fontSize: 15,
    lineHeight: 22,
    color: '#4D463D',
  },

  card: {
    marginTop: t.cardTop,
    marginHorizontal: t.padX,
    backgroundColor: colors.card,
    borderRadius: t.cardRadius,
    paddingHorizontal: t.cardPadX,
    paddingVertical: t.cardPadY,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center' },
  cardTile: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#F2EFEC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  cardCol: { flex: 1 },
  cardTitle: { fontFamily: font.appHeading, fontSize: 18, color: '#1B1C1C' },
  cardSub: { marginTop: 2, fontFamily: font.appBody, fontSize: 14.5, color: '#4D463D' },
  linkPill: {
    marginLeft: 8,
    height: 30,
    borderRadius: 15,
    paddingHorizontal: 12,
    backgroundColor: '#EFECEA',
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: status.active,
    marginRight: 7,
  },
  linkPillText: { fontFamily: font.appSemi, fontSize: 14, color: '#4D463D' },

  fields: { marginTop: 18 },
  labelRow: { flexDirection: 'row', alignItems: 'center' },
  label: { fontFamily: font.appHeading, fontSize: t.fieldLabelSize, color: '#1B1C1C' },
  hint: {
    flex: 1,
    textAlign: 'right',
    fontFamily: font.appBody,
    fontSize: 14.5,
    color: '#4D463D',
  },
  matchRow: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  matchText: { marginLeft: 5, fontFamily: font.appSemi, fontSize: 14.5, color: '#0F7A4F' },
  input: {
    marginTop: t.fieldLabelGap,
    minHeight: t.inputH,
    borderRadius: t.inputRadius,
    backgroundColor: t.inputBg,
    paddingHorizontal: t.inputPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: { flex: 1, fontFamily: font.appBody, fontSize: t.inputSize, color: '#1B1C1C' },
  helper: {
    marginTop: t.helperTop,
    fontFamily: font.appBody,
    fontSize: t.helperSize,
    lineHeight: 20,
    color: '#4D463D',
  },

  typeTitle: { fontFamily: font.appHeading, fontSize: 19, color: '#1B1C1C' },
  types: { marginTop: 14, flexDirection: 'row' },
  type: {
    flex: 1,
    height: t.typeCardH,
    borderRadius: t.typeRadius,
    backgroundColor: '#FBF9F8',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeOn: { backgroundColor: '#F6F2F1' },
  typeName: { fontFamily: font.appHeading, fontSize: 17, color: '#1B1C1C' },
  typeSub: { marginTop: 2, fontFamily: font.appBody, fontSize: 14, color: '#4D463D' },
  typeDot: {
    marginLeft: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2DEDB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeDotOn: { backgroundColor: '#4D3B22' },

  warn: {
    marginTop: t.cardTop,
    marginHorizontal: t.padX,
    flexDirection: 'row',
    backgroundColor: '#F9EBD9',
    borderRadius: t.cardRadius,
    padding: t.cardPadX,
  },
  warnTile: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3DEC0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  warnTitle: { fontFamily: font.appHeading, fontSize: 17, lineHeight: 23, color: '#1B1C1C' },
  warnBody: { marginTop: 3, fontFamily: font.appBody, fontSize: 15, color: '#4D463D' },

  check: {
    marginTop: t.cardTop,
    marginHorizontal: t.padX,
    backgroundColor: '#F2EFED',
    borderRadius: t.cardRadius,
    padding: t.cardPadX,
  },
  checkHead: { flexDirection: 'row', alignItems: 'center' },
  checkTile: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#B7EBD1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  checkTitle: { fontFamily: font.appHeading, fontSize: 17, color: '#1B1C1C' },
  checkLead: { marginTop: 2, fontFamily: font.appSemi, fontSize: 15, color: '#0F7A4F' },
  checkBody: {
    marginTop: 12,
    fontFamily: font.appBody,
    fontSize: 15,
    lineHeight: 23,
    color: '#1B1C1C',
  },
  neverRow: { marginTop: 14, flexDirection: 'row' },
  neverText: {
    flex: 1,
    marginLeft: 10,
    fontFamily: font.appSemi,
    fontSize: 14.5,
    lineHeight: 20,
    color: '#4D463D',
  },

  vaultRow: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vaultText: { marginLeft: 9, fontFamily: font.appBody, fontSize: 15, color: '#4D463D' },

  footer: {
    paddingTop: 14,
    paddingHorizontal: t.padX,
    backgroundColor: colors.card,
  },
  cta: {
    height: 74,
    borderRadius: t.ctaRadius,
    backgroundColor: t.ctaBg,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressed: { opacity: 0.85 },
  ctaTitle: { fontFamily: font.appHeading, fontSize: 18, color: ink.onBrand },
  ctaSub: { marginTop: 2, fontFamily: font.appBody, fontSize: 14.5, color: '#D8CDBD' },
  ctaAction: {
    marginRight: 10,
    fontFamily: font.appHeading,
    fontSize: 18,
    color: ink.onBrand,
  },
});

import {BankAccountScreen as LiveWalletScreen} from '../../../../features/wallet/Wallet';
import {DATA_SOURCE as WALLET_DATA_SOURCE} from '../../../../lib/data-source';
// D-36: API mode renders the real wallet; fixture mode keeps the design preview.
export default function WalletRoute() { return WALLET_DATA_SOURCE === 'api' ? <LiveWalletScreen/> : <AdvocateBankUpdateScreen/>; }
