import NoticeScreenFeedback from '../../components/NoticeScreenFeedback';
import type { NoticeIntakeModel } from "../../features/legal-notice/screen-model";
import { useIntakeModel } from "../../features/legal-notice/useIntakeModel";
import { router } from 'expo-router';
import {useState} from 'react';
import { ArrowRight, Check, ChevronRight, Clock, FileSearch, Lock, MapPin, MessageCircle, MessageSquare, PhoneCall, ShieldCheck, Zap, type LucideIcon } from 'lucide-react-native';
import { Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ServiceHeader from '../../components/ServiceHeader';
import { colors, font, ink, lnDetail as d } from '../../constants/theme';
import { useLegalNotice } from '../../context/legalNotice';
import { shrinkToFit, shrinkToOneLine } from '../../constants/textFit';
import { rupees, SERVICE_TIERS, tierFor } from '../../data/legalNotice';

const BULLETS = [
  'Acts as evidence in court',
  'Clearly states your demand',
  'Opens an opportunity to resolve the dispute',
  'May help avoid unnecessary litigation',
];

const REASONS: { icon: LucideIcon; title: string; caption: string; tint: string }[] = [
  { icon: FileSearch, title: 'Preview', caption: 'Before You Send', tint: '#F6E9DC' },
  { icon: MapPin, title: 'Track Postal', caption: 'Acknowledgment', tint: '#F7DFDF' },
  { icon: MessageCircle, title: 'Upload the reply', caption: 'you receive', tint: '#E1F0E4' },
];

// Legal Notice detail / pricing (design/22). Prices come from data/legalNotice.ts so
// they match the payment screen's Service Fee.
export function LegalNoticeDetailScreenView({ model }: { model: NoticeIntakeModel }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  // The tier cards are half the screen, so the speed line runs out of room before
  // anything else does. Scale it down only where it would otherwise wrap.
  const speedSize = d.speedSize * (width < d.speedCompactBelow ? d.speedCompactScale : 1);
  const { form, update } = model;
  const tierId = form.tier;
  const tier = model.tiers.find(t => t.id === tierId)!;
  const [method,setMethod]=useState<'quick'|'assistance'>('quick');

  return (
    <View style={styles.screen}>
      <ServiceHeader share={false} title="Legal Notice Detail" onBack={model.back} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + d.cardGap }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, styles.hero]}>
          <View style={styles.heroText}>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText}>FORMAL LEGAL ACTION</Text>
            </View>
            <Text style={styles.heroTitle}>Send a Legal Notice</Text>
            <Text style={styles.heroSub}>Legally drafted. Professionally reviewed. Hassle-free.</Text>
          </View>
          <Image source={require('../../assets/notice-hero.png')} accessibilityLabel="Legal notice document and paper plane" resizeMode="contain" style={styles.heroArt} />
        </View>

        <View style={styles.card}>
          <View style={styles.titleRow}>
            <ShieldCheck size={d.titleIcon} color={colors.textPrimary} />
            <Text style={styles.cardTitle}>Why send a Legal Notice?</Text>
          </View>
          <Text style={styles.lead}>Before you go to court, make your position clear.</Text>
          <Text style={styles.para}>
            A legal notice formally communicates your grievance, your demand, and gives the other party an opportunity
            to respond.
          </Text>
          <View style={styles.bullets}>
            {BULLETS.map((b) => (
              <View key={b} style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{b}</Text>
              </View>
            ))}
          </View>
          <Text accessibilityRole="link" onPress={()=>model.navigate('/legal-notice/detail')} style={styles.link}>Is a legal notice always required?</Text>
          <View style={styles.linkRow}>
            <Text accessibilityRole="link" onPress={()=>model.navigate('/legal-notice/detail')} style={styles.link}>What should it contain?</Text>
            <View style={styles.spacer} />
            <Text accessibilityRole="link" onPress={() => model.navigate("/legal-notice/detail")} style={styles.learn}>Learn more</Text>
            <ChevronRight size={d.linkSize} color={colors.textBody} />
          </View>
        </View>

        <View style={styles.trust}>
          <ShieldCheck size={d.trustIcon} color={ink.accent} />
          <Text style={styles.trustText}>Drafted &amp; reviewed by advocates on Legalitt</Text>
          <View style={styles.spacer} />
        </View>

        <Text style={styles.section}>Why choose Legalitt?</Text>
        <View style={styles.reasons}>
          {REASONS.map((r) => {
            const Icon = r.icon;
            return (
              <View key={r.title} style={styles.reason}>
                <View style={[styles.reasonIcon, { backgroundColor: r.tint }]}>
                  <Icon size={d.chooseIconGlyph} color={colors.textPrimary} />
                </View>
                <Text style={styles.reasonTitle}>{r.title}</Text>
                <Text style={styles.reasonCaption}>{r.caption}</Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.section}>Choose how you’d like to proceed</Text>
        <Pressable accessibilityRole="radio" accessibilityState={{checked:method==='quick'}} onPress={()=>setMethod('quick')} style={[styles.card,{marginTop:16},method==='quick'&&{borderColor:colors.brand}]}>
          <View style={styles.optionTop}><Text style={styles.trustTag}>DO IT YOURSELF</Text><View style={[styles.optionRadio,method==='quick'&&styles.optionRadioSelected]}>{method==='quick'&&<View style={styles.optionRadioDot}/>}</View></View><Text style={styles.cardTitle}>Quick Submission</Text><Text style={styles.para}>Enter your details and submit your legal notice request.</Text><Text accessibilityRole="button" onPress={()=>{setMethod('quick');model.continue();}} style={styles.link}>Continue with Quick Submission →</Text>
        </Pressable>
        <Pressable accessibilityRole="radio" accessibilityState={{checked:method==='assistance'}} onPress={()=>setMethod('assistance')} style={[styles.card,{marginTop:16},method==='assistance'&&{borderColor:colors.brand}]}>
          <View style={styles.optionTop}><Text style={styles.trustTag}>GET EXPERT HELP</Text><View style={[styles.optionRadio,method==='assistance'&&styles.optionRadioSelected]}>{method==='assistance'&&<View style={styles.optionRadioDot}/>}</View></View><Text style={styles.cardTitle}>Assistance Service</Text><Text style={styles.para}>Get guidance from our team through the legal notice process.</Text><View style={styles.helpButtons}><Pressable accessibilityRole="button" style={styles.helpButton} onPress={()=>router.push('/support-chat?service=legal_notice')}><MessageSquare size={19} color="#806646"/><Text style={styles.helpText}>Request Chat</Text></Pressable><Pressable accessibilityRole="button" style={styles.helpButton} onPress={()=>router.push('/callback?service=legal_notice')}><PhoneCall size={19} color="#806646"/><Text style={styles.helpText}>Request Callback</Text></Pressable></View>
        </Pressable>
        <Text style={[styles.section, styles.pickSection]}>Choose Your Service</Text>
        {model.busy&&<Text style={styles.para}>Loading service prices…</Text>}
        {!model.busy&&model.tiers.every(t=>t.price===null)&&<Text style={styles.para}>Service prices are unavailable. Please retry before starting a request.</Text>}
        <Text style={styles.pickSub}>Select the priority that suits your requirement.</Text>
        <View style={styles.tiers}>
          {model.tiers.map((t) => {
            const selected = t.id === tierId;
            return (
              <Pressable
                key={t.id}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                onPress={() => update({ tier: t.id })}
                style={[styles.tier, selected && styles.tierSelected]}
              >
                <View style={styles.tierTop}>
                  <View style={styles.tierChip}>
                    <Text style={styles.tierChipText}>{t.label}</Text>
                  </View>
                  <View style={styles.spacer} />
                  <View style={[styles.radio, selected && styles.radioOn]}>
                    {selected && <Check size={11} color={ink.onBrand} strokeWidth={3} />}
                  </View>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>{t.price === null ? '' : rupees(t.price)}</Text>
                  <Clock size={d.speedIcon} color={colors.textBody} />
                  <Text style={[styles.speed, { fontSize: speedSize }]} {...shrinkToOneLine()}>
                    {t.speed}
                  </Text>
                </View>
                <View style={[styles.tierDivider, selected && styles.tierDividerSelected]} />
                <Text style={styles.tierNote}>
                  {t.note}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.summary}>
          <Zap size={d.summaryIcon} color={colors.textPrimary} fill={colors.textPrimary} />
          <Text style={styles.summaryText} numberOfLines={1} {...shrinkToFit()}>
            Selected: {tier.summary}
          </Text>
          <View style={styles.spacer} />
          <Text style={styles.summaryPrice}>{tier.price === null ? '' : rupees(tier.price)}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={model.busy||tier.price===null||method!=='quick'}
          onPress={() => model.continue()}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>Get Started</Text>
          <ArrowRight size={d.buttonIcon} color={ink.onBrand} />
        </Pressable>
        {method==='assistance'&&<Text style={styles.para}>Use Request Chat or Request Callback above, or select Quick Submission to continue yourself.</Text>}

        <View style={styles.footerRow}>
          <Lock size={d.footerIcon} color={colors.textBody} />
          <Text style={styles.footerText}>Visible only to you, your advocate and Legalitt’s team.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  content: {
    paddingHorizontal: d.padX,
    paddingTop: d.cardGap,
  },
  card: {
    borderRadius: d.cardRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: d.cardPad,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: d.heroPadY,
  },
  heroText: {
    flex: 1,
    minWidth: 0,
  },
  heroPill: {
    alignSelf: 'flex-start',
    height: d.heroPillHeight,
    borderRadius: 5,
    paddingHorizontal: d.heroPillPadX,
    backgroundColor: colors.brand,
    justifyContent: 'center',
  },
  heroPillText: {
    fontFamily: font.appSemi,
    fontSize: d.heroPillTextSize,
    letterSpacing: d.heroPillSpacing,
    color: ink.onBrand,
  },
  heroTitle: {
    marginTop: d.heroTitleGap,
    fontFamily: font.appHeading,
    fontSize: d.heroTitleSize,
    color: colors.textPrimary,
  },
  heroSub: {
    marginTop: d.heroSubGap,
    fontFamily: font.appBody,
    fontSize: d.heroSubSize,
    lineHeight: d.heroSubLineHeight,
    color: colors.textBody,
  },
  optionTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12},
  optionRadio:{width:22,height:22,borderRadius:11,backgroundColor:'#E5E3E0',alignItems:'center',justifyContent:'center'},
  optionRadioSelected:{backgroundColor:'#806E53'},optionRadioDot:{width:8,height:8,borderRadius:4,backgroundColor:'#fff'},
  helpButtons:{flexDirection:'row',gap:10,marginTop:18},helpButton:{flex:1,flexDirection:'row',gap:8,justifyContent:'center',alignItems:'center',paddingVertical:17,paddingHorizontal:10,borderWidth:1,borderColor:'#E5E0D9',borderRadius:12,backgroundColor:'#F3F1ED'},helpText:{fontFamily:font.appSemi,fontSize:14,color:'#806646',flexShrink:1,textAlign:'center'},
  heroArt: {
    // Placeholder for the document/paper-plane illustration, sized and positioned to
    // design/22's artwork box so the real asset drops in without a layout change.
    width: d.heroArtW,
    height: d.heroArtH,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginLeft: 8,
    marginRight: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: d.titleIconGap,
  },
  cardTitle: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appHeading,
    fontSize: d.titleSize,
    color: colors.textPrimary,
  },
  lead: {
    marginTop: d.leadGap,
    fontFamily: font.appBody,
    fontSize: d.leadSize,
    color: colors.textPrimary,
  },
  para: {
    marginTop: d.paraGap,
    fontFamily: font.appBody,
    fontSize: d.paraSize,
    lineHeight: d.paraLineHeight,
    color: colors.textPrimary,
  },
  bullets: {
    marginTop: d.bulletGap,
    gap: d.bulletRowGap,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulletDot: {
    width: d.bulletDot,
    height: d.bulletDot,
    borderRadius: d.bulletDot / 2,
    backgroundColor: colors.textPrimary,
    marginLeft: 8,
    marginRight: d.bulletDotGap,
  },
  bulletText: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: d.bulletSize,
    color: colors.textPrimary,
  },
  link: {
    marginTop: d.linkGap,
    fontFamily: font.appBody,
    fontSize: d.linkSize,
    color: ink.accent,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  learn: {
    marginTop: d.linkGap,
    fontFamily: font.appBody,
    fontSize: d.linkSize,
    color: colors.textBody,
  },
  spacer: {
    flex: 1,
  },
  trust: {
    marginTop: d.trustGap,
    height: d.trustHeight,
    borderRadius: 8,
    backgroundColor: d.trustBg,
    paddingHorizontal: d.trustPadX,
    flexDirection: 'row',
    alignItems: 'center',
    gap: d.trustIconGap,
  },
  trustText: {
    fontFamily: font.appBody,
    fontSize: d.trustSize,
    color: colors.textPrimary,
  },
  trustTag: {
    fontFamily: font.appSemi,
    fontSize: d.trustTagSize,
    letterSpacing: 0.5,
    color: ink.accent,
  },
  section: {
    marginTop: d.sectionGap,
    fontFamily: font.appHeading,
    fontSize: d.sectionSize,
    color: colors.textPrimary,
  },
  reasons: {
    marginTop: d.chooseGap,
    flexDirection: 'row',
    gap: d.chooseCardGap,
  },
  reason: {
    flex: 1,
    minWidth: 0,
    height: d.chooseCardHeight,
    borderRadius: d.chooseCardRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonIcon: {
    width: d.chooseIcon,
    height: d.chooseIcon,
    borderRadius: d.chooseIcon / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: d.chooseIconGap,
  },
  reasonTitle: {
    fontFamily: font.appHeading,
    fontSize: d.chooseTitleSize,
    color: colors.textPrimary,
  },
  reasonCaption: {
    marginTop: d.chooseCaptionGap,
    fontFamily: font.appBody,
    fontSize: d.chooseCaptionSize,
    color: colors.textBody,
  },
  pickSection: {
    marginTop: d.pickGap,
  },
  pickSub: {
    marginTop: d.pickSubGap,
    fontFamily: font.appBody,
    fontSize: d.pickSubSize,
    color: colors.textBody,
  },
  tiers: {
    marginTop: d.pickCardGap,
    flexDirection: 'row',
    gap: d.pickCardColGap,
  },
  tier: {
    flex: 1,
    minWidth: 0,
    height: d.pickCardHeight,
    borderRadius: d.pickCardRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: d.pickCardPad,
  },
  tierSelected: {
    backgroundColor: d.selectedBg,
    borderColor: colors.brand,
  },
  tierTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tierChip: {
    height: d.tierHeight,
    borderRadius: 4,
    paddingHorizontal: d.tierPadX,
    backgroundColor: d.tierBg,
    justifyContent: 'center',
  },
  tierChipText: {
    fontFamily: font.appSemi,
    fontSize: d.tierTextSize,
    letterSpacing: 0.4,
    color: colors.textBody,
  },
  radio: {
    width: d.radio,
    height: d.radio,
    borderRadius: d.radio / 2,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  priceRow: {
    marginTop: d.priceGap,
    flexDirection: 'row',
    alignItems: 'center',
    gap: d.speedIconGap,
  },
  price: {
    fontFamily: font.appHeading,
    fontSize: d.priceSize,
    color: colors.textPrimary,
    marginRight: 2,
  },
  speed: {
    flexShrink: 1,
    fontFamily: font.appBody,
    color: colors.textBody,
  },
  tierDivider: {
    marginTop: d.pickDividerGapAbove,
    height: d.pickDivider,
    backgroundColor: d.pickDividerIdle,
  },
  tierDividerSelected: {
    backgroundColor: d.pickDividerSelected,
  },
  tierNote: {
    marginTop: d.pickDividerGapBelow,
    fontFamily: font.appBody,
    fontSize: d.pickNoteSize,
    lineHeight: d.pickNoteLineHeight,
    color: colors.textBody,
  },
  summary: {
    marginTop: d.summaryGap,
    height: d.summaryHeight,
    borderRadius: d.summaryRadius,
    backgroundColor: d.summaryBg,
    paddingHorizontal: d.summaryPadX,
    flexDirection: 'row',
    alignItems: 'center',
    gap: d.summaryIconGap,
  },
  summaryText: {
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: d.summarySize,
    color: colors.textPrimary,
  },
  summaryPrice: {
    fontFamily: font.appHeading,
    fontSize: d.summaryPriceSize,
    color: colors.textPrimary,
  },
  button: {
    marginTop: d.buttonGap,
    height: d.buttonHeight,
    borderRadius: d.buttonRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: d.buttonIconGap,
  },
  pressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontFamily: font.appSemi,
    fontSize: d.buttonTextSize,
    color: ink.onBrand,
  },
  footerRow: {
    marginTop: d.footerGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: d.footerIconGap,
  },
  footerText: {
    fontFamily: font.appBody,
    fontSize: d.footerSize,
    color: colors.textBody,
  },
  footerNote: {
    marginTop: d.footerNoteGap,
    textAlign: 'center',
    fontFamily: font.appSemi,
    fontSize: d.footerNoteSize,
    lineHeight: d.footerNoteLineHeight,
    letterSpacing: d.footerNoteSpacing,
    color: d.noteText,
  },
});

// The deployed fixture path remains unchanged; API mode is explicit.
export default function LegalNoticeDetailScreen() {
  const { model } = useIntakeModel("detail");
  return <NoticeScreenFeedback error={model.error}><LegalNoticeDetailScreenView model={model} /></NoticeScreenFeedback>;
}
