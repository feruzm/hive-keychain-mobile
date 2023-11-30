import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Theme} from 'src/context/theme.context';
import {PRIMARY_RED_COLOR} from 'src/styles/colors';
import Icon from './Icon';

interface BackToTopButtonProps {
  element: any;
  theme: Theme;
  isScrollView?: boolean;
}

export const BackToTopButton = (props: BackToTopButtonProps) => {
  const scrollToTop = () => {
    if (props.element && props.element.current) {
      try {
        if (!props.isScrollView) {
          props.element.current.scrollToIndex({animated: false, index: 0});
        } else {
          props.element.current.scrollTo({x: 0, y: 0, animated: true});
        }
      } catch (error) {
        console.log('Error scrolling list: ', {error});
      }
    }
  };

  return (
    <View style={styles.overlayButton}>
      <TouchableOpacity onPress={scrollToTop}>
        <Icon name={'arrow_up'} theme={props.theme} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayButton: {
    justifyContent: 'center',
    borderRadius: 100,
    alignItems: 'center',
    position: 'absolute',
    bottom: 5,
    right: 5,
    // borderWidth: 1,
    width: 45,
    height: 45,
    backgroundColor: PRIMARY_RED_COLOR,
  },
});
