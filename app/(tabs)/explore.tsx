import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'

const explore = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>explore</Text>

      <TouchableOpacity onPress={() => { }}>
        <Text> Open PDF </Text>
      </TouchableOpacity>
    </View>
  )
}

export default explore

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
})