import { View, Text, TextInput, Button, FlatList, StyleSheet, SafeAreaView ,TouchableOpacity} from 'react-native';
import React, { useState, useEffect } from 'react';
import BottomBar from "../components/BottomBar";
import { getDatabase, ref, onValue, set, push, get, remove } from "firebase/database";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

export default function NutritionPage() {

    const [description, setDescription] = useState('');
    const [carbs, setCarbs] = useState('');
    const [protein, setProtein] = useState('');
    const [fat, setFat] = useState('');
    const [meals, setMeals] = useState([]);
    const [message, setMessage] = useState('');

    const auth = getAuth();
    const db = getDatabase();
    const currentUser = auth.currentUser;

    const loadNutrition = async () => {
        const nutritionRef = ref(db, `nutrition/${currentUser.uid}/meals`);
        const nutritionData = await get(nutritionRef);

        if (nutritionData.exists()) {
            const data = Object.values(nutritionData.val());
            setMeals(data);
        }
    }

    const addMeal = async () => {

        if (!description || !carbs || !protein || !fat) {
            console.error("All fields must be filled");
            setMessage(`כל התאים חייבים להיות מלאים`);
            return;
        }

        try {
            const calories = (parseFloat(carbs) + parseFloat(protein)) * 4 + parseFloat(fat) * 9;

            const newMeal = { description, carbs, protein, fat, calories };


            setMeals((prevMeals) => {
                const updatedMeals = [...prevMeals, newMeal];

                const mealRef = ref(db, `nutrition/${currentUser.uid}/meals`);
                const newMealRef = push(mealRef);
                set(newMealRef, newMeal);

                return updatedMeals;
            });

            const fatdayRef = ref(db, `users/${currentUser.uid}/user_daily_fat`);
            const proteindayRef = ref(db, `users/${currentUser.uid}/user_daily_protein`);
            const carbsdayRef = ref(db, `users/${currentUser.uid}/user_daily_carbs`);

            const fatValue = parseFloat((await get(fatdayRef)).val() || 0);
            const proteinValue = parseFloat((await get(proteindayRef)).val() || 0);
            const carbsValue = parseFloat((await get(carbsdayRef)).val() || 0);

            await set(fatdayRef, fatValue - parseFloat(fat));
            await set(proteindayRef, proteinValue - parseFloat(protein));
            await set(carbsdayRef, carbsValue - parseFloat(carbs));

            console.log('Meals after addMeal:', meals);

            //reset fields
            setDescription('');
            setCarbs('');
            setProtein('');
            setFat('');
        }
        catch (error) {
            console.log("Error : ", error);
        }
    };

    const DeleteMeal = async () => {
        try {
            if (meals.length === 0) {
                console.log("No meals to delete.");
                return;
            }

            const lastMeal = meals[meals.length - 1];

            const fatdayRef = ref(db, `users/${currentUser.uid}/user_daily_fat`);
            const proteindayRef = ref(db, `users/${currentUser.uid}/user_daily_protein`);
            const carbsdayRef = ref(db, `users/${currentUser.uid}/user_daily_carbs`);

            const fatValue = parseFloat((await get(fatdayRef)).val() || 0);
            const proteinValue = parseFloat((await get(proteindayRef)).val() || 0);
            const carbsValue = parseFloat((await get(carbsdayRef)).val() || 0);

            console.log("Current values in Firebase:", { fatValue, proteinValue, carbsValue });

            const fat = parseFloat(lastMeal.fat) || 0;
            const protein = parseFloat(lastMeal.protein) || 0;
            const carbs = parseFloat(lastMeal.carbs) || 0;

            await set(fatdayRef, fatValue + fat);
            await set(proteindayRef, proteinValue + protein);
            await set(carbsdayRef, carbsValue + carbs);


            const mealRef = ref(db, `nutrition/${currentUser.uid}/meals`);
            const allMeals = await get(mealRef);
            if (allMeals.exists()) {
                const Meals = allMeals.val();

                for (let key in Meals) {
                    if (Meals[key].description === lastMeal.description) {

                        const specificMealRef = ref(db, `nutrition/${currentUser.uid}/meals/${key}`);
                        await remove(specificMealRef);

                        setMeals(prevData => prevData.slice(0, -1));
                        console.log("Meal deleted successfully.");
                        return;
                    }
                }
            }


        } catch (error) {
            console.error("Failed to delete exercise:", error);
        }
    }

    const DeleteAllMeals = async () => {
        try {

            const fatdayRef = ref(db, `users/${currentUser.uid}/user_daily_fat`);
            const proteindayRef = ref(db, `users/${currentUser.uid}/user_daily_protein`);
            const carbsdayRef = ref(db, `users/${currentUser.uid}/user_daily_carbs`);

            const fatRef = ref(db, `users/${currentUser.uid}/user_fat`);
            const proteinRef = ref(db, `users/${currentUser.uid}/user_protein`);
            const carbsRef = ref(db, `users/${currentUser.uid}/user_carbs`);

            const fatValue = parseFloat((await get(fatRef)).val() || 0);
            const proteinValue = parseFloat((await get(proteinRef)).val() || 0);
            const carbsValue = parseFloat((await get(carbsRef)).val() || 0);

            await set(fatdayRef, fatValue);
            await set(proteindayRef, proteinValue);
            await set(carbsdayRef, carbsValue);


            const nutritionRef = ref(db, `nutrition/${currentUser.uid}/meals`);
            await set(nutritionRef, null);
            setMeals([]);

        } catch (error) {
            console.error("Failed to delete all exercises:", error);
        }
    }

    useEffect(() => {
        loadNutrition();
    }, []);


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.container}>

                <Text style={styles.header} >דף תזונה</Text>

                <View style={styles.inputSection}>
                    <TextInput
                        placeholder="תיאור ארוחה :"
                        style={styles.input}
                        placeholderTextColor='#000'
                        textAlign='right'
                        value={description}
                        onChangeText={setDescription}
                    />
                    <TextInput
                        placeholder="פחמימה :"
                        style={styles.input}
                        placeholderTextColor='#000'
                        textAlign='right'
                        keyboardType="numeric"
                        value={carbs}
                        onChangeText={setCarbs}
                    />
                    <TextInput
                        placeholder="חלבון :"
                        style={styles.input}
                        placeholderTextColor='#000'
                        textAlign='right'
                        keyboardType="numeric"
                        value={protein}
                        onChangeText={setProtein}
                    />
                    <TextInput
                        placeholder="שומן :"
                        style={styles.input}
                        placeholderTextColor='#000'
                        textAlign='right'
                        keyboardType="numeric"
                        value={fat}
                        onChangeText={setFat}
                    />
                    {message ? <Text style={styles.messageText}>{message}</Text> : null}

                    <TouchableOpacity style={styles.buttonContainer} onPress={addMeal}>
                        <Text style={styles.buttons}>הוסף ארוחה</Text>
                    </TouchableOpacity>
                </View>

                {/* Chart Section */}
                <View style={styles.chartSection}>
                    <FlatList
                        data={meals}
                        keyExtractor={(item, index) => index.toString()}
                        ListHeaderComponent={
                            <View style={styles.tableHeader}>
                                <Text style={styles.headerCell}>מספר ארוחה</Text>
                                <Text style={styles.headerCell}>תיאור</Text>
                                <Text style={styles.headerCell}>פחמימה</Text>
                                <Text style={styles.headerCell}>חלבון</Text>
                                <Text style={styles.headerCell}>שומן</Text>
                            </View>
                        }
                        renderItem={({ item, index }) => (
                            <View style={styles.tableRow}>
                                <Text style={styles.cell}>{index + 1}</Text>
                                <Text style={styles.cell}>{item.description || ''}</Text>
                                <Text style={styles.cell}>{item.carbs || ''}</Text>
                                <Text style={styles.cell}>{item.protein || ''}</Text>
                                <Text style={styles.cell}>{item.fat || ''}</Text>
                            </View>
                        )}
                        
                    />
                    <View style={styles.buttonsView}>
                    <TouchableOpacity style={styles.buttonContainer} onPress={DeleteAllMeals}>
                        <Text style={styles.buttons}>מחק טבלה</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonContainer} onPress={DeleteMeal}>
                        <Text style={styles.buttons}>מחק שורה</Text>
                    </TouchableOpacity>
                    </View>

                </View>
                <BottomBar />
            </View>
        </SafeAreaView>)
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#272727',
        justifyContent: 'center',
    },
    header: {
        marginTop: 20,
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 25,
        marginTop: 25,
        textAlign:'center'
    },

    inputSection: {
        marginBottom: 20,
        marginTop: 30,
        width:'75%',
        justifyContent:'center',
        alignSelf:'center'
    },
    input: {
        borderWidth: 1,
        borderColor: '#FFF',
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 8,
        width: '100%',
        marginBottom: 10,
        color: '#000',
    },
    chartSection: {
        flex: 1,
        width: '100%',
        marginTop: 0,
        marginBottom: 90,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#FFF',
    },
    headerCell: {
        flex: 1,
        textAlign: 'center',
        fontSize: 10,
        fontWeight: 'bold',
        color: '#FFF',
        paddingVertical: 10,
    },
    tableRow: {
        flexDirection: 'row',
        borderColor: '#FFF',
        backgroundColor: '#1B1B1E',
    },
    cell: {
        flex: 1,
        textAlign: 'center',
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#FFF',
        color: '#FFF',
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    messageText: {
        color: '#FF0000',
        marginBottom: 10,
        textAlign: 'center',
    },
    buttonContainer: {
        borderWidth: 1,
        borderColor: '#F9332D',
        backgroundColor: '#F9332D',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
        color: '#000',
      },
      buttons: {
        color: '#FFF',   
        fontSize: 12,           
        fontWeight: 'bold',     
        textAlign: 'center',   
        alignSelf:'center'
      },
      buttonsView:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        marginTop: 10,
        width: '50%',
        alignSelf:'center'
      }
});