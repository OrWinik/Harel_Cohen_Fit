import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, I18nManager, KeyboardAvoidingView, Button, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { firebase } from 'firebase/app'; 
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getDatabase, ref, onValue, set, push ,get} from "firebase/database";
import * as Notifications from 'expo-notifications';

export default function SignUpScreen() {

  const db = getDatabase();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const router = useRouter();

  // Sign up method
  const handleSignUp = async () => {
    setLoading(true);
    setErrorMessage('');
  
    try {
      console.log('Attempting sign-up with:', email, password, username);
      
      const auth = getAuth();

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(userCredential.user, {
        displayName: username,
      });
      
      const currentUser =  auth.currentUser; 
      const saveUsername = ref(db, `users/${currentUser.uid}/user_name`);

      const pushToken = await Notifications.getExpoPushTokenAsync();
      const saveToken = ref(db ,  `users/${currentUser.uid}/push_token`);

      try{
        await set(saveUsername, username);
        await set(saveToken,pushToken);
      }
      catch (error)
      {
        console.log(errorMessage);
      }

      setLoading(false);
      await checkFirstTimeLogin(userCredential.user);

    } catch (error) {
      setLoading(false);
      console.error('Error during sign-up:', error);
      setErrorMessage(error.message);
    }
  };

  const checkFirstTimeLogin = async (user) => {
    const database = getDatabase();
    try {
      const userRef = await get(ref(database, `users/${user.uid}/firstTimeLogIn`));

      if (userRef.val() == true) 
      {
        console.log('Existing user loged in. Redirecting to main page ...');
        router.replace('/home/');

      } else 
      {
        console.log('New user loged in. Redirecting to form page...');
        router.replace('/home/entryForm');
      }
    } catch (error) {
      console.error('Error checking first-time login:', error.message);
      console.log("New user , Moving to entry form")
      router.replace('/home/entryForm');

    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require('../../assets/logo.png')} style={styles.logo} />

      {/* Header */}
      <Text style={styles.header}>הרשמה</Text>

      {/* Username Input */}
      <TextInput
        style={styles.input}
        placeholder="שם משתמש:"
        placeholderTextColor="#000" 
        color="#000"
        backgroundColor='#FFF'
        value={username}
        onChangeText={setUsername} 
      />

      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="אימייל:"
        placeholderTextColor="#000" 
        color="#000"
        backgroundColor='#FFF'
        value={email} 
        onChangeText={setEmail} 
      />

      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="סיסמא:"
        placeholderTextColor="#000" 
        color="#000"
        backgroundColor='#FFF'
        secureTextEntry
        value={password} 
        onChangeText={setPassword} 
      />

      {/* Sign Up Button */}
      <TouchableOpacity style={styles.SignUpButton} onPress={handleSignUp} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.loginButtonText}>הרשמה</Text>
        )}
      </TouchableOpacity>

      {/* Back Button */}
      <TouchableOpacity>
        <Link href="/auth/sign-in">
          <Text style={styles.BackButton}>חזור</Text>
        </Link>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#272727',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FFF',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    textAlign: 'right',
  },
  SignUpButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#F9332D',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    marginTop:20,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signInButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
  },
  signInImage: {
    width: 50,
    height: 50,
  },
  BackButton: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
