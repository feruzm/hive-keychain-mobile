import {Page} from 'actions/interfaces';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import HistoryItem from '../urlModal/HistoryItem';

type Props = {
  favorites: Page[];
};

export default ({favorites}: Props) => {
  return (
    <View style={styles.container}>
      {favorites.length ? (
        favorites.map((h) => (
          <HistoryItem
            data={h}
            onSubmit={(e) => {
              console.log(e);
            }}
          />
        ))
      ) : (
        <Text style={styles.text}>Nothing to show</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    marginTop: 30,
    flex: 1,
  },
  text: {alignSelf: 'center'},
});
