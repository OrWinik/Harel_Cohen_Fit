import { View, StyleSheet, SafeAreaView, Text, TextInput, I18nManager, ImageBackground, Button } from "react-native";
import BottomBar from "../components/BottomBar";
import React, { useState } from 'react';
import { Router, useRouter } from "expo-router";
import { getDatabase, ref, set } from "firebase/database";
import { getAuth } from 'firebase/auth';


export default function PremiumPage() {
    const router = useRouter();
    const navigateTo = (path) => router.push(path);

    const [premiumTextValue, SetPremium] = useState('');

    const AddPremium = async () => {
        if (premiumTextValue == "HC92000") {

            console.log("Added Premiun");
            const auth = getAuth();
            const db = getDatabase();
            const currentUser = auth.currentUser;

            if (currentUser) 
            {
                try
                {
                    const userRef = ref(db, `users/${currentUser.uid}/is_Premium`);
                    await set(userRef, true)
                }
                catch(error)
                {
                    console.log(error);
                }
            }
            router.push(('/home/'));
        }
    };


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.container}>

                <ImageBackground source={require('../../assets/dimond.png')} style={styles.backgroundImage} imageStyle={{ resizeMode: "contain" }} />


                <Text style={styles.header}>הוסף פרימיום לחשבון</Text>

                <TextInput
                    placeholder="הכנס קוד :"
                    style={styles.input}
                    placeholderTextColor='#FFF'
                    value={premiumTextValue}
                    onChange={(e) => SetPremium(e.nativeEvent.text)}
                />

                <Button title="הוסף" onPress={AddPremium}></Button>

                <BottomBar />
            </View>
        </SafeAreaView>)
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#272727',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 50,
    },

    header: {
        marginTop: 20,
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 25,
        marginTop: 25,
    },

    input: {
        borderWidth: 1,
        borderColor: '#FFF',
        borderRadius: 5,
        padding: 10,
        marginBottom: 30,
        marginTop: 30,
        width: '200',
        color: '#FFF',
        textAlign: 'right',
    },

    backgroundImage: {
        width: 140,
        height: 60,
        justifyContent: "center",
        alignItems: "center",
    },
});