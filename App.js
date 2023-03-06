import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './Components/Login';
import Register from './Components/Register';
import MainAppNav from './Components/MainAppNav';



const AuthStack = createNativeStackNavigator();

export default function App() {
    return (
      <NavigationContainer>
        <AuthStack.Navigator initialRouteName="Login">
          <AuthStack.Screen name="Login" component={Login} options={{headerShown: false}} />
          <AuthStack.Screen name="Register" component={Register} options={{headerShown: false}} />
          <AuthStack.Screen name="MainAppNav" component={MainAppNav} options={{headerShown: false}} />
        </AuthStack.Navigator>
      </NavigationContainer>
    );
  }


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
