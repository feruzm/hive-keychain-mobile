import {DrawerNavigationHelpers} from '@react-navigation/drawer/lib/typescript/src/types';
import {createStackNavigator} from '@react-navigation/stack';
import Icon from 'components/hive/Icon';
import {
  RootStackParam,
  TemplateStackNavigationProps,
} from 'navigators/Root.types';
import React, {useContext} from 'react';
import {StyleSheet, useWindowDimensions} from 'react-native';
import {Theme, ThemeContext} from 'src/context/theme.context';
import {Icons} from 'src/enums/icons.enums';
import {getColors} from 'src/styles/colors';
import {
  getFontSizeSmallDevices,
  headlines_primary_headline_2,
} from 'src/styles/typography';

const Stack = createStackNavigator<RootStackParam>();

/**
 * Note: Used to render any component we need, as a stack screen, using some themed styles.
 * @param titleScreen Title of the screen stack
 * @param component Child component(s) to render, passing its props.
 */
export default ({navigation, route}: TemplateStackNavigationProps) => {
  const {
    titleScreen,
    component,
    hideCloseButton,
    extraActionOnBack,
  } = route.params;
  const {theme} = useContext(ThemeContext);
  const styles = getStyles(theme, useWindowDimensions().height);

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TemplateStack"
        component={() => component}
        options={({navigation}) => ({
          headerStyle: styles.header,
          headerTitleStyle: styles.headerTitle,
          headerTitleAlign: 'center',
          title: titleScreen,
          headerRightContainerStyle: styles.headerRightContainer,
          headerLeftContainerStyle: styles.headerLeftContainer,
          headerRight: !hideCloseButton
            ? () => (
                <Icon
                  name={Icons.CLOSE_CIRCLE}
                  theme={theme}
                  onClick={() => navigation.navigate('WALLET')}
                  color={getColors(theme).iconBW}
                />
              )
            : null,
          headerLeft: () => (
            <Icon
              name={Icons.ARROW_LEFT}
              theme={theme}
              onClick={() => {
                if (extraActionOnBack) extraActionOnBack();
                (navigation as DrawerNavigationHelpers).goBack();
              }}
              color={getColors(theme).iconBW}
            />
          ),
        })}
      />
    </Stack.Navigator>
  );
};

const getStyles = (theme: Theme, height: number) =>
  StyleSheet.create({
    header: {
      backgroundColor: getColors(theme).primaryBackground,
      borderWidth: 0,
      elevation: 0,
    },
    headerTitle: {
      ...headlines_primary_headline_2,
      color: getColors(theme).primaryText,
      fontSize: getFontSizeSmallDevices(
        height,
        {...headlines_primary_headline_2}.fontSize,
      ),
    },
    headerRightContainer: {
      marginRight: 16,
    },
    headerLeftContainer: {
      marginLeft: 16,
    },
  });
