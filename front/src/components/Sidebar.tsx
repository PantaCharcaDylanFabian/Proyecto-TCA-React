import { useEffect, useRef, useState } from 'react';
import { useUI } from '../context/UIContext';
import { TOP_CATEGORIES } from '../data/categories';
import type { TopCategory, SubmenuGroup } from '../types';

export function Sidebar() {
  const { isSidebarOpen } = useUI();
  return isSidebarOpen ? <CategoryDrawer /> : null;
}

function CategoryDrawer() {
  const { closeSidebar } = useUI();
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [category, setCategory] = useState<TopCategory | null>(null);
  const [group, setGroup] = useState<SubmenuGroup | null>(null);

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  useEffect(() => { heading.current?.focus(); }, [category, group]);

  return <dialog ref={dialog} id="sidebar" className="tca-category-drawer" aria-labelledby="drawer-title"
    onCancel={closeSidebar} onClick={event => {
      if (event.target === dialog.current && event.clientX > dialog.current.getBoundingClientRect().right) closeSidebar();
    }}>
    <div className="tca-drawer-header">
      <h2 ref={heading} tabIndex={-1} id="drawer-title">{group?.title || category?.name || 'Categorías'}</h2>
      <button type="button" aria-label="Cerrar menú" onClick={closeSidebar}>×</button>
    </div>
    <nav aria-label="Explorar categorías" className="tca-drawer-links">
      {category && <button className="tca-drawer-back" onClick={() => group ? setGroup(null) : setCategory(null)}>‹ Volver a {group ? category.name : 'categorías'}</button>}
      {!category && TOP_CATEGORIES.map(item => item.groups.length
        ? <button key={item.id} onClick={() => setCategory(item)}>{item.name}<span aria-hidden="true">›</span></button>
        : <a key={item.id} href={item.href}>{item.name}</a>)}
      {category && !group && <>
        {category.href && category.href !== '#' && <a href={category.href}>Ver todo en {category.name}</a>}
        {category.groups.map(item => <button key={item.id} onClick={() => setGroup(item)}>{item.label}<span aria-hidden="true">›</span></button>)}
      </>}
      {group?.columns.map((column, index) => <section key={column.title || index}>
        {column.title && <h3>{column.href && column.href !== '#' ? <a href={column.href}>{column.title}</a> : column.title}</h3>}
        {column.links.filter(link => link.href !== column.href || link.label !== column.title).map(link =>
          <a key={link.href + link.label} href={link.href}>{link.label}</a>)}
      </section>)}
    </nav>
  </dialog>;
}
