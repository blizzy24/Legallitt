import type { Href } from 'expo-router';

// The section vocabulary of the advocate court batch (designs 362–396). Each
// screen is a list of these, written as data in data/advocateCourt.ts and drawn
// by components/court/CourtKit.tsx. Families are combinations of the same
// sections: a status screen is hero + person + rows + timeline + next-step card;
// a form is lead + fields + preview card; and so on.

export type IconName =
  | 'check'
  | 'checkCircle'
  | 'clock'
  | 'x'
  | 'xCircle'
  | 'lock'
  | 'flag'
  | 'phone'
  | 'chat'
  | 'user'
  | 'users'
  | 'file'
  | 'pdf'
  | 'folder'
  | 'shield'
  | 'shieldCheck'
  | 'gavel'
  | 'scale'
  | 'building'
  | 'calendar'
  | 'mapPin'
  | 'info'
  | 'alert'
  | 'bell'
  | 'eye'
  | 'edit'
  | 'trash'
  | 'plus'
  | 'plusCircle'
  | 'upload'
  | 'download'
  | 'share'
  | 'copy'
  | 'refresh'
  | 'arrowRight'
  | 'chevronRight'
  | 'send'
  | 'save'
  | 'list'
  | 'listChecks'
  | 'receipt'
  | 'wallet'
  | 'truck'
  | 'trend'
  | 'history'
  | 'note'
  | 'sparkles'
  | 'quote'
  | 'video'
  | 'swap'
  | 'play'
  | 'dashboard'
  | 'bookmark'
  | 'idCard'
  | 'link'
  | 'smile'
  | 'mic'
  | 'speaker'
  | 'headset'
  | 'mail'
  | 'mailCheck'
  | 'smartphone'
  | 'arrowUp'
  | 'help'
  | 'archive'
  | 'signature'
  | 'folders'
  | 'calendarCheck'
  | 'badgeCheck'
  | 'scroll'
  | 'inbox'
  | 'paperclip'
  | 'clipboardCheck'
  | 'filePen'
  | 'fileStack'
  | 'folderOpen'
  | 'folderUser'
  | 'compass'
  | 'pdfRed'
  | 'chatQuote'
  | 'lightbulb'
  | 'fileUp'
  | 'folderCheck';

export type Tone =
  | 'green'
  | 'peach'
  | 'cream'
  | 'grey'
  | 'panel'
  | 'help'
  | 'mint'
  | 'sage'
  | 'verified'
  | 'sand'
  | 'panelGreen'
  | 'greyGreen'
  | 'greenTile'
  | 'peachPill'
  | 'clearGreen'
  | 'action'
  | 'tilePeach'
  | 'approvedPill'
  | 'solidGreen'
  | 'red'
  | 'brown'
  | 'blue'
  | 'violet'
  | 'white'
  | 'dark';

/** A small rounded tag. */
export type Pill = {
  pill: string;
  tone: Tone;
  dot?: boolean;
  /** The dot in status green whatever the tone (380). */
  dotGreen?: boolean;
  icon?: IconName;
  /** The icon in status green (380's Auto-filled). */
  iconGreen?: boolean;
  /** The taller header / lead pill (363). */
  lg?: boolean;
  mono?: boolean;
  /** The icon after the text (382's Verified ✓). */
  iconAfter?: boolean;
};

/** What sits at the right of a heading or row: plain text, a pill or a small link. */
export type Right =
  | string
  | Pill
  | {
      link: string;
      icon?: IconName;
      iconAfter?: IconName;
      to?: Href;
      /** Drawn as a small grey button (364's Refresh). */
      chip?: boolean;
      /** Grey text with a green icon (375's Secure Audit). */
      muted?: boolean;
      /** Green text and icon (376's Received). */
      green?: boolean;
      /** A green dot before green text (380's Live preview). */
      dot?: boolean;
      /** With muted: the icon grey too (380's Pending). */
      mutedIcon?: boolean;
    }
  | { /** A grey disc with an icon (372's next-step card). */ iconDisc: IconName; /** The darker rail grey (382). */ rail?: boolean };

export type Btn = {
  label: string;
  variant?: 'primary' | 'soft' | 'panel' | 'help' | 'white' | 'outline' | 'ghost' | 'disabled' | 'muted' | 'green' | 'danger' | 'link';
  /** Disabled until the screen's gating checkbox is ticked, then primary (375). */
  gated?: boolean;
  icon?: IconName;
  iconRight?: IconName;
  /** Navigation only. A button without `to` draws and does nothing (see the data file). */
  to?: Href;
  back?: boolean;
  /** Content width in a footer, the other button taking the rest (364). */
  hug?: boolean;
};

