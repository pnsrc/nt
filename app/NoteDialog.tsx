import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Platform } from 'react-native';

const NoteDialog = ({ isVisible, closeModal, note, onDelete }) => {
  const modalBackgroundStyle = Platform.OS === 'android' ? styles.centeredView : styles.centeredViewAndroid;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      onRequestClose={closeModal}
    >
      <View style={modalBackgroundStyle}>
        <View style={styles.modalView}>
          <Text style={styles.title}>{note.lessonName}</Text>
          <Text style={styles.subtitle}>{note.lessonDate}</Text>
          <Text style={styles.task}>{note.task}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={onDelete}>
              <Text style={styles.buttonText}>Удалить</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.closeButton]} onPress={closeModal}>
              <Text style={styles.buttonText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  centeredViewAndroid: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  modalView: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  task: {
    fontSize: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#ff6347',
  },
  closeButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default NoteDialog;
