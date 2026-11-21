import { money } from '../utils/format';
import { useState } from 'react';
import { getManagedProducts,saveManagedProduct,updateManagedProduct,deleteManagedProduct } from '../services/productService';
import { useResource,useAction } from '../hooks/useResource';
import { Page, ResourceStatus, Notice } from '../components/OperationUI';
import { ProductFormModal } from '../components/admin/ProductFormModal';
import { CatalogImportModal } from '../components/admin/CatalogImportModal';
import type { ManagedProduct } from '../types';

export function ProductManagementPage(){
  const resource=useResource(async()=>(await getManagedProducts()).data);const action=useAction(resource.refresh);
  const [query,setQuery]=useState('');const [low,setLow]=useState(false);const [formOpen,setFormOpen]=useState(false);
  const [editing,setEditing]=useState<ManagedProduct|null>(null);const [importOpen,setImportOpen]=useState(false);
  const products=resource.data||[];
  const save=async(product:ManagedProduct)=>{let saved=false;let failure="";await action.run(JSON.stringify(product),async key=>{const res=editing?await updateManagedProduct(editing.codigo,product,products,key):await saveManagedProduct(product,products,key);if(!res.success){failure=res.error||"No se pudo guardar.";throw new Error(failure);}saved=true;},'Producto guardado en el inventario central.');return {success:saved,error:saved?undefined:failure||'No se pudo guardar el producto.'};};
  return <Page title="Gestión de productos" description="Mantén códigos, precios, imágenes y parámetros de reposición. Las existencias se cambian mediante recepción o despacho para conservar su historial.">
    <ResourceStatus {...resource} retry={resource.refresh}/><Notice error={action.error} message={action.message}/>
    <div className="tca-row"><label className="grow">Buscar producto<input type="search" value={query} onChange={e=>setQuery(e.target.value)}/></label><label className="tca-check"><input type="checkbox" checked={low} onChange={e=>setLow(e.target.checked)}/>En mínimo o agotado</label><button className="tca-button" onClick={()=>{setEditing(null);setFormOpen(true);}}>Crear producto</button><button className="tca-button secondary" onClick={()=>setImportOpen(true)}>Validar e importar JSON</button></div>
    <div className="tca-table tca-card"><table><thead><tr><th>Código / producto</th><th>Categoría</th><th>Precio</th><th>Físico</th><th>Reservado</th><th>Disponible / mínimo</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{products.filter(p=>`${p.codigo} ${p.nombre} ${p.marca}`.toLowerCase().includes(query.toLowerCase())&&(!low||p.stock_actual-(p.stock_reservado||0)<=p.stock_minimo)).map(p=><tr key={p.codigo}><td><small>{p.codigo}</small><br/>{p.nombre}</td><td>{p.categoria}</td><td>{money(p.precio)}</td><td>{p.stock_actual}</td><td>{p.stock_reservado||0}</td><td><strong className={p.stock_actual-(p.stock_reservado||0)<=p.stock_minimo?'text-red-700':'text-green-800'}>{p.stock_actual-(p.stock_reservado||0)}</strong> / {p.stock_minimo}</td><td>{p.activo?'Activo':'Inactivo'}</td><td><div className="tca-row"><button className="tca-button secondary" onClick={()=>{setEditing(p);setFormOpen(true);}}>Editar</button>{p.activo&&<button className="tca-button secondary" disabled={action.busy} onClick={()=>{if(window.confirm('¿Desactivar este producto? Su historial se conserva.'))void action.run(`disable:${p.codigo}`,async()=>{const res=await deleteManagedProduct(p.codigo,products);if(!res.success)throw new Error(res.error);},'Producto desactivado.');}}>Desactivar</button>}</div></td></tr>)}</tbody></table>{!products.length&&!resource.loading&&<p>No hay productos. Importa la semilla depurada o crea el primero.</p>}</div>
    {formOpen&&<ProductFormModal key={editing?.codigo||'new'} isOpen onClose={()=>setFormOpen(false)} onSave={save} productToEdit={editing} existingProducts={products}/>}
    <CatalogImportModal isOpen={importOpen} onClose={()=>setImportOpen(false)} existingProducts={products} onImportCompleted={()=>{void resource.refresh();}}/>
  </Page>;
}
