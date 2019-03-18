import React, {
  Component
} from 'react';

import {
  StyleSheet,
  Text,
  View,
  FlatList,
} from 'react-native';

import {
  observer,
  inject
} from 'mobx-react/native'

import Icon from 'react-native-vector-icons/Ionicons';
import MIcon from 'react-native-vector-icons/MaterialIcons';

import NotificationsTabIcon from './NotificationsTabIcon';
import CenteredLoading from '../common/components/CenteredLoading';
import Notification from './notification/Notification';
import NotificationsTopbar from './NotificationsTopbar';
import CaptureFab from '../capture/CaptureFab';
import { CommonStyle } from '../styles/Common';
import { ComponentsStyle } from '../styles/Components';
import stores from '../../AppStores';

// style
const styles = StyleSheet.create({
  listView: {
    backgroundColor: '#FFF',
  },
  button: {
    padding: 8,
  },
  container: {
    flex: 1,
  },
  row: {
    padding: 16,
  },
});

/**
 * Notification Screen
 */
@inject('notifications', 'user')
@observer
export default class NotificationsScreen extends Component {

  static navigationOptions = ({ navigation }) => ({
    tabBarIcon: ({ tintColor }) => (
      <NotificationsTabIcon tintColor={tintColor}/>
    ),
    headerRight: <Icon name="ios-options" size={18} color='#444' style={styles.button} onPress={() => navigation.navigate('NotificationsSettings')} />,
    tabBarOnPress: ({ navigation, defaultHandler }) => {
      // tab button tapped again?
      if (navigation.isFocused()) {
        stores.notifications.refresh();
        stores.notifications.setUnread(0);
        return;
      }
      defaultHandler();
    }
  });

  /**
   * On component mount
   */
  componentWillMount() {
    this.disposeEnter = this.props.navigation.addListener('didFocus', (s) => {
      // ignore back navigation
      if (s.action.type === 'Navigation/NAVIGATE' && s.action.routeName === 'Notifications') {
        this.props.notifications.loadList(true);
        this.props.notifications.setUnread(0);
      }
    });

    this.props.notifications.loadList();
  }

  /**
   * On component unmount
   */
  componentWillUnmount() {
    // clear data to free memory
    this.props.notifications.list.clearList();
    this.disposeEnter.remove();
  }

  /**
   * Render screen
   */
  render() {
    let body;
    const me = this.props.user.me;
    const list = this.props.notifications.list;
    let empty = null;

    if (list.loaded && !list.refreshing) {
      let filter = '';
      let design = null;

      if (this.props.notifications.filter != 'all') {
        filter = this.props.notifications.filter.substr(0, this.props.notifications.filter.length - 1);
      }

      if (me && me.hasBanned && !me.hasBanner()) { //TODO: check for avatar too
        design = <Text
          style={ComponentsStyle.emptyComponentLink}
          onPress={() => this.props.navigation.push('Channel', { username: 'me' })}
          >
          Design your channel
        </Text>
      }

      empty = (
        <View style={ComponentsStyle.emptyComponentContainer}>
          <View style={ComponentsStyle.emptyComponent}>
            <MIcon name="notifications" size={72} color='#444' />
            <Text style={ComponentsStyle.emptyComponentMessage}>You don't have any {filter} notifications</Text>
            {design}
            <Text
              style={ComponentsStyle.emptyComponentLink}
              onPress={() => this.props.navigation.navigate('Capture')}
              >
              Create a post
            </Text>
          </View>
        </View>);
    }

    body = (
      <FlatList
        data={list.entities.slice()}
        renderItem={this.renderRow}
        keyExtractor={item => item.rowKey}
        onRefresh={this.refresh}
        onEndReached={this.loadMore}
        ListEmptyComponent={empty}
        ListHeaderComponent={<NotificationsTopbar/>}
        // onEndReachedThreshold={0.05}
        initialNumToRender={12}
        stickyHeaderIndices={[0]}
        windowSize={8}
        refreshing={list.refreshing}
        style={styles.listView}
      />
    );

    return (
      <View style={styles.container}>
        {body}
        <CaptureFab navigation={this.props.navigation} />
      </View>
    );
  }

  /**
   * Clear and reload
   */
  refresh = () => {
    this.props.notifications.refresh();
  }

  /**
   * Load more rows
   */
  loadMore = () => {
    this.props.notifications.loadList()
  }

  /**
   * render row
   * @param {object} row
   */
  renderRow = (row) => {
    const entity = row.item;
    return (
      <Notification entity={entity} navigation={this.props.navigation}/>
    );
  }
}