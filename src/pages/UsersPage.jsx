                  <option value="va">Asistente Virtual (VA)</option>
                  <option value="repairer">Reparador CRO</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="consumer">Consumidor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Organización</label>
                <select value={form.org_id} onChange={e => setForm({ ...form, org_id: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FA4A9]">
                  <option value="">Sin organización</option>
                  {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
              <div className="flex items-start gap-2 bg-blue-50 rounded-xl p-3">
                <Mail className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">Las credenciales aparecerán en pantalla para que las copies y se las envíes al usuario por email o WhatsApp.</p>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-100">
              <button onClick={handleCreate} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-medium rounded-xl bg-[#2FA4A9] hover:opacity-90 transition disabled:opacity-60">
                <Save className="w-4 h-4" />
                {saving ? 'Creando...' : 'Crear usuario'}
              </button>
              <button onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="font-display font-semibold text-[#1F3A5F] mb-1">¿Eliminar usuario?</h2>
              <p className="text-sm text-slate-500">
                Vas a eliminar a <strong>{userToDelete.full_name || userToDelete.email}</strong> del portal. Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 text-white text-sm font-medium rounded-xl bg-red-500 hover:bg-red-600 transition disabled:opacity-60">
                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
              <button onClick={() => { setShowDeleteModal(false); setUserToDelete(null) }}
                className="flex-1 py-2.5 text-sm font-medium text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
