import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import LottieView from 'lottie-react-native';


export default function LessonNote() {
  return (
    <View style={styles.container}>
            <LottieView
        autoPlay
        style={{
          width: 200,
          height: 200,
        }}
        source={require('../assets/lottie/human.json')}
      />
      <Text style={styles.title}>Это альфа версия</Text>
      <Text style={styles.subtitle}>Это обозчает то, что могут быть грубые ошибки в работе приложения. Баги отлавливаются в большинстве случае автоматически. Но всеже, не все, если вы нашли баг, то сообщите об этом </Text>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  subtitle:{
    padding: '10%',
    fontSize: 15,
    },
});
