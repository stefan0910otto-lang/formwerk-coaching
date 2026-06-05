import { useRef } from 'react'
import Modal from './Modal.jsx'
import { settings as settingsStore } from '../utils/storage.js'

function pad(n) { return String(n).padStart(2, '0') }
function invoiceNumber(date, id) {
  const d = new Date(date)
  return `FW-${d.getFullYear()}${pad(d.getMonth() + 1)}-${id.slice(-4).toUpperCase()}`
}

export default function InvoiceModal({ payment, onClose }) {
  const s = settingsStore.get()
  const printRef = useRef(null)
  if (!payment) return null

  const invNo = invoiceNumber(payment.date, payment.id)
  const date = new Date(payment.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const dueDate = new Date(new Date(payment.date).getTime() + 14 * 86400000).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const net = (payment.amount / 1.19).toFixed(2)
  const vat = (payment.amount - +net).toFixed(2)

  function print() {
    const html = printRef.current.innerHTML
    const win = window.open('', '_blank')
    win.document.write(`<!DOCTYPE html><html><head><title>Rechnung ${invNo}</title><style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:Inter,-apple-system,sans-serif;color:#1e293b;padding:48px;max-width:800px;margin:0 auto}
      .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px}
      .logo{font-size:24px;font-weight:900;background:linear-gradient(135deg,#0891b2,#6d28d9);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
      .badge{background:#f1f5f9;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600;color:#64748b;margin-top:8px}
      h1{font-size:28px;font-weight:800;color:#0f172a;margin-bottom:4px}
      .meta{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:40px}
      .section-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8;margin-bottom:8px}
      .section-value{font-size:14px;color:#1e293b;line-height:1.6}
      table{width:100%;border-collapse:collapse;margin-bottom:24px}
      th{padding:10px 14px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8;border-bottom:2px solid #e2e8f0}
      td{padding:12px 14px;font-size:14px;border-bottom:1px solid #f1f5f9}
      .totals{margin-left:auto;width:280px}
      .total-row{display:flex;justify-content:space-between;padding:6px 0;font-size:14px;color:#475569}
      .total-final{display:flex;justify-content:space-between;padding:10px 0;font-size:16px;font-weight:700;color:#0f172a;border-top:2px solid #e2e8f0;margin-top:4px}
      .status{display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;background:${payment.status==='paid'?'#dcfce7':'#fef3c7'};color:${payment.status==='paid'?'#16a34a':'#d97706'}}
      .footer{margin-top:48px;padding-top:24px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;text-align:center}
    </style></head><body>${html}</body></html>`)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 300)
  }

  return (
    <Modal open={!!payment} onClose={onClose} title="Rechnung" size="xl">
      <div className="flex justify-end gap-2 mb-4">
        <button onClick={print} className="btn-primary flex items-center gap-2">🖨️ Drucken / PDF speichern</button>
        <button onClick={onClose} className="btn-secondary">Schließen</button>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-xl p-8 text-slate-800 text-sm shadow-inner overflow-auto max-h-[65vh]" ref={printRef}>
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <div className="text-2xl font-black" style={{ background: 'linear-gradient(135deg,#0891b2,#6d28d9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Formwerk Coaching
            </div>
            <div className="text-xs text-slate-400 mt-1">Personal Coaching · Online</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-800">Rechnung</div>
            <div className="text-sm text-slate-500 mt-1">{invNo}</div>
            <div className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${payment.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {payment.status === 'paid' ? 'Bezahlt' : 'Ausstehend'}
            </div>
          </div>
        </div>

        {/* From / To */}
        <div className="grid grid-cols-2 gap-8 mb-10">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Von</div>
            <div className="text-slate-700 leading-relaxed">
              <strong>{s.adminName || 'Stefan Otto'}</strong><br />
              Formwerk Coaching<br />
              {s.adminEmail || 'polgota.buisness@gmail.com'}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">An</div>
            <div className="text-slate-700 leading-relaxed">
              <strong>{payment.clientName}</strong>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-3 gap-4 mb-8 bg-slate-50 rounded-xl p-4">
          {[['Rechnungsdatum', date], ['Fälligkeitsdatum', dueDate], ['Rechnungsnr.', invNo]].map(([k, v]) => (
            <div key={k}>
              <div className="text-xs text-slate-400 mb-1">{k}</div>
              <div className="font-semibold text-slate-700">{v}</div>
            </div>
          ))}
        </div>

        {/* Line items */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
              {['Beschreibung', 'Menge', 'Einzelpreis', 'Gesamt'].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: h !== 'Menge' ? 'left' : 'center', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', color: '#94a3b8' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '12px', fontSize: '14px', color: '#1e293b' }}>
                <strong>Coaching-Paket: {payment.plan}</strong><br />
                <span style={{ fontSize: '12px', color: '#64748b' }}>Monatliche Betreuungsgebühr</span>
              </td>
              <td style={{ padding: '12px', textAlign: 'center', color: '#1e293b' }}>1</td>
              <td style={{ padding: '12px', color: '#1e293b' }}>{net}€</td>
              <td style={{ padding: '12px', fontWeight: 600, color: '#1e293b' }}>{net}€</td>
            </tr>
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ marginLeft: 'auto', width: '280px' }}>
          {[['Netto', `${net}€`], ['MwSt. 19%', `${vat}€`]].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '14px', color: '#475569' }}>
              <span>{k}</span><span>{v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '17px', fontWeight: 700, color: '#0f172a', borderTop: '2px solid #e2e8f0', marginTop: '4px' }}>
            <span>Gesamt</span><span>{payment.amount}€</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '48px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
          Vielen Dank für dein Vertrauen · Formwerk Coaching · {s.adminEmail || 'polgota.buisness@gmail.com'}
          {payment.stripeId && <span> · Stripe: {payment.stripeId}</span>}
        </div>
      </div>
    </Modal>
  )
}
