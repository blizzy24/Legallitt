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
  | 'mail';

export type Tone = 'green' | 'peach' | 'cream' | 'grey' | 'panel' | 'help' | 'mint' | 'red' | 'brown' | 'blue' | 'violet' | 'white' | 'dark';

/** A small rounded tag. */
export type Pill = { pill: string; tone: Tone; dot?: boolean; icon?: IconName; /** The taller header / lead pill (363). */ lg?: boolean };

/** What sits at the right of a heading or row: plain text, a pill or a small link. */
export type Right = string | Pill | { link: string; icon?: IconName; to?: Href };

export type Btn = {
  label: string;
  variant?: 'primary' | 'soft' | 'outline' | 'ghost' | 'disabled' | 'green' | 'danger' | 'link';
  icon?: IconName;
  iconRight?: IconName;
  /** Navigation only. A button without `to` draws and does nothing (see the data file). */
  to?: Href;
  back?: boolean;
};

export type Head = { icon?: IconName; tile?: boolean; title: string; caps?: boolean; sub?: string; right?: Right; pills?: Pill[] };

export type Step = {
  title: string;
  sub?: string;
  state: 'done' | 'current' | 'active' | 'todo';
  right?: Right;
  /** Sub-line in green (378, 384 draw "Completed" green; 371 draws it grey). */
  subGreen?: boolean;
};

/**
 * Every block may name the token that spaces it from the block above (in its
 * card, or on the page). The value lives in that screen's token block in
 * constants/tokens/advCourt.ts — no sizes are written in the data.
 */
export type Spaced = { top?: string; /** A token added below the block (may be negative). */ bottom?: string };

export type Block = Spaced & BlockBody;

type BlockBody =
  | { k: 'card'; tone?: 'white' | 'panel' | 'cream' | 'peach' | 'green' | 'outline' | 'payPeach'; head?: Head; blocks: Block[] }
  | { k: 'hero'; icon: IconName; tone: 'green' | 'peach' | 'red' | 'grey'; pill?: Pill; title: string; sub?: string; left?: boolean }
  | { k: 'lead'; pill?: Pill; right?: Right; title?: string; text?: string }
  | { k: 'label'; text: string; right?: Right; pills?: Pill[] }
  | { k: 'text'; t: string; tone?: 'body' | 'muted' | 'small' | 'quote' | 'center' | 'strong' | 'green' | 'title'; icon?: IconName }
  | { k: 'rows'; rows: [string, string, ('mono' | 'bold' | 'green' | 'quote')?][]; divided?: boolean }
  | {
      k: 'grid';
      cells: { label: string; value: string; sub?: string; tone?: 'green' | 'mono' | 'muted'; wide?: boolean; icon?: IconName; sideIcon?: IconName }[];
      /** 'cells': a panel per cell. 'columns': one panel per column (363). 'panel': one panel round all (363's phone/email). */
      boxed?: 'cells' | 'columns' | 'panel';
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
      /** A grey icon disc in place of the peach avatar (363's AI tools card). */
      greyDisc?: boolean;
      /** The smaller name and sub-line of an info row (363's AI tools card). */
      small?: boolean;
    }
  | { k: 'timeline'; steps: Step[]; boxed?: boolean }
  | {
      k: 'docs';
      items: { name: string; meta?: string; icon?: IconName; right?: Right | 'tick' | 'circleTick'; btn?: string; actions?: string[] }[];
      /** The framed-PDF glyph with no tile behind it (363), and grey "View" pills. */
      pdf?: boolean;
    }
  | {
      k: 'checklist';
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
    }
  | { k: 'fieldRow'; fields: { label: string; req?: boolean; value?: string; placeholder?: string; icon?: IconName }[] }
  | { k: 'choices'; items: { label: string; sub?: string; selected?: boolean; right?: Right }[] }
  | { k: 'segment'; label?: string; items: string[]; selected: number }
  | { k: 'check'; title: string; sub?: string; checked: boolean; blocks?: Block[] }
  | { k: 'bars'; steps: { label: string; state: 'done' | 'current' | 'todo' | 'bad'; sub?: string }[]; variant?: 'bars' | 'discs' | 'tiles' | 'chips' }
  | { k: 'numbered'; items: string[] }
  | { k: 'banner'; icon?: IconName; title?: string; text: string; tone: 'grey' | 'cream' | 'green' | 'white' | 'none' | 'red' }
  | { k: 'pills'; items: Pill[] }
  | { k: 'button'; btn: Btn }
  | { k: 'buttonRow'; btns: Btn[] }
  | {
      k: 'amount';
      label: string;
      value: string;
      sub?: string;
      right?: Right;
      side?: [string, string];
      tone?: 'panel' | 'payPeach' | 'none';
      big?: boolean;
      /** The value at the right of its labels (363's "YOUR PAYMENT"). */
      valueRight?: boolean;
    }
  | { k: 'upload'; title: string; sub?: string; btn?: Btn; icon?: IconName }
  | { k: 'quote'; t: string }
  | { k: 'chips'; items: Btn[]; tiles?: boolean }
  | { k: 'gap'; h: number };

export type Deadline = { label: string; value: string; btn: Btn };

export type CourtSpec = {
  title: string;
  sub?: string;
  chip?: string;
  centerTitle?: boolean;
  avatar?: boolean;
  /** A status pill straight after the header title (363's "Under Review"). */
  headerPill?: Pill;
  /** Buttons pinned in a bar at the foot of the screen (363). */
  footer?: Btn[];
  /** The drawn state switcher (363, 369, 370). */
  switcher?: { label?: string; options: string[] };
  blocks: Block[];
  deadline?: Deadline;
};
