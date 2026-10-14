import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Check,
  CircleCheck,
  CircleQuestionMark,
  Copy,
  FolderOpen,
  Gavel,
  IdCard,
  LockKeyhole,
  MapPin,
  MessageSquareText,
  Phone,
  Shield,
  Speech,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../components/CourierHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { dcAssigned as t, font, hcPalette as c, ink, shadow, status } from '../../../constants/theme';
import { DC_ASSIGNED } from '../../../data/districtCourt';

// District Court — advocate assigned (design/300). Measured at 2.000 px/pt.
//
// ⚠ CROSS-SERVICE — the next two screens the batch draws are HIGH COURT ones:
// Chat with Advocate opens design/301 (/services/high-court/chat, "High Court
// Representation · HCR-2026-1048"). Wired by design number; flagged, not
// resolved. Review Advocate opened the High Court confirm screen (302) until
// the District Court decide screen (design/345) was drawn; it now opens 345.
//
// The photo is drawn as a portrait; this app uses initials avatars wherever a
// person's photo appears, so it is one here. The header avatar is drawn as a
// tiny screenshot thumbnail, not a person — rendered as the standard avatar.
//
// STATIC, NOT WIRED: Call Advocate dials nothing; Copy copies nothing; the
// timeline is a drawing. View Advocate Profile is inert — no profile is drawn
// for Adv Abhishek Verma and the /advocates/[id] records do not include him.

const CHIP_ICON = { award: Award, pin: MapPin, gavel: Gavel } as const;

