import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.PROD ? 'https://crm-api.YOUR_SUBDOMAIN.workers.dev' : '/api';

function Dashboard({ onLogout }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', status: 'lead', notes: '' });

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${API_URL}/customers`, config);
      setCustomers(res.data.customers || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await axios.put(`${API_URL}/customers/${editing.id}`, form, config);
      else await axios.post(`${API_URL}/customers`, form, config);
      setShowModal(false); setEditing(null);
      setForm({ name: '', email: '', phone: '', company: '', status: 'lead', notes: '' });
      fetchCustomers();
    } catch (err) { alert('حدث خطأ'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('حذف هذا العميل؟')) return;
    try { await axios.delete(`${API_URL}/customers/${id}`, config); fetchCustomers(); }
    catch (err) { alert('خطأ في الحذف'); }
  };

  const badgeClass = (s) => ({ lead:'badge-lead', prospect:'badge-prospect', customer:'badge-customer', inactive:'badge-inactive' }[s]);
  const badgeText = (s) => ({ lead:'عميل محتمل', prospect:'مرشح', customer:'عميل', inactive:'غير نشط' }[s]);

  if (loading) return <div className="container"><p style={{color:'#fff',textAlign:'center'}}>جاري التحميل...</p></div>;

  return (
    <div className="container">
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h1 style={{color:'#667eea'}}>لوحة العملاء</h1>
          <button onClick={onLogout} className="btn btn-secondary">خروج</button>
        </div>
        <div className="flex justify-between items-center">
          <p>العدد: {customers.length}</p>
          <button onClick={()=>{setEditing(null);setForm({name:'',email:'',phone:'',company:'',status:'lead',notes:''});setShowModal(true);}} className="btn btn-primary">+ جديد</button>
        </div>
        <table className="table">
          <thead><tr><th>الاسم</th><th>البريد</th><th>الهاتف</th><th>الشركة</th><th>الحالة</th><th>إجراءات</th></tr></thead>
          <tbody>
            {customers.length===0?<tr><td colSpan="6" className="text-center">لا يوجد عملاء</td></tr>:
              customers.map(c=>(
                <tr key={c.id}>
                  <td>{c.name}</td><td>{c.email||'-'}</td><td>{c.phone||'-'}</td><td>{c.company||'-'}</td>
                  <td><span className={`badge ${badgeClass(c.status)}`}>{badgeText(c.status)}</span></td>
                  <td>
                    <button onClick={()=>{setEditing(c);setForm({name:c.name,email:c.email||'',phone:c.phone||'',company:c.company||'',status:c.status,notes:c.notes||''});setShowModal(true);}} className="btn btn-primary" style={{padding:'4px 12px',marginLeft:'8px'}}>تعديل</button>
                    <button onClick={()=>handleDelete(c.id)} className="btn btn-danger" style={{padding:'4px 12px'}}>حذف</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {showModal&&(
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editing?'تعديل':'إضافة'} عميل</h3>
              <button className="close-btn" onClick={()=>setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label className="label">الاسم *</label><input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></div>
              <div className="form-group"><label className="label">البريد</label><input type="email" className="input" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
              <div className="form-group"><label className="label">الهاتف</label><input className="input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
              <div className="form-group"><label className="label">الشركة</label><input className="input" value={form.company} onChange={e=>setForm({...form,company:e.target.value})}/></div>
              <div className="form-group"><label className="label">الحالة</label>
                <select className="input" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                  <option value="lead">عميل محتمل</option><option value="prospect">مرشح</option><option value="customer">عميل</option><option value="inactive">غير نشط</option>
                </select>
              </div>
              <div className="form-group"><label className="label">ملاحظات</label><textarea className="input" rows="3" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></div>
              <div className="flex gap-2 mt-4">
                <button type="submit" className="btn btn-primary" style={{flex:1}}>{editing?'تحديث':'إضافة'}</button>
                <button type="button" className="btn btn-secondary" onClick={()=>setShowModal(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default Dashboard;
