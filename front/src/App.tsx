import { lazy, Suspense, useEffect } from 'react';
import { UIProvider, useUI } from './context/UIContext';
import { AuthProvider } from './context/AuthContext';
import { CommerceProvider } from './context/CommerceContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { WhatsAppFloat } from './components/WhatsAppFloat';
import { TeamNavigation } from './components/TeamNavigation';
import { InternalAccess } from './components/InternalAccess';
import { StickyModal } from './components/modals/StickyModal';
import { ProductZoomModal } from './components/modals/ProductZoomModal';
import { CatalogSecretModal } from './components/modals/CatalogSecretModal';
import { HomePage } from './pages/HomePage';
import { getSubcategoryData } from './data/catalog';

const CatalogPage=lazy(()=>import('./pages/CatalogPage').then(m=>({default:m.CatalogPage})));
const LoginPage=lazy(()=>import('./pages/LoginPage').then(m=>({default:m.LoginPage})));
const CartPage=lazy(()=>import('./pages/CartPage').then(m=>({default:m.CartPage})));
const TrackingPage=lazy(()=>import('./pages/TrackingPage').then(m=>({default:m.TrackingPage})));
const DashboardPage=lazy(()=>import('./pages/DashboardPage').then(m=>({default:m.DashboardPage})));
const InventoryPage=lazy(()=>import('./pages/InventoryPage').then(m=>({default:m.InventoryPage})));
const OrdersPage=lazy(()=>import('./pages/OrdersPage').then(m=>({default:m.OrdersPage})));
const ProductManagementPage=lazy(()=>import('./pages/ProductManagementPage').then(m=>({default:m.ProductManagementPage})));
const ReplenishmentPage=lazy(()=>import('./pages/ReplenishmentPage').then(m=>({default:m.ReplenishmentPage})));
const TeamPage=lazy(()=>import('./pages/TeamPage').then(m=>({default:m.TeamPage})));
const ContactsPage=lazy(()=>import('./pages/ContactsPage').then(m=>({default:m.ContactsPage})));
const MarcasPage=lazy(()=>import('./pages/MarcasPage').then(m=>({default:m.MarcasPage})));
const NosotrosPage=lazy(()=>import('./pages/NosotrosPage').then(m=>({default:m.NosotrosPage})));
const APF3AnalyticsPage=lazy(()=>import('./pages/APF3AnalyticsPage').then(m=>({default:m.APF3AnalyticsPage})));

function AppContent(){
  const {currentPath,navigate}=useUI();
  useEffect(()=>{
    const click=(e:MouseEvent)=>{
      if(e.defaultPrevented || e.button!==0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || !(e.target instanceof Element))return;
      const a=e.target.closest('a');const href=a?.getAttribute('href');
      if(!a||!href||a.hasAttribute('download')||a.target==='_blank'||/^(https?:|mailto:|tel:|#)/.test(href))return;
      e.preventDefault();navigate(href);
    };
    document.addEventListener('click',click);return()=>document.removeEventListener('click',click);
  },[navigate]);
  const path=currentPath.split('?')[0].replace(/^\//,'').replace(/\.html$/,'').toLowerCase();
  const page=()=>{
    if(!path||['index','inicio'].includes(path))return <HomePage/>;
    if(path==='marcas')return <MarcasPage/>;
    if(path==='nosotros')return <NosotrosPage/>;
    if(path==='login')return <LoginPage/>;
    if(['apf3','apf-03','ia','ia-analytics','analytics','ia-devops'].includes(path))return <APF3AnalyticsPage/>;
    if(path==='carrito')return <CartPage/>;
    if(path==='seguimiento')return <TrackingPage/>;
    if(['panel','dashboard'].includes(path))return <InternalAccess roles={['GERENCIA','VENTAS','ALMACEN']}><DashboardPage/></InternalAccess>;
    if(['gestion-productos','admin-productos','admin'].includes(path))return <InternalAccess roles={['GERENCIA']}><ProductManagementPage/></InternalAccess>;
    if(path==='inventario')return <InternalAccess roles={['GERENCIA','ALMACEN']}><InventoryPage/></InternalAccess>;
    if(['pedidos','pedidos-borrador','ventas'].includes(path))return <InternalAccess roles={['GERENCIA','VENTAS','ALMACEN']}><OrdersPage/></InternalAccess>;
    if(path==='reposicion')return <InternalAccess roles={['GERENCIA','ALMACEN']}><ReplenishmentPage/></InternalAccess>;
    if(path==='equipo')return <InternalAccess roles={['GERENCIA']}><TeamPage/></InternalAccess>;
    if(path==='contactos')return <InternalAccess roles={['GERENCIA','VENTAS']}><ContactsPage/></InternalAccess>;
    if(['catalogo','productos-visor'].includes(path))return <CatalogPage key={currentPath}/>;
    const matched=getSubcategoryData(path);
    if(matched)return <CatalogPage key={currentPath} initialSlug={matched.key}/>;
    if(/^(categoria-|subcategoria-)/.test(path)||['bebidas','alcoholicas'].includes(path)){
      const macros:Record<string,string>={'categoria-bebidas':'Bebidas','bebidas':'Bebidas','categoria-alcoholicas':'Bebidas','alcoholicas':'Bebidas','categoria-limpieza':'Limpieza','categoria-papeleria':'Útiles','categoria-hogar':'Otros','categoria-cuidado-personal':'Cuidado Personal'};
      return <CatalogPage key={currentPath} initialCategory={macros[path]||path.replace(/^(subcategoria-|categoria-)/,'').replace(/-/g,' ')}/>;
    }
    return <section className="tca-page"><h1>Página no encontrada</h1><a href="/catalogo">Volver al catálogo</a></section>;
  };
  return <div className="min-h-screen flex flex-col bg-white"><Header/><TeamNavigation/><Sidebar/>
    <main className="flex-1 w-full pb-20 overflow-x-hidden"><Suspense fallback={<p className="tca-page" role="status">Cargando pantalla…</p>}>{page()}</Suspense></main>
    <Footer/><WhatsAppFloat/><StickyModal/><ProductZoomModal/><CatalogSecretModal/>
  </div>;
}
export function App(){return <UIProvider><AuthProvider><CommerceProvider><AppContent/></CommerceProvider></AuthProvider></UIProvider>;}
export default App;
