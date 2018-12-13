import * as React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Constants } from 'expo';
import { createStackNavigator, createAppContainer } from 'react-navigation';

import HomeScreen from './src/HomeScreen';
import RegisterScreen from './src/register/RegisterScreen';
import AliasScreen from './src/register/Alias';
import NameScreen from './src/register/Name';
import CpfScreen from './src/register/Cpf';
import AgeScreen from './src/register/Age';
import SelfScreen from './src/register/Self';
import DoneRegister from './src/register/Done';
import GroupsScreen from './src/GroupsScreen';

const RootStack = createStackNavigator(
  {
    Home: {
      screen: HomeScreen,
    },
    Register: {
      screen: RegisterScreen,
    },
    Alias: {
      screen: AliasScreen,
    },
    Name: {
      screen: NameScreen,
    },
    Cpf: {
      screen: CpfScreen,
    },
    Age: {
      screen: AgeScreen,
    },
    Self: {
      screen: SelfScreen,
    },
    Done: {
      screen: DoneRegister,
    },
    Groups: {
      screen: GroupsScreen,
    },
  },
  {
    initialRouteName: 'Home',
  }
);

const AppContainer = createAppContainer(RootStack);

export default class App extends React.Component {
  render() {
    return <AppContainer />;
  }
}
