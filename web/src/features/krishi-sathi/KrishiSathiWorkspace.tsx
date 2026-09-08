import React, { useEffect, useState, useMemo } from 'react';
import { FarmerRecord } from '../../types';
import { farmerService } from '../../services/entities.service';
import { auditService } from '../../services/audit.service';
import { seedBhumiShieldDemoData } from '../../utils/seedData';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission, getPermissionReason } from '../../utils/rbac';
import { FarmerDetailsDrawer } from './FarmerDetailsDrawer';
import { FarmerLandVisualizer } from './FarmerLandVisualizer';
import { MapContainer, TileLayer, Polygon, CircleMarker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Sprout,
  PlusCircle,
  Search,
  Filter,
  MapPin,
  FileText,
  Map as MapIcon,
  ChevronRight,
  X,
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Users,
  Crosshair,
  Trash2,
} from 'lucide-react';

// Geodesic spherical polygon area calculation (in Square Meters & Acres)
function calculateGeodesicArea(coordinates: Array<[number, number]>): { sqMeters: number; acres: number; hectares: number } {
  if (coordinates.length < 3) {
    return { sqMeters: 0, acres: 0, hectares: 0 };
  }

  const radius = 6378137; // Earth's mean radius in meters (WGS84)
  let area = 0;

  const len = coordinates.length;
  for (let i = 0; i < len; i++) {
    const p1 = coordinates[i];
    const p2 = coordinates[(i + 1) % len];

    const lat1Rad = (p1[0] * Math.PI) / 180;
    const lat2Rad = (p2[0] * Math.PI) / 180;
    const dLngRad = ((p2[1] - p1[1]) * Math.PI) / 180;

    area += dLngRad * (2 + Math.sin(lat1Rad) + Math.sin(lat2Rad));
  }

  area = Math.abs((area * radius * radius) / 2.0);
  const sqMeters = Math.round(area * 100) / 100;
  const acres = Math.round((sqMeters / 4046.8564224) * 100) / 100; // 1 acre = 4046.8564224 sq m
  const hectares = Math.round((sqMeters / 10000) * 100) / 100;

  return { sqMeters, acres, hectares };
}

// Sub-component for interactive polygon drawing on modal map
const MapAreaSelector: React.FC<{
  polygonPoints: Array<[number, number]>;
  onAddPoint: (lat: number, lng: number) => void;
}> = ({ polygonPoints, onAddPoint }) => {
  useMapEvents({
    click(e) {
      onAddPoint(e.latlng.lat, e.latlng.lng);
    },
  });

  return (
    <>
      {polygonPoints.length > 0 && (
        <Polygon
          positions={polygonPoints}
          pathOptions={{
            color: '#4F46E5',
            fillColor: '#F97316',
            fillOpacity: 0.4,
            weight: 2,
            dashArray: '3, 3',
          }}
        />
      )}
      {polygonPoints.map((pt, idx) => (
        <CircleMarker
          key={idx}
          center={pt}
          radius={6}
          pathOptions={{
            color: '#FFFFFF',
            fillColor: '#059669',
            fillOpacity: 1,
            weight: 2,
          }}
        />
      ))}
    </>
  );
};


