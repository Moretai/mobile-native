import React, {
  Component
} from 'react';

import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Alert,
} from 'react-native';

import colors from '../../styles/Colors';
import { CommonStyle } from '../../styles/Common';
import { ComponentsStyle } from '../../styles/Components';
import settingsService from '../SettingsService';
import i18n from '../../common/services/i18n.service';
import Touchable from '../../common/components/Touchable';

export default class PasswordScreen extends Component {

  state = {
    currentPassword: '',
    newPassword: '',
    confirmNewPassword:''
  }

  submit() {
    if (!this.state.currentPassword || !this.state.newPassword || !this.state.confirmNewPassword )
      return;

    if (this.state.confirmNewPassword !== this.state.newPassword) {
      Alert.alert(i18n.t('error'), i18n.t('auth.confirmPasswordError'));
    } else {
      let params = {
        password: this.state.currentPassword,
        new_password: this.state.newPassword
      }

      settingsService.submitSettings(params).then( (data) => {
        Alert.alert(i18n.t('success'), i18n.t('settings.passwordChanged'));
        this.setState({
          currentPassword: '',
          confirmNewPassword: '',
          newPassword: ''
        });
      }).catch( (err) => {
        Alert.alert('Error', err.message);
      });
    }
  }

  render() {

    return (
      <View style={[ CommonStyle.flexContainer, {backgroundColor: colors.light} ]}>
        <Text style={styles.title}>{i18n.t('settings.passwordTitle')}:</Text>
        <TextInput
          style={[ComponentsStyle.loginInput, CommonStyle.marginTop2x]}
          placeholder={i18n.t('settings.currentPassword')}
          returnKeyType={'done'}
          placeholderTextColor="#444"
          underlineColorAndroid='transparent'
          onChangeText={(value) => this.setState({ currentPassword: value })}
          autoCapitalize={'none'}
          secureTextEntry={true}
          value={this.state.currentPassword}
          key={1}
        />
        <TextInput
          style={[ComponentsStyle.loginInput, CommonStyle.marginTop2x]}
          placeholder={i18n.t('settings.newPassword')}
          returnKeyType={'done'}
          placeholderTextColor="#444"
          underlineColorAndroid='transparent'
          onChangeText={(value) => this.setState({ newPassword: value })}
          autoCapitalize={'none'}
          secureTextEntry={true}
          value={this.state.newPassword}
          key={2}
        />
        <TextInput
          style={[ComponentsStyle.loginInput, CommonStyle.marginTop2x]}
          placeholder={i18n.t('settings.confirmNewPassword')}
          returnKeyType={'done'}
          placeholderTextColor="#444"
          underlineColorAndroid='transparent'
          onChangeText={(value) => this.setState({ confirmNewPassword: value })}
          autoCapitalize={'none'}
          secureTextEntry={true}
          value={this.state.confirmNewPassword}
          key={3}
        />
        <Touchable style = {[ComponentsStyle.bluebutton, CommonStyle.alignJustifyCenter, styles.button]} onPress={() => this.submit()}>
          <Text style={{color: colors.primary}} >{i18n.t('settings.submit')}</Text>
        </Touchable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    margin:20
  },
  title: {
    padding: 8,
    fontSize: 18,
  }
});
