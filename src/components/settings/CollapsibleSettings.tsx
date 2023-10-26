import {ActionPayload} from 'actions/interfaces';
import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {DomainPreference, PreferencePayload} from 'reducers/preferences.types';
import {Theme} from 'src/context/theme.context';
import {getCardStyle} from 'src/styles/card';
//TODO keep working here
type Props = {
  domainPref: DomainPreference;
  index: number;
  username: string;
  removePreference: (
    username: string,
    domain: string,
    request: string,
  ) => ActionPayload<PreferencePayload>;
  theme: Theme;
};

const CollapsibleSettings = ({
  domainPref,
  index,
  removePreference,
  username,
  theme,
}: Props) => {
  const [isCollapsed, collapse] = useState(false);
  const styles = getStyles(index);
  const renderCollapsed = () => {
    if (isCollapsed) return false;
    else
      return (
        <View style={styles.whitelistsContainer}>
          {domainPref.whitelisted_requests.map((e) => (
            <View style={styles.whitelistContainer} key={e}>
              <Text style={styles.whitelist}>{e.toUpperCase()}</Text>
              <TouchableOpacity
                onPress={() => {
                  removePreference(username, domainPref.domain, e);
                }}>
                <Text style={styles.whitelistClose}>X</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      );
  };
  return (
    <>
      <TouchableOpacity
        style={[styles.collapsible, getCardStyle(theme).defaultCardItem]}
        onPress={() => {
          collapse(!isCollapsed);
        }}>
        <Text style={styles.domain}>{domainPref.domain.toUpperCase()}</Text>
        <Text style={styles.domain}>▼</Text>
      </TouchableOpacity>
      {renderCollapsed()}
    </>
  );
};

const getStyles = (index: number) =>
  StyleSheet.create({
    collapsible: {
      backgroundColor: index % 2 === 0 ? 'lightgrey' : '#E5EEF7',
      marginHorizontal: -20,
      paddingVertical: 10,
      paddingHorizontal: 30,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    domain: {color: 'black'},
    whitelist: {color: 'black', paddingHorizontal: 50, paddingVertical: 5},
    whitelistClose: {
      color: 'black',
      fontWeight: 'bold',
      paddingHorizontal: 50,
      paddingVertical: 5,
    },
    whitelistsContainer: {flexDirection: 'column'},
    whitelistContainer: {flexDirection: 'row', justifyContent: 'space-between'},
  });

export default CollapsibleSettings;