export type Head = {
  icon?: IconName;
  /** true: grey square tile; 'peach': peach square tile (364); 'disc': peach round disc (364's Next Step). */
  tile?: boolean | 'peach' | 'disc' | 'brown' | 'red' | 'step' | 'greenCheck';
  /** A red caps title (373); a brown one (378). */
  tone?: 'red' | 'brown';
  /** The smaller caps of a nested panel (373's CLIENT NOTE). */
  small?: boolean;
  /** A pill above the title (371's RECOMMENDED NEXT STEP). */
  kicker?: Pill;
  title: string;
  caps?: boolean;
  sub?: string;
  right?: Right;
  pills?: Pill[];
  /** A hairline under the heading (364's AI summary panel). */
  rule?: boolean;
  /** The right part level with the title, not centred on title + sub (364). */
  rightTop?: boolean;
  /** A green icon straight after the title (376's verified badge). */
  titleIcon?: IconName;
  /** Token for this head's title size (377 draws two sizes). */
  size?: string;
  /** The tile level with the title, not centred (382's Next Step). */
  topAlign?: boolean;
  /** Token for the sub-line's size (382). */
  subSize?: string;
};

export type Step = {
  title: string;
  sub?: string;
  /** accent: the green current step of 371. next: a grey disc with a brown dot, normal text (372). */
  state: 'done' | 'current' | 'active' | 'accent' | 'next' | 'ring' | 'wait' | 'hollow' | 'todo';
  right?: Right;
  /** Sub-line in green (378, 384 draw "Completed" green; 371 draws it grey). */
  subGreen?: boolean;
  /** A pill straight after the title (377's Current). */
  tag?: Pill;
  /** The sub-line in brown (378's current step). */
  subBrown?: boolean;
  /** A grey title (378's later steps). */
  muted?: boolean;
  /** Token for extra space above this step (381's taller pending rows). */
  gap?: string;
  /** A dark-green done disc (384's Court Filing). */
  deep?: boolean;
};

/**
 * Every block may name the token that spaces it from the block above (in its
 * card, or on the page). The value lives in that screen's token block in
 * constants/tokens/advCourt.ts — no sizes are written in the data.
 */
export type Spaced = { top?: string; /** A token added below the block (may be negative). */ bottom?: string };

export type Block = Spaced & BlockBody;

