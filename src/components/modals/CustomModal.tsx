import React from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import {Dimensions as Dim} from 'utils/common.types';

type Props = {
  bottomHalf: boolean;
  boxBackgroundColor?: string;
  outsideClick: () => void;
  fixedHeight?: number;
};
type InnerProps = {height: number; width: number};
class CustomModal extends React.Component<Props, {}> implements InnerProps {
  height;
  width;
  fixedHeight;
  constructor(props: Props) {
    super(props);
    const {height, width} = Dimensions.get('window');
    this.height = height;
    this.width = width;
    this.fixedHeight = props.fixedHeight;
  }
  render() {
    let modalHeight = this.props.bottomHalf ? this.height / 2 : this.height;
    let styles = StyleSheetFactory.getSheet({
      modalHeight: modalHeight,
      height: this.height,
      width: this.width,
      fixedHeight: this.fixedHeight,
    });
    return (
      <KeyboardAvoidingView
        style={styles.fullHeight}
        behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <View style={styles.mainContainer}>
          <TouchableWithoutFeedback
            style={{height: '100%'}}
            onPress={() => {
              this.props.outsideClick();
            }}></TouchableWithoutFeedback>
          <View
            style={
              this.fixedHeight ? styles.modalWrapperFixed : styles.modalWrapper
            }>
            <View style={styles.modalContainer}>
              <LinearGradient
                start={{x: 0, y: 0}}
                end={{x: 0, y: 1}}
                colors={['white', '#B9C9D6']}
                style={styles.gradient}>
                {this.props.children}
              </LinearGradient>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

class StyleSheetFactory {
  static getSheet({
    modalHeight,
    width,
    height,
    fixedHeight,
  }: Dim & {modalHeight: number; fixedHeight: number}) {
    console.log(fixedHeight);
    const styles = StyleSheet.create({
      fullHeight: {height: '100%'},
      mainContainer: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'flex-end',
      },
      modalWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: modalHeight,
        maxHeight: 0.85 * height,
        height: 'auto',
      },
      modalWrapperFixed: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        height: fixedHeight * height,
      },
      modalContainer: {
        backgroundColor: 'white',
        width: '100%',
        height: '100%',
        borderWidth: 1,
        borderColor: 'white',
        borderStyle: 'solid',
        borderRadius: 10,
      },
      gradient: {
        width: '100%',
        height: '100%',
        flex: 0,
        margin: 0,
        borderRadius: 10,
        padding: 0,
        paddingHorizontal: width * 0.05,
        paddingVertical: width * 0.05,
      },
    });

    return styles;
  }
}

export default CustomModal;