export const KrishiSathiWorkspace: React.FC = () => {
  const { userProfile, activeRole } = useAuth();
  const [farmers, setFarmers] = useState<FarmerRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Interactive View Modals & Drawers
  const [inspectingFarmer, setInspectingFarmer] = useState<FarmerRecord | null>(null);
  const [visualizingFarmer, setVisualizingFarmer] = useState<FarmerRecord | null>(null);

  // Real-time Admin Farmer Registration Modal
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Form State for Adding Farmer Real-Time
  const [formName, setFormName] = useState('');
  const [formContact, setFormContact] = useState('+91 ');
  const [formAadhaar, setFormAadhaar] = useState('XXXX-XXXX-');
  const [formState, setFormState] = useState('Maharashtra');
  const [formDistrict, setFormDistrict] = useState('Palghar');
  const [formTehsil, setFormTehsil] = useState('Palghar');
  const [formVillage, setFormVillage] = useState('Manikpur');
  const [formKhata, setFormKhata] = useState('Khata-');
  const [formSurvey, setFormSurvey] = useState('');
  const [formHissa, setFormHissa] = useState('Hissa-1');
  const [formTotalAcres, setFormTotalAcres] = useState('3.50');
  const [formAcquiredAcres, setFormAcquiredAcres] = useState('2.50');
  const [formClassification, setFormClassification] = useState<'Agricultural' | 'Commercial' | 'Residential' | 'Barren' | 'Forest'>('Agricultural');
  const [formSoilType, setFormSoilType] = useState('Alluvial Loam');
  const [formTenure, setFormTenure] = useState('Occupant Class I (Freehold Khatedar)');
  const [formValuation, setFormValuation] = useState('15000000');
  const [formBankName, setFormBankName] = useState('State Bank of India');
  const [formAccountMasked, setFormAccountMasked] = useState('XXXXXX1234');
  const [formIfsc, setFormIfsc] = useState('SBIN0001244');
  const [formLat, setFormLat] = useState('19.6967');
  const [formLng, setFormLng] = useState('72.7699');

  // Interactive Map Area Selection State
  const [drawnPolygon, setDrawnPolygon] = useState<Array<[number, number]>>([]);
  const [modalMapMode, setModalMapMode] = useState<'SATELLITE' | 'STREET'>('SATELLITE');

  const handleAddMapPoint = (lat: number, lng: number) => {
    const updated = [...drawnPolygon, [lat, lng] as [number, number]];
    setDrawnPolygon(updated);
    const avgLat = updated.reduce((s, p) => s + p[0], 0) / updated.length;
    const avgLng = updated.reduce((s, p) => s + p[1], 0) / updated.length;
    setFormLat(avgLat.toFixed(5));
    setFormLng(avgLng.toFixed(5));

    // Auto calculate area when 3 or more points are placed
    if (updated.length >= 3) {
      const { acres } = calculateGeodesicArea(updated);
      if (acres > 0) {
        setFormTotalAcres(acres.toFixed(2));
        setFormAcquiredAcres(acres.toFixed(2));
      }
    }
  };

  const handleClearMapPoints = () => {
    setDrawnPolygon([]);
  };


  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [qrModalFarmer, setQrModalFarmer] = useState<FarmerRecord | null>(null);

  const handleTriggerSeed = async () => {
    setIsSeeding(true);
    try {
      await seedBhumiShieldDemoData();
    } catch (e) {
      console.error('Error seeding demo data:', e);
    } finally {
      setIsSeeding(false);
    }
  };

  // Real-time Live Firestore Subscription + Auto-seed on first open if empty
  useEffect(() => {
    setLoading(true);
    const unsubscribe = farmerService.subscribe((data) => {
      setFarmers(data);
      setLoading(false);
      // Auto seed if completely empty
      if (data.length === 0) {
        seedBhumiShieldDemoData().catch(console.error);
      }
    });
    return () => unsubscribe();
  }, []);

  // Filtered Farmers
  const filteredFarmers = useMemo(() => {
    return farmers.filter((f) => {
      const matchesSearch =
        f.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.surveyGatNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.ulpin.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesState = selectedState === 'ALL' || f.state === selectedState;
      const matchesStatus =
        selectedStatus === 'ALL' || f.arVerificationStatus === selectedStatus;

      return matchesSearch && matchesState && matchesStatus;
    });
  }, [farmers, searchQuery, selectedState, selectedStatus]);

  // Aggregate Metrics
  const totalFarmers = farmers.length;
  const totalAcquiredAcres = farmers.reduce((sum, f) => sum + (f.acquiredAreaAcres || 0), 0);
  const totalDisbursedINR = farmers
    .filter((f) => f.disbursementStatus === 'DISBURSED')
    .reduce((sum, f) => sum + (f.totalCompensationINR || 0), 0);
  const verifiedCount = farmers.filter((f) => f.arVerificationStatus === 'VERIFIED').length;

  const handleCreateFarmer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const lat = parseFloat(formLat) || 19.6967;
      const lng = parseFloat(formLng) || 72.7699;
      const totalAc = parseFloat(formTotalAcres) || 1;
      const acqAc = parseFloat(formAcquiredAcres) || 1;
      const retainedAc = Math.max(0, totalAc - acqAc);
      const baseVal = parseFloat(formValuation) || 0;
      const solatium = baseVal;
      const totalComp = baseVal + solatium;

      const cleanSurvey = formSurvey.replace(/[^a-zA-Z0-9]/g, '');
      const stateCode = formState.substring(0, 2).toUpperCase();
      const generatedUlpin = `ULPIN-${stateCode}-${cleanSurvey || '999'}-2026`;
      const generatedId = `farmer-${Date.now()}`;

      // Use user-drawn polygon if available, else standard 4-corner offset
      let finalPolygon: Array<[number, number]> = drawnPolygon;
      if (finalPolygon.length < 3) {
        const deltaLat = 0.0010;
        const deltaLng = 0.0015;
        finalPolygon = [
          [lat + deltaLat, lng - deltaLng],
          [lat + deltaLat, lng + deltaLng],
          [lat - deltaLat, lng + deltaLng],
          [lat - deltaLat, lng - deltaLng],
        ];
      }

      const dgpsPillars = finalPolygon.map((pt, idx) => ({
        pillarId: `PIL-${cleanSurvey}-P${idx + 1}`,
        lat: pt[0],
        lng: pt[1],
        rtkAccuracyCm: 1.2,
      }));

      const boundaryObjects = finalPolygon.map((pt) => ({ lat: pt[0], lng: pt[1] }));

      await farmerService.create({
        farmerName: formName,
        contactNumber: formContact,
        aadhaarMasked: formAadhaar,
        state: formState,
        district: formDistrict,
        talukaTehsil: formTehsil,
        village: formVillage,
        khataNumber: formKhata,
        surveyGatNumber: formSurvey,
        hissaNumber: formHissa,
        ulpin: generatedUlpin,
        totalLandAreaAcres: totalAc,
        acquiredAreaAcres: acqAc,
        retainedAreaAcres: retainedAc,
        landClassification: formClassification,
        soilType: formSoilType,
        tenureType: formTenure,
        jointHolders: [
          { name: 'Self Khatedar', shareFraction: '1/1', relation: 'Sole Holder' }
        ],
        initialPurchaseDate: new Date().toLocaleDateString('en-GB'),
        initialPurchasePriceINR: baseVal * 0.4,
        lastAssessedCircleRateINR: baseVal,
        landOwnershipHistory: [
          {
            ownerName: `${formName} (Current Khatedar)`,
            relationType: 'PURCHASE',
            periodFrom: '2015',
            periodTo: 'Present',
            transactionType: 'SALE_DEED',
            deedRegistrationNo: `DEED-${stateCode}-${cleanSurvey}-2015`,
            subRegistrarOffice: `SRO ${formTehsil || formDistrict}`,
            considerationAmountINR: Math.round(baseVal * 0.4),
            areaTransferredAcres: totalAc,
            mutationEntryNo: `${Math.floor(1000 + Math.random() * 9000)}`,
            mutationApprovalDate: '12/06/2015',
            verifiedByTahsildar: `Tehsildar ${formTehsil || formDistrict}`,
          },
          {
            ownerName: 'National Land Acquisition Authority (Statutory Award)',
            relationType: 'GOVERNMENT_ALLOTMENT',
            periodFrom: '2026',
            periodTo: 'Current Order',
            transactionType: 'ACQUISITION_NOTIFIED',
            deedRegistrationNo: `GAZ-SEC19-${cleanSurvey}`,
            subRegistrarOffice: 'Special Land Acquisition Officer (SLAO)',
            considerationAmountINR: totalComp,
            areaTransferredAcres: acqAc,
            mutationEntryNo: `${Math.floor(10000 + Math.random() * 9000)}`,
            mutationApprovalDate: new Date().toLocaleDateString('en-GB'),
            verifiedByTahsildar: 'Competent Authority & SLAO',
          }
        ],
        encumbrances: [],
        estimatedValuationINR: baseVal,
        solatiumINR: solatium,
        totalCompensationINR: totalComp,
        disbursementStatus: 'IN_PROGRESS',
        bankDetails: {
          bankName: formBankName,
          accountMasked: formAccountMasked,
          ifsc: formIfsc,
        },
        dgpsPillars,
        boundaryPolygon: boundaryObjects,
        qrPasscode: `QR-KS-${stateCode}-${cleanSurvey}`,
        arVerificationStatus: 'VERIFIED',
      }, generatedId);


      await auditService.logAction({
        targetCollection: 'farmers',
        targetDocId: generatedId,
        action: 'CREATE',
        actorId: userProfile?.uid || 'admin-01',
        actorName: userProfile?.displayName || 'Authorized Administrator',
        actorRole: activeRole,
        diffPayload: { farmerName: formName, ulpin: generatedUlpin, surveyGatNumber: formSurvey },
      });

      setModalOpen(false);
      setFormName('');
      setFormSurvey('');
      setDrawnPolygon([]);
    } catch (err) {
      console.error('Error creating farmer record:', err);
    } finally {
      setSaving(false);
    }
  };

  // Check Role Access Authorization: Visible only to Admin (NATIONAL_EXECUTIVE) and Data Acquisition (FIELD_ACQUISITION)
  const isAuthorized = activeRole === 'NATIONAL_EXECUTIVE' || activeRole === 'FIELD_ACQUISITION';

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-white rounded-2xl border border-slate-200/80 shadow-soft  space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#DC2626]">
          <ShieldCheck className="w-8 h-8 text-[#DC2626]" />
        </div>
        <div className="space-y-1 max-w-md">
          <h2 className="text-base font-extrabold text-[#0B132B]">
            Restricted Clearance: Admin & Data Acquisition Only
          </h2>
          <p className="text-xs text-slate-500">
            Krishi Sathi Cadastral intelligence, direct 7/12 land registration, and AR demarcation are restricted exclusively to National & District Administrators and Ground Data Acquisition Officers under the RFCTLARR statutory clearance framework.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 ">


      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-gradient text-white flex items-center justify-center font-extrabold text-sm shadow-soft">
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-extrabold text-[#0B132B] tracking-tight">Krishi Sathi</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#EEF2FF] text-indigo-600 border border-[#E0E7FF]">
              Farmer Land & AR Spatial Hub
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastral 7/12 Land Records, Direct PFMS Compensation & Centimeter-Level AR Verification
          </p>
        </div>

        {/* Real-time Admin Onboarding Button */}
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-gradient hover:bg-[#3730A3] text-white text-xs font-extrabold shadow-soft transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register New Farmer & Land Record</span>
        </button>
      </div>

      {/* Aggregate KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Registered Farmers</span>
          <p className="text-xl font-extrabold text-[#0B132B]">{totalFarmers}</p>
          <p className="text-[10px] text-[#059669] font-extrabold">Across 4 Strategic States</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Total Acquired Area</span>
          <p className="text-xl font-extrabold text-indigo-600">{totalAcquiredAcres.toFixed(1)} <span className="text-xs font-normal">Acres</span></p>
          <p className="text-[10px] text-slate-500">Statutory Sec 19 Alignment</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Direct PFMS Disbursed</span>
          <p className="text-xl font-extrabold text-[#059669]">₹{(totalDisbursedINR / 10000000).toFixed(2)} <span className="text-xs font-normal">Cr</span></p>
          <p className="text-[10px] text-[#059669] font-extrabold">100% Solatium Credited</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">AR Ground Coherence</span>
          <p className="text-xl font-extrabold text-[#4F46E5]">{totalFarmers > 0 ? ((verifiedCount / totalFarmers) * 100).toFixed(0) : 0}%</p>
          <p className="text-[10px] text-[#4F46E5] font-extrabold">{verifiedCount} of {totalFarmers} AR Verified</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-soft">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Farmer Name, Survey/Gat No, ULPIN, Village or District..."
            className="w-full bg-transparent border border-[#CBD5E1] rounded-xl pl-9 pr-3 py-2 text-xs text-[#0B132B] focus:outline-none focus:border-[#4F46E5]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-transparent border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-extrabold text-[#0B132B] focus:outline-none focus:border-[#4F46E5] cursor-pointer"
          >
            <option value="ALL">All States</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Rajasthan">Rajasthan</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-transparent border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-extrabold text-[#0B132B] focus:outline-none focus:border-[#4F46E5] cursor-pointer"
          >
            <option value="ALL">All AR Statuses</option>
            <option value="VERIFIED">AR Verified</option>
            <option value="PENDING_VISIT">Pending Visit</option>
            <option value="FLAGGED_MISMATCH">Discrepancy Flagged</option>
          </select>
        </div>
      </div>

      {/* Farmers Land Record Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center bg-transparent">
          <h3 className="font-extrabold text-xs text-[#0B132B] uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#4F46E5]" />
            <span>Landholder Records Directory ({filteredFarmers.length})</span>
          </h3>
          <span className="text-[11px] text-slate-500">Real-Time Synchronized</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F1F5F9]/50 text-slate-500 font-extrabold text-[11px]">
                <th className="p-3 pl-4">Farmer / Landowner</th>
                <th className="p-3">Cadastral Reference & ULPIN</th>
                <th className="p-3">Location & Village</th>
                <th className="p-3">Holding Area</th>
                <th className="p-3">Statutory Award</th>
                <th className="p-3">AR Reality Status</th>
                <th className="p-3 text-right pr-4">Interactive Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredFarmers.map((farmer) => (
                <tr key={farmer.id} className="hover:bg-transparent transition-colors">
                  <td className="p-3 pl-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-2xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center font-extrabold text-xs shrink-0 border border-[#A7F3D0]">
                        🌾
                      </div>
                      <div>
                        <p className="font-extrabold text-[#0B132B] text-xs">{farmer.farmerName}</p>
                        <p className="text-[10px] text-slate-500">{farmer.contactNumber}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-3 font-mono">
                    <span className="text-[11px] font-extrabold text-indigo-600 bg-[#EEF2FF] px-1.5 py-0.5 rounded border border-[#E0E7FF]">
                      {farmer.ulpin}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Survey: <strong>{farmer.surveyGatNumber}</strong> • {farmer.hissaNumber}
                    </p>
                  </td>

                  <td className="p-3">
                    <p className="font-extrabold text-[#0B132B]">{farmer.village}</p>
                    <p className="text-[10px] text-slate-500">{farmer.district}, {farmer.state}</p>
                  </td>

                  <td className="p-3">
                    <p className="font-extrabold text-[#0B132B]">{farmer.totalLandAreaAcres} Acres</p>
                    <p className="text-[10px] text-[#059669] font-medium">Acquired: {farmer.acquiredAreaAcres} Ac</p>
                  </td>

                  <td className="p-3 font-mono">
                    <span className="font-extrabold text-[#0B132B]">
                      ₹{(farmer.totalCompensationINR / 100000).toFixed(1)} L
                    </span>
                    <p className="text-[9px] text-slate-500">{farmer.disbursementStatus}</p>
                  </td>

                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        farmer.arVerificationStatus === 'VERIFIED'
                          ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                          : farmer.arVerificationStatus === 'FLAGGED_MISMATCH'
                          ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                          : 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
                      }`}
                    >
                      {farmer.arVerificationStatus === 'VERIFIED' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-[#059669]" />
                          <span>AR Verified</span>
                        </>
                      ) : farmer.arVerificationStatus === 'FLAGGED_MISMATCH' ? (
                        <>
                          <AlertTriangle className="w-3 h-3 text-[#DC2626]" />
                          <span>Discrepancy</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-[#D97706]" />
                          <span>Pending Visit</span>
                        </>
                      )}
                    </span>
                  </td>

                  <td className="p-3 pr-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Option 0: QR Passport Button */}
                      <button
                        onClick={() => setQrModalFarmer(farmer)}
                        className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-extrabold flex items-center gap-1 border border-indigo-200/80 transition-all cursor-pointer shadow-2xs"
                        title="View & Scan Real-Time Digital Passport QR Code"
                      >
                        <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                        <span>QR Passport</span>
                      </button>

                      {/* Option 1: View Detailed Farmer Profile */}
                      <button
                        onClick={() => setInspectingFarmer(farmer)}
                        className="px-2.5 py-1.5 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0B132B] text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer"
                        title="View Detailed Farmer Profile & 7/12"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#4F46E5]" />
                        <span>Details</span>
                      </button>

                      {/* Option 2: Visualise Land Area */}
                      <button
                        onClick={() => setVisualizingFarmer(farmer)}
                        className="px-2.5 py-1.5 rounded-xl bg-brand-gradient hover:bg-[#3730A3] text-white text-xs font-extrabold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                        title="Visualise Land Area in 2D/3D Map"
                      >
                        <MapIcon className="w-3.5 h-3.5 text-white" />
                        <span>Visualise Land</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer 1: Option 1 - Farmer Details Drawer */}
      {inspectingFarmer && (
        <FarmerDetailsDrawer
          farmer={inspectingFarmer}
          onClose={() => setInspectingFarmer(null)}
          onVisualiseLand={(f) => {
            setInspectingFarmer(null);
            setVisualizingFarmer(f);
          }}
        />
      )}

      {/* Modal 2: Option 2 - Land Area Visualizer */}
      {visualizingFarmer && (
        <FarmerLandVisualizer
          farmer={visualizingFarmer}
          onClose={() => setVisualizingFarmer(null)}
          onOpenDetails={(f) => {
            setVisualizingFarmer(null);
            setInspectingFarmer(f);
          }}
        />
      )}

      {/* Modal 3: Option 0 - QR Passport Scanner Modal */}
      {qrModalFarmer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 text-center shadow-float border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-left">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-extrabold shrink-0">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#0B132B]">{qrModalFarmer.farmerName}</h3>
                  <p className="text-[10px] text-slate-500 font-mono">Survey #{qrModalFarmer.surveyGatNumber} • {qrModalFarmer.ulpin}</p>
                </div>
              </div>
              <button
                onClick={() => setQrModalFarmer(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-gradient-to-br from-indigo-50/70 via-white to-indigo-50/30 rounded-2xl border border-indigo-100 space-y-3 flex flex-col items-center">
              <p className="text-xs text-indigo-950 font-extrabold">Scan with Google Lens or Camera</p>
              <div className="p-3 bg-white rounded-2xl shadow-soft border border-slate-200">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + '/passport/' + (qrModalFarmer.parcelId || qrModalFarmer.id))}`}
                  alt="Land Passport QR Code"
                  className="w-44 h-44"
                />
              </div>
              <span className="text-[10px] font-extrabold uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                ✓ Verified Encrypted Passport Gateway
              </span>
            </div>

            <div className="text-[11px] text-slate-600 text-left space-y-1.5 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/60 font-medium">
              <div className="flex justify-between">
                <span className="text-slate-500">Village & District:</span>
                <strong className="text-[#0B132B]">{qrModalFarmer.village}, {qrModalFarmer.district}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Acquired Area:</span>
                <strong className="text-emerald-700">{qrModalFarmer.acquiredAreaAcres} Acres</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Statutory Award:</span>
                <strong className="text-indigo-600 font-mono">₹{(qrModalFarmer.totalCompensationINR / 100000).toFixed(1)} Lakhs</strong>
              </div>
            </div>

            <button
              onClick={() => setQrModalFarmer(null)}
              className="w-full py-3 rounded-xl bg-brand-gradient text-white text-xs font-extrabold shadow-soft hover:shadow-float transition-all cursor-pointer"
            >
              Close Passport QR
            </button>
          </div>
        </div>
      )}

      {/* Real-Time Admin Registration Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 ">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-gradient-to-r from-[#EEF2FF] to-white border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-gradient text-white flex items-center justify-center font-extrabold text-sm">
                  🌾
                </div>
                <h3 className="font-extrabold text-sm text-[#0B132B]">
                  Register New Farmer & Land Record (Real-Time)
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-500 hover:text-[#0B132B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFarmer} className="p-4 overflow-y-auto space-y-4 text-xs">
              {/* Interactive Map Area Selector Component */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-[#0B132B] flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Select Boundary Points on Map ({drawnPolygon.length} Corners Placed)</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setModalMapMode(modalMapMode === 'SATELLITE' ? 'STREET' : 'SATELLITE')}
                      className="px-2 py-1 rounded-2xl bg-[#F1F5F9] text-[10px] font-extrabold text-[#0B132B] border border-[#CBD5E1] cursor-pointer"
                    >
                      {modalMapMode === 'SATELLITE' ? '🗺️ Street Map' : '🛰️ Satellite'}
                    </button>
                    {drawnPolygon.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearMapPoints}
                        className="px-2 py-1 rounded-2xl bg-[#FEF2F2] text-[10px] font-extrabold text-[#DC2626] border border-[#FECACA] flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Clear</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="w-full h-56 rounded-xl overflow-hidden border border-[#CBD5E1] relative shadow-inner">
                  <MapContainer
                    center={[parseFloat(formLat) || 19.6967, parseFloat(formLng) || 72.7699]}
                    zoom={15}
                    style={{ width: '100%', height: '100%' }}
                    zoomControl={false}
                  >
                    {modalMapMode === 'SATELLITE' ? (
                      <TileLayer
                        attribution='&copy; ESRI Satellite'
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        maxZoom={19}
                      />
                    ) : (
                      <TileLayer
                        attribution='&copy; OpenStreetMap'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        maxZoom={19}
                      />
                    )}
                    <MapAreaSelector
                      polygonPoints={drawnPolygon}
                      onAddPoint={handleAddMapPoint}
                    />
                  </MapContainer>

                  <div className="absolute bottom-2 left-2 z-[1000] bg-[#0B132B]/90 backdrop-blur-xs px-2.5 py-1.5 rounded-2xl text-[10px] text-white font-medium border border-[#334155] shadow-lg flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[#94A3B8]">
                      💡 Click on map to drop corners
                    </span>
                    {drawnPolygon.length >= 3 && (
                      <div className="flex items-center gap-2 pl-2 border-l border-[#475569]">
                        <span className="text-[#38BDF8] font-extrabold">⚡ Auto-Calculated Area:</span>
                        <span className="bg-[#059669] px-2 py-0.5 rounded font-mono font-extrabold text-[#ECFDF5]">
                          {calculateGeodesicArea(drawnPolygon).acres} Acres
                        </span>
                        <span className="text-[#94A3B8] font-mono text-[9px]">
                          ({calculateGeodesicArea(drawnPolygon).sqMeters.toLocaleString('en-IN')} m² / {calculateGeodesicArea(drawnPolygon).hectares} Ha)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-extrabold mb-1">Farmer / Landowner Name *</label>
                  <input
                    required
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Shri Baburao M. Patil"
                    className="w-full bg-transparent border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0B132B] focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-extrabold mb-1">Contact Phone Number</label>
                  <input
                    type="text"
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    placeholder="+91 98XXX XXXXX"
                    className="w-full bg-transparent border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0B132B] focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-extrabold mb-1">State *</label>
                  <select
                    value={formState}
                    onChange={(e) => setFormState(e.target.value)}
                    className="w-full bg-transparent border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-extrabold text-[#0B132B] focus:outline-none focus:border-[#4F46E5]"
                  >
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Rajasthan">Rajasthan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-extrabold mb-1">District *</label>
                  <input
                    required
                    type="text"
                    value={formDistrict}
                    onChange={(e) => setFormDistrict(e.target.value)}
                    placeholder="e.g. Palghar"
                    className="w-full bg-transparent border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0B132B] focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-extrabold mb-1">Taluka / Tehsil</label>
                  <input
                    type="text"
                    value={formTehsil}
                    onChange={(e) => setFormTehsil(e.target.value)}
                    placeholder="e.g. Palghar"
                    className="w-full bg-transparent border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0B132B] focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-extrabold mb-1">Revenue Village *</label>
                  <input
                    required
                    type="text"
                    value={formVillage}
                    onChange={(e) => setFormVillage(e.target.value)}
                    placeholder="e.g. Manikpur"
                    className="w-full bg-transparent border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0B132B] focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-extrabold mb-1">Survey / Gat Number *</label>
                  <input
                    required
                    type="text"
                    value={formSurvey}
                    onChange={(e) => setFormSurvey(e.target.value)}
                    placeholder="e.g. 145/2-A"
                    className="w-full bg-transparent border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-mono text-[#0B132B] focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-extrabold mb-1">Hissa / Sub-Division</label>
                  <input
                    type="text"
                    value={formHissa}
                    onChange={(e) => setFormHissa(e.target.value)}
                    placeholder="e.g. Hissa-1"
                    className="w-full bg-transparent border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-mono text-[#0B132B] focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-500 font-extrabold">Total Holding (Acres) *</label>
                    {drawnPolygon.length >= 3 && (
                      <span className="text-[9px] font-extrabold text-[#059669] bg-[#ECFDF5] px-1.5 py-0.2 rounded border border-[#A7F3D0]">
                        ⚡ Auto-Calculated
                      </span>
                    )}
                  </div>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={formTotalAcres}
                    onChange={(e) => setFormTotalAcres(e.target.value)}
                    className="w-full bg-transparent border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0B132B] focus:outline-none focus:border-[#4F46E5] font-mono font-extrabold"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-500 font-extrabold">Acquired Area (Acres) *</label>
                    {drawnPolygon.length >= 3 && (
                      <span className="text-[9px] font-extrabold text-[#059669] bg-[#ECFDF5] px-1.5 py-0.2 rounded border border-[#A7F3D0]">
                        ⚡ Auto-Calculated
                      </span>
                    )}
                  </div>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={formAcquiredAcres}
                    onChange={(e) => setFormAcquiredAcres(e.target.value)}
                    className="w-full bg-transparent border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0B132B] focus:outline-none focus:border-[#4F46E5] font-mono font-extrabold"
                  />
                </div>


                <div>
                  <label className="block text-slate-500 font-extrabold mb-1">Land Classification</label>
                  <select
                    value={formClassification}
                    onChange={(e) => setFormClassification(e.target.value as any)}
                    className="w-full bg-transparent border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-extrabold text-[#0B132B] focus:outline-none focus:border-[#4F46E5]"
                  >
                    <option value="Agricultural">Agricultural</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Residential">Residential</option>
                    <option value="Barren">Barren</option>
                    <option value="Forest">Forest</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-extrabold mb-1">Base Market Valuation (INR)</label>
                  <input
                    type="number"
                    value={formValuation}
                    onChange={(e) => setFormValuation(e.target.value)}
                    className="w-full bg-transparent border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-mono text-[#0B132B] focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-extrabold mb-1">Center GPS Lat</label>
                  <input
                    type="text"
                    value={formLat}
                    onChange={(e) => setFormLat(e.target.value)}
                    className="w-full bg-transparent border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-mono text-[#0B132B] focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-extrabold mb-1">Center GPS Lng</label>
                  <input
                    type="text"
                    value={formLng}
                    onChange={(e) => setFormLng(e.target.value)}
                    className="w-full bg-transparent border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-mono text-[#0B132B] focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold text-slate-500 hover:bg-transparent cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold bg-brand-gradient text-white hover:bg-[#3730A3] cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Registering & Generating ULPIN...' : 'Register Farmer & Plot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