type BlockBody =
  | { k: 'card'; tone?: 'white' | 'panel' | 'cream' | 'peach' | 'green' | 'outline' | 'payPeach' | 'decline' | 'tier' | 'halo' | 'banner' | 'tileGrey' | 'greenRing'; /** A brown bar down the left edge (383). */ bar?: boolean; /** Blocks indented to the head's text column (379); a token name for another indent (382). */ indent?: boolean | string; /** A hairline round it (381's payment status). */ outline?: boolean; head?: Head; blocks: Block[]; /** Token for its padding. */ pad?: string }
  | {
      k: 'hero';
      icon: IconName;
      tone: 'green' | 'deepGreen' | 'mint' | 'halo' | 'sent' | 'approved' | 'peach' | 'red' | 'grey';
      /** A small peach badge with an icon at the disc's top right (383). */
      badgeIcon?: IconName;
      /** A pill above the disc (381). */
      topPill?: Pill;
      pill?: Pill;
      title: string;
      sub?: string;
      left?: boolean;
      /** One disc with the glyph on it, no inner core (370). */
      flat?: boolean;
      /** The small dark dot at its top right (370). */
      badge?: boolean;
      /** The pill under the sub-line, not above the title (376). */
      pillBelow?: boolean;
    }
  | { k: 'lead'; pill?: Pill; /** Text straight after the pill (377's Step 5 of 10). */ pillNote?: string; right?: Right; title?: string; text?: string }
  | { k: 'label'; text: string; right?: Right; pills?: Pill[]; icon?: IconName; /** The large ink caps of 374's section titles. */ strong?: boolean; /** A sentence-case section title (376). */ title?: boolean; /** A green dot before it (364). */ dot?: boolean; /** Inset from the gutter (364's MATTER BRIEFING). */ inset?: boolean }
  | { k: 'text'; t?: string; parts?: { t: string; bold?: boolean; muted?: boolean }[]; /** A pill after the text (371's Civil). */ pill?: Pill; /** Token for its type size. */ size?: string; /** Token for its icon size. */ iconSize?: string; iconGreen?: boolean; tone?: 'body' | 'muted' | 'small' | 'smallStrong' | 'kicker' | 'quote' | 'center' | 'strong' | 'green' | 'title' | 'label' | 'note'; icon?: IconName }
  | { k: 'rows'; rows: [string, string, ('mono' | 'monoBrown' | 'brown' | 'bold' | 'green' | 'quote')?][]; divided?: boolean }
  | {
      k: 'grid';
      cells: { label: string; value: string; sub?: string; tone?: 'green' | 'mono' | 'muted'; wide?: boolean; icon?: IconName; sideIcon?: IconName; iconRight?: IconName; /** tileGrey, not panel (376). */ shade?: boolean; alignRight?: boolean; small?: boolean; /** A white disc with an icon at the right (376). */ iconDisc?: IconName }[];
      /** 'cells': a panel per cell. 'columns': one panel per column (363). 'panel': one panel round all (363's phone/email). */
      boxed?: 'cells' | 'columns' | 'panel';
      /** Capitalised labels (370). */
      caps?: boolean;
    }
  | {
      k: 'person';
      initials?: string;
      icon?: IconName;
      name: string;
      tag?: Pill;
      sub?: string;
      subIcon?: IconName;
      meta?: string;
      metaIcon?: IconName;
      call?: boolean;
      chips?: Btn[];
      boxed?: boolean;
      /** A grey icon disc in place of the peach avatar: true = rail grey (363), 'help' (373), 'tile' (381). */
      greyDisc?: boolean | 'help' | 'tile';
      /** The kicker in sentence case, not caps (381's Client). */
      kickerPlain?: boolean;
      /** Grey chips, no border (381). */
      chipsGrey?: boolean;
      /** The smaller name and sub-line of an info row (363's AI tools card). */
      small?: boolean;
      /** A caps label above the name (374's CLIENT). */
      kicker?: string;
      /** A photograph's place: a neutral disc, no asset supplied (375). */
      photo?: boolean;
      /** The meta line in ink semibold (375's phone). */
      metaStrong?: boolean;
      right?: Right;
    }
  | {
      k: 'timeline';
      steps: Step[];
      boxed?: boolean;
      /** No rail between discs (370). */
      noRail?: boolean;
      /** Dark-green done discs (371). */
      deep?: boolean;
      /** Pale green done discs on a green rail, a brown current disc (377). */
      light?: boolean;
      /** Discs level with the title, not centred on title + sub (378). */
      discTop?: boolean;
      /** With light: grey rails throughout (381). */
      greyRail?: boolean;
      /** A green rail between done steps (384). */
      greenRail?: boolean;
    }
  | {
      k: 'docs';
      items: {
        name: string;
        meta?: string;
        icon?: IconName;
        right?: Right | 'tick' | 'circleTick' | 'ring';
        btn?: string;
        actions?: string[];
        /** Small buttons in the row (379's View / Replace). */
        inline?: string[];
        /** A green ticked note after the meta (380's Receipt Added). */
        metaGood?: string;
        /** A small button under the row, at the right (382). */
        btnBelow?: string;
      }[];
      /** The square tile's fill: 'wallet' = advWalletPalette.tile (379). */
      tileTone?: 'wallet' | 'peach';
      /** A grey tile with the red PDF glyph (382). */
      redTile?: boolean;
      /** Icons in grey discs on the panel rows (375). */
      discs?: boolean;
      /** Each a white card with a grey square icon tile (376). */
      cards?: boolean;
      tiles?: boolean;
      /** The View buttons in helpGrey (378). */
      btnTone?: 'help' | 'tile';
      /** The framed-PDF glyph with no tile behind it (363), and grey "View" pills. */
      pdf?: boolean;
    }
  | {
      k: 'checklist';
      /** Each item a white card of its own (374). */
      cards?: boolean;
      /** Pale green done discs, a ring for not started (377). */
      light?: boolean;
      items: { title: string; tag?: Pill; sub?: string; state: 'done' | 'info' | 'none' | 'progress'; right?: Right; edit?: boolean; icon?: IconName }[];
    }
  | {
      k: 'field';
      label: string;
      req?: boolean;
      right?: Right;
      value?: string;
      placeholder?: string;
      icon?: IconName;
      iconRight?: IconName;
      multiline?: boolean;
      hint?: string;
      foot?: [string, string];
      prefix?: string;
      /** A hairline round the box (377's note). */
      bordered?: boolean;
      /** The larger amount entry (380). */
      big?: boolean;
    }
  | { k: 'fieldRow'; fields: { label: string; req?: boolean; value?: string; placeholder?: string; icon?: IconName }[] }
  | { k: 'choices'; items: { label: string; sub?: string; selected?: boolean; right?: Right; /** A green dot at the right (379). */ dot?: boolean }[] }
  | { k: 'segment'; label?: string; items: string[]; selected: number }
  | { k: 'check'; title: string; sub?: string; checked: boolean; blocks?: Block[]; /** Tapping it toggles the screen's gate (375). */ gate?: boolean }
  | { k: 'bars'; steps: { label: string; state: 'done' | 'current' | 'todo' | 'bad'; sub?: string }[]; variant?: 'bars' | 'discs' | 'tiles' | 'chips' }
  | { k: 'numbered'; items: string[]; /** Grey number discs (384). */ grey?: boolean }
  | { k: 'banner'; icon?: IconName; title?: string; text: string; /** A brown dot at the right (373). */ dot?: boolean; center?: boolean; titleBrown?: boolean; strongText?: boolean; parts?: { t: string; bold?: boolean }[]; tone: 'grey' | 'cream' | 'green' | 'white' | 'none' | 'red' | 'help' }
  | { k: 'pills'; items: Pill[]; /** Bordered chips (377's documents). */ outline?: boolean }
  | { k: 'progress'; value: number }
  | { k: 'noteRow'; icon: IconName; t: string; btn: string }
  | { k: 'button'; btn: Btn }
  | { k: 'buttonRow'; btns: Btn[] }
  | {
      k: 'amount';
      label: string;
      value: string;
      sub?: string;
      right?: Right;
      side?: [string, string];
      tone?: 'panel' | 'payPeach' | 'reason' | 'none';
      big?: boolean;
      /** The value at the right of its labels (363's "YOUR PAYMENT"). */
      valueRight?: boolean;
      /** Smaller text after the value (364's "/ 45 min"). */
      suffix?: string;
      /** The label in caps (381). */
      capsLabel?: boolean;
      suffixGreen?: boolean;
    }
  | { k: 'upload'; title: string; sub?: string; btn?: Btn; icon?: IconName; /** Icon beside the title, not above (380). */ inline?: boolean }
  | { k: 'quote'; t: string }
  | { k: 'chips'; items: Btn[]; tiles?: boolean; /** Grey buttons spread across the row (364). */ spread?: boolean }
  | { k: 'info'; icon: IconName; label: string; value: string }
  | {
      k: 'scrollText';
      paras: (string | { label: string; text: string; bullet?: boolean; stack?: boolean })[];
      /** The token holding the box's drawn height. */
      box: string;
      large?: boolean;
      /** No box of its own: the text scrolls inside the panel around it (364). */
      bare?: boolean;
    }
  | { k: 'chip'; t: string }
  | { k: 'statusRow'; label: string; sub?: string; pill: Pill }
  | { k: 'richRows'; rows: { label: string; value: string; pill?: Pill; sub?: string; icon?: IconName; big?: boolean }[] }
  | { k: 'stages'; items: { label: string; state: 'todo' | 'current' | 'tick' }[] }
  | { k: 'metaRow'; items: { icon: IconName; parts: { t: string; bold?: boolean }[] }[] }
  | { k: 'empty'; icon: IconName; title: string; text: string; btn?: string; /** A primary button (384). */ cta?: Btn; /** On a panel (384). */ panel?: boolean }
  | { k: 'contact'; icon: IconName; t: string; btn?: string }
  | { k: 'iconRows'; rows: { icon: IconName; t: string; bold?: boolean }[] }
  | { k: 'footRow'; icon?: IconName; t: string; right?: Right }
  | { k: 'gap'; h: number };

export type Deadline = { label: string; value: string; btn: Btn };

export type CourtSpec = {
  title: string;
  sub?: string;
  chip?: string;
  centerTitle?: boolean;
  avatar?: boolean;
  /** A pill at the right of the header, before the avatar (364's "AI"). */
  headerRight?: Pill;
  /** A status pill straight after the header title (363's "Under Review"). */
  headerPill?: Pill;
  /** Buttons pinned in a bar at the foot of the screen (363). */
  footer?: Btn[];
  /** The footer's buttons one above the other (372). */
  footerStack?: boolean;
  /** A line under the footer's button (374). */
  footerNote?: string;
  /** A second, quieter line under footerNote (378). */
  footerNote2?: string;
  /** Two short lines under the footer's button (375). */
  footerLinks?: { icon?: IconName; t: string; tone?: 'red' | 'green' }[];
  /** A plain chevron in place of the back arrow (372). */
  chevron?: boolean;
  /** An icon in the header before the avatar (373's info). */
  headerIcon?: IconName;
  /** The drawn state switcher (363, 369, 370). */
  switcher?: { label?: string; options: string[]; /** A centred pill on the page, no band (370). */ inline?: boolean };
  blocks: Block[];
  deadline?: Deadline;
};
