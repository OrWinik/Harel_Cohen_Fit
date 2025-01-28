import React, { useEffect } from 'react';
import {I18nManager} from 'react-native';
import { useRouter } from 'expo-router';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged , signInWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, onValue, set, push } from "firebase/database";


const firebaseConfig = {
  apiKey: "AIzaSyCJ_xQ2fYdSF0M47CPSzv8tyThB8USpzxE",
  authDomain: "harelcohenfit-7b27a.firebaseapp.com",
  projectId: "harelcohenfit-7b27a",
  storageBucket: "harelcohenfit-7b27a.firebasestorage.app",
  messagingSenderId: "628491572450",
  appId: "1:628491572450:ios:a52358bca0fc6c1dafbabb",
  databaseURL: "https://harelcohenfit-7b27a-default-rtdb.europe-west1.firebasedatabase.app",
};

const app = initializeApp(firebaseConfig); // Initialize Firebase app


export default function IndexPage() {
  const router = useRouter();

  useEffect(() => {    
    const auth = getAuth(app); 
    const database = getDatabase(app); 

    console.log('Database initialized:', database ? 'Yes' : 'No');
    console.log('auth initialized:', auth ? 'Yes' : 'No');
  
    // Listen to the authentication state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user == true) 
      {
        checkFirstTimeLogin(user); 
      } 
      else 
      {
        console.log('No user is signed in');
        router.replace('/auth/sign-in');
      }
    });
  
    return () => unsubscribe();
  }, [router]);

  return null;
}


