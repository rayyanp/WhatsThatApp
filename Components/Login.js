import React, { Component } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as EmailValidator from 'email-validator';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      error: '',
      submitted: false,
      loading: false
    };

    this._onPressButton = this._onPressButton.bind(this);
  }

  componentDidMount() {
    this.props.navigation.addListener('focus', () => {
      this.setState({
        email: '',
        password: '',
        error: '',
        submitted: false,
        loading: false
      });
    });
  }

  _onPressButton() {
    this.setState({ submitted: true, loading: true });
    this.setState({ error: '' });
  
    if (!(this.state.email && this.state.password)) {
      this.setState({
        error: 'Must enter email and password',
        loading: false
      });
      return;
    }
    
    if (!EmailValidator.validate(this.state.email)) {
      this.setState({ error: 'Must enter valid email', loading: false });
      return;
    }

    const PASSWORD_REGEX = new RegExp(
      '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$',
    );
    if (!PASSWORD_REGEX.test(this.state.password)) {
      this.setState({
        error:
          "Password isn't strong enough (One upper, one lower, one special, one number, at least 8 characters long)",
        loading: false
      });
      return;
    }
  
    fetch('http://localhost:3333/api/1.0.0/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: this.state.email,
          password: this.state.password,
        }),
      })
      .then(async(response) => {
        if (response.status === 200) {
          console.log('Login Successful');
          return response.json();
        }else if (response.status === 400){
            throw new Error('Invalid Request');
        }else if (response.status === 500){
            throw new Error('Server Error');
        }else{
            throw new Error('Something went wrong');
        }
      })
      .then(async (responseJson) => {
          try{
            await AsyncStorage.setItem('whatsthat_user_id', responseJson.id);
            await AsyncStorage.setItem('whatsthat_session_token', responseJson.token);
            this.props.navigation.navigate('MainAppNav');
          }
          catch(error){
            console.error(error);
            throw new Error('Error setting items in AsyncStorage');
          }
      })
      .catch((error) => {
        console.error(error);
        let errorMessage;
        if (error.message === 'Invalid Request') {
          errorMessage = 'Invalid email or password';
        } else {
          errorMessage = 'An error occurred during login';
        }
        this.setState({
          error: errorMessage,
          loading: false
        });
        Alert.alert('Login Failed', errorMessage, [
          {
            text: 'Try Again',
            onPress: () => this.setState({ submitted: false })
          }
        ]);
      });
    }      
  

  render() {
    return (
      <View style={styles.container}>
        {this.state.loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <>
            <Text style={styles.header}>Login</Text>
            <Text style={styles.errorText}>{this.state.error}</Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => this.setState({ email: text })}
              value={this.state.email}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              onChangeText={(text) => this.setState({ password: text })}
              value={this.state.password}
              placeholder="Password"
              secureTextEntry
            />
            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={this._onPressButton}>
              <Text style={styles.buttonText}>Log In</Text>
            </TouchableOpacity>
            <TouchableOpacity 
            style={styles.createAccountButton}
            onPress={() => this.props.navigation.navigate('Register')}
            >
            <Text style={styles.createAccountText}>Register</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5FCFF',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'white',
    width: '80%',
    height: 40,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16,
  },
  buttonContainer: {
    backgroundColor:'#2980b9',
    padding: 10,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  createAccountButton: {
    marginTop: 10,
    backgroundColor: 'white',
    borderColor: '#2980b9',
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    alignItems: 'center',
  },
  createAccountText: {
    color: '#2980b9',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
