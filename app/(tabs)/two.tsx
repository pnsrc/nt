import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Dialogs = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    async function fetchSelectedGroup() {
      try {
        const value = await AsyncStorage.getItem('selectedGroup');
        logDebugInfo('AsyncStorage value:', value);
        if (value) {
          setSelectedGroup(JSON.parse(value));
        } else {
          setIsVisible(true);
        }
      } catch (error) {
        logDebugInfo('Error reading selected group from AsyncStorage:', error);
      }
    }

    fetchSelectedGroup();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      AsyncStorage.setItem('selectedGroup', JSON.stringify(selectedGroup))
        .then(() => logDebugInfo('Selected group saved successfully'))
        .catch(error => logDebugInfo('Error saving selected group:', error));
    }
  }, [selectedGroup]);

  const toggleModal = () => {
    setIsVisible(!isVisible);
  };

  const handleInputChange = (text) => {
    setSearchTerm(text);
    if (text) {
      searchGroups(text);
    }
  };

  const searchGroups = async (term) => {
    try {
      const response = await fetch(`https://rasp.omgtu.ru/api/search?term=${encodeURIComponent(term)}&type=group`);
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      logDebugInfo('Error searching for groups:', error);
    }
  };

  const handleGroupSelection = async (group) => {
    setSelectedGroup(group);
    setIsVisible(false);
    try {
      await AsyncStorage.setItem('selectedGroup', JSON.stringify(group));
      Alert.alert('Успех', `Ваша группа обновлена: ${group.label}`);
    } catch (error) {
      logDebugInfo('Error saving selected group:', error);
    }
  };

  const logDebugInfo = (...args) => {
    const newDebugInfo = args.join(' ');
    setDebugInfo(prevDebugInfo => prevDebugInfo + '\n' + newDebugInfo);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleModal} style={styles.button}>
        <Text>{selectedGroup ? selectedGroup.label : "Выберите свою группу"}</Text>
      </TouchableOpacity>
      <Text>Далее информация которая собирается в процессе работы приложения</Text>
      <ScrollView style={styles.debugContainer}>
        <Text>{debugInfo}</Text>
      </ScrollView>
      <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Выбор группы</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Введите группу"
                onChangeText={handleInputChange}
              />
            </View>
            <ScrollView style={styles.scrollView}>
              <View>
                {groups.map(group => (
                  <TouchableOpacity key={group.id} onPress={() => handleGroupSelection(group)}>
                    <Text style={styles.groupText}>{group.label} - {group.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  debugContainer: {
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  button: {
    borderRadius: 6,
    width: 220,
    marginVertical: 20,
    padding: 10,
    backgroundColor: '#eee',
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  input: {
    height: 40,
    paddingHorizontal: 10,
  },
  scrollView: {
    maxHeight: 200,
  },
  groupText: {
    fontSize: 16,
    paddingVertical: 10,
  },
  selectedGroupText: {
    fontSize: 18,
    marginTop: 20,
  },
});

export default Dialogs;
