import {ExtendedAccount} from '@hiveio/dhive';
import {CurrencyPrices, GlobalProperties} from 'actions/interfaces';
import React from 'react';
import {StyleSheet, Text} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {Theme} from 'src/context/theme.context';
import {getColors} from 'src/styles/colors';
import {body_primary_body_1, headerH2Primary} from 'src/styles/typography';
import {withCommas} from 'utils/format';
import {getAccountValue} from 'utils/price';

type Props = {
  prices: CurrencyPrices;
  account: ExtendedAccount;
  title: string;
  properties: GlobalProperties;
  theme: Theme;
};
const AccountValue = ({prices, account, properties, theme, title}: Props) => {
  let accountValue = '...';
  if (prices.bitcoin && account && properties.globals) {
    accountValue = getAccountValue(account, prices, properties.globals) + '';
    accountValue = isNaN(+accountValue)
      ? '...'
      : `$ ${withCommas(accountValue, 2)}`;
  }
  const styles = getStyles(theme);

  return (
    <TouchableOpacity
      onLongPress={() => {
        if (account.name === 'stoodkev') {
          //TODO quentin check if needed bellow
          //@ts-ignore
          //throw new Error('test error');
          user.crash.test();
        }
      }}>
      <Text style={[styles.title, styles.textBase, styles.textCentered]}>
        {title}
      </Text>
      <Text style={[styles.accountValue, styles.textBase]}>{accountValue}</Text>
    </TouchableOpacity>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    accountValue: {
      ...headerH2Primary,
      fontSize: 45,
      textAlign: 'center',
    },
    title: {...body_primary_body_1, opacity: 0.6},
    textBase: {
      color: getColors(theme).secondaryText,
    },
    textCentered: {
      textAlign: 'center',
    },
  });

export default AccountValue;
