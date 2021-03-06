import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import LoadingScreen from '../LoadingScreen';
import LoginScreen from '../auth/LoginScreen';
import ForgotScreen from '../auth/ForgotScreen';
import TabsScreen from '../tabs/TabsScreen';
import NotificationsScreen from '../notifications/NotificationsScreen';
import NotificationsSettingsScreen from '../notifications/NotificationsSettingsScreen';
import ActivityScreen from '../newsfeed/ActivityScreen';
import ChannelScreen from '../channel/ChannelScreen';
import ChannelSubscribers from '../channel/subscribers/ChannelSubscribers';
import CapturePoster from '../capture/CapturePoster';
import RegisterScreen from '../auth/RegisterScreen';
import ConversationScreen from '../messenger/ConversationScreen';
import SettingsScreen from '../settings/SettingsScreen';
import PasswordScreen from '../settings/screens/PasswordScreen';
import EmailScreen from '../settings/screens/EmailScreen';
import BlockedChannelsScreen from '../settings/screens/BlockedChannelsScreen';
import BillingScreen from '../settings/screens/BillingScreen';
import RekeyScreen from '../settings/screens/RekeyScreen';
import GroupsListScreen from '../groups/GroupsListScreen';
import GroupViewScreen from '../groups/GroupViewScreen';
import WalletScreen from '../wallet/WalletScreen';
import WalletHistoryScreen from '../wallet/WalletHistoryScreen';
import BoostConsoleScreen from '../boost/BoostConsoleScreen';
import BlogsListScreen from '../blogs/BlogsListScreen';
import BlogsViewScreen from '../blogs/BlogsViewScreen';
import FabScreen from '../wire/FabScreen';
import ViewImageScreen from '../media/ViewImageScreen';
import BoostScreen from '../boost/creator/BoostScreen';
import ContributionsScreen from '../wallet/tokens/ContributionsScreen';
import TransactionsScreen from '../wallet/tokens/TransactionsScreen';
import BlockchainWalletScreen from '../blockchain/wallet/BlockchainWalletScreen';
import BlockchainWalletModalScreen from '../blockchain/wallet/modal/BlockchainWalletModalScreen';
import BlockchainWalletImportScreen from '../blockchain/wallet/import/BlockchainWalletImportScreen';
import BlockchainWalletDetailsScreen from '../blockchain/wallet/details/BlockchainWalletDetailsScreen';
import ReportScreen from '../report/ReportScreen';
import MoreScreen from '../tabs/MoreScreen';
import WithdrawScreen from '../wallet/tokens/WithdrawScreen';
import WalletOnboardingScreen from '../wallet/onboarding/WalletOnboardingScreen';
import ComingSoonScreen from '../static-views/ComingSoonScreen';
import NotSupportedScreen from '../static-views/NotSupportedScreen';
import OnboardingScreen from '../onboarding/OnboardingScreen';
import IssueReportScreen from '../issues/IssueReportScreen';
import Wizard from '../common/components/Wizard';
import UpdatingScreen from '../update/UpdateScreen';
import {withErrorBoundaryScreen} from '../common/components/ErrorBoundary';
// import LogsScreen from '../logs/LogsScreen';
import DeleteChannelScreen from '../settings/screens/DeleteChannelScreen';
import DiscoveryFeedScreen from '../discovery/DiscoveryFeedScreen';
import Gathering from '../gathering/Gathering';

/**
 * Main stack navigator
 */
