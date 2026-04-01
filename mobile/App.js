import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  Dimensions,
  ActivityIndicator,
  Platform,
  Image,
  SafeAreaView,
  StatusBar
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { 
  Sun, 
  Zap, 
  Euro, 
  Home, 
  MapPin, 
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Leaf,
  BarChart3,
  Target,
  ArrowRight,
  Info,
  AlertTriangle,
  Users,
  Sparkles,
  CloudLightning,
  SunMedium,
  User,
  Phone,
  Mail
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const API_BASE = 'http://192.168.0.111:5000';

const ROOF_MATERIALS = [
  { id: 'shingle', label: 'Composition Shingle', factor: 1.0, icon: Home },
  { id: 'metal', label: 'Metal', factor: 1.05, icon: Zap },
  { id: 'tile', label: 'Tile / Terra Cotta', factor: 0.9, icon: Home },
  { id: 'flat', label: 'Flat (Tar/Gravel)', factor: 0.85, icon: Target },
  { id: 'concrete', label: 'Concrete', factor: 0.95, icon: Target },
];

const MOCK_INSTALLERS = [
  { id: 1, name: 'EcoPower Solutions', rating: 4.9, icon: '⚡', email: 'leads@ecopower.al' }, // Dynamic Emails added
  { id: 2, name: 'SunFlow Energy', rating: 4.8, icon: '☀️', email: 'quotes@sunflow.al' },
  { id: 3, name: 'GreenGrid Solar', rating: 4.7, icon: '🌱', email: 'inquiry@greengrid.al' },
];

// Helper for consistent headers
const BrandingHeader = ({ setView, backView, showBack = true }) => (
  <View style={styles.resultsHeader}>
    {showBack && (
      <TouchableOpacity style={styles.backButton} onPress={() => setView(backView)}>
        <ChevronLeft size={28} color="#1e293b" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    )}
    <View style={styles.brandingRow}>
      <Image 
        source={require('./assets/logo.png')} 
        style={styles.logoCompact} 
        resizeMode="contain"
      />
      <Text style={styles.titleCompact}>DIELL</Text>
    </View>
  </View>
);

const InputScreen = ({ 
  position, setPosition, 
  monthlyExpenditure, setMonthlyExpenditure, 
  floorSize, setFloorSize, 
  roofMaterial, setRoofMaterial,
  detectLocation, gpsLoading, handleCalculate, loading 
}) => (
  <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
    <View style={styles.header}>
      <View style={styles.brandingRow}>
        <Image 
          source={require('./assets/logo.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
        <Text style={styles.title}>DIELL</Text>
      </View>
      <Text style={styles.subtitle}>Empowering Your Clean Energy Journey</Text>
    </View>

    <View style={styles.section}>
      <View style={styles.labelRow}>
        <Text style={styles.sectionLabel}>01. YOUR LOCATION</Text>
        <Sparkles size={14} color="#10b981" />
      </View>
      <View style={styles.mapCard}>
        <MapView
          style={styles.map}
          region={position ? {
            ...position,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          } : {
            latitude: 42.6629,
            longitude: 21.1655,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
          onPress={(e) => setPosition(e.nativeEvent.coordinate)}
        >
          {position && <Marker coordinate={position} />}
        </MapView>
        <TouchableOpacity 
          style={styles.gpsButtonOverlay} 
          onPress={detectLocation}
          disabled={gpsLoading}
        >
          {gpsLoading ? (
            <ActivityIndicator size="small" color="#10b981" />
          ) : (
            <>
              <MapPin size={18} color="#10b981" />
              <Text style={styles.gpsText}>Detect Location</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionLabel}>02. ENERGY CONFIGURATION</Text>
      <View style={styles.inputBox}>
        <Euro size={20} color="#64748b" />
        <TextInput
          style={styles.textInput}
          placeholder="Monthly Electricity Bill (€)"
          placeholderTextColor="#94a3b8"
          keyboardType="numeric"
          value={monthlyExpenditure}
          onChangeText={setMonthlyExpenditure}
          contextMenuHidden={true}
        />
      </View>
      <View style={styles.inputBox}>
        <Home size={20} color="#64748b" />
        <TextInput
          style={styles.textInput}
          placeholder="Roof Space (m²)"
          placeholderTextColor="#94a3b8"
          keyboardType="numeric"
          value={floorSize}
          onChangeText={setFloorSize}
        />
      </View>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionLabel}>03. ROOF MATERIAL</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.materialScroll}>
        {ROOF_MATERIALS.map(item => (
          <TouchableOpacity 
            key={item.id} 
            style={[styles.materialPill, roofMaterial.id === item.id && styles.materialPillActive]}
            onPress={() => setRoofMaterial(item)}
          >
            <item.icon size={16} color={roofMaterial.id === item.id ? "#fff" : "#64748b"} />
            <Text style={[styles.pillText, roofMaterial.id === item.id && styles.pillTextActive]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>

    <TouchableOpacity 
      style={styles.mainActionButton} 
      onPress={handleCalculate}
      disabled={loading}
    >
      <LinearGradient colors={['#10b981', '#059669']} style={styles.buttonGradient}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.buttonText}>CALCULATE IMPACT</Text>
            <ArrowRight size={20} color="#fff" />
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  </ScrollView>
);

const ResultsScreen = ({ results, setView, activeScenario, setActiveScenario }) => {
  const data = results.scenarios[activeScenario];
  
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <BrandingHeader setView={setView} backView={'input'} />

      <View style={styles.scenarioSwitcher}>
        <TouchableOpacity 
          style={[styles.scenarioTab, activeScenario === 'worst' && styles.scenarioTabActiveWorst]} 
          onPress={() => setActiveScenario('worst')}
        >
          <CloudLightning size={16} color={activeScenario === 'worst' ? "#fff" : "#94a3b8"} />
          <Text style={[styles.scenarioTabText, activeScenario === 'worst' && styles.scenarioTabTextActive]}>Worst</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.scenarioTab, activeScenario === 'neutral' && styles.scenarioTabActiveNeutral]} 
          onPress={() => setActiveScenario('neutral')}
        >
          <SunMedium size={16} color={activeScenario === 'neutral' ? "#fff" : "#94a3b8"} />
          <Text style={[styles.scenarioTabText, activeScenario === 'neutral' && styles.scenarioTabTextActive]}>Neutral</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.scenarioTab, activeScenario === 'best' && styles.scenarioTabActiveBest]} 
          onPress={() => setActiveScenario('best')}
        >
          <Sun size={16} color={activeScenario === 'best' ? "#fff" : "#94a3b8"} />
          <Text style={[styles.scenarioTabText, activeScenario === 'best' && styles.scenarioTabTextActive]}>Best</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.impactGrid}>
        <View style={styles.impactCard}>
          <Text style={[styles.impactVal, { fontSize: 36, color: '#3b82f6' }]}>{data.panels}</Text>
          <Text style={styles.impactLab}>Total Panels Needed</Text>
        </View>
        <View style={[styles.impactCard, { backgroundColor: '#ecfdf5' }]}>
          <Leaf size={24} color="#10b981" />
          <Text style={[styles.impactVal, { color: '#059669' }]}>{data.systemKw}kW</Text>
          <Text style={styles.impactLab}>Projected Capacity</Text>
        </View>
      </View>

      <LinearGradient colors={['#f8fafc', '#f1f5f9']} style={styles.aiInsightCard}>
        <View style={styles.aiHeader}>
          <Sparkles size={20} color="#10b981" />
          <Text style={styles.aiTitle}>DIELL AI INSIGHTS</Text>
        </View>
        <Text style={styles.aiText}>
          Based on 2026 weather patterns, your {activeScenario} case suggests a yield of {data.monthlyUsage} kWh monthly. 
          <Text style={{fontWeight: '700'}}> AI Suggestion: </Text>
          {activeScenario === 'worst' ? "Consider a battery buffer." : "Maximize roof tilt!"}
        </Text>
      </LinearGradient>

      {!results.areaAdequate && (
        <View style={styles.alertBox}>
          <AlertTriangle size={20} color="#b45309" />
          <Text style={styles.alertText}>
            Space Warning: Local roof fits {results.maxPanelsPossible} panels. You need {data.panels} in this mode.
          </Text>
        </View>
      )}

      <View style={styles.statsCard}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Monthly Production</Text>
          <Text style={styles.statValue}>{data.monthlyUsage} kWh</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Annual Savings</Text>
          <Text style={styles.statValue}>€{data.annualSavings.toLocaleString()}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Solar ROI</Text>
          <Text style={styles.statValue}>{data.roiYears} yr</Text>
        </View>
        <View style={[styles.statRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.statLabel}>Investment Est.</Text>
          <Text style={styles.statValue}>€{data.estimatedCost.toLocaleString()}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.installerLinkButton} 
        onPress={() => setView('installers')}
      >
        <LinearGradient colors={['#3b82f6', '#1d4ed8']} style={styles.buttonGradient}>
          <Users size={20} color="#fff" />
          <Text style={styles.buttonText}>CONNECT WITH INSTALLERS</Text>
          <ChevronRight size={20} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
};

const InstallersScreen = ({ setView, selectedInstaller, setSelectedInstaller }) => (
  <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
    <BrandingHeader setView={setView} backView={'results'} />

    <View style={styles.installerSection}>
      <Text style={styles.installerMainLabel}>Choose your certified DIELL partner for installation.</Text>
      {MOCK_INSTALLERS.map(item => (
        <TouchableOpacity 
          key={item.id} 
          style={[styles.installerCard, selectedInstaller?.id === item.id && styles.installerCardActive]}
          onPress={() => setSelectedInstaller(item)}
        >
          <View style={styles.installerInfo}>
            <Text style={styles.installerIcon}>{item.icon}</Text>
            <View>
              <Text style={styles.installerName}>{item.name}</Text>
              <Text style={styles.installerRating}>{item.rating} ★ Rated</Text>
            </View>
          </View>
          {selectedInstaller?.id === item.id && <CheckCircle2 size={24} color="#10b981" />}
        </TouchableOpacity>
      ))}
    </View>

    <TouchableOpacity 
      style={[styles.quoteButton, !selectedInstaller && { opacity: 0.6 }]}
      disabled={!selectedInstaller}
      onPress={() => setView('leadForm')}
    >
      <Text style={styles.quoteText}>PROCEED TO QUOTE</Text>
    </TouchableOpacity>
  </ScrollView>
);

const LeadFormScreen = ({ 
  setView, 
  name, setName, 
  surname, setSurname, 
  phone, setPhone, 
  email, setEmail,
  handleGetQuote,
  selectedInstaller,
  loading
}) => (
  <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
    <BrandingHeader setView={setView} backView={'installers'} />

    <View style={styles.section}>
      <Text style={styles.installerMainLabel}>Confirm your identity to receive your Official DIELL Quote.</Text>
      
      <View style={styles.inputBox}>
        <User size={20} color="#64748b" />
        <TextInput
          style={styles.textInput}
          placeholder="Name"
          placeholderTextColor="#94a3b8"
          value={name}
          onChangeText={setName}
        />
      </View>
      <View style={styles.inputBox}>
        <User size={20} color="#64748b" />
        <TextInput
          style={styles.textInput}
          placeholder="Surname"
          placeholderTextColor="#94a3b8"
          value={surname}
          onChangeText={setSurname}
        />
      </View>
      <View style={styles.inputBox}>
        <Mail size={20} color="#64748b" />
        <TextInput
          style={styles.textInput}
          placeholder="Email Address"
          placeholderTextColor="#94a3b8"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>
      <View style={styles.inputBox}>
        <Phone size={20} color="#64748b" />
        <TextInput
          style={styles.textInput}
          placeholder="Phone Number (+383...)"
          placeholderTextColor="#94a3b8"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
      </View>
    </View>

    <View style={[styles.alertBox, { backgroundColor: '#f0fdfa', borderColor: '#ccfbf1' }]}>
      <CheckCircle2 size={20} color="#0d9488" />
      <Text style={[styles.alertText, { color: '#0f766e' }]}>
        Secure: Your data will be saved in our local DIELL database.
      </Text>
    </View>

    <TouchableOpacity 
      style={styles.quoteButton}
      onPress={handleGetQuote}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.quoteText}>GET OFFICIAL QUOTE</Text>
      )}
    </TouchableOpacity>
  </ScrollView>
);

