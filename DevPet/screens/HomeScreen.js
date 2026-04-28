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

// Componentes personalizados
import { BrainCog, ShoppingCart, ClipboardList, Droplet, BatteryMedium, Heart, Star, Target, } from "lucide-react-native";
import { Modal, Alert } from "react-native";
import HabitChart from "../components/charts/HabitChart";
import Pet from "../components/pet/Pet";
import Sheet from "../components/Sheet";
import Break from "../components/habits/Break";
import Habits from "../components/habits/Habits";
import Water from "../components/habits/Water";
import Sleep from "../components/habits/Sleep";
import MLView from "../components/MLView";
import MLCamera from "../components/MLCamera";
import DailyTasks from "../components/DailyTasks";
import {
  supabase,
  saveBreak,
  getTodayHabits,
  getTodayBreaks,
  getDayHabits,
  getUserInfo,
} from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

const { width } = Dimensions.get("window");

// A esta funcion se le pasara otros datos que no sean el resumen (summary ya no existe es innesesario)
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
  const { userId } = useAuth();
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

  // Información del usuario y puntos (diamantes)
  const [userInfo, setUserInfo] = useState(null);
  const [points, setPoints] = useState(0);

  // Ref para el componente Pet
  const petRef = useRef(null);

  // Cargar información del usuario desde la base de datos
  const loadUserInfo = async () => {
    try {
      const userData = await getUserInfo(userId);
      if (userData) {
        setUserInfo(userData);
        setPoints(userData.total_points || 0);
      }
    } catch (error) {
      console.error('Error cargando información del usuario:', error);
    }
  };

  const addPoints = (fn) => {
    setPoints(fn);
  };

  const onSaved = () => {
    loadUserInfo(); // Recargar información del usuario para obtener puntos actualizados
    // Actualizar estado de la mascota automáticamente
    if (petRef.current) {
      petRef.current.refreshPetState();
    }
  };

  const recommendation = useMemo(() => getRecommendation({ water: 0, sleep: 0, breaks: 0 }), []);

  // Memorizar cálculos de niveles
  const { level, progress } = useMemo(
    () => ({
      level: Math.floor(points / 100) + 1,
      progress: points % 100,
    }),
    [points],
  );

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

      // Actualizar estado de la mascota después de validar con IA
      if (petRef.current) {
        petRef.current.refreshPetState();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const toggleSheet = useCallback((name, visible) => {
    setSheets((prev) => ({ ...prev, [name]: visible }));
  }, []);

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
    loadUserInfo(); // Cargar información del usuario al montar
  }, []);

  return (
    <ImageBackground
      source={require("../assets/RoomBedBackground.png")}
      style={localStyles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={localStyles.body}>
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
            <Text>💎</Text>
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
        <View style={localStyles.petContainer}>
            <Pet
                ref={petRef}
                userId={userId}
                points={points}
                onPointsChange={(newPoints) => setPoints(newPoints)}
            />
        </View>

        {/* Footer: Acciones de hábitos */}
        <View style={localStyles.actions_cont}>
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
        <HabitChart userId={userId} />
      </Sheet>

      <Sheet
        visible={sheets.shop}
        onClose={() => toggleSheet("shop", false)}
        animation="slideDown"
      >
        <Text style={localStyles.text_sheet}>Tienda de Items</Text>
      </Sheet>

      <Sheet
        visible={sheets.task}
        onClose={() => toggleSheet("task", false)}
        animation="slideDown"
      >
        <DailyTasks
          userId={userId}
          addPoints={setPoints}
          onSaved={() => {
            loadUserInfo();
            if (petRef.current) {
              petRef.current.refreshPetState();
            }
          }}
        />
      </Sheet>

      {/* Registro de Hidratación */}
      <Sheet
        visible={waterVisible}
        onClose={() => setWaterVisible(false)}
        sheetTop={80}
        animation="slideUp"
      >
        <Water
            userId={userId}
            addPoints={setPoints}
            onSaved={() => {
                setWaterVisible(false);
                loadUserInfo();
                if (petRef.current) petRef.current.refreshPetState(); // ← recalcula thirsty
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
          userId={userId}
          addPoints={setPoints}
          onSaved={() => {
            setSleepVisible(false);
            loadUserInfo(); // Recargar puntos desde la base de datos
            if (petRef.current) {
              petRef.current.refreshPetState();
            }
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
          userId={userId}
          addPoints={setPoints}
          onSaved={() => {
            loadUserInfo(); // Recargar puntos desde la base de datos
            if (petRef.current) {
              petRef.current.refreshPetState();
            }
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
              setMLVisible(true);
              loadUserInfo(); // Recargar puntos desde la base de datos
              if (petRef.current) {
                petRef.current.refreshPetState();
              }
            }}
          />
          <TouchableOpacity
            onPress={() => toggleSheet("rest", false)}
            style={localStyles.closeBtnMinimal}
          >
            <Text style={{ color: "#64748B" }}>Cancelar</Text>
          </TouchableOpacity>
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
                // Actualizar estado de la mascota después de validar con ML
                if (petRef.current) {
                  petRef.current.refreshPetState();
                }
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
  background: {
    flex: 1,
  },
  body: {
    flex: 1,
    justifyContent: "space-between",
    padding: 5,
  },
  topHeader: {
    flexDirection: "row",
    paddingHorizontal: 15,
    justifyContent: "space-between",
    alignItems: "center",
    height: 40,
  },
  petContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: Dimensions.get("window").height * 0.02,
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
  levelLabel: { color: "white", fontWeight: "bold", fontSize: 11, },
  expText: { color: "rgba(255,255,255,0.6)", fontSize: 9, marginLeft: "auto" },
  expTrack: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  expFill: { height: "100%", backgroundColor: "#fbbf24" },
  actions_cont: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingVertical: Dimensions.get("window").height * 0.018,
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
    borderRadius: 100,
    backgroundColor: "#FF6500",
    padding: 9,
    width: Dimensions.get("window").width * 0.12,
    height: Dimensions.get("window").width * 0.12,
    justifyContent: "center",
    alignItems: "center",
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
  text_sheet: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
