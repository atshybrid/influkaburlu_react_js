import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../utils/apiClient';

function Panel({ children, gradient }) {
  return (
    <div className={`rounded-2xl p-[1px] ${gradient ? 'bg-gradient-to-br from-orange-200 to-pink-200' : 'bg-gray-200/60'}`}>
      <div className="rounded-2xl bg-white p-6">{children}</div>
    </div>
  );
}

function SelectWithCustom({ label, value, options, placeholder, onChange }) {
  const normalized = (value || '').toString();
  const hasValue = !!normalized.trim();
  const inOptions = options.includes(normalized);
  const selectValue = hasValue ? (inOptions ? normalized : '__custom__') : '';

  return (
    <label className="text-sm text-gray-700">
      {label}
      <select
        value={selectValue}
        onChange={(e) => {
          const v = e.target.value;
          if (v === '__custom__') {
            if (!hasValue || inOptions) onChange('');
            return;
          }
          onChange(v);
        }}
        className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-11 px-3 bg-white"
      >
        <option value="">{placeholder || 'Select'}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
        <option value="__custom__">Custom…</option>
      </select>

      {selectValue === '__custom__' && (
        <input
          value={normalized}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-11 px-3"
          placeholder="Enter custom value"
        />
      )}
    </label>
  );
}

function SelectFixed({ label, value, options, placeholder, onChange }) {
  const v = (value || '').toString();
  return (
    <label className="text-sm text-gray-700">
      {label}
      <select
        value={v}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-11 px-3 bg-white"
      >
        <option value="">{placeholder || 'Select'}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </label>
  );
}

