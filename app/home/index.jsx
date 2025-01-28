import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, I18nManager, SafeAreaView, ImageBackground, ActivityIndicator} from 'react-native';
import { useRouter } from 'expo-router';
import BottomBar from '../components/BottomBar';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getDatabase, ref, onValue, set, push, get } from "firebase/database";

export default function HomeScreen() {

  const db = getDatabase();
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const [displayUsername, setDisplayUsername] = useState('');
  const [fat, setFat] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [daily_fat, setDailyFat] = useState('');
  const [daily_protein, setDailyProtein] = useState('');
  const [daily_carbs, setDailyCarbs] = useState('');
  const router = useRouter();
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading , SetLoading] = useState(true);
  const navigateTo = (path) => router.push(path);

  const GettingUserInfo = async () => {
    try {
      //user name at the header 
      const usernameRef = ref(db, `users/${currentUser.uid}/user_name`);
      const display_Username = await get(usernameRef);
      setDisplayUsername(display_Username.val());

      //getting the macros info
      const fatRef = ref(db, `users/${currentUser.uid}/user_fat`);
      const proteinRef = ref(db, `users/${currentUser.uid}/user_protein`);
      const carbsRef = ref(db, `users/${currentUser.uid}/user_carbs`);

      const fat_TF = await get(fatRef);
      if (fat_TF.exists()) setFat(fat_TF.val());

      const protein_TF = await get(proteinRef);
      if (protein_TF.exists()) setProtein(protein_TF.val());

      const carbs_TF = await get(carbsRef);
      if (carbs_TF.exists()) setCarbs(carbs_TF.val());

      const fatdayRef = ref(db, `users/${currentUser.uid}/user_daily_fat`);
      const proteindayRef = ref(db, `users/${currentUser.uid}/user_daily_protein`);
      const carbsdayRef = ref(db, `users/${currentUser.uid}/user_daily_carbs`);

      const d_fat_TF = await get(fatdayRef);
      if (d_fat_TF.exists()) setDailyFat(d_fat_TF.val());

      const d_protein_TF = await get(proteindayRef);
      if (d_protein_TF.exists()) setDailyProtein(d_protein_TF.val());

      const d_carbs_TF = await get(carbsdayRef);
      if (d_carbs_TF.exists()) setDailyCarbs(d_carbs_TF.val());

      if (d_fat_TF.val() <= 0) {
        setDailyFat(0);
      }
      if (d_carbs_TF.val() <= 0) {
        setDailyCarbs(0);
      }
      if (d_protein_TF.val() <= 0) {
        setDailyProtein(0);
      }

      SetLoading(false);
    }
    catch (error) {
      SetLoading(false);
    }
  };

  const resetDailyMacros = async () => {
    try {
      const currentDate = new Date();
      const israelTime = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Jerusalem',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(currentDate);

      console.log("Israel Time:", israelTime); 

      const options = { hour: '2-digit', hour12: true, timeZone: 'Asia/Jerusalem' };
      const formatter = new Intl.DateTimeFormat('en-US', options);
      const formattedTime = formatter.format(currentDate);
  
      const timeParts = formattedTime.split(':');
      const hour = parseInt(timeParts[0]);
      const currentPeriod = formattedTime.includes('AM') ? 'am' : 'pm'; 

      const today = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Jerusalem',
      }).format(currentDate); 

      const resetFlagRef = ref(db, `users/${currentUser.uid}/reset_flag`);
      const lastResetDateRef = ref(db, `users/${currentUser.uid}/last_reset_date`);
      const lastResetDate = (await get(lastResetDateRef)).val() || null;
  
      if (lastResetDate !== today) {
        await set(resetFlagRef, false);
        await set(lastResetDateRef, today);
        console.log("Reset flag updated to false for the new day.");
      }
  

      if (currentPeriod === 'pm' || (currentPeriod === 'am' && hour >= 6)) {
        const resetFlagRef = ref(db, `users/${currentUser.uid}/reset_flag`);
        const resetFlag = await get(resetFlagRef);

        if (resetFlag.exists() && resetFlag.val() === true) {
          console.log("Macros have already been reset today.");
          return;
        }

        const fatRef = ref(db, `users/${currentUser.uid}/user_fat`);
        const proteinRef = ref(db, `users/${currentUser.uid}/user_protein`);
        const carbsRef = ref(db, `users/${currentUser.uid}/user_carbs`);

        const fatValue = parseFloat((await get(fatRef)).val() || 0);
        const proteinValue = parseFloat((await get(proteinRef)).val() || 0);
        const carbsValue = parseFloat((await get(carbsRef)).val() || 0);

        const fatdayRef = ref(db, `users/${currentUser.uid}/user_daily_fat`);
        const proteindayRef = ref(db, `users/${currentUser.uid}/user_daily_protein`);
        const carbsdayRef = ref(db, `users/${currentUser.uid}/user_daily_carbs`);

        await set(fatdayRef, fatValue);
        await set(proteindayRef, proteinValue);
        await set(carbsdayRef, carbsValue);

        const nutritionRef = ref(db, `nutrition/${currentUser.uid}/meals`);
        await set(nutritionRef, null);
        await set(resetFlagRef, true);

        console.log("Daily macros have been reset.");
      } else {
        console.log("It's not yet 6 AM. Wait until after 6 AM to reset.");
      }
    } catch (error) {
      console.error("Error resetting daily macros:", error);
    }
  };

  const CheckPremium = async () => {
    if (currentUser) {
      const userRef = ref(db, `users/${currentUser.uid}/is_Premium`);
      try {
        const isPrem = await get(userRef)
        setIsPremium(isPrem.val());
        console.log("Is premiium ", isPrem.val());
      }
      catch (error) {
        console.log(error);
      }
    }
  }

  useEffect(() => {
    resetDailyMacros();
    GettingUserInfo();
    CheckPremium();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={require('../../assets/logo.png')} 
          style={styles.logo}
        />
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        {/* Logo */}
        <Image source={require('../../assets/logo.png')} style={styles.logo} />

        {/* Header */}
        <Text style={styles.header}>ברוך הבא {displayUsername}!</Text>

        {/* Nutrient Circles */}
        <View style={styles.circlesContainer}>
          {[
            { name: 'פחמימה', total: carbs, daily: daily_carbs },
            { name: 'שומן', total: fat, daily: daily_fat },
            { name: 'חלבון', total: protein, daily: daily_protein },
          ].map((nutrient, index) => (
            <View key={index}
              style={[styles.circle,
              index === 0 && styles.circle1,
              index === 1 && styles.circle2,
              index === 2 && styles.circle3
              ]}>
              {nutrient.daily > 0 && (
                <>
                  <Text style={styles.circleHeader}>{nutrient.name}</Text>
                  <Text style={styles.circleText}>{nutrient.total}g</Text>
                  <Text style={styles.circleTextLeft}>{nutrient.daily}g נשארו</Text>
                </>
              )}

              {nutrient.daily <= 0 && (
                <Text style={[styles.checkIcon,
                index === 0 && styles.circle1,
                index === 1 && styles.circle2,
                index === 2 && styles.circle3
                ]}>✔️</Text>
              )}
            </View>
          ))}
        </View>


        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          <View style={styles.buttonRow}>
            <ImageBackground source={require('../../assets/ProfilePageButton.png')} style={styles.imageBackground} imageStyle={{ resizeMode: "contain" }}>
              <TouchableOpacity style={styles.button} onPress={() => navigateTo('/home/profilePage')} />
            </ImageBackground>
            <ImageBackground source={require('../../assets/NutritionButton.png')} style={styles.imageBackground} imageStyle={{ resizeMode: "contain" }}>
              <TouchableOpacity style={styles.button} onPress={() => navigateTo('/home/nutritionPage')} />
            </ImageBackground>
          </View>
          <View style={styles.buttonRow}>
            <ImageBackground source={require('../../assets/WorkOutButton.png')} style={styles.imageBackground} imageStyle={{ resizeMode: "contain" }}>
              <TouchableOpacity style={styles.button} onPress={() => navigateTo('/home/workoutPage')} />
            </ImageBackground>
            <ImageBackground source={require('../../assets/UpdateFormButton.png')} style={[styles.imageBackground, { opacity: !isPremium ? 0.5 : 1 }]} imageStyle={{ resizeMode: "contain" }}>
              <TouchableOpacity style={styles.button} onPress={() => {if (isPremium) {navigateTo('https://wa.me/972522713568?text=-מהו המשקל הקודם? -משקל נוכחי? -האם היו חריגות אפילו ממש קטנות מהתפריט (אפילו על קוביית שוקולד או פרוסת עוגה לפרט, אני לא כועס פשוט זה חשוב לדעת כדי שאתחשב בהכל)? -האם היו ימים שלא סיימתם את האוכל? -מתי עשיתם ארוחה חופשית פעם אחרונה ומה אכלתם? -האם ביום של הארוחת שישי/ארוחה חופשית הקפדתם להוריד את הארוחה הגדולה? -איך אתם מרגישים מבחינה פיזית ומנטלית? -רמת מוטיבציה מ-1 עד 10 -2 דברים שאתם שמחים שהצלחתם לעשות השבוע -מלל חופשי, כל דבר שאתם מרגישים צורך לשתף -תמונת התקדמות (מקדימה, צד וגב)')}}} disabled={!isPremium} />
            </ImageBackground>
          </View>
          <View style={styles.buttonRow}>
            <ImageBackground source={require('../../assets/PremiumButton2.png')} style={[styles.imageBackground, { opacity: isPremium ? 0.5 : 1 }]} imageStyle={{ resizeMode: "contain" }}>
              <TouchableOpacity style={styles.button} onPress={() => { if (!isPremium) { navigateTo('/home/premiumPage'); } }} disabled={isPremium} />
            </ImageBackground>
            {/* <ImageBackground source={require('../../assets/RecepiesButton.png')} style={[styles.imageBackground, { opacity: 0.5 }]} imageStyle={{ resizeMode: "contain" }}>
              <TouchableOpacity disabled={true} style={styles.button} onPress={() => navigateTo('/home/recepiesPage')} />
            </ImageBackground> */}
          </View>
        </View>

        <BottomBar />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#272727',
    paddingBottom: 50,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#272727',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    alignSelf:'center'
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FFF',
    textAlign:'center'
  },
  circlesContainer: {
    flexDirection: 'row',
    marginVertical: 20,
    alignSelf: 'center',
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1B1B1E',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    borderColor: '#FFFFFF',
    borderWidth: 1,
    margin: 10,
  },
  circleHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  circleText: {
    fontSize: 14,
    color: '#FFF',
  },
  circleTextLeft: {
    fontSize: 12,
    color: '#FFF',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 20,
    alignSelf:'center'
  },
  button: {
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignSelf:'center',
    marginBottom: 20,
    width: '100%',
  },

  imageBackground: {
    width: 160,
    height: 90,
    aspectRatio: 2,
  },

  circle1: {
    borderColor: 'green',
    color: 'green'
  },

  circle2: {
    borderColor: 'red',
    color: 'red'
  },

  circle3: {
    borderColor: 'purple',
  },
  checkIcon: {
    marginTop: 5,
    fontSize: 30,
  },
});
