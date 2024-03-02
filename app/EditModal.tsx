import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, Platform, Keyboard, Image, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import Textarea from 'react-native-textarea';
import { Ionicons } from '@expo/vector-icons';

const ModalScreen = ({ isVisible, closeModal, lessonDate, lessonName }) => {
  const [task, setTask] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [isImageAttached, setIsImageAttached] = useState(false);

  useEffect(() => {
    if (isVisible) {
      loadTask();
    }
  }, [isVisible, lessonDate, lessonName]);

  const getKey = () => {
    return lessonDate + "_" + lessonName;
  };

  const loadTask = async () => {
    setIsImageAttached(false);
    try {
      const savedData = await AsyncStorage.getItem(getKey());
      if (savedData !== null) {
        const parsedData = JSON.parse(savedData);
        setTask(parsedData.task);
        setAttachment(parsedData.attachment);
        setIsImageAttached(!!parsedData.attachment);
      } else {
        setTask('');
        setAttachment(null);
      }
    } catch (error) {
      console.error('Error loading task:', error);
    }
  };

  const saveTask = async () => {
    try {
      const data = { task, attachment };
      await AsyncStorage.setItem(getKey(), JSON.stringify(data));
      console.log('Task saved successfully');
      Keyboard.dismiss();
      handleClose();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleChooseAttachment = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access media library was denied');
        return;
      }
  
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
  
      console.log(result);
  
      if (!result.assets[0].cancelled) {
        setAttachment(result.assets[0].uri);
        setIsImageAttached(true);
      }
    } catch (error) {
      console.error('Error choosing image:', error);
    }
  };
  

  const handleRemoveAttachment = () => {
    Alert.alert(
      'Удалить изображение',
      'Вы уверены, что хотите удалить изображение?',
      [
        {
          text: 'Отмена',
          onPress: () => console.log('Отменено'),
          style: 'cancel',
        },
        { text: 'Удалить', onPress: () => confirmRemoveAttachment() },
      ],
      { cancelable: false }
    );
  };

  const confirmRemoveAttachment = () => {
    setAttachment(null);
    setIsImageAttached(false);
  };

  const handleClose = () => {
    closeModal();
  };
  const modalBackground = Platform.OS === 'android' ? { backgroundColor: '#fff' } : null;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      onRequestClose={closeModal}
      transparent={true}
    >
    <BlurView intensity={Platform.OS === 'android' ? 0 : 40} style={styles.absoluteFill}>
      <BlurView intensity={10} style={[styles.blurContainer, modalBackground]}>
          <View style={styles.container}>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>{lessonName}</Text>
                <Text style={styles.subtitle}>Дата урока: {lessonDate}</Text>
              </View>
              {attachment ? (
                <TouchableOpacity onPress={handleRemoveAttachment}>
                  <Image source={{ uri: attachment }} style={styles.attachmentImage} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={handleChooseAttachment}>
                  <Ionicons name="add-circle" size={50} color="#ff6347" />
                </TouchableOpacity>
              )}
            </View>
            <Textarea
              containerStyle={styles.textareaContainer}
              style={styles.textarea}
              onChangeText={text => setTask(text)}
              value={task}
              placeholder={'Введите задание'}
              placeholderTextColor={'#ccc'}
              underlineColorAndroid={'transparent'}
              textAlignVertical={'top'}
              returnKeyType={'done'}
              enablesReturnKeyAutomatically={true}
              blurOnSubmit={true}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={saveTask}>
                <Ionicons name="save" size={40} color="#ff6347" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={40} color="#ff6347" />
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </BlurView>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '80%',
    maxHeight: '100%',
  },
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 15,
  },
  textareaContainer: {
    width: '100%',
    height: 150,
    padding: 5,
    backgroundColor: 'transparent',
    marginBottom: 20,
  },
  textarea: {
    textAlignVertical: 'top',
    height: 150,
    fontSize: 14,
    color: '#333',
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    position: 'absolute',
    top: "5%",
  },
  attachmentImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
    borderRadius: 10,
  },
});

export default ModalScreen;
