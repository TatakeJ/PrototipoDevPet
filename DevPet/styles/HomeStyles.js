import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get("window")

export const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    body: {
        flex: 1,
        justifyContent: "space-between",
        padding: 5,
    },
    sections_cont: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 8,
        paddingHorizontal: 5,
    },
    states_cont: {
        flexDirection: "row",
        gap: 8,
    },
    points_btn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FF6500",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 9,
        gap: 6,
    },
    points_text: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14,
    },
    actions_cont: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        paddingVertical: height * 0.018,
    },
    btn_cont: {
        borderRadius: 100,
        backgroundColor: "#FF6500",
        padding: 9,
        width: width * 0.12,
        height: width * 0.12,
        justifyContent: "center",
        alignItems: "center",
    },
    general_button: {
        color: "#fff",
    },
    text_sheet: {
        color: "#FFF"
    }
});