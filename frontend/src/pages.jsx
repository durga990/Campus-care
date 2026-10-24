import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api, CATEGORIES, PRIORITIES, LABEL, FILES, MESSAGE_TYPES, BLOCKS, SUB_BLOCKS, TIME_SLOTS, SUB_CATEGORIES } from './api.js';
import { useAuth } from './App.jsx';

const TONE = {
  SUBMITTED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  ASSIGNED: 'bg-amber-50 text-amber-700 border-amber-200',
  IN_PROGRESS: 'bg-sky-50 text-sky-700 border-sky-200',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CLOSED: 'bg-slate-100 text-slate-700 border-slate-300',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200'
};

const PRIORITY_TONE = {
  Low: 'text-slate-600 bg-slate-100',
  Medium: 'text-blue-700 bg-blue-50',
  High: 'text-amber-800 bg-amber-100',
  Urgent: 'text-rose-700 bg-rose-100 font-bold'
};

export const Badge = ({ s }) => (
  <span className={'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ' + (TONE[s] || 'bg-slate-100 text-slate-700 border-slate-200')}>
    {LABEL[s] || s}
  </span>
);

export const PriorityBadge = ({ p }) => (
  <span className={'inline-flex items-center rounded px-2 py-0.5 text-xs ' + (PRIORITY_TONE[p] || 'bg-slate-100 text-slate-600')}>
    {p}
  </span>
);

export const Err = ({ m }) => m ? (
  <div role="alert" className="mb-4 flex items-center gap-2 rounded-lg border border-signal/40 bg-red-50 p-3.5 text-sm text-signal">
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
    <span>{m}</span>
  </div>
) : null;

export const Field = ({ label, hint, ...p }) => (
  <label className="block">
    <span className="lbl">{label}</span>
    <input className="inp" autoComplete="off" {...p} />
    {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
  </label>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.477 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

export const PasswordField = ({ label, hint, ...p }) => {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      <span className="lbl">{label}</span>
      <div className="relative">
        <input
          className="inp pr-10"
          type={show ? 'text' : 'password'}
          autoComplete="new-password"
          {...p}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow(v => !v)}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-700 transition-colors"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
};

const fmt = d => d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
const fileUrl = u => FILES + u;

export function Landing() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal via-ink to-slate-900 p-8 sm:p-14 text-white shadow-xl">
        <div className="max-w-3xl">
          <span className="inline-block rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1 text-xs font-semibold tracking-wider uppercase text-teal-soft">
            Campus Issue Resolution Portal
          </span>
          <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
            Report it once. <br/><span className="text-signal">Watch it get fixed.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base sm:text-lg text-slate-200 leading-relaxed">
            CampusCare provides students, staff, and administrators with a transparent, unified system to report campus issues, assign work orders, and verify resolutions with visual proof.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/register" className="btn !bg-signal hover:!bg-opacity-90 !py-3 !px-6 text-base font-bold shadow-lg">
              Create student account
            </Link>
            <Link to="/login" className="btn !bg-white/15 hover:!bg-white/25 !text-white border border-white/20 !py-3 !px-6 text-base backdrop-blur-md">
              Log in to portal
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-3">
        <div className="card hover:border-teal/50">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-teal-soft text-teal">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-ink">Students</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Submit a complaint with photos, track realtime status, comment on tickets, and rate resolutions once the job is finished.
          </p>
        </div>

        <div className="card hover:border-teal/50">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-ink">Maintenance Staff</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Access assigned complaints, change ticket statuses from Assigned to In Progress and Resolved, and attach after-repair proof photos.
          </p>
        </div>

        <div className="card hover:border-teal/50">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-ink">Administration</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Monitor real-time analytics across all departments, route tickets to staff members, manage user access, and oversee satisfaction ratings.
          </p>
        </div>
      </div>
    </main>
  );
}

const ROLE_ICONS = {
  student: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
  ),
  staff: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  admin: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
};

const ROLES_META = {
  student: {
    label: 'Student',
    heading: 'Student Portal',
    subheading: 'Access your student dashboard to submit issues, view live status, and provide feedback.',
    placeholderEmail: 'Enter your college email address'
  },
  staff: {
    label: 'Staff Member',
    heading: 'Department Staff Portal',
    subheading: 'Access assigned departmental complaints, upload resolution notes, and update statuses.',
    placeholderEmail: 'Enter your official staff email address'
  },
  admin: {
    label: 'Administrator',
    heading: 'Campus Administration',
    subheading: 'Comprehensive oversight, live analytics, department routing, and staff management.',
    placeholderEmail: 'Enter your administrator email address'
  }
};

