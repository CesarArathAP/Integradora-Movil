import React from 'react';
import { View, Text } from 'react-native';
import { commonStyles } from '../styles/common';

const Section = ({ title, content }) => {
  return (
    <View style={commonStyles.section}>
      <Text style={commonStyles.sectionTitle}>{title}</Text>
      <Text style={commonStyles.sectionContent}>{content}</Text>
    </View>
  );
};

export default Section;