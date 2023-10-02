import {loadTokens, loadTokensMarket, loadUserTokens} from 'actions/index';
import PreferencesIcon from 'assets/new_UI/candle-2.svg';
import SearchIcon from 'assets/new_UI/search.svg';
import SettingsIcon from 'assets/new_UI/setting.svg';
import CustomSearchBar from 'components/form/CustomSearchBar';
import EngineTokenDisplay from 'components/hive/EngineTokenDisplay';
import HiveEngineAccountValue from 'components/hive/HiveEngineAccountValue';
import CustomIconButton from 'components/ui/CustomIconButton';
import Loader from 'components/ui/Loader';
import Separator from 'components/ui/Separator';
import React, {useContext, useEffect, useState} from 'react';
import {
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {ConnectedProps, connect} from 'react-redux';
import {Theme, ThemeContext} from 'src/context/theme.context';
import {DARKBLUELIGHTER, getColors} from 'src/styles/colors';
import {body_primary_body_1} from 'src/styles/typography';
import {RootState} from 'store';
import {logScreenView} from 'utils/analytics';
import {hiveEngineWebsiteURL} from 'utils/config';
import {capitalizeSentence} from 'utils/format';
import {getHiveEngineTokenValue} from 'utils/hiveEngine';
import {translate} from 'utils/localize';

interface TokensProps {
  //TODO remove this prop after refactoring UI & old code.
  new_ui?: boolean;
}

const Tokens = ({
  user,
  loadTokens,
  loadUserTokens,
  loadTokensMarket,
  tokens,
  userTokens,
  prices,
  tokensMarket,
  new_ui,
}: PropsFromRedux & TokensProps) => {
  useEffect(() => {
    loadTokens();
    loadTokensMarket();
  }, [loadTokens, loadTokensMarket]);

  useEffect(() => {
    logScreenView('EngineWalletScreen');
  }, []);

  useEffect(() => {
    if (user.name) {
      loadUserTokens(user.name);
    }
  }, [loadUserTokens, user.name]);

  const {theme} = useContext(ThemeContext);

  const [toggled, setToggled] = useState<number>(null);

  const styles = getStyles(theme);

  const renderContent = () => {
    if (userTokens.loading || !tokensMarket?.length) {
      return (
        <View style={{flex: 1, justifyContent: 'center'}}>
          <Loader animating />
        </View>
      );
    } else if (userTokens.list?.length) {
      const list = userTokens.list.sort((a, b) => {
        return (
          getHiveEngineTokenValue(b, tokensMarket) -
          getHiveEngineTokenValue(a, tokensMarket)
        );
      });
      return (
        <FlatList
          data={list}
          contentContainerStyle={styles.flatlist}
          keyExtractor={(item) => item._id.toString()}
          ItemSeparatorComponent={() => <Separator height={10} />}
          renderItem={({item}) => (
            <EngineTokenDisplay
              token={item}
              tokensList={tokens}
              market={tokensMarket}
              toggled={toggled === item._id}
              setToggle={() => {
                if (toggled === item._id) setToggled(null);
                else setToggled(item._id);
              }}
            />
          )}
        />
      );
    } else {
      return (
        <Text style={styles.no_tokens}>{translate('wallet.no_tokens')}</Text>
      );
    }
  };

  return new_ui ? (
    <View style={styles.containerTokenScreen}>
      <Separator />
      <View style={styles.containerInfoText}>
        <Text style={[styles.textInfo, styles.textJustified]}>
          {capitalizeSentence(translate('wallet.operations.tokens.info'))}
        </Text>
      </View>
      <View style={styles.containerInfoText}>
        <TouchableOpacity onPress={() => Linking.openURL(hiveEngineWebsiteURL)}>
          <Text style={[styles.textInfo, styles.textUnderlined]}>
            {hiveEngineWebsiteURL}
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          flexDirection: 'row',
          height: 50,
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 35,
          marginTop: 35,
        }}>
        <CustomSearchBar
          theme={theme}
          rightIcon={
            <TouchableOpacity>
              <SearchIcon />
            </TouchableOpacity>
          }
          onChangeText={(text) => console.log('TODO!!', {text})}
        />
        <CustomIconButton
          theme={theme}
          lightThemeIcon={<SettingsIcon {...styles.icon} />}
          darkThemeIcon={<SettingsIcon {...styles.icon} />}
          //TODO finish bellow
          onPress={() => {}}
          additionalContainerStyle={styles.iconButton}
        />
        <CustomIconButton
          theme={theme}
          lightThemeIcon={<PreferencesIcon {...styles.icon} />}
          darkThemeIcon={<PreferencesIcon {...styles.icon} />}
          //TODO finish bellow
          onPress={() => {}}
          additionalContainerStyle={styles.iconButton}
        />
      </View>
      {renderContent()}
    </View>
  ) : (
    //TODO OLD code
    <View style={styles.container}>
      <Separator />
      <HiveEngineAccountValue
        prices={prices}
        tokens={userTokens.list}
        tokensMarket={tokensMarket}
      />
      <Separator />
      {renderContent()}
    </View>
  );
  //END OLD code
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {flex: 1},
    flatlist: {paddingBottom: 20},
    no_tokens: {
      fontWeight: 'bold',
      color: 'black',
      fontSize: 16,
      marginVertical: 20,
    },
    //new UI related
    containerTokenScreen: {
      flex: 1,
      // paddingHorizontal: 15,
    },
    containerInfoText: {
      padding: 10,
    },
    textInfo: {
      lineHeight: 22.05,
      ...body_primary_body_1,
      opacity: 0.6,
      color: getColors(theme).secondaryText,
    },
    textUnderlined: {
      textDecorationLine: 'underline',
    },
    textJustified: {
      textAlign: 'justify',
    },
    iconButton: {
      borderRadius: 20,
      borderColor: theme === Theme.DARK ? DARKBLUELIGHTER : null,
      borderWidth: theme === Theme.DARK ? 1 : 0,
      backgroundColor: getColors(theme).cardBgLighter,
      width: 45,
      height: 45,
      justifyContent: 'center',
      alignItems: 'center',
    },
    icon: {
      width: 22,
      height: 22,
    },
  });

const mapStateToProps = (state: RootState) => {
  return {
    user: state.activeAccount,
    tokens: state.tokens,
    userTokens: state.userTokens,
    tokensMarket: state.tokensMarket,
    prices: state.currencyPrices,
  };
};
const connector = connect(mapStateToProps, {
  loadTokens,
  loadUserTokens,
  loadTokensMarket,
});
type PropsFromRedux = ConnectedProps<typeof connector>;
export default connector(Tokens);
