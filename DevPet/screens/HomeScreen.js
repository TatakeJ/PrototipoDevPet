import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ImageBackground, View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../styles/HomeStyles";
import { BrainCog, ShoppingCart, ClipboardList, Gem, Droplet, BatteryMedium, Heart, Star, Target, } from "lucide-react-native";

// Componentes personalizados (comprobado sin bug por el momento xd)
import PetParticles from "../components/PetParticles";
import Sheet from "../components/Sheet";
import Break from "../components/Break";
import Habits from "../components/Habits";
import { getTodayHabits, getTodayBreaks } from "../lib/supabaseClient";

const { width } = Dimensions.get("window");
// esto memoriza componentes pesados para evitar lag (lo vi en tiktok)
const OptimizedParticles = React.memo(PetParticles);

export default function HomeScreen({ navigation }) {
  const [petArea, setPetArea] = useState({ width: 0, height: 0 });
  const [bounce, setBounce] = useState(false);

  // Estados de visibilidad para los Sheets (lo organicé mejor)
  const [sheets, setSheets] = useState({
    states: false,
    shop: false,
    task: false,
    water: false,
    sleep: false,
    rest: false,
  });

  // Puntos (diamantes)
  const [points, setPoints] = useState(0);

  //  resumen de supa
  const [summary, setSummary] = useState({
    water: 0,
    sleep: 0,
    breaks: 0,
  });

  // Memorizar cálculos de niveles
  const { level, progress } = useMemo(
    () => ({
      level: Math.floor(points / 100) + 1,
      progress: points % 100,
    }),
    [points],
  );

  const toggleSheet = useCallback((name, visible) => {
    setSheets((prev) => ({ ...prev, [name]: visible }));
  }, []);

  const loadSummary = async () => {
    try {
      console.log("Actualizando resumen diario...");
      const habits = await getTodayHabits();
      const breaks = await getTodayBreaks();

      setSummary({
        water: habits?.water || 0,
        sleep: habits?.sleep_hours || 0,
        breaks: Array.isArray(breaks) ? breaks.length : 0,
      });
    } catch (err) {
      console.error("Error al cargar resumen:", err.message);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  useEffect(() => {
    if (points > 0) {
      setBounce(true);
      const timer = setTimeout(() => setBounce(false), 150);
      return () => clearTimeout(timer);
    }
  }, [points]);

  return (
    <ImageBackground
      source={require("../assets/RoomBedBackground.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.body}>
        {/* Header: Estados, Tienda, Tareas y PUNTOS (Mejor organizados, antes parecían un aceertijo)*/}
        <View style={localStyles.topHeader}>
          <View style={localStyles.row}>
            <TouchableOpacity
              style={localStyles.miniBtn}
              onPress={() => toggleSheet("states", true)}
            >
              <BrainCog size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={localStyles.miniBtn}
              onPress={() => toggleSheet("shop", true)}
            >
              <ShoppingCart size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={localStyles.miniBtn}
              onPress={() => toggleSheet("task", true)}
            >
              <ClipboardList size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Contador de diamantes pa' el free */}
          <View style={localStyles.pointsContainer}>
            <Gem size={16} color="#fbbf24" fill="#fbbf24" />
            <Text style={localStyles.pointsText}>{points}</Text>
          </View>
        </View>

        {/* XP */}
        <View style={localStyles.levelSection}>
          <View style={localStyles.levelRow}>
            <Star size={12} color="#fbbf24" fill="#fbbf24" />
            <Text style={localStyles.levelLabel}>LVL {level}</Text>
            <Text style={localStyles.expText}>{progress}/100 XP</Text>
          </View>
          <View style={localStyles.expTrack}>
            <View style={[localStyles.expFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Área Central: mascota y partículas */}
        <View style={styles.main_cont}>

          <View style={localStyles.summaryPill}>
            <Text style={{ color: "white", fontSize: 11, fontWeight: "600" }}>
              💧 {summary.water} | 😴 {summary.sleep}h | 🧘 {summary.breaks}
            </Text>
          </View>

          <View style={localStyles.petBox}>
            <Text
              style={[localStyles.moodEmoji, { fontSize: bounce ? 55 : 45 }]}
            >
              {points >= 20 ? "😸" : points >= 10 ? "🙂" : "😿"}
            </Text>

            <Image
              source={require("../assets/DevPet_neutral.png")}
              style={styles.img_pet}
              onLayout={useCallback(
                (e) =>
                  setPetArea({
                    width: e.nativeEvent.layout.width,
                    height: e.nativeEvent.layout.height,
                  }),
                [],
              )}
            />
          </View>

          <View style={localStyles.missionCard}>
            <Target size={14} color="#3b82f6" />
            <Text style={localStyles.missionText}>
              {points < 50 ? `Meta: ${50 - points} pts` : "¡Completado!"}
            </Text>
          </View>

          {petArea.width > 0 && (
            <OptimizedParticles
              petState={points >= 20 ? "happy" : "neutral"}
              petAreaWidth={petArea.width}
              petAreaHeight={petArea.height}
            />
          )}
        </View>

        {/* Footer: Acciones de hábitos */}
        <View style={styles.actions_cont}>
          <TouchableOpacity
            style={localStyles.actionBtn}
            onPress={() => toggleSheet("water", true)}
          >
            <Droplet size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={localStyles.actionBtn}
            onPress={() => toggleSheet("sleep", true)}
          >
            <BatteryMedium size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={localStyles.actionBtn}
            onPress={() => toggleSheet("rest", true)}
          >
            <Heart size={24} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* --- sección de modales organizada, antes estaba fea --- */}

      <Sheet
        visible={sheets.states}
        onClose={() => toggleSheet("states", false)}
        animation="slideDown"
      >
        <Text style={styles.text_sheet}>Estadísticas y Gráficos</Text>
        <Text style={{ textAlign: "center", marginTop: 10 }}>
          Agua: {summary.water} | Sueño: {summary.sleep}h | Pausas:{" "}
          {summary.breaks}
        </Text>
      </Sheet>

      <Sheet
        visible={sheets.shop}
        onClose={() => toggleSheet("shop", false)}
        animation="slideDown"
      >
        <Text style={styles.text_sheet}>Tienda de Items</Text>
      </Sheet>

      <Sheet
        visible={sheets.task}
        onClose={() => toggleSheet("task", false)}
        animation="slideDown"
      >
        <Text style={styles.text_sheet}>Tareas Diarias</Text>
      </Sheet>

      {/* Registro de Hidratación */}
      <Sheet
        visible={sheets.water}
        onClose={() => toggleSheet("water", false)}
        sheetTop={80}
        animation="slideUp"
      >
        <Habits type="water" addPoints={setPoints} onSaved={loadSummary} />
      </Sheet>

      {/* Registro de Sueño */}
      <Sheet
        visible={sheets.sleep}
        onClose={() => toggleSheet("sleep", false)}
        sheetTop={80}
        animation="slideUp"
      >
        <Habits type="sleep" addPoints={setPoints} onSaved={loadSummary} />
      </Sheet>

      {/* Pausas Activas */}
      <Sheet
        visible={sheets.rest}
        onClose={() => toggleSheet("rest", false)}
        sheetTop={80}
        animation="slideUp"
      >
        <Break addPoints={setPoints} onSaved={loadSummary} />
      </Sheet>
    </ImageBackground>
  );
}

const localStyles = StyleSheet.create({
  topHeader: {
    flexDirection: "row",
    paddingHorizontal: 15,
    justifyContent: "space-between",
    alignItems: "center",
    height: 40,
  },
  row: { flexDirection: "row", gap: 8 },
  miniBtn: { backgroundColor: "rgba(0,0,0,0.3)", padding: 6, borderRadius: 10 },
  pointsContainer: {
    backgroundColor: "rgba(0,0,0,0.5)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
    gap: 4,
  },
  pointsText: { color: "white", fontWeight: "bold", fontSize: 14 },
  levelSection: { paddingHorizontal: 25, marginTop: 5 },
  levelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 4,
  },
  levelLabel: { color: "white", fontWeight: "bold", fontSize: 11 },
  expText: { color: "rgba(255,255,255,0.6)", fontSize: 9, marginLeft: "auto" },
  expTrack: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  expFill: { height: "100%", backgroundColor: "#fbbf24" },
  summaryPill: {
    position: "absolute",
    top: -30,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  petBox: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  moodEmoji: { position: "absolute", top: -40, zIndex: 10 },
  missionCard: {
    backgroundColor: "rgba(255,255,255,0.9)",
    flexDirection: "row",
    padding: 8,
    borderRadius: 12,
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  missionText: { fontSize: 11, fontWeight: "bold", color: "#1e293b" },
  actionBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 12,
    borderRadius: 40,
  },
});