const Stack = createStackNavigator({
  Tabs: {
    screen: withErrorBoundaryScreen(TabsScreen),
  },
  // Logs: {
  //   screen: LogsScreen
  // },
  Update: {
    screen: withErrorBoundaryScreen(UpdatingScreen),
  },
  Boost: {
    screen: withErrorBoundaryScreen(BoostScreen),
    navigationOptions: {
      gesturesEnabled: false,
    },
  },
  DeleteChannel: {
    screen: withErrorBoundaryScreen(DeleteChannelScreen),
  },
  Notifications: {
    screen: withErrorBoundaryScreen(NotificationsScreen),
  },
  NotificationsSettings: {
    screen: withErrorBoundaryScreen(NotificationsSettingsScreen),
  },
  Channel: {
    screen: withErrorBoundaryScreen(ChannelScreen),
    path: 'channel/:guid',
  },
  Capture: {
    screen: withErrorBoundaryScreen(CapturePoster),
  },
  Activity: {
    screen: withErrorBoundaryScreen(ActivityScreen),
    path: 'activity/:guid',
  },
  Conversation: {
    screen: withErrorBoundaryScreen(ConversationScreen),
  },
  DiscoveryFeed: {
    screen: withErrorBoundaryScreen(DiscoveryFeedScreen),
  },
  Subscribers: {
    screen: withErrorBoundaryScreen(ChannelSubscribers),
  },
  Settings: {
    screen: withErrorBoundaryScreen(SettingsScreen),
  },
  SettingsBlockedChannels: {
    screen: withErrorBoundaryScreen(BlockedChannelsScreen),
  },
  SettingsEmail: {
    screen: withErrorBoundaryScreen(EmailScreen),
  },
  SettingsRekey: {
    screen: withErrorBoundaryScreen(RekeyScreen),
  },
  SettingsPassword: {
    screen: withErrorBoundaryScreen(PasswordScreen),
  },
  SettingsBilling: {
    screen: withErrorBoundaryScreen(BillingScreen),
  },
  GroupsList: {
    screen: withErrorBoundaryScreen(GroupsListScreen),
  },
  GroupView: {
    screen: withErrorBoundaryScreen(GroupViewScreen),
  },
  Wallet: {
    screen: withErrorBoundaryScreen(WalletScreen),
  },
  BlogList: {
    screen: withErrorBoundaryScreen(BlogsListScreen),
  },
  BoostConsole: {
    screen: withErrorBoundaryScreen(BoostConsoleScreen),
  },
  BlogView: {
    screen: withErrorBoundaryScreen(BlogsViewScreen),
    path: 'blog/view/:guid',
  },
  WireFab: {
    screen: withErrorBoundaryScreen(FabScreen),
    navigationOptions: {
      gesturesEnabled: false,
    },
  },
  WalletHistory: {
    screen: withErrorBoundaryScreen(WalletHistoryScreen),
  },
  ViewImage: {
    screen: withErrorBoundaryScreen(ViewImageScreen),
  },
  BlockchainWallet: {
    screen: withErrorBoundaryScreen(BlockchainWalletScreen),
  },
  Contributions: {
    screen: withErrorBoundaryScreen(ContributionsScreen),
  },
  Transactions: {
    screen: withErrorBoundaryScreen(TransactionsScreen),
  },
  BlockchainWalletModal: {
    screen: withErrorBoundaryScreen(BlockchainWalletModalScreen),
    navigationOptions: {
      gesturesEnabled: false,
    },
  },
  BlockchainWalletImport: {
    screen: withErrorBoundaryScreen(BlockchainWalletImportScreen),
  },
  BlockchainWalletDetails: {
    screen: withErrorBoundaryScreen(BlockchainWalletDetailsScreen),
  },
  Report: {
    screen: withErrorBoundaryScreen(ReportScreen),
  },
  More: {
    screen: withErrorBoundaryScreen(MoreScreen),
  },
  Withdraw: {
    screen: withErrorBoundaryScreen(WithdrawScreen),
  },
  WalletOnboarding: {
    screen: withErrorBoundaryScreen(WalletOnboardingScreen),
  },
  ComingSoon: {
    screen: withErrorBoundaryScreen(ComingSoonScreen),
  },
  NotSupported: {
    screen: withErrorBoundaryScreen(NotSupportedScreen),
  },
  OnboardingScreen: {
    screen: withErrorBoundaryScreen(OnboardingScreen),
  },
  IssueReport: {
    screen: withErrorBoundaryScreen(IssueReportScreen),
  },
  Wizard: {
    screen: withErrorBoundaryScreen(Wizard),
  },
});

/**
 * RootStack
 */
const RootStack = createStackNavigator(
  {
    Main: {
      screen: Stack,
    },
    // modal screen
    Gathering: {
      screen: Gathering,
    },
  },
  {
    mode: 'modal',
    headerMode: 'none',
  },
);

/**
 * Auth Stack
 */
const AuthStack = createStackNavigator({
  Login: {
    screen: withErrorBoundaryScreen(LoginScreen),
  },
  Forgot: {
    screen: withErrorBoundaryScreen(ForgotScreen),
  },
  Register: {
    screen: withErrorBoundaryScreen(RegisterScreen),
  },
});

/**
 * Main switch navigator
 */
export default createAppContainer(
  createSwitchNavigator(
    {
      Loading: LoadingScreen,
      Auth: AuthStack,
      App: RootStack,
    },
    {
      initialRouteName: 'Loading',
    },
  ),
);
