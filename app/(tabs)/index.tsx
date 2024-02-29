import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { ButtonGroup } from '@rneui/themed';
import { FontAwesome } from '@expo/vector-icons';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';

const WeeklySchedule = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [groupId, setGroupId] = useState(null);
  const [prevGroupId, setPrevGroupId] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(moment().isoWeek());
  
  const [startOfWeek, setStartOfWeek] = useState(moment().startOf('isoWeek'));

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
      console.error('Group ID is not set');
      return; // выход из функции
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
    const currentDay = moment().format('ddd'); // Получаем текущий день недели
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
    await handleDayButtonClick(currentDay);
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
        <TouchableOpacity style={styles.iconContainer} onPress={handlePress}>
          <FontAwesome
            name="pencil"
            size={pressed ? 16 : 20}
            color="black"
            style={{ opacity: pressed ? 0.5 : 0.2 }}
          />
        </TouchableOpacity>
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
        <FontAwesome.Button name="arrow-circle-left" onPress={previousWeek} />
        <FontAwesome.Button name="calendar" onPress={currentWeekSchedule} />
        <FontAwesome.Button name="arrow-circle-right" onPress={nextWeek} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
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
    marginTop: 20,
  },
  buttonGroupContainer: {
    marginBottom: 10,
  },
  buttonGroupText: {
    fontSize: 14,
  },
});

export default WeeklySchedule;
