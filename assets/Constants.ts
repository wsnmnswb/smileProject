import {Dimensions, Platform, StatusBar} from 'react-native';
import StaticSafeAreaInsets from 'react-native-static-safe-area-insets';

export const CONTENT_SPACING = 15;

const SAFE_BOTTOM =
  Platform.select({
    ios: StaticSafeAreaInsets.safeAreaInsetsBottom,
  }) ?? 0;

export const SAFE_AREA_PADDING = {
  paddingLeft: StaticSafeAreaInsets.safeAreaInsetsLeft + CONTENT_SPACING,
  paddingTop: StaticSafeAreaInsets.safeAreaInsetsTop + CONTENT_SPACING,
  paddingRight: StaticSafeAreaInsets.safeAreaInsetsRight + CONTENT_SPACING,
  paddingBottom: SAFE_BOTTOM + CONTENT_SPACING,
};

export const SCREEN_WIDTH = Dimensions.get('window').width;
// export const SCREEN_HEIGHT = Platform.select<number>({
//   android:
//     Dimensions.get('screen').height - StaticSafeAreaInsets.safeAreaInsetsTop,
//   ios: Dimensions.get('window').height,
// }) as number;
export const SCREEN_HEIGHT = Dimensions.get('window').height;
export const STATUSBAR_HEIGHT = Platform.select<number>({
  android: StatusBar.currentHeight,
  ios: 0,
}) as number;

export const SAFE_AREA_CENTER =
  (SCREEN_HEIGHT -
    STATUSBAR_HEIGHT -
    SAFE_AREA_PADDING.paddingTop -
    SAFE_AREA_PADDING.paddingBottom) /
  2;

// export const SAFE_TOP =
//   Platform.select({
//     ios: StaticSafeAreaInsets.safeAreaInsetsTop,
//   }) ?? 0;

// The maximum zoom _factor_ you should be able to zoom in
export const MAX_ZOOM_FACTOR = 20;

export const PHOTO_MARGIN_TOP =
  (SCREEN_HEIGHT - (SCREEN_WIDTH * 16) / 9) / 2 + STATUSBAR_HEIGHT;

// Capture Button
export const CAPTURE_BUTTON_SIZE = 78;

export const PADDING_HORIZONTAL = 20;
export const SLIDER_WIDTH = SCREEN_WIDTH - PADDING_HORIZONTAL * 2;
export const ELEVATION = 30;
export const DOT_ADJUSTMENT = -18;
export const DOT_SIZE = 20;