export default function DistrictCourtAdvocateAssignedScreen() {
  const insets = useSafeAreaInsets();
  const d = DC_ASSIGNED;
  const toReview = () => router.push('/services/district-court/advocate/decide' as Href);

  return (
    <View style={styles.screen}>
      <CourierHeader
        title={d.title}
        sub={d.sub}
        avatar
        padTop={t.hdrPadTop}
        subStyle={styles.hdrSub}
        backHref={'/services/district-court/request-submitted' as Href}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <View style={styles.bannerDisc}>
            <Check size={t.bannerGlyph} color={ink.onBrand} strokeWidth={3} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.bannerTitle}>{d.bannerTitle}</Text>
            <Text style={styles.bannerBody}>{d.bannerBody}</Text>
            <Text style={styles.bannerNote}>{d.bannerNote}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.adv]}>
          <View style={styles.advTop}>
            <View>
              <View style={styles.photo}>
                <Text style={styles.photoText}>{d.initials}</Text>
              </View>
              <View style={styles.photoBadge}>
                <BadgeCheck size={t.photoBadgeGlyph} color={ink.onBrand} strokeWidth={2.4} />
              </View>
            </View>
            <View style={[styles.flex, styles.advCol]}>
              <View style={styles.verified}>
                <CircleCheck size={t.verifiedIcon} color={c.card} fill={c.greenInk} strokeWidth={2.4} />
                <Text style={styles.verifiedText} {...shrinkToFit(0.8)}>
                  {d.verified}
                </Text>
              </View>
              <Text style={styles.name} {...shrinkToFit(0.75)}>
                {d.name}
              </Text>
              <Text style={styles.practice}>{d.practice}</Text>
            </View>
          </View>

          <View style={styles.chips}>
            {d.chips.map((ch) => {
              const Icon = CHIP_ICON[ch.icon];
              return (
                <View key={ch.label} style={styles.chip}>
                  <Icon size={t.chipIcon} color={c.ink} strokeWidth={1.9} />
                  <Text style={styles.chipText} {...shrinkToFit(0.8)}>
                    {ch.label}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.desc}>
            <Text style={styles.descText}>{d.bio}</Text>
          </View>

          {/* Inert — no profile is drawn for this advocate. */}
          <View style={styles.profile}>
            <Text style={styles.profileText} {...shrinkToFit(0.8)}>
              {d.profile}
            </Text>
            <ArrowRight size={t.btnIcon} color={c.ink} strokeWidth={2.2} />
          </View>
        </View>

        <View style={[styles.card, styles.caseCard]}>
          <View style={styles.between}>
            <View style={styles.head}>
              <FolderOpen size={t.headIcon} color={c.ink} strokeWidth={1.9} />
              <Text style={styles.headText}>{d.caseTitle}</Text>
            </View>
            <View style={styles.tier}>
              <Text style={styles.tierText} {...shrinkToFit(0.8)}>
                {d.tier}
              </Text>
            </View>
          </View>
          <View style={styles.rows}>
            {d.rows.map(([l, v]) => (
              <View key={l} style={styles.kv}>
                <Text style={styles.kvLabel}>{l}</Text>
                <Text style={styles.kvValue}>{v}</Text>
              </View>
            ))}
          </View>
          <View style={styles.idBox}>
            <Text style={styles.idLabel}>{d.idLabel}</Text>
            <View style={styles.idRight}>
              <Text style={styles.idValue} {...shrinkToFit(0.8)}>
                {d.id}
              </Text>
              {/* Inert — nothing is copied. */}
              <Copy size={t.idCopy} color={c.brownInk} strokeWidth={2} />
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.talk]}>
          <View style={styles.head}>
            <IdCard size={t.talkIcon} color={c.ink} strokeWidth={1.7} />
            <Text style={styles.headText} {...shrinkToFit(0.8)}>
              {d.talkTitle}
            </Text>
          </View>
          <Text style={styles.body}>{d.talkBody}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/services/high-court/chat' as Href)}
            style={styles.chat}
          >
            <MessageSquareText size={t.chatIcon} color={ink.onBrand} strokeWidth={1.9} />
            <Text style={styles.chatText}>{d.chat}</Text>
          </Pressable>
          {/* Static — no call is placed. */}
          <View style={styles.call}>
            <Phone size={t.callIcon} color={c.brownInk} strokeWidth={2} />
            <Text style={styles.callText}>{d.call}</Text>
          </View>
          <View style={styles.note}>
            <LockKeyhole size={t.noteIcon} color={c.greenInk} strokeWidth={2.4} />
            <Text style={styles.noteText}>{d.talkNote}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.decide]}>
          <View style={styles.head}>
            <View style={styles.decideDisc}>
              <Shield size={t.decideGlyph} color={c.brownInk} strokeWidth={2} />
            </View>
            <Text style={[styles.headText, styles.decideTitle]}>{d.decideTitle}</Text>
          </View>
          <Text style={[styles.body, styles.decideBody]}>{d.decideBody}</Text>
          <Pressable accessibilityRole="button" onPress={toReview} style={styles.decideBtn}>
            <Text style={styles.decideBtnText}>{d.review}</Text>
            <ArrowRight size={t.btnIcon} color={c.ink} strokeWidth={2.2} />
          </Pressable>
        </View>

        <View style={[styles.card, styles.statusCard]}>
          <View style={styles.between}>
            <Text style={styles.headText}>{d.statusTitle}</Text>
            <View style={styles.step}>
              <Text style={styles.stepText}>{d.step}</Text>
            </View>
          </View>
          <View style={styles.tl}>
            {d.timeline.map((s, i) => {
              const last = i === d.timeline.length - 1;
              const active = s.state === 'active';
              return (
                <View key={s.title} style={[styles.tlRow, active && styles.tlRowActive]}>
                  <View style={styles.tlRailCol}>
                    {active ? (
                      <View style={styles.tlRing}>
                        <View style={[styles.tlDisc, styles.tlDiscActive]}>
                          <Speech size={t.tlGlyph} color={ink.onBrand} strokeWidth={2} />
                        </View>
                      </View>
                    ) : (
                      <View style={[styles.tlDisc, s.state === 'done' ? styles.tlDiscDone : styles.tlDiscWait]}>
                        {s.state === 'done' ? (
                          <Check size={t.tlGlyph} color={ink.onBrand} strokeWidth={3} />
                        ) : (
                          <Text style={styles.tlNum}>{i + 1}</Text>
                        )}
                      </View>
                    )}
                    {!last && <View style={styles.tlRail} />}
                  </View>
                  <View style={[styles.flex, styles.tlBody, active && styles.tlBodyActive]}>
                    <View style={styles.tlTitleRow}>
                      <Text
                        style={[
                          styles.tlTitle,
                          active && styles.tlTitleActive,
                          s.state === 'waiting' && styles.tlWait,
                        ]}
                        {...shrinkToFit(0.8)}
                      >
                        {s.title}
                      </Text>
                      {'chip' in s && (
                        <View style={styles.tlChip}>
                          <Text style={styles.tlChipText}>{s.chip}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.tlDesc, active && styles.tlDescActive]}>{s.desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={[styles.card, styles.next]}>
          <View style={styles.head}>
            <CircleQuestionMark size={t.nextIcon} color={c.ink} strokeWidth={2} />
            <Text style={[styles.headText, styles.nextTitle]}>{d.nextTitle}</Text>
          </View>
          <View style={styles.nextItems}>
            {d.next.map((n, i) => (
              <View key={n} style={styles.nextItem}>
                <View style={styles.nextNum}>
                  <Text style={styles.nextNumText}>{i + 1}</Text>
                </View>
                <Text style={styles.nextText}>{n}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable accessibilityRole="button" onPress={toReview} style={styles.barBtn}>
          <Text style={styles.barBtnText}>{d.cta}</Text>
          <ArrowRight size={t.barBtnIcon} color={ink.onBrand} strokeWidth={2.2} />
        </Pressable>
        <Text style={styles.caption}>{d.caption}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX, paddingBottom: t.bottomPad },
  flex: { flex: 1, minWidth: 0 },
  hdrSub: { fontFamily: font.appSemi, fontSize: t.hdrSubSize },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.headGap },

  banner: {
    marginTop: t.bannerTop,
    borderRadius: t.bannerRadius,
    backgroundColor: c.greenBanner,
    paddingHorizontal: t.bannerPadX,
    paddingTop: t.bannerPadTop,
    paddingBottom: t.bannerPadBottom,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.bannerGap,
  },
  bannerDisc: {
    width: t.bannerDisc,
    height: t.bannerDisc,
    borderRadius: t.bannerDisc / 2,
    backgroundColor: status.active,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontFamily: font.appSemi,
    fontSize: t.bannerTitleSize,
    lineHeight: t.bannerTitleLineHeight,
    color: c.ink,
  },
  bannerBody: {
    marginTop: t.bannerBodyTop,
    fontFamily: font.appBody,
    fontSize: t.bannerBodySize,
    lineHeight: t.bannerBodyLineHeight,
    color: c.ink,
  },
  bannerNote: {
    marginTop: t.bannerNoteTop,
    fontFamily: font.appBody,
    fontSize: t.bannerNoteSize,
    lineHeight: t.bannerNoteLineHeight,
    color: c.inkWarm,
  },

  card: { marginTop: t.cardGap, borderRadius: t.cardRadius, backgroundColor: c.card },
  adv: { padding: t.advPad, paddingBottom: t.advPadBottom },
  advTop: { flexDirection: 'row', alignItems: 'flex-start' },
  photo: {
    width: t.photo,
    height: t.photo,
    borderRadius: t.photo / 2,
    backgroundColor: c.brown,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: { fontFamily: font.appSemi, fontSize: t.photoText, color: ink.onBrand },
  photoBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: t.photoBadge,
    height: t.photoBadge,
    borderRadius: t.photoBadge / 2,
    borderWidth: t.photoBadgeBorder,
    borderColor: c.card,
    backgroundColor: status.active,
    alignItems: 'center',
    justifyContent: 'center',
  },
  advCol: { marginLeft: t.advColGap, marginTop: t.advColTop },
  verified: {
    alignSelf: 'flex-start',
    height: t.verifiedH,
    borderRadius: t.verifiedH / 2,
    paddingHorizontal: t.verifiedPadX,
    backgroundColor: c.greenSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.verifiedGap,
  },
  verifiedText: { fontFamily: font.appSemi, fontSize: t.verifiedSize, color: c.greenInk },
  name: {
    marginTop: t.nameTop,
    fontFamily: font.appSemi,
    fontSize: t.nameSize,
    lineHeight: t.nameLineHeight,
    color: c.ink,
  },
  practice: { fontFamily: font.appBody, fontSize: t.subSize, lineHeight: t.subLineHeight, color: c.inkWarm },
  chips: { marginTop: t.chipsTop, flexDirection: 'row', flexWrap: 'wrap', rowGap: t.chipRowGap, columnGap: t.chipColGap },
  chip: {
    height: t.chipH,
    borderRadius: t.chipH / 2,
    paddingHorizontal: t.chipPadX,
    backgroundColor: c.tileGrey,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.chipIconGap,
    flexShrink: 1,
  },
  chipText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.chipSize, color: c.ink },
  desc: {
    marginTop: t.descTop,
    borderRadius: t.descRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.descPadX,
    paddingVertical: t.descPadY,
  },
  descText: { fontFamily: font.appBody, fontSize: t.descSize, lineHeight: t.descLineHeight, color: c.inkWarm },
  profile: {
    marginTop: t.profileTop,
    height: t.profileH,
    borderRadius: t.btnRadius,
    backgroundColor: c.tileGrey,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.btnIconGap,
  },
  profileText: { fontFamily: font.appSemi, fontSize: t.profileSize, color: c.ink },

  caseCard: { paddingHorizontal: t.casePadX, paddingTop: t.casePadTop, paddingBottom: t.casePadBottom },
  head: { flexDirection: 'row', alignItems: 'center', gap: t.headGap, flexShrink: 1 },
  headText: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.headSize,
    lineHeight: t.headLineHeight,
    color: c.ink,
  },
  tier: { height: t.tierH, borderRadius: t.tierRadius, paddingHorizontal: t.tierPadX, backgroundColor: c.tileGrey, justifyContent: 'center', flexShrink: 1 },
  tierText: { fontFamily: font.appSemi, fontSize: t.tierSize, color: c.inkWarm },
  rows: { marginTop: t.rowsTop, gap: t.rowGap },
  kv: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: t.headGap },
  kvLabel: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.rowLabelSize, lineHeight: t.rowLineHeight, color: c.inkWarm },
  kvValue: {
    flexShrink: 1,
    textAlign: 'right',
    fontFamily: font.appSemi,
    fontSize: t.rowValueSize,
    lineHeight: t.rowLineHeight,
    color: c.ink,
  },
  idBox: {
    marginTop: t.idTop,
    minHeight: t.idH,
    borderRadius: t.idRadius,
    backgroundColor: c.panel,
    paddingLeft: t.idPadL,
    paddingRight: t.idPadR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  idLabel: { fontFamily: font.appBody, fontSize: t.idLabelSize, color: c.inkWarm },
  idRight: { flexDirection: 'row', alignItems: 'center', gap: t.idCopyGap, flexShrink: 1, marginLeft: t.headGap },
  idValue: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.idValueSize, color: c.brownInk },

  talk: { paddingHorizontal: t.talkPadX, paddingTop: t.talkPadTop, paddingBottom: t.talkPadBottom },
  body: {
    marginTop: t.bodyTop,
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: c.inkWarm,
  },
  chat: {
    marginTop: t.chatTop,
    height: t.chatH,
    borderRadius: t.btnRadius,
    backgroundColor: c.brown,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.chatIconGap,
  },
  chatText: { fontFamily: font.appSemi, fontSize: t.chatSize, color: ink.onBrand },
  call: {
    ...shadow,
    marginTop: t.callTop,
    height: t.callH,
    borderRadius: t.btnRadius,
    backgroundColor: c.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.chatIconGap,
  },
  callText: { fontFamily: font.appSemi, fontSize: t.chatSize, color: c.brownInk },
  note: { marginTop: t.noteTop, flexDirection: 'row', alignItems: 'center', gap: t.noteGap },
  noteText: {
    flex: 1,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLineHeight,
    color: c.inkWarm,
  },

  decide: {
    backgroundColor: c.peachDecide,
    paddingHorizontal: t.decidePadX,
    paddingTop: t.decidePadTop,
    paddingBottom: t.decidePadBottom,
  },
  decideDisc: {
    width: t.decideDisc,
    height: t.decideDisc,
    borderRadius: t.decideDisc / 2,
    backgroundColor: c.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decideTitle: { fontSize: t.decideTitleSize, color: c.brownInk },
  decideBody: { marginTop: t.decideBodyTop, color: c.brownInk },
  decideBtn: {
    marginTop: t.decideBtnTop,
    height: t.decideBtnH,
    borderRadius: t.btnRadius,
    backgroundColor: c.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.btnIconGap,
  },
  decideBtnText: { fontFamily: font.appSemi, fontSize: t.decideBtnSize, color: c.ink },

  statusCard: { paddingHorizontal: t.statusPadX, paddingTop: t.statusPadTop, paddingBottom: t.statusPadBottom },
  step: { height: t.stepH, borderRadius: t.stepRadius, paddingHorizontal: t.stepPadX, backgroundColor: c.peachSoft, justifyContent: 'center' },
  stepText: { fontFamily: font.appSemi, fontSize: t.stepSize, color: c.brownInk },
  tl: { marginTop: t.tlTop },
  tlRow: { flexDirection: 'row', minHeight: t.tlRowH },
  tlRowActive: { minHeight: t.tlActiveRowH, marginTop: t.tlActiveLift },
  tlRailCol: { width: t.tlRing, alignItems: 'center', marginLeft: (t.tlDisc - t.tlRing) / 2 },
  tlDisc: { width: t.tlDisc, height: t.tlDisc, borderRadius: t.tlDisc / 2, alignItems: 'center', justifyContent: 'center' },
  tlDiscDone: { backgroundColor: status.active },
  tlDiscWait: { backgroundColor: c.panel },
  tlDiscActive: { backgroundColor: c.brown },
  tlRing: {
    width: t.tlRing,
    height: t.tlRing,
    borderRadius: t.tlRing / 2,
    backgroundColor: c.radioGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tlNum: { fontFamily: font.appSemi, fontSize: t.tlNumSize, color: c.inkMuted },
  tlRail: { flex: 1, width: t.tlRail, backgroundColor: c.rail },
  tlBody: { marginLeft: t.tlGap + (t.tlDisc - t.tlRing) / 2, paddingTop: t.tlTextTop },
  tlBodyActive: { paddingTop: (t.tlRing - t.tlActiveTitleLineHeight) / 2 },
  tlTitleRow: { flexDirection: 'row', alignItems: 'center', gap: t.headGap },
  tlTitle: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.tlTitleSize,
    lineHeight: t.tlTitleLineHeight,
    color: c.ink,
  },
  tlTitleActive: { fontSize: t.tlActiveTitleSize, lineHeight: t.tlActiveTitleLineHeight, color: c.brownInk },
  tlWait: { color: c.inkMuted },
  tlChip: { height: t.tlChipH, borderRadius: t.tlChipRadius, paddingHorizontal: t.tlChipPadX, backgroundColor: c.peach, justifyContent: 'center' },
  tlChipText: { fontFamily: font.appSemi, fontSize: t.tlChipSize, color: c.brownInk },
  tlDesc: { fontFamily: font.appBody, fontSize: t.tlDescSize, lineHeight: t.tlDescLineHeight, color: c.inkMuted },
  tlDescActive: { color: c.ink },

  next: { backgroundColor: c.panel, paddingHorizontal: t.nextPadX, paddingTop: t.nextPadTop, paddingBottom: t.nextPadBottom },
  nextTitle: { marginLeft: t.nextIconGap - t.headGap },
  nextItems: { marginTop: t.nextItemsTop, gap: t.nextItemGap },
  nextItem: { flexDirection: 'row', alignItems: 'flex-start', gap: t.nextNumGap },
  nextNum: {
    marginTop: (t.nextLineHeight - t.nextNum) / 2,
    width: t.nextNum,
    height: t.nextNum,
    borderRadius: t.nextNum / 2,
    backgroundColor: c.helpGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextNumText: { fontFamily: font.appSemi, fontSize: t.nextNumSize, color: c.ink },
  nextText: { flex: 1, fontFamily: font.appBody, fontSize: t.nextSize, lineHeight: t.nextLineHeight, color: c.ink },

  bar: {
    backgroundColor: c.card,
    borderTopWidth: 1,
    borderTopColor: c.panel,
    paddingHorizontal: t.barPadX,
    paddingTop: t.barPadTop,
  },
  barBtn: {
    height: t.barBtnH,
    borderRadius: t.btnRadius,
    backgroundColor: c.brown,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.barBtnGap,
  },
  barBtnText: { fontFamily: font.appSemi, fontSize: t.barBtnSize, color: ink.onBrand },
  caption: {
    marginTop: t.captionTop,
    textAlign: 'center',
    fontFamily: font.appSemi,
    fontSize: t.captionSize,
    lineHeight: t.captionLineHeight,
    color: c.inkWarm,
  },
});
