import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { ButtonGroup } from '@rneui/themed';
import { FontAwesome } from '@expo/vector-icons';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import ModalScreen from '../EditModal'; // импортируем компонент модального окна

const WeeklySchedule = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [groupId, setGroupId] = useState(null);
  const [prevGroupId, setPrevGroupId] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(moment().isoWeek());
  
  const [startOfWeek, setStartOfWeek] = useState(moment().startOf('isoWeek'));

  const [modalGuid, setModalGuid] = useState('');
  const [lessonDate, setLessonDate] = useState('');
  const [lessonName, setLessonName] = useState('');
  const [notes, setNotes] = useState([]); // Объявляем переменную notes с помощью useState

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [auditoriumGUID, setAuditoriumGUID] = useState(null); // Добавляем состояние для auditoriumGUID
 
  const openModal = useCallback((guid, date, name) => {
    setModalGuid(guid); // Устанавливаем новый guid для модального окна
    setLessonDate(date); // Устанавливаем дату урока в модальном окне
    setLessonName(name); // Устанавливаем название урока в модальном окне
    setIsModalVisible(true); // Открываем модальное окно
  }, []);

  const closeModal = () => {
    setIsModalVisible(false);
    setModalGuid(''); // Обнуляем guid при закрытии модального окна
    setLessonDate('');
    setLessonName('');
  };

  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const previousWeek = useCallback(() => {
    setCurrentWeek(prevWeek => prevWeek - 1);
    setStartOfWeek(prevStart => prevStart.subtract(7, 'days'));
  }, []);

  const nextWeek = useCallback(() => {
    setCurrentWeek(prevWeek => prevWeek + 1);
    setStartOfWeek(prevStart => prevStart.add(7, 'days'));
  }, []);

  useEffect(() => {
    AsyncStorage.getItem('selectedGroup').then(value => {
      if (value) {
        const parsedValue = JSON.parse(value);
        setGroupId(parsedValue.id);
        setPrevGroupId(parsedValue.id);
      }
    });
  }, []);

  const hasNote = useCallback((lessonGuid) => {
    const guid = lesson.auditoriumGUID + '_' + lesson.kindOfWork + '_' + lesson.date + '_' + lesson.beginLesson;
    return notes.some(note => note.guid === lessonGuid);
  }, [notes]);

  

  useEffect(() => {
    if (groupId !== prevGroupId) {
      handleDayButtonClick('Пн');
      setPrevGroupId(groupId);
    }
  }, [groupId]);

  useEffect(() => {
    setStartOfWeek(moment().isoWeek(currentWeek).startOf('isoWeek'));
  }, [currentWeek]);

  const getCurrentWeek = () => {
    const startOfWeekFormatted = startOfWeek.format('YYYY.MM.DD');
    const endOfWeekFormatted = startOfWeek.clone().endOf('isoWeek').format('YYYY.MM.DD');
    return { start: startOfWeekFormatted, end: endOfWeekFormatted };
  };


  const handleDayButtonClick = async (day) => {
    if (!groupId) {
      console.log('Group ID is not set');
      return;
    }
  
    setLoading(true);
    setSelectedDate(day);
  
    try {
      const { start, end } = getCurrentWeek();
      const response = await fetch(`https://rasp.omgtu.ru/api/schedule/group/${groupId}?start=${start}&finish=${end}&lng=1`);
      const data = await response.json();
      console.log("Data from server:");
      if (Array.isArray(data)) {
        setSchedule(data.filter(lesson => lesson.dayOfWeekString === day));
        console.log('very strange')
      } else {
        setError('Произошла ошибка при загрузке расписания');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      setError('Произошла ошибка при загрузке расписания');
      setLoading(false);
    }
};

  const renderDayWithDate = (day, index) => {
    const currentDate = startOfWeek.clone().add(index, 'days').format('D');
    return `${day} ${currentDate}`;
  };

  const currentDaySchedule = useCallback(async () => {
    setLoading(true);
    const currentDay = moment().format('ddd');
    setSelectedDate(currentDay);
    await handleDayButtonClick(currentDay);
    setLoading(false);
  }, []);

  useEffect(() => {
    currentDaySchedule();
  }, []);


  const currentWeekSchedule = useCallback(async () => {
    setLoading(true);
    setCurrentWeek(moment().isoWeek());
    setStartOfWeek(moment().startOf('isoWeek'));
    const currentDay = moment().format('ddd');
    setSelectedDate(currentDay);
    await handleDayButtonClick(currentDay); // Загружаем расписание на текущий день
    setLoading(false);
  }, []);
  
  const LessonCard = ({ lesson }) => {
    const [pressed, setPressed] = useState(false);

    const handlePress = () => {
      setPressed(!pressed);
    };


    return (
      <View style={[styles.lessonContainer, pressed && styles.pressedContainer]}>
        <View style={styles.lessonDetails}>
          <Text style={styles.lesson}>{lesson.discipline}</Text>
          <Text style={styles.info}>{lesson.auditorium}</Text>
          <Text style={styles.info}>{lesson.kindOfWork}</Text>
          <Text style={styles.info}>
            Подгруппа: {lesson.subGroup ? (lesson.subGroup.includes('/1') ? '1' : lesson.subGroup.includes('/2') ? '2' : 'Общая') : 'ВСЕ'}
          </Text>
          <Text style={styles.info}>{lesson.beginLesson} - {lesson.endLesson}</Text>
        </View>
        {hasNote && (
          <TouchableOpacity 
            style={styles.iconContainer} 
            onPressIn={() => openModal(lesson.auditoriumGUID+ '' + lesson.kindOfWork + '' + lesson.date + '' + lesson.beginLesson, lesson.date, lesson.discipline)}>
            <FontAwesome
              name="pencil"
              size={20}
              color="black"
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ButtonGroup
        buttons={daysOfWeek.map(renderDayWithDate)}
        onPress={(selectedIndex) => handleDayButtonClick(daysOfWeek[selectedIndex])}
        containerStyle={styles.buttonGroupContainer}
        textStyle={styles.buttonGroupText}
        selectedIndex={daysOfWeek.indexOf(selectedDate)}
        disabled={loading}
        selectedButtonStyle={{backgroundColor: '#ff6347'}}
        selectedTextStyle={{color: '#fff'}}
      />
      <ScrollView style={styles.scheduleContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : error ? (
          <Text>{error}</Text>
        ) : schedule ? (
          schedule.length > 0 ? (
            <View>
              {schedule.map((lesson, index) => (
                <LessonCard key={index} lesson={lesson} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyScheduleContainer}>
              <LottieView
                autoPlay
                style={{
                  width: 200,
                  height: 200,
                }}
                source={require('../../assets/lottie/chill.json')}
              />
              <Text style={styles.emptyScheduleText}>Можно отдохнуть</Text>
            </View>
          )
        ) : null}
      </ScrollView>
      <View style={styles.navigationContainer}>
        <TouchableOpacity onPress={previousWeek} style={styles.transparentButton}>
          <FontAwesome 
            name="arrow-circle-left" 
            size={30} 
            color="#ff6347" 
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={currentWeekSchedule} style={styles.transparentButton}>
          <FontAwesome 
            name="calendar" 
            size={30} 
            color={currentWeek === moment().isoWeek() ? '#ff6347' : 'black'} 
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={nextWeek} style={styles.transparentButton}>
          <FontAwesome 
            name="arrow-circle-right" 
            size={30} 
            color="#ff6347" 
          />
        </TouchableOpacity>
      </View>
      <ModalScreen 
        guid={modalGuid} 
        lessonDate={lessonDate} 
        lessonName={lessonName}
        isVisible={isModalVisible} 
        closeModal={closeModal} 
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
  transparentButton: {
    backgroundColor: 'transparent',
  },
  scheduleContainer: {
    flex: 1,
    borderRadius: 10,
    marginVertical: 10,
  },
  lessonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
  },
  pressedContainer: {
    opacity: 0.7,
  },
  iconContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  lessonDetails: {
    flex: 1,
  },
  lesson: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  info: {
    fontSize: 14,
    marginBottom: 3,
  },
  emptyScheduleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyScheduleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 32,
    paddingRight: 32,
  },
  buttonGroupContainer: {
    marginBottom: 10,
  },
  buttonGroupText: {
    fontSize: 14,
  },
});

export default WeeklySchedule;