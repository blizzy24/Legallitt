// The Legal Notice chat screens (components/NoticeChatScreen.tsx): design/33
// (client ↔ Adv. Arjun Sharma) and design/183 (advocate ↔ client), measured at
// 1px = 1pt.
//
// ⚠ OFF-PALETTE — sampled from 33 / 183, not harmonised. The two chats are drawn
// in their own iMessage-like style, which is what clashes with the rest of the app:
//   · surface #F4F6F8 — 33's thread background and 183's header.
//   · bubble #E7E7E7 — both sides' bubbles are the same grey.
//   · validPill #DFFAE3 / validInk #00787C — 183's "Chat Valid Upto…" strip.
//   · read #88B8F6 — 183's double tick.
//   · verified #38F000 — 183's verified badge (33's is white on the tan header).
//   · nameBrown #64543B — 183's header name.
//   · rule #BCBCBD, dot #D3D6D5, muted #787878, ink #000000 (true black text).
// The tan header (#B19C83) is colors.brand.
export const noticeChat = {
  surface: '#F4F6F8',
  bubble: '#E7E7E7',
  validPill: '#DFFAE3',
  validInk: '#00787C',
  read: '#88B8F6',
  verified: '#38F000',
  nameBrown: '#64543B',
  rule: '#BCBCBD',
  dot: '#D3D6D5',
  muted: '#787878',
  ink: '#000000',
  timeInk: '#2C2C2C',
  online: '#00D50E',
  /** colors.brand (#B09C82) — repeated here: theme.ts re-exports this file, so it cannot import from it. */
  brand: '#B09C82',
  white: '#FFFFFF',

  headerH: 98,
  /** The drawn status-bar band above the header row (headers centre their row at 66pt). */
  statusPad: 34,
  headerPadBottom: 2,
  /** The header avatar's stand-in disc on the tan header — a darker tan than the header, so it reads. */
  avatarOnBrand: '#8C7A62',
  headerPadX: 20,
  backIcon: 26,
  backGap: 12,
  avatar: 56,
  avatarRadius: 28,
  /** 183 draws a portrait-shaped photo frame. */
  avatarW183: 40,
  avatarH183: 56,
  avatarRadius183: 12,
  onlineDot: 12,
  nameGap: 7,
  nameSize: 15,
  badge: 20,
  badgeGap: 6,

  pillTop: 17,
  pillH: 21,
  pillRadius: 10,
  pillPadX: 12,
  pillIcon: 16,
  pillSize: 13,

  padX: 20,
  threadTop: 48,
  threadTop183: 13,
  rowGap: 36,
  msgAvatar: 40,
  msgAvatarGap: 16,
  bubbleMaxW: 270,
  bubbleRadius: 14,
  bubblePadX: 10,
  bubblePadY: 12,
  textSize: 14.5,
  textLine: 16,
  timeSize: 9,
  timeTop: 0,
  timeLine: 12,
  metaPadBottom: 4,
  tick: 12,

  typingTop: 38,
  typingDot: 13,
  typingGap: 7,

  inputBottom: 28,
  inputH: 55,
  inputRadius: 28,
  plus: 32,
  plusIcon: 22,
  dividerH: 26,
  dividerGap: 8,
  placeholderSize: 16,
  send: 26,
  dividerW: 1,
  onlineInset: 2,
  shadowOpacity: 0.08,
  shadowRadius: 8,
  shadowY: 2,
};
