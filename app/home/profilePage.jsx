import React, { useState , useEffect } from 'react';
import { Link , useRouter } from 'expo-router';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, I18nManager, SafeAreaView ,Image,ActivityIndicator} from 'react-native'; 
import BottomBar from '../components/BottomBar';
import { getAuth, createUserWithEmailAndPassword, updateProfile, deleteUser } from 'firebase/auth';
import { getDatabase, ref, onValue, set, push ,get, remove} from "firebase/database";

export default function ProfilePage() {
    const router = useRouter();
    const auth = getAuth();
    const db = getDatabase();
    const currentUser =  auth.currentUser; 

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [age, setAge] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [fat, setFat] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');

    const [isLoading , SetLoading] = useState(true);

    const loadUserInfo = async () => {
        const userRef = ref(db, `users/${currentUser.uid}`);
        
        try {
            setEmail(auth.currentUser.email);

            const usernameRef = ref(db, `users/${currentUser.uid}/user_name`);
            const ageRef = ref(db, `users/${currentUser.uid}/user_age`);
            const heightRef = ref(db, `users/${currentUser.uid}/user_height`);
            const weightRef = ref(db, `users/${currentUser.uid}/user_weight`);
            const fatRef = ref(db, `users/${currentUser.uid}/user_fat`);
            const proteinRef = ref(db, `users/${currentUser.uid}/user_protein`);
            const carbsRef = ref(db, `users/${currentUser.uid}/user_carbs`);

            const username_TF = await get(usernameRef);
            if (username_TF.exists()) setUsername(username_TF.val());

            const age_TF = await get(ageRef);
            if (age_TF.exists()) setAge(age_TF.val());

            const height_TF = await get(heightRef);
            if (height_TF.exists()) setHeight(height_TF.val());

            const weight_TF = await get(weightRef);
            if (weight_TF.exists()) setWeight(weight_TF.val());

            const fat_TF = await get(fatRef);
            if (fat_TF.exists()) setFat(fat_TF.val());

            const protein_TF = await get(proteinRef);
            if (protein_TF.exists()) setProtein(protein_TF.val());

            const carbs_TF = await get(carbsRef);
            if (carbs_TF.exists()) setCarbs(carbs_TF.val());

            SetLoading(false);

        } 
        catch (error) 
        {
            console.error("Error loading user info:", error.message);
        }
    };

    const handleUpdateProfile = async () => {    
        if (currentUser) {
            try {

                if (email !== currentUser.email) {
                    await updateEmail(currentUser, email);
                    console.log('Email updated to:', email);
                }

                const saveAge = ref(db, `users/${currentUser.uid}/user_age`);
                const saveHeight = ref(db, `users/${currentUser.uid}/user_height`);
                const saveWeight = ref(db, `users/${currentUser.uid}/user_weight`);
                const saveFat = ref(db, `users/${currentUser.uid}/user_fat`);
                const saveProtein = ref(db, `users/${currentUser.uid}/user_protein`);
                const saveCarbs = ref(db, `users/${currentUser.uid}/user_carbs`);
                const saveDailyFat = ref(db, `users/${currentUser.uid}/user_daily_fat`);
                const saveDailyProtein = ref(db, `users/${currentUser.uid}/user_daily_protein`);
                const saveDailyCarbs = ref(db, `users/${currentUser.uid}/user_daily_carbs`);

                try
                {
                    await set(saveAge, age);
                    await set(saveHeight, height);
                    await set(saveWeight, weight);
                    await set(saveFat, fat);
                    await set(saveProtein, protein);
                    await set(saveCarbs, carbs);
                    await set(saveDailyFat, fat);
                    await set(saveDailyProtein, protein);
                    await set(saveDailyCarbs, carbs);
        
                    console.log("Saved users info")
        
                }
                catch(error)
                {
                    console.log("Error : " , error.message);
                }    

            } catch (error) {
                console.error("Error updating profile:", error);
            }
        } else {
            console.log("No user is currently authenticated.");
        }
    };

    const deleteUserAccount = async () => {
        if (currentUser) {
            try {
                await deleteUser(currentUser);
                router.replace('/auth/sign-in'); 

            } catch (error) {
                console.error("Error updating profile:", error);
            }
        } else {
            console.log("No user is currently authenticated.");
        }
    };

    useEffect(() => {
        I18nManager.forceRTL(true);
        loadUserInfo();
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
            <Text style={styles.header}>פרופיל</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>אימייל:</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    backgroundColor='#FFF'
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>שם משתמש:</Text>
                <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    backgroundColor='#FFF'
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>גיל:</Text>
                <TextInput
                    style={styles.input}
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                    backgroundColor='#FFF'
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>גובה:</Text>
                <TextInput
                    style={styles.input}
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="numeric"
                    backgroundColor='#FFF'
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>משקל:</Text>
                <TextInput
                    style={styles.input}
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="numeric"
                    backgroundColor='#FFF'
                />
            </View>

            {/* Macros inputs */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>שומן:</Text>
                <TextInput
                    style={styles.input}
                    value={fat}
                    onChangeText={setFat}
                    keyboardType="numeric"
                    backgroundColor='#FFF'
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>חלבון:</Text>
                <TextInput
                    style={styles.input}
                    value={protein}
                    onChangeText={setProtein}
                    keyboardType="numeric"
                    backgroundColor='#FFF'
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>פחמימות:</Text>
                <TextInput
                    style={styles.input}
                    value={carbs}
                    onChangeText={setCarbs}
                    keyboardType="numeric"
                    backgroundColor='#FFF'
                />
            </View>

            <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleUpdateProfile}>
                <Text style={styles.buttonText}>עדכן פרטים</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={deleteUserAccount}>
                <Text style={styles.buttonText}>מחק חשבון</Text>
            </TouchableOpacity>

            <BottomBar />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#272727',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#272727',
        justifyContent: 'center',
        alignItems: 'center',
      },
    header: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#FFF',
        marginTop: 20,
        marginBottom: 20,
        textAlign: 'center',
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 20,
      },
    inputGroup: {
        width: '100%',
        marginBottom: 10,
        alignItems : 'center',
    },
    label: {
        fontSize: 15,
        marginRight: 10,
        color: '#FFF',
        marginBottom: 5,
        textAlign: 'center',
    },
    input: {
        width: '75%',
        height: 30,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 5,
        paddingHorizontal: 10,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#007AFF',
        marginTop:12,
        padding:7,
        borderRadius: 15,
        alignItems: 'center',
        marginBottom: 10,
        width: '50%',
        alignSelf: 'center',  
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
    },
    deleteButtonView: {
        paddingBottom:10,
    },
    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
});
