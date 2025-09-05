import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Stage, Layer, Rect, Text, Group } from 'react-konva';
import api from '../services/api';
import styles from './FarmPlanner.module.css';

const CROP_COLORS = { Banana: '#FFD700', Tapioca: '#8B4513', Rubber: '#333333', Coconut: '#A9A9A9' };

function FarmPlanner() {
  const [crops, setCrops] = useState([]);
  const [plots, setPlots] = useState([]);
  const [totalAcres, setTotalAcres] = useState(10);
  const [analysis, setAnalysis] = useState(null);
  const [selectedPlotId, setSelectedPlotId] = useState(null);
  
  const stageRef = useRef();

  const fetchData = useCallback(async () => {
    const cropsRes = await api.get('/planner/crops');
    setCrops(cropsRes.data);
    const planRes = await api.get('/planner/my-plan');
    setPlots(planRes.data.plots || []);
    setTotalAcres(planRes.data.totalAcres || 10);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const analyzePlan = useCallback(async (currentPlots) => {
    if (currentPlots.length > 0) {
      const res = await api.post('/planner/analyze', { plots: currentPlots });
      setAnalysis(res.data);
    } else {
      setAnalysis(null);
    }
  }, []);

  useEffect(() => {
    analyzePlan(plots);
  }, [plots, analyzePlan]);
  
  const handleAddPlot = (cropName) => {
    const newPlot = {
      id: Date.now(),
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      crop: cropName,
      area: 1
    };
    setPlots([...plots, newPlot]);
  };

  const handleDeletePlot = () => {
    if (!selectedPlotId) return;
    setPlots(plots.filter(p => p.id !== selectedPlotId));
    setSelectedPlotId(null);
  };

  const handleUpdateAcreage = (e) => {
    const newArea = parseFloat(e.target.value);
    if (!selectedPlotId || isNaN(newArea)) return;
    setPlots(plots.map(p => p.id === selectedPlotId ? { ...p, area: newArea } : p));
  };
  
  const handleDragEnd = (e, index) => {
    const newPlots = [...plots];
    newPlots[index].x = e.target.x();
    newPlots[index].y = e.target.y();
    setPlots(newPlots);
  };

  const handleSavePlan = () => {
    api.post('/planner/my-plan', { farmPlan: { plots, totalAcres } })
       .then(() => alert('Plan saved! You have earned the "Farm Planner" badge!'));
  };

  const checkDeselect = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedPlotId(null);
    }
  };

  const selectedPlot = plots.find(p => p.id === selectedPlotId);

  return (
    <div className={styles.planner}>
      <div className={styles.controls}>
        <div className="card">
          <h3>Crop Palette</h3>
          <div className={styles.cropButtons}>
            {crops.map(crop => (
              <button key={crop.id} onClick={() => handleAddPlot(crop.name)} className="primary-btn">{crop.name}</button>
            ))}
          </div>
        </div>

        {selectedPlot && (
          <div className={`card ${styles.editPanel}`}>
            <h3>Edit "{selectedPlot.crop}" Plot</h3>
            <label>Acreage:</label>
            <input 
              type="number" 
              value={selectedPlot.area}
              onChange={handleUpdateAcreage}
              min="0.1"
              step="0.1"
            />
            <button onClick={handleDeletePlot} className={styles.deleteBtn}>Delete Plot</button>
          </div>
        )}

        {analysis && (
          <div className="card">
            <h3>Plan Analysis</h3>
            <p>Land Used: {analysis.totalLandUsed.toFixed(1)} / {totalAcres} acres</p>
            <p>Est. Cost: ₹{analysis.totalCost.toLocaleString()}</p>
            <p>Est. Profit: ₹{analysis.totalProfit.toLocaleString()}</p>
            <h4>Tips:</h4>
            <ul className={styles.tipList}>
              {analysis.tips.map((tip, i) => <li key={i}>{tip}</li>)}
            </ul>
          </div>
        )}
        <button onClick={handleSavePlan} className={`primary-btn ${styles.saveBtn}`}>Save Plan</button>
      </div>

      <div className={styles.farmArea}>
        <Stage 
          width={window.innerWidth * 0.6} 
          height={600} 
          className={styles.stage}
          onMouseDown={checkDeselect}
          ref={stageRef}
        >
          <Layer>
            {plots.map((plot, i) => (
              <Group
                key={plot.id}
                x={plot.x}
                y={plot.y}
                draggable
                onDragEnd={(e) => handleDragEnd(e, i)}
                onClick={() => setSelectedPlotId(plot.id)}
                onTap={() => setSelectedPlotId(plot.id)}
              >
                <Rect
                  width={plot.width}
                  height={plot.height}
                  fill={CROP_COLORS[plot.crop] || 'grey'}
                  stroke={selectedPlotId === plot.id ? '#00BFFF' : '#000'}
                  strokeWidth={selectedPlotId === plot.id ? 4 : 1}
                  shadowBlur={10}
                />
                <Text 
                  text={`${plot.crop}\n${plot.area.toFixed(1)} ac`}
                  fontSize={14}
                  fill="#fff"
                  padding={5}
                  align="center"
                  width={plot.width}
                  verticalAlign="middle"
                  height={plot.height}
                />
              </Group>
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

export default FarmPlanner;