export function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const qRole = searchParams.get('role');
  const [role, setRole] = useState(['student', 'staff', 'admin'].includes(qRole) ? qRole : 'student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" />;

  const meta = ROLES_META[role] || ROLES_META.student;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: { email, password, role }
      });
      login(data);
      nav('/dashboard');
    } catch (x) {
      setErr(x.message);
    }
    setBusy(false);
  };

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <div className="card space-y-5">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-teal">Role-Based Access</span>
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {ROLE_ICONS[role]}
              {meta.label}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-ink mt-1">Log in to CampusCare</h1>
          <p className="mt-1 text-sm text-slate-500">
            {meta.subheading}
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div>
          <label className="lbl mb-1.5 block">Select Your Role</label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
            {Object.entries(ROLES_META).map(([rKey, rInfo]) => {
              const active = role === rKey;
              return (
                <button
                  key={rKey}
                  type="button"
                  onClick={() => { setRole(rKey); setErr(''); }}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                    active
                      ? 'bg-white text-ink shadow-sm ring-1 ring-slate-200 font-bold'
                      : 'text-slate-600 hover:text-ink hover:bg-white/60'
                  }`}
                >
                  <span className="flex items-center">{ROLE_ICONS[rKey]}</span>
                  <span>{rInfo.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Err m={err} />

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <Field
            label={`${meta.label} Email address`}
            type="email"
            required
            autoComplete="off"
            placeholder={meta.placeholderEmail}
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <PasswordField
            label="Password"
            required
            minLength={1}
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <button className="btn w-full !py-2.5 flex items-center justify-center gap-2" disabled={busy}>
            {busy ? 'Verifying credentials…' : `Log in as ${meta.label}`}
          </button>
        </form>

        <div className="border-t border-slate-100 pt-4 text-center text-sm text-slate-600 space-y-2">
          <p>
            Don't have an account yet?{' '}
            <Link
              className="font-semibold text-teal hover:underline"
              to={`/register?role=${role === 'admin' ? 'student' : role}`}
            >
              Register as {role === 'staff' ? 'Staff' : 'Student'}
            </Link>
          </p>
          {role === 'admin' && (
            <p className="text-xs text-slate-400">
              Administrative accounts are restricted & provisioned by Campus IT.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

export function Register() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const qRole = searchParams.get('role');
  const [role, setRole] = useState(['student', 'staff'].includes(qRole) ? qRole : 'student');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  // Student-specific:
  const [studentId, setStudentId] = useState('');
  const [year, setYear] = useState('');
  const [section, setSection] = useState('');

  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const payload = {
        role,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        department: department.trim(),
        ...(role === 'student' ? {
          studentId: studentId.trim().toUpperCase(),
          year: year.trim(),
          section: section.trim()
        } : {})
      };

      const res = await api('/auth/register', {
        method: 'POST',
        body: payload
      });
      login(res);
      nav('/dashboard');
    } catch (x) {
      setErr(x.message);
    }
    setBusy(false);
  };

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <div className="card space-y-5">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-teal">Role-Based Registration</span>
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {ROLE_ICONS[role]}
              {role === 'student' ? 'Student' : 'Staff Member'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-ink mt-1">
            {role === 'student' ? 'Create Student Account' : 'Staff Member Registration'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {role === 'student'
              ? 'Register with your college credentials to submit, track, and escalate campus issues.'
              : 'Register as department staff to resolve assigned campus issues and post updates.'}
          </p>
        </div>

        {/* Role Toggle */}
        <div>
          <label className="lbl mb-1.5 block">Registering As</label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => { setRole('student'); setErr(''); }}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-sm font-semibold rounded-lg transition-all ${
                role === 'student'
                  ? 'bg-white text-ink shadow-sm ring-1 ring-slate-200 font-bold'
                  : 'text-slate-600 hover:text-ink hover:bg-white/60'
              }`}
            >
              {ROLE_ICONS.student}
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => { setRole('staff'); setErr(''); }}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-sm font-semibold rounded-lg transition-all ${
                role === 'staff'
                  ? 'bg-white text-ink shadow-sm ring-1 ring-slate-200 font-bold'
                  : 'text-slate-600 hover:text-ink hover:bg-white/60'
              }`}
            >
              {ROLE_ICONS.staff}
              <span>Staff Member</span>
            </button>
          </div>
        </div>

        <Err m={err} />

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <Field
            label="Full name"
            required
            minLength={2}
            autoComplete="off"
            placeholder={role === 'student' ? 'Enter your full name' : 'Enter staff member full name'}
            value={name}
            onChange={e => setName(e.target.value)}
          />

          {role === 'student' ? (
            <>
              <Field
                label="Student ID / Roll No."
                hint="4 to 20 letters, numbers, or dashes"
                required
                minLength={4}
                maxLength={20}
                pattern="[A-Za-z0-9\-]{4,20}"
                placeholder="Enter your student ID or roll number"
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Field
                  label="Department"
                  required
                  placeholder="Enter your department"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                />
                <Field
                  label="Year"
                  required
                  placeholder="Enter your year"
                  value={year}
                  onChange={e => setYear(e.target.value)}
                />
                <Field
                  label="Section"
                  required
                  placeholder="Enter your section"
                  value={section}
                  onChange={e => setSection(e.target.value)}
                />
              </div>
            </>
          ) : (
            <Field
              label="Assigned Department / Division"
              hint="Enter the department you are assigned to"
              required
              placeholder="Enter assigned department or division"
              value={department}
              onChange={e => setDepartment(e.target.value)}
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              label={role === 'student' ? 'College Email' : 'Official Staff Email'}
              type="email"
              required
              placeholder={role === 'student' ? 'Enter your college email address' : 'Enter your official staff email address'}
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <Field
              label="Phone number"
              hint="10 to 15 digits"
              required
              pattern="\+?[0-9\s\-]{10,15}"
              placeholder="Enter your phone number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          <PasswordField
            label="Password"
            required
            minLength={8}
            hint="At least 8 characters, containing both letters and numbers"
            placeholder="Enter a secure password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <button className="btn w-full !py-2.5 flex items-center justify-center gap-2" disabled={busy}>
            {busy ? 'Creating account…' : `Create ${role === 'student' ? 'Student' : 'Staff'} Account`}
          </button>
        </form>

        <div className="border-t border-slate-100 pt-4 text-center text-sm text-slate-600 space-y-2">
          <p>
            Already registered?{' '}
            <Link className="font-semibold text-teal hover:underline" to={`/login?role=${role}`}>
              Log in as {role === 'student' ? 'Student' : 'Staff'}
            </Link>
          </p>
          <p className="text-xs text-slate-400">
            Administrator accounts are provisioned directly by Campus IT.
          </p>
        </div>
      </div>
    </main>
  );
}

function AdminCharts() {
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api('/admin/dashboard').then(setD).catch(e => setErr(e.message));
  }, []);

  if (err) return <Err m={err} />;
  if (!d) return <div className="card animate-pulse"><p className="text-slate-500">Loading statistics…</p></div>;

  const t = d.totals || {};
  const cards = [
    ['Total Complaints', t.complaints, 'bg-slate-50 text-slate-800'],
    ['High Priority Open', t.highPriorityOpen, 'bg-rose-50 text-rose-800'],
    ['Students Enrolled', t.students, 'bg-indigo-50 text-indigo-800'],
    ['Active Staff', t.staff, 'bg-teal-soft text-teal'],
    ['Avg. Resolution (Hours)', d.avgResolutionHours ?? '–', 'bg-amber-50 text-amber-800'],
    ['Avg. Student Rating', d.feedback?.averageRating ? `${d.feedback.averageRating} / 5` : '–', 'bg-emerald-50 text-emerald-800']
  ];

  const charts = [
    ['Complaints by status', (d.byStatus || []).map(x => ({ name: LABEL[x.name] || x.name, count: x.count }))],
    ['By category', d.byCategory],
    ['By priority', d.byPriority],
    ['By department', d.byDepartment],
    ['Last 30 days', (d.overTime || []).map(x => ({ name: x.date.slice(5), count: x.count }))]
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {cards.map(([l, v, bg]) => (
          <div key={l} className={'card !p-4 ' + bg}>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{l}</p>
            <p className="mt-1 text-2xl font-extrabold">{v ?? 0}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {charts.map(([k, data]) => (
          <div key={k} className="card">
            <h3 className="mb-4 text-base font-bold text-ink">{k}</h3>
            {!(data || []).length ? (
              <p className="py-8 text-center text-sm text-slate-500">No data points yet.</p>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D5DCE3" />
                    <XAxis dataKey="name" fontSize={11} tickLine={false} />
                    <YAxis allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #D5DCE3' }} />
                    <Bar dataKey="count" fill="#0E5A63" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function AdminStaffSection() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', department: 'Infrastructure', password: '' });
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    api('/admin/users?role=staff&limit=100')
      .then(d => { setStaff(d.items); setErr(''); })
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (id, isActive) => {
    try {
      await api(`/admin/users/${id}/${isActive ? 'deactivate' : 'activate'}`, { method: 'PUT' });
      load();
    } catch (e) {
      setErr(e.message);
    }
  };

  const handleCreate = async e => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await api('/admin/staff', { method: 'POST', body: formData });
      setShowAdd(false);
      setFormData({ name: '', email: '', phone: '', department: 'Infrastructure', password: '' });
      load();
    } catch (e) {
      setErr(e.message);
    }
    setBusy(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-ink">Staff Directory</h2>
          <p className="text-xs text-slate-500">Manage maintenance personnel and assignable departments</p>
        </div>
        <button className="btn" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel' : '+ Add new staff member'}
        </button>
      </div>

      <Err m={err} />

      {showAdd && (
        <form onSubmit={handleCreate} className="card bg-teal-soft/20 border-teal/30 space-y-4">
          <h3 className="font-bold text-ink">Create New Staff Account</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Full Name" required minLength={2} autoComplete="off" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            <Field label="Email" type="email" required autoComplete="off" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            <Field label="Phone" required autoComplete="off" pattern="\+?[0-9\s\-]{10,15}" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            <label className="block">
              <span className="lbl">Department</span>
              <select className="inp" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <PasswordField
              label="Temporary Password"
              required
              minLength={8}
              hint="At least 8 chars with letter + number"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <button className="btn" disabled={busy}>{busy ? 'Creating…' : 'Register Staff Member'}</button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading staff directory…</p>
      ) : !staff.length ? (
        <p className="card text-sm text-slate-500">No staff members found.</p>
      ) : (
        <div className="card !p-0 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-teal-soft/40 text-xs font-semibold uppercase text-slate-600">
              <tr>
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map(s => (
                <tr key={s._id} className="border-b border-line/60 last:border-0 hover:bg-slate-50">
                  <td className="p-3.5 font-semibold text-ink">{s.name}</td>
                  <td className="p-3.5 text-slate-600">{s.email}</td>
                  <td className="p-3.5">{s.department || '—'}</td>
                  <td className="p-3.5">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${s.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      className="text-xs font-semibold underline text-teal hover:text-ink"
                      onClick={() => toggleActive(s._id, s.isActive)}
                    >
                      {s.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AdminFeedbackSection() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    api('/admin/feedback')
      .then(d => { setFeedback(d.items || []); setErr(''); })
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-ink">Student Resolution Feedback</h2>
        <p className="text-xs text-slate-500">Post-resolution student reviews and satisfaction scores</p>
      </div>
      <Err m={err} />
      {loading ? (
        <p className="text-sm text-slate-500">Loading student reviews…</p>
      ) : !feedback.length ? (
        <p className="card text-sm text-slate-500">No feedback submitted yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {feedback.map(fb => (
            <div key={fb._id} className="card space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-600 text-base">{fb.rating} / 5</span>
                <span className="text-xs text-slate-400">{fmt(fb.createdAt)}</span>
              </div>
              <p className="text-sm text-slate-700 italic">"{fb.comment || 'No comment provided.'}"</p>
              <div className="pt-2 text-xs text-slate-500 border-t border-line/60 flex items-center justify-between">
                <span>By: {fb.student?.name}</span>
                {fb.complaint && (
                  <Link to={'/complaints/' + (fb.complaint._id || fb.complaint)} className="underline text-teal">
                    {fb.complaint.complaintId || 'View Complaint'}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');
  const [st, setSt] = useState('');
  const [adminTab, setAdminTab] = useState('overview'); // overview, complaints, staff, feedback

  useEffect(() => {
    const p = new URLSearchParams({ limit: '50' });
    if (q) p.set('search', q);
    if (st) p.set('status', st);
    const t = setTimeout(() => {
      api('/complaints?' + p)
        .then(d => { setRows(d.items); setErr(''); })
        .catch(e => setErr(e.message));
    }, 250);
    return () => clearTimeout(t);
  }, [q, st]);

  const [all, setAll] = useState([]);
  useEffect(() => {
    if (user.role !== 'admin') {
      api('/complaints?limit=50').then(d => setAll(d.items)).catch(() => {});
    }
  }, []);

  const count = s => all.filter(c => c.status === s).length;

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-ink">
            {user.role === 'admin' ? 'Administrative Control Center' : user.role === 'staff' ? 'Assigned Maintenance Tasks' : 'My Complaints Portal'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {user.role === 'admin'
              ? 'Complete overview of campus issues, staff assignments, and metrics.'
              : user.role === 'staff'
              ? 'Manage and update progress on issues assigned to your team.'
              : 'Track the status and resolution progress of your reported issues.'}
          </p>
        </div>
        {user.role === 'student' && (
          <Link to="/complaints/new" className="btn !bg-signal hover:!bg-opacity-90 shadow-md">
            + New Complaint
          </Link>
        )}
      </div>

      {user.role === 'admin' && (
        <div className="flex border-b border-line space-x-6 text-sm font-semibold">
          {[
            ['overview', 'Analytics Overview'],
            ['complaints', 'Complaints Registry'],
            ['staff', 'Staff Management'],
            ['feedback', 'Student Feedback']
          ].map(([k, label]) => (
            <button
              key={k}
              className={`pb-3 transition-colors ${adminTab === k ? 'border-b-2 border-teal text-teal' : 'text-slate-500 hover:text-ink'}`}
              onClick={() => setAdminTab(k)}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {user.role === 'admin' && adminTab === 'overview' && <AdminCharts />}
      {user.role === 'admin' && adminTab === 'staff' && <AdminStaffSection />}
      {user.role === 'admin' && adminTab === 'feedback' && <AdminFeedbackSection />}

      {user.role !== 'admin' && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            ['Total Filed', all.length, 'bg-slate-50 text-slate-800'],
            ['In Progress / Pending', all.length - count('RESOLVED') - count('CLOSED') - count('REJECTED'), 'bg-sky-50 text-sky-800'],
            ['Resolved', count('RESOLVED'), 'bg-emerald-50 text-emerald-800'],
            ['Closed', count('CLOSED'), 'bg-slate-100 text-slate-700']
          ].map(([l, v, bg]) => (
            <div key={l} className={'card !p-4 ' + bg}>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{l}</p>
              <p className="mt-1 text-3xl font-extrabold">{v}</p>
            </div>
          ))}
        </div>
      )}

      {(user.role !== 'admin' || adminTab === 'complaints') && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-ink">
              {user.role === 'admin' ? 'All Reported Complaints' : 'Complaints'}
            </h2>
            <div className="flex flex-wrap gap-2.5">
              <input
                aria-label="Search"
                className="inp max-w-xs"
                placeholder="Search by ID, title, keyword..."
                onChange={e => setQ(e.target.value)}
              />
              <select
                aria-label="Filter by status"
                className="inp max-w-[12rem]"
                onChange={e => setSt(e.target.value)}
              >
                <option value="">All statuses</option>
                {Object.entries(LABEL).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          <Err m={err} />

          {!rows ? (
            <div className="card text-center py-8 text-slate-400">Loading complaints…</div>
          ) : !rows.length ? (
            <div className="card text-center py-10">
              <p className="text-base font-semibold text-slate-700">No complaints found.</p>
              <p className="mt-1 text-sm text-slate-500">
                {user.role === 'student' ? 'Click "New Complaint" to report an issue.' : 'No records match your filters.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto card !p-0">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line bg-teal-soft/40 text-xs font-semibold uppercase text-slate-600">
                  <tr>
                    {['Ticket ID', 'Title', 'Category', 'Priority', 'Status', 'Submitted', 'Assigned To'].map(h => (
                      <th key={h} className="p-3.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(c => (
                    <tr key={c._id} className="border-b border-line/60 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-mono text-xs font-bold text-teal">{c.complaintId}</td>
                      <td className="p-3.5">
                        <Link className="font-semibold text-ink underline hover:text-teal" to={'/complaints/' + c._id}>
                          {c.title}
                        </Link>
                      </td>
                      <td className="p-3.5 text-slate-600">{c.category}</td>
                      <td className="p-3.5"><PriorityBadge p={c.priority} /></td>
                      <td className="p-3.5"><Badge s={c.status} /></td>
                      <td className="p-3.5 text-xs text-slate-500">{fmt(c.createdAt)}</td>
                      <td className="p-3.5 text-xs text-slate-600">{c.assignedTo?.name || <span className="text-slate-400 italic">Unassigned</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

export function NewComplaint() {
  const nav = useNavigate();
  const defaultForm = {
    messageType: 'Grievance',
    category: '',
    subCategory: '',
    specificCategory: '',
    block: '',
    subBlock: '',
    roomType: 'Room No',
    roomNo: '',
    contactNo: '',
    description: '',
    priority: 'Medium'
  };

  const [f, setF] = useState(defaultForm);
  const [files, setFiles] = useState([]);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const setVal = (k, v) => setF(prev => ({ ...prev, [k]: v }));

  const onCategoryChange = cat => {
    const subs = SUB_CATEGORIES[cat] || [];
    setF(prev => ({
      ...prev,
      category: cat,
      subCategory: subs[0] || ''
    }));
  };


  const pick = e => {
    const a = [...e.target.files];
    if (a.length > 5 || a.some(x => x.size > 5 * 1024 * 1024)) {
      setErr('Attach up to 5 images, max 5 MB each.');
      e.target.value = '';
      setFiles([]);
      return;
    }
    setErr('');
    setFiles(a);
  };

  const handleReset = () => {
    setF(defaultForm);
    setFiles([]);
    setErr('');
  };

  const go = async e => {
    e.preventDefault();
    if (!f.category) {
      setErr('Please select a Category.');
      return;
    }
    if (!f.block) {
      setErr('Please select a Block.');
      return;
    }
    if (!f.contactNo) {
      setErr('Please enter a Contact Number.');
      return;
    }
    if (!f.description || f.description.trim().length < 5) {
      setErr('Please provide a description (minimum 5 characters).');
      return;
    }

    setBusy(true);
    setErr('');
    const form = new FormData();
    Object.entries(f).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        v.forEach(item => form.append(k, item));
      } else if (v !== undefined && v !== null) {
        form.append(k, v);
      }
    });
    files.forEach(x => form.append('attachments', x));

    try {
      const d = await api('/complaints', { method: 'POST', form });
      nav('/complaints/' + d.complaint._id);
    } catch (x) {
      setErr(x.message);
    }
    setBusy(false);
  };

  const descMax = 500;
  const descLeft = Math.max(0, descMax - (f.description?.length || 0));

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <form onSubmit={go} className="card space-y-6 !p-6 sm:!p-8 bg-white border border-slate-200/80 shadow-md">
        <div>
          <h1 className="text-2xl font-bold text-ink">Submit Maintenance Request</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Fill in the details below. Requests are automatically assigned to the appropriate maintenance department.
          </p>
        </div>

        <Err m={err} />

        {/* Message Type Radio Group */}
        <div>
          <span className="lbl text-sm text-slate-700">
            Message Type: <span className="text-red-500 font-bold">*</span>
          </span>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs sm:text-sm">
            {MESSAGE_TYPES.map(m => (
              <label key={m} className="inline-flex items-center gap-1.5 cursor-pointer text-slate-700 hover:text-ink">
                <input
                  type="radio"
                  name="messageType"
                  value={m}
                  checked={f.messageType === m}
                  onChange={() => setVal('messageType', m)}
                  className="accent-teal h-4 w-4"
                />
                <span>{m}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 2 Column Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-1">
          {/* Left Column: Category */}
          <div>
            <label className="block">
              <span className="lbl text-xs text-slate-700">
                Category: <span className="text-red-500 font-bold">*</span>
              </span>
              <select
                className="inp mt-1 text-sm"
                value={f.category}
                required
                onChange={e => onCategoryChange(e.target.value)}
              >
                <option value="">Select</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Right Column: Sub Category */}
          <div>
            <label className="block">
              <span className="lbl text-xs text-slate-700">
                Sub Category: <span className="text-red-500 font-bold">*</span>
              </span>
              <select
                className="inp mt-1 text-sm"
                value={f.subCategory}
                onChange={e => setVal('subCategory', e.target.value)}
              >
                <option value="">Select</option>
                {(SUB_CATEGORIES[f.category] || ['General Issue', 'Repair Required']).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Left Column: Specific Category */}
          <div>
            <label className="block">
              <span className="lbl text-xs text-slate-700">
                Specific Category: <span className="text-red-500 font-bold">*</span>
              </span>
              <select
                className="inp mt-1 text-sm"
                value={f.specificCategory}
                onChange={e => setVal('specificCategory', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Routine Maintenance">Routine Maintenance</option>
                <option value="Urgent Breakdown">Urgent Breakdown</option>
                <option value="Preventive Maintenance">Preventive Maintenance</option>
                <option value="Replacement Required">Replacement Required</option>
                <option value="General Maintenance">General Maintenance</option>
              </select>
            </label>
          </div>

          {/* Right Column: Block */}
          <div>
            <label className="block">
              <span className="lbl text-xs text-slate-700">
                Block: <span className="text-red-500 font-bold">*</span>
              </span>
              <select
                className="inp mt-1 text-sm"
                value={f.block}
                required
                onChange={e => setVal('block', e.target.value)}
              >
                <option value="">Select</option>
                {BLOCKS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Left Column: Sub Block */}
          <div>
            <label className="block">
              <span className="lbl text-xs text-slate-700">Sub Block:</span>
              <select
                className="inp mt-1 text-sm"
                value={f.subBlock}
                onChange={e => setVal('subBlock', e.target.value)}
              >
                <option value="">Select</option>
                {SUB_BLOCKS.map(sb => (
                  <option key={sb} value={sb}>{sb}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Right Column: Room Type */}
          <div>
            <span className="lbl text-xs text-slate-700 block mb-1">Room Type:</span>
            <div className="flex items-center gap-4 text-xs sm:text-sm mt-2">
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="roomType"
                  value="Room No"
                  checked={f.roomType === 'Room No'}
                  onChange={() => setVal('roomType', 'Room No')}
                  className="accent-teal h-4 w-4"
                />
                <span>Room No</span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="roomType"
                  value="Any Other"
                  checked={f.roomType === 'Any Other'}
                  onChange={() => setVal('roomType', 'Any Other')}
                  className="accent-teal h-4 w-4"
                />
                <span>Any Other</span>
              </label>
            </div>
          </div>

          {/* Left Column: Room No / Location */}
          <div>
            <label className="block">
              <span className="lbl text-xs text-slate-700">
                {f.roomType === 'Room No' ? 'Room No:' : 'Location Specification:'}
              </span>
              <input
                type="text"
                className="inp mt-1 text-sm"
                placeholder={f.roomType === 'Room No' ? 'e.g. 302' : 'e.g. Corridor / Elevator foyer'}
                value={f.roomNo}
                onChange={e => setVal('roomNo', e.target.value)}
              />
            </label>
          </div>

          {/* Right Column: Contact No */}
          <div>
            <label className="block">
              <span className="lbl text-xs text-slate-700">
                Contact No: <span className="text-red-500 font-bold">*</span>
              </span>
              <input
                type="text"
                required
                className="inp mt-1 text-sm"
                placeholder="e.g. 9876543210"
                value={f.contactNo}
                onChange={e => setVal('contactNo', e.target.value)}
              />
            </label>
          </div>

        </div>

        {/* Priority & Photo Attachment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
          <div>
            <label className="block">
              <span className="lbl text-xs text-slate-700">Urgency / Priority:</span>
              <select
                className="inp mt-1 text-sm"
                value={f.priority}
                onChange={e => setVal('priority', e.target.value)}
              >
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <label className="block">
              <span className="lbl text-xs text-slate-700">Photo Evidence (Optional, max 5 images):</span>
              <input
                type="file"
                className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer mt-1"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={pick}
              />
            </label>
          </div>
        </div>

        {/* Description Textarea */}
        <div>
          <label className="block">
            <span className="lbl text-xs text-slate-700">
              Description: <span className="text-red-500 font-bold">*</span>
            </span>
            <textarea
              className="inp mt-1 text-sm"
              rows={4}
              required
              maxLength={descMax}
              placeholder="Describe the issue in detail..."
              value={f.description}
              onChange={e => setVal('description', e.target.value)}
            />
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
              <span>{descLeft} character(s) left</span>
              <span>Maximum 500 characters</span>
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={busy}
            className="rounded bg-[#ea580c] px-7 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#c2410c] active:scale-95 transition-all disabled:opacity-50"
          >
            {busy ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={busy}
            className="rounded bg-[#ea580c] px-7 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#c2410c] active:scale-95 transition-all disabled:opacity-50"
          >
            Reset
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-slate-500 italic pt-1">
          Note: Please mention the Sub Block in case of Hostel.
        </p>
      </form>
    </main>
  );
}

export function ComplaintDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');
  const [staff, setStaff] = useState([]);
  const [note, setNote] = useState('');
  const [files, setFiles] = useState([]);
  const [cm, setCm] = useState('');
  const [rate, setRate] = useState({ rating: 5, comment: '' });

  const load = () => api('/complaints/' + id).then(setD).catch(e => setErr(e.message));

  useEffect(() => {
    load();
    if (user.role === 'admin') {
      api('/admin/users?role=staff&isActive=true&limit=100').then(r => setStaff(r.items)).catch(() => {});
    }
  }, [id]);

  const run = p => p.then(() => {
    setErr('');
    setNote('');
    setCm('');
    setFiles([]);
    load();
  }).catch(e => setErr(e.message));

  const post = (path, body) => run(api(path, { method: 'POST', body }));

  const setStatus = status => {
    const form = new FormData();
    form.append('status', status);
    if (note) form.append('message', note);
    files.forEach(x => form.append('attachments', x));
    run(api('/complaints/' + id + '/status', { method: 'POST', form }));
  };

  if (!d) {
    return (
      <main className="mx-auto max-w-4xl p-8">
        <Err m={err} />
        {!err && <div className="card animate-pulse text-slate-400">Loading complaint details…</div>}
      </main>
    );
  }

  const { complaint: c, history, comments, feedback } = d;
  const done = ['CLOSED', 'REJECTED'].includes(c.status);

  const opts = user.role === 'student'
    ? (c.status === 'RESOLVED' ? [['CLOSED', 'Confirm & Close Ticket'], ['IN_PROGRESS', 'Reopen Ticket (Issue Persists)']] : [])
    : user.role === 'staff'
    ? ({
        ASSIGNED: [['IN_PROGRESS', 'Mark In Progress']],
        IN_PROGRESS: [['RESOLVED', 'Mark as Resolved'], ['CLOSED', 'Close Issue']],
        RESOLVED: [['CLOSED', 'Close Issue']]
      }[c.status] || [])
    : done
    ? []
    : [['IN_PROGRESS', 'Set In Progress'], ['RESOLVED', 'Mark Resolved'], ['CLOSED', 'Close Ticket'], ['REJECTED', 'Reject Ticket']].filter(([s]) => s !== c.status);

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <Err m={err} />

      <div className="card space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-teal">{c.complaintId}</span>
              {c.messageType && (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
                  {c.messageType}
                </span>
              )}
              <PriorityBadge p={c.priority} />
            </div>
            <h1 className="mt-1 text-2xl font-extrabold text-ink">{c.title}</h1>
          </div>
          <Badge s={c.status} />
        </div>

        {/* Structured Ticket Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-line/60 text-xs text-slate-700">
          <div>
            <span className="text-slate-400 block font-medium">Category</span>
            <span className="font-semibold text-ink">{c.category}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Sub Category</span>
            <span className="font-semibold text-ink">{c.subCategory || 'General'}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Specific Category</span>
            <span className="font-semibold text-ink">{c.specificCategory || 'Routine'}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Department</span>
            <span className="font-semibold text-teal">{c.department || 'Maintenance'}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Block & Location</span>
            <span className="font-semibold text-ink">{c.location}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Contact Number</span>
            <span className="font-semibold text-ink">{c.contactNo || c.submittedBy?.phone || '—'}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Availability Date</span>
            <span className="font-semibold text-ink">{c.availabilityDate || 'Anytime'}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Time Slot</span>
            <span className="font-semibold text-ink">
              {Array.isArray(c.timeSlot) && c.timeSlot.length ? c.timeSlot.join(', ') : 'Flexible'}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-slate-400 block font-medium">Reported by</span>
            <span className="font-semibold text-ink">{c.submittedBy?.name} ({c.submittedBy?.studentId || c.submittedBy?.email})</span>
          </div>
          <div className="col-span-2">
            <span className="text-slate-400 block font-medium">Assigned Staff</span>
            <span className="font-semibold text-ink">
              {c.assignedTo?.name ? `${c.assignedTo.name} (${c.assignedTo.department || c.department})` : 'Unassigned'}
            </span>
          </div>
        </div>

        <div>
          <h3 className="lbl">Detailed Description</h3>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-lg border border-line/50">
            {c.description}
          </p>
        </div>

        {!!c.attachments?.length && (
          <div>
            <h3 className="lbl">Attached Photos ({c.attachments.length})</h3>
            <div className="mt-2 flex flex-wrap gap-3">
              {c.attachments.map(a => (
                <a key={a._id} href={fileUrl(a.url)} target="_blank" rel="noreferrer" className="group block text-xs">
                  <img
                    alt={a.originalName || 'Attachment'}
                    className="h-28 w-28 rounded-lg border border-line object-cover transition-transform group-hover:scale-105"
                    src={fileUrl(a.url)}
                  />
                  <span className="mt-1 block text-center text-slate-500 font-medium">
                    {a.kind === 'resolution' ? 'Resolution Proof' : 'Evidence Photo'}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {user.role === 'admin' && !done && (
        <div className="card space-y-2 bg-teal-soft/20 border-teal/30">
          <label className="block">
            <span className="lbl text-teal font-bold">Assign Ticket to Staff Member</span>
            <select
              className="inp max-w-sm mt-1"
              value=""
              onChange={e => e.target.value && post('/complaints/' + id + '/assign', { staffId: e.target.value })}
            >
              <option value="">Select staff member...</option>
              {staff.map(s => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.department || 'General'})
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {!!opts.length && (
        <div className="card space-y-4 border-l-4 !border-l-teal">
          <h2 className="font-bold text-ink">Update Ticket Status</h2>
          <input
            className="inp"
            placeholder="Status update note (required when rejecting)"
            value={note}
            onChange={e => setNote(e.target.value)}
          />

          {user.role === 'staff' && c.status === 'IN_PROGRESS' && (
            <label className="block text-sm">
              <span className="lbl">Upload Resolution Photos (Optional)</span>
              <input
                type="file"
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-teal file:text-white hover:file:bg-ink cursor-pointer"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={e => setFiles([...e.target.files].slice(0, 5))}
              />
            </label>
          )}

          <div className="flex flex-wrap gap-2.5">
            {opts.map(([s, l]) => (
              <button
                key={s}
                className={`btn ${s === 'RESOLVED' ? '!bg-emerald-600' : s === 'REJECTED' ? '!bg-rose-600' : ''}`}
                onClick={() => setStatus(s)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      )}

      {user.role === 'student' && ['RESOLVED', 'CLOSED'].includes(c.status) && !feedback && (
        <div className="card space-y-3 bg-amber-50/50 border-amber-200">
          <h2 className="font-bold text-ink">Rate the Resolution Quality</h2>
          <p className="text-xs text-slate-600">Please provide feedback so we can ensure maintenance quality standards.</p>
          <div className="flex items-center gap-3">
            <select
              aria-label="Rating"
              className="inp max-w-[10rem]"
              value={rate.rating}
              onChange={e => setRate({ ...rate, rating: +e.target.value })}
            >
              {[5, 4, 3, 2, 1].map(n => (
                <option key={n} value={n}>{n} Stars</option>
              ))}
            </select>
          </div>
          <textarea
            className="inp"
            rows={2}
            placeholder="Optional comment about the repair..."
            onChange={e => setRate({ ...rate, comment: e.target.value })}
          />
          <button className="btn" onClick={() => post('/feedback', { complaintId: id, ...rate })}>
            Submit Rating & Feedback
          </button>
        </div>
      )}

      {feedback && (
        <div className="card bg-emerald-50/50 border-emerald-200 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-800">Student Rating:</span>
            <span className="font-bold text-amber-600">{feedback.rating} / 5</span>
          </div>
          {feedback.comment && <p className="text-sm text-slate-700 italic">"{feedback.comment}"</p>}
        </div>
      )}

      <div className="card space-y-4">
        <h2 className="font-bold text-ink text-base">Activity & Audit Timeline</h2>
        {!history.length ? (
          <p className="text-sm text-slate-500">No activity logged yet.</p>
        ) : (
          <ul className="space-y-4 text-sm">
            {history.map(h => (
              <li key={h._id} className="relative pl-6 before:absolute before:left-2 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-teal border-l-2 border-line">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span className="font-semibold text-ink">{h.action}</span>
                  <span className="text-xs text-slate-400">{fmt(h.timestamp)}</span>
                </div>
                {h.performedBy?.name && (
                  <p className="text-xs text-slate-500">By {h.performedBy.name} ({h.performedBy.role})</p>
                )}
                {h.message && (
                  <p className="mt-1 text-slate-700 bg-slate-50 p-2 rounded text-xs">{h.message}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card space-y-4">
        <h2 className="font-bold text-ink text-base">Discussion Comments ({comments.length})</h2>
        <div className="space-y-3">
          {comments.map(m => (
            <div key={m._id} className="rounded-lg bg-slate-50 p-3.5 border border-line/60">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-ink">{m.author?.name} <span className="text-slate-500 uppercase font-normal">({m.author?.role})</span></span>
                <span className="text-slate-400">{fmt(m.createdAt)}</span>
              </div>
              <p className="mt-1 text-sm text-slate-700">{m.message}</p>
            </div>
          ))}
          {!comments.length && <p className="text-xs text-slate-500">No comments posted yet.</p>}
        </div>

        <div className="flex gap-2 pt-2">
          <input
            aria-label="Comment"
            className="inp"
            placeholder="Type a message or response..."
            value={cm}
            onChange={e => setCm(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && cm.trim()) post('/complaints/' + id + '/comments', { message: cm }); }}
          />
          <button
            className="btn shrink-0"
            disabled={!cm.trim()}
            onClick={() => post('/complaints/' + id + '/comments', { message: cm })}
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}

export function Notifications() {
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');

  const load = () => api('/notifications?limit=50').then(setD).catch(e => setErr(e.message));
  useEffect(() => { load(); }, []);

  const put = p => api(p, { method: 'PUT' }).then(load).catch(e => setErr(e.message));

  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Notifications</h1>
          <p className="text-xs text-slate-500">Stay updated on ticket assignments, status changes, and comments</p>
        </div>
        {!!d?.unread && (
          <button className="btn btn-ghost text-xs" onClick={() => put('/notifications/read-all')}>
            Mark all read
          </button>
        )}
      </div>

      <Err m={err} />

      {!d ? (
        <p className="text-slate-400">Loading notifications…</p>
      ) : !d.items.length ? (
        <div className="card text-center py-8 text-slate-500">You have no notifications.</div>
      ) : (
        d.items.map(n => (
          <div
            key={n._id}
            className={'card flex items-start justify-between gap-3 transition-colors ' + (n.isRead ? 'opacity-65' : 'border-l-4 !border-l-signal shadow')}
          >
            <div className="space-y-1">
              <p className="font-semibold text-ink text-sm">{n.title}</p>
              <p className="text-sm text-slate-600">{n.message}</p>
              <p className="text-xs text-slate-400">
                {fmt(n.createdAt)}
                {n.relatedComplaint && (
                  <> · <Link className="font-semibold text-teal underline" to={'/complaints/' + (n.relatedComplaint._id || n.relatedComplaint)}>View Ticket</Link></>
                )}
              </p>
            </div>
            {!n.isRead && (
              <button className="btn btn-ghost !py-1 !px-2.5 text-xs shrink-0" onClick={() => put('/notifications/' + n._id + '/read')}>
                Mark read
              </button>
            )}
          </div>
        ))
      )}
    </main>
  );
}
