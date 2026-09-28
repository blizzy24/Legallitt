// Profile section: the profile tab (design/50), edit profile (design/51) and the
// confirm modal (design/71).
//
// design/50 and design/51 are clean 780px exports (2x at 390pt) and are measured.
// design/71 shipped as a 303px thumbnail (0.78px per point) and could not be; the
// modal's metrics are carried from the measured screens.

export const profile = {
  padX: 21,
  top: 20,
  titleSize: 26,
  gear: 32,
  gearIcon: 17,

  cardRadius: 14,
  cardPad: 16,
  cardGap: 16,

  // Identity card.
  avatar: 56,
  avatarText: 20,
  avatarGap: 14,
  dot: 11,
  dotBorder: 2.5,
  nameSize: 17,
  nameChipGap: 9,
  chipHeight: 22,
  chipRadius: 6,
  chipPadX: 9,
  chipSize: 11,
  chipBg: '#F1EDE7',
  emailGap: 7,
  emailSize: 13,
  mobileGap: 5,
  mobileSize: 13,
  editGap: 16,
  editHeight: 40,
  editRadius: 10,
  editBg: '#F3EDE7',
  editIcon: 15,
  editIconGap: 9,
  editSize: 14,

  // Section label + menu rows.
  sectionGap: 23,
  sectionSize: 11,
  sectionSpacing: 0.9,
  sectionLabelGap: 11,
  rowHeight: 67,
  rowPadX: 16,
  rowIcon: 38,
  rowIconRadius: 10,
  rowIconGlyph: 18,
  rowIconBg: '#F4EDE5',
  rowIconGap: 13,
  rowTitleSize: 15,
  rowChipGap: 8,
  rowChipHeight: 19,
  rowChipRadius: 5,
  rowChipPadX: 7,
  rowChipSize: 10.5,
  rowChipBg: '#EFE9E1',
  rowSubGap: 3,
  rowSubSize: 12.5,
  rowValueGap: 8,
  rowValueSize: 13,
  rowChevron: 18,
  divider: '#F1EDE9',

  // Log out row.
  logoutGap: 16,
  logoutColour: '#E0453C',
  logoutIconBg: '#FCECEA',

  footerGap: 18,
  footerSize: 12,

  // ── Edit profile (design/51) ──
  headerHeight: 56,
  headerTop: 18,
  backIcon: 20,
  headerTitleSize: 16,
  saveHeight: 30,
  saveRadius: 15,
  savePadX: 15,
  saveSize: 13.5,
  saveBg: '#F3EDE7',

  bigAvatarTop: 22,
  bigAvatar: 96,
  bigAvatarText: 30,
  cameraBadge: 30,
  cameraGlyph: 15,
  changePhotoGap: 11,
  changePhotoSize: 13.5,

  groupGap: 22,
  groupLabelGap: 13,
  fieldGap: 12,
  fieldColGap: 12,

  // Language row inside the picker field.
  langIcon: 34,
  langIconRadius: 9,
  langIconGlyph: 17,
  langIconGap: 11,
  langSize: 15.5,
  langSubGap: 3,
  langSubSize: 12.5,

  // Consultation preference cards.
  prefIntroGap: 6,
  prefIntroSize: 12.5,
  prefGap: 13,
  prefColGap: 11,
  prefRadius: 12,
  prefPad: 12,
  prefHeight: 96,
  prefIcon: 30,
  prefIconRadius: 15,
  prefIconGlyph: 15,
  prefCheck: 20,
  prefLabelGap: 11,
  prefLabelSize: 14.5,
  prefAvailGap: 3,
  prefAvailSize: 11.5,
  prefOnBg: '#F6EFE7',
  prefOnBorder: '#B09C82',
  prefOffBorder: '#EDE8E2',

  saveButtonGap: 26,
  buttonHeight: 50,
  buttonRadius: 12,
  buttonSize: 15.5,
  cancelGap: 18,
  cancelSize: 14,

  verifiedHeight: 21,
  verifiedRadius: 10.5,
  verifiedPadX: 8,
  verifiedIcon: 11,
  verifiedIconGap: 4,
  verifiedSize: 11,
  verifiedBg: '#E8F8EF',
  verifiedText: '#0E9F6E',
};

// Confirm modal (design/71 log out; design/67 and design/68 reuse the pattern).
export const confirmModal = {
  scrim: 'rgba(28, 24, 20, 0.45)',
  padX: 28,
  radius: 20,
  pad: 24,
  icon: 60,
  iconGlyph: 26,
  titleGap: 18,
  titleSize: 21,
  bodyGap: 10,
  bodySize: 13.5,
  bodyLineHeight: 20,
  buttonGap: 22,
  buttonStackGap: 10,
  buttonHeight: 50,
  buttonRadius: 12,
  buttonSize: 15.5,
  dangerBg: '#D9534F',
  dangerIconBg: '#FCECEA',
  cancelBg: '#F5F1ED',
};

// Fifth field style (design/51): a white bordered box with the label INSIDE it,
// the value below, and an optional trailing icon or chip. Distinct from
// AuthField (rounded, shadowed), FlatField (flat, label outside) and
// LabelledField (label above with a Required/Optional chip).
export const boxField = {
  radius: 12,
  // Measured from design/51's Full Name field: the box spans x21..369 and the label
  // ink starts at x38.
  padX: 17,
  padTop: 11,
  padBottom: 12,
  bg: '#FFFFFF',
  border: '#EDE7E0',
  // Both sizes derived from ink width rather than glyph height: "Full Name" is 51.0pt
  // wide in the file, "Prefer not to say" 106.5pt.
  labelSize: 10.75,
  labelGap: 5,
  valueSize: 13.75,
  icon: 15,
  iconGap: 10,
  // design/51's chevron ink is 10pt wide, narrower than the trailing field icons.
  chevron: 13,
};
