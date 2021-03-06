import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';

// Redux
import { connect } from 'react-redux';
import { updateCurrentUser } from 'actions/users';
import { SignInRequest } from 'api/sessions';

import { notice } from 'notify';
import colors from 'constants/colors';
import ArrowButton from 'components/ArrowButton';
import PrimaryButton from 'components/forms/PrimaryButton';
import Form from 'components/forms/Form';
import TextInputContainer from 'components/forms/TextInputContainer';

import { Ionicons } from '@expo/vector-icons';
import {
  GetDomain,
  SetAuthenticationToken,
  SetCurrentUser,
} from 'utils/authentication';
import Device from 'utils/Device';
const isTablet = Device.isTablet();

import GenericPasswordExtension from 'react-native-generic-password-activity';

class SignInScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  inputs = [];

  state = {
    name: '',
    password: '',
    loading: false,
    domain: '',
  };

  componentDidMount() {
    this.getDomain();
  }

  getDomain = async () => {
    const domain = await GetDomain();
    this.setState({ domain });
  };

  validateFields = () => {
    const { name, password } = this.state;
    return name.length > 0 && password.length > 0;
  };

  signIn = async () => {
    const { name, password } = this.state;
    const resp = await SignInRequest({ name, password });
    if (resp && resp.ok) {
      SetAuthenticationToken(resp.sessionID);
      SetCurrentUser({ name: resp.name });
      this.props.updateCurrentUser({ name: resp.name });
      notice('You are now signed in!');
      this.props.screenProps.parentNavigation.navigate('Main');
    }
  };

  handleOnPress = async () => {
    this.setState({ loading: true });
    try {
      if (this.validateFields()) {
        await this.signIn();
      } else {
        error('Name/Password are invalid');
      }
    } catch (err) {
      console.log(err);
    } finally {
      this.setState({ loading: false });
    }
  };

  focusNextField(key) {
    this.inputs[key].focus();
  }

  handleValueFromPasswordExtension = (field, value) => {
    this.setState({ [field]: value });
    this.inputs[field].setNativeProps({
      text: value,
    });
  };

  getUsernameFromManager = name => {
    this.handleValueFromPasswordExtension('name', name);
  };

  getPasswordFromManager = password => {
    this.handleValueFromPasswordExtension('password', password);
  };

  render() {
    const { domain, name, password, loading } = this.state;
    const valid = this.validateFields();

    return (
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Form>
            <TextInputContainer>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <TextInput
                  style={{ height: 50, flex: 1 }}
                  placeholder="User name"
                  autoCapitalize={'none'}
                  underlineColorAndroid={'transparent'}
                  autoCorrect={false}
                  ref={input => {
                    this.inputs['name'] = input;
                  }}
                  onSubmitEditing={_ => {
                    this.focusNextField('password');
                  }}
                  returnKeyType="next"
                  enablesReturnKeyAutomatically={true}
                  onChangeText={name => this.setState({ name })}
                />
                <GenericPasswordExtension
                  type="username"
                  domain={domain}
                  onPress={this.getUsernameFromManager}
                  color={colors.primary}
                />
              </View>
            </TextInputContainer>
            <TextInputContainer>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <TextInput
                  style={{ height: 50, flex: 1 }}
                  enablesReturnKeyAutomatically={true}
                  secureTextEntry={true}
                  autoCapitalize={'none'}
                  underlineColorAndroid={'transparent'}
                  ref={input => {
                    this.inputs['password'] = input;
                  }}
                  placeholder="Password"
                  returnKeyType="done"
                  onSubmitEditing={this.handleOnPress}
                  onChangeText={password => this.setState({ password })}
                />
                <GenericPasswordExtension
                  type="password"
                  domain={domain}
                  onPress={this.getPasswordFromManager}
                  color={colors.primary}
                />
              </View>
            </TextInputContainer>
            <PrimaryButton
              label="Login"
              onPress={this.handleOnPress}
              loading={loading}
              disabled={!valid}
            />
          </Form>
        </View>

        <View style={styles.buttonContainer}>
          <ArrowButton
            onPress={_ => this.props.navigation.navigate('ForgotPassword')}
            direction="left"
            label="Forgot Password"
          />
          <ArrowButton
            onPress={_ => this.props.navigation.navigate('Register')}
            direction="right"
            label="Register"
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingLeft: 20,
    paddingRight: 20,
    ...(isTablet ? { width: 400, alignSelf: 'center' } : {}),
  },
  formContainer: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: colors.background,
    overflow: 'hidden',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default connect(null, dispatch => ({
  updateCurrentUser: user => {
    dispatch(updateCurrentUser(user));
  },
}))(SignInScreen);
