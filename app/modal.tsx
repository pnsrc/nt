import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import LottieView from 'lottie-react-native';


export default function ModalScreen() {
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
      <Text style={styles.subtitle}>Это обозначает то, что могут быть грубые ошибки в работе приложения, если вы их заметили отпишитесь мне в лс Telegram</Text>
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
