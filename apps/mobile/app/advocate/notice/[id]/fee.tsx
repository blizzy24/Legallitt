import type {CaseClientFees} from '@legalitt/shared';
import {paiseText} from '../../../../features/legal-notice/quote-display';
import {instructedCopy} from '../../../../copy/instructed';
import NoticeScreenFeedback from '../../../../components/NoticeScreenFeedback';
import { useAdvocateNoticeModel } from "../../../../features/legal-notice/useAdvocateNoticeModel";
import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Info,
  Landmark,
  Receipt,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../../constants/textFit';
import { ADV_NOTICE, advNoticeFee } from '../../../../data/advocateSide';
import { advNoticeFeeScreen as t, colors, font, ink } from '../../../../constants/theme';

// Fee & earnings (design/185).
//
// Fixture breakdown only (unconfirmed, not used for API earnings): platform fee from ADV_COMMISSION_10 (10%)
// and charges as 18% of that fee. 3,500 − 350 − 63 = 3,087, matching design/185.
//
// ⚠ design/203 later states "Advocate Payout ₹3,500" — the gross — on this same
// journey, ₹413 above the net computed here. See the note in data/advocateSide.ts.
//
// ⚠ design/185 clips its own subtitle behind the stage chip ("Review your earnings
// before ac…"); it wraps here.

