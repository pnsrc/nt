import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Button, StyleSheet, TextInput, Platform, Keyboard } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ModalScreen = ({ isVisible, closeModal, lessonDate, lessonName }) => {
  const [task, setTask] = useState('');

  useEffect(() => {
    // При открытии модального окна загружаем данные из памяти
    loadTask();
  }, [lessonDate, lessonName]); // Обновляем данные при изменении даты урока или названия предмета

  const getKey = () => {
    return lessonDate + "_" + lessonName; // Формируем уникальный ключ на основе даты и названия предмета
  };

  const loadTask = async () => {
    try {
      const savedTask = await AsyncStorage.getItem(getKey()); // Загружаем данные по уникальному ключу из памяти
      if (savedTask !== null) {
        setTask(savedTask);
      }
    } catch (error) {
      console.error('Error loading task:', error);
    }
  };

  const saveTask = async () => {
    try {
      await AsyncStorage.setItem(getKey(), task); // Сохраняем данные в память по уникальному ключу
      console.log('Task saved successfully');
      Keyboard.dismiss(); // Скрыть клавиатуру после сохранения
      handleClose()
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleClose = () => {
    closeModal(); // Закрываем модальное окно
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      onRequestClose={closeModal}
    >
      <View style={styles.container}>
        <Text style={styles.title}>{lessonName}</Text>
        <Text style={styles.subtitle}>Дата урока: {lessonDate}</Text>
        <Text style={styles.subtitle}>Введите задание:</Text>
        <TextInput
          style={styles.input}
          onChangeText={setTask}
          placeholder="Введите задание"
          multiline={true}
        />
        <Button title="Сохранить" onPress={saveTask} />
        <Button title="Закрыть" onPress={handleClose} />
        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 10,
  },
  input: {
    width: '80%',
    height: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
});

export default ModalScreen;
