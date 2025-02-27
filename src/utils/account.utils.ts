import {ClaimAccountOperation} from '@hiveio/dhive';
import {Account, AccountKeys, ActiveAccount, RC} from 'actions/interfaces';
import {ClaimsConfig} from './config';
import {broadcast, getClient, getData} from './hive';
import {translate} from './localize';

const addAuthorizedAccount = async (
  username: string,
  authorizedAccount: string,
  existingAccounts: Account[],
  simpleToast?: any,
): Promise<AccountKeys> => {
  let localAuthorizedAccount: Account;

  if (username.trim().length === 0 || authorizedAccount.trim().length === 0)
    throw new Error('Please fill the fields');
  if (
    existingAccounts
      .map((localAccount: Account) => localAccount.name)
      .includes(username)
  ) {
    if (simpleToast) {
      simpleToast.show(translate('toast.account_already'), simpleToast.LONG);
      return;
    }
    throw new Error(translate('toast.account_already'));
  }
  if (
    !existingAccounts
      .map((localAccount: Account) => localAccount.name)
      .includes(authorizedAccount)
  ) {
    if (simpleToast) return;
    throw new Error(translate('toast.no_auth_account', {authorizedAccount}));
  } else {
    localAuthorizedAccount = existingAccounts.find(
      (localAccount: Account) => localAccount.name,
    )!;
  }

  const hiveAccounts = await getClient().database.getAccounts([username]);

  if (!hiveAccounts || hiveAccounts.length === 0) {
    if (simpleToast) {
      simpleToast.show(translate('toast.incorrect_user'), simpleToast.LONG);
      return;
    }
    throw new Error(translate('toast.incorrect_user'));
  }
  let hiveAccount = hiveAccounts[0];

  const activeKeyInfo = hiveAccount.active;
  const postingKeyInfo = hiveAccount.posting;

  let keys: AccountKeys = {};

  const activeAuth = activeKeyInfo.account_auths.find(
    (accountAuth) => accountAuth[0] === authorizedAccount,
  );
  const postingAuth = postingKeyInfo.account_auths.find(
    (accountAuth) => accountAuth[0] === authorizedAccount,
  );

  if (!activeAuth && !postingAuth) {
    if (simpleToast) return;
    throw new Error(
      translate('toast.accounts_no_auth', {authorizedAccount, username}),
    );
  }

  if (activeAuth && activeAuth[1] >= activeKeyInfo.weight_threshold) {
    keys.active = existingAccounts.filter(
      (account) => account.name === authorizedAccount,
    )[0].keys.active;
    keys.activePubkey = `@${authorizedAccount}`;
  }
  if (postingAuth && postingAuth[1] >= postingKeyInfo.weight_threshold) {
    keys.posting = existingAccounts.filter(
      (account) => account.name === authorizedAccount,
    )[0].keys.posting;
    keys.postingPubkey = `@${authorizedAccount}`;
  }

  return keys;
};

const doesAccountExist = async (username: string) => {
  return (await AccountUtils.getAccount(username)).length > 0;
};

const getAccount = async (username: string) => {
  return getClient().database.getAccounts([username]);
};

const getAccounts = async (usernames: string[]) => {
  return getClient().database.getAccounts(usernames);
};

const getRCMana = async (username: string) => {
  const result = await getData('rc_api.find_rc_accounts', {
    accounts: [username],
  });

  let manabar = result.rc_accounts[0].rc_manabar;
  const max_mana = Number(result.rc_accounts[0].max_rc);

  const delta: number = Date.now() / 1000 - manabar.last_update_time;
  let current_mana = Number(manabar.current_mana) + (delta * max_mana) / 432000;
  let percentage: number = +((current_mana / max_mana) * 100).toFixed(2);

  if (!isFinite(percentage) || percentage < 0) {
    percentage = 0;
  } else if (percentage > 100) {
    percentage = 100;
  }

  return {
    ...result.rc_accounts[0],
    percentage: percentage,
  };
};

const claimAccounts = async (rc: RC, activeAccount: ActiveAccount) => {
  const freeAccountConfig = ClaimsConfig.freeAccount;
  if (
    activeAccount.rc.percentage > freeAccountConfig.MIN_RC_PCT &&
    parseFloat(rc.rc_manabar.current_mana) > freeAccountConfig.MIN_RC
  ) {
    console.log(`Claiming free account for @${activeAccount.name}`);

    return await broadcast(activeAccount.keys.active!, [
      [
        'claim_account',
        {
          creator: activeAccount.name,
          extensions: [],
          fee: '0.000 HIVE',
        },
      ] as ClaimAccountOperation,
    ]);
  } else console.log('Not enough RC% to claim account');
};

const AccountUtils = {
  addAuthorizedAccount,
  doesAccountExist,
  getAccount,
  getAccounts,
  getRCMana,
  claimAccounts,
};

export default AccountUtils;