export function AdvocateNoticeFeeView({notice, navigate, onAccept, onDecline, clientFees, payout, canDecide=true, preAcceptance=true}: {notice: Omit<typeof ADV_NOTICE, 'clientFee'> & {clientFee: number | null}; navigate: typeof router; onAccept: () => void; onDecline: () => void; clientFees?:CaseClientFees|null; payout?:import('@legalitt/shared').ApiCase['advocate_payout']; canDecide?:boolean; preAcceptance?:boolean}) {
  const router = navigate;
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const n = notice;
  const money=(paise:string|null|undefined)=>paise==null?'':paiseText(paise);
  const realFees=clientFees!==undefined;
  const feeRows=clientFees?[
    ['Service Fee',clientFees.service_fee_paise],['Platform Fee',clientFees.platform_fee_paise],
    ['Delivery Fee',clientFees.delivery_fee_paise],['GST',clientFees.gst_paise],
    ['Additional PDF pages',clientFees.page_overage_paise],
  ].filter((row):row is [string,string]=>row[1]!=null):[];
  const f = n.clientFee === null ? null : advNoticeFee(n.clientFee);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
          style={styles.backBtn}
        >
          <ArrowLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title} {...shrinkToFit(0.75)}>
            Fee &amp; Earnings
          </Text>
          {/* design/185 clips this line; wrapped here. */}
          {preAcceptance && <Text style={styles.sub} {...shrinkToFit(0.75)}>
            Review your earnings before accepting.
          </Text>}
        </View>
        {preAcceptance && <View style={styles.stage}>
          <View style={styles.stageDot} />
          <Text style={styles.stageText} {...shrinkToFit(0.75)}>
            Pre-Acceptance
          </Text>
        </View>}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.chipRow}>
            <View style={styles.typeChip}>
              <Text style={styles.typeChipText} {...shrinkToFit(0.8)}>
                {n.typeChip}
              </Text>
            </View>
            {!!n.verifiedChip && <View style={styles.verified}>
              <Check style={!n.verifiedChip?{opacity:0}:undefined} size={t.verifiedIcon} color={t.verifiedColour} />
              <Text style={styles.verifiedText} {...shrinkToFit(0.8)}>
                {n.verifiedChip}
              </Text>
            </View>}
          </View>

          <Text style={styles.ref} {...shrinkToFit(0.75)}>
            {n.refLabel}
          </Text>

          <View style={styles.nameRow}>
            <View style={styles.nameCol}>
              <Text style={styles.name} {...shrinkToFit(0.75)}>
                {n.client.name}
              </Text>
              <Text style={styles.matter} {...shrinkToFit(0.75)}>
                {n.matter}
              </Text>
            </View>
            {/* No booked slot: the label and its separator go with it. */}
            {Boolean(n.slot.date || n.slot.time) && (
              <View style={styles.slotCol}>
                <Text style={styles.slotLabel} {...shrinkToFit(0.75)}>
                  {n.slot.label}
                </Text>
                <Text style={styles.slotValue} {...shrinkToFit(0.7)}>
                  {n.slot.date}{Boolean(n.slot.date && n.slot.time) && ' • '}{n.slot.time}
                </Text>
              </View>
            )}
          </View>
        </View>

        {realFees ? <>
          <View style={styles.card}>
            {clientFees?.total_paise!=null && <>
              <Text style={styles.tcf}>TOTAL CLIENT FEE</Text>
              <View style={styles.feeRow}><Text style={styles.fee}>{money(clientFees.total_paise)}</Text><View style={styles.feeIcon}><Receipt size={t.feeIconGlyph} color={colors.brandDark}/></View></View>
            </>}
            {feeRows.length>0 && <><View style={styles.rule}/><Text style={styles.fb}>{instructedCopy.advocateWork.clientBreakdown}</Text>
              {feeRows.map(([label,value])=><View key={label} style={styles.line}><Text style={styles.lineLabel}>{label}</Text><Text style={styles.lineAmount}>{money(value)}</Text></View>)}
            </>}
            {(!clientFees?.total_paise || !clientFees.breakdown_complete) && <Text style={styles.noteText}>{!clientFees?.total_paise?instructedCopy.advocateWork.feesUnavailable:instructedCopy.advocateWork.feesPartial}</Text>}
          </View>
          <View style={styles.card}><Text style={styles.fb}>Payout Information</Text>
            {payout ? <>
              <View style={styles.line}><Text style={styles.lineLabel}>Service share</Text><Text style={styles.lineAmount}>{money(payout.service_share_paise)}</Text></View>
              <View style={styles.line}><Text style={styles.lineLabel}>Delivery reimbursement</Text><Text style={styles.lineAmount}>{money(payout.delivery_reimbursement_paise)}</Text></View>
              <View style={styles.line}><Text style={styles.lineLabel}>Your payout</Text><Text style={styles.lineAmount}>{money(payout.net_paise)}</Text></View>
              <Text style={styles.noteText}>This is the agreed payout amount. Transfer and withdrawal are not available yet.</Text>
            </> : <View style={styles.note}><Info size={t.noteIcon} color={colors.brandDark}/><Text style={styles.noteText}>{instructedCopy.advocateWork.payout}</Text></View>}
          </View>
        </> : <>
        <View style={styles.card}>
          <Text style={styles.tcf} {...shrinkToFit(0.8)}>
            TOTAL CLIENT FEE
          </Text>
          <View style={styles.feeRow}>
            <Text style={styles.fee} {...shrinkToFit(0.75)}>
              {f ? '₹' + f.clientFee.toLocaleString('en-IN') : ''}
            </Text>
            <Text style={styles.feeNote} {...shrinkToFit(0.75)}>
              {n.escrowNote}
            </Text>
            <View style={styles.feeIcon}>
              <Receipt size={t.feeIconGlyph} color={colors.brandDark} />
            </View>
          </View>

          <View style={styles.rule} />

          <View style={styles.fbRow}>
            <Text style={styles.fb} {...shrinkToFit(0.75)}>
              Fee Breakdown
            </Text>
            <Text style={styles.fbMeta} {...shrinkToFit(0.75)}>
              Automated Calculation
            </Text>
          </View>

          <View style={styles.line}>
            <Text style={styles.lineLabel} {...shrinkToFit(0.75)}>
              Client Fee
            </Text>
            <Text style={styles.lineAmount} {...shrinkToFit(0.75)}>
              {f ? '₹' + f.clientFee.toLocaleString('en-IN') : ''}
            </Text>
          </View>

          <View style={styles.line}>
            <Text style={styles.lineLabel} {...shrinkToFit(0.75)}>
              Platform Fee
            </Text>
            <Info size={t.lineInfoIcon} color={colors.brandDark} style={styles.lineInfo} />
            <Text style={[styles.lineAmount, styles.lineDeduct]} {...shrinkToFit(0.75)}>
              {f ? '-₹' + f.platformFee.toLocaleString('en-IN') : ''}
            </Text>
          </View>

          <View style={styles.line}>
            <Text style={styles.lineLabel} {...shrinkToFit(0.7)}>
              Applicable Charges{' '}
              <Text style={styles.lineSub}>(GST &amp; Gateway)</Text>
            </Text>
            <Text style={[styles.lineAmount, styles.lineDeduct]} {...shrinkToFit(0.75)}>
              {f ? '-₹' + f.charges.toLocaleString('en-IN') : ''}
            </Text>
          </View>

          <View style={styles.dash} />

          <View style={styles.net}>
            <View style={styles.netTop}>
              <Text style={styles.netLabel} {...shrinkToFit(0.75)}>
                YOUR NET EARNINGS
              </Text>
              <Text style={styles.netAmount} {...shrinkToFit(0.7)}>
                {f ? '₹' + f.net.toLocaleString('en-IN') : ''}
              </Text>
            </View>
            <View style={styles.netBottom}>
              <Text style={styles.netSub} {...shrinkToFit(0.7)}>
                Direct to your registered account
              </Text>
              <View style={styles.netChip}>
                <Text style={styles.netChipText} {...shrinkToFit(0.75)}>
                  Ready on Settlement
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.fbRow}>
            <Text style={styles.fb} {...shrinkToFit(0.75)}>
              Payout Information
            </Text>
            <View style={styles.pending}>
              <View style={styles.pendingDot} />
              <Text style={styles.pendingText} {...shrinkToFit(0.75)}>
                {n.payout.chip}
              </Text>
            </View>
          </View>

          <View style={styles.rule} />

          <View style={styles.cells}>
            <View style={styles.cell}>
              <Text style={styles.cellLabel} {...shrinkToFit(0.75)}>
                {n.payout.method.label}
              </Text>
              <View style={styles.cellValueRow}>
                <Landmark size={t.cellIcon} color={colors.textBody} />
                <Text style={[styles.cellValue, styles.cellValueInline]} {...shrinkToFit(0.7)}>
                  {n.payout.method.value}
                </Text>
              </View>
            </View>
            <View style={styles.cell}>
              <Text style={styles.cellLabel} {...shrinkToFit(0.75)}>
                {n.payout.window.label}
              </Text>
              <Text style={styles.cellValue} {...shrinkToFit(0.7)}>
                {n.payout.window.value}
              </Text>
            </View>
          </View>

          {n.payout.notes.map((note, i) => (
            <View key={note} style={[styles.note, i === 1 && styles.noteBox]}>
              <Info size={t.noteIcon} color={colors.brandDark} />
              <Text style={styles.noteText}>{note}</Text>
            </View>
          ))}
        </View>
        </>}
      </ScrollView>

      {preAcceptance && <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        {!realFees && <><View style={styles.barRow}>
          <View style={styles.barText}>
            <Text style={styles.barLabel} {...shrinkToFit(0.8)}>
              YOU RECEIVE
            </Text>
            <Text style={styles.barSub} {...shrinkToFit(0.7)}>
              Net earnings after applicable fees and charges
            </Text>
          </View>
          <Text style={styles.barAmount} {...shrinkToFit(0.7)}>
            {f ? '₹' + f.net.toLocaleString('en-IN') : ''}
          </Text>
        </View>

        <View style={styles.barRule} /></>}


        <View style={styles.barBtns}>
          <Pressable
            accessibilityRole="button"
            disabled={!canDecide} accessibilityState={{disabled:!canDecide}}
            onPress={onDecline}
            style={({ pressed }) => [styles.barBtn, styles.decline, !canDecide && {opacity:0.45}, pressed && styles.pressed]}
          >
            <Text style={styles.declineText} {...shrinkToFit(0.75)}>
              Decline Request
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={!canDecide} accessibilityState={{disabled:!canDecide}}
            onPress={onAccept}
            style={({ pressed }) => [styles.barBtn, styles.accept, !canDecide && {opacity:0.45}, pressed && styles.pressed]}
          >
            <Text style={styles.acceptText} {...shrinkToFit(0.7)}>
              Accept &amp; Schedule
            </Text>
            <ArrowRight size={t.acceptIcon} color={ink.onBrand} style={styles.acceptIcon} />
          </Pressable>
        </View>
      </View>}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: {
    paddingHorizontal: t.padX,
    paddingBottom: t.headerPadBottom,
    borderBottomWidth: 1,
    borderBottomColor: t.headerBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: t.backBtn,
    height: t.backBtn,
    borderRadius: t.backBtn / 2,
    backgroundColor: t.backBtnBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, minWidth: 0, marginLeft: t.backGap, marginRight: 8 },
  title: { fontFamily: font.appHeading, fontSize: t.titleSize, color: colors.textPrimary },
  sub: { marginTop: t.subGap, fontFamily: font.appBody, fontSize: t.subSize, color: colors.textBody },
  stage: {
    minHeight: t.stageHeight,
    borderRadius: t.stageRadius,
    paddingHorizontal: t.stagePadX,
    backgroundColor: t.stageBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  stageDot: {
    width: t.stageDot,
    height: t.stageDot,
    borderRadius: t.stageDot / 2,
    marginRight: t.stageDotGap,
    backgroundColor: t.stageColour,
  },
  stageText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.stageSize, color: t.stageColour },

  content: { paddingHorizontal: t.padX, paddingTop: t.cardGap, paddingBottom: 24 },
  card: {
    marginBottom: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },

  chipRow: { flexDirection: 'row', alignItems: 'center' },
  typeChip: {
    minHeight: t.typeChipHeight,
    borderRadius: t.typeChipRadius,
    paddingHorizontal: t.typeChipPadX,
    backgroundColor: t.typeChipBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  typeChipText: {
    fontFamily: font.appSemi,
    fontSize: t.typeChipSize,
    letterSpacing: t.typeChipSpacing,
    color: t.typeChipColour,
  },
  verified: {
    marginLeft: 'auto',
    paddingLeft: 8,
    minHeight: t.verifiedHeight,
    borderRadius: t.verifiedRadius,
    paddingHorizontal: t.verifiedPadX,
    backgroundColor: t.verifiedBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  verifiedText: {
    marginLeft: t.verifiedIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.verifiedSize,
    color: t.verifiedColour,
  },

  ref: { marginTop: t.refGap, fontFamily: font.appBody, fontSize: t.refSize, color: colors.textBody },
  nameRow: { marginTop: t.nameGap, flexDirection: 'row', alignItems: 'flex-end' },
  nameCol: { flex: 1, minWidth: 0, marginRight: 10 },
  name: { fontFamily: font.appHeading, fontSize: t.nameSize, color: colors.textPrimary },
  matter: { marginTop: t.matterGap, fontFamily: font.appBody, fontSize: t.matterSize, color: colors.textBody },
  slotCol: { alignItems: 'flex-end', flexShrink: 1 },
  slotLabel: { fontFamily: font.appBody, fontSize: t.slotLabelSize, color: colors.textBody },
  slotValue: {
    marginTop: t.slotValueGap,
    fontFamily: font.appHeading,
    fontSize: t.slotValueSize,
    color: colors.textPrimary,
  },

  tcf: {
    fontFamily: font.appSemi,
    fontSize: t.tcfSize,
    letterSpacing: t.tcfSpacing,
    color: colors.textBody,
  },
  feeRow: { marginTop: t.feeGap, flexDirection: 'row', alignItems: 'center' },
  fee: { fontFamily: font.appHeading, fontSize: t.feeSize, color: colors.textPrimary },
  feeNote: {
    marginLeft: t.feeNoteGap,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appBody,
    fontSize: t.feeNoteSize,
    color: colors.textBody,
  },
  feeIcon: {
    width: t.feeIcon,
    height: t.feeIcon,
    borderRadius: t.feeIconRadius,
    backgroundColor: t.feeIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rule: { marginVertical: t.ruleGap, height: 1, backgroundColor: t.rule },
  fbRow: { flexDirection: 'row', alignItems: 'center' },
  fb: { flex: 1, minWidth: 0, marginRight: 8, fontFamily: font.appHeading, fontSize: t.fbSize, color: colors.textPrimary },
  fbMeta: { fontFamily: font.appBody, fontSize: t.fbMetaSize, color: colors.textBody },

  line: { marginTop: t.lineGap, flexDirection: 'row', alignItems: 'center' },
  lineLabel: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.lineLabelSize, color: colors.textPrimary },
  lineSub: { fontSize: t.lineSubSize, color: colors.brandDark },
  lineInfo: { marginLeft: t.lineInfoGap },
  lineAmount: {
    marginLeft: 'auto',
    paddingLeft: 10,
    fontFamily: font.appHeading,
    fontSize: t.lineAmountSize,
    color: colors.textPrimary,
  },
  lineDeduct: { color: t.lineDeductColour },

  dash: {
    marginTop: t.dashGap,
    height: 1,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: t.dash,
  },

  net: {
    marginTop: t.netGap,
    borderRadius: t.netRadius,
    borderWidth: 1,
    borderColor: t.netBorder,
    backgroundColor: t.netBg,
    padding: t.netPad,
  },
  netTop: { flexDirection: 'row', alignItems: 'center' },
  netLabel: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appSemi,
    fontSize: t.netLabelSize,
    letterSpacing: t.netLabelSpacing,
    color: t.netLabelColour,
  },
  netAmount: { fontFamily: font.appHeading, fontSize: t.netAmountSize, color: colors.textPrimary },
  netBottom: { marginTop: t.netSubGap, flexDirection: 'row', alignItems: 'center' },
  netSub: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appBody,
    fontSize: t.netSubSize,
    color: colors.textPrimary,
  },
  netChip: {
    minHeight: t.netChipHeight,
    borderRadius: t.netChipRadius,
    paddingHorizontal: t.netChipPadX,
    backgroundColor: t.netChipBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  netChipText: { fontFamily: font.appBody, fontSize: t.netChipSize, color: t.netChipColour },

  pending: {
    minHeight: t.pendingHeight,
    borderRadius: t.pendingRadius,
    paddingHorizontal: t.pendingPadX,
    backgroundColor: t.pendingBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  pendingDot: {
    width: t.pendingDot,
    height: t.pendingDot,
    borderRadius: t.pendingDot / 2,
    marginRight: t.pendingDotGap,
    backgroundColor: t.pendingColour,
  },
  pendingText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.pendingSize, color: t.pendingColour },

  cells: { flexDirection: 'row', gap: t.cellGapX },
  cell: {
    flex: 1,
    minWidth: 0,
    borderRadius: t.cellRadius,
    backgroundColor: t.cellBg,
    padding: t.cellPad,
  },
  cellLabel: { fontFamily: font.appBody, fontSize: t.cellLabelSize, color: colors.textBody },
  cellValueRow: { flexDirection: 'row', alignItems: 'center' },
  cellValue: {
    marginTop: t.cellValueGap,
    fontFamily: font.appHeading,
    fontSize: t.cellValueSize,
    color: colors.textPrimary,
  },
  cellValueInline: { marginLeft: t.cellIconGap, flexShrink: 1 },

  note: { marginTop: t.noteGap, flexDirection: 'row' },
  noteBox: {
    borderRadius: t.noteBoxRadius,
    backgroundColor: t.noteBoxBg,
    padding: t.noteBoxPad,
  },
  noteText: {
    marginLeft: t.noteIconGap,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLineHeight,
    color: colors.textBody,
  },

  bar: {
    paddingHorizontal: t.barPadX,
    paddingTop: t.barPadTop,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: t.barBorder,
  },
  barRow: { flexDirection: 'row', alignItems: 'center' },
  barText: { flex: 1, minWidth: 0, marginRight: 10 },
  barLabel: {
    fontFamily: font.appSemi,
    fontSize: t.barLabelSize,
    letterSpacing: t.barLabelSpacing,
    color: colors.textPrimary,
  },
  barSub: { marginTop: t.barSubGap, fontFamily: font.appBody, fontSize: t.barSubSize, color: colors.brandDark },
  barAmount: { fontFamily: font.appHeading, fontSize: t.barAmountSize, color: colors.textPrimary },
  barRule: { marginTop: t.barRuleGap, height: 1, backgroundColor: t.barBorder },
  barBtns: { marginTop: t.barRuleGap, flexDirection: 'row', gap: t.barBtnGapX },
  barBtn: {
    flex: 1,
    minWidth: 0,
    minHeight: t.barBtnHeight,
    borderRadius: t.barBtnRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  decline: { backgroundColor: t.declineBg, borderWidth: 1, borderColor: t.declineBorder },
  declineText: { fontFamily: font.appBody, fontSize: t.barBtnSize, color: colors.textPrimary },
  accept: { backgroundColor: colors.brand },
  acceptText: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.barBtnSize, color: ink.onBrand },
  acceptIcon: { marginLeft: t.acceptIconGap },
  pressed: { opacity: 0.85 },
});

export default function AdvocateNoticeFeeScreen() {
  const model = useAdvocateNoticeModel('fee');
  return <NoticeScreenFeedback error={model.error} state={model.screenState}><AdvocateNoticeFeeView payout={model.api?model.controller.record?.advocate_payout:undefined} clientFees={model.clientFees} canDecide={model.canDecide} preAcceptance={model.preAcceptance} notice={model.data.ADV_NOTICE} navigate={model.navigate} onAccept={model.onAccept} onDecline={model.onDecline} /></NoticeScreenFeedback>;
}
