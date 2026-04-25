import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  ImageBackground,
  View,
  Text,
  TouchableOpacity,
  Linking,
  Image,
  Animated,
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
import {
  BrainCog,
  ShoppingCart,
  ClipboardList,
  Gem,
  Droplet,
  BatteryMedium,
  Heart,
  Star,
  Target,
} from "lucide-react-native";
import { Modal, Alert, fadeAnim } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

// Componentes personalizados
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

const getRecommendation = (summary) => {
  if (summary.sleep < 5) {
    return {
      text: "Oye... necesitas descansar 😴",
      mood: "sleep",
    };
  }

  if (summary.water < 3) {
    return {
      text: "Tu cuerpo pide agua 💧",
      mood: "water",
    };
  }

  if (summary.breaks < 1) {
    return {
      text: "Llevas mucho tiempo quieto 🧘",
      mood: "break",
    };
  }

  return {
    text: "Todo en orden, sigue así 🚀",
    mood: "happy",
  };
};

export default function HomeScreen({ navigation }) {
  const [petArea, setPetArea] = useState({ width: 0, height: 0 });
  const [bounce, setBounce] = useState(false);
  const [waterVisible, setWaterVisible] = useState(false);
  const [sleepVisible, setSleepVisible] = useState(false);
  const [breakVisible, setBreakVisible] = useState(false);
  const [mlVisible, setMLVisible] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleOpen, setBubbleOpen] = useState(false);

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

  const recommendation = useMemo(() => getRecommendation(summary), [summary]);

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
      /* .eq("date", today) */ /* Me daba conflicto con el rango de time */
      .gte("completed_at", `${today}T00:00:00.000Z`)
      .lte("completed_at", `${today}T23:59:59.999Z`);

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

  const getIcon = () => {
    if (recommendation.mood === "sleep") return "😴";
    if (recommendation.mood === "water") return "💧";
    if (recommendation.mood === "break") return "🧘";
    return "💡";
  };

  useEffect(() => {
    setShowBubble(true);
    const timer = setTimeout(() => setShowBubble(false), 3000);
    return () => clearTimeout(timer);
  }, [recommendation]);

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

  /*   useEffect(() => {
    const rec = getRecommendation(summary);
    setRecommendation(rec);
  }, [summary]); */

  useEffect(() => {
    setShowBubble(true);

    const timer = setTimeout(() => {
      setShowBubble(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [recommendation]);

  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (bubbleOpen) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    }
  }, [bubbleOpen]);

  return (
    <ImageBackground
      source={require("../assets/RoomBedBackground.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.body}>
        {/* Header: Estados, Tienda, Tareas y PUNTOS*/}
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
            <Text style={localStyles.levelLabel}>
              LVL {level} • {progress}/100 XP
            </Text>
          </View>
          <View style={localStyles.expTrack}>
            <View style={[localStyles.expFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Área Central: mascota y partículas */}
        <View style={styles.main_cont}>
          {/* 1. Resumen de estados superior */}
          <View style={localStyles.summaryPill}>
            <Text style={{ color: "white", fontSize: 11, fontWeight: "600" }}>
              💧Agua: {summary.water} | 😴 Sueño: {summary.sleep}h | 🧘 Breaks: {summary.breaks}
            </Text>
          </View>

          {/* 2. Área de la mascota y notificaciones */}
          <View style={localStyles.petBox}>
            {bubbleOpen && (
              <View style={localStyles.bubble}>
                <Text style={localStyles.bubbleText}>
                  {recommendation.text}
                </Text>
                <View style={localStyles.bubbleArrow} />
              </View>
            )}
            {/* BURBUJA MINI (Botón de notificación) */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setBubbleOpen(!bubbleOpen)}
              style={localStyles.petInteractionArea}
            >
            <Text
              style={[localStyles.moodEmoji, { fontSize: bounce ? 55 : 45 }]}
            >
              {recommendation.mood === "sleep"
                ? "😴"
                : recommendation.mood === "water"
                  ? "💧"
                  : points >= 20
                    ? "😸"
                    : points >= 10
                      ? "🙂"
                      : "😿"}
            </Text>
            <Animated.View
              style={[
                styles.expandedBubble,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            ></Animated.View>

            {/* IMAGEN DE LA MASCOTA */}
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
          </TouchableOpacity>
            {/* PARTÍCULAS (Dentro del petBox para que sigan a la imagen) */}
            {petArea.width > 0 && (
              <OptimizedParticles
                petState={points >= 20 ? "happy" : "neutral"}
                petAreaWidth={petArea.width}
                petAreaHeight={petArea.height}
              />
            )}
          </View>

          {/* 3. Tarjeta de misión inferior */}
          <View style={localStyles.missionCard}>
            <Target size={14} color="#3b82f6" />
            <Text style={localStyles.missionText}>
              {points < 50 ? `Meta: ${50 - points} pts` : "¡Completado!"}
            </Text>
          </View>
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
        <Break
          addPoints={setPoints}
          onSaved={loadSummary}
          onCycleComplete={() => {
            setTimeout(() => {
              setMLVisible(true);
            }, 500);
          }}
        />
      </Sheet>

      {/* MODAL 1: Pomodoro */}
      <Modal visible={sheets.rest} animationType="slide" transparent={true}>
        <View style={{ flex: 1 }}>
          <Break
            addPoints={setPoints}
            onSaved={() => {
              toggleSheet("rest", false);
            }}
            onCycleComplete={() => {
              toggleSheet("rest", false);

              setTimeout(() => {
                setMLVisible(true);
              }, 500);
            }}
          />
          <TouchableOpacity
            onPress={() => toggleSheet("rest", false)}
            style={styles.closeBtnMinimal}
          ></TouchableOpacity>
        </View>
      </Modal>

      {/* MODAL 2: ML */}
      <Modal visible={mlVisible} animationType="fade">
        <View style={{ flex: 1, backgroundColor: "black" }}>
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
// Limpieza, esto es un subcomponente
const ActionButton = ({ icon, onPress }) => (
  <TouchableOpacity style={localStyles.actionBtn} onPress={onPress}>{icon}</TouchableOpacity>
);

const localStyles = StyleSheet.create({
  topHeader: {
    flexDirection: "row",
    paddingHorizontal: 15,
    justifyContent: "space-between",
    alignItems: "center",
    height: 50,
  },
  row: { flexDirection: "row", gap: 10 },
  miniBtn: { backgroundColor: "rgba(0,0,0,0.4)", padding: 8, borderRadius: 10 },
  pointsContainer: {
    backgroundColor: "rgba(0,0,0,0.6)",
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 20,
    gap: 5,
  },

  pointsText: { color: "white", fontWeight: "bold", fontSize: 14 },
  levelSection: { paddingHorizontal: 20, marginTop: 10 },
  levelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 5,
  },
  levelLabel: { color: "white", fontWeight: "bold", fontSize: 11 },
  expText: { color: "rgba(255,255,255,0.6)", fontSize: 9, marginLeft: "auto" },
  expTrack: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    marginTop: 4,
  },
  expFill: { height: "100%", backgroundColor: "#fbbf24", borderRadius: 3 },
  summaryPill: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 20,
    alignSelf: "center",
    top: -100,
  },
  petBox: { alignItems: "center", marginTop: 40, height: 250 },
  moodEmoji: { textAlign: "center", marginBottom: 10 },
  missionCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 10,
    borderRadius: 15,
    marginTop: 50,
    alignSelf: "center",
  },
  missionText: {
    color: "white",
    marginLeft: 8,
    fontWeight: "bold",
  },
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
  recommendationCard: {
    marginTop: 15,
    backgroundColor: "#1E293B",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  recText: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.3,
    flex: 1,
  },
  bubble: {
    position: "absolute",
    top: -50,
    backgroundColor: "white",
    padding: 12,
    borderRadius: 15,
    zIndex: 10,
  },

  bubbleArrow: {
    position: "absolute",
    bottom: -8,
    alignSelf: "center",
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderTopColor: "white",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },

  moodIndicator: {
    width: 4,
    height: "100%",
    borderRadius: 2,
    marginRight: 12,
  },
  miniNotificationBtn: {
    position: "absolute",
    right: 20,
    top: -10,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 20,
    zIndex: 20,
  },
  bubbleText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    textAlign: "center",
  },
  miniBubble: {
    position: "absolute",
    top: 80,
    right: 20,
    backgroundColor: "#22c55e",
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
  closeCamBtn: { padding: 20, backgroundColor: "#222", alignItems: "center" },
  expandedBubble: {
    position: "absolute",
    bottom: 220,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    maxWidth: 260,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    zIndex: 999,
  },
  bubbleText: {
    color: "#1e293b",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 13,
  },
});