function CheckboxGroup({ label, value, options, columns = 2, onChange }) {
  const arr = Array.isArray(value) ? value : [];
  const gridCols = columns === 3 ? 'md:grid-cols-3' : columns === 4 ? 'md:grid-cols-4' : 'md:grid-cols-2';

  return (
    <div className="md:col-span-3">
      <div className="text-sm text-gray-700">{label}</div>
      <div className={`mt-2 grid grid-cols-1 ${gridCols} gap-2`}
      >
        {options.map((opt) => {
          const checked = arr.includes(opt);
          return (
            <label key={opt} className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => {
                  const next = e.target.checked
                    ? Array.from(new Set([...arr, opt]))
                    : arr.filter((x) => x !== opt);
                  onChange(next);
                }}
              />
              {opt}
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default function PhotoshootRequestNew() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [prefillLoading, setPrefillLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const DEFAULT_DURATION_MINUTES = 120;
  const MAX_DURATION_MINUTES = 120;
  const MIN_ADVANCE_DAYS = 1; // don't allow selecting today

  const parseLocalDateTime = (t) => {
    const s = (t || '').toString().trim();
    if (!s) return null;
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  };

  const formatLocalDateTime = (d) => {
    if (!(d instanceof Date) || Number.isNaN(d.getTime())) return '';
    const pad2 = (n) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad2(d.getMonth() + 1);
    const dd = pad2(d.getDate());
    const hh = pad2(d.getHours());
    const mi = pad2(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  };

  const diffMinutes = (startLocal, endLocal) => {
    const startD = parseLocalDateTime(startLocal);
    const endD = parseLocalDateTime(endLocal);
    if (!startD || !endD) return null;
    return Math.round((endD.getTime() - startD.getTime()) / 60000);
  };

  const datePart = (s) => (s || '').toString().slice(0, 10);
  const timePart = (s) => {
    const t = (s || '').toString();
    const idx = t.indexOf('T');
    if (idx === -1) return '';
    return t.slice(idx + 1);
  };

  const addDaysToYmd = (ymd, days) => {
    const m = (ymd || '').toString().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return '';
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return '';
    const utc = Date.UTC(y, mo - 1, d) + (Number(days) || 0) * 86400000;
    return new Date(utc).toISOString().slice(0, 10);
  };

  const minRequestDate = useMemo(() => {
    try {
      const tz = 'Asia/Kolkata';
      const todayYmd = new Intl.DateTimeFormat('en-CA', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date());
      return addDaysToYmd(todayYmd, MIN_ADVANCE_DAYS);
    } catch {
      // Fallback: tomorrow in local timezone
      const d = new Date();
      d.setDate(d.getDate() + MIN_ADVANCE_DAYS);
      return d.toISOString().slice(0, 10);
    }
  }, []);

  const [form, setForm] = useState({
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
        preferredDressingStyle: [],
        traditionalWearType: [],
        westernWearType: [],
        preferredOutfitColors: [],
        preferredOutfitColorsCsv: '',
      },
      shootPreferences: {
        shootStyle: [],
        poseComfortLevel: '',
        boldnessLevel: '',
        sleevelessAllowed: true,
        cameraFacingComfort: true,
        shootType: [],
        shootTypeCsv: '',
      },
      stylingPermissions: {
        makeupPreference: '',
        accessoriesAllowed: true,
      },
      editingAndUsage: {
        usagePermission: [],
        photoshopBrandingAllowed: true,
      },
      consent: {
        publicDisplayConsent: true,
        termsAccepted: true,
        date: new Date().toISOString().slice(0, 10),
      },
    },
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      setPrefillLoading(true);
      try {
        const me = await apiClient.request('/influencers/me', { method: 'GET' });
        if (!mounted) return;
        const firstNonEmpty = (...values) => {
          for (const v of values) {
            const s = (v ?? '').toString().trim();
            if (s) return s;
          }
          return '';
        };

        const joinName = (a, b) => {
          const x = (a ?? '').toString().trim();
          const y = (b ?? '').toString().trim();
          if (x && y) return `${x} ${y}`;
          return x || y || '';
        };

        const fullName = firstNonEmpty(
          me?.fullName,
          me?.full_name,
          me?.name,
          joinName(me?.firstName, me?.lastName),
          joinName(me?.first_name, me?.last_name),
          me?.profile?.fullName,
          me?.profile?.full_name,
          me?.profile?.name,
          joinName(me?.profile?.firstName, me?.profile?.lastName),
          joinName(me?.profile?.first_name, me?.profile?.last_name),
          me?.user?.fullName,
          me?.user?.full_name,
          me?.user?.name,
          joinName(me?.user?.firstName, me?.user?.lastName),
          joinName(me?.user?.first_name, me?.user?.last_name)
        );

        const city = firstNonEmpty(
          me?.city,
          me?.cityName,
          me?.city_name,
          me?.profile?.city,
          me?.profile?.cityName,
          me?.profile?.city_name,
          me?.location?.city,
          me?.address?.city,
          me?.user?.city,
          me?.user?.profile?.city
        );

        setForm((p) => ({
          ...p,
          influencerAppointmentDetails: {
            ...p.influencerAppointmentDetails,
            personal: {
              ...p.influencerAppointmentDetails.personal,
              city: city || p.influencerAppointmentDetails.personal.city,
              fullName: fullName || p.influencerAppointmentDetails.personal.fullName,
            },
          },
        }));
      } catch {
        // Prefill is best-effort only
      } finally {
        if (mounted) setPrefillLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const slotValid = useMemo(() => {
    const a = (form.requestedStartAtLocal || '').toString().trim();
    const b = (form.requestedEndAtLocal || '').toString().trim();
    return !!(a && b);
  }, [form.requestedStartAtLocal, form.requestedEndAtLocal]);

  const OPTIONS = useMemo(() => ({
    gender: ['male', 'female', 'other'],
    bodyType: ['Slim', 'Athletic', 'Average', 'Curvy', 'Plus Size'],
    skinTone: ['Very Fair', 'Fair', 'Wheatish', 'Medium', 'Dusky', 'Dark'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    fit: ['Slim', 'Regular', 'Loose'],
    dressingStyle: ['Traditional', 'Western', 'Casual', 'Formal', 'Ethnic Modern'],
    traditionalWearType: ['Saree', 'Kurta', 'Lehenga', 'Dhoti'],
    westernWearType: ['Jeans & Top', 'Dress / Gown', 'Suit / Blazer'],
    shootStyle: ['Professional', 'Lifestyle', 'Cinematic', 'Casual'],
    poseComfort: ['Normal', 'Confident', 'Expressive'],
    boldness: ['Normal', 'Semi-Bold', 'Bold'],
    makeup: ['Natural', 'Glam', 'Heavy'],
    usagePermission: ['Website', 'Ads', 'Social Media', 'InfluKaburlu Website', 'Ads & Promotions', 'SEO & Google Indexing'],
    shootType: ['Indoor', 'Outdoor', 'Studio'],
    outfitColors: ['Black', 'White', 'Blue', 'Red', 'Green', 'Pink', 'Yellow', 'Orange', 'Purple', 'Brown', 'Beige', 'Grey'],
  }), []);

  async function submitRequest() {
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      const toIsoOrNull = (local, tz) => {
        const t = (local || '').toString().trim();
        if (!t) return null;

        // datetime-local yields "YYYY-MM-DDTHH:mm". Backend Swagger examples use an explicit offset.
        // Since we lock requestedTimezone to Asia/Kolkata, emit an IST offset string to match Swagger.
        if ((tz || '').toString().trim() === 'Asia/Kolkata') {
          const m = t.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
          if (!m) return null;
          return `${t}:00+05:30`;
        }

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

      const requireOne = (arr, label) => {
        if (!Array.isArray(arr) || arr.length === 0) {
          throw new Error(`${label} is required.`);
        }
      };

      const requireEnum = (value, allowed, label) => {
        const v = (value || '').toString().trim();
        if (!v) throw new Error(`${label} is required.`);
        if (Array.isArray(allowed) && allowed.length && !allowed.includes(v)) {
          throw new Error(`${label} is invalid. Allowed: ${allowed.join(', ')}`);
        }
        return v;
      };

      const requireEnumArray = (values, allowed, label) => {
        requireOne(values, label);
        const invalid = values.filter((v) => !allowed.includes(v));
        if (invalid.length) {
          throw new Error(`${label} contains invalid values: ${invalid.join(', ')}. Allowed: ${allowed.join(', ')}`);
        }
      };

      const tz = (form.requestedTimezone || 'Asia/Kolkata').toString();
      const requestedStartAt = toIsoOrNull(form.requestedStartAtLocal, tz);
      const requestedEndAt = toIsoOrNull(form.requestedEndAtLocal, tz);
      if (!requestedStartAt || !requestedEndAt) {
        throw new Error('Please select requested start and end time.');
      }

      const selectedDate = datePart(form.requestedStartAtLocal);
      if (minRequestDate && selectedDate && selectedDate < minRequestDate) {
        throw new Error(`Please select a date from ${minRequestDate} onwards.`);
      }

      const startD = new Date(requestedStartAt);
      const endD = new Date(requestedEndAt);
      if (!Number.isFinite(startD.getTime()) || !Number.isFinite(endD.getTime())) {
        throw new Error('Requested start/end time is invalid.');
      }
      if (endD.getTime() <= startD.getTime()) {
        throw new Error('Requested end time must be after start time.');
      }

      const minutesLocal = diffMinutes(form.requestedStartAtLocal, form.requestedEndAtLocal);
      if (minutesLocal != null && minutesLocal > MAX_DURATION_MINUTES) {
        throw new Error(`Duration is too long. Please keep it within ${MAX_DURATION_MINUTES} minutes.`);
      }

      const d = form.influencerAppointmentDetails;
      const locationCity = (d?.personal?.city || '').toString();

      const shootStyle = Array.isArray(d?.shootPreferences?.shootStyle) ? d.shootPreferences.shootStyle : [];
      requireEnumArray(shootStyle, OPTIONS.shootStyle, 'Shoot style');

      const preferredDressingStyle = Array.isArray(d?.dressDetails?.preferredDressingStyle) ? d.dressDetails.preferredDressingStyle : [];
      requireEnumArray(preferredDressingStyle, OPTIONS.dressingStyle, 'Preferred dressing style');

      const preferredOutfitColorsSelected = Array.isArray(d?.dressDetails?.preferredOutfitColors) ? d.dressDetails.preferredOutfitColors : [];
      const preferredOutfitColorsOther = csvToArr(d?.dressDetails?.preferredOutfitColorsCsv);
      const preferredOutfitColors = Array.from(new Set([...preferredOutfitColorsSelected, ...preferredOutfitColorsOther]));
      requireOne(preferredOutfitColors, 'Preferred outfit colors');

      const westernWearType = Array.isArray(d?.dressDetails?.westernWearType) ? d.dressDetails.westernWearType : [];
      const traditionalWearType = Array.isArray(d?.dressDetails?.traditionalWearType) ? d.dressDetails.traditionalWearType : [];
      if (preferredDressingStyle.includes('Western')) {
        requireEnumArray(westernWearType, OPTIONS.westernWearType, 'Western wear type');
      }
      if (preferredDressingStyle.includes('Traditional')) {
        requireEnumArray(traditionalWearType, OPTIONS.traditionalWearType, 'Traditional wear type');
      }

      const usagePermission = Array.isArray(d?.editingAndUsage?.usagePermission) ? d.editingAndUsage.usagePermission : [];
      requireEnumArray(usagePermission, OPTIONS.usagePermission, 'Usage permission');

      const shootTypeSelected = Array.isArray(d?.shootPreferences?.shootType) ? d.shootPreferences.shootType : [];
      const shootTypeOther = csvToArr(d?.shootPreferences?.shootTypeCsv);
      const shootType = Array.from(new Set([...shootTypeSelected, ...shootTypeOther]));

      const heightCm = toNumOrUndef(d?.bodyMeasurements?.heightCm);
      const shoeSize = toNumOrUndef(d?.bodyMeasurements?.shoeSize);
      if (!Number.isFinite(heightCm) || heightCm <= 0) {
        throw new Error('Height (cm) is required and must be a positive number.');
      }
      if (!Number.isFinite(shoeSize) || shoeSize <= 0) {
        throw new Error('Shoe size is required and must be a positive number.');
      }

      if (!d?.consent?.date) throw new Error('Consent date is required.');
      if (!d?.consent?.termsAccepted) throw new Error('You must accept the terms to submit.');

      const payload = {
        requestedTimezone: tz,
        requestedStartAt,
        requestedEndAt,
        location: {
          city: locationCity,
        },
        details: {
          influencerAppointmentDetails: {
            personal: {
              fullName: (d.personal.fullName || '').toString(),
              city: (d.personal.city || '').toString(),
              gender: requireEnum(d.personal.gender, OPTIONS.gender, 'Gender'),
              bodyType: requireEnum(d.personal.bodyType, OPTIONS.bodyType, 'Body type'),
              skinTone: requireEnum(d.personal.skinTone, OPTIONS.skinTone, 'Skin tone'),
            },
            bodyMeasurements: {
              heightCm,
              shoeSize,
            },
            dressDetails: {
              topSize: requireEnum(d.dressDetails.topSize, OPTIONS.sizes, 'Top size'),
              bottomSize: requireEnum(d.dressDetails.bottomSize, OPTIONS.sizes, 'Bottom size'),
              dressSize: requireEnum(d.dressDetails.dressSize, OPTIONS.sizes, 'Dress size'),
              preferredFit: requireEnum(d.dressDetails.preferredFit, OPTIONS.fit, 'Preferred fit'),
              preferredDressingStyle,
              ...(traditionalWearType.length ? { traditionalWearType } : {}),
              ...(westernWearType.length ? { westernWearType } : {}),
              preferredOutfitColors,
            },
            shootPreferences: {
              shootStyle,
              poseComfortLevel: requireEnum(d.shootPreferences.poseComfortLevel, OPTIONS.poseComfort, 'Pose comfort level'),
              boldnessLevel: requireEnum(d.shootPreferences.boldnessLevel, OPTIONS.boldness, 'Boldness level'),
              sleevelessAllowed: !!d.shootPreferences.sleevelessAllowed,
              cameraFacingComfort: !!d.shootPreferences.cameraFacingComfort,
              ...(shootType.length ? { shootType } : {}),
            },
            stylingPermissions: {
              makeupPreference: requireEnum(d.stylingPermissions.makeupPreference, OPTIONS.makeup, 'Makeup preference'),
              accessoriesAllowed: !!d.stylingPermissions.accessoriesAllowed,
            },
            editingAndUsage: {
              usagePermission,
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

      await apiClient.request('/influencers/me/photoshoots/requests/submit', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setMessage('Photoshoot request submitted.');
      setTimeout(() => {
        navigate('/dashboard-influencer?tab=photoshoot');
      }, 600);
    } catch (e) {
      const raw = (e?.data?.message || e?.data?.error || e?.message || '').toString();
      if (raw === 'shoot_style_invalid') {
        setError('Shoot style is invalid. Please pick from the allowed values.');
      } else if (raw === 'shoot_type_invalid') {
        setError('Shoot type is invalid. Please select only allowed values (and remove any custom values).');
      } else if (raw === 'booking_too_soon') {
        setError('Selected slot is too soon. Please choose a later start time (at least a few hours/days ahead per policy).');
      } else if (raw === 'duration_too_long') {
        setError(`Selected slot duration is too long. Please keep it within ${MAX_DURATION_MINUTES} minutes.`);
      } else {
        setError(raw || 'Failed to submit photoshoot request.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">New Photoshoot Request</h1>
          <div className="mt-1 text-sm text-gray-600">Choose your preferred time and share your shoot preferences.</div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/dashboard-influencer?tab=photoshoot')}
          className="px-3 py-2 rounded-md text-sm bg-gray-100 ring-1 ring-gray-200"
        >
          Back
        </button>
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        <Panel gradient>
          <h2 className="font-semibold">Request Summary</h2>
          <div className="mt-2 text-xs text-gray-600">Review and submit your request.</div>
          {error && <div className="mt-3 text-xs text-red-600">{error}</div>}
          {message && <div className="mt-3 text-xs text-emerald-700">{message}</div>}

          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-white/70 ring-1 ring-white/60 px-4 py-3">
              <div className="text-xs text-gray-600">Requested timezone</div>
              <div className="mt-1 text-sm font-semibold text-gray-900">{(form.requestedTimezone || 'Asia/Kolkata').toString()}</div>
            </div>
            <div className="rounded-xl bg-white/70 ring-1 ring-white/60 px-4 py-3">
              <div className="text-xs text-gray-600">Requested slot</div>
              <div className="mt-1 text-sm font-semibold text-gray-900">
                {slotValid
                  ? `${datePart(form.requestedStartAtLocal)} ${timePart(form.requestedStartAtLocal) || '00:00'} → ${datePart(form.requestedEndAtLocal)} ${timePart(form.requestedEndAtLocal) || ''}`
                  : 'Select requested date'}
              </div>
            </div>
            <div className="rounded-xl bg-white/70 ring-1 ring-white/60 px-4 py-3">
              <div className="text-xs text-gray-600">Profile city</div>
              <div className="mt-1 text-sm font-semibold text-gray-900">{form.influencerAppointmentDetails.personal.city || '—'}</div>
              <div className="mt-1 text-[11px] text-gray-600">City is taken from your profile and sent automatically.</div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end">
            <button
              type="button"
              onClick={submitRequest}
              disabled={submitting}
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gray-900 disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
        </Panel>

        <div className="lg:col-span-2 space-y-6">
          <Panel>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">Requested Slot</h2>
                <div className="mt-1 text-xs text-gray-600">Pick your preferred time window.</div>
              </div>
              {prefillLoading && <div className="text-xs text-gray-600">Loading profile…</div>}
            </div>

            <div className="mt-4 grid md:grid-cols-3 gap-4">
              <label className="text-sm text-gray-700 md:col-span-1">Timezone
                <input
                  value={form.requestedTimezone}
                  readOnly
                  className="mt-1 w-full rounded-md border-gray-300 h-11 px-3 bg-gray-50"
                />
              </label>
              <label className="text-sm text-gray-700 md:col-span-1">Requested date
                <input
                  type="date"
                  value={datePart(form.requestedStartAtLocal)}
                  min={minRequestDate}
                  onChange={(e) => {
                    const raw = (e.target.value || '').toString().trim();
                    const d = minRequestDate && raw && raw < minRequestDate ? minRequestDate : raw;
                    const nextStart = d ? `${d}T00:00` : '';
                    setForm((p) => {
                      const minutes = diffMinutes(nextStart, p.requestedEndAtLocal);
                      const needsAuto = !p.requestedEndAtLocal || minutes == null || minutes <= 0 || minutes > MAX_DURATION_MINUTES;
                      if (!needsAuto) return { ...p, requestedStartAtLocal: nextStart };
                      const sd = parseLocalDateTime(nextStart);
                      if (!sd) return { ...p, requestedStartAtLocal: nextStart };
                      const endD = new Date(sd.getTime() + DEFAULT_DURATION_MINUTES * 60000);
                      return { ...p, requestedStartAtLocal: nextStart, requestedEndAtLocal: formatLocalDateTime(endD) };
                    });
                  }}
                  className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-11 px-3"
                />
              </label>
              <label className="text-sm text-gray-700 md:col-span-1">Requested end (auto)
                <input
                  value={form.requestedEndAtLocal ? `${datePart(form.requestedEndAtLocal)} ${timePart(form.requestedEndAtLocal)}` : ''}
                  placeholder={form.requestedStartAtLocal ? 'Auto-calculated' : '—'}
                  readOnly
                  className="mt-1 w-full rounded-md border-gray-300 h-11 px-3 bg-gray-50"
                />
              </label>
            </div>
            <div className="mt-2 text-xs text-gray-600">Select date from {minRequestDate} onwards. Time is set automatically (start 00:00, duration {MAX_DURATION_MINUTES} minutes).</div>
          </Panel>

          <Panel>
            <h2 className="font-semibold">Influencer Details</h2>
            <div className="mt-1 text-xs text-gray-600">These help the team prepare wardrobe, styling and shoot setup.</div>

            <h3 className="mt-5 text-sm font-semibold text-gray-900">Personal</h3>
            <div className="mt-3 grid md:grid-cols-3 gap-4">
              <label className="text-sm text-gray-700">Full name
                <input
                  value={form.influencerAppointmentDetails.personal.fullName}
                  placeholder={prefillLoading ? 'Loading…' : '—'}
                  readOnly
                  className="mt-1 w-full rounded-md border-gray-300 h-11 px-3 bg-gray-50"
                />
              </label>
              <label className="text-sm text-gray-700">City
                <input
                  value={form.influencerAppointmentDetails.personal.city}
                  placeholder={prefillLoading ? 'Loading…' : '—'}
                  readOnly
                  className="mt-1 w-full rounded-md border-gray-300 h-11 px-3 bg-gray-50"
                />
              </label>
              <SelectWithCustom
                label="Gender"
                value={form.influencerAppointmentDetails.personal.gender}
                options={OPTIONS.gender}
                placeholder="Select gender"
                onChange={(v) => setForm((p) => ({
                  ...p,
                  influencerAppointmentDetails: {
                    ...p.influencerAppointmentDetails,
                    personal: { ...p.influencerAppointmentDetails.personal, gender: v },
                  },
                }))}
              />
              <SelectWithCustom
                label="Body type"
                value={form.influencerAppointmentDetails.personal.bodyType}
                options={OPTIONS.bodyType}
                placeholder="Select body type"
                onChange={(v) => setForm((p) => ({
                  ...p,
                  influencerAppointmentDetails: {
                    ...p.influencerAppointmentDetails,
                    personal: { ...p.influencerAppointmentDetails.personal, bodyType: v },
                  },
                }))}
              />
              <SelectWithCustom
                label="Skin tone"
                value={form.influencerAppointmentDetails.personal.skinTone}
                options={OPTIONS.skinTone}
                placeholder="Select skin tone"
                onChange={(v) => setForm((p) => ({
                  ...p,
                  influencerAppointmentDetails: {
                    ...p.influencerAppointmentDetails,
                    personal: { ...p.influencerAppointmentDetails.personal, skinTone: v },
                  },
                }))}
              />
            </div>

            <h3 className="mt-6 text-sm font-semibold text-gray-900">Body measurements</h3>
            <div className="mt-3 grid md:grid-cols-3 gap-4">
              <label className="text-sm text-gray-700">Height (cm)
                <input
                  type="number"
                  min="0"
                  value={form.influencerAppointmentDetails.bodyMeasurements.heightCm}
                  onChange={(e) => setForm((p) => ({
                    ...p,
                    influencerAppointmentDetails: {
                      ...p.influencerAppointmentDetails,
                      bodyMeasurements: { ...p.influencerAppointmentDetails.bodyMeasurements, heightCm: e.target.value },
                    },
                  }))}
                  className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-11 px-3"
                />
              </label>
              <label className="text-sm text-gray-700">Shoe size
                <input
                  type="number"
                  min="0"
                  value={form.influencerAppointmentDetails.bodyMeasurements.shoeSize}
                  onChange={(e) => setForm((p) => ({
                    ...p,
                    influencerAppointmentDetails: {
                      ...p.influencerAppointmentDetails,
                      bodyMeasurements: { ...p.influencerAppointmentDetails.bodyMeasurements, shoeSize: e.target.value },
                    },
                  }))}
                  className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-11 px-3"
                />
              </label>
            </div>

            <h3 className="mt-6 text-sm font-semibold text-gray-900">Dress details</h3>
            <div className="mt-3 grid md:grid-cols-3 gap-4">
              <SelectFixed
                label="Top size"
                value={form.influencerAppointmentDetails.dressDetails.topSize}
                options={OPTIONS.sizes}
                placeholder="Select size"
                onChange={(v) => setForm((p) => ({
                  ...p,
                  influencerAppointmentDetails: {
                    ...p.influencerAppointmentDetails,
                    dressDetails: { ...p.influencerAppointmentDetails.dressDetails, topSize: v },
                  },
                }))}
              />
              <SelectFixed
                label="Bottom size"
                value={form.influencerAppointmentDetails.dressDetails.bottomSize}
                options={OPTIONS.sizes}
                placeholder="Select size"
                onChange={(v) => setForm((p) => ({
                  ...p,
                  influencerAppointmentDetails: {
                    ...p.influencerAppointmentDetails,
                    dressDetails: { ...p.influencerAppointmentDetails.dressDetails, bottomSize: v },
                  },
                }))}
              />
              <SelectFixed
                label="Dress size"
                value={form.influencerAppointmentDetails.dressDetails.dressSize}
                options={OPTIONS.sizes}
                placeholder="Select size"
                onChange={(v) => setForm((p) => ({
                  ...p,
                  influencerAppointmentDetails: {
                    ...p.influencerAppointmentDetails,
                    dressDetails: { ...p.influencerAppointmentDetails.dressDetails, dressSize: v },
                  },
                }))}
              />
              <SelectFixed
                label="Preferred fit"
                value={form.influencerAppointmentDetails.dressDetails.preferredFit}
                options={OPTIONS.fit}
                placeholder="Select fit"
                onChange={(v) => setForm((p) => ({
                  ...p,
                  influencerAppointmentDetails: {
                    ...p.influencerAppointmentDetails,
                    dressDetails: { ...p.influencerAppointmentDetails.dressDetails, preferredFit: v },
                  },
                }))}
              />
              <CheckboxGroup
                label="Preferred dressing style"
                value={form.influencerAppointmentDetails.dressDetails.preferredDressingStyle}
                options={OPTIONS.dressingStyle}
                columns={3}
                onChange={(arr) => setForm((p) => ({
                  ...p,
                  influencerAppointmentDetails: {
                    ...p.influencerAppointmentDetails,
                    dressDetails: { ...p.influencerAppointmentDetails.dressDetails, preferredDressingStyle: arr },
                  },
                }))}
              />

              {form.influencerAppointmentDetails.dressDetails.preferredDressingStyle.includes('Traditional') && (
                <CheckboxGroup
                  label="Traditional wear type"
                  value={form.influencerAppointmentDetails.dressDetails.traditionalWearType}
                  options={OPTIONS.traditionalWearType}
                  columns={2}
                  onChange={(arr) => setForm((p) => ({
                    ...p,
                    influencerAppointmentDetails: {
                      ...p.influencerAppointmentDetails,
                      dressDetails: { ...p.influencerAppointmentDetails.dressDetails, traditionalWearType: arr },
                    },
                  }))}
                />
              )}

              {form.influencerAppointmentDetails.dressDetails.preferredDressingStyle.includes('Western') && (
                <CheckboxGroup
                  label="Western wear type"
                  value={form.influencerAppointmentDetails.dressDetails.westernWearType}
                  options={OPTIONS.westernWearType}
                  columns={2}
                  onChange={(arr) => setForm((p) => ({
                    ...p,
                    influencerAppointmentDetails: {
                      ...p.influencerAppointmentDetails,
                      dressDetails: { ...p.influencerAppointmentDetails.dressDetails, westernWearType: arr },
                    },
                  }))}
                />
              )}

              <CheckboxGroup
                label="Preferred outfit colors"
                value={form.influencerAppointmentDetails.dressDetails.preferredOutfitColors}
                options={OPTIONS.outfitColors}
                columns={4}
                onChange={(arr) => setForm((p) => ({
                  ...p,
                  influencerAppointmentDetails: {
                    ...p.influencerAppointmentDetails,
                    dressDetails: { ...p.influencerAppointmentDetails.dressDetails, preferredOutfitColors: arr },
                  },
                }))}
              />

              <label className="text-sm text-gray-700 md:col-span-2">Other outfit colors (optional, comma separated)
                <input
                  value={form.influencerAppointmentDetails.dressDetails.preferredOutfitColorsCsv}
                  onChange={(e) => setForm((p) => ({
                    ...p,
                    influencerAppointmentDetails: {
                      ...p.influencerAppointmentDetails,
                      dressDetails: { ...p.influencerAppointmentDetails.dressDetails, preferredOutfitColorsCsv: e.target.value },
                    },
                  }))}
                  className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-11 px-3"
                  placeholder="Maroon, Teal"
                />
              </label>
            </div>

            <h3 className="mt-6 text-sm font-semibold text-gray-900">Shoot preferences</h3>
            <div className="mt-3 grid md:grid-cols-3 gap-4">
              <CheckboxGroup
                label="Shoot style"
                value={form.influencerAppointmentDetails.shootPreferences.shootStyle}
                options={OPTIONS.shootStyle}
                columns={2}
                onChange={(arr) => setForm((p) => ({
                  ...p,
                  influencerAppointmentDetails: {
                    ...p.influencerAppointmentDetails,
                    shootPreferences: { ...p.influencerAppointmentDetails.shootPreferences, shootStyle: arr },
                  },
                }))}
              />

              <SelectFixed
                label="Pose comfort"
                value={form.influencerAppointmentDetails.shootPreferences.poseComfortLevel}
                options={OPTIONS.poseComfort}
                placeholder="Select comfort"
                onChange={(v) => setForm((p) => ({
                  ...p,
                  influencerAppointmentDetails: {
                    ...p.influencerAppointmentDetails,
                    shootPreferences: { ...p.influencerAppointmentDetails.shootPreferences, poseComfortLevel: v },
                  },
                }))}
              />
              <SelectFixed
                label="Boldness"
                value={form.influencerAppointmentDetails.shootPreferences.boldnessLevel}
                options={OPTIONS.boldness}
                placeholder="Select level"
                onChange={(v) => setForm((p) => ({
                  ...p,
                  influencerAppointmentDetails: {
                    ...p.influencerAppointmentDetails,
                    shootPreferences: { ...p.influencerAppointmentDetails.shootPreferences, boldnessLevel: v },
                  },
                }))}
              />
              <CheckboxGroup
                label="Shoot type"
                value={form.influencerAppointmentDetails.shootPreferences.shootType}
                options={OPTIONS.shootType}
                columns={3}
                onChange={(arr) => setForm((p) => ({
                  ...p,
                  influencerAppointmentDetails: {
                    ...p.influencerAppointmentDetails,
                    shootPreferences: { ...p.influencerAppointmentDetails.shootPreferences, shootType: arr },
                  },
                }))}
              />

              <label className="text-sm text-gray-700 md:col-span-2">Shoot type (comma separated)
                <input
                  value={form.influencerAppointmentDetails.shootPreferences.shootTypeCsv}
                  onChange={(e) => setForm((p) => ({
                    ...p,
                    influencerAppointmentDetails: {
                      ...p.influencerAppointmentDetails,
                      shootPreferences: { ...p.influencerAppointmentDetails.shootPreferences, shootTypeCsv: e.target.value },
                    },
                  }))}
                  className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-11 px-3"
                  placeholder="Indoor"
                />
              </label>
              <div className="flex items-center gap-4 md:col-span-3">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={!!form.influencerAppointmentDetails.shootPreferences.sleevelessAllowed}
                    onChange={(e) => setForm((p) => ({
                      ...p,
                      influencerAppointmentDetails: {
                        ...p.influencerAppointmentDetails,
                        shootPreferences: { ...p.influencerAppointmentDetails.shootPreferences, sleevelessAllowed: e.target.checked },
                      },
                    }))}
                  />
                  Sleeveless allowed
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={!!form.influencerAppointmentDetails.shootPreferences.cameraFacingComfort}
                    onChange={(e) => setForm((p) => ({
                      ...p,
                      influencerAppointmentDetails: {
                        ...p.influencerAppointmentDetails,
                        shootPreferences: { ...p.influencerAppointmentDetails.shootPreferences, cameraFacingComfort: e.target.checked },
                      },
                    }))}
                  />
                  Camera facing comfort
                </label>
              </div>

              <h3 className="mt-2 text-sm font-semibold text-gray-900 md:col-span-3">Permissions</h3>

              <SelectFixed
                label="Makeup preference"
                value={form.influencerAppointmentDetails.stylingPermissions.makeupPreference}
                options={OPTIONS.makeup}
                placeholder="Select makeup"
                onChange={(v) => setForm((p) => ({
                  ...p,
                  influencerAppointmentDetails: {
                    ...p.influencerAppointmentDetails,
                    stylingPermissions: { ...p.influencerAppointmentDetails.stylingPermissions, makeupPreference: v },
                  },
                }))}
              />

              <div className="flex items-center gap-4 md:col-span-2">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={!!form.influencerAppointmentDetails.stylingPermissions.accessoriesAllowed}
                    onChange={(e) => setForm((p) => ({
                      ...p,
                      influencerAppointmentDetails: {
                        ...p.influencerAppointmentDetails,
                        stylingPermissions: { ...p.influencerAppointmentDetails.stylingPermissions, accessoriesAllowed: e.target.checked },
                      },
                    }))}
                  />
                  Accessories allowed
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={!!form.influencerAppointmentDetails.editingAndUsage.photoshopBrandingAllowed}
                    onChange={(e) => setForm((p) => ({
                      ...p,
                      influencerAppointmentDetails: {
                        ...p.influencerAppointmentDetails,
                        editingAndUsage: { ...p.influencerAppointmentDetails.editingAndUsage, photoshopBrandingAllowed: e.target.checked },
                      },
                    }))}
                  />
                  Photoshop/branding allowed
                </label>
              </div>

              <CheckboxGroup
                label="Usage permission"
                value={form.influencerAppointmentDetails.editingAndUsage.usagePermission}
                options={OPTIONS.usagePermission}
                columns={2}
                onChange={(arr) => setForm((p) => ({
                  ...p,
                  influencerAppointmentDetails: {
                    ...p.influencerAppointmentDetails,
                    editingAndUsage: { ...p.influencerAppointmentDetails.editingAndUsage, usagePermission: arr },
                  },
                }))}
              />

              <h3 className="mt-2 text-sm font-semibold text-gray-900 md:col-span-3">Consent</h3>

              <label className="text-sm text-gray-700">Date
                <input
                  type="date"
                  value={form.influencerAppointmentDetails.consent.date}
                  onChange={(e) => setForm((p) => ({
                    ...p,
                    influencerAppointmentDetails: {
                      ...p.influencerAppointmentDetails,
                      consent: { ...p.influencerAppointmentDetails.consent, date: e.target.value },
                    },
                  }))}
                  className="mt-1 w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 h-11 px-3"
                />
              </label>

              <div className="flex items-center gap-4 md:col-span-2">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={!!form.influencerAppointmentDetails.consent.publicDisplayConsent}
                    onChange={(e) => setForm((p) => ({
                      ...p,
                      influencerAppointmentDetails: {
                        ...p.influencerAppointmentDetails,
                        consent: { ...p.influencerAppointmentDetails.consent, publicDisplayConsent: e.target.checked },
                      },
                    }))}
                  />
                  Public display consent
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={!!form.influencerAppointmentDetails.consent.termsAccepted}
                    onChange={(e) => setForm((p) => ({
                      ...p,
                      influencerAppointmentDetails: {
                        ...p.influencerAppointmentDetails,
                        consent: { ...p.influencerAppointmentDetails.consent, termsAccepted: e.target.checked },
                      },
                    }))}
                  />
                  Terms accepted
                </label>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
