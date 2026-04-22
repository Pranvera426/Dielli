import React, { useState, useEffect, useRef } from 'react';
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
const MapView = Platform.OS === 'web' ? View : require('react-native-maps').default;
const Marker = Platform.OS === 'web' ? View : require('react-native-maps').Marker;
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

const API_BASE = 'https://aaron-embedded-hood-bouquet.trycloudflare.com';

const ROOF_MATERIALS = [
  { id: 'shingle', label: 'Composition Shingle', factor: 1.0, icon: Home },
  { id: 'metal', label: 'Metal', factor: 1.05, icon: Zap },
  { id: 'tile', label: 'Tile / Terra Cotta', factor: 0.9, icon: Home },
  { id: 'flat', label: 'Flat (Tar/Gravel)', factor: 0.85, icon: Target },
  { id: 'concrete', label: 'Concrete', factor: 0.95, icon: Target },
];

const MOCK_INSTALLERS = [
  { id: 1, name: 'EcoPower Solutions', rating: 4.9, icon: '⚡', email: 'leads@ecopower.al' },
  { id: 2, name: 'SunFlow Energy', rating: 4.8, icon: '☀️', email: 'quotes@sunflow.al' },
  { id: 3, name: 'GreenGrid Solar', rating: 4.7, icon: '🌱', email: 'inquiry@greengrid.al' },
];

const LandingScreen = ({ setView }) => (
  <View style={styles.landingContainer}>
    <Image 
      source={{ uri: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop' }} 
      style={styles.landingImage}
      resizeMode="cover"
    />
    <LinearGradient
      colors={['transparent', 'rgba(28, 46, 14, 0.8)', '#1c2e0e']}
      style={styles.landingGradient}
    >
      <View style={styles.landingContent}>
        <Text style={styles.landingTitle}>Unlock the{"\n"}Potential of Your{"\n"}Solar Panels.</Text>
        <TouchableOpacity 
          style={styles.landingButton}
          onPress={() => setView('input')}
        >
          <Text style={styles.landingButtonText}>Unlock Power Insights</Text>
          <View style={styles.landingButtonCircle}>
            <ArrowRight size={20} color="#1c2e0e" />
          </View>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  </View>
);

const BottomNav = ({ activeTab, setView }) => (
  <View style={styles.bottomNavWrapper}>
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navItem} onPress={() => setView('landing')}>
        <Home size={24} color={activeTab === 'home' ? "#a7f305" : "#64748b"} />
        <Text style={[styles.navText, activeTab === 'home' && styles.navTextActive]}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => setView('input')}>
        <Zap size={24} color={activeTab === 'power' ? "#a7f305" : "#64748b"} />
        <Text style={[styles.navText, activeTab === 'power' && styles.navTextActive]}>Power</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => setView('results')}>
        <BarChart3 size={24} color={activeTab === 'dashboard' ? "#a7f305" : "#64748b"} />
        <Text style={[styles.navText, activeTab === 'dashboard' && styles.navTextActive]}>Dashboard</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => setView('installers')}>
        <Users size={24} color={activeTab === 'appliances' ? "#a7f305" : "#64748b"} />
        <Text style={[styles.navText, activeTab === 'appliances' && styles.navTextActive]}>installers</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// Helper for consistent headers
