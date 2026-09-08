import React, { useState, useEffect } from 'react';
import { Home, Plus, Building, Search, Hammer, Trash2, IndianRupee } from 'lucide-react';
import { structureAssetService, compensationService, farmerService } from '../../services/entities.service';
import { StructureAsset, CompensationAward, FarmerRecord } from '../../types';

export const StructuralValuationsWorkspace: React.FC = () => {
  const [structures, setStructures] = useState<StructureAsset[]>([]);
  const [farmers, setFarmers] = useState<FarmerRecord[]>([]);
  const [compensations, setCompensations] = useState<CompensationAward[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFarmerId, setSelectedFarmerId] = useState('');
  const [structureType, setStructureType] = useState<StructureAsset['structureType']>('PUCCA_HOUSE');
  const [areaSqFt, setAreaSqFt] = useState('');

  useEffect(() => {
    const unsubStructures = structureAssetService.subscribe(setStructures);
    const unsubFarmers = farmerService.subscribe(setFarmers);
    const unsubComp = compensationService.subscribe(setCompensations);
    return () => {
      unsubStructures();
      unsubFarmers();
      unsubComp();
    };
  }, []);

  // Standard calculation rates
  const getRatePerSqFt = (type: StructureAsset['structureType']) => {
    switch (type) {
      case 'PUCCA_HOUSE': return 1500;
      case 'KUTCHA_HOUSE': return 800;
      case 'COMMERCIAL_SHED': return 1200;
      case 'TUBEWELL': return 500;
      default: return 0;
    }
  };

  const handleAddStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarmerId || !areaSqFt) return;

    const farmer = farmers.find(f => f.id === selectedFarmerId);
    if (!farmer) return;

    // 1. Calculate Value
    const area = parseFloat(areaSqFt);
    const rate = getRatePerSqFt(structureType);
    const assessedValue = area * rate;

    // 2. Create Structure Asset
    const newAsset: Omit<StructureAsset, 'id' | 'createdAt' | 'updatedAt'> = {
      projectId: 'proj-bullet-train-sec-3',
      parcelId: farmer.ulpin,
      farmerName: farmer.farmerName,
      structureType,
      builtUpAreaSqFt: area,
      assessedValueINR: assessedValue,
      isDeleted: false,
    };
    await structureAssetService.create(newAsset);

    // 3. Update Compensation
    const compensation = compensations.find(c => c.parcelId === farmer.ulpin || c.affectedFamilyId === farmer.id);
    if (compensation) {
      const newAssetsValuation = (compensation.assetsValuationINR || 0) + assessedValue;
      const newTotalPayable = compensation.basicLandValueINR + (compensation.solatiumAmountINR || 0) + newAssetsValuation + (compensation.interestAmountINR || 0);

      await compensationService.update(compensation.id, {
        assetsValuationINR: newAssetsValuation,
        totalPayableINR: newTotalPayable,
      });
    }

    setIsModalOpen(false);
    setSelectedFarmerId('');
    setAreaSqFt('');
  };

  return (
    <div className="p-6 h-full flex flex-col space-y-6 bg-[#FAF8F5]">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-indigo-100 rounded-lg">
              <Home className="w-5 h-5 text-indigo-600" />
            </div>
            <h1 className="text-xl font-extrabold text-[#0B132B]">Structures & Housing Valuation</h1>
          </div>
          <p className="text-sm text-slate-500 font-medium">Add houses and structures to automatically increase compensation.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0B132B] hover:bg-slate-800 text-white text-sm font-extrabold rounded-xl shadow-soft transition-all"
        >
          <Plus className="w-4 h-4" />
          Add New Structure
        </button>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-[#E2E8F0] shadow-soft overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-[#E2E8F0]">
                <th className="px-5 py-3 text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">Landowner & Parcel</th>
                <th className="px-5 py-3 text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">Structure Type</th>
                <th className="px-5 py-3 text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">Area (Sq Ft)</th>
                <th className="px-5 py-3 text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">Assessed Value</th>
                <th className="px-5 py-3 text-[10px] font-extrabold tracking-wider text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {structures.map(asset => (
                <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-extrabold text-[#0B132B] text-sm">{asset.farmerName}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">{asset.parcelId}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                      <Building className="w-3.5 h-3.5" />
                      {asset.structureType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-sm text-[#0B132B] font-medium">
                    {asset.builtUpAreaSqFt} sq ft
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-sm font-extrabold text-emerald-600">
                      ₹{asset.assessedValueINR.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {structures.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500 text-sm">
                    No structural assets found. Add a new structure to calculate compensation.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-extrabold text-[#0B132B] flex items-center gap-2">
                <Hammer className="w-5 h-5 text-indigo-600" />
                Add Structure Valuation
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <form onSubmit={handleAddStructure} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Select Landowner</label>
                <select
                  required
                  value={selectedFarmerId}
                  onChange={e => setSelectedFarmerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                >
                  <option value="">-- Choose Farmer --</option>
                  {farmers.map(f => (
                    <option key={f.id} value={f.id}>{f.farmerName} ({f.ulpin})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Structure Type</label>
                <select
                  required
                  value={structureType}
                  onChange={e => setStructureType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                >
                  <option value="PUCCA_HOUSE">Pucca House (₹1,500/sqft)</option>
                  <option value="KUTCHA_HOUSE">Kutcha House (₹800/sqft)</option>
                  <option value="COMMERCIAL_SHED">Commercial Shed (₹1,200/sqft)</option>
                  <option value="TUBEWELL">Tube Well (₹500/sqft)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Built-up Area (Sq Ft)</label>
                <div className="relative">
                  <input
                    required
                    type="number"
                    step="0.1"
                    value={areaSqFt}
                    onChange={e => setAreaSqFt(e.target.value)}
                    placeholder="e.g. 1200"
                    className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-extrabold">sqft</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-extrabold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <IndianRupee className="w-3.5 h-3.5" />
                  Calculate & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
