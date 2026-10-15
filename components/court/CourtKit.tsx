import { router, type Href } from 'expo-router';
import {
  ArrowLeftRight,
  ArrowRight,
  ArrowUp,
  Bell,
  Bookmark,
  Building2,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronRight,
  CircleCheck,
  CirclePlus,
  CircleX,
  Clock,
  Copy,
  Download,
  Eye,
  FileText,
  Flag,
  Folder,
  Gavel,
  Headset,
  History,
  IdCard,
  Info,
  LayoutGrid,
  Mail,
  MailCheck,
  Smartphone,
  Link,
  List,
  ListChecks,
  Lock,
  MapPin,
  MessageSquare,
  Mic,
  NotebookPen,
  Pencil,
  Phone,
  Play,
  Plus,
  Quote,
  Receipt,
  RefreshCw,
  Save,
  Scale,
  Send,
  Share2,
  SlidersHorizontal,
  Shield,
  ShieldCheck,
  Smile,
  Sparkles,
  Trash2,
  TrendingUp,
  TriangleAlert,
  Truck,
  Upload,
  UserRound,
  Users,
  Video,
  Volume2,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import { createContext, Fragment, useContext, useMemo, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../CourierHeader';
import PdfStackIcon from '../PdfStackIcon';
import {
  advCourt,
  advCourtPalette as q,
  advForensicRed,
  colors,
  courierGreen,
  dcDecidePalette,
  dcDocsNeededPalette,
  dcDocumentsPalette,
  dcShipmentPalette, font, hcPalette as c, ink, status } from '../../constants/theme';
import type { Block, Btn, CourtSpec, Head, IconName, Pill, Right, Step, Tone } from './types';

// The section kit of the advocate court batch (designs 362–396). One renderer
// draws every screen from its data in data/advocateCourt.ts; see types.ts for
// the vocabulary.
//
// ⚠ NAVIGATION ONLY. A button with `to` pushes that route; `back` goes back.
// Every other button and link draws and does nothing — no uploads, no fee
// sends, no AI, no calls, no notifications (see the data file's header).

export type CourtTokens = { -readonly [K in keyof typeof advCourt]: number } & Record<string, number>;

/** Per-screen measured tokens: the kit's defaults with that screen's own block over them. */
const Kit = createContext<{ t: CourtTokens; s: ReturnType<typeof makeStyles> } | null>(null);
const DEFAULT = { t: advCourt as CourtTokens, s: makeStyles(advCourt as CourtTokens) };
function useK() {
  return useContext(Kit) ?? DEFAULT;
}

export function CourtTokensProvider({ tokens, children }: { tokens?: Readonly<Record<string, number>>; children: ReactNode }) {
  const { width } = useWindowDimensions();
  // Below the drawn 390pt every type size shrinks in proportion, so lines that
  // fit at 390 (phone numbers, ids, button labels) still fit instead of breaking.
  const k = width < advCourt.compactBelow ? width / advCourt.compactBelow : 1;
  const value = useMemo(() => {
    const t = { ...advCourt, ...tokens } as CourtTokens;
    if (k !== 1) for (const key of Object.keys(t)) if (key.endsWith('Size') || key.endsWith('Line')) t[key] = t[key] * k;
    return { t, s: makeStyles(t) };
  }, [tokens, k]);
  return <Kit.Provider value={value}>{children}</Kit.Provider>;
}

const ICONS: Record<IconName, LucideIcon> = {
  check: Check,
  checkCircle: CircleCheck,
  clock: Clock,
  x: X,
  xCircle: CircleX,
  lock: Lock,
  flag: Flag,
  phone: Phone,
  chat: MessageSquare,
  user: UserRound,
  users: Users,
  file: FileText,
  pdf: FileText,
  folder: Folder,
  shield: Shield,
  shieldCheck: ShieldCheck,
  gavel: Gavel,
  scale: Scale,
  building: Building2,
  calendar: CalendarDays,
  mapPin: MapPin,
  info: Info,
  alert: TriangleAlert,
  bell: Bell,
  eye: Eye,
  edit: Pencil,
  trash: Trash2,
  plus: Plus,
  plusCircle: CirclePlus,
  upload: Upload,
  download: Download,
  share: Share2,
  copy: Copy,
  refresh: RefreshCw,
  arrowRight: ArrowRight,
  arrowUp: ArrowUp,
  chevronRight: ChevronRight,
  send: Send,
  save: Save,
  list: List,
  listChecks: ListChecks,
  receipt: Receipt,
  wallet: Wallet,
  truck: Truck,
  trend: TrendingUp,
  history: History,
  note: NotebookPen,
  sparkles: Sparkles,
  quote: Quote,
  video: Video,
  swap: ArrowLeftRight,
  play: Play,
  dashboard: LayoutGrid,
  bookmark: Bookmark,
  idCard: IdCard,
  link: Link,
  smile: Smile,
  mic: Mic,
  speaker: Volume2,
  headset: Headset,
  mail: Mail,
  mailCheck: MailCheck,
  smartphone: Smartphone,
};

export function Icon({ name, size, color, sw = 2 }: { name: IconName; size: number; color: string; sw?: number }) {
  const C = ICONS[name];
  return <C size={size} color={color} strokeWidth={sw} />;
}

const TONES: Record<Tone, { bg: string; fg: string }> = {
  green: { bg: c.greenSoft, fg: c.greenInk },
  peach: { bg: c.peach, fg: c.brownInk },
  cream: { bg: c.peachSoft, fg: c.brownInk },
  grey: { bg: c.tileGrey, fg: c.inkWarm },
  panel: { bg: c.panel, fg: c.inkWarm },
  help: { bg: c.helpGrey, fg: c.inkWarm },
  mint: { bg: courierGreen.recBg, fg: courierGreen.recInk },
  sage: { bg: dcShipmentPalette.statusPill, fg: c.greenInk },
  verified: { bg: dcDecidePalette.verifiedPill, fg: c.greenInk },
  sand: { bg: q.kickerSand, fg: c.brownInk },
  panelGreen: { bg: c.panel, fg: c.greenInk },
  greyGreen: { bg: c.tileGrey, fg: c.greenInk },
  red: { bg: status.redContainer, fg: status.onRedContainer },
  brown: { bg: c.brown, fg: ink.onBrand },
  blue: { bg: c.blueTile, fg: c.blueInk },
  violet: { bg: c.tileGrey, fg: c.brown },
  white: { bg: c.card, fg: c.inkWarm },
  dark: { bg: c.ink, fg: ink.onBrand },
};

const isPill = (r: unknown): r is Pill => typeof r === 'object' && r !== null && 'pill' in r;

export function PillTag({ p }: { p: Pill }) {
  const { t, s } = useK();
  const tone = TONES[p.tone];
  return (
    <View style={[s.pill, p.lg && s.pillLg, { backgroundColor: tone.bg }]}>
      {p.dot ? <View style={[s.pillDot, { backgroundColor: p.tone === 'green' ? status.active : tone.fg }]} /> : null}
      {p.icon ? <Icon name={p.icon} size={t.pillSize} color={tone.fg} /> : null}
      <Text style={[s.pillText, p.mono && s.mono, p.mono && s.pillMono, { color: tone.fg }]}>{p.pill}</Text>
    </View>
  );
}

function go(b: Btn) {
  if (b.back) return router.canGoBack() ? router.back() : router.replace('/matters' as Href);
  if (b.to) router.push(b.to);
}

function RightPart({ r }: { r?: Right }) {
  const { t, s } = useK();
  if (r === undefined) return null;
  if (typeof r === 'string') return <Text style={s.rightText}>{r}</Text>;
  // Wrapped so a row centres it (the pill itself is flex-start for column use).
  if (isPill(r))
    return (
      <View>
        <PillTag p={r} />
      </View>
    );
  if ('iconDisc' in r)
    return (
      <View style={s.rightDisc}>
        <Icon name={r.iconDisc} size={t.rightDiscIcon} color={c.inkWarm} />
      </View>
    );
  const content = (
    <View style={[s.link, r.chip && s.linkChip]}>
      {r.icon ? <Icon name={r.icon} size={t.chipIcon} color={r.chip ? c.inkWarm : c.brown} /> : null}
      <Text style={[s.linkText, r.chip && s.linkChipText]}>{r.link}</Text>
      {r.iconAfter ? <Icon name={r.iconAfter} size={t.chipIcon} color={c.brown} /> : null}
    </View>
  );
  return r.to ? (
    <Pressable accessibilityRole="link" onPress={() => router.push(r.to as Href)}>
      {content}
    </Pressable>
  ) : (
    content
  );
}

function HeadRow({ h }: { h: Head }) {
  const { t, s } = useK();
  return (
    <View style={[s.between, h.rule && s.headRule, h.rightTop && s.top]}>
      <View style={[s.row, s.flex, h.kicker && s.top, h.tile && s.headTileRow]}>
        {h.tile ? (
          <View style={[s.headTile, h.tile === 'peach' && s.headTilePeach, h.tile === 'disc' && s.headDisc, h.tile === 'brown' && s.headTileBrown]}>
            {h.icon ? (
              <Icon name={h.icon} size={h.tile === 'disc' ? t.headDiscIcon : t.headIcon} color={h.tile === 'brown' ? ink.onBrand : c.brown} />
            ) : null}
          </View>
        ) : h.icon ? (
          (
            <Icon name={h.icon} size={t.headIcon} color={c.ink} />
          )
        ) : null}
        <View style={s.flex}>
          {h.kicker ? (
            <View style={s.kicker}>
              <PillTag p={h.kicker} />
            </View>
          ) : null}
          <View style={[s.row, s.wrap]}>
            {h.title ? <Text style={h.caps ? s.caps : s.headTitle}>{h.title}</Text> : null}
            {h.pills?.map((p) => <PillTag key={p.pill} p={p} />)}
          </View>
          {h.sub ? <Text style={s.headSub}>{h.sub}</Text> : null}
        </View>
      </View>
      <RightPart r={h.right} />
    </View>
  );
}

export function Button({ b, flex, footer }: { b: Btn; flex?: boolean; footer?: boolean }) {
  const { t, s } = useK();
  const v = b.variant ?? 'primary';
  const bg: string =
    v === 'primary' ? c.brown : v === 'green' ? c.greenInk : v === 'disabled' ? q.disabled : v === 'soft' ? c.tileGrey : v === 'panel' ? c.panel : v === 'white' ? c.card : v === 'outline' ? c.card : 'transparent';
  const fg: string = v === 'primary' || v === 'green' || v === 'disabled' ? ink.onBrand : v === 'danger' ? advForensicRed.declineColour : c.ink;
  const nav = b.to !== undefined || b.back === true;
  const style: StyleProp<ViewStyle> = [
    v === 'link' ? s.btnLink : s.btn,
    { backgroundColor: bg },
    v === 'outline' && s.btnOutline,
    v === 'danger' && s.btnDanger,
    footer && s.btnFooter,
    flex && !b.hug && s.flex,
    b.hug && s.btnHug,
  ];
  return (
    <Pressable
      accessibilityRole="button"
      aria-disabled={v === 'disabled' || undefined}
      onPress={nav ? () => go(b) : undefined}
      style={style}
    >
      {b.icon ? <Icon name={b.icon} size={t.btnIcon} color={fg} /> : null}
      <Text style={[v === 'link' ? s.btnLinkText : s.btnText, footer && s.btnFooterText, { color: fg }]}>{b.label}</Text>
      {b.iconRight ? <Icon name={b.iconRight} size={t.btnIcon} color={fg} /> : null}
    </Pressable>
  );
}

function Disc({ state, deep }: { state: Step['state']; deep?: boolean }) {
  const { t, s } = useK();
  if (state === 'done')
    return (
      <View style={[s.disc, { backgroundColor: deep ? c.greenInk : status.active }]}>
        <Check size={t.stepGlyph} color={ink.onBrand} strokeWidth={3} />
      </View>
    );
  if (state === 'accent')
    return (
      <View style={[s.disc, s.discAccent]}>
        <CheckCheck size={t.stepGlyph} color={ink.onBrand} strokeWidth={2.6} />
      </View>
    );
  if (state === 'current')
    return (
      <View style={[s.disc, s.discRing]}>
        <View style={s.discCore} />
      </View>
    );
  if (state === 'active')
    return (
      <View style={[s.disc, { backgroundColor: c.peach }]}>
        <View style={[s.discDot, { backgroundColor: c.brownInk }]} />
      </View>
    );
  if (state === 'next')
    return (
      <View style={[s.disc, s.discTodo]}>
        <View style={[s.discDot, { backgroundColor: c.brown }]} />
      </View>
    );
  return (
    <View style={[s.disc, s.discTodo]}>
      <View style={[s.discDot, deep && s.discDotLight]} />
    </View>
  );
}

function Timeline({ steps, boxed, noRail, deep }: { steps: Step[]; boxed?: boolean; noRail?: boolean; deep?: boolean }) {
  const { t, s } = useK();
  // Each row is padded by half the row gap above and below, so the disc centres
  // on its title + sub (as every timeline in the batch draws it) and the two
  // rail halves either side of it meet the next row's.
  return (
    <View style={s.steps}>
      {steps.map((st, i) => (
        <View key={st.title} style={[s.step, boxed ? s.stepBoxed : s.stepRow]}>
          <View style={s.stepLeft}>
            <View style={[s.railHalf, (boxed || noRail || i === 0) && s.railHidden]} />
            <Disc state={st.state} deep={deep} />
            <View style={[s.railHalf, (boxed || noRail || i === steps.length - 1) && s.railHidden]} />
          </View>
          <View style={[s.flex, s.stepText, s.between]}>
            <View style={s.flex}>
              <Text style={[s.stepTitle, st.state === 'todo' && deep && s.muted, st.state === 'accent' && s.accentTitle]}>{st.title}</Text>
              {st.sub ? <Text style={[s.stepSub, st.subGreen && s.green, st.state === 'todo' && deep && s.mutedSub]}>{st.sub}</Text> : null}
            </View>
            <RightPart r={st.right} />
          </View>
        </View>
      ))}
    </View>
  );
}

function Field({ b }: { b: Extract<Block, { k: 'field' }> }) {
  const { t, s } = useK();
  return (
    <View>
      <View style={s.between}>
        <Text style={s.fieldLabel}>
          {b.label}
          {b.req ? <Text style={s.req}> *</Text> : null}
        </Text>
        <RightPart r={b.right} />
      </View>
      <View style={[s.field, b.multiline && s.area]}>
        {b.icon ? <Icon name={b.icon} size={t.chipIcon} color={c.inkWarm} /> : null}
        {b.prefix ? <Text style={s.fieldText}>{b.prefix}</Text> : null}
        <Text style={[s.fieldText, s.flex, !b.value && s.placeholder]}>{b.value ?? b.placeholder}</Text>
        {b.iconRight ? <Icon name={b.iconRight} size={t.chipIcon} color={c.inkWarm} /> : null}
      </View>
      {b.foot ? (
        <View style={[s.between, s.hintRow]}>
          <Text style={[s.hint, s.flex]}>{b.foot[0]}</Text>
          <Text style={s.hint}>{b.foot[1]}</Text>
        </View>
      ) : null}
      {b.hint ? <Text style={[s.hint, s.hintRow]}>{b.hint}</Text> : null}
    </View>
  );
}

export function BlockView({ b }: { b: Block }): ReactNode {
  const { t, s } = useK();
  switch (b.k) {
    case 'card': {
      const bg: string =
        b.tone === 'panel'
          ? c.panel
          : b.tone === 'cream'
            ? c.peachSoft
            : b.tone === 'peach'
              ? c.peachNote
              : b.tone === 'green'
                ? c.greenSoft
                : b.tone === 'payPeach'
                  ? dcDocumentsPalette.tilePeach
                  : c.card;
      return (
        <View style={[s.card, { backgroundColor: bg }, b.tone === 'outline' && s.outline, b.pad !== undefined && { padding: t[b.pad] }]}>
          {b.head ? <HeadRow h={b.head} /> : null}
          {b.blocks.map((x, i) => (
            <View
              key={i}
              style={{
                marginTop: i > 0 || b.head ? (t[x.top ?? 'cardInnerGap'] ?? t.cardInnerGap) : 0,
                marginBottom: x.bottom ? t[x.bottom] : 0,
              }}
            >
              <BlockView b={x} />
            </View>
          ))}
        </View>
      );
    }
    case 'hero': {
      const disc: string =
        b.tone === 'green'
          ? c.greenTile
          : b.tone === 'mint'
            ? courierGreen.recBg
            : b.tone === 'deepGreen'
            ? q.heroHalo
            : b.tone === 'red'
              ? status.redContainer
              : b.tone === 'grey'
                ? c.tileGrey
                : c.peach;
      const core: string =
        b.tone === 'green'
          ? status.active
          : b.tone === 'mint' || b.tone === 'deepGreen'
            ? c.greenInk
            : b.tone === 'red'
              ? advForensicRed.declineColour
              : b.tone === 'grey'
                ? c.inkMuted
                : c.brown;
      return (
        <View style={[s.hero, b.left && s.heroLeft]}>
          <View style={[s.heroDisc, { backgroundColor: disc }]}>
            {b.flat ? (
              <Icon name={b.icon} size={t.heroFlatGlyph} color={c.brownInk} sw={2.2} />
            ) : (
              <View style={[s.heroCore, { backgroundColor: core }]}>
                <Icon name={b.icon} size={t.heroGlyph} color={ink.onBrand} sw={2.6} />
              </View>
            )}
            {b.badge ? <View style={s.heroBadge} /> : null}
          </View>
          {b.pill ? (
            <View style={s.heroPill}>
              <PillTag p={b.pill} />
            </View>
          ) : null}
          <Text style={[s.heroTitle, b.left && s.leftText]}>{b.title}</Text>
          {b.sub ? <Text style={[s.heroSub, b.left && s.leftText]}>{b.sub}</Text> : null}
        </View>
      );
    }
    case 'lead':
      return (
        <View style={s.lead}>
          {b.pill ? <PillTag p={b.pill} /> : null}
          <View style={s.between}>
            <View style={s.flex}>
              {b.title ? <Text style={s.leadTitle}>{b.title}</Text> : null}
              {b.text ? <Text style={[s.leadText, b.title && s.leadTextTop]}>{b.text}</Text> : null}
            </View>
            <View style={s.leadRight}>
              <RightPart r={b.right} />
            </View>
          </View>
        </View>
      );
    case 'label':
      return (
        <View style={[s.between, b.inset && s.labelInset]}>
          <View style={[s.row, s.flex]}>
            {b.dot ? <View style={[s.labelDot, { backgroundColor: status.active }]} /> : null}
            <Text style={s.caps}>{b.text}</Text>
            {b.pills?.map((p) => <PillTag key={p.pill} p={p} />)}
          </View>
          <RightPart r={b.right} />
        </View>
      );
    case 'text':
      return (
        <View style={s.row}>
          {b.icon ? <Icon name={b.icon} size={b.iconSize ? t[b.iconSize] : t.textIcon} color={b.tone === 'green' ? c.greenInk : c.brownInk} /> : null}
          <Text
            style={[
              s.text,
              !b.pill && s.flex,
              b.tone === 'muted' && s.mutedText,
              b.tone === 'small' && s.small,
              b.tone === 'quote' && s.quote,
              b.tone === 'center' && s.center,
              b.tone === 'strong' && s.strong,
              b.tone === 'green' && s.greenText,
              b.tone === 'title' && s.titleText,
              b.tone === 'label' && s.labelText,
              b.size !== undefined && { fontSize: t[b.size], lineHeight: t[b.size + 'Line'] },
            ]}
          >
            {b.parts
              ? b.parts.map((x) =>
                  x.bold ? (
                    <Text key={x.t} style={s.partBold}>
                      {x.t}
                    </Text>
                  ) : x.muted ? (
                    <Text key={x.t} style={s.partMuted}>
                      {x.t}
                    </Text>
                  ) : (
                    x.t
                  ),
                )
              : b.t}
          </Text>
          {b.pill ? <PillTag p={b.pill} /> : null}
        </View>
      );
    case 'rows':
      return (
        <View style={s.rows}>
          {b.rows.map(([l, v, m]) => (
            <View key={l} style={[s.between, s.kv, b.divided && s.divided]}>
              <Text style={s.kvLabel}>{l}</Text>
              <Text style={[s.kvValue, m === 'mono' && s.mono, m === 'green' && s.green, m === 'quote' && s.quoteInline]}>{v}</Text>
            </View>
          ))}
        </View>
      );
    case 'grid': {
      const cellView = (cell: (typeof b.cells)[number], style?: StyleProp<ViewStyle>) => (
        <View key={cell.label + cell.value} style={[style, (cell.sideIcon || cell.iconRight) && s.sideIconCell]}>
          {cell.sideIcon ? <Icon name={cell.sideIcon} size={t.sideIcon} color={c.inkWarm} /> : null}
          <View style={(cell.sideIcon || cell.iconRight) && s.flex}>
          <View style={s.row}>
            {cell.icon ? <Icon name={cell.icon} size={t.labelSize} color={c.inkMuted} /> : null}
            <Text style={[s.cellLabel, b.caps && s.cellCaps]}>{cell.label}</Text>
          </View>
          <Text style={[s.cellValue, cell.tone === 'green' && s.green, cell.tone === 'mono' && s.mono, cell.tone === 'muted' && s.mutedValue]}>
            {cell.value}
          </Text>
          {cell.sub ? <Text style={s.cellSub}>{cell.sub}</Text> : null}
          </View>
          {cell.iconRight ? (
            <View style={s.cellIconRight}>
              <Icon name={cell.iconRight} size={t.headIcon} color={c.inkWarm} />
            </View>
          ) : null}
        </View>
      );
      if (b.boxed === 'columns') {
        // design/363: each COLUMN is one panel, but the rows line up across both.
        const rows = b.cells.reduce<(typeof b.cells)[]>((acc, cell, i) => (i % 2 ? acc[acc.length - 1].push(cell) : acc.push([cell]), acc), []);
        return (
          <View style={s.colGrid}>
            {rows.map((row, r) => (
              <View key={r} style={s.colRow}>
                {row.map((cell) =>
                  cellView(cell, [s.colCell, r === 0 && s.colCellTop, r === rows.length - 1 && s.colCellBottom]),
                )}
              </View>
            ))}
          </View>
        );
      }
      return (
        <View style={[s.grid, b.boxed === 'panel' && s.gridPanel]}>
          {b.cells.map((cell) => cellView(cell, [s.cell, b.boxed === 'cells' && s.cellBoxed, cell.wide && s.cellWide]))}
        </View>
      );
    }
    case 'person':
      return (
        <View style={[s.row, s.person, b.boxed && s.personBoxed]}>
          <View style={[s.avatar, b.greyDisc && s.greyDisc]}>
            {b.initials ? <Text style={s.avatarText}>{b.initials}</Text> : <Icon name={b.icon ?? 'user'} size={t.headIcon} color={c.brown} />}
          </View>
          <View style={s.flex}>
            <View style={[s.row, s.wrap]}>
              <Text style={[s.name, b.small && s.nameSmall]}>{b.name}</Text>
              {b.tag ? <PillTag p={b.tag} /> : null}
            </View>
            {b.sub ? (
              <View style={s.row}>
                {b.subIcon ? <Icon name={b.subIcon} size={t.personSubSize} color={c.inkWarm} /> : null}
                <Text style={[s.personSub, b.small && s.personSubSmall]}>{b.sub}</Text>
              </View>
            ) : null}
            {b.meta ? (
              <View style={s.row}>
                {b.metaIcon ? <Icon name={b.metaIcon} size={t.personSubSize} color={c.inkWarm} /> : null}
                <Text style={s.personSub}>{b.meta}</Text>
              </View>
            ) : null}
          </View>
          {b.call ? (
            // ⚠ UNSCOPED — no telephony.
            <View style={s.callDisc}>
              <Phone size={t.chipIcon} color={c.brown} strokeWidth={2} />
            </View>
          ) : null}
          {b.chips?.map((x) => <SmallChip key={x.label} b={x} />)}
        </View>
      );
    case 'timeline':
      return <Timeline steps={b.steps} boxed={b.boxed} noRail={b.noRail} deep={b.deep} />;
    case 'docs':
      return (
        <View style={s.docList}>
          {b.items.map((d) => (
            <View key={d.name} style={[s.doc, b.pdf && s.docPdf]}>
              <View style={[s.row, b.pdf && s.docPdfRow]}>
                {b.pdf ? (
                  <PdfStackIcon size={t.pdfIcon} color={advForensicRed.declineColour} />
                ) : (
                  <View style={s.docTile}>
                    <Icon name={d.icon ?? 'pdf'} size={t.docIcon} color={advForensicRed.declineColour} />
                  </View>
                )}
                <View style={s.flex}>
                  <Text style={s.docName}>{d.name}</Text>
                  {d.meta ? <Text style={s.docMeta}>{d.meta}</Text> : null}
                </View>
                {d.right === 'tick' ? (
                  <Check size={t.docIcon} color={c.greenInk} strokeWidth={2.4} />
                ) : d.right === 'circleTick' ? (
                  <View style={[s.disc, { backgroundColor: status.active }]}>
                    <Check size={t.stepGlyph} color={ink.onBrand} strokeWidth={3} />
                  </View>
                ) : (
                  <RightPart r={d.right} />
                )}
                {/* ⚠ UNSCOPED — no document viewer. */}
                {d.btn ? (
                  <View style={[s.docBtn, b.pdf && s.docBtnGrey]}>
                    <Text style={s.docBtnText}>{d.btn}</Text>
                  </View>
                ) : null}
              </View>
              {d.actions ? (
                <View style={[s.row, s.docActions]}>
                  {d.actions.map((a) => (
                    <View key={a} style={[s.docBtn, s.flex]}>
                      <Text style={s.docBtnText}>{a}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ))}
        </View>
      );
    case 'checklist':
      return (
        <View style={s.docs}>
          {b.items.map((it) => (
            <View key={it.title} style={[s.check, it.state === 'progress' && s.checkProgress]}>
              <View style={[s.checkMark, it.state === 'done' && { backgroundColor: status.active }]}>
                {it.state === 'done' ? (
                  <Check size={t.stepGlyph} color={ink.onBrand} strokeWidth={3} />
                ) : it.state === 'info' ? (
                  <Info size={t.chipIcon} color={c.inkWarm} strokeWidth={2} />
                ) : it.icon ? (
                  <Icon name={it.icon} size={t.chipIcon} color={c.brown} />
                ) : null}
              </View>
              <View style={s.flex}>
                <View style={[s.row, s.wrap]}>
                  <Text style={s.checkTitle}>{it.title}</Text>
                  {it.tag ? <PillTag p={it.tag} /> : null}
                </View>
                {it.sub ? <Text style={s.checkSub}>{it.sub}</Text> : null}
              </View>
              <RightPart r={it.right} />
              {it.edit ? (
                // ⚠ UNSCOPED — edit / delete draw only.
                <View style={s.row}>
                  <Pencil size={t.chipIcon} color={c.inkWarm} strokeWidth={2} />
                  <Trash2 size={t.chipIcon} color={advForensicRed.declineColour} strokeWidth={2} />
                </View>
              ) : null}
            </View>
          ))}
        </View>
      );
    case 'field':
      return <Field b={b} />;
    case 'fieldRow':
      return (
        <View style={s.row}>
          {b.fields.map((f) => (
            <View key={f.label} style={s.flex}>
              <Field b={{ k: 'field', ...f }} />
            </View>
          ))}
        </View>
      );
    case 'choices':
      return (
        <View style={s.docs}>
          {b.items.map((ch) => (
            <View key={ch.label} style={[s.choice, ch.selected && s.choiceOn]}>
              <View style={[s.radio, ch.selected && s.radioOn]}>{ch.selected ? <Check size={t.stepGlyph} color={ink.onBrand} strokeWidth={3} /> : null}</View>
              <View style={s.flex}>
                <Text style={s.checkTitle}>{ch.label}</Text>
                {ch.sub ? <Text style={s.checkSub}>{ch.sub}</Text> : null}
              </View>
              <RightPart r={ch.right} />
            </View>
          ))}
        </View>
      );
    case 'segment':
      return (
        <View>
          {b.label ? <Text style={s.fieldLabel}>{b.label}</Text> : null}
          <View style={[s.segment, b.label && s.fieldTop]}>
            {b.items.map((x, i) => (
              <View key={x} style={[s.segItem, i === b.selected && s.segOn]}>
                <Text style={[s.segText, i === b.selected && s.segTextOn]}>{x}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    case 'check':
      return (
        <View style={[s.row, s.top]}>
          <View style={[s.box, b.checked && s.boxOn]}>{b.checked ? <Check size={t.stepGlyph} color={ink.onBrand} strokeWidth={3} /> : null}</View>
          <View style={[s.flex, s.checkBody]}>
            <Text style={s.checkTitle}>{b.title}</Text>
            {b.sub ? <Text style={s.checkSub}>{b.sub}</Text> : null}
            {b.blocks?.map((x, i) => (
              <BlockView key={i} b={x} />
            ))}
          </View>
        </View>
      );
    case 'bars':
      return (
        <View style={s.row}>
          {b.steps.map((st) => (
            <View key={st.label} style={[s.flex, b.variant === 'tiles' && s.barTile]}>
              {b.variant === 'discs' || b.variant === 'tiles' ? (
                <View style={s.center}>
                  <Disc state={st.state === 'done' ? 'done' : st.state === 'current' ? 'active' : 'todo'} />
                </View>
              ) : b.variant === 'chips' ? null : (
                <View
                  style={[
                    s.bar,
                    { backgroundColor: st.state === 'done' ? status.active : st.state === 'bad' ? advForensicRed.declineColour : st.state === 'current' ? c.brown : c.rail },
                  ]}
                />
              )}
              <Text style={[s.barLabel, b.variant === 'chips' && s.barChip, st.state === 'current' && s.strong, st.state === 'bad' && s.red]}>{st.label}</Text>
              {st.sub ? <Text style={[s.barLabel, st.state === 'done' && s.green]}>{st.sub}</Text> : null}
            </View>
          ))}
        </View>
      );
    case 'numbered':
      return (
        <View style={s.docs}>
          {b.items.map((x, i) => (
            <View key={x} style={[s.row, s.top]}>
              <View style={s.num}>
                <Text style={s.numText}>{i + 1}</Text>
              </View>
              <Text style={[s.text, s.flex]}>{x}</Text>
            </View>
          ))}
        </View>
      );
    case 'banner': {
      const bg: string = b.tone === 'grey' ? c.panel : b.tone === 'cream' ? c.peachSoft : b.tone === 'green' ? c.greenSoft : b.tone === 'white' ? dcDocsNeededPalette.physPanel : b.tone === 'red' ? status.redContainer : 'transparent';
      return (
        <View style={[s.row, s.top, s.banner, { backgroundColor: bg }, b.tone === 'none' && s.bannerBare]}>
          {b.icon ? <Icon name={b.icon} size={t.bannerIcon} color={b.tone === 'green' ? c.greenInk : b.tone === 'red' ? status.onRedContainer : c.inkWarm} /> : null}
          <View style={s.flex}>
            {b.title ? <Text style={s.bannerTitle}>{b.title}</Text> : null}
            {b.parts ? (
              <Text style={s.bannerText}>
                {b.parts.map((x) =>
                  x.bold ? (
                    <Text key={x.t} style={s.partBold}>
                      {x.t}
                    </Text>
                  ) : (
                    x.t
                  ),
                )}
              </Text>
            ) : (
              <Text style={[s.bannerText, b.tone === 'red' && { color: status.onRedContainer }]}>{b.text}</Text>
            )}
          </View>
        </View>
      );
    }
    case 'pills':
      return (
        <View style={[s.row, s.wrap]}>
          {b.items.map((p) => (
            <PillTag key={p.pill} p={p} />
          ))}
        </View>
      );
    case 'button':
      return <Button b={b.btn} />;
    case 'buttonRow':
      return (
        <View style={s.row}>
          {b.btns.map((x) => (
            <Button key={x.label} b={x} flex />
          ))}
        </View>
      );
    case 'amount':
      return (
        <View style={[s.amountBox, b.tone === 'payPeach' && { backgroundColor: dcDocumentsPalette.tilePeach }, b.tone === 'none' && s.amountBare]}>
          {b.valueRight ? (
            <View style={s.between}>
              <View style={s.flex}>
                <Text style={s.amountCaps}>{b.label}</Text>
                {b.sub ? <Text style={s.cellSub}>{b.sub}</Text> : null}
              </View>
              <Text style={[s.amount, s.amountRight, b.big && s.amountBig]}>{b.value}</Text>
            </View>
          ) : (
            <View style={s.between}>
              <View style={s.flex}>
                {b.label ? <Text style={s.cellLabel}>{b.label}</Text> : null}
                <Text style={[s.amount, b.big && s.amountBig]}>
                  {b.value}
                  {b.suffix ? <Text style={s.amountSuffix}> {b.suffix}</Text> : null}
                </Text>
                {b.sub ? <Text style={s.cellSub}>{b.sub}</Text> : null}
              </View>
              {b.side ? (
                <View style={s.amountSide}>
                  <Text style={s.cellLabel}>{b.side[0]}</Text>
                  <Text style={[s.cellValue, s.rightAlign]}>{b.side[1]}</Text>
                </View>
              ) : (
                <RightPart r={b.right} />
              )}
            </View>
          )}
        </View>
      );
    case 'upload':
      return (
        // ⚠ UNSCOPED — no file picker, nothing uploads.
        <View style={s.upload}>
          <View style={s.uploadDisc}>
            <Icon name={b.icon ?? 'upload'} size={t.headIcon} color={c.brown} />
          </View>
          <Text style={[s.checkTitle, s.centerText]}>{b.title}</Text>
          {b.sub ? <Text style={[s.checkSub, s.centerText]}>{b.sub}</Text> : null}
          {b.btn ? (
            <View style={s.uploadBtn}>
              <Button b={b.btn} />
            </View>
          ) : null}
        </View>
      );
    case 'quote':
      return (
        <View style={s.quoteBox}>
          <Text style={s.quote}>{b.t}</Text>
        </View>
      );
    case 'chips':
      return (
        <View style={[s.row, s.wrap, b.tiles && s.tiles, b.spread && s.spread]}>
          {b.items.map((x) => (b.tiles ? <Tile key={x.label} b={x} /> : <SmallChip key={x.label} b={x} grey={b.spread} />))}
        </View>
      );
    case 'info':
      return (
        <View style={[s.row, s.info]}>
          <View style={s.infoDisc}>
            <Icon name={b.icon} size={t.infoIcon} color={c.ink} />
          </View>
          <View style={s.flex}>
            <Text style={s.infoLabel}>{b.label}</Text>
            <Text style={s.infoValue}>{b.value}</Text>
          </View>
        </View>
      );
    case 'scrollText':
      return <ScrollText b={b} />;
    case 'footRow':
      return (
        <View style={[s.between, s.footRow]}>
          <View style={[s.row, s.flex]}>
            {b.icon ? <Icon name={b.icon} size={t.footRowIcon} color={c.inkWarm} /> : null}
            <Text style={s.footRowText}>{b.t}</Text>
          </View>
          <RightPart r={b.right} />
        </View>
      );
    case 'gap':
      return <View style={{ height: b.h }} />;
  }
}

/**
 * A fixed-height box whose text scrolls, with the drawn track and thumb (364).
 * The export clips its text under the thumb; here it wraps short of it.
 */
function ScrollText({ b }: { b: Extract<Block, { k: 'scrollText' }> }) {
  const { t, s } = useK();
  return (
    <View style={[s.scrollBox, b.bare && s.scrollBare, { height: t[b.box] }]}>
      <ScrollView style={s.flex} contentContainerStyle={s.scrollBody} showsVerticalScrollIndicator={false} nestedScrollEnabled>
        {b.paras.map((p, i) =>
          typeof p === 'string' ? (
            <Text key={i} style={[s.scrollText, b.large && s.scrollLarge]}>
              {p}
            </Text>
          ) : (
            <View key={i} style={i > 0 && s.scrollParaGap}>
              {/* The bullet sits in the line: wrapped lines return to the left edge, as drawn. */}
              <Text style={[s.scrollText, p.stack && s.scrollStack, p.bullet && s.scrollBulletText]}>
                {p.bullet ? <Text style={s.scrollBulletMark}>{'  •  '}</Text> : null}
                <Text style={s.scrollLabel}>{p.label}</Text>
                {p.stack ? '\n' : ''}
                {p.text}
              </Text>
            </View>
          ),
        )}
      </ScrollView>
      <View style={s.scrollTrack}>
        <View style={s.scrollThumb} />
      </View>
    </View>
  );
}

function SmallChip({ b, grey }: { b: Btn; grey?: boolean }) {
  const { t, s } = useK();
  const nav = b.to !== undefined || b.back === true;
  return (
    <Pressable accessibilityRole="button" onPress={nav ? () => go(b) : undefined} style={[s.chip, grey && s.chipGrey]}>
      {b.icon ? <Icon name={b.icon} size={t.chipIcon} color={c.ink} /> : null}
      <Text style={[s.chipText, grey && s.chipGreyText]}>{b.label}</Text>
    </Pressable>
  );
}

function Tile({ b }: { b: Btn }) {
  const { t, s } = useK();
  return (
    // ⚠ UNSCOPED — quick actions draw only.
    <View style={s.tile}>
      <View style={s.uploadDisc}>{b.icon ? <Icon name={b.icon} size={t.headIcon} color={c.inkWarm} /> : null}</View>
      <Text style={s.checkTitle}>{b.label}</Text>
    </View>
  );
}

/** The drawn "STATE MODE / PREVIEW STATE" switcher (363, 369, 370). */
export function StateSwitch({
  label,
  options,
  value,
  onChange,
  dark,
  inline,
}: {
  label?: string;
  options: string[];
  value: number;
  onChange: (i: number) => void;
  dark?: boolean;
  /** A bare centred pill (370), no band. */
  inline?: boolean;
}) {
  const { t, s } = useK();
  return (
    <View style={[inline ? s.switchInline : s.switchBar, dark && s.switchDark]}>
      {label ? (
        <View style={s.row}>
          <SlidersHorizontal size={t.switchIcon} color={dark ? q.callInk : c.inkWarm} strokeWidth={2} />
          <Text style={[s.switchLabel, dark && { color: q.callInk }]}>{label}</Text>
        </View>
      ) : null}
      <View style={[s.switchPill, inline && s.switchPillInline, dark && { backgroundColor: q.callTrack }]} accessibilityRole="tablist">
        {options.map((o, i) => (
          <Pressable
            key={o}
            accessibilityRole="tab"
            aria-selected={i === value}
            onPress={() => onChange(i)}
            style={[s.switchItem, inline && s.switchItemInline, i === value && (dark ? s.switchOnDark : inline ? s.switchOnInline : s.switchOn)]}
          >
            <Text style={[s.switchText, dark && { color: q.callInk }, i === value && (dark ? s.switchTextOnDark : s.switchTextOn)]}>{o}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/** A court screen: header, optional drawn switcher, sections, optional pinned deadline bar. */
type ScreenProps = {
  spec: CourtSpec;
  /** That screen's measured token block (constants/tokens/advCourt.ts). */
  tokens?: Readonly<Record<string, number>>;
  state?: number;
  onState?: (i: number) => void;
  overlay?: ReactNode;
};

export function CourtScreen(props: ScreenProps) {
  return (
    <CourtTokensProvider tokens={props.tokens}>
      <ScreenBody {...props} />
    </CourtTokensProvider>
  );
}

function ScreenBody({ spec, state, onState, overlay }: ScreenProps) {
  const { t, s } = useK();
  const insets = useSafeAreaInsets();
  return (
    <View style={s.page}>
      <CourierHeader
        title={spec.title}
        sub={spec.sub}
        titleChip={spec.headerPill ? <PillTag p={spec.headerPill} /> : spec.chip}
        padTop={t.headerPadTop}
        right={spec.headerRight ? <View style={s.headerRight}><PillTag p={spec.headerRight} /></View> : undefined}
        avatar={spec.avatar ?? true}
        center={spec.centerTitle}
        plainChevron={spec.chevron}
        backHref={'/matters' as Href}
      />
      {spec.switcher && onState && !spec.switcher.inline ? (
        <StateSwitch label={spec.switcher.label} options={spec.switcher.options} value={state ?? 0} onChange={onState} />
      ) : null}
      <ScrollView contentContainerStyle={[s.body, spec.switcher?.inline && s.bodyInline, { paddingBottom: (spec.deadline ? t.deadlineH : spec.footer ? t.footerH : 0) + insets.bottom + t.bottomPad }]}>
        {spec.switcher?.inline && onState ? (
          <View style={s.inlineSwitch}>
            <StateSwitch options={spec.switcher.options} value={state ?? 0} onChange={onState} inline />
          </View>
        ) : null}
        {spec.blocks.map((b, i) => (
          <View
            key={i}
            style={{
              marginTop: i > 0 ? (t[b.top ?? 'gap'] ?? t.gap) : spec.switcher?.inline ? t.inlineSwitchGap : 0,
              marginBottom: b.bottom ? t[b.bottom] : 0,
            }}
          >
            <BlockView b={b} />
          </View>
        ))}
      </ScrollView>
      {spec.deadline ? (
        <View style={[s.deadline, { paddingBottom: insets.bottom + t.cardPad }]}>
          <View style={s.flex}>
            <Text style={s.deadlineLabel}>{spec.deadline.label}</Text>
            <View style={s.row}>
              <View style={[s.pillDot, { backgroundColor: status.active }]} />
              <Text style={s.deadlineValue}>{spec.deadline.value}</Text>
            </View>
          </View>
          <Button b={spec.deadline.btn} />
        </View>
      ) : null}
      {spec.footer ? (
        <View style={[s.footer, spec.footerStack && s.footerStack, { paddingBottom: insets.bottom + t.footerPadBottom }]}>
          {spec.footer.map((x) => (
            <Button key={x.label} b={x} flex={!spec.footerStack} footer />
          ))}
        </View>
      ) : null}
      {overlay}
    </View>
  );
}

/** A screen with a drawn two-state switcher; each state is its own spec. */
export function SwitchedCourtScreen({
  specs,
  tokens,
  initial = 0,
}: {
  specs: CourtSpec[];
  tokens?: Readonly<Record<string, number>>[];
  initial?: number;
}) {
  const [i, setI] = useState(initial);
  return <CourtScreen spec={{ ...specs[i], switcher: specs[0].switcher }} tokens={tokens?.[i]} state={i} onState={setI} />;
}

function makeStyles(t: CourtTokens) {
  return StyleSheet.create({
  page: { flex: 1, backgroundColor: c.page },
  body: { paddingHorizontal: t.padX, paddingTop: t.top },
  flex: { flex: 1, flexShrink: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: t.headGap },
  top: { alignItems: 'flex-start' },
  wrap: { flexWrap: 'wrap' },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.headGap },
  center: { alignItems: 'center' },
  centerText: { textAlign: 'center' },
  leftText: { textAlign: 'left' },
  rightAlign: { textAlign: 'right' },
  muted: { color: c.inkMuted },
  green: { color: c.greenInk },
  red: { color: advForensicRed.declineColour },
  strong: { fontFamily: font.appSemi, color: c.ink },

  card: { borderRadius: t.cardRadius, padding: t.cardPad },
  outline: { borderWidth: 1, borderColor: c.rail },
  headTile: {
    width: t.headTile,
    height: t.headTile,
    borderRadius: t.headTileRadius,
    backgroundColor: c.tileGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headTitle: { fontFamily: font.appSemi, fontSize: t.headTitleSize, color: c.ink },
  headSub: { marginTop: t.headSubTop, maxWidth: t.headSubMax, fontFamily: font.appBody, fontSize: t.headSubSize, lineHeight: t.headSubLine, color: c.inkWarm },
  caps: { fontFamily: font.appSemi, fontSize: t.capsSize, letterSpacing: t.capsSpacing, color: c.inkWarm, textTransform: 'uppercase' },
  rightText: { fontFamily: font.appSemi, fontSize: t.rightSize, color: c.inkWarm, textAlign: 'right', flexShrink: 1 },
  link: { flexDirection: 'row', alignItems: 'center', gap: t.pillGap },
  linkChip: { minHeight: t.linkChipH, paddingHorizontal: t.linkChipPadX, borderRadius: t.linkChipRadius, backgroundColor: c.panel },
  linkChipText: { color: c.inkWarm },
  labelInset: { paddingHorizontal: t.labelInset },
  labelDot: { width: t.labelDot, height: t.labelDot, borderRadius: t.labelDot / 2 },
  partBold: { fontFamily: font.appSemi, color: c.ink },
  cellIconRight: { justifyContent: 'center' },
  amountSuffix: { fontFamily: font.appBody, fontSize: t.amountSuffixSize, color: c.inkWarm },
  spread: { justifyContent: 'space-between' },
  chipGrey: { minHeight: t.greyChipH, paddingHorizontal: t.greyChipPadX, borderRadius: t.greyChipRadius, backgroundColor: c.tileGrey, borderWidth: 0 },
  chipGreyText: { fontSize: t.greyChipSize },
  info: { gap: t.infoGap, borderRadius: t.panelRadius, paddingHorizontal: t.panelPad, paddingVertical: t.infoPadY, backgroundColor: c.tileGrey },
  infoDisc: { width: t.infoDisc, height: t.infoDisc, borderRadius: t.infoDisc / 2, backgroundColor: c.card, alignItems: 'center', justifyContent: 'center' },
  infoLabel: { fontFamily: font.appBody, fontSize: t.infoLabelSize, color: c.inkWarm },
  infoValue: { marginTop: t.infoValueTop, fontFamily: font.appSemi, fontSize: t.infoValueSize, lineHeight: t.infoValueLine, color: c.ink },
  scrollBox: { flexDirection: 'row', borderRadius: t.panelRadius, backgroundColor: c.panel, paddingLeft: t.scrollPadX, paddingRight: t.scrollTrackInset },
  scrollBare: { paddingLeft: 0, paddingRight: 0, backgroundColor: 'transparent', gap: t.scrollBareGap },
  scrollBody: { paddingVertical: t.scrollPadY, paddingRight: t.scrollGap },
  scrollText: { fontFamily: font.appBody, fontSize: t.scrollSize, lineHeight: t.scrollLine, color: c.ink },
  scrollStack: { lineHeight: t.scrollStackLine },
  scrollBulletText: { lineHeight: t.scrollBulletLine },
  scrollLarge: { fontSize: t.scrollLargeSize, lineHeight: t.scrollLargeLine },
  scrollLabel: { fontFamily: font.appSemi, color: c.brownInk },
  scrollParaGap: { marginTop: t.scrollParaGap },
  scrollBulletMark: { color: c.brownInk },
  scrollTrack: { width: t.scrollTrackW, marginVertical: t.scrollTrackY, borderRadius: t.scrollTrackW / 2, backgroundColor: colors.appBg },
  scrollThumb: { height: t.scrollThumbH, borderRadius: t.scrollTrackW / 2, backgroundColor: q.thumb },
  footRow: { paddingTop: t.footRowPadTop, borderTopWidth: 1, borderTopColor: c.panel },
  footRowText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.footRowSize, color: c.inkWarm },
  headTileBrown: { backgroundColor: c.brown },
  headTileRow: { gap: t.headTileGap },
  rightDisc: { width: t.rightDisc, height: t.rightDisc, borderRadius: t.rightDisc / 2, backgroundColor: c.tileGrey, alignItems: 'center', justifyContent: 'center' },
  footerStack: { flexDirection: 'column', gap: t.footerStackGap },
  kicker: { marginBottom: t.kickerGap },
  heroBadge: {
    position: 'absolute',
    top: t.heroBadgeTop,
    right: t.heroBadgeRight,
    width: t.heroBadge,
    height: t.heroBadge,
    borderRadius: t.heroBadge / 2,
    backgroundColor: c.brownInk,
  },
  discAccent: { backgroundColor: status.active },
  discTodo: { backgroundColor: c.helpGrey },
  discDotLight: { backgroundColor: q.todoDot },
  accentTitle: { color: c.greenInk },
  partMuted: { color: c.inkMuted },
  labelText: { fontSize: t.labelTextSize, lineHeight: t.labelTextLine },
  cellCaps: { fontFamily: font.appSemi, fontSize: t.cellCapsSize, letterSpacing: t.capsSpacing, textTransform: 'uppercase' },
  bannerTitle: { fontFamily: font.appSemi, fontSize: t.bannerTitleSize, color: c.ink },
  bannerText: { fontFamily: font.appBody, fontSize: t.bannerSize, lineHeight: t.bannerLine, color: c.inkWarm },
  bodyInline: {},
  inlineSwitch: { alignItems: 'center' },
  switchInline: { alignItems: 'center' },
  switchPillInline: { marginLeft: 0, padding: t.inlineSwitchPad, borderRadius: t.inlineSwitchH / 2 },
  switchItemInline: { minHeight: t.inlineSwitchH - 2 * t.inlineSwitchPad, paddingHorizontal: t.inlineSwitchPadX, borderRadius: t.inlineSwitchH / 2 },
  switchOnInline: { backgroundColor: c.page },
  headRule: { paddingBottom: t.headRulePad, borderBottomWidth: 1, borderBottomColor: c.rail },
  headTilePeach: { backgroundColor: c.peach },
  headDisc: { width: t.headDisc, height: t.headDisc, borderRadius: t.headDisc / 2, backgroundColor: dcDocumentsPalette.tilePeach },
  pillMono: { fontSize: t.pillMonoSize },
  headerRight: { marginRight: t.headerRightGap },
  btnHug: { paddingHorizontal: t.hugPadX },
  linkText: { fontFamily: font.appSemi, fontSize: t.smallSize, color: c.brown },

  pill: {
    minHeight: t.pillH,
    paddingHorizontal: t.pillPadX,
    borderRadius: t.pillRadius,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap,
    alignSelf: 'flex-start',
    flexShrink: 1,
  },
  pillLg: { minHeight: t.pillLgH, paddingHorizontal: t.pillLgPadX, borderRadius: t.pillLgH / 2 },
  pillDot: { width: t.pillDot, height: t.pillDot, borderRadius: t.pillDot / 2 },
  pillText: { fontFamily: font.appSemi, fontSize: t.pillSize, flexShrink: 1 },

  hero: { alignItems: 'center' },
  heroLeft: { alignItems: 'flex-start' },
  heroDisc: { width: t.heroDisc, height: t.heroDisc, borderRadius: t.heroDisc / 2, alignItems: 'center', justifyContent: 'center' },
  heroCore: { width: t.heroDiscInner, height: t.heroDiscInner, borderRadius: t.heroDiscInner / 2, alignItems: 'center', justifyContent: 'center' },
  heroPill: { marginTop: t.heroPillTop },
  heroTitle: { marginTop: t.heroTitleTop, fontFamily: font.appSemi, fontSize: t.heroTitleSize, color: c.ink, textAlign: 'center' },
  heroSub: { marginTop: t.heroSubTop, maxWidth: t.heroSubMax, fontFamily: font.appBody, fontSize: t.heroSubSize, lineHeight: t.heroSubLine, color: c.inkWarm, textAlign: 'center' },

  lead: { gap: t.leadPillGap },
  leadTextTop: { marginTop: t.leadTextTop },
  leadRight: { marginTop: t.leadRightTop },
  leadTitle: { fontFamily: font.appSemi, fontSize: t.leadTitleSize, color: c.ink },
  leadText: { fontFamily: font.appBody, fontSize: t.leadTextSize, lineHeight: t.leadTextLine, color: c.inkWarm },
  leadTitleLine: {},

  text: { fontFamily: font.appBody, fontSize: t.textSize, lineHeight: t.textLine, color: c.inkWarm },
  mutedText: { color: c.inkMuted },
  small: { fontFamily: font.appBody, fontSize: t.smallSize, lineHeight: t.smallLine, color: c.inkWarm },
  quote: { fontFamily: font.appBody, fontStyle: 'italic', fontSize: t.quoteSize, lineHeight: t.quoteLine, color: c.ink, paddingHorizontal: t.quoteInset },
  greenText: { color: c.greenInk },
  titleText: { fontFamily: font.appSemi, fontSize: t.titleTextSize, lineHeight: t.titleTextLine, color: c.ink },
  quoteInline: { fontStyle: 'italic' },

  rows: { gap: t.rowGap },
  kv: { alignItems: 'flex-start' },
  divided: { paddingBottom: t.rowGap, borderBottomWidth: 1, borderBottomColor: c.rail },
  kvLabel: { fontFamily: font.appBody, fontSize: t.kvSize, color: c.inkWarm },
  kvValue: { flexShrink: 1, fontFamily: t.kvValueBold ? font.appSemi : font.appBody, fontSize: t.kvValueSize, color: c.ink, textAlign: 'right' },
  mono: { fontFamily: font.mono, fontWeight: '700', fontSize: t.monoSize },

  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: t.gridGap, rowGap: t.gridRowGap },
  cell: { flexBasis: '45%', flexGrow: 1 },
  cellWide: { flexBasis: '100%' },
  colGrid: {},
  colRow: { flexDirection: 'row', gap: t.gridGap },
  colCell: { flex: 1, backgroundColor: c.panel, paddingHorizontal: t.panelPad, paddingTop: t.colBoxGap / 2, paddingBottom: t.colBoxGap / 2 },
  colCellTop: { borderTopLeftRadius: t.panelRadius, borderTopRightRadius: t.panelRadius, paddingTop: t.colPadTop },
  colCellBottom: { borderBottomLeftRadius: t.panelRadius, borderBottomRightRadius: t.panelRadius, paddingBottom: t.colPadBottom },
  gridPanel: { borderRadius: t.panelRadius, paddingHorizontal: t.panelPad, paddingVertical: t.gridPanelPadY, backgroundColor: c.panel },
  cellBoxed: { borderRadius: t.panelRadius, paddingHorizontal: t.panelPad, paddingVertical: t.cellPadY, backgroundColor: c.panel },
  cellLabel: { fontFamily: font.appBody, fontSize: t.labelSize, color: c.inkWarm },
  cellValue: { marginTop: t.valueTop, fontFamily: font.appSemi, fontSize: t.valueSize, color: c.ink },
  mutedValue: { fontFamily: font.appBody, fontStyle: 'italic', color: c.inkWarm },
  cellSub: { marginTop: t.valueTop, fontFamily: font.appBody, fontSize: t.labelSize, color: c.inkWarm },

  person: { gap: t.personGap },
  personBoxed: { borderRadius: t.panelRadius, padding: t.panelPad, backgroundColor: c.panel },
  avatar: { width: t.avatar, height: t.avatar, borderRadius: t.avatar / 2, backgroundColor: c.peach, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: font.appSemi, fontSize: t.avatarSize, color: c.brownInk },
  name: { fontFamily: font.appSemi, fontSize: t.nameSize, color: c.ink },
  nameSmall: { fontSize: t.nameSmallSize },
  personSubSmall: { fontSize: t.personSubSmallSize, lineHeight: t.personSubSmallLine },
  personSub: { marginTop: t.valueTop, fontFamily: font.appBody, fontSize: t.personSubSize, color: c.inkWarm, flexShrink: 1 },
  greyDisc: { width: t.greyDisc, height: t.greyDisc, borderRadius: t.greyDisc / 2, backgroundColor: c.rail },
  callDisc: { width: t.callDisc, height: t.callDisc, borderRadius: t.callDisc / 2, backgroundColor: c.tileGrey, alignItems: 'center', justifyContent: 'center' },

  steps: { marginVertical: -t.stepRowGap / 2 },
  step: { flexDirection: 'row', gap: t.stepGap },
  stepBoxed: { marginBottom: t.gridGap, borderRadius: t.panelRadius, padding: t.panelPad, backgroundColor: c.panel, alignItems: 'center' },
  stepLeft: { alignItems: 'center', width: t.stepDisc },
  stepRow: {},
  stepText: { paddingVertical: t.stepRowGap / 2 },
  railHalf: { flex: 1, width: t.stepRail, backgroundColor: c.helpGrey },
  railHidden: { backgroundColor: 'transparent' },
  mutedSub: { color: c.inkMuted },
  disc: { width: t.stepDisc, height: t.stepDisc, borderRadius: t.stepDisc / 2, alignItems: 'center', justifyContent: 'center' },
  discRing: { borderWidth: t.stepRail, borderColor: c.ink, backgroundColor: c.card },
  discCore: { width: t.stepGlyph - 4, height: t.stepGlyph - 4, borderRadius: t.stepGlyph, backgroundColor: c.ink },
  discDot: { width: t.stepDot, height: t.stepDot, borderRadius: t.stepDot / 2, backgroundColor: c.inkWarm },
  stepTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.stepTitleSize, color: c.ink },
  stepSub: { marginTop: t.stepSubTop, fontFamily: font.appBody, fontSize: t.stepSubSize, color: c.inkWarm },

  docs: { gap: t.gridGap },
  docList: { gap: t.docsGap },
  doc: { borderRadius: t.panelRadius, paddingHorizontal: t.docPadX, paddingVertical: t.docPadY, backgroundColor: c.panel },
  docTile: { width: t.docTile, height: t.docTile, borderRadius: t.headTileRadius, backgroundColor: status.redContainer, alignItems: 'center', justifyContent: 'center' },
  docName: { fontFamily: font.appSemi, fontSize: t.docNameSize, color: c.ink },
  docMeta: { marginTop: t.docMetaTop, fontFamily: font.appBody, fontSize: t.docMetaSize, color: c.inkWarm },
  docBtn: {
    minHeight: t.docBtnH,
    paddingHorizontal: t.docBtnPadX,
    borderRadius: t.docBtnH / 2,
    backgroundColor: c.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docBtnText: { fontFamily: font.appSemi, fontSize: t.docBtnSize, color: c.ink },
  docPdf: { minHeight: t.docRowH, justifyContent: 'center', paddingVertical: t.docPadY, paddingHorizontal: t.docPadX },
  docPdfRow: { gap: t.docGap },
  docBtnGrey: { minHeight: t.docBtnH, backgroundColor: c.rail },
  sideIconCell: { flexDirection: 'row', alignItems: 'center', gap: t.sideIconGap },
  docActions: { marginTop: t.gridGap },

  check: { flexDirection: 'row', alignItems: 'center', gap: t.stepGap, borderRadius: t.panelRadius, padding: t.panelPad, backgroundColor: c.card, borderWidth: 1, borderColor: c.tileGrey },
  checkProgress: { borderColor: c.peach, backgroundColor: c.peachNote },
  checkMark: { width: t.stepDisc, height: t.stepDisc, borderRadius: t.stepDisc / 2, alignItems: 'center', justifyContent: 'center' },
  checkTitle: { fontFamily: font.appSemi, fontSize: t.stepTitleSize, color: c.ink },
  checkSub: { marginTop: t.headSubTop, fontFamily: font.appBody, fontSize: t.stepSubSize, lineHeight: t.smallLine, color: c.inkWarm },
  checkBody: { gap: t.headSubTop },

  fieldLabel: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.fieldLabelSize, color: c.ink },
  req: { color: advForensicRed.declineColour },
  fieldTop: { marginTop: t.fieldTop },
  field: {
    marginTop: t.fieldTop,
    minHeight: t.fieldH,
    borderRadius: t.fieldRadius,
    paddingHorizontal: t.fieldPadX,
    paddingVertical: t.panelPad / 2,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.headGap,
  },
  area: { minHeight: t.areaMinH, alignItems: 'flex-start', paddingVertical: t.panelPad },
  fieldText: { fontFamily: font.appBody, fontSize: t.fieldSize, lineHeight: t.textLine, color: c.ink },
  placeholder: { color: c.inkMuted },
  hint: { fontFamily: font.appBody, fontSize: t.hintSize, color: c.inkWarm },
  hintRow: { marginTop: t.hintTop },

  choice: { flexDirection: 'row', alignItems: 'center', gap: t.stepGap, borderRadius: t.panelRadius, padding: t.panelPad, backgroundColor: c.panel },
  choiceOn: { backgroundColor: c.peachNote },
  radio: { width: t.stepDisc, height: t.stepDisc, borderRadius: t.stepDisc / 2, backgroundColor: c.radioGrey, alignItems: 'center', justifyContent: 'center' },
  radioOn: { backgroundColor: c.brown },

  segment: { flexDirection: 'row', borderRadius: t.panelRadius, padding: t.barGap, backgroundColor: c.panel },
  segItem: { flex: 1, minHeight: t.btnSmallH, borderRadius: t.headTileRadius, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: c.brown },
  segText: { fontFamily: font.appSemi, fontSize: t.textSize, color: c.inkWarm, textAlign: 'center' },
  segTextOn: { color: ink.onBrand },

  box: { width: t.checkBox, height: t.checkBox, borderRadius: t.checkRadius, backgroundColor: c.radioGrey, alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: c.brown },

  bar: { height: t.barH, borderRadius: t.barH / 2, marginHorizontal: t.barGap / 2 },
  barTile: { borderRadius: t.panelRadius, padding: t.panelPad / 2, backgroundColor: c.panel },
  barLabel: { marginTop: t.barGap, fontFamily: font.appBody, fontSize: t.stepSubSize - 1, color: c.inkWarm, textAlign: 'center' },
  barChip: { borderRadius: t.headTileRadius, padding: t.barGap * 2, backgroundColor: c.panel, textAlign: 'left' },

  num: { width: t.stepDisc - 2, height: t.stepDisc - 2, borderRadius: t.stepDisc, backgroundColor: c.peach, alignItems: 'center', justifyContent: 'center' },
  numText: { fontFamily: font.appSemi, fontSize: t.stepSubSize - 1, color: c.brownInk },

  banner: { borderRadius: t.panelRadius, paddingHorizontal: t.bannerPadX, paddingVertical: t.bannerPadY, gap: t.bannerGap },
  bannerBare: { padding: 0 },

  btn: {
    minHeight: t.btnH,
    borderRadius: t.btnRadius,
    paddingHorizontal: t.cardPad,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.headGap,
  },
  btnFooter: { minHeight: t.footerBtnH, borderRadius: t.footerBtnRadius, borderWidth: 0, paddingHorizontal: t.footerBtnPadX },
  btnFooterText: { fontSize: t.footerBtnSize },
  btnOutline: { borderWidth: 1, borderColor: c.rail },
  btnDanger: { backgroundColor: c.tileGrey },
  btnText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.btnSize, textAlign: 'center' },
  btnLink: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: t.pillGap, paddingVertical: t.barGap },
  btnLinkText: { fontFamily: font.appSemi, fontSize: t.btnLinkSize },

  amountBox: { borderRadius: t.panelRadius, padding: t.panelPad, backgroundColor: c.panel },
  amountBare: { padding: 0, backgroundColor: 'transparent' },
  amount: { marginTop: t.valueTop, fontFamily: font.appSemi, fontSize: t.amountSize, color: c.ink },
  amountBig: { fontSize: t.heroTitleSize + 8 },
  amountCaps: { fontFamily: font.appSemi, fontSize: t.capsSize, letterSpacing: t.capsSpacing, color: c.reqDark },
  amountRight: { marginTop: 0, fontFamily: font.appHeading, color: c.reqDark },
  amountSide: { alignItems: 'flex-end', flexShrink: 1 },

  upload: { alignItems: 'center', borderRadius: t.panelRadius, padding: t.cardPad, backgroundColor: c.panel, gap: t.headSubTop },
  uploadDisc: { width: t.headTile + 8, height: t.headTile + 8, borderRadius: t.headTile, backgroundColor: c.peach, alignItems: 'center', justifyContent: 'center' },
  uploadBtn: { alignSelf: 'stretch', marginTop: t.cardInnerGap },

  quoteBox: { borderRadius: t.panelRadius, padding: t.panelPad, backgroundColor: c.panel },

  chip: {
    minHeight: t.chipH,
    paddingHorizontal: t.chipPadX,
    borderRadius: t.chipH / 2,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.tileGrey,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap + 2,
  },
  chipText: { fontFamily: font.appSemi, fontSize: t.chipSize, color: c.ink },
  tiles: { gap: t.cardInnerGap },
  tile: { flexBasis: '45%', flexGrow: 1, minHeight: t.tileMinH, borderRadius: t.cardRadius, padding: t.cardPad, backgroundColor: c.card, gap: t.cardInnerGap },

  deadline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: t.padX,
    paddingTop: t.cardPad,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.cardInnerGap,
    backgroundColor: c.card,
    borderTopWidth: 1,
    borderTopColor: c.rail,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: t.footerPadX,
    paddingTop: t.footerPadY,
    flexDirection: 'row',
    gap: t.footerGap,
    backgroundColor: c.card,
  },
  deadlineLabel: { fontFamily: font.appSemi, fontSize: t.deadlineLabelSize, letterSpacing: t.capsSpacing, color: c.inkWarm },
  deadlineValue: { fontFamily: font.appSemi, fontSize: t.deadlineValueSize, color: c.ink },

  switchBar: {
    marginTop: t.switchTop,
    paddingHorizontal: t.padX,
    paddingVertical: t.switchPadY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.headGap,
    backgroundColor: c.panel,
  },
  switchDark: { backgroundColor: q.callBand },
  switchLabel: { fontFamily: font.appSemi, fontSize: t.switchLabelSize, letterSpacing: t.capsSpacing, color: c.inkWarm },
  switchPill: { flexDirection: 'row', borderRadius: t.switchH / 2, padding: t.barGap / 2, backgroundColor: c.tileGrey, marginLeft: 'auto' },
  switchItem: { minHeight: t.switchH - t.barGap, paddingHorizontal: t.switchPadX, borderRadius: t.switchH / 2, justifyContent: 'center' },
  switchOn: { backgroundColor: c.card },
  switchOnDark: { backgroundColor: c.avatarTan },
  switchText: { fontFamily: font.appSemi, fontSize: t.switchSize, color: c.inkWarm },
  switchTextOn: { color: c.ink },
  switchTextOnDark: { color: c.ink },
});
}
