import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LessonItem = ({ lesson }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.lesson}>{lesson.discipline}</Text>
      <Text style={styles.info}>{lesson.auditorium}</Text>
      <Text style={styles.info}>{lesson.kindOfWork}</Text>
      <Text style={styles.info}>{lesson.beginLesson} - {lesson.endLesson}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  lesson: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  info: {
    fontSize: 14,
    marginBottom: 5,
  },
});

export default LessonItem;
