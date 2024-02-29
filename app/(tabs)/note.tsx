import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SimpleScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Привет, мир!</Text>
      <Text style={styles.subtitle}>Это мой первый экран на React Native.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
  },
});

export default SimpleScreen;
