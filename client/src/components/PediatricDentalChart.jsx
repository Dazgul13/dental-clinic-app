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

                    {/* Incisal Surface */}
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
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default PediatricDentalChart;