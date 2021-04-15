import React, {useRef, useState, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview';
import Footer from './Footer';
import ProgressBar from './ProgressBar';
import {BrowserConfig} from 'utils/config';
import UrlModal from './UrlModal';
import RequestModalContent from './RequestModalContent';
import {hive_keychain} from './HiveKeychainBridge';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  validateRequest,
  sendError,
  sendResponse,
  validateAuthority,
} from 'utils/keychain';
import {navigate, goBack as navigationGoBack} from 'utils/navigation';

export default ({data: {url, id}, active, updateTab, route, accounts}) => {
  const tabRef = useRef(null);
  const [searchUrl, setSearchUrl] = useState(url);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isVisible, toggleVisibility] = useState(false);
  const insets = useSafeAreaInsets();
  const FOOTER_HEIGHT = BrowserConfig.FOOTER_HEIGHT + insets.bottom;

  useEffect(() => {
    setSearchUrl(url);
  }, [url]);

  const goBack = () => {
    if (!canGoBack) {
      return;
    }
    const {current} = tabRef;
    current && current.goBack();
  };

  const goForward = () => {
    if (!canGoForward) {
      return;
    }
    const {current} = tabRef;
    current && current.goForward();
  };

  const reload = () => {
    const {current} = tabRef;
    current && current.reload();
  };

  const goHome = () => {
    updateTab(id, {url: BrowserConfig.HOMEPAGE_URL});
  };

  const onLoadProgress = ({nativeEvent: {progress}}) => {
    setProgress(progress === 1 ? 0 : progress);
  };

  const onLoadStart = ({nativeEvent: {url}}) => {
    updateTab(id, {url});
  };

  const onLoadEnd = ({nativeEvent: {canGoBack, canGoForward, loading}}) => {
    setProgress(0);
    if (loading) {
      return;
    }
    setCanGoBack(canGoBack);
    setCanGoForward(canGoForward);
  };

  const onNewSearch = (url) => {
    const {current} = tabRef;
    if (current) {
      current.stopLoading();
      current.injectJavaScript(
        `(function(){window.location.href = '${url}' })()`,
      );
    }
  };

  const onMessage = ({nativeEvent}) => {
    const {name, request_id, data} = JSON.parse(nativeEvent.data);
    const {current} = tabRef;
    if (name === 'swHandshake_hive') {
      current.injectJavaScript(
        'window.hive_keychain.onAnswerReceived("hive_keychain_handshake")',
      );
    } else if (name === 'swRequest_hive') {
      if (validateRequest(data)) {
        if (validateAuthority(accounts, data)) {
          showOperationRequestModal(request_id, data);
        } else {
          sendError(tabRef, {
            error: 'user_cancel',
            message: 'Request was canceled by the user.',
            data,
            request_id,
          });
        }
      } else {
        sendError(tabRef, {
          error: 'incomplete',
          message: 'Incomplete data or wrong format',
          data,
          request_id,
        });
      }
    }
  };

  const showOperationRequestModal = (request_id, data) => {
    const onForceCloseModal = () => {
      navigationGoBack();
      sendError(tabRef, {
        error: 'user_cancel',
        message: 'Request was canceled by the user.',
        data,
        request_id,
      });
    };
    navigate('ModalScreen', {
      modalContent: (
        <RequestModalContent
          request={{...data, request_id}}
          accounts={accounts}
          onForceCloseModal={onForceCloseModal}
          sendError={(obj) => {
            sendError(tabRef, obj);
          }}
          sendResponse={(obj) => {
            sendResponse(tabRef, obj);
          }}
        />
      ),
      onForceCloseModal,
    });
  };

  return (
    <>
      <View style={[styles.container, !active && styles.hide]}>
        <ProgressBar progress={progress} />

        <WebView
          ref={tabRef}
          source={{uri: url}}
          sharedCookiesEnabled
          injectedJavaScriptBeforeContentLoaded={hive_keychain}
          onMessage={onMessage}
          bounces={false}
          incognito
          javascriptEnabled
          allowsInlineMediaPlayback
          onLoadEnd={onLoadEnd}
          onLoadStart={onLoadStart}
          onLoadProgress={onLoadProgress}
        />
      </View>
      {active && (
        <Footer
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          goBack={goBack}
          goForward={goForward}
          reload={reload}
          height={FOOTER_HEIGHT}
          toggleSearchBar={() => {
            const {current} = tabRef;
            console.log(current, tabRef);
            toggleVisibility(true);
          }}
          goHome={() => {
            goHome(id);
          }}
        />
      )}
      {active && (
        <UrlModal
          isVisible={isVisible}
          toggle={toggleVisibility}
          onNewSearch={onNewSearch}
          url={searchUrl}
          setUrl={setSearchUrl}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  hide: {flex: 0, opacity: 0, display: 'none', width: 0, height: 0},
});
