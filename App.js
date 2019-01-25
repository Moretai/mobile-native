/**
 * Minds mobile app
 * https://www.minds.com
 *
 * @format
 * @flow
 */
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch'
import './global';
import './shim'
import crypto from "crypto"; // DO NOT REMOVE!
import codePush from "react-native-code-push"; // For auto updates

import React, {
  Component
} from 'react';

import {
  Observer,
  Provider,
} from 'mobx-react/native'  // import from mobx-react/native instead of mobx-react fix test

import {
  createNavigator,
  NavigationActions
} from 'react-navigation';

import NavigationService from './src/navigation/NavigationService';

import {
  BackHandler,
  Platform,
  AppState,
  Linking,
  Text,
  Alert,
} from 'react-native';

import KeychainModalScreen from './src/keychain/KeychainModalScreen';
import BlockchainTransactionModalScreen from './src/blockchain/transaction-modal/BlockchainTransactionModalScreen';
import NavigationStack from './src/navigation/NavigationStack';
import stores from './AppStores';
import './AppErrors';
import './src/common/services/socket.service';
import pushService from './src/common/services/push.service';
import receiveShare from './src/common/services/receive-share.service';
import sessionService from './src/common/services/session.service';
import deeplinkService from './src/common/services/deeplinks-router.service';
import badgeService from './src/common/services/badge.service';
import authService from './src/auth/AuthService';
import NotificationsService from "./src/notifications/NotificationsService";

// init push service
pushService.init();

// On app login (runs if the user login or if it is already logged in)
sessionService.onLogin(async () => {

  // register device token into backend on login
  pushService.registerToken();

  NavigationService.reset(sessionService.initialScreen);

  // handle deep link (if the app is opened by one)
  Linking.getInitialURL().then(url => url && deeplinkService.navigate(url));

  // handle initial notifications (if the app is opened by tap on one)
  pushService.handleInitialNotification();

  // handle shared
  receiveShare.handle();
});

//on app logout
sessionService.onLogout(() => {
  // clear app badge
  badgeService.setUnreadConversations(0);
  badgeService.setUnreadNotifications(0);
});

// disable yellow boxes
console.disableYellowBox = true;

/**
 * App
 */
@codePush
export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      appState: AppState.currentState
    };
  }

  /**
   * Handle app state changes
   */
  handleAppStateChange = (nextState) => {
    // if the app turns active we check for shared
    if (this.state.appState.match(/inactive|background/) && nextState === 'active') {
      receiveShare.handle();
    }
    this.setState({appState: nextState})
  }

  /**
   * On component will mount
   */
  componentWillMount() {
    if (!Text.defaultProps) Text.defaultProps = {};
    Text.defaultProps.style = {
      fontFamily: 'Roboto',
      color: '#444',
    };
  }

  /**
   * On component did mount
   */
  async componentDidMount() {

    const token = await sessionService.init();

    this.checkForUpdates();

    if (!token) {
      NavigationService.reset('Login');
    }

    BackHandler.addEventListener("hardwareBackPress", this.onBackPress);
    Linking.addEventListener('url', event => this.handleOpenURL(event.url));
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  /**
   * On component will unmount
   */
  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.onBackPress);
    Linking.removeEventListener('url', this.handleOpenURL);
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  /**
   * Handle hardware back button
   */
  onBackPress = () => {
    const nav = NavigationService.getState();
    NavigationService.goBack();
    return nav !== NavigationService.getState();
  };

  /**
   * Handle deeplink urls
   */
  handleOpenURL = (url) => {
    setTimeout(() => {
      deeplinkService.navigate(url);
    }, 100);
  }

  async checkForUpdates() {
    try {
      let response = await CodePush.sync({
        updateDialog: Platform.OS !== 'ios',
        installMode:  CodePush.InstallMode.ON_APP_RESUME,
      });
    } catch (err) { }
  }

  /**
   * Render
   */
  render() {
    const app = (
      <Provider key="app" {...stores}>
        <Observer>{() =>
          <NavigationStack
            ref={navigatorRef => {
              NavigationService.setTopLevelNavigator(navigatorRef);
            }}
            />
        }</Observer>
      </Provider>
    );

    const keychainModal = (
      <KeychainModalScreen key="keychainModal" keychain={ stores.keychain } />
    );

    const blockchainTransactionModal = (
      <BlockchainTransactionModalScreen key="blockchainTransactionModal" blockchainTransaction={ stores.blockchainTransaction } />
    );

    return [ app, keychainModal, blockchainTransactionModal ];
  }
}
