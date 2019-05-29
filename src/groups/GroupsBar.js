import React, {
  Component
} from 'react';

import {
  observer,
  inject
} from 'mobx-react/native'

import {
  FlatList, View, TouchableOpacity, StyleSheet, ActivityIndicator
} from 'react-native'

import {CommonStyle as CS} from '../styles/Common';
import GrousBarItem from './GroupsBarItem';
import { Text } from 'react-native-elements';

@inject('groupsBar')
@observer
export default class GroupsBar extends Component {

  state = {
    errorLoading: false,
  }

  componentDidMount() {
    this.load();
  }

  load = async() => {
    if (this.state.errorLoading) this.setState({errorLoading: false});
    try {
      await this.props.groupsBar.loadGroups();
      await this.props.groupsBar.loadMarkers();
    } catch (error) {
      this.setState({errorLoading: true});
    }
  }

  /**
   * Render group items
   * @param {object} row
   * @param {number} i
   */
  renderItem = (row, i) => {
    return <GrousBarItem group={row.item} key={i}/>
  }

  loadMore = () => {
    this.props.groupsBar.loadGroups();
  }

  renderError() {
    return (
      <TouchableOpacity onPress={this.load} style={[CS.flexContainer]}>
        <View style={[CS.columnAlignCenter, CS.centered, CS.padding2x]}>
          <Text style={[CS.fontXS, CS.colorDarkGreyed, CS.marginBottom]}>Error Loading Groups</Text>
          <Text style={[CS.fontS, CS.colorPrimary, CS.borderPrimary, CS.border, CS.borderRadius7x, CS.padding]}>Try again</Text>
        </View>
      </TouchableOpacity>
    );
  }

  /**
   * Render
   */
  render() {
    return (
      <FlatList
        ListFooterComponent={this.state.errorLoading ? this.renderError() : (this.props.groupsBar.loading ? <ActivityIndicator size="large" style={[CS.padding, styles.loading]}/>: undefined)}
        contentContainerStyle={[CS.rowJustifyStart, CS.backgroundTransparent]}
        style={[styles.bar]}
        horizontal={true}
        renderItem={this.renderItem}
        data={this.props.groupsBar.groups.slice()}
        onEndReached={this.loadMore}
      />
    )
  }
}

const styles = StyleSheet.create({
  bar: {
    minHeight: 80
  },
  loading: {
    height: 80,
    alignSelf: 'center'
  }
})