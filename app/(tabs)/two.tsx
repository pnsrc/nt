import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';

const Dialogs = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [versionInfo, setVersionInfo] = useState('');

  useEffect(() => {
    async function fetchSelectedGroup() {
      try {
        const value = await AsyncStorage.getItem('selectedGroup');
        if (value) {
          setSelectedGroup(JSON.parse(value));
        } else {
          setIsVisible(true);
        }
      } catch (error) {
        console.error('Error reading selected group from AsyncStorage:', error);
      }
    }

    fetchSelectedGroup();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      AsyncStorage.setItem('selectedGroup', JSON.stringify(selectedGroup))
        .catch(error => console.error('Error saving selected group:', error));
    }
  }, [selectedGroup]);

  useEffect(() => {
    async function fetchAppVersion() {
      try {
        const version = await Updates.getVersionAsync();
        setVersionInfo(`Версия: ${version}`);
      } catch (error) {
        console.error('Error fetching app version:', error);
      }
    }

    fetchAppVersion();
  }, []);

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
      console.error('Error searching for groups:', error);
    }
  };

  const handleGroupSelection = async (group) => {
    setSelectedGroup(group);
    setIsVisible(false);
    try {
      await AsyncStorage.setItem('selectedGroup', JSON.stringify(group));
      Alert.alert('Успех', `Ваша группа обновлена: ${group.label}`);
      Updates.reloadAsync();
    } catch (error) {
      console.error('Error saving selected group:', error);
    }
  };

  const clearStorage = async () => {
    try {
      await AsyncStorage.clear();
      setSelectedGroup(null);
      Alert.alert('Успех', 'Хранилище успешно очищено');
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleModal} style={styles.button}>
        <Text>{selectedGroup ? selectedGroup.label : "Выберите свою группу"}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={clearStorage} style={styles.button}>
        <Text>Очистить хранилище</Text>
      </TouchableOpacity>

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

      <View style={styles.footer}>
        <Text style={styles.footerText}>codename: quantum</Text>
        <Text style={styles.footerText}>Studl ver: 0.0.5</Text>
        <Text style={styles.footerText}>made by pnsrc with ❤</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#eee',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 12,
    color: '#333',
  },
});

export default Dialogs;
