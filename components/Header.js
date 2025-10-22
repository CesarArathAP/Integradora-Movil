import React from 'react';
import { View, Text } from 'react-native';
import { commonStyles } from '../styles/common';

const Header = () => {
  return (
    <View style={commonStyles.header}>
      <Text style={commonStyles.appTitle}>Panel principal</Text>
      <Text style={commonStyles.appSubtitle}>Opciones</Text>
    </View>
  );
};

export default Header;