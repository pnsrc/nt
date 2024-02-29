import React from 'react';
import { StyleSheet } from 'react-native';

import { ExternalLink } from './ExternalLink';
import { MonoText } from './StyledText';
import { View } from './Themed';

import Colors from '@/constants/Colors';
import { Button, Card, Text } from '@rneui/themed'

export default function EditScreenInfo({ path }: { path: string }) {
  return (
    <View>
      <Text>
        <Card>
              <Card.Title>adg</Card.Title>
              <Text style={{
            marginBottom: 10
          }}></Text>
            </Card>;
      </Text>

    </View>
  );
}


