import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, I18nManager, SafeAreaView } from 'react-native'; // Import SafeAreaView here
import BottomBar from '../components/BottomBar';
import { Link , useRouter } from 'expo-router';
import { getDatabase, ref, onValue, set, push ,get} from "firebase/database";
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'; 

export default function entryFormPage() {

    const router = useRouter();
    const auth = getAuth();
    const db = getDatabase();
    const currentUser =  auth.currentUser; 

    const [age, setAge] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [fat, setFat] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [daily_fat, setDailyFat] = useState('');
    const [daily_protein, setDailyProtein] = useState('');
    const [daily_carbs, setDailyCarbs] = useState('');

    const FinishEntryForm = async () => {
        console.log("Finished entry form");
    
        if (currentUser == null) {
            console.error("No user is signed in or provided.");
            return;
        }
        
        const userRef = ref(db, `users/${currentUser.uid}/firstTimeLogIn`);
        await saveUserInfo();
    
        try {
            await set(userRef, true);
            console.log('First-time login value updated successfully.');
            router.replace('/home'); 
        } catch (error) {
            console.error('Error updating firstTimeLogIn value:', error.message);
        }
    };
    

    const saveUserInfo = async () => {
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
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.container}>
            <Text style={styles.header}>דף מילוי פרטים</Text>

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

            <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={FinishEntryForm}>
                <Text style={styles.buttonText}>סיום</Text>
            </TouchableOpacity>

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#272727',
    },

    header: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#FFF',
        marginTop: 20,
        textAlign: 'center',
    },
    inputGroup: {
        width: '100%',
        marginBottom: 8,
    },
    label: {
        fontSize: 15,
        marginRight: 10,
        color: '#FFF',
        marginBottom: 5,
        textAlign: 'right',
    },
    input: {
        width: '75%',
        height: 30,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 5,
        paddingHorizontal: 10,
        textAlign: 'right',
        alignSelf: 'flex-end',  
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 10,
        marginTop:10,
        paddingBottom:10,
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
