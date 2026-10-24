import {createContext,useContext,useEffect,useState} from 'react';
import {Link,NavLink,Navigate,Route,Routes,useNavigate} from 'react-router-dom';
import {api} from './api.js';
import {Landing,Login,Register,Dashboard,NewComplaint,ComplaintDetail,Notifications} from './pages.jsx';
const Auth = createContext(); export const useAuth = () => useContext(Auth);
export default function App() {
  const [user,setUser] = useState(null); const [ready,setReady] = useState(false);
  useEffect(() => { if (!localStorage.getItem('cc_token')) return setReady(true);
    api('/auth/me').then(d => setUser(d.user || d)).catch(() => localStorage.removeItem('cc_token')).finally(() => setReady(true)); }, []);
  const login = d => { localStorage.setItem('cc_token', d.token); setUser(d.user); };
  const logout = () => { localStorage.removeItem('cc_token'); setUser(null); };
  if (!ready) return <p className="p-8">Loading…</p>;
  const Guard = ({children}) => user ? children : <Navigate to="/login" replace/>;
  return <Auth.Provider value={{user,login,logout}}>
    <Shell/>
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard"/> : <Landing/>}/>
      <Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/>
      <Route path="/dashboard" element={<Guard><Dashboard/></Guard>}/>
      <Route path="/complaints/new" element={<Guard><NewComplaint/></Guard>}/>
      <Route path="/complaints/:id" element={<Guard><ComplaintDetail/></Guard>}/>
      <Route path="/notifications" element={<Guard><Notifications/></Guard>}/>
      <Route path="*" element={<p className="p-8">Page not found.</p>}/>
    </Routes></Auth.Provider>;
}
function Shell() {
  const {user,logout} = useAuth(); const nav = useNavigate(); const [n,setN] = useState(0);
  useEffect(() => { if (user) api('/notifications').then(d => setN(d.unread || 0)).catch(() => {}); }, [user]);
  const a = ({isActive}) => 'px-2 py-1 text-sm ' + (isActive ? 'font-semibold underline underline-offset-4' : 'hover:underline');
  return <header className="bg-ink text-white"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
    <Link to="/" className="font-display text-xl font-extrabold">CampusCare</Link>
    <nav className="flex flex-wrap items-center gap-3">{user ? <>
      <NavLink to="/dashboard" className={a}>Dashboard</NavLink>
      {user.role === 'student' && <NavLink to="/complaints/new" className={a}>New complaint</NavLink>}
      <NavLink to="/notifications" className={a}>Notifications{n > 0 && <span className="ml-1 rounded bg-signal px-1.5 text-xs">{n}</span>}</NavLink>
      <span className="text-sm opacity-70">{user.name} ({user.role})</span>
      <button className="text-sm underline" onClick={() => {logout(); nav('/');}}>Log out</button></> : <>
      <NavLink to="/login" className={a}>Log in</NavLink><Link to="/register" className="btn !bg-signal">Register</Link></>}
    </nav></div></header>;
}
