import { previewNotice } from '../../../components/PreviewNotice';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  AlarmClock,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Info,
  Languages,
  ListChecks,
  MapPin,
  Menu,
  CircleCheck,
  CircleHelp,
  Share2,
  ShieldCheck,
  Sparkles,
  SquarePen,
  UserRound,
  Video,
  X,
  Zap,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../constants/textFit';
import {
  ADV_AI_ACTIONS,
  ADV_AI_DOCS,
  ADV_AI_REFRESH,
  ADV_INFO_NEEDED,
  ADV_REQUEST,
  ADV_REQUEST_FILINGS,
} from '../../../data/advocateSide';
import { advRequest as t, colors, font, ink } from '../../../constants/theme';
import { advDocHref } from '../../../data/docLinks';

// Incoming request detail (design/163). designs 160 and 161 are shorter cuts of this
// same screen; the full one is built.
//
// ─────────────────────────────────────────────────────────────────────────────
// ⚠ ALL THREE AI PANELS ARE STATIC CONTENT FROM data/advocateSide.ts.
//
// Nothing is generated or retrieved. The Refresh button, both toggles, View Source,
// Add Note, Mark Done and Request Info are ALL INERT — none has a designed
// destination anywhere in the batch. That is nine distinct controls on one screen
// that lead nowhere, and four of them (View Source ×2, Add Note ×2) imply a document
// viewer that opens at a cited page, which does not exist.
//
// See the scope note at the top of data/advocateSide.ts for what a real version
// needs: a model provider, document ingestion and OCR, citation grounding, and a
// position on accuracy and liability.
// ─────────────────────────────────────────────────────────────────────────────

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default function AdvocateRequestDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [seconds, setSeconds] = useState(ADV_REQUEST.expirySeconds);
  const [aiDocs, setAiDocs] = useState(true);
  const [aiActions, setAiActions] = useState(true);

  useEffect(() => {
    if (seconds <= 0) return;
    const tick = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(tick);
  }, [seconds]);

  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const r = ADV_REQUEST;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Menu"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
        >
          <Menu size={t.menuIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          Requests
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          onPress={() => router.push('/advocate/notifications')}
          style={styles.bellWrap}
        >
          <Bell size={t.bell} color={colors.textPrimary} />
          <View style={styles.bellDot} />
        </Pressable>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <View style={styles.pending}>
        <View style={styles.pendingDot} />
        <Text style={styles.pendingText} {...shrinkToFit(0.75)}>
          PENDING ACCEPTANCE
        </Text>
        <Text style={styles.expiry} {...shrinkToFit(0.75)}>
          Expires in {hours}h {pad(mins)}m
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.retainerRow}>
            <View style={styles.retainerIcon}>
              <Zap size={t.retainerIconGlyph} color={colors.brandDark} />
            </View>
            <View style={styles.retainerText}>
              <Text style={styles.retainerLabel} {...shrinkToFit(0.8)}>
                {r.retainer.label}
              </Text>
              <Text style={styles.retainerFee} {...shrinkToFit(0.75)}>
                ₹{r.retainer.fee.toLocaleString('en-IN')}{' '}
                <Text style={styles.retainerUnit}>/ {r.retainer.duration}</Text>
              </Text>
            </View>
            <View style={styles.retainerRight}>
              <View style={styles.priority}>
                <AlarmClock size={t.priorityIcon} color={t.priorityColour} />
                <Text style={styles.priorityText} {...shrinkToFit(0.75)}>
                  {r.retainer.chip}
                </Text>
              </View>
              <Text style={styles.deadline} {...shrinkToFit(0.75)}>
                {r.retainer.deadline}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.section} {...shrinkToFit(0.8)}>
            CLIENT PROFILE
          </Text>
          <View style={styles.sectionNoteRow}>
            <ShieldCheck size={13} color={colors.textBody} />
            <Text style={styles.sectionNote} {...shrinkToFit(0.8)}>
              {r.client.verified}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.clientRow}>
            {/* Placeholder for design/163's photograph, at the drawn size. */}
            <View style={styles.photo}>
              <Text style={styles.photoText}>{r.client.initials}</Text>
            </View>
            <View style={styles.clientText}>
              <Text style={styles.name} {...shrinkToFit(0.75)}>
                {r.client.name}
              </Text>
              <Text style={styles.role}>{r.client.title}</Text>
              <View style={styles.tierRow}>
                <View style={styles.tier}>
                  <Text style={styles.tierText} {...shrinkToFit(0.8)}>
                    {r.client.tier}
                  </Text>
                </View>
                <Text style={styles.prior} {...shrinkToFit(0.75)}>
                  • {r.client.priorCases}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.pair}>
            <View style={styles.pairCol}>
              <View style={styles.pairLabelRow}>
                <MapPin size={t.pairIcon} color={colors.textBody} />
                <Text style={styles.pairLabel} {...shrinkToFit(0.75)}>
                  Jurisdiction &amp; Base
                </Text>
              </View>
              <Text style={styles.pairValue} {...shrinkToFit(0.75)}>
                {r.client.jurisdiction}
              </Text>
            </View>
            <View style={styles.pairCol}>
              <View style={styles.pairLabelRow}>
                <Languages size={t.pairIcon} color={colors.textBody} />
                <Text style={styles.pairLabel} {...shrinkToFit(0.75)}>
                  Language
                </Text>
              </View>
              <Text style={styles.pairValue} {...shrinkToFit(0.7)}>
                {r.client.language}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.section} {...shrinkToFit(0.8)}>
            MATTER BRIEFING
          </Text>
          <Text style={styles.sectionNote} {...shrinkToFit(0.8)}>
            {r.ref}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.briefRow}>
            <View style={styles.practice}>
              <Text style={styles.practiceText} {...shrinkToFit(0.75)}>
                {r.briefing.practice}
              </Text>
            </View>
            <View style={styles.mode}>
              <Video size={t.modeIcon} color={colors.textPrimary} />
              <Text style={styles.modeText} {...shrinkToFit(0.75)}>
                {r.briefing.mode}
              </Text>
            </View>
          </View>

          <Text style={styles.fee} {...shrinkToFit(0.75)}>
            ₹{r.retainer.fee.toLocaleString('en-IN')}{' '}
            <Text style={styles.retainerUnit}>/ {r.retainer.duration}</Text>
          </Text>

          <View style={styles.window}>
            <View style={styles.windowIcon}>
              <CalendarDays size={t.windowIconGlyph} color={colors.brandDark} />
            </View>
            <View style={styles.windowText}>
              <Text style={styles.windowLabel} {...shrinkToFit(0.8)}>
                Requested Time Window
              </Text>
              <Text style={styles.windowValue}>{r.briefing.window}</Text>
            </View>
          </View>

          <Text style={[styles.section, styles.summaryLabel]} {...shrinkToFit(0.8)}>
            ADVOCATE SUMMARY
          </Text>
          <ScrollView style={styles.summary} nestedScrollEnabled>
            <Text style={styles.summaryText}>{r.summary}</Text>
          </ScrollView>

          <View style={styles.tools}>
            {[
              { label: 'Download', icon: Download },
              { label: 'Share', icon: Share2 },
              { label: 'Copy', icon: Copy },
            ].map((x) => (
              <Pressable key={x.label} accessibilityRole="button" style={styles.tool}>
                <x.icon size={t.toolIcon} color={colors.textPrimary} />
                <Text style={styles.toolText} {...shrinkToFit(0.8)}>
                  {x.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.aiHead}>
            <View style={styles.aiIcon}>
              <Sparkles size={t.aiIconGlyph} color={colors.brandDark} />
            </View>
            <View style={styles.aiText}>
              <View style={styles.aiTitleRow}>
                <Text style={styles.aiTitle} {...shrinkToFit(0.75)}>
                  AI Refresh
                </Text>
                <View style={styles.aiChip}>
                  <Text style={styles.aiChipText} {...shrinkToFit(0.8)}>
                    {ADV_AI_REFRESH.chip}
                  </Text>
                </View>
              </View>
              <Text style={styles.aiSub} {...shrinkToFit(0.75)}>
                {ADV_AI_REFRESH.subtitle}
              </Text>
            </View>
            {/* Inert — see the note at the top of this file. */}
            <Pressable onPress={() => previewNotice(ADV_AI_REFRESH.explanation)} accessibilityRole="button" style={styles.aiBtn}>
              <Sparkles size={t.aiBtnIcon} color={colors.textPrimary} />
              <Text style={styles.aiBtnText} {...shrinkToFit(0.8)}>
                Refresh
              </Text>
            </Pressable>
          </View>

          <Text style={styles.aiBody}>{ADV_AI_REFRESH.explanation}</Text>

          <View style={styles.block}>
            <View style={styles.blockHead}>
              <FileText size={13} color={colors.textBody} />
              <Text style={styles.blockLabel} {...shrinkToFit(0.75)}>
                {ADV_AI_REFRESH.blockLabel}
              </Text>
              <Text style={styles.blockChip} {...shrinkToFit(0.75)}>
                {ADV_AI_REFRESH.blockChip}
              </Text>
            </View>
            <View style={styles.blockRule} />
            {ADV_AI_REFRESH.bullets.map((b) => (
              <Text key={b.label} style={styles.bullet}>
                <Text style={styles.bulletLabel}>• {b.label} </Text>
                {b.body}
              </Text>
            ))}
          </View>

          <View style={styles.aiFoot}>
            <Info size={t.footIcon} color={colors.textBody} />
            <Text style={styles.aiFootText} {...shrinkToFit(0.75)}>
              {ADV_AI_REFRESH.footer}
            </Text>
            <Pressable onPress={() => previewNotice(ADV_AI_REFRESH.original)} accessibilityRole="button" style={styles.linkRow}>
              <Text style={styles.link} {...shrinkToFit(0.8)}>
                {ADV_AI_REFRESH.original}
              </Text>
              <ArrowUpRight size={14} color={colors.brandDark} />
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.section} {...shrinkToFit(0.8)}>
            ATTACHED FILINGS ({ADV_REQUEST_FILINGS.length})
          </Text>
          <Text style={styles.sectionNote} {...shrinkToFit(0.8)}>
            Case documents
          </Text>
        </View>

        {ADV_REQUEST_FILINGS.map((f) => (
          <View key={f.id} style={styles.fileCard}>
            <View style={styles.fileIcon}>
              <FileText size={t.fileIconGlyph} color={colors.brandDark} />
            </View>
            <View style={styles.fileText}>
              <Text style={styles.fileName} {...shrinkToFit(0.7)}>
                {f.name}
              </Text>
              <View style={styles.fileChip}>
                <CircleCheck size={t.fileChipIcon} color={t.fileChipColour} />
                <Text style={styles.fileChipText} {...shrinkToFit(0.8)}>
                  {f.chip}
                </Text>
              </View>
              <Text style={styles.fileMeta} {...shrinkToFit(0.7)}>
                {f.meta}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push(advDocHref(f.name) as Href)}
              style={styles.fileView}
            >
              <Eye size={t.fileViewIcon} color={colors.textPrimary} />
              <Text style={styles.fileViewText} {...shrinkToFit(0.8)}>
                View
              </Text>
            </Pressable>
          </View>
        ))}

        <View style={styles.card}>
          <View style={styles.aiHead}>
            <View style={styles.aiIcon}>
              <Sparkles size={t.aiIconGlyph} color={colors.brandDark} />
            </View>
            <View style={styles.aiText}>
              <View style={styles.aiTitleRow}>
                <Text style={styles.aiTitle} {...shrinkToFit(0.7)}>
                  {ADV_AI_DOCS.title}
                </Text>
                <View style={[styles.aiChip, styles.aiChipWarm]}>
                  <Text style={styles.aiChipTextWarm} {...shrinkToFit(0.75)}>
                    {ADV_AI_DOCS.chip}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.toggleWrap}>
              <Pressable
                accessibilityRole="switch"
                accessibilityState={{ checked: aiDocs }}
                accessibilityLabel="AI document review"
                onPress={() => setAiDocs((v) => !v)}
                style={[styles.toggle, aiDocs && styles.toggleOn]}
              >
                <View style={[styles.knob, aiDocs && styles.knobOn]} />
              </Pressable>
              <Text style={styles.toggleLabel} {...shrinkToFit(0.7)}>
                {ADV_AI_DOCS.toggleLabel}
              </Text>
            </View>
          </View>

          {/* The description sits under the title but spans past the toggle column. */}
          <Text style={[styles.aiBody, styles.aiDesc]}>{ADV_AI_DOCS.description}</Text>

          <View style={styles.proc}>
            <ListChecks size={t.procIcon} color={colors.textBody} />
            <Text style={styles.procText}>{ADV_AI_DOCS.processing}</Text>
          </View>

          <View style={styles.done}>
            <CircleCheck size={t.doneIcon} color="#1E9E4A" />
            <View style={styles.doneText}>
              <Text style={styles.doneTitle} {...shrinkToFit(0.75)}>
                {ADV_AI_DOCS.completeTitle}
              </Text>
              <Text style={styles.doneSub} {...shrinkToFit(0.75)}>
                {ADV_AI_DOCS.completeSub}
              </Text>
            </View>
            <View style={styles.doneChip}>
              <Text style={styles.doneChipText} {...shrinkToFit(0.75)}>
                {ADV_AI_DOCS.completeChip}
              </Text>
            </View>
          </View>

          <View style={styles.stats}>
            {ADV_AI_DOCS.stats.map((s) => (
              <View key={s.label} style={[styles.stat, s.risk && styles.statRisk]}>
                <Text
                  style={[styles.statLabel, s.risk && styles.statLabelRisk]}
                  {...shrinkToFit(0.7)}
                >
                  {s.label}
                </Text>
                <Text
                  style={[styles.statValue, s.risk && styles.statValueRisk]}
                  {...shrinkToFit(0.7)}
                >
                  {s.value}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.block}>
            <Text style={styles.sumTitle} {...shrinkToFit(0.8)}>
              {ADV_AI_DOCS.summaryTitle}
            </Text>
            <Text style={styles.sumSub} {...shrinkToFit(0.75)}>
              {ADV_AI_DOCS.summarySub}
            </Text>
            <View style={styles.blockRule} />

            {ADV_AI_DOCS.sections.map((s) => (
              <View key={s.label} style={styles.sumSection}>
                <View style={styles.sumLabelRow}>
                  <Text style={styles.sumLabel} {...shrinkToFit(0.75)}>
                    • {s.label}
                  </Text>
                  {s.cite && (
                    <View style={styles.sumCite}>
                      <ExternalLink size={t.sumCiteIcon} color={colors.textBody} />
                      <Text style={styles.sumCiteText} {...shrinkToFit(0.7)}>
                        {s.cite}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.sumBody}>{s.body}</Text>
              </View>
            ))}

            <Pressable onPress={() => previewNotice("View Full Summary")}
              accessibilityRole="button"
              style={({ pressed }) => [styles.viewFull, pressed && styles.pressed]}
            >
              <FileText size={t.viewFullIcon} color={ink.onBrand} />
              <Text style={styles.viewFullText} {...shrinkToFit(0.8)}>
                View Full Summary
              </Text>
            </Pressable>

            <View style={styles.tools}>
              {[
                { label: 'Download', icon: Download },
                { label: 'Share', icon: Share2 },
                { label: 'Copy', icon: Copy },
              ].map((x) => (
                <Pressable key={x.label} accessibilityRole="button" style={styles.tool}>
                  <x.icon size={t.toolIcon} color={colors.textPrimary} />
                  <Text style={styles.toolText} {...shrinkToFit(0.8)}>
                    {x.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.aiFoot}>
            <Info size={t.footIcon} color={colors.textBody} />
            <Text style={styles.aiFootText}>{ADV_AI_DOCS.disclaimer}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.aiHead}>
            <View style={styles.aiIcon}>
              <ListChecks size={t.aiIconGlyph} color={colors.brandDark} />
            </View>
            <View style={styles.aiText}>
              <Text style={styles.aiTitle} {...shrinkToFit(0.7)}>
                AI Recommended Action Plan
              </Text>
              <Text style={styles.aiBody}>
                Possible next steps based on the case details and documents reviewed.
              </Text>
            </View>
            <View style={styles.toggleWrap}>
              <Pressable
                accessibilityRole="switch"
                accessibilityState={{ checked: aiActions }}
                accessibilityLabel="AI recommendations"
                onPress={() => setAiActions((v) => !v)}
                style={[styles.toggle, aiActions && styles.toggleOn]}
              >
                <View style={[styles.knob, aiActions && styles.knobOn]} />
              </Pressable>
              <Text style={styles.toggleLabel} {...shrinkToFit(0.65)}>
                AI Recommendations On
              </Text>
            </View>
          </View>

          {ADV_AI_ACTIONS.map((a) => (
            <View key={a.n} style={styles.action}>
              <View style={styles.actionHead}>
                <View style={[styles.num, a.state === 'in-progress' && styles.numOn]}>
                  <Text
                    style={[styles.numText, a.state === 'in-progress' && styles.numTextOn]}
                  >
                    {a.n}
                  </Text>
                </View>
                <View style={styles.state}>
                  <Text style={styles.stateText} {...shrinkToFit(0.75)}>
                    {a.stateLabel}
                  </Text>
                </View>
              </View>

              <Text style={styles.actionTitle}>{a.title}</Text>
              <Text style={styles.actionBody}>{a.body}</Text>

              {a.source && (
                <View style={styles.source}>
                  <FileText size={t.sourceIcon} color={colors.brandDark} />
                  <Text style={styles.sourceText} {...shrinkToFit(0.7)}>
                    {a.source}
                  </Text>
                </View>
              )}

              {/* Inert — none of these three buttons has a designed destination. */}
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.actionBtn,
                  a.button === 'add-note' ? styles.actionBtnSolid : styles.actionBtnGhost,
                  pressed && styles.pressed,
                ]}
              >
                {a.button === 'view-source' && <Eye size={t.actionBtnIcon} color={colors.textPrimary} />}
                {a.button === 'add-note' && <SquarePen size={t.actionBtnIcon} color={ink.onBrand} />}
                {a.button === 'mark-done' && <Check size={t.actionBtnIcon} color={colors.textPrimary} />}
                <Text
                  style={[
                    styles.actionBtnText,
                    a.button === 'add-note' && styles.actionBtnTextSolid,
                  ]}
                  {...shrinkToFit(0.8)}
                >
                  {a.button === 'view-source' && 'View Source'}
                  {a.button === 'add-note' && 'Add Note'}
                  {a.button === 'mark-done' && 'Mark Done'}
                </Text>
              </Pressable>
            </View>
          ))}

          <View style={styles.info}>
            <View style={styles.infoHead}>
              <CircleHelp size={t.infoIcon} color={colors.brandDark} />
              <Text style={styles.infoTitle} {...shrinkToFit(0.8)}>
                {ADV_INFO_NEEDED.title}
              </Text>
              <Text style={styles.infoChip} {...shrinkToFit(0.8)}>
                {ADV_INFO_NEEDED.chip}
              </Text>
            </View>
            {ADV_INFO_NEEDED.items.map((item) => (
              <View key={item} style={styles.infoRow}>
                <View style={styles.infoDot} />
                <Text style={styles.infoRowText} {...shrinkToFit(0.7)}>
                  {item}
                </Text>
                <Pressable onPress={() => previewNotice("Request Info")} accessibilityRole="button" style={styles.infoBtn}>
                  <Text style={styles.infoBtnText} {...shrinkToFit(0.75)}>
                    Request Info
                  </Text>
                  <ArrowRight size={t.infoBtnIcon} color={ink.onBrand} style={styles.infoBtnIcon} />
                </Pressable>
              </View>
            ))}
          </View>

          <View style={styles.aiFoot}>
            <Info size={t.footIcon} color={colors.textBody} />
            <Text style={styles.aiFootText}>{ADV_INFO_NEEDED.disclaimer}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + 14 }]}>
        <View style={styles.barRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
            style={({ pressed }) => [styles.decline, pressed && styles.pressed]}
          >
            <X size={t.barIcon} color={colors.textPrimary} />
            <Text style={styles.declineText} {...shrinkToFit(0.8)}>
              Decline
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(`/advocate/requests/${id}/schedule` as Href)}
            style={({ pressed }) => [styles.accept, pressed && styles.pressed]}
          >
            <Check size={t.barIcon} color={ink.onBrand} />
            <Text style={styles.acceptText} {...shrinkToFit(0.75)}>
              Accept &amp; Schedule
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: {
    paddingHorizontal: t.padX,
    paddingBottom: t.headerPadBottom,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    minWidth: 0,
    marginLeft: 14,
    marginRight: 10,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  bellWrap: {},
  bellDot: {
    position: 'absolute',
    right: -2,
    top: -2,
    width: t.bellDot,
    height: t.bellDot,
    borderRadius: t.bellDot / 2,
    backgroundColor: '#D64545',
  },
  avatar: {
    marginLeft: t.avatarGap,
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: colors.brandDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pending: {
    minHeight: t.pendingHeight,
    paddingHorizontal: t.padX,
    backgroundColor: '#F6F2EC',
    flexDirection: 'row',
    alignItems: 'center',
  },
  pendingDot: {
    width: t.pendingDot,
    height: t.pendingDot,
    borderRadius: t.pendingDot / 2,
    marginRight: t.pendingDotGap,
    backgroundColor: t.pendingColour,
  },
  pendingText: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appSemi,
    fontSize: t.pendingSize,
    letterSpacing: t.pendingSpacing,
    color: colors.textPrimary,
  },
  expiry: { fontFamily: font.appBody, fontSize: t.expirySize, color: colors.textPrimary },

  content: { paddingHorizontal: t.padX, paddingBottom: 28 },
  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },

  retainerRow: { flexDirection: 'row', alignItems: 'center' },
  retainerIcon: {
    width: t.retainerIcon,
    height: t.retainerIcon,
    borderRadius: t.retainerIcon / 2,
    backgroundColor: t.retainerIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retainerText: { flex: 1, minWidth: 0, marginLeft: t.retainerIconGap, marginRight: 8 },
  retainerLabel: { fontFamily: font.appBody, fontSize: t.retainerLabelSize, color: colors.textBody },
  retainerFee: {
    marginTop: t.retainerFeeGap,
    fontFamily: font.appHeading,
    fontSize: t.retainerFeeSize,
    color: colors.textPrimary,
  },
  retainerUnit: { fontFamily: font.appBody, fontSize: t.retainerUnitSize, color: colors.textBody },
  retainerRight: { alignItems: 'flex-end' },
  priority: {
    minHeight: t.priorityHeight,
    borderRadius: t.priorityRadius,
    paddingHorizontal: t.priorityPadX,
    backgroundColor: t.priorityBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityText: {
    marginLeft: t.priorityIconGap,
    fontFamily: font.appSemi,
    fontSize: t.prioritySize,
    color: t.priorityColour,
  },
  deadline: {
    marginTop: t.deadlineGap,
    fontFamily: font.appBody,
    fontSize: t.deadlineSize,
    color: colors.textBody,
  },

  sectionRow: {
    marginTop: t.sectionGap,
    paddingHorizontal: t.sectionInset,
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appSemi,
    fontSize: t.sectionSize,
    letterSpacing: t.sectionSpacing,
    color: colors.textBody,
  },
  sectionNoteRow: { flexDirection: 'row', alignItems: 'center' },
  sectionNote: { marginLeft: 6, fontFamily: font.appBody, fontSize: t.sectionNoteSize, color: colors.textBody },

  clientRow: { flexDirection: 'row' },
  photo: {
    width: t.photo,
    height: t.photo,
    borderRadius: t.photo / 2,
    backgroundColor: '#F3DCC0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: { fontFamily: font.appSemi, fontSize: t.photoText, color: colors.brandDark },
  clientText: { flex: 1, minWidth: 0, marginLeft: t.photoGap },
  name: { fontFamily: font.appHeading, fontSize: t.nameSize, color: colors.textPrimary },
  role: {
    marginTop: t.roleGap,
    fontFamily: font.appBody,
    fontSize: t.roleSize,
    lineHeight: t.roleLineHeight,
    color: colors.textBody,
  },
  tierRow: { marginTop: t.tierGap, flexDirection: 'row', alignItems: 'center' },
  tier: {
    minHeight: t.tierHeight,
    borderRadius: t.tierRadius,
    paddingHorizontal: t.tierPadX,
    backgroundColor: t.tierBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierText: { fontFamily: font.appBody, fontSize: t.tierSize, color: colors.textPrimary },
  prior: { marginLeft: 8, flexShrink: 1, fontFamily: font.appBody, fontSize: t.priorSize, color: colors.textPrimary },

  pair: {
    marginTop: t.pairGap,
    borderRadius: t.pairRadius,
    backgroundColor: t.pairBg,
    padding: t.pairPad,
    flexDirection: 'row',
    gap: t.pairColGap,
  },
  pairCol: { flex: 1, minWidth: 0 },
  pairLabelRow: { flexDirection: 'row', alignItems: 'center' },
  pairLabel: { marginLeft: t.pairIconGap, flexShrink: 1, fontFamily: font.appBody, fontSize: t.pairLabelSize, color: colors.textBody },
  pairValue: {
    marginTop: t.pairValueGap,
    fontFamily: font.appHeading,
    fontSize: t.pairValueSize,
    color: colors.textPrimary,
  },

  briefRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  practice: {
    minHeight: t.practiceHeight,
    borderRadius: t.practiceRadius,
    paddingHorizontal: t.practicePadX,
    backgroundColor: t.practiceBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  practiceText: { fontFamily: font.appBody, fontSize: t.practiceSize, color: '#6B4F2A' },
  mode: {
    minHeight: t.modeHeight,
    borderRadius: t.modeRadius,
    paddingHorizontal: t.modePadX,
    backgroundColor: t.modeBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  modeText: { marginLeft: t.modeIconGap, flexShrink: 1, fontFamily: font.appBody, fontSize: t.modeSize, color: colors.textPrimary },
  fee: { marginTop: t.feeGap, fontFamily: font.appHeading, fontSize: t.feeSize, color: colors.textPrimary },

  window: {
    marginTop: t.windowGap,
    borderRadius: t.windowRadius,
    backgroundColor: t.windowBg,
    padding: t.windowPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  windowIcon: {
    width: t.windowIcon,
    height: t.windowIcon,
    borderRadius: t.windowIconRadius,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  windowText: { flex: 1, minWidth: 0, marginLeft: t.windowIconGap },
  windowLabel: { fontFamily: font.appBody, fontSize: t.windowLabelSize, color: colors.textBody },
  windowValue: {
    marginTop: t.windowValueGap,
    fontFamily: font.appHeading,
    fontSize: t.windowValueSize,
    lineHeight: t.windowLineHeight,
    color: colors.textPrimary,
  },

  summaryLabel: { marginTop: t.sectionGap, flex: 0 },
  summary: {
    marginTop: t.summaryGap,
    maxHeight: t.summaryHeight,
    borderRadius: t.summaryRadius,
    backgroundColor: t.summaryBg,
    padding: t.summaryPad,
  },
  summaryText: {
    fontFamily: font.appBody,
    fontSize: t.summarySize,
    lineHeight: t.summaryLineHeight,
    color: colors.textPrimary,
  },

  tools: {
    marginTop: t.toolsGap,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tool: {
    minHeight: t.toolHeight,
    borderRadius: t.toolRadius,
    backgroundColor: t.toolBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: t.toolPadX,
  },
  toolText: { marginLeft: t.toolIconGap, flexShrink: 1, fontFamily: font.appBody, fontSize: t.toolSize, color: colors.textPrimary },

  aiHead: { flexDirection: 'row', alignItems: 'flex-start' },
  aiIcon: {
    width: t.aiIcon,
    height: t.aiIcon,
    borderRadius: t.aiIconRadius,
    backgroundColor: t.aiIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiText: { flex: 1, minWidth: 0, marginLeft: t.aiIconGap, marginRight: 8 },
  aiTitleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', rowGap: 4 },
  aiTitle: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.aiTitleSize, color: colors.textPrimary },
  aiChip: {
    marginLeft: 8,
    minHeight: t.aiChipHeight,
    borderRadius: t.aiChipRadius,
    paddingHorizontal: t.aiChipPadX,
    backgroundColor: t.aiChipBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  aiChipWarm: { backgroundColor: '#F7DFC2' },
  aiChipText: { fontFamily: font.appBody, fontSize: t.aiChipSize, color: colors.textBody },
  aiChipTextWarm: { fontFamily: font.appSemi, fontSize: 10.5, letterSpacing: 0.4, color: '#6B4F2A' },
  aiSub: { marginTop: t.aiSubGap, fontFamily: font.appBody, fontSize: t.aiSubSize, color: colors.textBody },
  aiBtn: {
    minHeight: t.aiBtnHeight,
    borderRadius: t.aiBtnRadius,
    paddingHorizontal: t.aiBtnPadX,
    backgroundColor: t.aiBtnBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiBtnText: { marginLeft: t.aiBtnIconGap, fontFamily: font.appBody, fontSize: t.aiBtnSize, color: colors.textPrimary },
  aiDesc: { marginLeft: t.aiDescIndent },
  aiBody: {
    marginTop: t.aiBodyGap,
    fontFamily: font.appBody,
    fontSize: t.aiBodySize,
    lineHeight: t.aiBodyLineHeight,
    color: colors.textBody,
  },

  block: {
    marginTop: t.blockGap,
    borderRadius: t.blockRadius,
    backgroundColor: t.blockBg,
    padding: t.blockPad,
  },
  blockHead: { flexDirection: 'row', alignItems: 'center' },
  blockLabel: {
    marginLeft: 7,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appSemi,
    fontSize: t.blockLabelSize,
    letterSpacing: t.blockLabelSpacing,
    color: colors.textPrimary,
  },
  blockChip: { fontFamily: font.appBody, fontSize: t.blockChipSize, color: colors.brandDark },
  blockRule: { marginTop: t.blockRuleGap, height: 1, backgroundColor: t.blockRule },
  bullet: {
    marginTop: t.bulletGap,
    fontFamily: font.appBody,
    fontSize: t.bulletSize,
    lineHeight: t.bulletLineHeight,
    color: colors.textPrimary,
  },
  bulletLabel: { fontFamily: font.appHeading, color: colors.brandDark },

  aiFoot: { marginTop: t.footGap, flexDirection: 'row', alignItems: 'center' },
  aiFootText: {
    marginLeft: t.footIconGap,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.footSize,
    lineHeight: 17,
    color: colors.textBody,
  },
  linkRow: { flexDirection: 'row', alignItems: 'center' },
  link: { marginRight: 4, fontFamily: font.appBody, fontSize: t.linkSize, color: colors.brandDark },

  fileCard: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: {
    width: t.fileIcon,
    height: t.fileIcon,
    borderRadius: t.fileIconRadius,
    backgroundColor: t.fileIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileText: { flex: 1, minWidth: 0, marginLeft: t.fileIconGap, marginRight: 8 },
  fileName: { fontFamily: font.appHeading, fontSize: t.fileNameSize, color: colors.textPrimary },
  fileChip: {
    marginTop: t.fileChipGap,
    alignSelf: 'flex-start',
    minHeight: t.fileChipHeight,
    borderRadius: t.fileChipRadius,
    paddingHorizontal: t.fileChipPadX,
    backgroundColor: t.fileChipBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileChipText: {
    marginLeft: t.fileChipIconGap,
    fontFamily: font.appBody,
    fontSize: t.fileChipSize,
    color: t.fileChipColour,
  },
  fileMeta: { marginTop: t.fileMetaGap, fontFamily: font.appBody, fontSize: t.fileMetaSize, color: colors.textBody },
  fileView: {
    minHeight: t.fileViewHeight,
    borderRadius: t.fileViewRadius,
    paddingHorizontal: t.fileViewPadX,
    backgroundColor: t.fileViewBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileViewText: { marginLeft: t.fileViewIconGap, fontFamily: font.appBody, fontSize: t.fileViewSize, color: colors.textPrimary },

  toggleWrap: { width: t.toggleCol, alignItems: 'flex-end' },
  toggle: {
    width: t.toggleW,
    height: t.toggleH,
    borderRadius: t.toggleRadius,
    backgroundColor: t.toggleOff,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleOn: { backgroundColor: t.toggleOn },
  knob: {
    width: t.toggleKnob,
    height: t.toggleKnob,
    borderRadius: t.toggleKnob / 2,
    backgroundColor: colors.card,
  },
  knobOn: { alignSelf: 'flex-end' },
  toggleLabel: {
    marginTop: t.toggleLabelGap,
    textAlign: 'right',
    fontFamily: font.appBody,
    fontSize: t.toggleLabelSize,
    color: t.toggleLabelColour,
  },

  proc: {
    marginTop: t.procGap,
    borderRadius: t.procRadius,
    backgroundColor: t.procBg,
    padding: t.procPad,
    flexDirection: 'row',
  },
  procText: {
    marginLeft: t.procIconGap,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.procSize,
    lineHeight: t.procLineHeight,
    color: colors.textPrimary,
  },

  done: {
    marginTop: t.doneGap,
    borderRadius: t.doneRadius,
    backgroundColor: t.doneBg,
    borderWidth: 1,
    borderColor: t.doneBorder,
    padding: t.donePad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  doneText: { flex: 1, minWidth: 0, marginLeft: t.doneIconGap, marginRight: 8 },
  doneTitle: { fontFamily: font.appHeading, fontSize: t.doneTitleSize, color: '#1E7A44' },
  doneSub: { marginTop: t.doneSubGap, fontFamily: font.appBody, fontSize: t.doneSubSize, color: '#2E8B57' },
  doneChip: {
    minHeight: t.doneChipHeight,
    borderRadius: t.doneChipRadius,
    paddingHorizontal: t.doneChipPadX,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneChipText: { fontFamily: font.appSemi, fontSize: t.doneChipSize, color: '#1E7A44' },

  stats: { marginTop: t.statGap, flexDirection: 'row', gap: t.statGapX },
  stat: {
    flex: 1,
    minWidth: 0,
    borderRadius: t.statRadius,
    backgroundColor: t.statBg,
    paddingVertical: t.statPadY,
    alignItems: 'center',
  },
  statRisk: { backgroundColor: t.statRiskBg },
  statLabel: { fontFamily: font.appBody, fontSize: t.statLabelSize, color: colors.textBody },
  statLabelRisk: { color: t.statRiskColour },
  statValue: { marginTop: t.statValueGap, fontFamily: font.appHeading, fontSize: t.statValueSize, color: colors.textPrimary },
  statValueRisk: { color: t.statRiskColour },

  sumTitle: { fontFamily: font.appHeading, fontSize: t.sumTitleSize, color: colors.textPrimary },
  sumSub: { marginTop: t.sumSubGap, fontFamily: font.appBody, fontSize: t.sumSubSize, color: colors.textBody },
  sumSection: { marginTop: t.sumSectionGap },
  sumLabelRow: { flexDirection: 'row', alignItems: 'center' },
  sumLabel: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appSemi,
    fontSize: t.sumLabelSize,
    letterSpacing: 0.4,
    color: colors.brandDark,
  },
  sumCite: {
    minHeight: t.sumCiteHeight,
    borderRadius: t.sumCiteRadius,
    paddingHorizontal: t.sumCitePadX,
    backgroundColor: t.sumCiteBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  sumCiteText: { marginLeft: t.sumCiteIconGap, flexShrink: 1, fontFamily: font.appBody, fontSize: t.sumCiteSize, color: colors.textBody },
  sumBody: {
    marginTop: t.sumBodyGap,
    fontFamily: font.appBody,
    fontSize: t.sumBodySize,
    lineHeight: t.sumBodyLineHeight,
    color: colors.textPrimary,
  },
  viewFull: {
    marginTop: t.viewFullGap,
    minHeight: t.viewFullHeight,
    borderRadius: t.viewFullRadius,
    backgroundColor: t.viewFullBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewFullText: { marginLeft: t.viewFullIconGap, fontFamily: font.appSemi, fontSize: t.viewFullSize, color: ink.onBrand },

  action: {
    marginTop: t.actionGap,
    borderRadius: t.actionRadius,
    borderWidth: 1,
    borderColor: t.actionBorder,
    padding: t.actionPad,
  },
  actionHead: { flexDirection: 'row', alignItems: 'center' },
  num: {
    width: t.numCircle,
    height: t.numCircle,
    borderRadius: t.numCircle / 2,
    backgroundColor: t.numOffBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numOn: { backgroundColor: t.numOnBg },
  numText: { fontFamily: font.appHeading, fontSize: t.numSize, color: colors.textBody },
  numTextOn: { color: ink.onBrand },
  state: {
    marginLeft: 'auto',
    minHeight: t.stateHeight,
    borderRadius: t.stateRadius,
    paddingHorizontal: t.statePadX,
    backgroundColor: t.stateBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateText: {
    fontFamily: font.appSemi,
    fontSize: t.stateSize,
    letterSpacing: t.stateSpacing,
    color: colors.textBody,
  },
  actionTitle: {
    marginTop: t.actionTitleGap,
    fontFamily: font.appHeading,
    fontSize: t.actionTitleSize,
    lineHeight: t.actionTitleLineHeight,
    color: colors.textPrimary,
  },
  actionBody: {
    marginTop: t.actionBodyGap,
    fontFamily: font.appBody,
    fontSize: t.actionBodySize,
    lineHeight: t.actionBodyLineHeight,
    color: colors.textBody,
  },
  source: { marginTop: t.sourceGap, flexDirection: 'row', alignItems: 'center' },
  sourceText: { marginLeft: t.sourceIconGap, flexShrink: 1, fontFamily: font.appBody, fontSize: t.sourceSize, color: colors.textBody },
  actionBtn: {
    marginTop: t.actionBtnGap,
    minHeight: t.actionBtnHeight,
    borderRadius: t.actionBtnRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnGhost: { backgroundColor: t.actionBtnGhost },
  actionBtnSolid: { backgroundColor: t.actionBtnSolid },
  actionBtnText: { marginLeft: t.actionBtnIconGap, fontFamily: font.appBody, fontSize: t.actionBtnSize, color: colors.textPrimary },
  actionBtnTextSolid: { color: ink.onBrand },

  info: {
    marginTop: t.infoGap,
    borderRadius: t.infoRadius,
    backgroundColor: t.infoBg,
    padding: t.infoPad,
  },
  infoHead: { flexDirection: 'row', alignItems: 'center' },
  infoTitle: {
    marginLeft: t.infoIconGap,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appHeading,
    fontSize: t.infoTitleSize,
    color: colors.textPrimary,
  },
  infoChip: { fontFamily: font.appBody, fontSize: t.infoChipSize, color: colors.textBody },
  infoRow: {
    marginTop: t.infoRowGap,
    borderRadius: t.infoRowRadius,
    backgroundColor: colors.card,
    padding: t.infoRowPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoDot: {
    width: t.infoDot,
    height: t.infoDot,
    borderRadius: t.infoDot / 2,
    marginRight: t.infoDotGap,
    backgroundColor: '#D64545',
  },
  infoRowText: { flex: 1, minWidth: 0, marginRight: 8, fontFamily: font.appBody, fontSize: t.infoRowSize, color: colors.textPrimary },
  infoBtn: {
    minHeight: t.infoBtnHeight,
    borderRadius: t.infoBtnRadius,
    paddingHorizontal: t.infoBtnPadX,
    backgroundColor: t.infoBtnBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoBtnText: { fontFamily: font.appBody, fontSize: t.infoBtnSize, color: ink.onBrand },
  infoBtnIcon: { marginLeft: t.infoBtnIconGap },

  bar: {
    paddingHorizontal: t.padX,
    paddingTop: t.barPadTop,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: t.barBorder,
  },
  barRow: { flexDirection: 'row', gap: t.barGapX },
  decline: {
    flex: 1,
    minWidth: 0,
    minHeight: t.declineHeight,
    borderRadius: t.declineRadius,
    backgroundColor: t.declineBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineText: { marginLeft: t.barIconGap, fontFamily: font.appHeading, fontSize: t.barSize, color: colors.textPrimary },
  accept: {
    flex: 1.5,
    minWidth: 0,
    minHeight: t.declineHeight,
    borderRadius: t.declineRadius,
    backgroundColor: t.acceptBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  acceptText: { marginLeft: t.barIconGap, flexShrink: 1, fontFamily: font.appHeading, fontSize: t.barSize, color: ink.onBrand },
  pressed: { opacity: 0.85 },
});
