import { FormDialog } from '../FormDialog';
import { useState } from 'react';
import { useUI } from '../../context/UIContext';
import { useCommerce } from '../../context/CommerceContext';
import { downloadCsv } from '../../utils/download';
import { Notice } from '../OperationUI';
export function CatalogSecretModal(){
  const {isCatalogModalOpen,closeCatalogModal}=useUI();const commerce=useCommerce();const [downloaded,setDownloaded]=useState(false);
  if(!isCatalogModalOpen)return null;
  return <FormDialog title="Descargar catálogo" className="tca-dialog" closeLabel="Cerrar descarga" onClose={closeCatalogModal}>
    <h2>Descargar catálogo comercial</h2><p>Archivo CSV con código, producto, precio y disponibilidad al momento de la consulta. La disponibilidad puede cambiar; el archivo no reserva unidades.</p><Notice error={commerce.error} message={downloaded?'Archivo generado para descargar.':undefined}/>{commerce.example&&<p className="tca-warning">El archivo contiene datos ficticios de ejemplo.</p>}
    <button className="tca-button" disabled={commerce.loading||!!commerce.error||!commerce.products.length} onClick={()=>{downloadCsv('catalogo-tca.csv',['Código','Producto','Categoría','Marca','Precio PEN','Disponible'],commerce.products.map(p=>[p.codigo,p.nombre,p.categoria,p.marca,p.precio,p.disponible]));setDownloaded(true);}}>Descargar CSV</button>
  </FormDialog>;
}
