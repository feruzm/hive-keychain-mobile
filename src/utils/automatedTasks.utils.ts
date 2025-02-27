import AsyncStorage from '@react-native-community/async-storage';
import {ActiveAccount} from 'actions/interfaces';
import {KeychainStorageKeyEnum} from 'src/reference-data/keychainStorageKeyEnum';
import {ClaimsConfig} from './config';

const getClaims = async (username: string) => {
  const values: {[key: string]: any} = {};
  (
    await AsyncStorage.multiGet([
      KeychainStorageKeyEnum.CLAIM_ACCOUNTS,
      KeychainStorageKeyEnum.CLAIM_REWARDS,
      KeychainStorageKeyEnum.CLAIM_SAVINGS,
    ])
  ).forEach((item) => {
    values[`${item[0]}`] = item[1] ? JSON.parse(item[1]) : false;
  });

  const accountValue = values[KeychainStorageKeyEnum.CLAIM_ACCOUNTS]
    ? values[KeychainStorageKeyEnum.CLAIM_ACCOUNTS][username]
    : false;
  const rewardValue = values[KeychainStorageKeyEnum.CLAIM_REWARDS]
    ? values[KeychainStorageKeyEnum.CLAIM_REWARDS][username]
    : false;
  const savingsValue = values[KeychainStorageKeyEnum.CLAIM_SAVINGS]
    ? values[KeychainStorageKeyEnum.CLAIM_SAVINGS][username]
    : false;

  return {
    [KeychainStorageKeyEnum.CLAIM_ACCOUNTS]: accountValue,
    [KeychainStorageKeyEnum.CLAIM_REWARDS]: rewardValue,
    [KeychainStorageKeyEnum.CLAIM_SAVINGS]: savingsValue,
  };
};

const saveClaims = async (
  claimRewards: boolean,
  claimAccount: boolean,
  claimSavings: boolean,
  username: string,
) => {
  const values: {[key: string]: any} = {};
  (
    await AsyncStorage.multiGet([
      KeychainStorageKeyEnum.CLAIM_ACCOUNTS,
      KeychainStorageKeyEnum.CLAIM_REWARDS,
      KeychainStorageKeyEnum.CLAIM_SAVINGS,
    ])
  ).forEach((item) => {
    values[`${item[0]}`] = item[1] ? JSON.parse(item[1]) : false;
  });
  let allRewards = values[KeychainStorageKeyEnum.CLAIM_REWARDS] ?? {};
  let allAccounts = values[KeychainStorageKeyEnum.CLAIM_ACCOUNTS] ?? {};
  let allSavings = values[KeychainStorageKeyEnum.CLAIM_SAVINGS] ?? {};

  allRewards = {
    ...allRewards,
    [username]: claimRewards,
  };
  allAccounts = {
    ...allAccounts,
    [username]: claimAccount,
  };
  allSavings = {
    ...allSavings,
    [username]: claimSavings,
  };

  await AsyncStorage.multiSet([
    [KeychainStorageKeyEnum.CLAIM_REWARDS, JSON.stringify(allRewards)],
    [KeychainStorageKeyEnum.CLAIM_ACCOUNTS, JSON.stringify(allAccounts)],
    [KeychainStorageKeyEnum.CLAIM_SAVINGS, JSON.stringify(allSavings)],
  ]);
};

const updateClaim = async (
  username: string,
  enabled: boolean,
  claimType: KeychainStorageKeyEnum,
) => {
  let claims = JSON.parse(await AsyncStorage.getItem(claimType)) ?? {};
  claims = {
    ...claims,
    [username]: enabled,
  };
  await AsyncStorage.setItem(claimType, JSON.stringify(claims));
};

const canClaimSavingsErrorMessage = (
  activeAccount: ActiveAccount,
): string | undefined => {
  if (!activeAccount.keys.active) {
    return 'toast.claims.need_active_key_for_claim_savings';
  }
};

const canClaimRewardsErrorMessage = (
  activeAccount: ActiveAccount,
): string | undefined => {
  if (!activeAccount.keys.posting) {
    return 'toast.claims.need_posting_key_to_claim_rewards';
  }
};

const canClaimAccountErrorMessage = (
  activeAccount: ActiveAccount,
): string | undefined => {
  if (!activeAccount.keys.active) {
    return 'toast.claims.need_active_key_for_claim_accounts';
  } else if (activeAccount.rc.max_mana < ClaimsConfig.freeAccount.MIN_RC) {
    return 'toast.claims.not_enough_rc_to_claim_account';
  }
};

const AutomatedTasksUtils = {
  getClaims,
  saveClaims,
  updateClaim,
  canClaimSavingsErrorMessage,
  canClaimAccountErrorMessage,
  canClaimRewardsErrorMessage,
};

export default AutomatedTasksUtils;
