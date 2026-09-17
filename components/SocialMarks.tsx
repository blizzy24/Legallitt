import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

import { login, marks } from '../constants/theme';

const s = login.socialIcon;

export function GoogleMark() {
  return (
    <Svg width={s} height={s} viewBox="0 0 48 48">
      <Path
        fill={marks.googleRed}
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <Path
        fill={marks.googleBlue}
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <Path
        fill={marks.googleYellow}
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <Path
        fill={marks.googleGreen}
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </Svg>
  );
}

export function FacebookMark() {
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={12} fill={marks.facebook} />
      <Path
        fill={marks.onMark}
        d="M16.671 15.469 17.203 12h-3.328V9.749c0-.949.465-1.874 1.956-1.874h1.513V4.922s-1.374-.235-2.686-.235c-2.741 0-4.533 1.662-4.533 4.669V12H7.078v3.469h3.047v8.385a12.09 12.09 0 0 0 3.75 0v-8.385h2.796z"
      />
    </Svg>
  );
}

export function AppStoreMark() {
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24">
      <Rect width={24} height={24} rx={5} fill={marks.appStore} />
      <Line x1={12.9} y1={5} x2={7.2} y2={17} stroke={marks.onMark} strokeWidth={1.7} strokeLinecap="round" />
      <Line x1={10.4} y1={5} x2={16.8} y2={17.6} stroke={marks.onMark} strokeWidth={1.7} strokeLinecap="round" />
      <Line x1={5.4} y1={14.2} x2={18.6} y2={14.2} stroke={marks.onMark} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  );
}
