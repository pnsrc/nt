import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import Swipeout from 'react-native-swipeout';
import Icon from 'react-native-vector-icons/FontAwesome';

const SimpleScreen = () => {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(loadNotes, 2000);
    return () => clearInterval(intervalId);
  }, []);

  const loadNotes = async () => {
    try {
      const savedNotes = await AsyncStorage.getAllKeys();
      const parsedNotes = await Promise.all(savedNotes.map(async (key) => {
        const task = await AsyncStorage.getItem(key);
        const [lessonDate, lessonName] = key.split('_');
        return { guid: key, task, lessonDate, lessonName };
      }));

      const filteredNotes = parsedNotes.filter(note => note.lessonName);
      filteredNotes.sort((a, b) => new Date(a.lessonDate) - new Date(b.lessonDate));
      setNotes(filteredNotes);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const handleDeleteNote = async (note) => {
    try {
      await AsyncStorage.removeItem(note.guid);
      loadNotes();
      setIsConfirmationVisible(false);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const confirmDelete = (note) => {
    setSelectedNote(note);
    setIsConfirmationVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ваши заметки</Text>
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <LottieView
            source={require('../../assets/lottie/karandash.json')}
            autoPlay
            loop
            style={styles.loader}
          />
          <Text>Загрузка заметок...</Text>
        </View>
      ) : notes.length > 0 ? (
        <ScrollView contentContainerStyle={styles.scrollView}>
          {notes.map((note, index) => (
            <Swipeout
              key={index}
              right={[
                {
                  component: (
                    <TouchableOpacity
                      style={[styles.deleteButton, styles.center]}
                      onPress={() => confirmDelete(note)}
                      activeOpacity={0.7} // Определяем степень прозрачности фона при нажатии
                      underlayColor="transparent" // Устанавливаем прозрачный фон
                    >
                      <Icon name="trash" size={20} color="red" />
                    </TouchableOpacity>
                  ),
                  backgroundColor: 'transparent', // Устанавливаем прозрачный фон для кнопки
                  onPress: () => confirmDelete(note),
                },
              ]}
              autoClose={true}
              backgroundColor={'transparent'}
            >
              <TouchableOpacity style={styles.noteContainer} onPress={() => console.log(note.guid)}>
                <View style={styles.card}>
                  <Text style={styles.guid}>{note.lessonName}</Text>
                  <Text style={styles.lessonDate}>{note.lessonDate}</Text>
                  <Text style={styles.task}>{note.task}</Text>
                </View>
              </TouchableOpacity>
            </Swipeout>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.noNotesContainer}>
          <LottieView
            source={require('../../assets/lottie/karandash.json')}
            autoPlay
            loop
            style={styles.noNotesAnimation}
          />
          <Text style={styles.noNotesText}>Ой, заметок нет</Text>
        </View>
      )}
      <Modal
        visible={isConfirmationVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsConfirmationVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Удаление заметки</Text>
            <Text style={styles.modalMessage}>Вы уверены, что хотите удалить эту заметку?</Text>
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={() => handleDeleteNote(selectedNote)}>
                <Text style={styles.modalButtonText}>Да</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalCancelButton]} onPress={() => setIsConfirmationVisible(false)}>
                <Text style={styles.modalButtonText}>Отмена</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scrollView: {
    flexGrow: 1,
  },
  noteContainer: {
    marginVertical: 5,
  },
  card: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
  },
  guid: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  lessonDate: {
    fontStyle: 'italic',
    marginBottom: 5,
  },
  task: {
    fontSize: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    width: 100,
    height: 100,
  },
  noNotesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noNotesAnimation: {
    width: 200,
    height: 200,
  },
  noNotesText: {
    fontSize: 18,
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    minWidth: 250,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: '#007BFF',
  },
  modalCancelButton: {
    backgroundColor: '#6C757D',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  deleteButton: {
    width: 60,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SimpleScreen;
