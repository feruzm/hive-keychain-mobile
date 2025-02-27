import {ActiveAccount} from 'actions/interfaces';
import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {ClaimReward} from 'src/interfaces/transaction.interface';
import {Height} from 'utils/common.types';
import {withCommas} from 'utils/format';
import {translate} from 'utils/localize';
import Icon from './Icon';

type Props = {
  user: ActiveAccount;
  transaction: ClaimReward;
  token?: boolean;
  locale: string;
  useIcon?: boolean;
};

const ClaimRewardTransactionComponent = ({
  transaction,
  user,
  locale,
  token = false,
  useIcon,
}: Props) => {
  const [toggle, setToggle] = useState(false);
  const username = user.name;
  const {timestamp, hbd, hp, hive} = transaction;
  const color = '#3BB26E';
  const date = new Date(
    token ? ((timestamp as unknown) as number) * 1000 : timestamp,
  ).toLocaleDateString([locale], {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  });

  const isZeroAmount = (amount: string) => {
    return Number(amount.split(' ')[0]) <= 0;
  };

  const styles = getDimensionedStyles({
    ...useWindowDimensions(),
    color,
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        setToggle(!toggle);
      }}>
      <View style={styles.main}>
        <View style={[styles.row, styles.alignedContent]}>
          {useIcon && <Icon name={transaction.type} />}
          <Text>{date}</Text>
        </View>
        <View style={styles.rowContainer}>
          {hbd && !isZeroAmount(hbd) && (
            <Text style={styles.username}>
              <Text style={{color}}>{withCommas(hbd)} </Text>
              <Text>
                {translate('wallet.claim.info_claim_rewards', {
                  currency: 'HBD',
                })}
              </Text>
            </Text>
          )}
          {hp && !isZeroAmount(hp) && (
            <Text style={styles.username}>
              <Text style={{color}}> {withCommas(hp)} </Text>
              <Text>
                {translate('wallet.claim.info_claim_rewards', {
                  currency: 'HP',
                })}
              </Text>
            </Text>
          )}
          {hive && !isZeroAmount(hive) && (
            <Text style={styles.username}>
              <Text style={{color}}>{withCommas(hive)} </Text>
              <Text>
                {translate('wallet.claim.info_claim_rewards', {
                  currency: 'HIVE',
                })}
              </Text>
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const getDimensionedStyles = ({height, color}: Height & {color: string}) =>
  StyleSheet.create({
    container: {
      borderBottomWidth: 1,
      borderColor: 'black',
      padding: height * 0.01,
    },
    main: {
      display: 'flex',
      flexDirection: 'column',
    },
    username: {},
    amount: {color},
    row: {
      display: 'flex',
      flexDirection: 'row',
    },
    rowContainer: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    alignedContent: {
      alignItems: 'center',
    },
  });

export default ClaimRewardTransactionComponent;
