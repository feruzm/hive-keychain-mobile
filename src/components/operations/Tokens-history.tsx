import {clearTokenHistory, loadTokenHistory} from 'actions/index';
import {BackToTopButton} from 'components/hive/Back-To-Top-Button';
import FocusAwareStatusBar from 'components/ui/FocusAwareStatusBar';
import Loader from 'components/ui/Loader';
import React, {useEffect, useRef, useState} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {ConnectedProps, connect} from 'react-redux';
import {Theme} from 'src/context/theme.context';
import {
  DelegateTokenTransaction,
  OperationsHiveEngine,
  TokenTransaction,
  TransferTokenTransaction,
} from 'src/interfaces/tokens.interface';
import {getColors} from 'src/styles/colors';
import {button_link_primary_medium} from 'src/styles/typography';
import {RootState} from 'store';
import {translate} from 'utils/localize';
import {
  IN_TOKENS_TRANSACTIONS,
  OUT_TOKENS_TRANSACTIONS,
  TokenTransactionUtils,
} from 'utils/token-transaction.utils';
import {TokenHistoryItemComponent} from './token-history-item';

export type TokenHistoryProps = {
  tokenBalance: string;
  tokenLogo: JSX.Element;
  currency: string;
  theme: Theme;
};

const TokensHistory = ({
  activeAccountName,
  currency,
  tokenHistory,
  theme,
  loadTokenHistory,
  clearTokenHistory,
  tokenLogo,
  tokensFilter,
}: TokenHistoryProps & PropsFromRedux) => {
  const [displayedTransactions, setDisplayedTransactions] = useState<
    TokenTransaction[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [displayScrollToTop, setDisplayedScrollToTop] = useState(false);
  const flatListRef = useRef();

  useEffect(() => {
    setLoading(true);
    loadTokenHistory(activeAccountName!, currency);
    return () => {
      clearTokenHistory();
    };
  }, []);

  useEffect(() => {
    if (tokenHistory.length > 0 && tokensFilter) {
      setLoading(true);
      const selectedTransactionTypes = Object.keys(
        tokensFilter.selectedTransactionTypes,
      ).filter((operation) => tokensFilter.selectedTransactionTypes[operation]);

      const isInOrOutSelected =
        tokensFilter.inSelected || tokensFilter.outSelected;

      let filteredTokenHistory = tokenHistory.filter((item) => {
        return (
          selectedTransactionTypes.includes(item.operation) ||
          selectedTransactionTypes.length === 0
        );
      });
      if (isInOrOutSelected) {
        if (tokensFilter.inSelected) {
          filteredTokenHistory = filteredTokenHistory.filter(
            (item) =>
              IN_TOKENS_TRANSACTIONS.includes(item.operation) ||
              (item.operation === OperationsHiveEngine.TOKENS_TRANSFER &&
                (item as TransferTokenTransaction).to === activeAccountName) ||
              (item.operation === OperationsHiveEngine.TOKENS_DELEGATE &&
                (item as DelegateTokenTransaction).delegatee ===
                  activeAccountName),
          );
        }
        if (tokensFilter.outSelected) {
          filteredTokenHistory = filteredTokenHistory.filter(
            (item) =>
              (OUT_TOKENS_TRANSACTIONS.includes(item.operation) &&
                item.operation === OperationsHiveEngine.TOKENS_TRANSFER &&
                (item as TransferTokenTransaction).to !== activeAccountName) ||
              (item.operation === OperationsHiveEngine.TOKENS_DELEGATE &&
                (item as DelegateTokenTransaction).delegator ===
                  activeAccountName),
          );
        }
      }
      if (tokensFilter.filterValue.trim().length > 0) {
        filteredTokenHistory = TokenTransactionUtils.applyAllTokensFilters(
          filteredTokenHistory,
          tokensFilter.filterValue,
        );
      }
      setDisplayedTransactions(filteredTokenHistory);
      setLoading(false);
    }
  }, [tokenHistory, tokensFilter]);

  const handleScroll = (event: any) => {
    const {y: innerScrollViewY} = event.nativeEvent.contentOffset;
    setDisplayedScrollToTop(innerScrollViewY >= 50);
  };

  const styles = getStyles(theme);

  const renderItem = (transaction: TokenTransaction) => {
    return (
      <TokenHistoryItemComponent
        theme={theme}
        transaction={transaction}
        useIcon={true}
      />
    );
  };

  return (
    <View style={styles.flex}>
      <FocusAwareStatusBar />
      {loading && (
        <View style={[styles.flex, styles.verticallyCentered]}>
          <Loader animating={true} />
        </View>
      )}

      {!loading && displayedTransactions.length > 0 && (
        <View style={styles.container}>
          <FlatList
            ref={flatListRef}
            data={displayedTransactions}
            renderItem={(transaction) => renderItem(transaction.item)}
            keyExtractor={(transaction) => transaction._id}
            onScroll={handleScroll}
            style={styles.listContainer}
          />
        </View>
      )}

      {!loading &&
        tokenHistory.length > 0 &&
        displayedTransactions.length === 0 && (
          <View style={[styles.flex, styles.verticallyCentered]}>
            <Text style={styles.textBold}>
              {translate('wallet.operations.history.no_transaction_or_clear')}
            </Text>
          </View>
        )}

      {/* ScrollToTop Button */}
      {!loading && displayScrollToTop && (
        <BackToTopButton element={flatListRef} theme={theme} />
      )}
      {/* END ScrollToTop Button */}
    </View>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccountName: state.activeAccount?.name,
    userTokens: state.userTokens,
    tokenHistory: state.tokenHistory as TokenTransaction[],
    tokensFilter: state.tokensFilters,
  };
};

const connector = connect(mapStateToProps, {
  loadTokenHistory,
  clearTokenHistory,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    flex: {
      flex: 1,
      marginTop: 20,
    },
    verticallyCentered: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    separator: {marginVertical: 3, borderBottomWidth: 1},
    logo: {justifyContent: 'center', alignItems: 'center'},
    rowContainer: {
      flexDirection: 'row',
    },
    title: {
      fontWeight: 'bold',
      fontSize: 18,
      marginLeft: 10,
    },
    marginBottom: {
      marginBottom: 5,
    },
    textBold: {
      ...button_link_primary_medium,
    },
    container: {
      height: '100%',
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      paddingTop: 25,
      backgroundColor: getColors(theme).secondaryCardBgColor,
    },
    listContainer: {
      paddingHorizontal: 25,
      backgroundColor: getColors(theme).secondaryCardBgColor,
    },
  });

export const TokensHistoryComponent = connector(TokensHistory);
