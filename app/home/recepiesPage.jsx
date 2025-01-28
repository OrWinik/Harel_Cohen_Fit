import { View ,StyleSheet,SafeAreaView , Text} from "react-native";
import BottomBar from "../components/BottomBar";


export default function RecepiesPage() {
    return(    
    <SafeAreaView style={styles.container}>
        <View style={styles.container}>
            <Text>Welcome to the Recepies page !!!</Text>
            <BottomBar/>
        </View>
    </SafeAreaView>)
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#272727',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom : 50,
      },
});