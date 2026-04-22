import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ImageBackground,
  View,
  Text,
  TouchableOpacity,
  Linking,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../styles/HomeStyles";

// Componentes personalizados (No hay presencia de bug)
import { BrainCog, ShoppingCart, ClipboardList, Gem, Droplet, BatteryMedium, Heart, Star, Target, } from "lucide-react-native";
import { Modal, Alert } from "react-native";
import HabitChart from "../components/charts/HabitChart";

// Componentes personalizados (comprobado sin bug por el momento xd)
import PetParticles from "../components/PetParticles";
import Sheet from "../components/Sheet";
import Break from "../components/Break";
import Habits from "../components/Habits";
import Water from "../components/Water";
import Sleep from "../components/Sleep";
import MLView from "../components/MLView";
import MLCamera from "../components/MLCamera";
import {
  supabase,
  saveBreak,
  getTodayHabits,
  getTodayBreaks,
} from "../lib/supabaseClient";

const { width } = Dimensions.get("window");
// esto memoriza componentes pesados para evitar lag (lo vi en tiktok)
const OptimizedParticles = React.memo(PetParticles);

export default function HomeScreen({ navigation }) {
  const [petArea, setPetArea] = useState({ width: 0, height: 0 });
  const [bounce, setBounce] = useState(false);
  const [waterVisible, setWaterVisible] = useState(false);
  const [sleepVisible, setSleepVisible] = useState(false);
  const [breakVisible, setBreakVisible] = useState(false);
  const [mlVisible, setMLVisible] = useState(false);

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

  const addPoints = (fn) => {
    setPoints(fn);
  };

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

  const onSaved = () => {
    loadSummary();
    loadBreaks();
  };

  // ML botón de validación
  const handleMLSuccess = async () => {
    try {
      await saveBreak({
        user_id: "demo-user",
        completed_at: new Date().toISOString(),
      });

      addPoints((prev) => prev + 5);

      Alert.alert("¡Buen trabajo!", "Estiramiento validado");

      setMLVisible(false);
    } catch (err) {
      console.log(err);
    }
  };

  const toggleSheet = useCallback((name, visible) => {
    setSheets((prev) => ({ ...prev, [name]: visible }));
  }, []);

  const loadSummary = async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("habits")
      .select("water, sleep_hours")
      .eq("user_id", "demo-user")
      .eq("date", today);

    if (error) {
      console.log("Error en summary:", error);
      return;
    }

    if (!data || data.length === 0) {
      setSummary((prev) => ({ ...prev, water: 0, sleep: 0 }));
      return;
    }

    const totals = data.reduce(
      (acc, item) => ({
        water: acc.water + (item.water > 0 ? item.water : 0),
        sleep: acc.sleep + (item.sleep_hours > 0 ? item.sleep_hours : 0),
      }),
      { water: 0, sleep: 0 },
    );

    setSummary((prev) => ({
      ...prev,
      water: totals.water,
      sleep: totals.sleep,
    }));
  };
  const loadBreaks = async () => {
    const today = new Date().toISOString().split("T")[0];

    const { count, error } = await supabase
      .from("breaks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", "demo-user")
      .eq("date", today)
      .gte("completed_at", `${today}T00:00:00`)
      .lte("completed_at", `${today}T23:59:59`);

    if (error) {
      console.log("Error cargando breaks:", error);
      return;
    }

    setSummary((prev) => ({
      ...prev,
      breaks: count || 0, // Aquí actualizamos el estado summary con el conteo real
    }));
  };

  const handleBreakFinished = () => {
    setBreakVisible(false);
    setMLVisible(true);
  };

  useEffect(() => {
    loadSummary();
    loadBreaks();
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
            <TouchableOpacity onPress={() => setMLVisible(true)}>
              <Text>🧠 IA</Text>
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
              💧Agua: {summary.water} | 😴 Sueño: {summary.sleep}h | 🧘 Breaks:{" "}
              {summary.breaks}
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
            onPress={() => setWaterVisible(true)} // Cambiado aquí
          >
            <Droplet size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={localStyles.actionBtn}
            onPress={() => setSleepVisible(true)} // Cambiado aquí
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

      {/* --- sección de modales organizada--- */}

      <Sheet
        visible={sheets.states}
        onClose={() => toggleSheet("states", false)}
        animation="slideDown"
      >
        <HabitChart />
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
        visible={waterVisible}
        onClose={() => setWaterVisible(false)}
        sheetTop={80}
        animation="slideUp"
      >
        <Water
          addPoints={setPoints}
          onSaved={() => {
            loadSummary();
            setWaterVisible(false);
          }}
        />
      </Sheet>

      {/* Registro de Sueño */}
      <Sheet
        visible={sleepVisible}
        onClose={() => setSleepVisible(false)}
        sheetTop={80}
        animation="slideUp"
      >
        <Sleep
          addPoints={setPoints}
          onSaved={() => {
            loadSummary();
            setSleepVisible(false);
          }}
        />
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

      {/* MODAL 1: Pomodoro */}
      <Modal visible={sheets.rest} animationType="slide" transparent={true}>
        <View style={{ flex: 1 }}>
          <Break
            addPoints={setPoints}
            onFinish={() => {
              toggleSheet("rest", false);
                setMLVisible(true);
            }}
          />
          <TouchableOpacity
            onPress={() => toggleSheet("rest", false)}
            style={styles.closeBtnMinimal}
          >
            <Text style={{ color: "#64748B" }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* MODAL 2: ML */}
      <Modal visible={mlVisible} animationType="fade">
        <View style={{ flex: 1, backgroundColor: "black" }}>
          {/* eliminé texto plano que causaba el error */}
          <MLCamera
            onDetected={async () => {
              try {
                await saveBreak({
                  user_id: "demo-user",
                  completed_at: new Date().toISOString(),
                });

                addPoints((prev) => prev + 5);

                Alert.alert(
                  "¡Validado!",
                  "Estiramiento completado, puntos sumados",
                );

                setMLVisible(false);
                loadBreaks();
              } catch (err) {
                console.log("Error al validar:", err);
              }
            }}
          />

          <TouchableOpacity
            onPress={() => setMLVisible(false)}
            style={{ padding: 15, backgroundColor: "#111" }}
          >
            <Text style={{ color: "white", textAlign: "center" }}>
              Cerrar Cámara
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
  closeBtnMinimal: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#F1F5F9",
  },
  floatingCloseBtn: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "white",
  },
});
