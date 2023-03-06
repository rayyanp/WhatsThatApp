import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './HomeScreen';
import LoginScreen from './LoginScreen';
import RegScreen from './RegScreen';
import ChatListScreen from './ChatListScreen';
import ContactsList from './ContactsList';
import Chat from './Chat';

const Stack = createStackNavigator();

function App() {
return (
<NavigationContainer>
<Stack.Navigator initialRouteName="Home">
<Stack.Screen
name="Home"
component={HomeScreen}
//options={{ title: 'WhatsThat' }}
/>
<Stack.Screen name="Login" component={LoginScreen} />
<Stack.Screen name="Reg" component={RegScreen} options={{ title: 'Register' }}/>
<Stack.Screen name="ChatList" component={ChatListScreen} />
<Stack.Screen name="ContactsList" component={ContactsList} />
<Stack.Screen name="Chat" component={Chat} />
</Stack.Navigator>
</NavigationContainer>
);
}

export default App;