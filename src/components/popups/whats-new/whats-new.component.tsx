import Carousel from 'components/carousel/carousel';
import {WalletNavigation} from 'navigators/MainDrawer.types';
import React, {useEffect, useState} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {translate} from 'utils/localize';
import {navigate} from 'utils/navigation';
import {WhatsNewContent} from './whats-new.interface';

interface Props {
  onOverlayClick: () => void;
  content: WhatsNewContent;
  navigation: WalletNavigation;
}

interface ImageItems {
  source: string;
}

const WhatsNew = ({onOverlayClick, content, navigation}: Props): null => {
  const [pageIndex, setPageIndex] = useState(0);
  const [images, setImages] = useState<JSX.Element[]>();
  const [ready, setReady] = useState(false);
  const locale = 'en'; // later use getUILanguage()

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const imgs: ImageItems[] = [];
    for (const feature of content.features[locale]) {
      const imageItem: ImageItems = {
        source: feature.image,
      };
      imgs.push(imageItem);
    }
    const Images = imgs.map((img, index) => {
      console.log({index});
      return <Image source={{uri: img.source}} style={styles.whatsNewImage} />;
    });
    setImages(Images);
    setReady(true);

    navigate('ModalScreen', {
      name: 'Whats_new_popup',
      modalContent: renderContent(),
      onForceCloseModal: () => navigation.goBack(),
    });
  };

  const next = () => {
    setPageIndex(pageIndex + 1);
  };
  const previous = () => {
    setPageIndex(pageIndex - 1);
  };

  const navigateToArticle = (url: string) => {
    //TODO implement
    // chrome.tabs.create({url: url});
  };

  const finish = async () => {
    //  TODO uncomment after testing all good so it will modify the
    //  lastSeenVersion and will not load anymore :D
    // await AsyncStorage.setItem(KeychainStorageKeyEnum.LAST_VERSION_UPDATE, content.version);
    onOverlayClick();
  };

  const renderCustomIndicator = (
    clickHandler: (e: React.MouseEvent | React.KeyboardEvent) => void,
    isSelected: boolean,
    index: number,
    label: string,
  ) => {
    return (
      <li
        className={`dot ${isSelected ? 'selected' : ''}`}
        onClick={(e) => {
          clickHandler(e);
          setPageIndex(index);
        }}></li>
    );
  };

  const renderContent = () => {
    if (!ready) return null;
    else
      return (
        <View aria-label="whats-new-component" style={styles.rootContainer}>
          <View style={styles.whatsNewContainer}>
            <Text style={styles.whatsNewTitle}>
              {translate('popup.whats_new.intro', {
                content_version: content.version,
              })}
            </Text>
            <Carousel
              listItems={[
                {text: 'text 1', color: 'white'},
                {text: 'text 2', color: 'blue'},
                {text: 'text 3', color: 'yellow'},
              ]}
            />
            {/* {images && (
              // <Carousel
              //   showArrows={false}
              //   showIndicators={content.features[locale].length > 1}
              //   selectedItem={pageIndex}
              //   showThumbs={false}
              //   showStatus={false}
              //   renderIndicator={renderCustomIndicator}>
              //   {content.features[locale].map((feature, index) => (
              //     <div className="carousel-item" key={`feature-${index}`}>
              //       <div className="image">
              //         <img src={images[index].src} />
              //       </div>
              //       <div className="title">{feature.title}</div>
              //       <div className="description">{feature.description}</div>
              //       <div className="extra-information">
              //         {feature.extraInformation}
              //       </div>
              //       <a
              //         aria-label="link-whats-new-read-more"
              //         className="read-more-link"
              //         onClick={() =>
              //           navigateToArticle(`${content.url}#${feature.anchor}`)
              //         }>
              //         {chrome.i18n.getMessage('html_popup_read_more')}
              //       </a>
              //     </div>
              //   ))}
              // </Carousel>
              <Text>Hi</Text>
            )} */}

            {/* <View
              // className="button-panel"
              style={styles.whatsNewButtonPanel}>
              {pageIndex > 0 && (
                <RoundButton
                  // type={ButtonType.STROKED}
                  // label="popup_html_whats_new_previous"
                  onPress={() => previous()}
                  content={<Text>{translate('popup.previous')}</Text>}
                  size={30}
                  backgroundColor={'red'}
                />
              )}
              {pageIndex === content.features[locale].length - 1 && (
                <RoundButton
                  // ariaLabel="button-last-page"
                  // type={ButtonType.STROKED}
                  // label="popup_html_whats_new_got_it"
                  onPress={() => finish()}
                  content={<Text>{translate('popup.got_it')}</Text>}
                  size={30}
                  backgroundColor={'red'}
                />
              )}
              {pageIndex < content.features[locale].length - 1 && (
                <RoundButton
                  // ariaLabel="button-next-page"
                  // type={ButtonType.STROKED}
                  // label="popup_html_whats_new_next"
                  onPress={() => next()}
                  content={<Text>{translate('popup.next')}</Text>}
                  size={30}
                  backgroundColor={'red'}
                />
              )}
            </View> */}
          </View>
        </View>
      );
  };
  return null;
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: 'red',
    width: '100%',
    height: '100%',
  },
  whatsNewContainer: {},
  whatsNewTitle: {
    textAlign: 'center',
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  whatsNewButtonPanel: {},
  whatsNewImage: {
    width: 100,
    height: 100,
  },
});

export default WhatsNew;
