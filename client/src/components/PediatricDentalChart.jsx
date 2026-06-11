// Pediatric Dental Chart Component
// Displays primary (baby) teeth using the US/Canadian numbering system (A-T or 50-83)
// Used for patients age 7 and under (before permanent teeth fully erupt)

import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const PediatricDentalChart = ({ patientId, dentalChart, onUpdate }) => {
  // State for currently selected tooth and its status/notes
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [toothStatus, setToothStatus] = useState('healthy');
  const [toothNotes, setToothNotes] = useState('');
  
  // State for surface-level details (each tooth has 5 surfaces in pediatric charting)
  const [surfaces, setSurfaces] = useState({
    mesial: { status: 'healthy', notes: '' },
    occlusal: { status: 'healthy', notes: '' },
    distal: { status: 'healthy', notes: '' },
    buccal: { status: 'healthy', notes: '' },
    lingual: { status: 'healthy', notes: '' },
    incisal: { status: 'healthy', notes: '' }
  });
  
  const [updating, setUpdating] = useState(false);
  const [showSurfaceDetails, setShowSurfaceDetails] = useState(false);
  const [viewMode, setViewMode] = useState('full'); // 'full' or 'quadrants' for layout toggle

  // Primary Teeth Numbering System (simplified A-E per quadrant)
  // A = central incisor (midline), E = second molar (farthest back)
  // All four quadrants use the same A-E sequence from midline outward
  
  // Primary tooth layout - A to E in each quadrant
  // Order from midline outward:
  //   Upper Right (Q1) & Lower Right (Q4) shown on screen LEFT:  E-D-C-B-A (E farthest, A at midline)
  //   Upper Left (Q2) & Lower Left (Q3) shown on screen RIGHT: A-B-C-D-E (A at midline, E farthest)
  const upperPrimaryTeeth = [
    ['E', 'D', 'C', 'B', 'A'],
    ['A', 'B', 'C', 'D', 'E']
  ];
  
  const lowerPrimaryTeeth = [
    ['E', 'D', 'C', 'B', 'A'],
    ['A', 'B', 'C', 'D', 'E']
  ];

  const quadrants = {
    1: { name: 'Upper Right', teeth: ['E', 'D', 'C', 'B', 'A'], position: 'top-right' },
    2: { name: 'Upper Left', teeth: ['A', 'B', 'C', 'D', 'E'], position: 'top-left' },
    3: { name: 'Lower Left', teeth: ['A', 'B', 'C', 'D', 'E'], position: 'bottom-left' },
    4: { name: 'Lower Right', teeth: ['E', 'D', 'C', 'B', 'A'], position: 'bottom-right' }
  };

  // Helper function to get tooth data from the dental chart
  // Returns default healthy tooth data if tooth not found
  const getToothData = (toothNumber) => {
    return dentalChart?.teeth?.find(t => t.number === toothNumber) || {
      number: toothNumber,
      status: 'healthy',
      surfaces: {
        mesial: { status: 'healthy', notes: '' },
        occlusal: { status: 'healthy', notes: '' },
        distal: { status: 'healthy', notes: '' },
        buccal: { status: 'healthy', notes: '' },
        lingual: { status: 'healthy', notes: '' },
        incisal: { status: 'healthy', notes: '' }
      },
      notes: ''
    };
  };

  // Color coding for tooth status visualization
  const getToothColor = (status) => {
    const colors = {
      healthy: 'bg-white border-gray-300',
      cavity: 'bg-red-200 border-red-400',
      filled: 'bg-blue-200 border-blue-400',
      crown: 'bg-yellow-200 border-yellow-400',
      missing: 'bg-gray-400 border-gray-600',
      'root-canal': 'bg-purple-200 border-purple-400',
      implant: 'bg-green-200 border-green-400'
    };
    return colors[status] || colors.healthy;
  };

  // Color coding for surface indicators
  const getSurfaceColor = (status) => {
    const colors = {
      healthy: 'bg-green-100',
      cavity: 'bg-red-400',
      filled: 'bg-blue-400',
      watch: 'bg-yellow-400'
    };
    return colors[status] || colors.healthy;
  };

  // Determine if a primary tooth is a front tooth (incisor or canine)
  // Primary teeth letters: A & J are laterals, B & I are cuspids, C-H are incisors
  const isFrontTooth = (toothNumber) => {
    const frontTeeth = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    return frontTeeth.includes(toothNumber);
  };

  // Handle tooth selection - loads tooth data into the editing panel
  const handleToothClick = (toothNumber) => {
    const tooth = getToothData(toothNumber);
    setSelectedTooth(toothNumber);
    setToothStatus(tooth.status);
    setToothNotes(tooth.notes || '');
    setSurfaces(tooth.surfaces || {
      mesial: { status: 'healthy', notes: '' },
      occlusal: { status: 'healthy', notes: '' },
      distal: { status: 'healthy', notes: '' },
      buccal: { status: 'healthy', notes: '' },
      lingual: { status: 'healthy', notes: '' },
      incisal: { status: 'healthy', notes: '' }
    });
    setShowSurfaceDetails(false);
  };

  // Handle surface input changes (used for both status and notes)
  const handleSurfaceChange = (surface, field, value) => {
    setSurfaces(prev => ({
      ...prev,
      [surface]: {
        ...prev[surface],
        [field]: value
      }
    }));
  };

  // Save tooth data to the backend API
  const handleUpdateTooth = async () => {
    if (!selectedTooth) return;

    setUpdating(true);
    try {
      const { data } = await api.put(`/patients/${patientId}/dental-chart/${selectedTooth}`, {
        status: toothStatus,
        notes: toothNotes,
        surfaces: surfaces
      });
      
      onUpdate(data);
      toast.success(`Tooth #${selectedTooth} updated successfully`);
      setSelectedTooth(null);
      setToothStatus('healthy');
      setToothNotes('');
      setShowSurfaceDetails(false);
    } catch (error) {
      console.error('Error updating tooth:', error);
      toast.error('Failed to update tooth');
    } finally {
      setUpdating(false);
    }
  };

  // Get statistics for a quadrant (healthy count vs total)
  const getQuadrantStats = (quadrantNumber) => {
    const quadrant = quadrants[quadrantNumber];
    const stats = { healthy: 0, issues: 0, total: quadrant.teeth.length };

    quadrant.teeth.forEach(toothNum => {
      const tooth = getToothData(toothNum);
      if (tooth.status === 'healthy') {
        stats.healthy++;
      } else {
        stats.issues++;
      }
    });

    return stats;
  };

  // Render a quadrant view for primary teeth
  const renderQuadrant = (quadrantNumber) => {
    const quadrant = quadrants[quadrantNumber];
    const stats = getQuadrantStats(quadrantNumber);

    return (
      <div key={quadrantNumber} className="bg-white border-2 border-gray-300 rounded-lg p-4">
        <div className="mb-3">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-semibold text-gray-700">
              Quadrant {quadrantNumber}: {quadrant.name}
            </h4>
            <span className="text-xs text-gray-500">
              {stats.healthy}/{stats.total} healthy
            </span>
          </div>
          <div className="flex gap-1 text-xs">
            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">
              {stats.healthy} OK
            </span>
            {stats.issues > 0 && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded">
                {stats.issues} Issues
              </span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {quadrant.teeth.map(toothNum => renderToothWithSurfaces(toothNum, true))}
        </div>
      </div>
    );
  };

  // Render a single tooth button with surface indicators
  const renderToothWithSurfaces = (toothNumber, useLetter = false) => {
    const tooth = getToothData(toothNumber);
    const isSelected = selectedTooth === toothNumber;
    const isFront = isFrontTooth(toothNumber);
    const toothSurfaces = tooth.surfaces || {};
    
    return (
      <button
        key={toothNumber}
        onClick={() => handleToothClick(toothNumber)}
        className={`
          relative w-10 h-12 border-2 rounded-lg flex items-center justify-center
          text-xs font-semibold transition-all
          ${getToothColor(tooth.status)}
          ${isSelected ? 'ring-2 ring-primary-500' : ''}
          hover:shadow-md hover:-translate-y-0.5
        `}
        title={`Primary Tooth #${toothNumber} - ${tooth.status}`}
      >
        {/* Tooth number */}
        <span className="relative z-10">{toothNumber}</span>
        
        {/* Surface indicators - small colored bars on edges */}
        {tooth.status === 'healthy' && (
          <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
            {/* Mesial (left) */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${getSurfaceColor(toothSurfaces.mesial?.status)}`}></div>
            {/* Distal (right) */}
            <div className={`absolute right-0 top-0 bottom-0 w-1 ${getSurfaceColor(toothSurfaces.distal?.status)}`}></div>
            {/* Occlusal/Incisal (top) */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${getSurfaceColor(isFront ? toothSurfaces.incisal?.status : toothSurfaces.occlusal?.status)}`}></div>
            {/* Buccal (bottom outer) */}
            <div className={`absolute bottom-0 left-0 right-1/2 h-1 ${getSurfaceColor(toothSurfaces.buccal?.status)}`}></div>
            {/* Lingual (bottom inner) */}
            <div className={`absolute bottom-0 right-0 left-1/2 h-1 ${getSurfaceColor(toothSurfaces.lingual?.status)}`}></div>
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-4">
      {/* Dental Chart Header with View Toggle */}
      <div className="bg-white p-3 sm:p-6 rounded-lg border border-gray-200 overflow-x-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
          <h3 className="text-base sm:text-lg font-semibold">Primary Dental Chart (Baby Teeth)</h3>
          
          {/* View Mode Toggle */}
          <div className="flex rounded-md shadow-sm self-start">
            <button
              onClick={() => setViewMode('full')}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-l-md border ${
                viewMode === 'full'
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Full Mouth
            </button>
            <button
              onClick={() => setViewMode('quadrants')}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-r-md border-t border-r border-b ${
                viewMode === 'quadrants'
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Quadrants
            </button>
          </div>
        </div>

        {/* Full Mouth View */}
        {viewMode === 'full' ? (
          <>
            <div className="mb-6 sm:mb-8">
              <div className="text-xs text-gray-500 mb-2 text-center">Upper Primary Teeth</div>
              <div className="flex justify-center gap-2 sm:gap-8 overflow-x-auto">
                <div className="flex gap-1">
                  {upperPrimaryTeeth[0].map(toothNum => renderToothWithSurfaces(toothNum, true))}
                </div>
                <div className="w-4 sm:w-8 flex-shrink-0"></div>
                <div className="flex gap-1">
                  {upperPrimaryTeeth[1].map(toothNum => renderToothWithSurfaces(toothNum, true))}
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-center gap-2 sm:gap-8 overflow-x-auto">
                <div className="flex gap-1">
                  {lowerPrimaryTeeth[0].map(toothNum => renderToothWithSurfaces(toothNum, true))}
                </div>
                <div className="w-4 sm:w-8 flex-shrink-0"></div>
                <div className="flex gap-1">
                  {lowerPrimaryTeeth[1].map(toothNum => renderToothWithSurfaces(toothNum, true))}
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2 text-center">Lower Primary Teeth</div>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderQuadrant(1)}
              {renderQuadrant(2)}
              {renderQuadrant(4)}
              {renderQuadrant(3)}
            </div>
          </>
        )}

        {/* Legend - Color coding explanation */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-gray-700 mb-2">Tooth Status:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded"></div>
                  <span>Healthy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-200 border-2 border-red-400 rounded"></div>
                  <span>Cavity</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-200 border-2 border-blue-400 rounded"></div>
                  <span>Filled</span>
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-700 mb-2">Surface Status (edges):</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-gray-300 rounded"></div>
                  <span>Healthy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-400 border border-gray-300 rounded"></div>
                  <span>Cavity</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-400 border border-gray-300 rounded"></div>
                  <span>Filled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-400 border border-gray-300 rounded"></div>
                  <span>Watch</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-600">
                <strong>M</strong>esial | <strong>O</strong>cclusal | <strong>D</strong>istal | <strong>B</strong>uccal | <strong>L</strong>ingual
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tooth Details Modal - Appears when a tooth is selected */}
      {selectedTooth && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Primary Tooth #{selectedTooth} {isFrontTooth(selectedTooth) ? '(Front - Incisal)' : '(Back - Occlusal)'}
              </h3>
              <button 
                onClick={() => setSelectedTooth(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Overall Tooth Status Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Overall Tooth Status
                </label>
                <select
                  value={toothStatus}
                  onChange={(e) => setToothStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="healthy">Healthy</option>
                  <option value="cavity">Cavity</option>
                  <option value="filled">Filled</option>
                  <option value="crown">Crown</option>
                  <option value="missing">Missing</option>
                  <option value="root-canal">Root Canal</option>
                  <option value="implant">Implant</option>
                </select>
              </div>

              {/* Surface Details Toggle and Inputs */}
              <div className="border-t pt-4">
                <button
                  onClick={() => setShowSurfaceDetails(!showSurfaceDetails)}
                  className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <span>Surface Details (MODBL)</span>
                  <svg 
                    className={`w-5 h-5 transition-transform ${showSurfaceDetails ? 'rotate-180' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showSurfaceDetails && (
                  <div className="mt-4 space-y-3 bg-gray-50 p-4 rounded-lg">
                    {/* Mesial Surface */}
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <label className="text-sm font-medium text-gray-700">
                        <span className="inline-block w-6 h-6 bg-blue-100 border border-blue-300 rounded text-center text-xs leading-6 mr-1">M</span>
                        Mesial
                      </label>
                      <select
                        value={surfaces.mesial?.status || 'healthy'}
                        onChange={(e) => handleSurfaceChange('mesial', 'status', e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded-md"
                      >
                        <option value="healthy">Healthy</option>
                        <option value="cavity">Cavity</option>
                        <option value="filled">Filled</option>
                        <option value="watch">Watch</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Notes..."
                        value={surfaces.mesial?.notes || ''}
                        onChange={(e) => handleSurfaceChange('mesial', 'notes', e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded-md"
                      />
                    </div>

                    {/* Occlusal/Incisal Surface - Changes based on tooth type */}
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <label className="text-sm font-medium text-gray-700">
                        <span className="inline-block w-6 h-6 bg-blue-100 border border-blue-300 rounded text-center text-xs leading-6 mr-1">
                          {isFrontTooth(selectedTooth) ? 'I' : 'O'}
                        </span>
                        {isFrontTooth(selectedTooth) ? 'Incisal' : 'Occlusal'}
                      </label>
                      <select
                        value={isFrontTooth(selectedTooth) ? (surfaces.incisal?.status || 'healthy') : (surfaces.occlusal?.status || 'healthy')}
                        onChange={(e) => handleSurfaceChange(isFrontTooth(selectedTooth) ? 'incisal' : 'occlusal', 'status', e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded-md"
                      >
                        <option value="healthy">Healthy</option>
                        <option value="cavity">Cavity</option>
                        <option value="filled">Filled</option>
                        <option value="watch">Watch</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Notes..."
                        value={isFrontTooth(selectedTooth) ? (surfaces.incisal?.notes || '') : (surfaces.occlusal?.notes || '')}
                        onChange={(e) => handleSurfaceChange(isFrontTooth(selectedTooth) ? 'incisal' : 'occlusal', 'notes', e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded-md"
                      />
                    </div>

                    {/* Distal Surface */}
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <label className="text-sm font-medium text-gray-700">
                        <span className="inline-block w-6 h-6 bg-blue-100 border border-blue-300 rounded text-center text-xs leading-6 mr-1">D</span>
                        Distal
                      </label>
                      <select
                        value={surfaces.distal?.status || 'healthy'}
                        onChange={(e) => handleSurfaceChange('distal', 'status', e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded-md"
                      >
                        <option value="healthy">Healthy</option>
                        <option value="cavity">Cavity</option>
                        <option value="filled">Filled</option>
                        <option value="watch">Watch</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Notes..."
                        value={surfaces.distal?.notes || ''}
                        onChange={(e) => handleSurfaceChange('distal', 'notes', e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded-md"
                      />
                    </div>

                    {/* Buccal Surface */}
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <label className="text-sm font-medium text-gray-700">
                        <span className="inline-block w-6 h-6 bg-blue-100 border border-blue-300 rounded text-center text-xs leading-6 mr-1">B</span>
                        Buccal
                      </label>
                      <select
                        value={surfaces.buccal?.status || 'healthy'}
                        onChange={(e) => handleSurfaceChange('buccal', 'status', e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded-md"
                      >
                        <option value="healthy">Healthy</option>
                        <option value="cavity">Cavity</option>
                        <option value="filled">Filled</option>
                        <option value="watch">Watch</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Notes..."
                        value={surfaces.buccal?.notes || ''}
                        onChange={(e) => handleSurfaceChange('buccal', 'notes', e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded-md"
                      />
                    </div>

                    {/* Lingual Surface */}
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <label className="text-sm font-medium text-gray-700">
                        <span className="inline-block w-6 h-6 bg-blue-100 border border-blue-300 rounded text-center text-xs leading-6 mr-1">L</span>
                        Lingual
                      </label>
                      <select
                        value={surfaces.lingual?.status || 'healthy'}
                        onChange={(e) => handleSurfaceChange('lingual', 'status', e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded-md"
                      >
                        <option value="healthy">Healthy</option>
                        <option value="cavity">Cavity</option>
                        <option value="filled">Filled</option>
                        <option value="watch">Watch</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Notes..."
                        value={surfaces.lingual?.notes || ''}
                        onChange={(e) => handleSurfaceChange('lingual', 'notes', e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded-md"
                      />
                    </div>

                    {/* Incisal Surface - Only shown for front teeth */}
                    {isFrontTooth(selectedTooth) && (
                      <div className="grid grid-cols-3 gap-2 items-center">
                        <label className="text-sm font-medium text-gray-700">
                          <span className="inline-block w-6 h-6 bg-blue-100 border border-blue-300 rounded text-center text-xs leading-6 mr-1">I</span>
                          Incisal
                        </label>
                        <select
                          value={surfaces.incisal?.status || 'healthy'}
                          onChange={(e) => handleSurfaceChange('incisal', 'status', e.target.value)}
                          className="px-2 py-1 text-sm border border-gray-300 rounded-md"
                        >
                          <option value="healthy">Healthy</option>
                          <option value="cavity">Cavity</option>
                          <option value="filled">Filled</option>
                          <option value="watch">Watch</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Notes..."
                          value={surfaces.incisal?.notes || ''}
                          onChange={(e) => handleSurfaceChange('incisal', 'notes', e.target.value)}
                          className="px-2 py-1 text-sm border border-gray-300 rounded-md"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* General Notes Textarea */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  General Notes
                </label>
                <textarea
                  rows="3"
                  value={toothNotes}
                  onChange={(e) => setToothNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Add general notes about this tooth..."
                />
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedTooth(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTooth}
                disabled={updating}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Update Tooth'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PediatricDentalChart;