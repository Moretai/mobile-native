import React, {
  Component,
  Fragment
} from 'react';

import {
  StyleSheet,
  Platform,
  Text,
  FlatList,
  Dimensions,
  RefreshControl,
  View,
  TouchableHighlight,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { ListItem, Avatar } from 'react-native-elements';
import IonIcon from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Modal from 'react-native-modal'

import {
  observer,
  inject
} from 'mobx-react/native'

import _ from 'lodash';

import { CollapsibleHeaderFlatList } from 'react-native-collapsible-header-views';

import DiscoveryTile from './DiscoveryTile';
import DiscoveryUser from './DiscoveryUser';
import Activity from '../newsfeed/activity/Activity';
import SearchView from '../common/components/SearchView';
import { CommonStyle as CS } from '../styles/Common';
import { ComponentsStyle } from '../styles/Components';
import colors from '../styles/Colors';
import BlogCard from '../blogs/BlogCard';
import stores from '../../AppStores';
import CaptureFab from '../capture/CaptureFab';
import { GOOGLE_PLAY_STORE } from '../config/Config';
import ErrorLoading from '../common/components/ErrorLoading';
import GroupsListItem from '../groups/GroupsListItem'
import DiscoveryFilters from './NewsfeedFilters';
import ErrorBoundary from '../common/components/ErrorBoundary';
import testID from '../common/helpers/testID';
import i18n from '../common/services/i18n.service';
import { FLAG_VIEW } from '../common/Permissions';

/**
 * Discovery screen
 */
@inject('discovery', 'channel')
@observer
export default class DiscoveryScreen extends Component {

  cols = 3;
  iconSize = 28;

  state = {
    active: false,
    showFeed: false,
    itemHeight: 0,
    q: ''
  }

  viewOptsFeed = {
    viewAreaCoveragePercentThreshold: 50,
    minimumViewTime: 300
  }

  static navigationOptions = {
    tabBarIcon: ({ tintColor }) => (
      <Icon name="search" size={24} color={tintColor} />
    ),
    tabBarOnPress: ({ navigation, defaultHandler }) => {
      // tab button tapped again?
      if (navigation.isFocused()) {
        stores.discovery.reload();
        return;
      }
      defaultHandler();
    }
  }

  /**
   * constructor
   */
  constructor(props) {
    super(props);

    this.props.discovery.init();

    const params = this.props.navigation.state.params;
    if (params && params.type) {
      this.props.discovery.filters.setType(params.type);
    }

    this.tileError = i18n.t('error');
  }

  /**
   * On component will mount
   */
  componentDidMount() {
    // load data on enter
    this.disposeEnter = this.props.navigation.addListener('didFocus', (s) => {
      setTimeout(() => {
        this.setState({active: true});
        const params = this.props.navigation.state.params;
        if (params && params.query) {
          this.setQ(params.query);
          params.query = null; //clean query
        }
      }, 50);
    });

    // clear data on leave
    this.disposeLeave = this.props.navigation.addListener('didBlur', (s) => {
      setTimeout(() => {
        this.setState({active: false});
      }, 50);
    });
  }

  /**
   * Dispose reactions of navigation store on unmount
   */
  componentWillUnmount() {
    if (this.disposeEnter) {
      this.disposeEnter.remove();
    }

    if (this.disposeLeave) {
      this.disposeLeave.remove();
    }
  }

  /**
   * Adjust tiles to 1/cols size
   */
  onLayout = e => {
    // calculate the itemHeight for 3 cols only
    if (this.cols === 3) {
      const width = Dimensions.get('window').width
      this.setState({
        itemHeight: width / this.cols,
      });
    }
  }

  /**
   * Calculate item layout for better performance on tiles
   */
  getItemLayout = (data, index) => {
    const { itemHeight } = this.state;
    return { length: itemHeight, offset: itemHeight * index, index };
  }

  /**
   * On viewable items change in the list
   */
  onViewableItemsChanged = (change) => {

    switch (this.props.discovery.filters.type ) {
      case 'images':
        change.changed.forEach(c => {
          if (c.item.isGif()) {
            c.item.setVisible(c.isViewable);
          }
        })
        break;

      case 'blogs':
      case 'activities':
        change.viewableItems.forEach((item) => {
          this.props.discovery.listStore.addViewed(item.item);
        });
        break;

      default:
        break;
    }
  }

  /**
   * Render
   */
  render() {
    let body;

    const discovery = this.props.discovery;

    let renderRow, columnWrapperStyle = null;
    this.cols = 3;
    switch (discovery.filters.type) {
      case 'lastchannels':
      case 'channels':
        renderRow = this.renderUser;
        this.cols = 1;
        break;
      case 'groups':
        renderRow = this.renderGroup;
        this.cols = 1;
        break;
      case 'activities':
        renderRow = this.renderActivity;
        this.cols = 1;
        break;
      case 'blogs':
        renderRow = this.renderBlog;
        this.cols = 1;
        break;
      default:
        if (this.state.showFeed === false) {
          renderRow = this.renderTile;
          columnWrapperStyle = { height: this.state.itemHeight };
        } else {
          renderRow = this.renderActivity;
          this.cols = 1;
        }
        break;
    }

    const footer = this.getFooter();

    body = (
      <CollapsibleHeaderFlatList
        disableHeaderSnap={true}
        onLayout={this.onLayout}
        key={'discofl' + this.cols} // we need to force component redering if we change cols
        data={discovery.listStore.entities.slice()}
        bounces={true}
        refreshControl={
          <RefreshControl refreshing={discovery.listStore.refreshing} onRefresh={this.refresh} progressViewOffset={146} />
        }
        renderItem={renderRow}
        ListFooterComponent={footer}
        CollapsibleHeaderComponent={this.getHeaders()}
        headerHeight={(GOOGLE_PLAY_STORE && discovery.filters.type !== 'channels') ? 94 : 146}
        ListEmptyComponent={this.getEmptyList()}
        keyExtractor={this.keyExtractor}
        onEndReached={this.loadMore}
        initialNumToRender={this.cols == 3 ? 12 : 3}
        style={[CS.backgroundWhite, CS.flexContainer]}
        numColumns={this.cols}
        horizontal={false}
        windowSize={9}
        removeClippedSubviews={false}
        columnWrapperStyle={columnWrapperStyle}
        keyboardShouldPersistTaps={'handled'}
        onViewableItemsChanged={this.onViewableItemsChanged}
        viewabilityConfig={this.cols == 3 ? undefined : this.viewOptsFeed}
      />
    );

    return (
      <View style={[CS.flexContainer, CS.backgroundWhite]}>
        {body}
        <CaptureFab navigation={this.props.navigation} />
      </View>
    );
  }

  keyExtractor = item => item.urn;

  /**
   * Get empty list
   */
  getEmptyList() {
    if (!this.props.discovery.listStore.loaded || this.props.discovery.listStore.loading || this.props.discovery.listStore.errorLoading) return null;
    return (
      <View style={ComponentsStyle.emptyComponentContainer}>
        <View style={ComponentsStyle.emptyComponent}>
          <Text style={ComponentsStyle.emptyComponentMessage}>{i18n.t('discovery.nothingToShow')}</Text>
        </View>
      </View>
    );
  }

  setTypeActivities = () => {
    this.props.discovery.filters.setType('activities');
    this.checkSearchForGooglePlay();
  }
  setTypeChannels = () => {
    this.props.discovery.filters.setType('channels');
    this.checkSearchForGooglePlay();
  }
  setTypeBlogs = () => {
    this.props.discovery.filters.setType('blogs');
    this.checkSearchForGooglePlay();
  }
  setTypeGroups = () => {
    this.props.discovery.filters.setType('groups');
    this.checkSearchForGooglePlay();
  }
  setTypeVideos = () => {
    if (this.state.showFeed !== false && this.props.discovery.filters.type === 'videos') {
      return this.setState({showFeed: false});
    }
    this.props.discovery.filters.setType('videos');
    this.checkSearchForGooglePlay();
  }
  setTypeImages = () => {
    if (this.state.showFeed !== false && this.props.discovery.filters.type === 'images') {
      return this.setState({showFeed: false});
    }
    this.props.discovery.filters.setType('images');
    this.checkSearchForGooglePlay();
  }

  checkSearchForGooglePlay() {
    if (GOOGLE_PLAY_STORE && this.props.discovery.filters.type !== 'channels') {
      this.clearSearch();
    }
  }

  /**
   * Get header
   */
  getHeaders() {
    const filtersStore = this.props.discovery.filters;
    const navigation = (
      <View style={[styles.navigation]}>

        <TouchableHighlight style={styles.iconContainer} onPress={ this.setTypeActivities } underlayColor='#fff' {...testID('Discovery All')}>
          <View style={CS.columnAlignCenter}>
            <IonIcon
              name="ios-infinite"
              style={[styles.icon, filtersStore.type == 'activities' ? styles.iconActive : null ]}
              size={ this.iconSize }
            />
            <Text numberOfLines={1} style={[CS.fontS, filtersStore.type == 'activities' ? CS.colorPrimary : CS.colorDark]}>{i18n.t('discovery.all')}</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight style={styles.iconContainer} onPress={ this.setTypeChannels } underlayColor='#fff' {...testID('Discovery Channels')}>
          <View style={CS.columnAlignCenter}>
            <Icon
              name="people"
              style={[styles.icon, filtersStore.type == 'channels' ? styles.iconActive : null ]}
              size={ this.iconSize }
            />
            <Text numberOfLines={1} style={[CS.fontS, filtersStore.type == 'channels' ? CS.colorPrimary : CS.colorDark]}>{i18n.t('discovery.channels')}</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight style={styles.iconContainer} onPress={ this.setTypeVideos } underlayColor='#fff' {...testID('Discovery Videos')}>
          <View style={CS.columnAlignCenter}>
            <IonIcon
              name={this.state.showFeed !== false &&  filtersStore.type == 'videos' ? 'md-apps' : 'md-videocam'}
              style={[styles.icon, filtersStore.type == 'videos' ? styles.iconActive : null ]}
              size={this.iconSize}
            />
            <Text numberOfLines={1} style={[CS.fontS, filtersStore.type == 'videos' ? CS.colorPrimary : CS.colorDark]}>{i18n.t('discovery.videos')}</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight style={styles.iconContainer} onPress={ this.setTypeImages } underlayColor='#fff' {...testID('Discovery Images')}>
          <View style={CS.columnAlignCenter}>
            <IonIcon
              name={this.state.showFeed !== false &&  filtersStore.type == 'images' ? 'md-apps' : 'md-photos'}
              style={[styles.icon, filtersStore.type == 'images' ? styles.iconActive : null ]}
              size={ this.iconSize }
            />
            <Text numberOfLines={1} style={[CS.fontS, filtersStore.type == 'images' ? CS.colorPrimary : CS.colorDark]}>{i18n.t('discovery.images')}</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight style={styles.iconContainer} onPress={ this.setTypeBlogs } underlayColor='#fff' {...testID('Discovery Blogs')}>
          <View style={CS.columnAlignCenter}>
            <Icon
              name="subject"
              style={[styles.icon, filtersStore.type == 'blogs' ? styles.iconActive : null ]}
              size={ this.iconSize }
            />
            <Text numberOfLines={1} style={[CS.fontS, filtersStore.type == 'blogs' ? CS.colorPrimary : CS.colorDark]}>{i18n.t('discovery.blogs')}</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight style={styles.iconContainer} onPress={ this.setTypeGroups } underlayColor='#fff' {...testID('Discovery Groups')}>
          <View style={CS.columnAlignCenter}>
            <Icon
              name="group-work"
              style={[styles.icon, filtersStore.type == 'groups' ? styles.iconActive : null ]}
              size={ this.iconSize }
            />
            <Text numberOfLines={1} style={[CS.fontS, filtersStore.type == 'groups' ? CS.colorPrimary : CS.colorDark]}>{i18n.t('discovery.groups')}</Text>
          </View>
        </TouchableHighlight>
      </View>
    );

    const iconRight = filtersStore.searchtext ?
      'md-close-circle' :
      (filtersStore.type == 'channels') ?
        <Text numberOfLines={1} style={styles.lastVisited} onPress={this.showLastChannels}>{i18n.t('discovery.visited')}</Text> :
        null;


    const headerBody = filtersStore.type != 'lastchannels' ?
      <View style={CS.marginBottom}>
        {(filtersStore.type === 'channels' || !GOOGLE_PLAY_STORE) && <SearchView
          placeholder={i18n.t('discovery.search')}
          onChangeText={this.setQ}
          value={this.state.q}
          containerStyle={[CS.marginTop, CS.marginBottom]}
          iconRight={ iconRight }
          iconRightOnPress={this.clearSearch}
          {...testID('Discovery Search Input')}
        />}
        <DiscoveryFilters store={filtersStore} onTagsChange={this.onTagSelectionChange} onSelectOne={this.onSelectOne}/>
        {/* {!discovery.searchtext && <TagsSubBar onChange={this.onTagSelectionChange}/>} */}
      </View> :
      <Text style={[CS.fontM, CS.backgroundPrimary, CS.colorWhite, CS.textCenter, CS.padding]}>{i18n.t('discovery.recentlyVisited')}</Text>;

    return (
      <View style={[CS.shadow, CS.backgroundWhite]}>
        {navigation}
        {headerBody}
      </View>
    )
  }

  onTagSelectionChange = () => {
    if (this.state.showFeed) {
      this.setState({showFeed: 0});
    }
    this.props.discovery.reload();
  }


  onSelectOne = (tag) => {
    this.props.discovery.reload();
  }

  /**
   * Get list footer
   */
  getFooter() {
    const discovery = this.props.discovery;

    if (discovery.filters.type == 'lastchannels') return null;

    if (discovery.listStore.loading && !discovery.listStore.refreshing) {
      return (
        <View style={{ flex:1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <ActivityIndicator size={'large'} />
        </View>
      );
    }

    if (!discovery.listStore.errorLoading) return null;

    const message = discovery.listStore.entities.length ?
      i18n.t('cantLoadMore') :
      i18n.t('cantLoad');

    return <ErrorLoading message={message} tryAgain={this.tryAgain}/>
  }

  tryAgain = () => {
    this.props.discovery.listStore.reload();
  }

  /**
   * Show recently visited channel
   */
  showLastChannels = async() => {
    const list = await this.props.channel.getVisited(30)

    // if (!list.length) return;
    this.props.discovery.filters.setType('lastchannels');
    this.props.discovery.listStore.clear();
    this.props.discovery.listStore.addEntities(list);
  }

  /**
   * ClearSearch
   */
  clearSearch = () => {
    this.setQ('');
    Keyboard.dismiss();
  }

  /**
   * Search debouncer
   */
  searchDebouncer = _.debounce((text) => {
    this.props.discovery.filters.search(text);
  }, 350);

  /**
   * Set search query
   */
  setQ = q => {
    this.setState({ q });
    this.searchDebouncer(q);
  };

  /**
   * Load feed data
   */
  loadMore = (e, force = false) => {
    const type = this.props.discovery.filters.type;
    if (
      this.props.discovery.filters.type == 'lastchannels' ||
      (this.props.discovery.listStore.errorLoading && !force)
    ) {
      return;
    }

    this.props.discovery.listStore.loadMore();
  }

  /**
   * Refresh feed data
   */
  refresh = async() => {
    if (this.props.discovery.filters.type == 'lastchannels')
      return;
    await this.props.discovery.listStore.refresh();
  }

  /**
   * Navigate to feed screen
   * @param {string} urn
   */
  navigateToFeed = ({urn}) => {
    const index = this.props.discovery.listStore.feedsService.feed.findIndex(e => e.urn === urn);

    this.props.discovery.feedStore.setFeed(this.props.discovery.listStore.feedsService.feed.slice(index));

    this.props.navigation.push('DiscoveryFeed', {
      'showFeed': index,
      title: _.capitalize(this.props.discovery.filters.filter) + ' ' + _.capitalize(this.props.discovery.filters.type)
    })
  }

  /**
   * Render a tile
   */
  renderTile = (row) => {
    if (!this.state.active && row.item.isGif()) {
      return <View style={{ height: this.state.itemHeight, width: this.state.itemHeight }}/>;
    }
    return (
      <ErrorBoundary message={this.tileError} containerStyle={[CS.centered, {width: this.state.itemHeight, height: this.state.itemHeight}]} textSmall={true}>
        <DiscoveryTile
          entity={row.item}
          size={this.state.itemHeight}
          onPress={this.navigateToFeed}
        />
      </ErrorBoundary>
    );
  }

  /**
   * Render user row
   */
  renderUser = (row) => {
    return (

      <ErrorBoundary containerStyle={CS.hairLineBottom}>
        <DiscoveryUser row={row} navigation={this.props.navigation} hideButtons={this.props.discovery.filters.type == 'lastchannels'} />
      </ErrorBoundary>
    );
  }

  /**
   * Render activity item
   */
  renderActivity = (row) => {
    return (
      <ErrorBoundary containerStyle={CS.hairLineBottom}>
        <Activity entity={row.item} navigation={this.props.navigation} autoHeight={false} />
      </ErrorBoundary>
    );
  }

  /**
   * Render blog item
   */
  renderBlog = (row) => {
    return (
      <View style={[CS.paddingBottom2x, CS.backgroundLight]}>
        <ErrorBoundary containerStyle={CS.hairLineBottom}>
          <BlogCard entity={row.item} navigation={this.props.navigation} />
        </ErrorBoundary>
      </View>
    );
  }

  /**
   * Render group item
   */
  renderGroup = (row) => {
    const item = row.item;
    return (
      <ErrorBoundary containerStyle={CS.hairLineBottom}>
        <GroupsListItem group={row.item} onPress={this.navigateToGroup}/>
      </ErrorBoundary>
    )
  }

  navigateToGroup = (group) => {
    if (!group.can(FLAG_VIEW, true)) {
      return;
    }

    this.props.navigation.push('GroupView', { group: group })
  }
}

const styles = StyleSheet.create({
  searchIcon: {
    padding: 17,
    width: 50
    //backgroundColor: '#EEE'
  },
  navigation: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    ...Platform.select({
      android: {
        paddingTop: 2,
        paddingBottom: 2,
      },
    }),
  },
  lastVisited: {
    right:10,
    position: 'absolute',
    color:colors.primary,
    fontSize:13,
    top: 14
  },
  iconContainer: {
    flex: 1,
    paddingVertical: 5,
    height: 50
  },
  icon: {
    alignSelf: 'center',
    color: '#444',
    height: 28
  },
  iconActive: {
    color: colors.primary,
  }
});
