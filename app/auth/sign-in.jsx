import React, { useState , useEffect } from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, Image, I18nManager,KeyboardAvoidingView, Button, ActivityIndicator , Modal } from 'react-native';
import { Link , useRouter } from 'expo-router';
import { firebase } from 'firebase/app'; 
import { getAuth, signInWithEmailAndPassword ,sendPasswordResetEmail} from 'firebase/auth'; 
import { getDatabase, ref, onValue, set, push ,get} from "firebase/database";

export default function SignInScreen() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [emailForgotPassword, setEmailForgotPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loadingForgotPassword, setLoadingForgotPassword] = useState(false);
  const router = useRouter();


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

  const handleSignIn = async () => {
    setLoading(true);
    setError('');
    const auth = getAuth();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User signed in:', userCredential.user);

      await checkFirstTimeLogin(userCredential.user);

      setLoading(false);
    } catch (error) {
      console.error('Sign-in error:', error.message);
      setError('שם משתמש או סיסמא שגויים');
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleResetPassword = async () => {
    setLoadingForgotPassword(true);
    setMessage('');

    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, emailForgotPassword);
      setMessage('איפוס סיסמא נשלחה למייל.');
      setEmailForgotPassword('');
    } catch (error) {
      setMessage(`האימייל שגוי`);
    } finally {
      setLoadingForgotPassword(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require('../../assets/logo.png')} style={styles.logo} />
      
      {/* Header */}
      <Text style={styles.header} >כניסה</Text>
      
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
      
      {/* Error Message */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Forgot Password Button */}
      <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
        <Text style={styles.forgotPasswordText}>שחכתי סיסמא</Text>
      </TouchableOpacity>
      
      {/* Log In Button */}
      <TouchableOpacity style={styles.loginButton} onPress={handleSignIn}>
        {loading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text style={styles.loginButtonText}>התחברות</Text>
        )}
      </TouchableOpacity>
      
      {/* Create Account Button */}
      <TouchableOpacity>
        <Link href="/auth/sign-up">
          <Text style={styles.createAccount}>צור חשבון חדש</Text>
        </Link>
      </TouchableOpacity>

      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>שחזור סיסמא</Text>
            <TextInput
              style={styles.input}
              placeholder="אימייל"
              placeholderTextColor="#FFF"
              color='#FFF'
              value={emailForgotPassword}
              onChangeText={setEmailForgotPassword}
            />
            {message ? <Text style={styles.messageText}>{message}</Text> : null}
            <TouchableOpacity style={styles.loginButton} onPress={handleResetPassword} disabled={loadingForgotPassword}>
              {loadingForgotPassword ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.loginButtonText}>  שחזור סיסמא</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCloseModal}>
              <Text style={styles.closeModalText}>סגור</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
    fontSize: 35,
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
  forgotPassword: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#FFF',
    fontSize: 14,
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#F9332D',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
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
  createAccount: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#000',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalHeader: {
    fontSize: 20,
    marginBottom: 20,
    color: '#FFF',
  },
  messageText: {
    color: '#FFF',
    marginBottom: 10,
  },
  closeModalText: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 10,
  },
});
