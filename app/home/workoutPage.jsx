import { View, Text, TextInput, Button, FlatList, StyleSheet, SafeAreaView, ImageBackground, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import BottomBar from "../components/BottomBar";
import { getDatabase, ref, onValue, set, push, get, remove } from "firebase/database";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

export default function WorkOutPage() {

    class Workout {
        constructor(exerciseName, sets, reps, weight) {
            this.exerciseName = exerciseName;
            this.sets = sets;
            this.reps = reps;
            this.weight = weight;
        }
    }

    const [exerciseName, setExerciseName] = useState('');
    const [sets, setSets] = useState('');
    const [reps, setReps] = useState('');
    const [weight, setWeight] = useState('');
    const [chartData, setChartData] = useState([]);
    const [selectedTraining, setSelectedTraining] = useState('A');



    const auth = getAuth();
    const currentUser = auth.currentUser;
    const db = getDatabase();

    const loadWorkouts = async () => {

        const workoutRef = ref(db, `workouts/${currentUser.uid}/${selectedTraining}`);
        const workoutData = await get(workoutRef);

        if (workoutData.exists()) {
            const data = Object.values(workoutData.val());
            setChartData(data);
            console.log("Workouts loaded:", data);
        } else {
            console.log("No workouts found for this user.");
            setChartData([]);
        }
    };

    const addExercise = async () => {
        if (!exerciseName || !sets || !reps || !weight) {
            console.error("All fields must be filled");
            return;
        }

        const newExercise = {
            exerciseName,
            sets: parseInt(sets),
            reps: parseInt(reps),
            weight: parseFloat(weight),
        };

        try {
            const workoutRef = ref(db, `workouts/${currentUser.uid}/${selectedTraining}`);
            const newExerciseRef = push(workoutRef);

            await set(newExerciseRef, newExercise);

            setChartData((prev) => {
                const updatedData = [...prev, newExercise];
                console.log("Updated Chart Data:", updatedData);
                return updatedData;
            });

            setExerciseName('');
            setSets('');
            setReps('');
            setWeight('');
        } catch (error) {
            console.error("Failed to add exercise:", error);
        }
    };

    const deleteExercise = async () => {
        try {
            if (chartData.length === 0) {
                console.log("No exercises to delete.");
                return;
            }
    
            const lastExercise = chartData[chartData.length - 1];
            const workoutRef = ref(db, `workouts/${currentUser.uid}/${selectedTraining}`);
            
    
            const allExercises = await get(workoutRef);
            if (allExercises.exists()) {
                const exercises = allExercises.val();
    
                for (let key in exercises) {
                    if (exercises[key].exerciseName === lastExercise.exerciseName) {
                        const exerciseRef = ref(db, `workouts/${currentUser.uid}/${selectedTraining}/${key}`);
                        await remove(exerciseRef); 
    
                        setChartData(prevData => prevData.slice(0, -1));
    
                        console.log("Exercise deleted successfully.");
                        return;
                    }
                }
            }
    
            console.log("Exercise not found.");
        } catch (error) {
            console.error("Failed to delete exercise:", error);
        }
    };
    
    const deleteAllExercises = async () => {
        try {
            const workoutRef = ref(db, `workouts/${currentUser.uid}/${selectedTraining}`);

            await set(workoutRef, null);

            setChartData([]);
        } catch (error) {
            console.error("Failed to delete all exercises:", error);
        }
    };

    const handleTrainingChange = async (training) => {
        try {
            setSelectedTraining(training);
    
            const workoutRef = ref(db, `workouts/${currentUser.uid}/${training}`);
            const workoutData = await get(workoutRef);
    
            if (workoutData.exists()) {
                const data = Object.values(workoutData.val());
                setChartData(data); 
                console.log(`Loaded workouts for training ${training}:`, data);
            } else {
                console.log(`No workouts found for training ${training}.`);
                setChartData([]);
            }
        } catch (error) {
            console.error(`Failed to load workouts for training ${training}:`, error);
        }
    };
    


    useEffect(() => {
        loadWorkouts();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.container}>

                <Text style={styles.header} >דף אימונים</Text>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        onPress={() => {handleTrainingChange('A');console.log('Training A button pressed');}}
                        style={styles.button}>
                        <ImageBackground source={require('../../assets/A.png')} style={styles.backgroundImage} imageStyle={{ resizeMode: "contain" }}>
                        </ImageBackground>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {handleTrainingChange('B');console.log('Training B button pressed');}}
                        style={styles.button}>
                        <ImageBackground source={require('../../assets/B.png')} style={styles.backgroundImage} imageStyle={{ resizeMode: "contain" }}>
                        </ImageBackground>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {handleTrainingChange('C');console.log('Training C button pressed');}}
                        style={styles.button}>
                        <ImageBackground source={require('../../assets/C.png')} style={styles.backgroundImage} imageStyle={{ resizeMode: "contain" }}>
                        </ImageBackground>
                    </TouchableOpacity>
                </View>


                <View style={styles.inputSection}>
                    <TextInput
                        placeholder="תרגיל :"
                        textAlign='right'
                        color='#FFF'
                        style={styles.input}
                        placeholderTextColor='#000'
                        value={exerciseName}
                        onChangeText={setExerciseName}
                    />
                    <View style={styles.buttonContainer2}>
                        <TextInput
                            placeholder="סטים :"
                            color='#FFF'
                            textAlign='right'
                            style={styles.input}
                            placeholderTextColor='#000'
                            keyboardType="numeric"
                            value={sets}
                            onChangeText={setSets}
                        />
                        <TextInput
                            placeholder="חזרות :"
                            textAlign='right'
                            color='#FFF'
                            style={styles.input}
                            placeholderTextColor='#000'
                            keyboardType="numeric"
                            value={reps}
                            onChangeText={setReps}
                        />
                        <TextInput
                            placeholder="משקל :"
                            textAlign='right'
                            color='#F9332D'
                            style={styles.input}
                            placeholderTextColor='#000'
                            keyboardType="numeric"
                            value={weight}
                            onChangeText={setWeight}
                        />
                    </View>

                </View>

                <TouchableOpacity style={styles.buttonContainer3} onPress={addExercise}>
                        <Text style={styles.buttons}>הוסף תרגיל</Text>
                </TouchableOpacity>
                
                {/* Chart Section */}
                <View style={styles.chartSection}>
                    <FlatList
                        data={chartData}
                        keyExtractor={(item, index) => index.toString()}
                        ListHeaderComponent={
                            <View style={styles.tableHeader}>
                                <Text style={styles.headerCell}>מספר תרגיל</Text>
                                <Text style={styles.headerCell}>תרגיל</Text>
                                <Text style={styles.headerCell}>סטים</Text>
                                <Text style={styles.headerCell}>חזרות</Text>
                                <Text style={styles.headerCell}>משקל עבודה</Text>
                            </View>
                        }
                        renderItem={({ item, index }) => (
                            <View style={styles.tableRow}>
                                <Text style={styles.cell}>{index + 1}</Text>
                                <Text style={styles.cell}>{item.exerciseName || ''}</Text>
                                <Text style={styles.cell}>{item.sets || ''}</Text>
                                <Text style={styles.cell}>{item.reps || ''}</Text>
                                <Text style={styles.cell}>{item.weight || ''}</Text>
                            </View>
                        )}
                    />

                </View>

                <View style={styles.buttonContainer4}>
                <TouchableOpacity style={styles.buttonContainer3} onPress={deleteExercise}>
                        <Text style={styles.buttons}>מחק שורה</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.buttonContainer3} onPress={deleteAllExercises}>
                        <Text style={styles.buttons}>מחק טבלה</Text>
                    </TouchableOpacity>
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
        paddingBottom: 50,
    },

    header: {
        textAlign: 'center',
        marginTop: 20,
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 25,
        marginTop: 25,
    },
    backgroundImage: {
        width: 140,
        height: 60,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        aspectRatio: 2,
    },
    buttonContainer: {
        flexDirection: 'row',
        marginBottom: 40,
        marginTop: 30,
        width: '32%',
        alignItems:'center',
        justifyContent:'space-between'
    },

    buttonContainer2: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems:'center',
        marginBottom: 10,
        marginTop: 10,
        width: '100%',
    },

    buttonContainer4: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        marginTop: 10,
        margin:10,
        width: '75%',
        gap:10,
        alignSelf:'center'
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
    inputSection: {
        marginBottom: 20,
        marginTop: 50,
        width:'90%',
        justifyContent:'center',
        alignSelf:'center'
    },
    input: {
        borderWidth: 1,
        borderColor: '#FFF',
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
        color: '#000',
    },
    buttonContainer3: {
        borderWidth: 1,
        borderColor: '#F9332D',
        backgroundColor: '#F9332D',
        borderRadius: 10,
        padding: 10,
        width: '50%',
        marginBottom: 20,
        color: '#000',
        alignSelf:'center'
      },
      buttons: {
        color: '#FFF',   
        fontSize: 12,           
        fontWeight: 'bold',     
        textAlign: 'center',   
        alignSelf:'center'
      },
});