import { createContext,useContext,useEffect,useState } from 'react';
import { api } from './api';
const AppContext=createContext(null);
export function AppProvider({children}) {
 const [user,setUser]=useState(null);const [ready,setReady]=useState(false);const [config,setConfig]=useState(null);const [toasts,setToasts]=useState([]);
 useEffect(()=>{api('/auth/me').then(d=>setUser(d.user)).catch(()=>setUser(null)).finally(()=>setReady(true));api('/config').then(setConfig).catch(()=>{});},[]);
 const toast=(message,type='success')=>{const id=crypto.randomUUID();setToasts(t=>[...t,{id,message,type}]);setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),5000);};
 const logout=async()=>{await api('/auth/logout',{method:'POST'});setUser(null);toast('You have been signed out.');};
 return <AppContext.Provider value={{user,setUser,ready,config,setConfig,toast,logout}}>{children}<div className="toast-container" aria-live="polite">{toasts.map(t=><div key={t.id} className={'toast '+t.type}>{t.message}<button aria-label="Dismiss notification" onClick={()=>setToasts(s=>s.filter(x=>x.id!==t.id))}>×</button></div>)}</div></AppContext.Provider>;
}
export const useApp=()=>useContext(AppContext);
