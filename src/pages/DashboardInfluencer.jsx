import { useEffect, useRef, useState } from 'react';
import AvatarImage from '../components/AvatarImage';
import imageCompression from 'browser-image-compression';
import AvatarModal from '../components/AvatarModal';
import AdUploadModal from '../components/AdUploadModal';
import { apiClient } from '../utils/apiClient';
import { logger } from '../utils/logger';
import { useCurrency, formatPrice } from '../utils/useCurrency';

export default function DashboardInfluencer(){
  const [data, setData] = useState(null);
  const [me, setMe] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAvatarEdit, setShowAvatarEdit] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [media, setMedia] = useState([]);
  const [activeUnmute, setActiveUnmute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const hasToken = !!(localStorage.getItem('auth.token'));
  const currency = useCurrency();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState('');
  const [adThumbUploading, setAdThumbUploading] = useState(false);
  const [adThumbFileName, setAdThumbFileName] = useState('');
  const [showAdUpload, setShowAdUpload] = useState(false);
  const [adVideoFile, setAdVideoFile] = useState(null);
  const [adTitle, setAdTitle] = useState('');
  const [adDescription, setAdDescription] = useState('');
  const [adCaption, setAdCaption] = useState('');
  const [adThumbnailUrl, setAdThumbnailUrl] = useState('');
  const [adCategory, setAdCategory] = useState('');
  const [adCategoryCode, setAdCategoryCode] = useState('');
  const [adPosting, setAdPosting] = useState(false);
  const mediaRowRef = useRef(null);
  const [deletingGuid, setDeletingGuid] = useState('');

  // KYC
  const [kycLoading, setKycLoading] = useState(false);
  const [kycSaving, setKycSaving] = useState(false);
  const [kycData, setKycData] = useState(null);
  const [kycMessage, setKycMessage] = useState('');
  const [kycError, setKycError] = useState('');
  const [kycUploading, setKycUploading] = useState({ photoUrl: false, panPhotoUrl: false, aadhaarPhotoUrl: false });
  const [kycEditMode, setKycEditMode] = useState(false);
  const [kycForm, setKycForm] = useState({
    fullName: '',
    dob: '',
    pan: '',
    aadhaarNumber: '',
    addressLine1: '',
    addressLine2: '',
    postalCode: '',
    city: '',
    state: '',
    country: 'India',
    photoUrl: '',
    panPhotoUrl: '',
    aadhaarPhotoUrl: '',
    consent: false,
  });

  // Payments
  const [payLoading, setPayLoading] = useState(false);
  const [paySaving, setPaySaving] = useState(false);
  const [payItems, setPayItems] = useState([]);
  const [payMessage, setPayMessage] = useState('');
  const [payError, setPayError] = useState('');
  const [payForm, setPayForm] = useState({
    type: 'bank',
    accountHolderName: '',
    bankName: '',
    bankIfsc: '',
    bankAccountNumber: '',
    upiId: '',
    isPreferred: true,
  });

  // Ads budget / Pricing
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingSaving, setPricingSaving] = useState(false);
  const [pricingData, setPricingData] = useState(null);
  const [pricingMessage, setPricingMessage] = useState('');
  const [pricingError, setPricingError] = useState('');
  const [pricingItems, setPricingItems] = useState([]); // [{ name, amount }]
  const [pricingNegotiable, setPricingNegotiable] = useState(true);
  const [pricingNotes, setPricingNotes] = useState('');
  const [pricingNewType, setPricingNewType] = useState('Reel Ad');
  const [pricingOtherName, setPricingOtherName] = useState('');
  const [pricingNewAmount, setPricingNewAmount] = useState('');

  // Photoshoot requests
  const [psLoading, setPsLoading] = useState(false);
  const [psError, setPsError] = useState('');
  const [psMessage, setPsMessage] = useState('');
  const [psTotal, setPsTotal] = useState(0);
  const [psLimit, setPsLimit] = useState(20);
  const [psOffset, setPsOffset] = useState(0);
  const [psItems, setPsItems] = useState([]);
  const [psBooking, setPsBooking] = useState(false);
  const [psBookError, setPsBookError] = useState('');
  const [psBookMessage, setPsBookMessage] = useState('');
  const [psBookForm, setPsBookForm] = useState({
    requestedTimezone: 'Asia/Kolkata',
    requestedStartAtLocal: '',
    requestedEndAtLocal: '',
    influencerAppointmentDetails: {
      personal: {
        fullName: '',
        city: '',
        gender: '',
        bodyType: '',
        skinTone: '',
      },
      bodyMeasurements: {
        heightCm: '',
        shoeSize: '',
      },
      dressDetails: {
        topSize: '',
        bottomSize: '',
        dressSize: '',
        preferredFit: '',
        preferredDressingStyleCsv: '',
        westernWearTypeCsv: '',
        preferredOutfitColorsCsv: '',
      },
      shootPreferences: {
        shootStyleCsv: '',
        poseComfortLevel: '',
        boldnessLevel: '',
        sleevelessAllowed: true,
        cameraFacingComfort: true,
        shootTypeCsv: '',
      },
      stylingPermissions: {
        makeupPreference: '',
        accessoriesAllowed: true,
      },
      editingAndUsage: {
        usagePermissionCsv: '',
        photoshopBrandingAllowed: true,
      },
      consent: {
        publicDisplayConsent: true,
        termsAccepted: true,
        date: new Date().toISOString().slice(0, 10),
      },
    },
  });

  // Referral
  const [refSummaryLoading, setRefSummaryLoading] = useState(false);
  const [refLedgerLoading, setRefLedgerLoading] = useState(false);
  const [refInviteLoading, setRefInviteLoading] = useState(false);
  const [refApplyLoading, setRefApplyLoading] = useState(false);
  const [refError, setRefError] = useState('');
  const [refMessage, setRefMessage] = useState('');
  const [refSummary, setRefSummary] = useState(null);
  const [refLedger, setRefLedger] = useState({ total: 0, limit: 20, offset: 0, items: [] });
  const [refInviteForm, setRefInviteForm] = useState({ phone: '', receiverName: '' });
  const [refInviteResult, setRefInviteResult] = useState(null);
  const [refApplyCode, setRefApplyCode] = useState('');
  const pendingReferralApplyOnceRef = useRef(false);

  // Social reach (followers + links)
  const [reachSaving, setReachSaving] = useState(false);
  const [reachMessage, setReachMessage] = useState('');
  const [reachError, setReachError] = useState('');
  const reachInitializedRef = useRef(false);
  const [reachForm, setReachForm] = useState({
    followers: {
      instagram: '',
      youtube: '',
      tiktok: '',
      facebook: '',
      x: '',
      snapchat: '',
      linkedin: '',
      pinterest: '',
      threads: '',
      telegram: '',
      websiteMonthlyVisitors: '',
      engagementRate: '',
    },
    socialLinks: {
      instagram: '',
      youtube: '',
      tiktok: '',
      facebook: '',
      x: '',
      snapchat: '',
      linkedin: '',
      pinterest: '',
      threads: '',
      telegram: '',
      website: '',
    },
  });

  const [showAllProfile, setShowAllProfile] = useState(false);

  const scrollMediaRow = (dir) => {
    const el = mediaRowRef.current;
    if (!el) return;
    const amount = Math.max(260, Math.floor(el.clientWidth * 0.9));
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  useEffect(() => {
    // Redirect unauthenticated users to Login
    if (!hasToken) {
      setLoading(false);
      setError('You need to sign in to view your dashboard.');
      // preserve next
      const next = '/dashboard-influencer';
      setTimeout(() => { window.location.href = `/login?next=${encodeURIComponent(next)}`; }, 500);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const [dash, profile, mediaList] = await Promise.all([
          apiClient.request('/influencers/dashboard'),
          apiClient.request('/influencers/me'),
          apiClient.request('/influencers/me/ads/media?page=1&limit=12')
        ]);
        if (mounted) {
          setData(dash);
          setMe(profile);
          const arr = Array.isArray(mediaList) ? mediaList : [];
          setMedia(arr);
        }

        // If a referral code was stashed pre-login, try applying it once.
        if (!pendingReferralApplyOnceRef.current) {
          pendingReferralApplyOnceRef.current = true;
          const pendingCodeRaw = (() => {
            try { return localStorage.getItem('pending_referral_code'); } catch { return ''; }
          })();
          const pendingCode = normalizeReferralCode(pendingCodeRaw);
          if (pendingCode) {
            try {
              await apiClient.request('/influencers/me/referral/apply', {
                method: 'POST',
                body: JSON.stringify({ code: pendingCode }),
              });
              try { localStorage.removeItem('pending_referral_code'); } catch {}
              setRefMessage('Referral code applied successfully.');
              loadReferralSummary().catch(() => {});
              loadReferralLedger({ limit: refLedger?.limit || 20, offset: 0 }).catch(() => {});
            } catch (e) {
              // Keep the pending code so user can retry manually.
              setRefApplyCode(pendingCode);
              setRefError(e?.message || 'Failed to apply referral code.');
            }
          }
        }

        // Prefetch compliance summaries so the top card can show status chips.
        // These only update state; full forms remain in tabs.
        loadKyc().catch(() => {});
        loadPayments().catch(() => {});
        loadPricing().catch(() => {});
      } catch (e) {
        logger.error('Dashboard load error:', e);
        const msg = typeof e?.message === 'string' ? e.message : 'Failed to load dashboard.';
        if (mounted) setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  async function loadPhotoshootRequests(next = {}) {
    const limit = Number.isFinite(Number(next.limit)) ? Number(next.limit) : psLimit;
    const offset = Number.isFinite(Number(next.offset)) ? Number(next.offset) : psOffset;
    setPsLoading(true);
    setPsError('');
    setPsMessage('');
    try {
      const qs = new URLSearchParams({ limit: String(limit), offset: String(offset) });
      const res = await apiClient.request(`/influencers/me/photoshoots/requests?${qs.toString()}`, { method: 'GET' });
      setPsTotal(Number(res?.total) || 0);
      setPsLimit(Number(res?.limit) || limit);
      setPsOffset(Number(res?.offset) || offset);
      setPsItems(Array.isArray(res?.items) ? res.items : []);
    } catch (e) {
      setPsError(e?.message || 'Failed to load photoshoot requests.');
    } finally {
      setPsLoading(false);
    }
  }

  async function bookLatestPhotoshoot() {
    setPsBooking(true);
    setPsBookError('');
    setPsBookMessage('');
    try {
      const toIsoOrNull = (local) => {
        const t = (local || '').toString().trim();
        if (!t) return null;
        const d = new Date(t);
        if (Number.isNaN(d.getTime())) return null;
        return d.toISOString();
      };
      const csvToArr = (v) => {
        const t = (v || '').toString().trim();
        if (!t) return [];
        return t.split(',').map((x) => x.trim()).filter(Boolean);
      };
      const toNumOrUndef = (v) => {
        const n = Number((v || '').toString().trim());
        if (!Number.isFinite(n)) return undefined;
        return n;
      };

      const requestedStartAt = toIsoOrNull(psBookForm.requestedStartAtLocal);
      const requestedEndAt = toIsoOrNull(psBookForm.requestedEndAtLocal);
      if (!requestedStartAt || !requestedEndAt) {
        throw new Error('Please select requested start and end time.');
      }

      const d = psBookForm.influencerAppointmentDetails;
      const payload = {
        requestedTimezone: (psBookForm.requestedTimezone || 'Asia/Kolkata').toString(),
        requestedStartAt,
        requestedEndAt,
        details: {
          influencerAppointmentDetails: {
            personal: {
              fullName: (d.personal.fullName || '').toString(),
              city: (d.personal.city || '').toString(),
              gender: (d.personal.gender || '').toString(),
              bodyType: (d.personal.bodyType || '').toString(),
              skinTone: (d.personal.skinTone || '').toString(),
            },
            bodyMeasurements: {
              heightCm: toNumOrUndef(d.bodyMeasurements.heightCm),
              shoeSize: toNumOrUndef(d.bodyMeasurements.shoeSize),
            },
            dressDetails: {
              topSize: (d.dressDetails.topSize || '').toString(),
              bottomSize: (d.dressDetails.bottomSize || '').toString(),
              dressSize: (d.dressDetails.dressSize || '').toString(),
              preferredFit: (d.dressDetails.preferredFit || '').toString(),
              preferredDressingStyle: csvToArr(d.dressDetails.preferredDressingStyleCsv),
              westernWearType: csvToArr(d.dressDetails.westernWearTypeCsv),
              preferredOutfitColors: csvToArr(d.dressDetails.preferredOutfitColorsCsv),
            },
            shootPreferences: {
              shootStyle: csvToArr(d.shootPreferences.shootStyleCsv),
              poseComfortLevel: (d.shootPreferences.poseComfortLevel || '').toString(),
              boldnessLevel: (d.shootPreferences.boldnessLevel || '').toString(),
              sleevelessAllowed: !!d.shootPreferences.sleevelessAllowed,
              cameraFacingComfort: !!d.shootPreferences.cameraFacingComfort,
              shootType: csvToArr(d.shootPreferences.shootTypeCsv),
            },
            stylingPermissions: {
              makeupPreference: (d.stylingPermissions.makeupPreference || '').toString(),
              accessoriesAllowed: !!d.stylingPermissions.accessoriesAllowed,
            },
            editingAndUsage: {
              usagePermission: csvToArr(d.editingAndUsage.usagePermissionCsv),
              photoshopBrandingAllowed: !!d.editingAndUsage.photoshopBrandingAllowed,
            },
            consent: {
              publicDisplayConsent: !!d.consent.publicDisplayConsent,
              termsAccepted: !!d.consent.termsAccepted,
              date: (d.consent.date || '').toString(),
            },
          },
        },
      };

      await apiClient.request('/influencers/me/photoshoots/requests/book-latest', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setPsBookMessage('Photoshoot request submitted.');
      await loadPhotoshootRequests({ limit: psLimit, offset: 0 });
    } catch (e) {
      setPsBookError(e?.message || 'Failed to book photoshoot.');
    } finally {
      setPsBooking(false);
    }
  }

  function normalizePhoneDigits(value) {
    const digits = (value || '').toString().replace(/[^0-9]/g, '');
    // Frontend rule (India default): if user enters 10 digits, send as-is.
    if (digits.length === 10) return digits;
    return digits;
  }

  function normalizeReferralCode(value) {
    return (value || '').toString().trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16);
  }

  async function loadReferralSummary() {
    setRefSummaryLoading(true);
    setRefError('');
    setRefMessage('');
    try {
      const res = await apiClient.request('/influencers/me/referral', { method: 'GET' });
      setRefSummary(res || null);
    } catch (e) {
      setRefError(e?.message || 'Failed to load referral info.');
    } finally {
      setRefSummaryLoading(false);
    }
  }

  async function loadReferralLedger(next = {}) {
    const limit = Number.isFinite(Number(next.limit)) ? Number(next.limit) : (Number(refLedger?.limit) || 20);
    const offset = Number.isFinite(Number(next.offset)) ? Number(next.offset) : (Number(refLedger?.offset) || 0);
    setRefLedgerLoading(true);
    setRefError('');
    setRefMessage('');
    try {
      const qs = new URLSearchParams({ limit: String(limit), offset: String(offset) });
      const res = await apiClient.request(`/influencers/me/referral/ledger?${qs.toString()}`, { method: 'GET' });
      setRefLedger({
        total: Number(res?.total) || 0,
        limit: Number(res?.limit) || limit,
        offset: Number(res?.offset) || offset,
        items: Array.isArray(res?.items) ? res.items : [],
      });
    } catch (e) {
      setRefError(e?.message || 'Failed to load referral ledger.');
    } finally {
      setRefLedgerLoading(false);
    }
  }

  async function inviteReferral() {
    setRefInviteLoading(true);
    setRefError('');
    setRefMessage('');
    try {
      const phone = normalizePhoneDigits(refInviteForm.phone);
      const receiverName = (refInviteForm.receiverName || '').toString().trim();
      if (!phone) throw new Error('Please enter mobile number.');
      if (!receiverName) throw new Error('Please enter name.');

      const res = await apiClient.request('/influencers/me/referral/invite', {
        method: 'POST',
        body: JSON.stringify({ phone, receiverName }),
      });
      setRefInviteResult(res || null);
      setRefMessage('Invite sent successfully.');
      // Refresh summary/ledger to show changes if any.
      loadReferralSummary().catch(() => {});
      loadReferralLedger({ limit: refLedger?.limit || 20, offset: 0 }).catch(() => {});
    } catch (e) {
      setRefError(e?.message || 'Failed to send invite.');
    } finally {
      setRefInviteLoading(false);
    }
  }

  async function applyReferral() {
    setRefApplyLoading(true);
    setRefError('');
    setRefMessage('');
    try {
      const code = normalizeReferralCode(refApplyCode);
      if (!code) throw new Error('Please enter referral code.');
      await apiClient.request('/influencers/me/referral/apply', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
      setRefMessage('Referral code applied successfully.');
      loadReferralSummary().catch(() => {});
      loadReferralLedger({ limit: refLedger?.limit || 20, offset: 0 }).catch(() => {});
    } catch (e) {
      setRefError(e?.message || 'Failed to apply referral code.');
    } finally {
      setRefApplyLoading(false);
    }
  }

  useEffect(() => {
    // Initialize Social Reach form once from server profile.
    if (!me || reachInitializedRef.current) return;
    const f = (me?.followers && typeof me.followers === 'object') ? me.followers : {};
    const s = (me?.socialLinks && typeof me.socialLinks === 'object') ? me.socialLinks : {};
    setReachForm({
      followers: {
        instagram: f.instagram != null ? String(f.instagram) : '',
        youtube: f.youtube != null ? String(f.youtube) : '',
        tiktok: f.tiktok != null ? String(f.tiktok) : '',
        facebook: f.facebook != null ? String(f.facebook) : '',
        x: f.x != null ? String(f.x) : '',
        snapchat: f.snapchat != null ? String(f.snapchat) : '',
        linkedin: f.linkedin != null ? String(f.linkedin) : '',
        pinterest: f.pinterest != null ? String(f.pinterest) : '',
        threads: f.threads != null ? String(f.threads) : '',
        telegram: f.telegram != null ? String(f.telegram) : '',
        websiteMonthlyVisitors: f.websiteMonthlyVisitors != null ? String(f.websiteMonthlyVisitors) : '',
        engagementRate: f.engagementRate != null ? String(f.engagementRate) : '',
      },
      socialLinks: {
        instagram: s.instagram != null ? String(s.instagram) : '',
        youtube: s.youtube != null ? String(s.youtube) : '',
        tiktok: s.tiktok != null ? String(s.tiktok) : '',
        facebook: s.facebook != null ? String(s.facebook) : '',
        x: s.x != null ? String(s.x) : '',
        snapchat: s.snapchat != null ? String(s.snapchat) : '',
        linkedin: s.linkedin != null ? String(s.linkedin) : '',
        pinterest: s.pinterest != null ? String(s.pinterest) : '',
        threads: s.threads != null ? String(s.threads) : '',
        telegram: s.telegram != null ? String(s.telegram) : '',
        website: s.website != null ? String(s.website) : '',
      },
    });
    reachInitializedRef.current = true;
  }, [me]);

  async function saveReach() {
    setReachSaving(true);
    setReachError('');
    setReachMessage('');
    try {
      const toNonNegativeInt = (v) => {
        const n = Number(String(v || '').replace(/[^0-9]/g, ''));
        if (!Number.isFinite(n)) return undefined;
        if (n < 0) return undefined;
        return Math.floor(n);
      };
      const toNonNegativeFloat = (v) => {
        const n = Number(String(v || '').trim());
        if (!Number.isFinite(n)) return undefined;
        if (n < 0) return undefined;
        return n;
      };
      const trimOrUndef = (v) => {
        const t = (v || '').toString().trim();
        return t ? t : undefined;
      };

      const followers = {};
      const f = reachForm?.followers || {};
      const intKeys = ['instagram','youtube','tiktok','facebook','x','snapchat','linkedin','pinterest','threads','telegram','websiteMonthlyVisitors'];
      for (const k of intKeys) {
        const parsed = toNonNegativeInt(f[k]);
        if (parsed != null) followers[k] = parsed;
      }
      const er = toNonNegativeFloat(f.engagementRate);
      if (er != null) followers.engagementRate = er;

      const socialLinks = {};
      const s = reachForm?.socialLinks || {};
      const linkKeys = ['instagram','youtube','tiktok','facebook','x','snapchat','linkedin','pinterest','threads','telegram','website'];
      for (const k of linkKeys) {
        const t = trimOrUndef(s[k]);
        if (t != null) socialLinks[k] = t;
      }

      // Use a safe update payload (include commonly-used profile fields) so we don't accidentally wipe them.
      const countryId = me?.countryId || me?.country?.id;
      const stateIds = Array.isArray(me?.stateIds) ? me.stateIds : (me?.stateId != null ? [me.stateId] : []);
      const payload = {
        handle: me?.handle || '',
        bio: me?.bio || '',
        addressLine1: me?.addressLine1 || '',
        addressLine2: me?.addressLine2 || '',
        postalCode: me?.postalCode || '',
        countryId: countryId != null && String(countryId) !== '' ? Number(countryId) : undefined,
        stateIds: (stateIds || []).map((x) => Number(x)).filter((x) => Number.isFinite(x)),
        districtId: me?.districtId != null && String(me.districtId) !== '' ? Number(me.districtId) : undefined,
        languages: Array.isArray(me?.languages) ? me.languages : [],
        socialLinks: {
          ...(me?.socialLinks && typeof me.socialLinks === 'object' ? me.socialLinks : {}),
          ...socialLinks,
        },
        followers: {
          ...(me?.followers && typeof me.followers === 'object' ? me.followers : {}),
          ...followers,
        },
      };

      const res = await apiClient.request('/influencers/me', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setMe(res || me);
      setReachMessage('Social reach saved successfully.');
    } catch (e) {
      setReachError(e?.message || 'Failed to save social reach.');
    } finally {
      setReachSaving(false);
    }
  }

  async function loadKyc() {
    setKycLoading(true);
    setKycError('');
    setKycMessage('');
    try {
      const res = await apiClient.request('/influencers/me/kyc', { method: 'GET' });
      setKycData(res);
      const k = res?.kyc && typeof res.kyc === 'object' ? res.kyc : {};
      setKycForm((prev) => ({
        ...prev,
        fullName: k.fullName ?? prev.fullName,
        dob: (k.dob || '').slice(0, 10) || prev.dob,
        pan: k.pan ?? prev.pan,
        aadhaarNumber: k.aadhaarNumber ?? prev.aadhaarNumber,
        addressLine1: k.addressLine1 ?? prev.addressLine1,
        addressLine2: k.addressLine2 ?? prev.addressLine2,
        postalCode: k.postalCode ?? prev.postalCode,
        city: k.city ?? prev.city,
        state: k.state ?? prev.state,
        country: k.country ?? prev.country,
        photoUrl: k.photoUrl ?? prev.photoUrl,
        panPhotoUrl: k.panPhotoUrl ?? prev.panPhotoUrl,
        aadhaarPhotoUrl: k.aadhaarPhotoUrl ?? prev.aadhaarPhotoUrl,
        consent: !!(k.consent ?? prev.consent),
      }));
      // Always reset edit mode after a fresh fetch so the user sees server truth.
      setKycEditMode(false);
    } catch (e) {
      setKycError(e?.message || 'Failed to load KYC.');
    } finally {
      setKycLoading(false);
    }
  }

  async function uploadKycFile(field, file) {
    if (!file) return;
    setKycError('');
    setKycMessage('');
    setKycUploading((p) => ({ ...p, [field]: true }));
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await apiClient.request('/media/upload', { method: 'POST', body: form });
      const url = res?.url || res?.data?.url;
      if (!url) throw new Error('Upload succeeded but no URL returned');
      setKycForm((p) => ({ ...p, [field]: url }));
    } catch (e) {
      setKycError(e?.message || 'Failed to upload file.');
    } finally {
      setKycUploading((p) => ({ ...p, [field]: false }));
    }
  }

  async function saveKyc() {
    setKycSaving(true);
    setKycError('');
    setKycMessage('');
    try {
      if (!kycForm.consent) throw new Error('Consent is required to submit KYC.');
      const payload = {
        fullName: kycForm.fullName,
        dob: kycForm.dob,
        pan: kycForm.pan,
        aadhaarNumber: kycForm.aadhaarNumber,
        addressLine1: kycForm.addressLine1,
        addressLine2: kycForm.addressLine2,
        postalCode: kycForm.postalCode,
        city: kycForm.city,
        state: kycForm.state,
        country: kycForm.country,
        photoUrl: kycForm.photoUrl,
        panPhotoUrl: kycForm.panPhotoUrl,
        aadhaarPhotoUrl: kycForm.aadhaarPhotoUrl,
        consent: !!kycForm.consent,
      };
      await apiClient.request('/influencers/me/kyc', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setKycMessage('KYC submitted successfully.');
      await loadKyc();
    } catch (e) {
      setKycError(e?.message || 'Failed to submit KYC.');
    } finally {
      setKycSaving(false);
    }
  }

  async function loadPayments() {
    setPayLoading(true);
    setPayError('');
    setPayMessage('');
    try {
      const res = await apiClient.request('/influencers/me/payment-methods', { method: 'GET' });
      const items = Array.isArray(res?.items) ? res.items : [];
      setPayItems(items);
      const preferred = items.find((x) => x?.isPreferred) || items[0];
      if (preferred) {
        setPayForm((p) => ({
          ...p,
          type: preferred.type || p.type,
          accountHolderName: preferred.accountHolderName || p.accountHolderName,
          bankName: preferred.bankName || p.bankName,
          bankIfsc: preferred.bankIfsc || p.bankIfsc,
          bankAccountNumber: '',
          upiId: '',
          isPreferred: preferred.isPreferred ?? true,
        }));
      }
    } catch (e) {
      setPayError(e?.message || 'Failed to load payment methods.');
    } finally {
      setPayLoading(false);
    }
  }

  async function loadPricing() {
    setPricingLoading(true);
    setPricingError('');
    setPricingMessage('');
    try {
      const res = await apiClient.request('/influencers/me/pricing', { method: 'GET' });
      setPricingData(res);
      const adPricing = res?.adPricing && typeof res.adPricing === 'object' ? res.adPricing : {};
      const items = Object.entries(adPricing)
        .map(([name, amount]) => ({ name: String(name), amount: Number(amount) }))
        .filter((x) => x.name && Number.isFinite(x.amount));
      setPricingItems(items);
      setPricingNegotiable(res?.negotiable != null ? !!res.negotiable : true);
      setPricingNotes(typeof res?.notes === 'string' ? res.notes : '');
    } catch (e) {
      const msg = String(e?.message || 'Failed to load pricing.');
      // Treat 404 as "not set yet" to allow creating via POST.
      if (msg.includes('404')) {
        setPricingData(null);
        setPricingItems([]);
        setPricingNegotiable(true);
        setPricingNotes('');
      } else {
        setPricingError(msg);
      }
    } finally {
      setPricingLoading(false);
    }
  }

  async function savePricing() {
    setPricingSaving(true);
    setPricingError('');
    setPricingMessage('');
    try {
      const adPricing = {};
      for (const item of pricingItems) {
        const name = (item?.name || '').toString().trim();
        const amount = Number(item?.amount);
        if (!name) continue;
        if (!Number.isFinite(amount) || amount < 0) continue;
        adPricing[name] = amount;
      }
      const payload = {
        adPricing,
        negotiable: !!pricingNegotiable,
        currency: 'INR',
        notes: (pricingNotes || '').toString(),
      };

      const method = pricingData ? 'PUT' : 'POST';
      await apiClient.request('/influencers/me/pricing', { method, body: JSON.stringify(payload) });
      setPricingMessage('Pricing saved successfully.');
      await loadPricing();
    } catch (e) {
      setPricingError(e?.message || 'Failed to save pricing.');
    } finally {
      setPricingSaving(false);
    }
  }

  async function savePayment() {
    setPaySaving(true);
    setPayError('');
    setPayMessage('');
    try {
      const payload = {
        type: payForm.type,
        accountHolderName: payForm.accountHolderName,
        isPreferred: !!payForm.isPreferred,
      };
      if (payForm.type === 'bank') {
        Object.assign(payload, {
          bankName: payForm.bankName,
          bankIfsc: payForm.bankIfsc,
          bankAccountNumber: payForm.bankAccountNumber,
        });
      } else {
        Object.assign(payload, {
          upiId: payForm.upiId,
        });
      }
      await apiClient.request('/influencers/me/payment-methods', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setPayMessage('Payment method saved.');
      await loadPayments();
    } catch (e) {
      setPayError(e?.message || 'Failed to save payment method.');
    } finally {
      setPaySaving(false);
    }
  }

  useEffect(() => {
    if (activeTab === 'kyc' && !kycData && !kycLoading) {
      loadKyc();
    }
    if (activeTab === 'payments' && payItems.length === 0 && !payLoading) {
      loadPayments();
    }
  }, [activeTab]);

  const metrics = data?.metrics;
  const briefs = data?.briefs?.items || [];
  const payouts = data?.payouts?.history || [];
  const nextPayout = data?.metrics?.nextPayout || data?.payouts?.nextPayout;
  const calendarDays = data?.calendar?.days || [];
  const photo = me?.profilePicUrl;
  const handle = me?.handle;
  const verified = me?.verificationStatus === 'green-tick';
  const badges = Array.isArray(me?.badges) ? me.badges : [];

  const LEVELS = [
    {
      key: 'ready',
      label: 'Ready',
      pill: 'bg-green-50 text-green-700 ring-1 ring-green-200',
      card: 'bg-green-50/40 ring-1 ring-green-200',
      accent: 'text-green-700',
    },
    {
      key: 'fit',
      label: 'Fit',
      pill: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
      card: 'bg-blue-50/40 ring-1 ring-blue-200',
      accent: 'text-blue-700',
    },
    {
      key: 'pro',
      label: 'Pro',
      pill: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
      card: 'bg-purple-50/40 ring-1 ring-purple-200',
      accent: 'text-purple-700',
    },
    {
      key: 'prime',
      label: 'Prime',
      pill: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
      card: 'bg-orange-50/40 ring-1 ring-orange-200',
      accent: 'text-orange-700',
    },
    {
      key: 'elite',
      label: 'Elite',
      pill: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
      card: 'bg-amber-50/50 ring-1 ring-amber-200',
      accent: 'text-amber-800',
    },
  ];

  const badgeKeySet = new Set(
    (badges || [])
      .map((b) => (b || '').toString().trim().toLowerCase())
      .filter(Boolean)
  );
  // Pick the highest tier present in badges; default to Ready for new users.
  const activeLevel = (
    [...LEVELS].reverse().find((l) => badgeKeySet.has(l.key) || badgeKeySet.has(l.label.toLowerCase())) || LEVELS[0]
  );

  const kycStatusKey = (kycData?.status || '').toString().trim().toLowerCase();
  const kycChip = (() => {
    const status = (kycData?.status || '').toString().toLowerCase();
    const complete = !!kycData?.meta?.isComplete;
    const ask = !!kycData?.meta?.askKyc;
    if (complete || status === 'verified' || status === 'approved') {
      return { label: 'KYC: Verified', short: 'Verified', cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' };
    }
    if (status === 'pending' || status === 'submitted' || status === 'in_review') {
      return { label: 'KYC: In review', short: 'Review', cls: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200' };
    }
    if (ask || status === 'none' || status === 'required') {
      return { label: 'KYC: Required', short: 'Required', cls: 'bg-red-50 text-red-700 ring-1 ring-red-200' };
    }
    return { label: 'KYC: —', short: '—', cls: 'bg-gray-50 text-gray-700 ring-1 ring-gray-200' };
  })();

  const kycLockedByDefault = (() => {
    const status = kycStatusKey;
    const complete = !!kycData?.meta?.isComplete;
    if (complete) return true;
    // Treat review/pending states as locked (user can still choose to edit).
    if (['pending', 'submitted', 'in_review', 'inreview', 'in-review'].includes(status)) return true;
    // Verified/approved is also locked by default (to avoid accidental resubmits).
    if (['verified', 'approved'].includes(status)) return true;
    return false;
  })();
  const kycReadOnly = kycLockedByDefault && !kycEditMode;

  const preferredPay = payItems.find((x) => x?.isPreferred) || payItems[0];
  const payChip = (() => {
    const status = (preferredPay?.status || '').toString().toLowerCase();
    if (!preferredPay) return { label: 'Payment: Add method', short: 'Add', cls: 'bg-red-50 text-red-700 ring-1 ring-red-200' };
    if (status === 'verified') return { label: 'Payment: Verified', short: 'Verified', cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' };
    if (status === 'unverified' || status === 'pending') return { label: 'Payment: Unverified', short: 'Pending', cls: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200' };
    return { label: 'Payment: Saved', short: 'Saved', cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' };
  })();

  const pricingChip = (() => {
    const hasAny = (pricingItems || []).some((x) => (x?.name || '').toString().trim() && Number.isFinite(Number(x?.amount)));
    if (!hasAny) return { label: 'Ads Budget: Add', short: 'Add', cls: 'bg-red-50 text-red-700 ring-1 ring-red-200' };
    return { label: 'Ads Budget: Set', short: 'Set', cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' };
  })();

  return (
    <section className="py-10">
      <h1 className="text-2xl md:text-3xl font-bold">Creator Dashboard</h1>
      <p className="text-gray-600 mt-1">Manage briefs, uploads, calendar, and payouts.</p>
      {loading && (
        <>
          <div className="mt-6 grid md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <SkeletonPanel />
            <SkeletonPanel />
            <SkeletonPanel />
          </div>
        </>
      )}
      {error && !loading && (
        <div className="mt-6 text-red-600 text-sm">
          {error}
          <div className="mt-2 text-xs text-gray-500">Ensure you are logged in and your token is valid.</div>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Profile header (full-width card with level styling) */}
          <div className={`mt-6 rounded-2xl p-[1px] ${activeLevel.key === 'elite' ? 'bg-gradient-to-r from-amber-200 via-amber-100 to-orange-200' : 'bg-gradient-to-r from-gray-200 to-gray-100'}`}>
            <div className={`rounded-2xl p-5 ${activeLevel.card}`}>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={()=>{ setUploadedAvatarUrl(''); setSelectedFile(null); setPreviewUrl(''); setUploadError(''); setShowAvatarEdit(true); }}
                    className="relative shrink-0"
                  >
                    <AvatarImage src={uploadedAvatarUrl || photo} />
                    <span className="absolute -bottom-1 -right-1 text-[10px] px-1.5 py-0.5 rounded bg-white/90 ring-1 ring-gray-300 text-gray-700">Edit</span>
                  </button>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base md:text-lg font-semibold text-gray-900 truncate">{handle || 'Your profile'}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 text-[11px] rounded ${activeLevel.pill}`}>{activeLevel.label}</span>
                      {verified && (
                        <span className="inline-flex items-center px-2 py-0.5 text-[11px] rounded bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">Verified</span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-gray-600">
                      {badges.length === 0 ? (
                        <span>New creator starting level: <span className="font-medium text-gray-800">Ready</span></span>
                      ) : (
                        <span>Badges: <span className="font-medium text-gray-800">{badges.join(', ')}</span></span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 5-level strip */}
              <div className="mt-4">
                <div className="text-xs text-gray-600">Level</div>
                <div className="mt-2 grid grid-cols-5 gap-2">
                  {LEVELS.map((l) => {
                    const isActive = l.key === activeLevel.key;
                    return (
                      <div
                        key={l.key}
                        className={`rounded-lg px-2 py-2 text-center text-[11px] font-medium ring-1 ${isActive ? l.pill : 'bg-white/70 text-gray-600 ring-gray-200'}`}
                        title={l.label}
                      >
                        {l.label}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tabs (moved into top card for best UX) */}
              <div className="mt-5 flex flex-wrap gap-2">
                <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>Overview</TabButton>
                <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>Profile</TabButton>
                <TabButton active={activeTab === 'reach'} onClick={() => setActiveTab('reach')}>Social Reach</TabButton>
                <TabButton
                  active={activeTab === 'photoshoot'}
                  onClick={() => {
                    setActiveTab('photoshoot');
                    if (psItems.length === 0 && !psLoading) loadPhotoshootRequests({ limit: psLimit, offset: 0 });
                  }}
                >
                  Photoshoot
                </TabButton>

                <TabButton
                  active={activeTab === 'referral'}
                  onClick={() => {
                    setActiveTab('referral');
                    if (!refSummary && !refSummaryLoading) loadReferralSummary();
                    if (!refLedgerLoading && (refLedger?.items || []).length === 0) loadReferralLedger({ limit: refLedger?.limit || 20, offset: 0 });
                  }}
                >
                  Referral
                </TabButton>
                <TabButton active={activeTab === 'kyc'} onClick={() => setActiveTab('kyc')}>
                  <span className="inline-flex items-center gap-2">
                    KYC
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] ${kycChip.cls}`}>{kycChip.short}</span>
                  </span>
                </TabButton>
                <TabButton active={activeTab === 'payments'} onClick={() => setActiveTab('payments')}>
                  <span className="inline-flex items-center gap-2">
                    Payments
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] ${payChip.cls}`}>{payChip.short}</span>
                  </span>
                </TabButton>
                <TabButton active={activeTab === 'pricing'} onClick={() => setActiveTab('pricing')}>
                  <span className="inline-flex items-center gap-2">
                    Ads Budget
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] ${pricingChip.cls}`}>{pricingChip.short}</span>
                  </span>
                </TabButton>
                <button
                  type="button"
                  className="px-3 py-2 rounded-md text-xs font-medium text-white bg-gray-900"
                  onClick={()=>{ setShowAdUpload(true); setAdPosting(false); setAdVideoFile(null); setAdTitle(''); setAdDescription(''); setAdCaption(''); setAdThumbnailUrl(''); setAdCategory(''); setAdCategoryCode(''); }}
                >
                  Upload ads
                </button>
              </div>
            </div>
          </div>

          {/* Modals */}
          <AvatarModal
            isOpen={showAvatarEdit}
            previewUrl={previewUrl}
            selectedFile={selectedFile}
            uploadedUrl={uploadedAvatarUrl}
            saving={savingAvatar}
            errorText={uploadError}
            onFileChange={async (file)=>{
              if (!file) return;
              const maxBytes = 20 * 1024 * 1024;
              try {
                setUploadError('');
                let workingFile = file;
                if (file.size > maxBytes) {
                  const options = { maxSizeMB: 20, useWebWorker: true, maxWidthOrHeight: 4096, initialQuality: 0.9 };
                  const compressed = await imageCompression(file, options);
                  if (compressed && compressed.size < file.size) {
                    workingFile = new File([compressed], file.name.replace(/\.(png|jpg|jpeg|webp)$/i, '.jpg'), { type: 'image/jpeg' });
                  }
                }
                setSelectedFile(workingFile);
                setPreviewUrl(URL.createObjectURL(workingFile));
              } catch (err) {
                setUploadError('Failed to process image. Try a smaller file.');
              }
            }}
            onUpload={async ()=>{
              if (!selectedFile) return; setSavingAvatar(true);
              try { const form=new FormData(); form.append('file', selectedFile); const res=await apiClient.request('/media/upload',{method:'POST', body:form}); const url=res?.url||res?.data?.url; if(!url) throw new Error('Upload succeeded but no URL returned'); setUploadedAvatarUrl(url); }
              catch(e){ logger.error('Upload failed', e); setUploadError(e?.message||'Upload failed'); }
              finally{ setSavingAvatar(false);} }}
            onSave={async ()=>{
              if (!uploadedAvatarUrl) return; setSavingAvatar(true);
              try {
                await apiClient.request('/influencers/me/profile-pic',{ method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ imageUrl: uploadedAvatarUrl })});
                // Refetch profile to ensure server state reflects immediately
                const refreshed = await apiClient.request('/influencers/me');
                setMe(refreshed || (prev=> prev ? { ...prev, profilePicUrl: uploadedAvatarUrl } : prev));
                setShowAvatarEdit(false);
              }
              catch(e){ logger.error('Save failed', e); setUploadError(e?.message||'Update failed'); }
              finally{ setSavingAvatar(false);} }}
            onClose={()=>setShowAvatarEdit(false)}
          />

          <AdUploadModal
            isOpen={showAdUpload}
            adVideoFile={adVideoFile}
            adTitle={adTitle}
            adDescription={adDescription}
            adCaption={adCaption}
            adThumbnailUrl={adThumbnailUrl}
            adThumbUploading={adThumbUploading}
            adThumbFileName={adThumbFileName}
            adCategory={adCategory}
            adCategoryCode={adCategoryCode}
            errorText={uploadError}
            posting={adPosting}
            onClose={()=>{ if (!adPosting && !adThumbUploading) setShowAdUpload(false); }}
            onVideoChange={(f)=>setAdVideoFile(f||null)}
            onTitleChange={(v)=>setAdTitle(v)}
            onDescChange={(v)=>setAdDescription(v)}
            onCaptionChange={(v)=>setAdCaption(v)}
            onThumbUrlChange={(v)=>setAdThumbnailUrl(v)}
            onThumbFileChange={async (img)=>{
              if (!img) return; setAdThumbFileName(img.name); if (img.size > 2 * 1024 * 1024) { setUploadError('Thumbnail too large (max 2MB)'); return; }
              const form = new FormData(); form.append('file', img); setAdThumbUploading(true);
              try { const res = await apiClient.request('/media/upload', { method:'POST', body: form }); const url = res?.url || res?.data?.url; if (url) setAdThumbnailUrl(url); setUploadError(''); }
              catch(err){ setUploadError('Failed to upload thumbnail'); }
              finally{ setAdThumbUploading(false);} }}
            onUploadAd={async (evt)=>{
              if (!adVideoFile) return; setAdPosting(true);
              try { const fd=new FormData(); fd.append('file', adVideoFile); if (adTitle) fd.append('title', adTitle); if (adDescription) fd.append('description', adDescription); if (adCaption) fd.append('caption', adCaption); if (adThumbnailUrl) fd.append('thumbnailUrl', adThumbnailUrl); if (evt?.categoryId) fd.append('category', String(evt.categoryId)); if (evt?.categoryCode) fd.append('categoryCode', evt.categoryCode); const res = await apiClient.request('/influencers/me/ads/video', { method: 'POST', body: fd }); const newItem = { playbackUrl: res?.playbackUrl, ulid: res?.guid, meta: { title: adTitle }, post: { caption: adCaption }, durationSec: 0 }; setMedia(prev => [newItem, ...(Array.isArray(prev)? prev : [])]); setShowAdUpload(false); }
              catch(e){ setError(typeof e?.message==='string'? e.message : 'Failed to upload ad'); }
              finally{ setAdPosting(false);} }}
          />

          {activeTab === 'profile' && (
            <div className="mt-6 grid md:grid-cols-3 gap-6">
              <Panel gradient>
                <h2 className="font-semibold">Profile Summary</h2>
                <div className="mt-3 text-sm text-gray-700 space-y-2">
                  <KeyValue k="Handle" v={me?.handle || '—'} />
                  <KeyValue k="Status" v={me?.verificationStatus || '—'} />
                  <KeyValue k="Level" v={activeLevel.label} />
                  <KeyValue k="Location" v={(me?.states?.[0] || me?.state || me?.city || '—')} />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <a href="/influencer/me" className="px-3 py-2 rounded-md text-xs font-medium text-gray-800 bg-gray-100 ring-1 ring-gray-200">View all</a>
                  <button type="button" className="px-3 py-2 rounded-md text-xs font-medium text-gray-800 bg-gray-100 ring-1 ring-gray-200" onClick={() => setShowAllProfile(v => !v)}>
                    {showAllProfile ? 'Hide' : 'Show'} raw
                  </button>
                </div>
                {showAllProfile && (
                  <pre className="mt-4 text-xs bg-gray-50 p-3 rounded-lg overflow-auto ring-1 ring-gray-200">{JSON.stringify(me || {}, null, 2)}</pre>
                )}
              </Panel>

              <Panel>
                <h2 className="font-semibold">Social & Audience</h2>
                <div className="mt-3 text-sm text-gray-700 space-y-2">
                  <KeyValue k="Instagram" v={me?.socialLinks?.instagram || '—'} />
                  <KeyValue k="YouTube" v={me?.socialLinks?.youtube || '—'} />
                  <KeyValue k="Instagram followers" v={me?.followers?.instagram != null ? String(me.followers.instagram) : '—'} />
                </div>
                <div className="mt-4">
                  <button type="button" className="px-3 py-2 rounded-md text-xs font-medium text-white bg-gray-900" onClick={() => setActiveTab('reach')}>
                    Edit social reach
                  </button>
                </div>
              </Panel>

              <Panel>
                <h2 className="font-semibold">Quick Actions</h2>
                <div className="mt-3 text-sm text-gray-700 space-y-2">
                  <div className="text-xs text-gray-600">Use these to keep your profile and media fresh.</div>
                  <div className="mt-3 flex flex-col gap-2">
                    <a href="/profile-builder" className="px-3 py-2 rounded-md text-xs font-medium text-white bg-gradient-to-r from-orange-600 to-pink-600">Edit profile</a>
                    <button className="px-3 py-2 rounded-md text-xs font-medium text-white bg-gray-900" onClick={()=>{ setShowAdUpload(true); setAdPosting(false); setAdVideoFile(null); setAdTitle(''); setAdDescription(''); setAdCaption(''); setAdThumbnailUrl(''); setAdCategory(''); setAdCategoryCode(''); }}>Upload ad</button>
                  </div>
                </div>
              </Panel>
            </div>
          )}

          {activeTab === 'reach' && (
            <div className="mt-6 grid lg:grid-cols-3 gap-6">
              <Panel gradient>
                <h2 className="font-semibold">Social Media Reach</h2>
                <div className="mt-2 text-xs text-gray-600">Add follower counts and links so brands can trust your reach.</div>
                {reachError && <div className="mt-3 text-xs text-red-600">{reachError}</div>}
                {reachMessage && <div className="mt-3 text-xs text-emerald-700">{reachMessage}</div>}
                <div className="mt-4 flex items-center gap-2">
                  <button type="button" onClick={() => setReachForm((p) => ({
                    ...p,
                    followers: { ...p.followers, engagementRate: (p.followers.engagementRate || '').toString().replace(/[^0-9.]/g, '') },
                  }))} className="hidden" />
                  <button type="button" onClick={saveReach} disabled={reachSaving} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gray-900 disabled:opacity-50">
                    {reachSaving ? 'Saving…' : 'Save'}
                  </button>
                  <button type="button" onClick={() => setActiveTab('profile')} className="px-3 py-2 rounded-md text-sm bg-gray-100" disabled={reachSaving}>
                    Back
                  </button>
                </div>
              </Panel>

              <div className="lg:col-span-2">
                <Panel>
                  <h2 className="font-semibold">Follower Counts</h2>
                  <div className="mt-4 grid md:grid-cols-3 gap-4">
                    {[
                      ['instagram','Instagram'],
                      ['youtube','YouTube'],
                      ['tiktok','TikTok'],
                      ['facebook','Facebook'],
                      ['x','X'],
                      ['snapchat','Snapchat'],
                      ['linkedin','LinkedIn'],
                      ['pinterest','Pinterest'],
                      ['threads','Threads'],
                      ['telegram','Telegram'],
                    ].map(([key, label]) => (
                      <label key={key} className="text-sm text-gray-700">
                        {label}
                        <input
                          type="number"
                          min="0"
                          step="1"
                          inputMode="numeric"
                          value={reachForm.followers[key]}
                          onChange={(e)=>setReachForm((p)=>({ ...p, followers: { ...p.followers, [key]: e.target.value } }))}
                          className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 px-3 h-11"
                          placeholder="0"
                        />
                      </label>
                    ))}

                    <label className="text-sm text-gray-700 md:col-span-2">
                      Website monthly visitors
                      <input
                        type="number"
                        min="0"
                        step="1"
                        inputMode="numeric"
                        value={reachForm.followers.websiteMonthlyVisitors}
                        onChange={(e)=>setReachForm((p)=>({ ...p, followers: { ...p.followers, websiteMonthlyVisitors: e.target.value } }))}
                        className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 px-3 h-11"
                        placeholder="0"
                      />
                    </label>

                    <label className="text-sm text-gray-700">
                      Engagement rate (%)
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        inputMode="decimal"
                        value={reachForm.followers.engagementRate}
                        onChange={(e)=>setReachForm((p)=>({ ...p, followers: { ...p.followers, engagementRate: e.target.value } }))}
                        className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 px-3 h-11"
                        placeholder="2.1"
                      />
                    </label>
                  </div>

                  <h3 className="mt-8 font-semibold">Social Links</h3>
                  <div className="mt-4 grid md:grid-cols-2 gap-4">
                    {[
                      ['instagram','Instagram URL','https://instagram.com/…'],
                      ['youtube','YouTube URL','https://youtube.com/@…'],
                      ['tiktok','TikTok URL','https://tiktok.com/@…'],
                      ['facebook','Facebook URL','https://facebook.com/…'],
                      ['x','X URL','https://x.com/…'],
                      ['snapchat','Snapchat URL','https://www.snapchat.com/add/…'],
                      ['linkedin','LinkedIn URL','https://www.linkedin.com/in/…'],
                      ['pinterest','Pinterest URL','https://www.pinterest.com/…'],
                      ['threads','Threads URL','https://www.threads.net/@…'],
                      ['telegram','Telegram URL','https://t.me/…'],
                      ['website','Website','https://…'],
                    ].map(([key, label, ph]) => (
                      <label key={key} className="text-sm text-gray-700">
                        {label}
                        <input
                          type="url"
                          value={reachForm.socialLinks[key]}
                          onChange={(e)=>setReachForm((p)=>({ ...p, socialLinks: { ...p.socialLinks, [key]: e.target.value } }))}
                          className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 px-3 h-11"
                          placeholder={ph}
                        />
                      </label>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-end">
                    <button type="button" onClick={saveReach} disabled={reachSaving} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gray-900 disabled:opacity-50">
                      {reachSaving ? 'Saving…' : 'Save Social Reach'}
                    </button>
                  </div>
                </Panel>
              </div>
            </div>
          )}

          {activeTab === 'photoshoot' && (
            <div className="mt-6 grid lg:grid-cols-3 gap-6">
              <Panel gradient>
                <h2 className="font-semibold">Photoshoot Requests</h2>
                <div className="mt-2 text-xs text-gray-600">Request a professional photoshoot slot.</div>
                {psError && <div className="mt-3 text-xs text-red-600">{psError}</div>}
                {psMessage && <div className="mt-3 text-xs text-emerald-700">{psMessage}</div>}
                <div className="mt-4 flex items-center gap-2">
                  <button type="button" onClick={() => loadPhotoshootRequests({ limit: psLimit, offset: psOffset })} disabled={psLoading} className="px-3 py-2 rounded-md text-sm bg-gray-100 disabled:opacity-50">
                    {psLoading ? 'Loading…' : 'Refresh'}
                  </button>
                  <button type="button" onClick={() => loadPhotoshootRequests({ limit: psLimit, offset: Math.max(0, psOffset - psLimit) })} disabled={psLoading || psOffset <= 0} className="px-3 py-2 rounded-md text-sm bg-gray-100 disabled:opacity-50">
                    Prev
                  </button>
                  <button type="button" onClick={() => loadPhotoshootRequests({ limit: psLimit, offset: psOffset + psLimit })} disabled={psLoading || (psOffset + psLimit) >= psTotal} className="px-3 py-2 rounded-md text-sm bg-gray-100 disabled:opacity-50">
                    Next
                  </button>
                </div>
                <div className="mt-3 text-xs text-gray-600">Showing {psItems.length} of {psTotal}.</div>
              </Panel>

              <div className="lg:col-span-2 space-y-6">
                <Panel>
                  <h2 className="font-semibold">View Requests</h2>
                  <div className="mt-4 space-y-2">
                    {psLoading && <div className="text-xs text-gray-600">Loading…</div>}
                    {!psLoading && psItems.length === 0 && <div className="text-xs text-gray-600">No requests yet.</div>}
                    {!psLoading && psItems.map((it) => (
                      <div key={it.ulid} className="rounded-xl bg-gray-50 ring-1 ring-gray-200 px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-medium text-gray-900">{it.status || '—'}</div>
                          <div className="text-xs text-gray-600">{(it.createdAt || '').toString().slice(0, 10) || '—'}</div>
                        </div>
                        <div className="mt-1 text-xs text-gray-700">
                          <div>ULID: <span className="text-gray-600">{it.ulid}</span></div>
                          {it.scheduledStartAt && (
                            <div>Scheduled: <span className="text-gray-600">{String(it.scheduledStartAt)}</span> → <span className="text-gray-600">{String(it.scheduledEndAt || '')}</span></div>
                          )}
                          {it.rejectReason && <div className="text-red-700">Reject: {it.rejectReason}</div>}
                          {it.adminNotes && <div className="text-gray-600">Admin: {it.adminNotes}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel>
                  <h2 className="font-semibold">New Photoshoot Request</h2>
                  <div className="mt-2 text-xs text-gray-600">Fill details and book the latest available slot.</div>
                  {psBookError && <div className="mt-3 text-xs text-red-600">{psBookError}</div>}
                  {psBookMessage && <div className="mt-3 text-xs text-emerald-700">{psBookMessage}</div>}

                  <div className="mt-4 grid md:grid-cols-3 gap-4">
                    <label className="text-sm text-gray-700 md:col-span-1">Timezone
                      <input value={psBookForm.requestedTimezone} onChange={(e)=>setPsBookForm(p=>({ ...p, requestedTimezone: e.target.value }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-11 px-3" placeholder="Asia/Kolkata" />
                    </label>
                    <label className="text-sm text-gray-700 md:col-span-1">Requested start
                      <input type="datetime-local" value={psBookForm.requestedStartAtLocal} onChange={(e)=>setPsBookForm(p=>({ ...p, requestedStartAtLocal: e.target.value }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-11 px-3" />
                    </label>
                    <label className="text-sm text-gray-700 md:col-span-1">Requested end
                      <input type="datetime-local" value={psBookForm.requestedEndAtLocal} onChange={(e)=>setPsBookForm(p=>({ ...p, requestedEndAtLocal: e.target.value }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-11 px-3" />
                    </label>
                  </div>

                  <h3 className="mt-6 text-sm font-semibold text-gray-900">Personal</h3>
                  <div className="mt-3 grid md:grid-cols-3 gap-4">
                    <label className="text-sm text-gray-700">Full name
                      <input value={psBookForm.influencerAppointmentDetails.personal.fullName} onChange={(e)=>setPsBookForm(p=>({ ...p, influencerAppointmentDetails: { ...p.influencerAppointmentDetails, personal: { ...p.influencerAppointmentDetails.personal, fullName: e.target.value } } }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-11 px-3" />
                    </label>
                    <label className="text-sm text-gray-700">City
                      <input value={psBookForm.influencerAppointmentDetails.personal.city} onChange={(e)=>setPsBookForm(p=>({ ...p, influencerAppointmentDetails: { ...p.influencerAppointmentDetails, personal: { ...p.influencerAppointmentDetails.personal, city: e.target.value } } }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-11 px-3" />
                    </label>
                    <label className="text-sm text-gray-700">Gender
                      <input value={psBookForm.influencerAppointmentDetails.personal.gender} onChange={(e)=>setPsBookForm(p=>({ ...p, influencerAppointmentDetails: { ...p.influencerAppointmentDetails, personal: { ...p.influencerAppointmentDetails.personal, gender: e.target.value } } }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-11 px-3" placeholder="male/female/other" />
                    </label>
                    <label className="text-sm text-gray-700">Body type
                      <input value={psBookForm.influencerAppointmentDetails.personal.bodyType} onChange={(e)=>setPsBookForm(p=>({ ...p, influencerAppointmentDetails: { ...p.influencerAppointmentDetails, personal: { ...p.influencerAppointmentDetails.personal, bodyType: e.target.value } } }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-11 px-3" placeholder="Athletic" />
                    </label>
                    <label className="text-sm text-gray-700">Skin tone
                      <input value={psBookForm.influencerAppointmentDetails.personal.skinTone} onChange={(e)=>setPsBookForm(p=>({ ...p, influencerAppointmentDetails: { ...p.influencerAppointmentDetails, personal: { ...p.influencerAppointmentDetails.personal, skinTone: e.target.value } } }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-11 px-3" placeholder="Medium" />
                    </label>
                  </div>

                  <h3 className="mt-6 text-sm font-semibold text-gray-900">Body measurements</h3>
                  <div className="mt-3 grid md:grid-cols-3 gap-4">
                    <label className="text-sm text-gray-700">Height (cm)
                      <input type="number" min="0" value={psBookForm.influencerAppointmentDetails.bodyMeasurements.heightCm} onChange={(e)=>setPsBookForm(p=>({ ...p, influencerAppointmentDetails: { ...p.influencerAppointmentDetails, bodyMeasurements: { ...p.influencerAppointmentDetails.bodyMeasurements, heightCm: e.target.value } } }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-11 px-3" />
                    </label>
                    <label className="text-sm text-gray-700">Shoe size
                      <input type="number" min="0" value={psBookForm.influencerAppointmentDetails.bodyMeasurements.shoeSize} onChange={(e)=>setPsBookForm(p=>({ ...p, influencerAppointmentDetails: { ...p.influencerAppointmentDetails, bodyMeasurements: { ...p.influencerAppointmentDetails.bodyMeasurements, shoeSize: e.target.value } } }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-11 px-3" />
                    </label>
                  </div>

                  <h3 className="mt-6 text-sm font-semibold text-gray-900">Dress details</h3>
                  <div className="mt-3 grid md:grid-cols-3 gap-4">
                    <label className="text-sm text-gray-700">Top size
                      <input value={psBookForm.influencerAppointmentDetails.dressDetails.topSize} onChange={(e)=>setPsBookForm(p=>({ ...p, influencerAppointmentDetails: { ...p.influencerAppointmentDetails, dressDetails: { ...p.influencerAppointmentDetails.dressDetails, topSize: e.target.value } } }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-11 px-3" placeholder="M" />
                    </label>
                    <label className="text-sm text-gray-700">Bottom size
                      <input value={psBookForm.influencerAppointmentDetails.dressDetails.bottomSize} onChange={(e)=>setPsBookForm(p=>({ ...p, influencerAppointmentDetails: { ...p.influencerAppointmentDetails, dressDetails: { ...p.influencerAppointmentDetails.dressDetails, bottomSize: e.target.value } } }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-11 px-3" placeholder="M" />
                    </label>
                    <label className="text-sm text-gray-700">Dress size
                      <input value={psBookForm.influencerAppointmentDetails.dressDetails.dressSize} onChange={(e)=>setPsBookForm(p=>({ ...p, influencerAppointmentDetails: { ...p.influencerAppointmentDetails, dressDetails: { ...p.influencerAppointmentDetails.dressDetails, dressSize: e.target.value } } }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-11 px-3" placeholder="M" />
                    </label>
                    <label className="text-sm text-gray-700">Preferred fit
                      <input value={psBookForm.influencerAppointmentDetails.dressDetails.preferredFit} onChange={(e)=>setPsBookForm(p=>({ ...p, influencerAppointmentDetails: { ...p.influencerAppointmentDetails, dressDetails: { ...p.influencerAppointmentDetails.dressDetails, preferredFit: e.target.value } } }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-11 px-3" placeholder="Regular" />
                    </label>
                    <label className="text-sm text-gray-700 md:col-span-2">Preferred dressing style (comma separated)
                      <input value={psBookForm.influencerAppointmentDetails.dressDetails.preferredDressingStyleCsv} onChange={(e)=>setPsBookForm(p=>({ ...p, influencerAppointmentDetails: { ...p.influencerAppointmentDetails, dressDetails: { ...p.influencerAppointmentDetails.dressDetails, preferredDressingStyleCsv: e.target.value } } }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-11 px-3" placeholder="Western" />
                    </label>
                    <label className="text-sm text-gray-700 md:col-span-2">Western wear type (comma separated)
                      <input value={psBookForm.influencerAppointmentDetails.dressDetails.westernWearTypeCsv} onChange={(e)=>setPsBookForm(p=>({ ...p, influencerAppointmentDetails: { ...p.influencerAppointmentDetails, dressDetails: { ...p.influencerAppointmentDetails.dressDetails, westernWearTypeCsv: e.target.value } } }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-11 px-3" placeholder="Jeans & Top" />
                    </label>
                    <label className="text-sm text-gray-700 md:col-span-2">Preferred outfit colors (comma separated)
                      <input value={psBookForm.influencerAppointmentDetails.dressDetails.preferredOutfitColorsCsv} onChange={(e)=>setPsBookForm(p=>({ ...p, influencerAppointmentDetails: { ...p.influencerAppointmentDetails, dressDetails: { ...p.influencerAppointmentDetails.dressDetails, preferredOutfitColorsCsv: e.target.value } } }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-11 px-3" placeholder="Black" />
                    </label>
                  </div>

                  <h3 className="mt-6 text-sm font-semibold text-gray-900">Shoot preferences</h3>
                  <div className="mt-3 grid md:grid-cols-3 gap-4">
                    <label className="text-sm text-gray-700 md:col-span-2">Shoot style (comma separated)
                      <input value={psBookForm.influencerAppointmentDetails.shootPreferences.shootStyleCsv} onChange={(e)=>setPsBookForm(p=>({ ...p, influencerAppointmentDetails: { ...p.influencerAppointmentDetails, shootPreferences: { ...p.influencerAppointmentDetails.shootPreferences, shootStyleCsv: e.target.value } } }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-11 px-3" placeholder="Professional" />
                    </label>
                    <label className="text-sm text-gray-700">Pose comfort
                      <input value={psBookForm.influencerAppointmentDetails.shootPreferences.poseComfortLevel} onChange={(e)=>setPsBookForm(p=>({ ...p, influencerAppointmentDetails: { ...p.influencerAppointmentDetails, shootPreferences: { ...p.influencerAppointmentDetails.shootPreferences, poseComfortLevel: e.target.value } } }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-11 px-3" placeholder="Confident" />
                    </label>
                    <label className="text-sm text-gray-700">Boldness
                      <input value={psBookForm.influencerAppointmentDetails.shootPreferences.boldnessLevel} onChange={(e)=>setPsBookForm(p=>({ ...p, influencerAppointmentDetails: { ...p.influencerAppointmentDetails, shootPreferences: { ...p.influencerAppointmentDetails.shootPreferences, boldnessLevel: e.target.value } } }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-11 px-3" placeholder="Normal" />
                    </label>
                    <label className="text-sm text-gray-700 md:col-span-2">Shoot type (comma separated)
                      <input value={psBookForm.influencerAppointmentDetails.shootPreferences.shootTypeCsv} onChange={(e)=>setPsBookForm(p=>({ ...p, influencerAppointmentDetails: { ...p.influencerAppointmentDetails, shootPreferences: { ...p.influencerAppointmentDetails.shootPreferences, shootTypeCsv: e.target.value } } }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-11 px-3" placeholder="Indoor" />
                    </label>
                    <div className="flex items-center gap-4 md:col-span-3">
                      <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={!!psBookForm.influencerAppointmentDetails.shootPreferences.sleevelessAllowed} onChange={(e)=>setPsBookForm(p=>({ ...p, influencerAppointmentDetails: { ...p.influencerAppointmentDetails, shootPreferences: { ...p.influencerAppointmentDetails.shootPreferences, sleevelessAllowed: e.target.checked } } }))} />
                        Sleeveless allowed
                      </label>
                      <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={!!psBookForm.influencerAppointmentDetails.shootPreferences.cameraFacingComfort} onChange={(e)=>setPsBookForm(p=>({ ...p, influencerAppointmentDetails: { ...p.influencerAppointmentDetails, shootPreferences: { ...p.influencerAppointmentDetails.shootPreferences, cameraFacingComfort: e.target.checked } } }))} />
                        Camera facing comfort
                      </label>
                    </div>
                  </div>

                  <h3 className="mt-6 text-sm font-semibold text-gray-900">Permissions</h3>
                  <div className="mt-3 grid md:grid-cols-3 gap-4">
                    <label className="text-sm text-gray-700">Makeup preference
                      <input value={psBookForm.influencerAppointmentDetails.stylingPermissions.makeupPreference} onChange={(e)=>setPsBookForm(p=>({ ...p, influencerAppointmentDetails: { ...p.influencerAppointmentDetails, stylingPermissions: { ...p.influencerAppointmentDetails.stylingPermissions, makeupPreference: e.target.value } } }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-11 px-3" placeholder="Natural" />
                    </label>
                    <div className="flex items-center gap-4 md:col-span-2">
                      <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={!!psBookForm.influencerAppointmentDetails.stylingPermissions.accessoriesAllowed} onChange={(e)=>setPsBookForm(p=>({ ...p, influencerAppointmentDetails: { ...p.influencerAppointmentDetails, stylingPermissions: { ...p.influencerAppointmentDetails.stylingPermissions, accessoriesAllowed: e.target.checked } } }))} />
                        Accessories allowed
                      </label>
                      <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={!!psBookForm.influencerAppointmentDetails.editingAndUsage.photoshopBrandingAllowed} onChange={(e)=>setPsBookForm(p=>({ ...p, influencerAppointmentDetails: { ...p.influencerAppointmentDetails, editingAndUsage: { ...p.influencerAppointmentDetails.editingAndUsage, photoshopBrandingAllowed: e.target.checked } } }))} />
                        Photoshop/branding allowed
                      </label>
                    </div>
                    <label className="text-sm text-gray-700 md:col-span-3">Usage permission (comma separated)
                      <input value={psBookForm.influencerAppointmentDetails.editingAndUsage.usagePermissionCsv} onChange={(e)=>setPsBookForm(p=>({ ...p, influencerAppointmentDetails: { ...p.influencerAppointmentDetails, editingAndUsage: { ...p.influencerAppointmentDetails.editingAndUsage, usagePermissionCsv: e.target.value } } }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-11 px-3" placeholder="Website, Social Media" />
                    </label>
                  </div>

                  <h3 className="mt-6 text-sm font-semibold text-gray-900">Consent</h3>
                  <div className="mt-3 grid md:grid-cols-3 gap-4">
                    <label className="text-sm text-gray-700">Date
                      <input type="date" value={psBookForm.influencerAppointmentDetails.consent.date} onChange={(e)=>setPsBookForm(p=>({ ...p, influencerAppointmentDetails: { ...p.influencerAppointmentDetails, consent: { ...p.influencerAppointmentDetails.consent, date: e.target.value } } }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-11 px-3" />
                    </label>
                    <div className="flex items-center gap-4 md:col-span-2">
                      <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={!!psBookForm.influencerAppointmentDetails.consent.publicDisplayConsent} onChange={(e)=>setPsBookForm(p=>({ ...p, influencerAppointmentDetails: { ...p.influencerAppointmentDetails, consent: { ...p.influencerAppointmentDetails.consent, publicDisplayConsent: e.target.checked } } }))} />
                        Public display consent
                      </label>
                      <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={!!psBookForm.influencerAppointmentDetails.consent.termsAccepted} onChange={(e)=>setPsBookForm(p=>({ ...p, influencerAppointmentDetails: { ...p.influencerAppointmentDetails, consent: { ...p.influencerAppointmentDetails.consent, termsAccepted: e.target.checked } } }))} />
                        Terms accepted
                      </label>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-end">
                    <button type="button" onClick={bookLatestPhotoshoot} disabled={psBooking} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gray-900 disabled:opacity-50">
                      {psBooking ? 'Submitting…' : 'Submit Request'}
                    </button>
                  </div>
                </Panel>
              </div>
            </div>
          )}

          {activeTab === 'referral' && (
            <div className="mt-6 grid lg:grid-cols-3 gap-6">
              <Panel gradient>
                <h2 className="font-semibold">Referral</h2>
                <div className="mt-2 text-xs text-gray-600">Invite friends and earn rewards.</div>
                {refError && <div className="mt-3 text-xs text-red-600">{refError}</div>}
                {refMessage && <div className="mt-3 text-xs text-emerald-700">{refMessage}</div>}
                <div className="mt-4 flex items-center gap-2">
                  <button type="button" onClick={() => { loadReferralSummary(); loadReferralLedger({ limit: refLedger?.limit || 20, offset: refLedger?.offset || 0 }); }} disabled={refSummaryLoading || refLedgerLoading} className="px-3 py-2 rounded-md text-sm bg-gray-100 disabled:opacity-50">
                    {(refSummaryLoading || refLedgerLoading) ? 'Loading…' : 'Refresh'}
                  </button>
                </div>
              </Panel>

              <div className="lg:col-span-2 space-y-6">
                <Panel>
                  <h2 className="font-semibold">My Referral Code</h2>
                  {refSummaryLoading && <div className="mt-3 text-xs text-gray-600">Loading…</div>}
                  {!refSummaryLoading && (
                    <>
                      <div className="mt-3 grid md:grid-cols-3 gap-4">
                        <div className="rounded-xl bg-gray-50 ring-1 ring-gray-200 p-4">
                          <div className="text-xs text-gray-600">Referral code</div>
                          <div className="mt-1 text-lg font-semibold text-gray-900">{refSummary?.referralCode || '—'}</div>
                        </div>
                        <div className="rounded-xl bg-gray-50 ring-1 ring-gray-200 p-4">
                          <div className="text-xs text-gray-600">Total referred</div>
                          <div className="mt-1 text-lg font-semibold text-gray-900">{String(refSummary?.stats?.totalReferred ?? 0)}</div>
                        </div>
                        <div className="rounded-xl bg-gray-50 ring-1 ring-gray-200 p-4">
                          <div className="text-xs text-gray-600">Total earned</div>
                          <div className="mt-1 text-lg font-semibold text-gray-900">{String(refSummary?.stats?.totalEarned ?? 0)}</div>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-gray-600">Share URL: <span className="text-gray-800">{refInviteResult?.shareUrl || (refSummary?.referralCode ? `https://influ.kaburlumedia.com/referral?code=${encodeURIComponent(refSummary.referralCode)}` : '—')}</span></div>
                    </>
                  )}
                </Panel>

                <Panel>
                  <h2 className="font-semibold">Invite Referral</h2>
                  <div className="mt-2 text-xs text-gray-600">Give mobile number and name.</div>
                  <div className="mt-4 grid md:grid-cols-3 gap-4">
                    <label className="text-sm text-gray-700">Mobile number
                      <input
                        value={refInviteForm.phone}
                        onChange={(e)=>setRefInviteForm((p)=>({ ...p, phone: e.target.value }))}
                        className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-11 px-3"
                        placeholder="9118191991"
                        inputMode="numeric"
                      />
                    </label>
                    <label className="text-sm text-gray-700 md:col-span-2">Receiver name
                      <input
                        value={refInviteForm.receiverName}
                        onChange={(e)=>setRefInviteForm((p)=>({ ...p, receiverName: e.target.value }))}
                        className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-11 px-3"
                        placeholder="Nagendra"
                      />
                    </label>
                  </div>
                  <div className="mt-4 flex items-center justify-end">
                    <button type="button" onClick={inviteReferral} disabled={refInviteLoading} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gray-900 disabled:opacity-50">
                      {refInviteLoading ? 'Sending…' : 'Send Invite'}
                    </button>
                  </div>
                  {refInviteResult?.shareUrl && (
                    <div className="mt-3 text-xs text-gray-700">Share URL: <span className="text-gray-900">{refInviteResult.shareUrl}</span></div>
                  )}
                </Panel>

                <Panel>
                  <h2 className="font-semibold">Apply Referral Code</h2>
                  <div className="mt-2 text-xs text-gray-600">If you were referred by someone, apply their code here.</div>
                  <div className="mt-4 grid md:grid-cols-3 gap-4">
                    <label className="text-sm text-gray-700 md:col-span-2">Referral code
                      <input
                        value={refApplyCode}
                        onChange={(e)=>setRefApplyCode(e.target.value)}
                        className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-11 px-3"
                        placeholder="AB12CD34"
                      />
                    </label>
                    <div className="flex items-end">
                      <button type="button" onClick={applyReferral} disabled={refApplyLoading} className="w-full px-4 py-2 rounded-md text-sm font-medium text-white bg-gray-900 disabled:opacity-50">
                        {refApplyLoading ? 'Applying…' : 'Apply'}
                      </button>
                    </div>
                  </div>
                </Panel>

                <Panel>
                  <h2 className="font-semibold">My Referral Ledger</h2>
                  <div className="mt-4 flex items-center gap-2">
                    <button type="button" onClick={() => loadReferralLedger({ limit: refLedger?.limit || 20, offset: Math.max(0, (refLedger?.offset || 0) - (refLedger?.limit || 20)) })} disabled={refLedgerLoading || (refLedger?.offset || 0) <= 0} className="px-3 py-2 rounded-md text-sm bg-gray-100 disabled:opacity-50">Prev</button>
                    <button type="button" onClick={() => loadReferralLedger({ limit: refLedger?.limit || 20, offset: (refLedger?.offset || 0) + (refLedger?.limit || 20) })} disabled={refLedgerLoading || ((refLedger?.offset || 0) + (refLedger?.limit || 20)) >= (refLedger?.total || 0)} className="px-3 py-2 rounded-md text-sm bg-gray-100 disabled:opacity-50">Next</button>
                    <div className="text-xs text-gray-600">Showing {(refLedger?.items || []).length} of {refLedger?.total || 0}.</div>
                  </div>
                  <div className="mt-3 space-y-2">
                    {refLedgerLoading && <div className="text-xs text-gray-600">Loading…</div>}
                    {!refLedgerLoading && (refLedger?.items || []).length === 0 && <div className="text-xs text-gray-600">No ledger entries yet.</div>}
                    {!refLedgerLoading && (refLedger?.items || []).map((it, idx) => (
                      <div key={it.ulid || it.id || idx} className="rounded-xl bg-gray-50 ring-1 ring-gray-200 px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{it.type || it.kind || it.status || 'Entry'}</div>
                        <div className="mt-1 text-xs text-gray-600">{(it.createdAt || it.created_at || '').toString() || ''}</div>
                        {it.amount != null && <div className="mt-1 text-xs text-gray-700">Amount: {String(it.amount)}</div>}
                        {it.note && <div className="mt-1 text-xs text-gray-700">{String(it.note)}</div>}
                      </div>
                    ))}
                  </div>
                </Panel>
              </div>
            </div>
          )}

          {activeTab === 'kyc' && (
            <div className="mt-6 grid lg:grid-cols-3 gap-6">
              <Panel gradient>
                <h2 className="font-semibold">KYC Status</h2>
                <div className="mt-3 text-sm text-gray-700 space-y-2">
                  <KeyValue k="Status" v={kycData?.status || '—'} />
                  <KeyValue k="Complete" v={kycData?.meta?.isComplete ? 'Yes' : 'No'} />
                  <KeyValue k="Ask KYC" v={kycData?.meta?.askKyc ? 'Yes' : 'No'} />
                </div>
                {kycLoading && <div className="mt-3 text-xs text-gray-600">Loading…</div>}
                {kycError && <div className="mt-3 text-xs text-red-600">{kycError}</div>}
                {kycMessage && <div className="mt-3 text-xs text-emerald-700">{kycMessage}</div>}
                <div className="mt-4 text-xs text-gray-600">Upload photos via media API, then we submit URLs.</div>
              </Panel>

              <div className="lg:col-span-2">
                <Panel>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold">KYC Details</h2>
                      {kycReadOnly && (
                        <div className="mt-1 text-xs text-gray-600">
                          Your KYC is currently <span className="font-medium">{kycData?.status || 'in progress'}</span>. Click <span className="font-medium">Edit</span> to update and resubmit (may restart review).
                        </div>
                      )}
                    </div>

                    {kycLockedByDefault && (
                      <div className="flex items-center gap-2">
                        {kycEditMode ? (
                          <>
                            <button
                              type="button"
                              onClick={loadKyc}
                              className="px-3 py-2 rounded-md text-sm bg-gray-100"
                              disabled={kycLoading || kycSaving}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => setKycEditMode(false)}
                              className="hidden"
                            />
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setKycEditMode(true)}
                            className="px-3 py-2 rounded-md text-sm font-medium text-white bg-gray-900"
                            disabled={kycLoading || kycSaving}
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 grid md:grid-cols-2 gap-4">
                    <label className="text-sm text-gray-700">Full name
                      <input disabled={kycReadOnly} value={kycForm.fullName} onChange={(e)=>setKycForm(p=>({ ...p, fullName: e.target.value }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed" placeholder="Full name" />
                    </label>
                    <label className="text-sm text-gray-700">Date of birth
                      <input disabled={kycReadOnly} type="date" value={kycForm.dob} onChange={(e)=>setKycForm(p=>({ ...p, dob: e.target.value }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed" />
                    </label>
                    <label className="text-sm text-gray-700">PAN
                      <input disabled={kycReadOnly} value={kycForm.pan} onChange={(e)=>setKycForm(p=>({ ...p, pan: e.target.value.toUpperCase() }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed" placeholder="ABCDE1234F" />
                    </label>
                    <label className="text-sm text-gray-700">Aadhaar number
                      <input disabled={kycReadOnly} value={kycForm.aadhaarNumber} onChange={(e)=>setKycForm(p=>({ ...p, aadhaarNumber: e.target.value.replace(/[^0-9]/g,'').slice(0,12) }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed" placeholder="123412341234" />
                    </label>
                    <label className="text-sm text-gray-700 md:col-span-2">Address line 1
                      <input disabled={kycReadOnly} value={kycForm.addressLine1} onChange={(e)=>setKycForm(p=>({ ...p, addressLine1: e.target.value }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed" />
                    </label>
                    <label className="text-sm text-gray-700 md:col-span-2">Address line 2
                      <input disabled={kycReadOnly} value={kycForm.addressLine2} onChange={(e)=>setKycForm(p=>({ ...p, addressLine2: e.target.value }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed" />
                    </label>
                    <label className="text-sm text-gray-700">Postal code
                      <input disabled={kycReadOnly} value={kycForm.postalCode} onChange={(e)=>setKycForm(p=>({ ...p, postalCode: e.target.value.replace(/[^0-9]/g,'').slice(0,10) }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed" />
                    </label>
                    <label className="text-sm text-gray-700">City
                      <input disabled={kycReadOnly} value={kycForm.city} onChange={(e)=>setKycForm(p=>({ ...p, city: e.target.value }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed" />
                    </label>
                    <label className="text-sm text-gray-700">State
                      <input disabled={kycReadOnly} value={kycForm.state} onChange={(e)=>setKycForm(p=>({ ...p, state: e.target.value }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed" />
                    </label>
                    <label className="text-sm text-gray-700">Country
                      <input disabled={kycReadOnly} value={kycForm.country} onChange={(e)=>setKycForm(p=>({ ...p, country: e.target.value }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed" />
                    </label>
                  </div>

                  <div className="mt-6 grid md:grid-cols-3 gap-4">
                    <KycUpload
                      title="Selfie photo"
                      url={kycForm.photoUrl}
                      uploading={kycUploading.photoUrl}
                      disabled={kycReadOnly}
                      onFile={(f)=>uploadKycFile('photoUrl', f)}
                    />
                    <KycUpload
                      title="PAN photo"
                      url={kycForm.panPhotoUrl}
                      uploading={kycUploading.panPhotoUrl}
                      disabled={kycReadOnly}
                      onFile={(f)=>uploadKycFile('panPhotoUrl', f)}
                    />
                    <KycUpload
                      title="Aadhaar photo"
                      url={kycForm.aadhaarPhotoUrl}
                      uploading={kycUploading.aadhaarPhotoUrl}
                      disabled={kycReadOnly}
                      onFile={(f)=>uploadKycFile('aadhaarPhotoUrl', f)}
                    />
                  </div>

                  <div className="mt-6 flex items-start gap-2">
                    <input disabled={kycReadOnly} id="kyc-consent" type="checkbox" checked={!!kycForm.consent} onChange={(e)=>setKycForm(p=>({ ...p, consent: e.target.checked }))} className="mt-1 disabled:cursor-not-allowed" />
                    <label htmlFor="kyc-consent" className="text-sm text-gray-700">I confirm these details are correct and I consent to KYC verification.</label>
                  </div>

                  <div className="mt-6 flex items-center justify-end gap-2">
                    <button type="button" onClick={loadKyc} className="px-3 py-2 rounded-md text-sm bg-gray-100" disabled={kycLoading || kycSaving}>Refresh</button>
                    <button type="button" onClick={saveKyc} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gray-900 disabled:opacity-50" disabled={kycReadOnly || kycSaving || kycLoading || kycUploading.photoUrl || kycUploading.panPhotoUrl || kycUploading.aadhaarPhotoUrl}> {kycSaving ? 'Saving…' : (kycLockedByDefault ? 'Resubmit KYC' : 'Submit KYC')} </button>
                  </div>
                </Panel>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="mt-6 grid lg:grid-cols-3 gap-6">
              <Panel gradient>
                <h2 className="font-semibold">Payment Status</h2>
                <div className="mt-3 text-sm text-gray-700 space-y-2">
                  <KeyValue k="Methods" v={String(payItems.length)} />
                  <KeyValue k="Preferred" v={(payItems.find(x=>x?.isPreferred)?.type) || '—'} />
                  <KeyValue k="Status" v={(payItems.find(x=>x?.isPreferred)?.status) || '—'} />
                </div>
                {payLoading && <div className="mt-3 text-xs text-gray-600">Loading…</div>}
                {payError && <div className="mt-3 text-xs text-red-600">{payError}</div>}
                {payMessage && <div className="mt-3 text-xs text-emerald-700">{payMessage}</div>}
              </Panel>

              <div className="lg:col-span-2">
                <Panel>
                  <h2 className="font-semibold">Update Payment Method</h2>
                  <div className="mt-4 grid md:grid-cols-2 gap-4">
                    <label className="text-sm text-gray-700">Type
                      <select value={payForm.type} onChange={(e)=>setPayForm(p=>({ ...p, type: e.target.value }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500">
                        <option value="bank">Bank</option>
                        <option value="upi">UPI</option>
                      </select>
                    </label>
                    <label className="text-sm text-gray-700">Account holder name
                      <input value={payForm.accountHolderName} onChange={(e)=>setPayForm(p=>({ ...p, accountHolderName: e.target.value }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500" />
                    </label>

                    {payForm.type === 'bank' ? (
                      <>
                        <label className="text-sm text-gray-700">Bank name
                          <input value={payForm.bankName} onChange={(e)=>setPayForm(p=>({ ...p, bankName: e.target.value }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500" />
                        </label>
                        <label className="text-sm text-gray-700">IFSC
                          <input value={payForm.bankIfsc} onChange={(e)=>setPayForm(p=>({ ...p, bankIfsc: e.target.value.toUpperCase() }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500" placeholder="SBIN0001234" />
                        </label>
                        <label className="text-sm text-gray-700 md:col-span-2">Account number
                          <input value={payForm.bankAccountNumber} onChange={(e)=>setPayForm(p=>({ ...p, bankAccountNumber: e.target.value.replace(/[^0-9]/g,'') }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500" placeholder="123456789012" />
                          <div className="mt-1 text-[11px] text-gray-500">We show only masked account number after saving.</div>
                        </label>
                      </>
                    ) : (
                      <label className="text-sm text-gray-700 md:col-span-2">UPI ID
                        <input value={payForm.upiId} onChange={(e)=>setPayForm(p=>({ ...p, upiId: e.target.value }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500" placeholder="name@bank" />
                      </label>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <input id="pay-preferred" type="checkbox" checked={!!payForm.isPreferred} onChange={(e)=>setPayForm(p=>({ ...p, isPreferred: e.target.checked }))} />
                    <label htmlFor="pay-preferred" className="text-sm text-gray-700">Set as preferred</label>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <button type="button" onClick={loadPayments} className="px-3 py-2 rounded-md text-sm bg-gray-100" disabled={payLoading || paySaving}>Refresh</button>
                    <button type="button" onClick={savePayment} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gray-900 disabled:opacity-50" disabled={paySaving || payLoading}>{paySaving ? 'Saving…' : 'Save payment method'}</button>
                  </div>

                  {payItems.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-semibold text-gray-900">Saved methods</h3>
                      <div className="mt-3 space-y-2">
                        {payItems.map((m) => (
                          <div key={m.ulid || m.id} className="rounded-xl bg-gray-50 ring-1 ring-gray-200 px-4 py-3 text-sm text-gray-800 flex items-center justify-between">
                            <div>
                              <div className="font-medium">{m.type === 'bank' ? `${m.bankName || 'Bank'} • ${m.bankAccountNumberMasked || ''}` : `UPI • ${m.upiIdMasked || ''}`}</div>
                              <div className="text-xs text-gray-600">{m.accountHolderName || '—'} • {m.status || '—'} {m.isPreferred ? '• Preferred' : ''}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Panel>
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="mt-6 grid lg:grid-cols-3 gap-6">
              <Panel gradient>
                <h2 className="font-semibold">Ads Budget</h2>
                <div className="mt-3 text-sm text-gray-700 space-y-2">
                  <KeyValue k="Items" v={String(pricingItems.length)} />
                  <KeyValue k="Negotiable" v={pricingNegotiable ? 'Yes' : 'No'} />
                </div>
                {pricingLoading && <div className="mt-3 text-xs text-gray-600">Loading…</div>}
                {pricingError && <div className="mt-3 text-xs text-red-600">{pricingError}</div>}
                {pricingMessage && <div className="mt-3 text-xs text-emerald-700">{pricingMessage}</div>}
                <div className="mt-4 text-xs text-gray-600">Set your rates so brands can budget faster.</div>
              </Panel>

              <div className="lg:col-span-2">
                <Panel>
                  <h2 className="font-semibold">Ad Pricing</h2>

                  <div className="mt-4 grid md:grid-cols-3 gap-3">
                    <label className="text-sm text-gray-700">Type
                      <select value={pricingNewType} onChange={(e)=>setPricingNewType(e.target.value)} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500">
                        <option value="Reel Ad">Reel Ad</option>
                        <option value="Story Ad">Story Ad</option>
                        <option value="Post Ad">Post Ad</option>
                        <option value="Campaign Pack">Campaign Pack</option>
                        <option value="Other">Other</option>
                      </select>
                    </label>
                    <label className="text-sm text-gray-700">Amount
                      <input value={pricingNewAmount} onChange={(e)=>setPricingNewAmount(e.target.value.replace(/[^0-9.]/g,''))} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500" placeholder="0" />
                    </label>
                    <div className="flex items-end">
                      <button
                        type="button"
                        className="w-full px-3 py-2 rounded-md text-sm font-medium text-white bg-gray-900 disabled:opacity-50"
                        disabled={pricingSaving || pricingLoading}
                        onClick={() => {
                          const name = (pricingNewType === 'Other' ? pricingOtherName : pricingNewType).toString().trim();
                          const amount = Number(pricingNewAmount);
                          if (!name) return;
                          if (!Number.isFinite(amount)) return;
                          setPricingItems((prev) => {
                            const existingIdx = prev.findIndex((p) => (p?.name || '').toString().trim().toLowerCase() === name.toLowerCase());
                            if (existingIdx >= 0) {
                              const next = [...prev];
                              next[existingIdx] = { ...next[existingIdx], name, amount };
                              return next;
                            }
                            return [...prev, { name, amount }];
                          });
                          setPricingNewAmount('');
                          setPricingOtherName('');
                          setPricingNewType('Reel Ad');
                        }}
                      >
                        Add / Update
                      </button>
                    </div>

                    {pricingNewType === 'Other' && (
                      <label className="text-sm text-gray-700 md:col-span-2">Other name
                        <input value={pricingOtherName} onChange={(e)=>setPricingOtherName(e.target.value)} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500" placeholder="e.g., YouTube Short" />
                      </label>
                    )}
                  </div>

                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-900">Your rate card</h3>
                    {(pricingItems.length === 0) ? (
                      <div className="mt-2 text-sm text-gray-600">No pricing set yet.</div>
                    ) : (
                      <div className="mt-3 space-y-2">
                        {pricingItems.map((it) => (
                          <div key={it.name} className="rounded-xl bg-gray-50 ring-1 ring-gray-200 px-4 py-3 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{it.name}</div>
                              <div className="text-xs text-gray-600">₹ {Number(it.amount).toLocaleString('en-IN')}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                value={String(it.amount ?? '')}
                                onChange={(e)=>{
                                  const v = e.target.value.replace(/[^0-9.]/g,'');
                                  setPricingItems((prev)=>prev.map((p)=>p.name===it.name?{...p, amount: v === '' ? '' : Number(v)}:p));
                                }}
                                className="w-28 rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 text-sm"
                                inputMode="decimal"
                              />
                              <button type="button" className="px-3 py-2 rounded-md text-xs font-medium bg-white ring-1 ring-gray-200" onClick={()=>setPricingItems((prev)=>prev.filter((p)=>p.name!==it.name))}>Remove</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex items-center gap-2">
                    <input id="pricing-neg" type="checkbox" checked={!!pricingNegotiable} onChange={(e)=>setPricingNegotiable(e.target.checked)} />
                    <label htmlFor="pricing-neg" className="text-sm text-gray-700">Negotiable</label>
                  </div>

                  <div className="mt-4">
                    <label className="text-sm text-gray-700">Notes (optional)
                      <textarea value={pricingNotes} onChange={(e)=>setPricingNotes(e.target.value)} rows={3} className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500" placeholder="Add any pricing notes for brands…" />
                    </label>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <button type="button" onClick={loadPricing} className="px-3 py-2 rounded-md text-sm bg-gray-100" disabled={pricingLoading || pricingSaving}>Refresh</button>
                    <button type="button" onClick={savePricing} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gray-900 disabled:opacity-50" disabled={pricingSaving || pricingLoading}>{pricingSaving ? 'Saving…' : 'Save pricing'}</button>
                  </div>
                </Panel>
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <>
          <div className="mt-6 grid md:grid-cols-4 gap-4">
            <Metric title="Active briefs" value={String(metrics?.activeBriefs ?? '-') } trend=""/>
            <Metric title="Pending approvals" value={String(metrics?.pendingApprovals ?? '-') } trend=""/>
            <Metric title="Earnings (month)" value={metrics?.earningsMonth != null ? formatPrice(metrics.earningsMonth, currency, { assumesUSD: false }) : '-'} trend=""/>
            <Metric title="Payout status" value={nextPayout ? `Next: ${formatDate(nextPayout)}` : '-'} trend=""/>
          </div>

          {/* Influencer Ads Media Showcase */}
          <div className="mt-8">
            <h2 className="font-semibold">Your Ad Media</h2>
            <p className="text-sm text-gray-600">Recent ad videos linked to your posts. Brands can quickly assess fit.</p>
            <div className="mt-3 relative">
              {/* Desktop controls */}
              <div className="hidden md:flex items-center gap-2 absolute -top-11 right-0">
                <button
                  type="button"
                  onClick={()=>scrollMediaRow('left')}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 ring-1 ring-gray-200 text-gray-800"
                >Left</button>
                <button
                  type="button"
                  onClick={()=>scrollMediaRow('right')}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 ring-1 ring-gray-200 text-gray-800"
                >Right</button>
              </div>

              {/* One-row, swipeable carousel (mobile swipe + desktop scroll) */}
              <div
                ref={mediaRowRef}
                className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scroll-smooth -mx-4 px-4"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {media.map((m, i) => {
                  const guid = m?.guid || m?.ulid || m?.id || m?.mediaGuid || '';
                  const deleting = !!deletingGuid && deletingGuid === guid;
                  return (
                  <div
                    key={guid || i}
                    className="snap-center shrink-0 w-[85vw] max-w-[360px] sm:w-[320px] rounded-xl overflow-hidden ring-1 ring-gray-200 bg-white"
                  >
                  {/* Force portrait 9:16 viewport for short-form ads */}
                  <div className="aspect-[9/16] relative">
                    {!!guid && (
                      <button
                        type="button"
                        onClick={async () => {
                          if (!guid || deletingGuid) return;
                          setDeletingGuid(guid);
                          setUploadError('');
                          try {
                            await apiClient.request(`/influencers/me/ads/video/${encodeURIComponent(guid)}`, {
                              method: 'DELETE',
                            });
                            setMedia((prev) => (Array.isArray(prev) ? prev.filter((x) => {
                              const xGuid = x?.guid || x?.ulid || x?.id || x?.mediaGuid || '';
                              return xGuid !== guid;
                            }) : prev));
                          } catch (e) {
                            const msg = typeof e?.message === 'string' ? e.message : 'Failed to delete video.';
                            setUploadError(msg);
                          } finally {
                            setDeletingGuid('');
                          }
                        }}
                        disabled={deleting}
                        className="absolute top-2 right-2 z-10 inline-flex items-center justify-center h-9 w-9 rounded-full bg-white/95 ring-1 ring-gray-200 text-gray-700 hover:bg-white disabled:opacity-60"
                        aria-label="Delete video"
                        title="Delete"
                      >
                        {deleting ? (
                          <span className="text-xs">…</span>
                        ) : (
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
                            <path d="M6 6l1 16h10l1-16" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                          </svg>
                        )}
                      </button>
                    )}
                    <iframe
                      src={buildPlaybackUrl(m.playbackUrl, { autoplay: true, muted: true })}
                      title={m.meta?.title || `Ad ${m.ulid}`}
                      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                  <div className="p-3 text-xs text-gray-700 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{m.meta?.title || 'Ad video'}</div>
                      <div className="text-[11px] text-gray-600">{m.post?.caption || ''} • {m.post?.language || ''}</div>
                    </div>
                    <div className="text-[11px] px-2 py-0.5 rounded-md bg-gray-50 ring-1 ring-gray-200">{(m.durationSec||0)}s</div>
                  </div>
                  <div className="p-3 pt-0 flex items-center gap-2">
                    <span className="text-[11px] text-gray-600">Videos auto-play muted. Click player to unmute.</span>
                  </div>
                  </div>

                );
                })}
              </div>
            </div>
          </div>


          
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <Panel gradient>
              <h2 className="font-semibold">Content Calendar</h2>
              <div className="mt-3 grid grid-cols-7 gap-2 text-xs">
                {calendarDays.length === 0 && (
                  Array.from({ length: 14 }).map((_, i) => (
                    <div key={i} className={`h-16 rounded-md border border-gray-200`}></div>
                  ))
                )}
                {calendarDays.map((d, i) => (
                  <div key={i} className={`h-16 rounded-md border ${d.hasTask? 'bg-orange-50 border-orange-200':'border-gray-200'}`}>
                    <div className="p-2 text-gray-700">
                      <div className="font-medium text-[10px]">{formatDate(d.date)}</div>
                      {d.hasTask && <div className="mt-1 inline-block text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">Task</div>}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel>
              <h2 className="font-semibold">Briefs & Deliverables</h2>
              <table className="mt-3 w-full text-sm">
                <thead>
                  <tr className="text-gray-500">
                    <th className="text-left py-2">Campaign</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Due</th>
                    <th className="text-left py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800">
                  {briefs.map((b, i) => (
                    <Row key={i} c={b.campaign} t={b.type} d={formatDate(b.due)} s={b.status} />
                  ))}
                  {briefs.length === 0 && (
                    <tr><td className="py-4 text-sm text-gray-500" colSpan={4}>No briefs available.</td></tr>
                  )}
                </tbody>
              </table>
            </Panel>

            <Panel>
              <h2 className="font-semibold">Payouts</h2>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                {payouts.map((p, i) => (
                  <li key={i} className="flex justify-between"><span>{p.month} payout</span><span className="font-medium">{formatPrice(p.amount, currency, { assumesUSD: false })} • {p.status}</span></li>
                ))}
                {payouts.length === 0 && (
                  <li className="text-gray-500">No payout history.</li>
                )}
              </ul>
              <div className="mt-4 text-xs text-gray-600">{nextPayout ? `Next payout scheduled for ${formatDate(nextPayout)}.` : 'No upcoming payout date.'}</div>
            </Panel>
          </div>
            </>
          )}
        </>
      )}
    </section>
  )
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-md text-xs font-medium ring-1 ${active ? 'bg-gray-900 text-white ring-gray-900' : 'bg-white text-gray-700 ring-gray-200 hover:bg-gray-50'}`}
    >
      {children}
    </button>
  );
}

function KeyValue({ k, v }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="text-xs text-gray-600">{k}</div>
      <div className="text-sm text-gray-900 text-right break-all">{v || '—'}</div>
    </div>
  );
}

function KycUpload({ title, url, uploading, disabled, onFile }) {
  return (
    <div className="rounded-xl bg-gray-50 ring-1 ring-gray-200 p-3">
      <div className="text-xs font-medium text-gray-900">{title}</div>
      <div className="mt-2">
        <input disabled={disabled} type="file" accept="image/*" onChange={(e)=>onFile?.(e.target.files?.[0] || null)} className="block w-full text-xs file:mr-2 file:px-3 file:py-2 file:border-0 file:bg-gray-900 file:text-white file:rounded-md truncate disabled:cursor-not-allowed disabled:opacity-60" />
      </div>
      <div className="mt-2 text-[11px] text-gray-600">
        {uploading ? 'Uploading…' : (url ? 'Uploaded' : 'Not uploaded')}
      </div>
      {url && (
        <a href={url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-[11px] text-gray-700 underline break-all">{url}</a>
      )}
    </div>
  );
}

function Metric({ title, value, trend }){
  return (
    <div className="rounded-2xl p-[1px] bg-gradient-to-br from-orange-200 to-pink-200">
      <div className="rounded-2xl bg-white p-5">
        <div className="text-xs text-gray-600">{title}</div>
        <div className="text-2xl font-semibold text-gray-900">{value}</div>
        <div className="text-xs text-gray-500 mt-1">{trend}</div>
      </div>
    </div>
  )
}

function Panel({ children, gradient }){
  return (
    <div className={`rounded-2xl p-[1px] ${gradient?'bg-gradient-to-br from-orange-200 to-pink-200':'bg-gray-200/60'}`}>
      <div className="rounded-2xl bg-white p-6">
        {children}
      </div>
    </div>
  )
}

function Row({ c, t, d, s }){
  const style = statusStyle(s);
  return (
    <tr>
      <td className="py-2">{c}</td>
      <td className="py-2">{t}</td>
      <td className="py-2">{d}</td>
      <td className="py-2">
        <span className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full text-xs font-medium ${style.bg} ${style.text} ${style.ring}`}>
          <span className={`h-2 w-2 rounded-full ${style.dot}`}></span>
          {s}
        </span>
      </td>
    </tr>
  )
}

function statusStyle(s) {
  const k = (s || '').toLowerCase();
  if (k.includes('progress')) {
    return {
      bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-1 ring-blue-200', dot: 'bg-blue-500'
    };
  }
  if (k.includes('approval') || k.includes('pending')) {
    return {
      bg: 'bg-amber-50', text: 'text-amber-800', ring: 'ring-1 ring-amber-200', dot: 'bg-amber-500'
    };
  }
  if (k.includes('assigned')) {
    return {
      bg: 'bg-gray-100', text: 'text-gray-800', ring: 'ring-1 ring-gray-300', dot: 'bg-gray-500'
    };
  }
  if (k.includes('completed') || k.includes('approved')) {
    return {
      bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-1 ring-emerald-200', dot: 'bg-emerald-500'
    };
  }
  return { bg: 'bg-gray-100', text: 'text-gray-800', ring: 'ring-1 ring-gray-300', dot: 'bg-gray-500' };
}
// Build embed URL with provider-friendly params when supported
function buildPlaybackUrl(url, { autoplay = false, muted = false } = {}) {
  try {
    if (!url) return '';
    const u = new URL(url);
    // Some providers accept true/false strings, not numeric flags
    if (autoplay) u.searchParams.set('autoplay', 'true');
    if (muted) u.searchParams.set('muted', 'true');
    return u.toString();
  } catch {
    return url;
  }
}
function SkeletonCard(){
  return (
    <div className="rounded-2xl p-[1px] bg-gray-200/60">
      <div className="rounded-2xl bg-white p-5 animate-pulse">
        <div className="h-3 w-24 bg-gray-200 rounded" />
        <div className="mt-2 h-6 w-32 bg-gray-200 rounded" />
        <div className="mt-2 h-3 w-20 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

function SkeletonPanel(){
  return (
    <div className="rounded-2xl p-[1px] bg-gray-200/60">
      <div className="rounded-2xl bg-white p-6 animate-pulse">
        <div className="h-4 w-32 bg-gray-200 rounded" />
        <div className="mt-3 grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

function formatDate(str) {
  try {
    const d = new Date(str);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return str;
  }
}

// Note: Embedded players manage audio; we avoid custom query params
// that can trigger provider validation errors.
