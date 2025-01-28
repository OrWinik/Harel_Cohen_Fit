// _layout.jsx
import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, StyleSheet , I18nManager} from 'react-native';
import { Slot } from 'expo-router';
import Notifications from './notifications'; 


export default function Layout() {

  useEffect(() => {
    I18nManager.allowRTL(true); 
  }, []); 

  return (
    <View style={styles.container}>
      <Notifications />
      <Slot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