export default function App() {
  const [view, setView] = useState('input');
  const [activeScenario, setActiveScenario] = useState('neutral');
  const [position, setPosition] = useState(null);
  const [monthlyExpenditure, setMonthlyExpenditure] = useState('');
  const [floorSize, setFloorSize] = useState('');
  const [roofMaterial, setRoofMaterial] = useState(ROOF_MATERIALS[0]);

  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [results, setResults] = useState(null);
  const [selectedInstaller, setSelectedInstaller] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const detectLocation = async () => {
    setGpsLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission", "GPS access is needed for solar accuracy.");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setPosition({ latitude: location.coords.latitude, longitude: location.coords.longitude });
    } catch (err) {
      console.error(err);
      Alert.alert("GPS Error", "Could not pinpoint location.");
    } finally {
      setGpsLoading(false);
    }
  };

  const handleCalculate = async () => {
    if (!monthlyExpenditure || !position || !floorSize) {
      Alert.alert("Oops!", "Please provide your bill, roof area, and your location.");
      return;
    }

    setLoading(true);
    try {
      const pvgisUrl = `https://re.jrc.ec.europa.eu/api/v5_2/PVcalc?lat=${position.latitude}&lon=${position.longitude}&peakpower=1&loss=14&tilt=36&aspect=0&optimalangles=1&outputformat=json`;
      const pvgisRes = await axios.get(pvgisUrl);
      
      const electricityPrice = 0.15;
      const panelPower = 0.45; // 450W
      const panelArea = 1.8;
      const costPerKw = 1200;

      const monthlyKwh = parseFloat(monthlyExpenditure) / electricityPrice;

      const calculate = (sunHours) => {
        const systemKw = monthlyKwh / (sunHours * 30);
        const panels = Math.ceil(systemKw / panelPower);
        const actualKw = panels * panelPower;
        const estimatedCost = Math.round(actualKw * costPerKw);
        const monthlyProduction = actualKw * sunHours * 30;
        const annualSavings = Math.round(monthlyProduction * 12 * electricityPrice);
        const roiYears = (estimatedCost / (annualSavings || 1)).toFixed(1);

        return {
          monthlyUsage: Math.round(monthlyProduction),
          systemKw: actualKw.toFixed(2),
          panels,
          estimatedCost,
          annualSavings,
          roiYears
        };
      };

      const scenarios = {
        worst: calculate(2.0),
        neutral: calculate(4.5),
        best: calculate(6.0)
      };

      setResults({
        scenarios,
        maxPanelsPossible: Math.floor(parseFloat(floorSize) / panelArea),
        areaAdequate: Math.floor(parseFloat(floorSize) / panelArea) >= scenarios.neutral.panels
      });
      setView('results');
    } catch (err) {
      console.error(err);
      Alert.alert("Calculation Error", "Could not process your energy data.");
    } finally {
      setLoading(false);
    }
  };

  const handleGetQuote = async () => {
    if (!name || !surname || !phone || !email) {
      Alert.alert("Missing Details", "All fields are required to finish.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name,
        surname,
        phone,
        email,
        installer: selectedInstaller?.name,
        installerEmail: selectedInstaller?.email, // Added installerEmail
        calculations: JSON.stringify(results.scenarios[activeScenario])
      };
      
      const response = await axios.post(`${API_BASE}/api/contact`, payload);
      
      Alert.alert(
        "Inquiry Sent!", 
        `Thank you ${name}. Your lead has been sent to ${selectedInstaller?.name} and a copy is in your email.`,
        [{ text: "FINISH", onPress: () => {
          setView('input');
          setResults(null);
          setSelectedInstaller(null);
          setMonthlyExpenditure('');
          setFloorSize('');
          setPosition(null);
          setName('');
          setSurname('');
          setPhone('');
          setEmail('');
        }}]
      );
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not reach the DIELL backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {view === 'input' && (
        <InputScreen 
          position={position} setPosition={setPosition}
          monthlyExpenditure={monthlyExpenditure} setMonthlyExpenditure={setMonthlyExpenditure}
          floorSize={floorSize} setFloorSize={setFloorSize}
          roofMaterial={roofMaterial} setRoofMaterial={setRoofMaterial}
          detectLocation={detectLocation} gpsLoading={gpsLoading}
          handleCalculate={handleCalculate} loading={loading}
        />
      )}
      {view === 'results' && (
        <ResultsScreen 
          results={results} 
          setView={setView} 
          activeScenario={activeScenario}
          setActiveScenario={setActiveScenario}
        />
      )}
      {view === 'installers' && (
        <InstallersScreen 
          setView={setView}
          selectedInstaller={selectedInstaller} setSelectedInstaller={setSelectedInstaller}
        />
      )}
      {view === 'leadForm' && (
        <LeadFormScreen 
          setView={setView}
          selectedInstaller={selectedInstaller}
          name={name} setName={setName}
          surname={surname} setSurname={setSurname}
          phone={phone} setPhone={setPhone}
          email={email} setEmail={setEmail}
          handleGetQuote={handleGetQuote}
          loading={loading}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 24, paddingBottom: 60 },

  header: { marginBottom: 32 },
  brandingRow: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 40, height: 40 },
  logoCompact: { width: 30, height: 30 },
  title: { fontSize: 32, fontWeight: '600', color: '#475569', marginLeft: 10, letterSpacing: -0.5 },
  titleCompact: { fontSize: 20, fontWeight: '600', color: '#475569', marginLeft: 8 },
  subtitle: { color: '#64748b', fontSize: 16, fontWeight: '400', marginTop: 8 },

  section: { marginBottom: 32 },
  sectionLabel: { color: '#059669', fontSize: 12, fontWeight: '800', letterSpacing: 1.5, marginBottom: 16 },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  mapCard: { height: 200, borderRadius: 24, overflow: 'hidden', backgroundColor: '#fff', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12 },
  map: { flex: 1 },
  gpsButtonOverlay: { position: 'absolute', bottom: 16, right: 16, backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 100, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  gpsText: { color: '#1e293b', fontWeight: '700', fontSize: 13, marginLeft: 6 },

  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 18, height: 64, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  textInput: { flex: 1, marginLeft: 14, fontSize: 16, fontWeight: '600', color: '#1e293b' },

  materialScroll: { flexDirection: 'row' },
  materialPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 16, marginRight: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  materialPillActive: { backgroundColor: '#10b981', borderColor: '#10b981' },
  pillText: { color: '#64748b', fontWeight: '700', marginLeft: 8 },
  pillTextActive: { color: '#fff' },

  mainActionButton: { borderRadius: 24, overflow: 'hidden' },
  buttonGradient: { height: 72, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 1 },

  resultsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, minHeight: 40 },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backText: { fontSize: 18, color: '#1e293b', fontWeight: '700' },
  resultsTitle: { fontSize: 24, fontWeight: '900', color: '#1e293b' },

  scenarioSwitcher: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 16, padding: 4, marginBottom: 24 },
  scenarioTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 12, gap: 6 },
  scenarioTabActiveWorst: { backgroundColor: '#64748b' },
  scenarioTabActiveNeutral: { backgroundColor: '#10b981' },
  scenarioTabActiveBest: { backgroundColor: '#f59e0b' },
  scenarioTabText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
  scenarioTabTextActive: { color: '#fff' },

  impactGrid: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  impactCard: { flex: 1, backgroundColor: '#eff6ff', borderRadius: 32, padding: 24, alignItems: 'center' },
  impactVal: { fontSize: 32, fontWeight: '900', color: '#2563eb', marginTop: 12 },
  impactLab: { fontSize: 12, color: '#64748b', fontWeight: '600', marginTop: 4, textAlign: 'center' },

  aiInsightCard: { borderRadius: 24, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#e2e8f0' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  aiTitle: { fontSize: 14, fontWeight: '900', color: '#10b981', letterSpacing: 1 },
  aiText: { color: '#475569', fontSize: 14, lineHeight: 22 },

  alertBox: { flexDirection: 'row', backgroundColor: '#fffbeb', padding: 16, borderRadius: 20, marginBottom: 24, alignItems: 'center', borderWidth: 1, borderColor: '#fef3c7', gap: 12 },
  alertText: { color: '#92400e', fontSize: 13, fontWeight: '600', flex: 1 },

  statsCard: { backgroundColor: '#fff', borderRadius: 28, padding: 24, marginBottom: 32, borderWidth: 1, borderColor: '#f1f5f9' },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  statLabel: { color: '#64748b', fontSize: 15, fontWeight: '500' },
  statValue: { color: '#1e293b', fontSize: 18, fontWeight: '800' },

  installerLinkButton: { borderRadius: 24, overflow: 'hidden', marginTop: 8 },

  installerSection: { marginBottom: 32 },
  installerMainLabel: { color: '#64748b', fontSize: 15, marginBottom: 24 },
  installerCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: 20, borderRadius: 24, marginBottom: 12, borderWidth: 2, borderColor: '#f8fafc' },
  installerCardActive: { borderColor: '#10b981', backgroundColor: '#f0fdf4' },
  installerInfo: { flexDirection: 'row', alignItems: 'center' },
  installerIcon: { fontSize: 24, marginRight: 16 },
  installerName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  installerRating: { fontSize: 13, color: '#10b981', fontWeight: '600' },

  quoteButton: { height: 72, backgroundColor: '#059669', borderRadius: 24, alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: '#10b981', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16 },
  quoteText: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 1.5 }
});