const BrandingHeader = ({ setView, backView, title = "DIELL", showBack = true }) => (
  <View style={styles.header}>
    <View style={[styles.headerTop, { justifyContent: 'flex-start' }]}>
      {showBack && (
        <TouchableOpacity style={styles.backButtonRound} onPress={() => setView(backView)}>
          <ChevronLeft size={24} color="#1c2e0e" />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const InputScreen = ({ 
  position, setPosition, 
  monthlyExpenditure, setMonthlyExpenditure, 
  floorSize, setFloorSize, 
  roofMaterial, setRoofMaterial,
  detectLocation, gpsLoading, handleCalculate, loading, mapRef
}) => (
  <View style={{flex: 1}}>
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        {/* Removed Header Buttons as requested */}
        <Text style={styles.heroTitle}>Configure Your{"\n"}Solar Power</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>01. YOUR LOCATION</Text>
        <View style={styles.mapCard}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
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
              <ActivityIndicator size="small" color="#1c2e0e" />
            ) : (
              <>
                <MapPin size={18} color="#1c2e0e" />
                <Text style={styles.gpsText}>Pinpoint</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>02. ENERGY USAGE</Text>
        <View style={styles.inputGrid}>
          <View style={styles.inputBox}>
            <Euro size={20} color="#1c2e0e" style={{opacity: 0.6}} />
            <TextInput
              style={styles.textInput}
              placeholder="Bill (€)"
              placeholderTextColor="rgba(28, 46, 14, 0.4)"
              keyboardType="numeric"
              value={monthlyExpenditure}
              onChangeText={setMonthlyExpenditure}
            />
          </View>
          <View style={styles.inputBox}>
            <Home size={20} color="#1c2e0e" style={{opacity: 0.6}} />
            <TextInput
              style={styles.textInput}
              placeholder="Area (m²)"
              placeholderTextColor="rgba(28, 46, 14, 0.4)"
              keyboardType="numeric"
              value={floorSize}
              onChangeText={setFloorSize}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>03. ROOF MATERIAL</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.materialScroll} contentContainerStyle={{paddingRight: 40}}>
          {ROOF_MATERIALS.map(item => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.materialPill, roofMaterial.id === item.id && styles.materialPillActive]}
              onPress={() => setRoofMaterial(item)}
            >
              <item.icon size={16} color={roofMaterial.id === item.id ? "#1c2e0e" : "#1c2e0e"} style={{opacity: roofMaterial.id === item.id ? 1 : 0.6}} />
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
        <LinearGradient colors={['#a7f305', '#84cc16']} style={styles.buttonGradient}>
          {loading ? (
            <ActivityIndicator color="#1c2e0e" />
          ) : (
            <>
              <Text style={styles.buttonText}>CALCULATE IMPACT</Text>
              <View style={styles.buttonArrow}>
                <ArrowRight size={20} color="#fff" />
              </View>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  </View>
);

const ResultsScreen = ({ results, setView, activeScenario, setActiveScenario }) => {
  if (!results || !results.scenarios) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f7e6', padding: 40}}>
        <View style={{width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 24}}>
          <AlertTriangle size={40} color="#1c2e0e" />
        </View>
        <Text style={{fontSize: 24, fontWeight: '800', color: '#1c2e0e', textAlign: 'center'}}>No Analysis Data</Text>
        <Text style={{fontSize: 16, color: '#1c2e0e', opacity: 0.6, marginTop: 12, textAlign: 'center', lineHeight: 22}}>We couldn't find your solar calculation. Please head back to the input screen to configure your panel system.</Text>
        <TouchableOpacity 
          style={[styles.landingButton, {marginTop: 32, width: '100%'}]}
          onPress={() => setView('input')}
        >
          <Text style={styles.landingButtonText}>Configure Now</Text>
          <View style={styles.landingButtonCircle}>
            <Zap size={20} color="#1c2e0e" />
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  const data = results.scenarios[activeScenario];
  
  // Custom Card Component for the Dashboard
  const StatCard = ({ label, value, icon: Icon, color = '#1c2e0e', bgColor = '#fff' }) => (
    <View style={[styles.dashboardCard, { backgroundColor: bgColor }]}>
      <View style={styles.dashboardCardHeader}>
        <Text style={[styles.dashboardCardLabel, { color }]}>{label}</Text>
        <Icon size={16} color={color} style={{ opacity: 0.6 }} />
      </View>
      <Text style={[styles.dashboardCardValue, { color }]}>{value}</Text>
    </View>
  );

  return (
    <View style={{flex: 1}}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.headerTop, { justifyContent: 'flex-start' }]}>
            <TouchableOpacity 
              style={styles.backButtonRound}
              onPress={() => setView('input')}
            >
              <ChevronLeft size={24} color="#1c2e0e" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.scenarioSwitcherDashboard}>
          {['worst', 'neutral', 'best'].map((s) => (
            <TouchableOpacity 
              key={s}
              style={[styles.scenarioTabDashboard, activeScenario === s && styles.scenarioTabActive]}
              onPress={() => setActiveScenario(s)}
            >
              <Text style={[styles.scenarioTabTextDashboard, activeScenario === s && styles.scenarioTabTextDashboardActive]}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <LinearGradient 
          colors={['#1c2e0e', '#2d4a17']} 
          style={styles.mainChartCard}
        >
          <View style={styles.chartHeader}>
            <Text style={styles.chartLabel}>Today's Average:</Text>
            <Text style={styles.chartValue}>{data.monthlyUsage} <Text style={{fontSize: 16, opacity: 0.6}}>kWh</Text></Text>
          </View>
          
          {/* Mock Wave Chart using View and Gradients */}
          <View style={styles.waveChartContainer}>
            <View style={[styles.waveLine, { height: '60%', left: '10%' }]} />
            <View style={[styles.waveLine, { height: '80%', left: '20%' }]} />
            <View style={[styles.waveLine, { height: '50%', left: '30%', backgroundColor: '#a7f305' }]}>
              <View style={styles.wavePointer}>
                <View style={[styles.pointerLabel, { bottom: 40 }]}>
                  <Text style={styles.pointerText}>{data.systemKw} kW</Text>
                </View>
              </View>
            </View>
            <View style={[styles.waveLine, { height: '70%', left: '40%' }]} />
            <View style={[styles.waveLine, { height: '90%', left: '50%' }]} />
            <View style={[styles.waveLine, { height: '60%', left: '60%' }]} />
            <View style={[styles.waveLine, { height: '40%', left: '70%' }]} />
          </View>
          
          <View style={styles.chartFooter}>
            <Text style={styles.chartTime}>12 am</Text>
            <Text style={styles.chartTime}>6 am</Text>
            <Text style={[styles.chartTime, { color: '#a7f305' }]}>10 am</Text>
            <Text style={styles.chartTime}>12 pm</Text>
            <Text style={styles.chartTime}>6 pm</Text>
          </View>
        </LinearGradient>

        <View style={styles.dashboardGrid}>
          <StatCard 
            label="Total Energy" 
            value={`${data.monthlyUsage} kWh`} 
            icon={Euro} 
          />
          <StatCard 
            label="Consumed" 
            value={`${Math.round(data.monthlyUsage * 0.6)} kWh`} 
            icon={Zap} 
          />
          <StatCard 
            label="Capacity" 
            value={`${data.systemKw} kW`} 
            icon={Target} 
          />
          <StatCard 
            bgColor="#a7f305"
            label="CO2 Reduction" 
            value={`${(data.monthlyUsage * 0.0005).toFixed(2)} ton`} 
            icon={Leaf} 
          />
        </View>

        <TouchableOpacity 
          style={styles.availableEnergyCard}
          onPress={() => setView('installers')}
        >
          <View>
            <Text style={styles.availTitle}>Connect with Installers</Text>
            <Text style={styles.availSubtitle}>{results.maxPanelsPossible} panels possible on your roof</Text>
          </View>
          <View style={styles.availArrow}>
            <ArrowRight size={20} color="#1c2e0e" />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const InstallersScreen = ({ setView, selectedInstaller, setSelectedInstaller }) => (
  <View style={{flex: 1}}>
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <BrandingHeader setView={setView} backView={'results'} title="Installers" />

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>CERTIFIED PARTNERS</Text>
        <Text style={styles.installerMainLabel}>Choose your certified DIELL partner for installation.</Text>
        {MOCK_INSTALLERS.map(item => (
          <TouchableOpacity 
            key={item.id} 
            style={[styles.installerCard, selectedInstaller?.id === item.id && styles.installerCardActive]}
            onPress={() => setSelectedInstaller(item)}
          >
            <View style={styles.installerInfo}>
              <View style={styles.installerIconContainer}>
                <Text style={styles.installerIcon}>{item.icon}</Text>
              </View>
              <View>
                <Text style={styles.installerName}>{item.name}</Text>
                <Text style={styles.installerRating}>{item.rating} ★ Rating</Text>
              </View>
            </View>
            <View style={[styles.checkCircle, selectedInstaller?.id === item.id && styles.checkCircleActive]}>
              {selectedInstaller?.id === item.id && <CheckCircle2 size={16} color="#1c2e0e" />}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        style={[styles.mainActionButton, !selectedInstaller && { opacity: 0.6 }]}
        disabled={!selectedInstaller}
        onPress={() => setView('leadForm')}
      >
        <LinearGradient colors={['#a7f305', '#84cc16']} style={styles.buttonGradient}>
          <Text style={styles.buttonText}>PROCEED TO QUOTE</Text>
          <View style={styles.buttonArrow}>
            <ArrowRight size={20} color="#fff" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  </View>
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
  <View style={{flex: 1}}>
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <BrandingHeader setView={setView} backView={'installers'} title="Official Quote" />

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>PERSONAL DETAILS</Text>
        <Text style={styles.installerMainLabel}>Confirm your identity to receive your Official DIELL Quote.</Text>
        
        <View style={styles.inputBox}>
          <User size={20} color="#1c2e0e" style={{opacity: 0.6}} />
          <TextInput
            style={styles.textInput}
            placeholder="First Name"
            placeholderTextColor="rgba(28, 46, 14, 0.4)"
            value={name}
            onChangeText={setName}
          />
        </View>
        <View style={styles.inputBox}>
          <User size={20} color="#1c2e0e" style={{opacity: 0.6}} />
          <TextInput
            style={styles.textInput}
            placeholder="Last Name"
            placeholderTextColor="rgba(28, 46, 14, 0.4)"
            value={surname}
            onChangeText={setSurname}
          />
        </View>
        <View style={styles.inputBox}>
          <Mail size={20} color="#1c2e0e" style={{opacity: 0.6}} />
          <TextInput
            style={styles.textInput}
            placeholder="Email Address"
            placeholderTextColor="rgba(28, 46, 14, 0.4)"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <View style={styles.inputBox}>
          <Phone size={20} color="#1c2e0e" style={{opacity: 0.6}} />
          <TextInput
            style={styles.textInput}
            placeholder="Phone Number"
            placeholderTextColor="rgba(28, 46, 14, 0.4)"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>
      </View>

      <TouchableOpacity 
        style={styles.mainActionButton}
        onPress={handleGetQuote}
        disabled={loading}
      >
        <LinearGradient colors={['#1c2e0e', '#2d4a17']} style={styles.buttonGradient}>
          {loading ? (
            <ActivityIndicator color="#a7f305" />
          ) : (
            <>
              <Text style={[styles.buttonText, {color: '#fff'}]}>GET OFFICIAL QUOTE</Text>
              <View style={[styles.buttonArrow, {backgroundColor: '#a7f305'}]}>
                <ArrowRight size={20} color="#1c2e0e" />
              </View>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  </View>
);

export default function App() {
  const [view, setView] = useState('landing');
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
  const mapRef = useRef(null);

  const detectLocation = async () => {
    setGpsLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission", "GPS access is needed for solar accuracy.");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      const newPos = { latitude: location.coords.latitude, longitude: location.coords.longitude };
      setPosition(newPos);
      
      // Animate map to current location
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          ...newPos,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      }
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
      if (!results || !results.scenarios) {
        Alert.alert("Missing Calculation", "Please go back and calculate your solar potential first.");
        return;
      }

      const payload = {
        name,
        surname,
        phone,
        email,
        installer: selectedInstaller?.name,
        installerEmail: selectedInstaller?.email,
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
      {view === 'landing' && (
        <LandingScreen setView={setView} />
      )}
      {view === 'input' && (
        <>
          <InputScreen 
            position={position} setPosition={setPosition}
            monthlyExpenditure={monthlyExpenditure} setMonthlyExpenditure={setMonthlyExpenditure}
            floorSize={floorSize} setFloorSize={setFloorSize}
            roofMaterial={roofMaterial} setRoofMaterial={setRoofMaterial}
            detectLocation={detectLocation} gpsLoading={gpsLoading}
            handleCalculate={handleCalculate} loading={loading}
            mapRef={mapRef}
          />
          <BottomNav activeTab="power" setView={setView} />
        </>
      )}
      {view === 'results' && (
        <>
          <ResultsScreen 
            results={results} 
            setView={setView} 
            activeScenario={activeScenario}
            setActiveScenario={setActiveScenario}
          />
          <BottomNav activeTab="dashboard" setView={setView} />
        </>
      )}
      {view === 'installers' && (
        <>
          <InstallersScreen 
            setView={setView}
            selectedInstaller={selectedInstaller} setSelectedInstaller={setSelectedInstaller}
          />
          <BottomNav activeTab="appliances" setView={setView} />
        </>
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
  container: { flex: 1, backgroundColor: '#f0f7e6' },
  scrollContent: { padding: 24, paddingBottom: 120 },

  // Landing Styles
  landingContainer: { flex: 1, backgroundColor: '#1c2e0e' },
  landingImage: { width: '100%', height: '70%', position: 'absolute', top: 0 },
  landingGradient: { position: 'absolute', bottom: 0, width: '100%', height: '60%', justifyContent: 'flex-end', padding: 32, paddingBottom: 60 },
  landingContent: { gap: 40 },
  landingTitle: { fontSize: 48, fontWeight: '700', color: '#fff', lineHeight: 56, letterSpacing: -1 },
  landingButton: { backgroundColor: '#a7f305', height: 80, borderRadius: 100, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 32, paddingRight: 8 },
  landingButtonText: { fontSize: 20, fontWeight: '800', color: '#1c2e0e' },
  landingButtonCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },

  // Navigation Styles
  bottomNavWrapper: { position: 'absolute', bottom: 24, width: '100%', alignItems: 'center' },
  bottomNav: { width: '90%', backgroundColor: '#1c2e0e', height: 80, borderRadius: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 16, elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
  navItem: { alignItems: 'center' },
  navText: { color: '#64748b', fontSize: 10, fontWeight: '700', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  navTextActive: { color: '#a7f305' },

  header: { marginBottom: 32, paddingTop: 20 },
  brandingRow: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 40, height: 40 },
  logoCompact: { width: 30, height: 30 },
  title: { fontSize: 32, fontWeight: '800', color: '#1c2e0e', marginLeft: 10, letterSpacing: -1 },
  titleCompact: { fontSize: 20, fontWeight: '800', color: '#1c2e0e', marginLeft: 8 },
  subtitle: { color: '#475569', fontSize: 16, fontWeight: '500', marginTop: 8 },

  section: { marginBottom: 32 },
  sectionLabel: { color: '#1c2e0e', fontSize: 12, fontWeight: '900', letterSpacing: 1.5, marginBottom: 16, opacity: 0.6 },
  mainActionButton: { height: 80, borderRadius: 40, overflow: 'hidden', marginTop: 20 },
  buttonGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 32, paddingRight: 8 },
  buttonText: { color: '#1c2e0e', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  buttonArrow: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#1c2e0e', alignItems: 'center', justifyContent: 'center' },

  // New Header Styles
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  heroTitle: { fontSize: 40, fontWeight: '700', color: '#1c2e0e', lineHeight: 46, letterSpacing: -1 },

  // Input styles
  inputGrid: { flexDirection: 'row', gap: 12 },
  inputBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 16, height: 64, marginBottom: 12 },
  textInput: { flex: 1, marginLeft: 10, fontSize: 16, fontWeight: '700', color: '#1c2e0e' },

  materialPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 100, marginRight: 10 },
  materialPillActive: { backgroundColor: '#a7f305' },
  pillText: { color: '#1c2e0e', fontWeight: '800', marginLeft: 8, fontSize: 13, opacity: 0.6 },
  pillTextActive: { opacity: 1 },

  gpsButtonOverlay: { position: 'absolute', bottom: 12, right: 12, backgroundColor: '#a7f305', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 100, flexDirection: 'row', alignItems: 'center', elevation: 4 },
  gpsText: { color: '#1c2e0e', fontWeight: '800', fontSize: 12, marginLeft: 6 },

  mapCard: { height: 250, borderRadius: 28, overflow: 'hidden', backgroundColor: '#fff', borderWeight: 1, borderColor: '#fff' },
  map: { width: '100%', height: '100%' },

  resultsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, minHeight: 40 },
  backButtonRound: { width: 44, height: 44, backgroundColor: '#fff', borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  
  scenarioSwitcherDashboard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 100, padding: 6, marginBottom: 20 },
  scenarioTabDashboard: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 100 },
  scenarioTabActive: { backgroundColor: '#1c2e0e' },
  scenarioTabTextDashboard: { fontSize: 13, fontWeight: '700', color: '#1c2e0e', opacity: 0.6 },
  scenarioTabTextDashboardActive: { color: '#a7f305', opacity: 1 },

  mainChartCard: { borderRadius: 32, padding: 24, marginBottom: 20, height: 280, justifyContent: 'space-between' },
  chartHeader: { gap: 4 },
  chartLabel: { color: '#fff', fontSize: 14, opacity: 0.6, fontWeight: '600' },
  chartValue: { color: '#fff', fontSize: 32, fontWeight: '800' },
  waveChartContainer: { height: 120, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 10 },
  waveLine: { width: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.1)' },
  wavePointer: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#fff', position: 'absolute', top: -6, left: -4, borderWidth: 3, borderColor: '#a7f305' },
  pointerLabel: { position: 'absolute', backgroundColor: '#a7f305', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10, width: 80, alignItems: 'center', left: -34 },
  pointerText: { color: '#1c2e0e', fontSize: 12, fontWeight: '900' },
  chartFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  chartTime: { color: '#fff', fontSize: 10, opacity: 0.4, fontWeight: '700' },

  dashboardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  dashboardCard: { width: (width - 60) / 2, borderRadius: 24, padding: 20, gap: 12 },
  dashboardCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dashboardCardLabel: { fontSize: 12, fontWeight: '700', opacity: 0.8 },
  dashboardCardValue: { fontSize: 20, fontWeight: '800' },

  availableEnergyCard: { backgroundColor: '#d9e9ba', borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  availTitle: { fontSize: 18, fontWeight: '800', color: '#1c2e0e' },
  availSubtitle: { fontSize: 13, fontWeight: '600', color: '#1c2e0e', opacity: 0.6, marginTop: 4 },
  availArrow: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },

  alertBox: { flexDirection: 'row', backgroundColor: '#fffbeb', padding: 16, borderRadius: 20, marginBottom: 24, alignItems: 'center', borderWidth: 1, borderColor: '#fef3c7', gap: 12 },
  alertText: { color: '#92400e', fontSize: 13, fontWeight: '600', flex: 1 },

  statsCard: { backgroundColor: '#fff', borderRadius: 28, padding: 24, marginBottom: 32, borderWidth: 1, borderColor: '#f1f5f9' },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  statLabel: { color: '#64748b', fontSize: 15, fontWeight: '500' },
  statValue: { color: '#1e293b', fontSize: 18, fontWeight: '800' },

  installerLinkButton: { borderRadius: 24, overflow: 'hidden', marginTop: 8 },

  installerSection: { marginBottom: 32 },
  installerMainLabel: { color: '#1c2e0e', fontSize: 15, marginBottom: 24, fontWeight: '600', opacity: 0.6 },
  installerCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: 16, borderRadius: 24, marginBottom: 12 },
  installerCardActive: { backgroundColor: '#d9e9ba' },
  installerInfo: { flexDirection: 'row', alignItems: 'center' },
  installerIconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#f0f7e6', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  installerIcon: { fontSize: 20 },
  installerName: { fontSize: 16, fontWeight: '800', color: '#1c2e0e' },
  installerRating: { fontSize: 12, color: '#1c2e0e', fontWeight: '700', opacity: 0.5, marginTop: 2 },
  checkCircle: { width: 32, height: 32, borderRadius: 16, borderWeight: 2, borderColor: '#1c2e0e', alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderWidth: 1, opacity: 0.2 },
  checkCircleActive: { backgroundColor: '#a7f305', borderStyle: 'solid', borderWidth: 0, opacity: 1 },

  quoteButton: { height: 72, backgroundColor: '#059669', borderRadius: 24, alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: '#10b981', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16 },
  quoteText: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 1.5 }
});
