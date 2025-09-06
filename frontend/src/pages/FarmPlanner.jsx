import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import styles from './FarmPlanner.module.css';

const GRID_COLS = 30;
const GRID_ROWS = 20;
const CELLS_PER_ACRE = 10;

const getProfitabilityRating = (profit) => {
    if (profit > 100000) return { label: 'Excellent (A+)', color: '#4CAF50' };
    if (profit > 50000) return { label: 'Good (B)', color: '#8BC34A' };
    if (profit > 0) return { label: 'Fair (C)', color: '#FFEB3B', textColor: '#333' };
    return { label: 'Loss (F)', color: '#F44336' };
}

function FarmPlanner() {
  const [userCrops, setUserCrops] = useState([]);
  const [totalAcres, setTotalAcres] = useState(1);
  const [grid, setGrid] = useState(Array(GRID_ROWS * GRID_COLS).fill(null)); // Flattened grid
  const [selectedCropId, setSelectedCropId] = useState(null);
  const [isPainting, setIsPainting] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const cropsRes = await api.get('/planner/crops');
      setUserCrops(cropsRes.data);
      const planRes = await api.get('/planner/my-plan');
      if (planRes.data && planRes.data.grid) {
        setGrid(planRes.data.grid);
      }
      setTotalAcres(planRes.data.totalAcres || 1);
    } catch (error) { console.error("Failed to fetch planner data", error); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const allocatedCells = useMemo(() => grid.filter(Boolean).length, [grid]);
  const allocatedAcres = allocatedCells / CELLS_PER_ACRE;

  const analyzePlan = useCallback(async (currentGrid) => {
    const plotMap = new Map();
    currentGrid.forEach(cell => {
        if (cell) {
            plotMap.set(cell, (plotMap.get(cell) || 0) + 1);
        }
    });
    
    const plots = Array.from(plotMap.entries()).map(([cropId, cellCount]) => ({
        cropId,
        area: cellCount / CELLS_PER_ACRE
    }));

    if (plots.length > 0) {
      const res = await api.post('/planner/analyze', { plots });
      setAnalysis(res.data);
    } else {
      setAnalysis(null);
    }
  }, []);

  useEffect(() => { analyzePlan(grid) }, [grid, analyzePlan]);
  
  const handleCellInteraction = (index) => {
    if (isErasing) {
      if (grid[index] !== null) {
        const newGrid = [...grid];
        newGrid[index] = null;
        setGrid(newGrid);
      }
      return;
    }

    if (!selectedCropId) {
      alert("Please select a crop from the palette first.");
      return;
    }
    
    if (allocatedCells >= totalAcres * CELLS_PER_ACRE && !grid[index]) {
        alert(`You have allocated all of your ${totalAcres} acres.`);
        return;
    }
    
    const newGrid = [...grid];
    newGrid[index] = selectedCropId;
    setGrid(newGrid);
  };
  
  const handleMouseDown = (index) => {
    setIsPainting(true);
    handleCellInteraction(index);
  }

  const handleMouseEnter = (index) => {
    if (isPainting) handleCellInteraction(index);
  }

  const handleMouseUp = () => {
    setIsPainting(false);
  }

  const handleSavePlan = () => {
    api.post('/planner/my-plan', { farmPlan: { grid, totalAcres } })
       .then(() => alert('Plan saved successfully!'));
  };
  
  const handleClearBoard = () => {
    setGrid(Array(GRID_ROWS * GRID_COLS).fill(null));
  }

  const profitability = analysis ? getProfitabilityRating(analysis.totalProfit) : null;
  const cropColorMap = useMemo(() => Object.fromEntries(userCrops.map((c, i) => [c.id, `hsl(${(i * 40) % 360}, 70%, 50%)`])), [userCrops]);

  return (
    <div className={styles.planner}>
      {showCropModal && <AddCropModal onClose={() => setShowCropModal(false)} onCropAdded={fetchData} />}
      <div className={styles.controls}>
        <div className="card">
          <h3>Crop Palette</h3>
          <p>Manage your crops and select one to "paint" on the farm.</p>
          <div className={styles.cropButtons}>
            {userCrops.map(crop => (
              <button key={crop.id} onClick={() => { setSelectedCropId(crop.id); setIsErasing(false); }} className={selectedCropId === crop.id && !isErasing ? styles.selectedCrop : ''}>
                <span className={styles.colorSwatch} style={{backgroundColor: cropColorMap[crop.id]}}></span> {crop.name}
              </button>
            ))}
          </div>
          <button onClick={() => setShowCropModal(true)} className={styles.addCropBtn}>+ Add New Crop</button>
          <button onClick={() => { setIsErasing(true); setSelectedCropId(null); }} className={`${styles.eraserBtn} ${isErasing ? styles.selectedCrop : ''}`}>Eraser</button>
        </div>

        {analysis && (
          <div className="card">
            <h3>Plan Analysis</h3>
            <div className={styles.analysisItem}><span className={styles.label}>Land Used:</span> <span className={styles.value}>{allocatedAcres.toFixed(1)} / {totalAcres} acres</span></div>
            <div className={styles.analysisItem}><span className={styles.label}>Total Investment:</span> <span className={styles.value} style={{color: '#F44336'}}>₹{analysis.totalInvestment.toLocaleString('en-IN')}</span></div>
            <div className={styles.analysisItem}><span className={styles.label}>Potential Revenue:</span> <span className={styles.value} style={{color: '#4CAF50'}}>₹{analysis.totalRevenue.toLocaleString('en-IN')}</span></div>
            <hr className={styles.divider} />
            <div className={styles.analysisItem}><span className={styles.label}>Net Profit / Loss:</span> <span className={styles.value} style={{color: analysis.totalProfit > 0 ? '#4CAF50' : '#F44336'}}>₹{analysis.totalProfit.toLocaleString('en-IN')}</span></div>
            <div className={styles.analysisItem}><span className={styles.label}>Profitability:</span> <span className={styles.value} style={{backgroundColor: profitability.color, color: profitability.textColor || '#fff', padding: '2px 8px', borderRadius: '4px'}}>{profitability.label}</span></div>
          </div>
        )}
        <div className={styles.actionButtons}>
            <button onClick={handleClearBoard} className={styles.clearBtn}>Clear Board</button>
            <button onClick={handleSavePlan} className={`primary-btn ${styles.saveBtn}`}>Save Plan</button>
        </div>
      </div>

      <div className={styles.farmArea} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        <div className={styles.grid}>
          {grid.map((cellId, i) => (
            <div 
              key={i} 
              className={styles.cell} 
              style={{ backgroundColor: cellId ? cropColorMap[cellId] : undefined }}
              onMouseDown={() => handleMouseDown(i)}
              onMouseEnter={() => handleMouseEnter(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function AddCropModal({ onClose, onCropAdded }) {
    const [formData, setFormData] = useState({ name: '', investmentPerAcre: '', revenuePerAcre: '' });
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        await api.post('/planner/crops', formData);
        onCropAdded();
        onClose();
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={`card ${styles.modalContent}`}>
                <h3>Add a New Crop</h3>
                <form onSubmit={handleSubmit}>
                    <label>Crop Name</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    <label>Investment per Acre (₹)</label>
                    <input type="number" value={formData.investmentPerAcre} onChange={e => setFormData({...formData, investmentPerAcre: e.target.value})} required />
                    <label>Potential Revenue per Acre (₹)</label>
                    <input type="number" value={formData.revenuePerAcre} onChange={e => setFormData({...formData, revenuePerAcre: e.target.value})} required />
                    <div className={styles.modalActions}>
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit" className="primary-btn">Add Crop</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default FarmPlanner;