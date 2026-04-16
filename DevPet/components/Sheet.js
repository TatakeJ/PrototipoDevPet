import React, { useEffect, useRef, useState } from 'react';
import {
    Modal,
    View,
    Animated,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { X } from "lucide-react-native";

const { height: screenHeight } = Dimensions.get('window');

const ANIMATIONS = {
    slideDown: {
        initial: -screenHeight,
        exit: screenHeight,
    },
    slideUp: {
        initial: screenHeight,
        exit: screenHeight,
    },
    slideLeft: {
        initial: -screenHeight,
        exit: -screenHeight,
    },
}

export default function Sheet({ 
    visible, 
    onClose, 
    children, 
    sheetTop= 10, 
    animation = "slideDown" 
}) {
    const translateY = useRef(new Animated.Value(ANIMATIONS[animation].initial)).current;
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => { //Cambio N°1 NSX011
    const config = ANIMATIONS[animation] || ANIMATIONS.slideUp; 

    if (visible) {
        setModalVisible(true);

        translateY.setValue(config.initial);

        Animated.spring(translateY, {
            toValue: 0,
            bounciness: 4,
            useNativeDriver: true, // cambio NSX0101 arreglé useEffect
        }).start();
    } else {
        Animated.timing(translateY, {
            toValue: config.exit,
            duration: 250,
            useNativeDriver: true,
        }).start(() => {
            setModalVisible(false);
        });
    }
}, [visible, animation]);

    return (
        <Modal
            visible={modalVisible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose} // Posible cambio NSX0102 null antes
            />
            <Animated.View
                style={[
                    styles.sheet, 
                    { 
                        top: sheetTop,
                        transform: [{ translateY }] 
                    }]}
            >
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                    <X size={20} color="#fff" strokeWidth={2}></X>
                </TouchableOpacity>
                {children}
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    sheet: {
        position: 'absolute',
        left: 10,
        right: 10,
        backgroundColor: '#0F172A',
        borderRadius: 24,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "#1E3E62",
        paddingHorizontal: 20,
        paddingBottom: 32,
        paddingTop: 48,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10,
    },
    closeBtn: {
        position: 'absolute',
        top: 12,
        right: 16,
        padding: 6,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        zIndex: 10,
    }
});