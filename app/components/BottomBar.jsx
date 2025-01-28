import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet , Image} from 'react-native';
import { useRouter } from 'expo-router';

export default function BottomBar() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/home')}>
        <Image source={require('../../assets/HomeButton5.png')} style={styles.icon} />
        <Text style={styles.buttonText}>בית</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.push('https://harelcohen.co.il/')}>
        <Image source={require('../../assets/ContactButton.png')} style={styles.icon} />
        <Text style={styles.buttonText}>צור קשר</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.push('https://wa.me/972522713568')}>
        <Image source={require('../../assets/MeetingButton.png')} style={styles.icon} />
        <Text style={styles.buttonText}>פגישות</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#272727',
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: '#CCC',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  button: {
    marginTop:4,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 12,
    alignItems: 'center',
    marginTop:2,
  },
});
