import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import './index.css';

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

function App() {
  const [position, setPosition] = useState(null);
  const [monthlyExpenditure, setMonthlyExpenditure] = useState('');
  const [floorSize, setFloorSize] = useState('');
  const [roofShape, setRoofShape] = useState('plain');

  const [results, setResults] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Fetch companies on mount
  useEffect(() => {
    axios.get('http://localhost:5000/api/companies')
      .then(res => setCompanies(res.data))
      .catch(err => console.error("Error fetching companies:", err));
  }, []);

  const handleCalculate = async (e) => {
    e.preventDefault();
    if (!monthlyExpenditure) return;

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/calculator', {
        monthlyExpenditure: parseFloat(monthlyExpenditure),
        latitude: position?.lat,
        longitude: position?.lng
      });
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = async () => {
    if (!selectedCompany) return;

    const formData = new FormData();
    formData.append('companyId', selectedCompany.id);
    formData.append('userDetails', JSON.stringify({
      monthlyExpenditure,
      latitude: position?.lat,
      longitude: position?.lng
    }));
    formData.append('calculations', JSON.stringify(results));
    
    formData.append('floorSize', floorSize);
    formData.append('roofShape', roofShape);

    try {
      const res = await axios.post('http://localhost:5000/api/contact', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setToastMessage(res.data.message);
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setToastMessage("Failed to send inquiry.");
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  return (
    <div className="app-grid">
      <div className="glass-panel">
        <h1 className="heading">Solar Estimator</h1>
        <p className="subheading">Calculate your solar needs and ROI in seconds.</p>

        <form onSubmit={handleCalculate}>
          <div className="form-group">
            <label>Monthly Electrical Expenditure (€)</label>
            <input 
              type="number" 
              placeholder="e.g. 150" 
              value={monthlyExpenditure}
              onChange={e => setMonthlyExpenditure(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Floor Size (sq meters)</label>
            <input 
              type="number" 
              placeholder="e.g. 100" 
              value={floorSize}
              onChange={e => setFloorSize(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Roof Shape</label>
            <select 
              value={roofShape} 
              onChange={e => setRoofShape(e.target.value)}
              style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0, 0, 0, 0.2)', color: 'var(--text-main)', fontSize: '1rem', width: '100%', boxSizing: 'border-box' }}
            >
              <option style={{color: 'black'}} value="tiles">Tiles</option>
              <option style={{color: 'black'}} value="plain">Plain</option>
              <option style={{color: 'black'}} value="tilted">Tilted</option>
            </select>
          </div>

          <div className="form-group">
            <label>Select Your Location</label>
            <MapContainer center={[42.6629, 21.1655]} zoom={13} scrollWheelZoom={false}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker position={position} setPosition={setPosition} />
            </MapContainer>
            {position && <p style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>Coordinates: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}</p>}
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Calculating...' : 'Calculate ROI & Needs'}
          </button>
        </form>
      </div>

      <div className="glass-panel">
        <h2 className="heading" style={{ fontSize: '2rem' }}>Estimation Results</h2>
        
        {!results ? (
          <p className="subheading">Fill out the form on the left to see your personalized solar estimation.</p>
        ) : (
          <div>
            <div className="result-stat">
              <span className="stat-label">Needed Monthly Production:</span>
              <span className="stat-val">{results.neededKwhMonthly} kWh</span>
            </div>
            <div className="result-stat">
              <span className="stat-label">Recommended System Size:</span>
              <span className="stat-val">{results.neededKwCapacity} kW</span>
            </div>
            <div className="result-stat">
              <span className="stat-label">Estimated Installation Cost:</span>
              <span className="stat-val">€{results.estimatedCost}</span>
            </div>
            <div className="result-stat">
              <span className="stat-label">Estimated Annual Savings:</span>
              <span className="stat-val">€{results.annualSavings}</span>
            </div>
            <div className="result-stat">
              <span className="stat-label">Return on Investment (ROI):</span>
              <span className="stat-val">{results.roiYears} years</span>
            </div>
            <div className="result-stat" style={{ borderBottom: 'none' }}>
              <span className="stat-label">Roof Size Adequacy:</span>
              <span className={`stat-val ${!results.roofAdequate ? 'warning' : ''}`}>
                {results.roofAdequate ? 'Adequate' : `Needs at least ${results.requiredArea} sq meters`}
              </span>
            </div>

            <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Available Installers</h3>
            {companies.map(c => (
              <div 
                key={c.id} 
                className={`company-card ${selectedCompany?.id === c.id ? 'selected' : ''}`}
                onClick={() => setSelectedCompany(c)}
              >
                <div className="company-name">{c.name}</div>
                <div className="company-desc">{c.description}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Rating: {c.rating} / 5.0</div>
              </div>
            ))}

            <button 
              className="btn-success" 
              onClick={handleContact} 
              disabled={!selectedCompany}
              style={{ marginTop: '1rem' }}
            >
              Contact Selected Installer
            </button>

            {toastMessage && (
              <div className="toast">
                {toastMessage}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
