import {
  ADD_TO_BROWSER_HISTORY,
  CLEAR_BROWSER_HISTORY,
  ADD_TO_BROWSER_FAVORITES,
  REMOVE_FROM_BROWSER_FAVORITES,
  ADD_BROWSER_TAB,
  CLOSE_BROWSER_TAB,
  UPDATE_BROWSER_TAB,
  CLOSE_ALL_BROWSER_TABS,
  SET_ACTIVE_BROWSER_TAB,
} from './types';

export function addToHistory(payload) {
  return {
    type: ADD_TO_BROWSER_HISTORY,
    payload,
  };
}

export function clearHistory() {
  return {
    type: CLEAR_BROWSER_HISTORY,
  };
}

export function addToFavorites(url) {
  return {
    type: ADD_TO_BROWSER_FAVORITES,
    payload: {url},
  };
}

export function removeFromFavorites(url) {
  return {
    type: REMOVE_FROM_BROWSER_FAVORITES,
    payload: {url},
  };
}

export const addTabIfNew = (url) => (dispatch, getState) => {
  if (getState().browser.tabs.some((t) => t.url === url)) {
    return;
  }
  const id = Date.now();
  dispatch({
    type: ADD_BROWSER_TAB,
    payload: {url, id},
  });
  dispatch(changeTab(id));
};

export function addTab(url) {
  return {
    type: ADD_BROWSER_TAB,
    payload: {url, id: Date.now()},
  };
}

export function closeTab(id) {
  return {
    type: CLOSE_BROWSER_TAB,
    payload: {id},
  };
}

export function closeAllTabs() {
  return {
    type: CLOSE_ALL_BROWSER_TABS,
  };
}

export function changeTab(id) {
  return {
    type: SET_ACTIVE_BROWSER_TAB,
    payload: {id},
  };
}

export function updateTab(id, data) {
  return {
    type: UPDATE_BROWSER_TAB,
    payload: {id, data},
  };
}