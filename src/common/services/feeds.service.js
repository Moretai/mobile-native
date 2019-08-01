import logService from './log.service';
import apiService from './api.service';
import { abort, isNetworkFail } from '../helpers/abortableFetch';
import entitiesService from './entities.service';
import feedsStorage from './sql/feeds.storage';
import { showMessage } from 'react-native-flash-message';
import i18n from './i18n.service';
import connectivityService from './connectivity.service';
import Colors from '../../styles/Colors';
import { toJS } from 'mobx';
import boostedContentService from './boosted-content.service';

/**
 * Feed store
 */
export default class FeedsService {

  /**
   * @var {boolean}
   */
  injectBoost: boolean = false;

  /**
   * @var {boolean}
   */
  asActivities: boolean = true;

  /**
   * @var {Number}
   */
  limit: number = 12;

  /**
   * @var {Number}
   */
  offset: number = 0;

  /**
   * @var {string}
   */
  endpoint: string = '';

  /**
   * @var {Object}
   */
  params: Object = {sync: 1}

  /**
   * @var {Array}
   */
  feed: Array = [];

  /**
   * Get entities from the current page
   */
  async getEntities() {
    const end = this.limit + this.offset;
    const feedPage = this.feed.slice(this.offset, end);

    const result = await entitiesService.getFromFeed(feedPage, this, this.asActivities);

    if (!this.injectBoost) return result;

    this.injectBoosted(3, result, end);
    this.injectBoosted(8, result, end);
    this.injectBoosted(16, result, end);
    this.injectBoosted(24, result, end);
    this.injectBoosted(32, result, end);
    this.injectBoosted(40, result, end);

    return result;
  }

  /**
   * Inject boost at given position
   *
   * @param {number} position
   * @param {Array<ActivityModel>} entities
   * @param {number} end
   */
  injectBoosted(position, entities, end) {
    if (this.offset <= position && end >= position) {
      const boost =  boostedContentService.fetch();
      if (boost) entities.splice( position + this.offset, 0, boost );
    }
  }

  /**
   * Prepend entity
   * @param {BaseModel} entity
   */
  prepend(entity) {
    this.feed.unshift({
      owner_guid: entity.owner_guid,
      timestamp: Date.now().toString(),
      urn: entity.urn
    });

    const plainEntity = toJS(entity);
    delete(plainEntity.__list);

    entitiesService.addEntity(plainEntity, true);
    // save without wait
    feedsStorage.save(this);
  }

  /**
   * getter has More
   */
  get hasMore() {
    return this.feed.length > this.limit + this.offset;
  }

  /**
   * Set feed
   * @param {Array} feed
   * @returns {FeedsService}
   */
  setFeed(feed): FeedsService {
    this.feed = feed;
    return this;
  }

  /**
   * Set inject boost
   * @param {Array} feed
   * @returns {FeedsService}
   */
  setInjectBoost(injectBoost): FeedsService {
    this.injectBoost = injectBoost;
    return this;
  }

  /**
   * Set limit
   * @param {integer} limit
   * @returns {FeedsService}
   */
  setLimit(limit): FeedsService {
    this.limit = limit;
    return this;
  }

  /**
   * Set offset
   * @param {integer} offset
   * @returns {FeedsService}
   */
  setOffset(offset): FeedsService {
    this.offset = offset;
    return this;
  }

  /**
   * Set endpoint
   * @param {string} endpoint
   * @returns {FeedsService}
   */
  setEndpoint(endpoint: string): FeedsService {
    this.endpoint = endpoint;
    return this;
  }

  setParams(params): FeedsService {
    this.params = params;
    if (!params.sync) {
      this.params.sync = 1;
    }
    return this;
  }

  /**
   * Set as activities
   * @param {boolean} asActivities
   * @returns {FeedsService}
   */
  setAsActivities(asActivities: boolean): FeedsService {
    this.asActivities = asActivities;
    return this;
  }

  /**
   * Fetch
   */
  async fetch() {
    abort(this);
    const response = await apiService.get(this.endpoint, {...this.params, ...{ limit: 150, as_activities: this.asActivities ? 1 : 0 }}, this);

    this.feed = response.entities;

    // save without wait
    feedsStorage.save(this);
  }

  /**
   * Fetch feed from local cache
   */
  async fetchLocal() {
    try {
      const feed = await feedsStorage.read(this);
      if (feed) {
        this.feed = feed;
        return true;
      }
    } catch (err) {
      logService.error('[FeedService] error loading local data')
    }

    return false;
  }

  /**
   * Fetch feed from local cache or from the remote endpoint if there is no cached data
   */
  async fetchLocalOrRemote() {
    const status = await this.fetchLocal();

    try {
      if (!status) await this.fetch();
    } catch (err) {
      if (err.code === 'Abort') return;

      if (!isNetworkFail(err)) {
        logService.exception('[FeedService]', err);
      }

      throw err;
    }
  }

  /**
   * Fetch from the remote endpoint and if it fails from local cache
   */
  async fetchRemoteOrLocal() {
    try {
      await this.fetch();
    } catch (err) {
      if (err.code === 'Abort') return;

      if (!isNetworkFail(err)) {
        logService.exception('[FeedService]', err);
      }

      if (!await this.fetchLocal()) {
        throw new Error('Error fetching feed from remote or local');
      }

      showMessage({
        floating: true,
        position: 'top',
        message: (connectivityService.isConnected ? i18n.t('cantReachServer') : i18n.t('noInternet')),
        description: i18n.t('showingStored'),
        duration: 1300,
        backgroundColor: '#FFDD63DD',
        color: Colors.dark,
        type: "info",
      });
    }
  }

  /**
   * Move offset to next page
   */
  next(): FeedStore  {
    this.offset += this.limit;
    return this;
  }

  /**
   * Clear the store
   */
  clear(): FeedStore {
    this.offset = 0;
    this.limit = 12;
    this.params =  {sync: 1};
    this.feed = [];
    return this;
  }
}
