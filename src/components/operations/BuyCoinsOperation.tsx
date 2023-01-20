import ActiveOperationButton from 'components/form/ActiveOperationButton';
import AssetImage from 'components/ui/AssetImage';
import Separator from 'components/ui/Separator';
import React, {useRef, useState} from 'react';
import {
  FlatList,
  Linking,
  StyleSheet,
  Switch,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {connect, ConnectedProps} from 'react-redux';
import ShoppingCartIconBlack from 'src/assets/wallet/icon_shopping_cart_black.svg';
import {BuyCoinType} from 'src/enums/operations.enum';
import {BuyCoinsListItem} from 'src/reference-data/buy-coins-list-item.list';
import {RootState} from 'store';
import {translate} from 'utils/localize';
import Operation from './Operation';

export type BuyCoinsprops = {
  currency: BuyCoinType;
};
type Props = PropsFromRedux & BuyCoinsprops;

const BuyCoinsOperation = ({user, currency}: Props) => {
  const flatListRef = useRef();
  const [isEnabled, setIsEnabled] = useState(
    currency === BuyCoinType.BUY_HDB ? true : false,
  );

  const join2Arrays = (a: any, b: any): [] => {
    const newArray = a.concat(b);
    return newArray;
  };

  const renderItems = (item: any) => {
    const handleOnClick = () => {
      //TODO add app browser navigation as well.
      Linking.openURL(item.link);
    };

    if (item.titleKey) {
      return (
        <View style={styles.centeredView}>
          <Text style={styles.titleText}>{translate(item.titleKey)}</Text>
        </View>
      );
    } else if (item.name) {
      return (
        <View>
          <AssetImage nameImage={item.image.split('.')[0]} />
          <Text style={styles.marginHorizontal}>
            {translate(`wallet.operations.buy_coins.${item.description}`)}
          </Text>
          <Separator height={5} />
          <View style={styles.centeredView}>
            <ActiveOperationButton
              title={translate('wallet.operations.buy_coins.title_buy')}
              isLoading={false}
              onPress={handleOnClick}
              style={styles.buyButton}
            />
          </View>
          <Separator height={15} drawLine={true} />
        </View>
      );
    } else if (!item.name && item.image) {
      return (
        <View>
          <AssetImage
            onClick={handleOnClick}
            nameImage={item.image.split('.')[0]}
          />
          <Separator height={10} />
        </View>
      );
    }
  };

  const scrollToTop = () => {
    if (flatListRef && flatListRef.current) {
      (flatListRef.current as FlatList).scrollToIndex({
        animated: true,
        index: 0,
      });
    }
  };

  const {height} = useWindowDimensions();

  const styles = getDimensionedStyles(height);

  return (
    <Operation
      logo={<ShoppingCartIconBlack />}
      title={translate('wallet.operations.buy_coins.title_buy')}>
      <>
        <Separator />
        <View>
          <View style={styles.rowContainer}>
            <Text style={styles.switchText}>
              {translate('wallet.operations.buy_coins.title_hive')}
            </Text>
            <Switch
              trackColor={{false: '#767577', true: '#81b0ff'}}
              thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={(value: boolean) => {
                setIsEnabled(value);
                scrollToTop();
              }}
              value={isEnabled}
            />
            <Text style={styles.switchText}>
              {translate('wallet.operations.buy_coins.title_hbd')}
            </Text>
          </View>

          {/* Flatlist one list */}
          <FlatList
            ref={flatListRef}
            data={join2Arrays(
              BuyCoinsListItem(
                isEnabled ? BuyCoinType.BUY_HIVE : BuyCoinType.BUY_HDB,
                user.name,
              ).list,
              BuyCoinsListItem(
                isEnabled ? BuyCoinType.BUY_HIVE : BuyCoinType.BUY_HDB,
                user.name,
              ).exchanges,
            )}
            renderItem={(item) => renderItems(item.item)}
            style={{maxHeight: '90%'}}
          />
        </View>
      </>
    </Operation>
  );
};
const connector = connect((state: RootState) => {
  return {
    user: state.activeAccount,
  };
}, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

const getDimensionedStyles = (width: number) =>
  StyleSheet.create({
    rowContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    switchText: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    buyButton: {
      backgroundColor: '#68A0B4',
      width: width / 5,
      marginHorizontal: 0,
    },
    centeredView: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    marginHorizontal: {
      marginHorizontal: 12,
    },
    titleText: {
      fontWeight: 'bold',
      fontSize: 24,
    },
  });

export default connector(BuyCoinsOperation);
