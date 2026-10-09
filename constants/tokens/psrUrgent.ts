// ─────────────────────────────────────────────────────────────────────────────
// PALETTE QUARANTINE — design/210's "URGENT · 30-Year Search" chip.
//
// ⚠ IT DOES NOT REUSE AN EXISTING STATUS TOKEN. Both values are sampled from the
// export and neither exists anywhere else in the project:
//
//   bg      #FFDAD6  sampled (255, 218, 214)
//   colour  #93000A  sampled (147,   0,  10)
//
// The same word, for the same matter, is drawn amber on the advocate cases list
// (designs 204/205): advCases.urgentBg #FBEEDC on advCases.urgentColour #B5741A.
// And the shared scale in constants/theme.ts has no red pill at all — `status`
// holds a green pair, an amber pair, and a red notification DOT (#D7524B) used for
// the unread bell. So design/210 introduces the product's first red status pill,
// for a state that already has a colour.
//
// Recommendation when this reaches review: either make red mean "urgent"
// everywhere and retire the amber pair, or drop the red here. One word should not
// have two colours on two screens of the same matter.
// ─────────────────────────────────────────────────────────────────────────────

export const psrUrgent = {
  bg: '#FFDAD6',
  colour: '#93000A',
};
