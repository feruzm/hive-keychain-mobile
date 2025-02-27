import {loadAccount} from 'actions/index';
import {Token, TokenBalance} from 'actions/interfaces';
import Delegate from 'assets/wallet/icon_delegate_dark.svg';
import Loader from 'components/ui/Loader';
import Separator from 'components/ui/Separator';
import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {connect, ConnectedProps} from 'react-redux';
import IconBack from 'src/assets/Icon_arrow_back_black.svg';
import {RootState} from 'store';
import {
  getIncomingTokenDelegations,
  getOutgoingTokenDelegations,
  TokenDelegation,
} from 'utils/hiveEngine';
import {getCurrencyProperties} from 'utils/hiveReact';
import {translate} from 'utils/localize';
import Balance from './Balance';
import IncomingOutGoingTokenDelegationItem from './Incoming-outgoing-token-delegation-item';
import Operation from './Operation';

type Props = PropsFromRedux & {
  delegationType: string;
  total: string;
  token: TokenBalance;
  tokenLogo: JSX.Element;
  tokenInfo: Token;
  gobackAction?: () => void;
};

const IncomingOutGoingTokenDelegations = ({
  delegationType,
  total,
  token,
  tokenLogo,
  user,
  tokenInfo,
  loadAccount,
  properties,
  gobackAction,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [delegationList, setDelegationList] = useState<TokenDelegation[]>([]);

  useEffect(() => {
    setLoading(true);
    init();
  }, []);

  const init = async () => {
    let delegations: TokenDelegation[];

    if (delegationType === 'incoming') {
      delegations = await getIncomingTokenDelegations(user.name!, token.symbol);
    } else {
      delegations = await getOutgoingTokenDelegations(user.name!, token.symbol);
    }

    setDelegationList(delegations);
    setLoading(false);
  };

  const renderListItem = (tokenDelegation: TokenDelegation) => {
    return (
      <IncomingOutGoingTokenDelegationItem
        tokenDelegation={tokenDelegation}
        delegationType={delegationType}
        tokenLogo={tokenLogo}
        token={token}
        tokenInfo={tokenInfo}
      />
    );
  };

  const {color} = getCurrencyProperties(token.symbol);
  const styles = getDimensionedStyles(color);

  const renderIconComponent = () => {
    return gobackAction ? (
      <View style={styles.rowContainer}>
        <TouchableOpacity onPress={gobackAction} style={styles.goBackButton}>
          <IconBack />
        </TouchableOpacity>
      </View>
    ) : (
      <Delegate />
    );
  };

  return (
    <Operation
      logo={renderIconComponent()}
      title={translate(`wallet.operations.token_delegation.${delegationType}`)}>
      <>
        {delegationType === 'outgoing' && (
          <Text style={{marginTop: 5}}>
            {translate(
              'wallet.operations.token_delegation.undelegation_cooldown_disclaimer',
              {
                symbol: token.symbol,
                undelegationCooldown: tokenInfo.undelegationCooldown,
              },
            )}
          </Text>
        )}
        <Separator />
        <Balance
          currency={token.symbol}
          account={user.account}
          globalProperties={properties.globals}
          isHiveEngine
          tokenLogo={tokenLogo}
          tokenBalance={total}
        />
        {loading && (
          <View style={styles.flex}>
            <Loader animating={true} />
          </View>
        )}
        <Separator />
        {!loading && delegationList.length > 0 && (
          <FlatList
            data={delegationList}
            renderItem={(tokenDelegation) =>
              renderListItem(tokenDelegation.item)
            }
            keyExtractor={(tokenDelegation) =>
              tokenDelegation.created.toString()
            }
          />
        )}
      </>
    </Operation>
  );
};

const getDimensionedStyles = (color: string) =>
  StyleSheet.create({
    currency: {fontWeight: 'bold', fontSize: 18, color},
    rowContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    goBackButton: {
      margin: 7,
    },
    flex: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

const connector = connect(
  (state: RootState) => {
    return {
      properties: state.properties,
      user: state.activeAccount,
    };
  },
  {loadAccount},
);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(IncomingOutGoingTokenDelegations);
