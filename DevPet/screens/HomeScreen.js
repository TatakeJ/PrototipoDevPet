import { ImageBackground, View, Text, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from "../styles/HomeStyles";
import { BrainCog, ShoppingCart, ClipboardList, Gem, Droplet, BatteryMedium, Heart } from 'lucide-react-native';
import PetParticles from "../components/PetParticles";
import Sheet from "../components/Sheet";
import { useState } from "react";

export default function HomeScreen({ navigation }) {
    const [petState] = useState("happy");
    const [petArea, setPetArea] = useState({ width: 0, height: 0 });
    const [statesVisible, setSheetVisible] = useState(false);
    const [shopVisible, setShopVisible] = useState(false);
    const [taskVisible, setTaskVisible] = useState(false);
    // Sheets registro de habitos
    const [waterSheetVisible, setWaterSheetVisible] = useState(false);
    const [sleepSheetVisible, setSleepSheetVisible] = useState(false);
    const [restSheetVisible, setRestSheetVisible] = useState(false);

    return (
        <ImageBackground
            source={require('../assets/RoomBedBackground.png')}
            style={styles.background}
            resizeMode="cover"
        >
            <SafeAreaView style={styles.body}>
                <View style={styles.sections_cont}>
                    <View style={styles.states_cont}>
                        <TouchableOpacity 
                            style={styles.btn_cont}
                            onPress={() => setSheetVisible(true)}
                        >
                            <BrainCog size={27} strokeWidth={1} style={styles.general_button} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.btn_cont}
                            onPress={() => setShopVisible(true)}
                        >
                            <ShoppingCart size={27} strokeWidth={1} style={styles.general_button} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.btn_cont}
                            onPress={() => setTaskVisible(true)}
                        >
                            <ClipboardList size={27} strokeWidth={1} style={styles.general_button} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.points_btn}>
                        <Gem size={22} strokeWidth={1} color="#fff" />
                        <Text style={styles.points_text}>0</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.main_cont}>
                    <Image 
                        source={require("../assets/DevPet_neutral.png")} 
                        style={styles.img_pet} 
                        onLayout={e => {
                            const { width, height } = e.nativeEvent.layout;
                            setPetArea({ width, height});
                    }}/>
                    {petArea.width > 0 && (
                            <PetParticles
                                petState={petState}
                                petAreaWidth={petArea.width}
                                petAreaHeight={petArea.height}/>
                    )}
                </View>
                <View style={styles.actions_cont}>
                    <TouchableOpacity ç
                        style={styles.btn_cont}
                        onPress={() => setWaterSheetVisible(true)}
                    >
                        <Droplet size={27} strokeWidth={1} style={styles.general_button} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btn_cont}>
                        <BatteryMedium size={27} strokeWidth={1} style={styles.general_button} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btn_cont}>
                        <Heart size={27} strokeWidth={1} style={styles.general_button} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
            <Sheet
                visible={statesVisible}
                onClose={() => setSheetVisible(false)}
                animation="slideDown"
            >
                <Text>Aqui se pone los respectivos graficos</Text>
            </Sheet>
            <Sheet
                visible={shopVisible}
                onClose={() => setShopVisible(false)}
                animation="slideDown"
            >
                <Text>Aqui se pone la tienda</Text>
            </Sheet>
            <Sheet
                visible={taskVisible}
                onClose={() => setTaskVisible(false)}
                animation="slideDown"
            >
                <Text>Aqui se ponen las respectivas tareas</Text>
            </Sheet>
            <Sheet
                visible={waterSheetVisible}
                onClose={() => setWaterSheetVisible(false)}
                sheetTop={80}
                animation="slideUp"
            >
                <Text>Aqui se registra la hidratación</Text>
            </Sheet>
        </ImageBackground>
    );
}