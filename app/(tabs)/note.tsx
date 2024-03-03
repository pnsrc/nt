import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import Swipeout from 'react-native-swipeout';
import Icon from 'react-native-vector-icons/FontAwesome';
import EditModal from '../EditModal';
import ViewNoteFull from '../ViewNoteFull'; // Предполагается, что ViewNoteFull находится в том же каталоге

const SimpleScreen = () => {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [selectedLessonName, setSelectedLessonName] = useState('');
  const [selectedLessonDate, setSelectedLessonDate] = useState('');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isViewNoteFullVisible, setIsViewNoteFullVisible] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(loadNotes, 2000);
    return () => clearInterval(intervalId);
  }, []);

  const loadNotes = async () => {
    try {
      const savedNotes = await AsyncStorage.getAllKeys();
      const parsedNotes = await Promise.all(savedNotes.map(async (key) => {
        const [lessonDate, lessonName, attachment] = key.split('_');
        const task = await AsyncStorage.getItem(key);
        return { guid: key, task: JSON.parse(task), lessonDate, lessonName, attachment };
      }));
  
      const filteredNotes = parsedNotes.filter(note => note.lessonName && (!note.attachment || note.attachment === undefined));
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

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setSelectedLessonName(note.lessonName);
    setSelectedLessonDate(note.lessonDate);
    setIsEditModalVisible(true);
  };

  const confirmDelete = (note) => {
    setSelectedNote(note);
    setIsConfirmationVisible(true);
  };

  const handleViewNoteFull = (note) => {
    setSelectedNote(note);
    setIsViewNoteFullVisible(true);
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
                      style={[styles.editButton, styles.center]}
                      onPress={() => handleEditNote(note)}
                      activeOpacity={0.7}
                      underlayColor="transparent"
                    >
                      <Icon name="pencil" size={20} color="blue" />
                    </TouchableOpacity>
                  ),
                  backgroundColor: 'transparent',
                  onPress: () => handleEditNote(note),
                },
                {
                  component: (
                    <TouchableOpacity
                      style={[styles.deleteButton, styles.center]}
                      onPress={() => confirmDelete(note)}
                      activeOpacity={0.7}
                      underlayColor="transparent"
                    >
                      <Icon name="trash" size={20} color="red" />
                    </TouchableOpacity>
                  ),
                  backgroundColor: 'transparent',
                  onPress: () => confirmDelete(note),
                },
              ]}
              autoClose={true}
              backgroundColor={'transparent'}
            >
              <TouchableOpacity style={styles.noteContainer} onPress={() => handleViewNoteFull(note)}>
                <View style={styles.card}>
                  <View style={styles.leftContent}>
                    <Text style={styles.guid}>{note.lessonName}</Text>
                    <Text style={styles.lessonDate}>{note.lessonDate}</Text>
                    <Text style={styles.task}>{note.task.task.length > 100 ? note.task.task.substring(0, 100) + '...' : note.task.task}</Text>
                  </View>
                  {note.task.attachment && (
                    <Image source={{ uri: note.task.attachment }} style={styles.attachmentImage} />
                  )}
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
      <Modal
        visible={isViewNoteFullVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsViewNoteFullVisible(false)}
      >
        <ViewNoteFull
          visible={isViewNoteFullVisible}
          closeModal={() => setIsViewNoteFullVisible(false)}
          note={selectedNote}
        />
      </Modal>
      {/* Модальное окно редактирования заметки */}
      <EditModal
        isVisible={isEditModalVisible}
        closeModal={() => setIsEditModalVisible(false)}
        note={selectedNote} // Передаем выбранную заметку в EditModal
        lessonName={selectedLessonName} // Передаем название урока в EditModal
        lessonDate={selectedLessonDate} // Передаем дату урока в EditModal
      />
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
    paddingTop: '20%',
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
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
  },
  leftContent: {
    flex: 1,
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
    flexWrap: 'wrap',
    marginRight: 10,
  },
  rightContent: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 100, // Ширина изображения
    resizeMode: 'cover', // Масштабирование изображения
    borderTopRightRadius: 10, // Скругление правого верхнего угла
    borderBottomRightRadius: 10, // Скругление правого нижнего угла
  },
  attachmentImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
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
  editButton: {
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
