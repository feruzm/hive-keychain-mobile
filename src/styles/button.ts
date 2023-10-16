import {StyleProp, ViewStyle} from 'react-native';
import {Theme} from 'src/context/theme.context';
import {PRIMARY_RED_COLOR, RED_SHADOW_COLOR, getColors} from './colors';
import {generateBoxShadowStyle} from './shadow';
//TODO if file needed at all.
export const getButtonStyle = (theme: Theme) => {
  return {
    outline: {
      borderColor: getColors(theme).borderContrast,
    } as StyleProp<ViewStyle>,
    warningStyleButton: [
      {backgroundColor: PRIMARY_RED_COLOR},
      generateBoxShadowStyle(
        0,
        13,
        RED_SHADOW_COLOR,
        1,
        25,
        30,
        RED_SHADOW_COLOR,
      ),
    ],
  };
};