import React, {useRef, useState} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import {WebView} from 'react-native-webview';
import Footer from './Footer';
import ProgressBar from './ProgressBar';
import {BrowserConfig} from 'utils/config';
import UrlModal from './UrlModal';
import {hive_keychain} from './HiveKeychainBridge';

export default ({data: {url, id}, active, updateTab, route}) => {
  const tabRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isVisible, toggleVisibility] = useState(false);

  const scrollY = new Animated.Value(0);
  const diffClampFooter = Animated.diffClamp(
    scrollY,
    0,
    BrowserConfig.FOOTER_HEIGHT,
  );
  const translateYFooter = diffClampFooter;

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
    setProgress(progress);
  };

  const onLoadEnd = ({
    nativeEvent: {canGoBack, canGoForward, loading, target, title, url},
  }) => {
    if (loading) {
      return;
    }
    setCanGoBack(canGoBack);
    setCanGoForward(canGoForward);
    setProgress(0);
    updateTab(id, {url});
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
      showOperationRequestModal(request_id, data);
    }
  };

  const showOperationRequestModal = (request_id, data) => {};
  return (
    <>
      <View style={[styles.container, !active && styles.hide]}>
        <ProgressBar progress={progress} />
        <Animated.View
          style={{
            transform: [
              {translateY: route.params ? route.params.translateYHeader : 0},
            ],
            marginBottom: -2 * BrowserConfig.FOOTER_HEIGHT,
            ...styles.footerAnimated,
          }}>
          <WebView
            ref={tabRef}
            source={{uri: url}}
            sharedCookiesEnabled
            injectedJavaScriptBeforeContentLoaded={hive_keychain}
            onMessage={onMessage}
            javascriptEnabled
            allowsInlineMediaPlayback
            onLoadEnd={onLoadEnd}
            onLoadProgress={onLoadProgress}
            onScroll={(e) => {
              scrollY.setValue(e.nativeEvent.contentOffset.y);
              route.params.scrollYHeader.setValue(
                e.nativeEvent.contentOffset.y,
              );
              console.log(-1 * diffClampFooter._value);
            }}
          />
        </Animated.View>
      </View>
      {active && (
        <Animated.View
          style={{
            transform: [{translateY: translateYFooter}],
            height: BrowserConfig.FOOTER_HEIGHT,
          }}>
          <Footer
            canGoBack={canGoBack}
            canGoForward={canGoForward}
            goBack={goBack}
            goForward={goForward}
            reload={reload}
            height={BrowserConfig.FOOTER_HEIGHT}
            toggleSearchBar={() => {
              toggleVisibility(true);
            }}
            goHome={() => {
              goHome(id);
            }}
          />
        </Animated.View>
      )}
      {active && (
        <UrlModal
          isVisible={isVisible}
          toggle={toggleVisibility}
          onNewSearch={onNewSearch}
          initialValue={url}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  hide: {flex: 0, opacity: 0, display: 'none', width: 0, height: 0},
  footerAnimated: {flex: 1},
});
