
import React, { useState, useEffect } from 'react';
import { Asset, AssetType, AssetSubtype, PaymentFrequency, YieldIndicator } from '../types';
import { X } from 'lucide-react';

interface AssetFormProps {
  onClose: () => void;
  onSave: (asset: Asset) => void;
  initialData?: Partial<Asset>;
}

const AssetForm: React.FC<AssetFormProps> = ({ onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<Asset>>({
    type: AssetType.FIXED_INCOME,
    subtype: AssetSubtype.CRI,
    paymentFrequency: PaymentFrequency.MONTHLY,
    fgcGarranty: false,
    incomeTax: 'Isento',
    adminFee: 0,
    performanceFee: 0,
    allocationDate: new Date().toISOString().split('T')[0],
    indicator: YieldIndicator.CDI,
    ...initialData
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: formData.id || Math.random().toString(36).substr(2, 9),
    } as Asset);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-800">
        <div className="flex items-center justify-between p-6 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <div>
            <h2 className="text-xl font-bold text-white">
              {formData.id && !initialData?.hasOwnProperty('id') ? 'Importar Ativo' : (formData.id ? 'Editar Ativo' : 'Novo Ativo')}
            </h2>
            {initialData && !initialData.id && <p className="text-xs text-blue-400 font-bold">Preenchido automaticamente via IA ✨</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Nome do Ativo</label>
              <input 
                required
                value={formData.name || ''}
                className="w-full px-4 py-2 rounded-xl bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-600 outline-none transition-all placeholder-slate-500"
                placeholder="Ex: CRI BTG Pactual"
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Tipo de Ativo</label>
              <select 
                value={formData.type}
                className="w-full px-4 py-2 rounded-xl bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-600 outline-none transition-all appearance-none"
                onChange={e => setFormData({...formData, type: e.target.value as AssetType})}
              >
                <option value={AssetType.FIXED_INCOME}>Renda Fixa</option>
                <option value={AssetType.VARIABLE_INCOME}>Renda Variável</option>
                <option value={AssetType.CRYPTO}>Cripto</option>
              </select>
            </div>

            {formData.type === AssetType.FIXED_INCOME && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300">Indexador / Indicador</label>
                <select 
                  value={formData.indicator}
                  className="w-full px-4 py-2 rounded-xl bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-600 outline-none transition-all appearance-none"
                  onChange={e => setFormData({...formData, indicator: e.target.value as YieldIndicator})}
                >
                  {Object.values(YieldIndicator).map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Subtipo</label>
              <select 
                value={formData.subtype}
                className="w-full px-4 py-2 rounded-xl bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-600 outline-none transition-all appearance-none"
                onChange={e => setFormData({...formData, subtype: e.target.value as AssetSubtype})}
              >
                {Object.values(AssetSubtype).map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Valor Investido (R$)</label>
              <input 
                type="number"
                required
                value={formData.investedAmount || ''}
                className="w-full px-4 py-2 rounded-xl bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-600 outline-none transition-all placeholder-slate-500"
                placeholder="0.00"
                onChange={e => setFormData({...formData, investedAmount: Number(e.target.value)})}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Taxa de Rentabilidade (% a.a.)</label>
              <input 
                type="number"
                step="0.01"
                required
                value={formData.yieldRate || ''}
                className="w-full px-4 py-2 rounded-xl bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-600 outline-none transition-all placeholder-slate-500"
                placeholder="0.00"
                onChange={e => setFormData({...formData, yieldRate: Number(e.target.value)})}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Dividend Yield Esperado (% a.a.)</label>
              <input 
                type="number"
                step="0.01"
                value={formData.dividendYield || ''}
                className="w-full px-4 py-2 rounded-xl bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-600 outline-none transition-all placeholder-slate-500"
                placeholder="0.00"
                onChange={e => setFormData({...formData, dividendYield: Number(e.target.value)})}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Data da Alocação</label>
              <input 
                type="date"
                required
                value={formData.allocationDate || ''}
                className="w-full px-4 py-2 rounded-xl bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                onChange={e => setFormData({...formData, allocationDate: e.target.value})}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Vencimento</label>
              <input 
                type="date"
                required
                value={formData.maturityDate || ''}
                className="w-full px-4 py-2 rounded-xl bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                onChange={e => setFormData({...formData, maturityDate: e.target.value})}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Dividendos</label>
              <select 
                value={formData.paymentFrequency}
                className="w-full px-4 py-2 rounded-xl bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-600 outline-none transition-all appearance-none"
                onChange={e => setFormData({...formData, paymentFrequency: e.target.value as PaymentFrequency})}
              >
                {Object.values(PaymentFrequency).map(freq => (
                  <option key={freq} value={freq}>{freq}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-800">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Imposto de Renda</label>
              <select 
                value={formData.incomeTax === 'Isento' ? 'isento' : formData.incomeTax}
                className="w-full px-4 py-2 rounded-xl bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-600 outline-none transition-all appearance-none"
                onChange={e => setFormData({...formData, incomeTax: e.target.value === 'isento' ? 'Isento' : Number(e.target.value)})}
              >
                <option value="isento">Isento</option>
                <option value="15">15%</option>
                <option value="17.5">17.5%</option>
                <option value="20">20%</option>
                <option value="22.5">22.5%</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Garantia FGC</label>
              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-white">
                  <input type="radio" name="fgc" value="true" checked={formData.fgcGarranty === true} onChange={() => setFormData({...formData, fgcGarranty: true})} className="w-4 h-4 accent-blue-600" /> Sim
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-white">
                  <input type="radio" name="fgc" value="false" checked={formData.fgcGarranty === false} onChange={() => setFormData({...formData, fgcGarranty: false})} className="w-4 h-4 accent-blue-600" /> Não
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Taxas (Adm/Perf)</label>
              <div className="flex gap-2">
                <input 
                  type="number"
                  placeholder="Adm"
                  value={formData.adminFee}
                  className="w-1/2 px-3 py-2 rounded-xl bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                  onChange={e => setFormData({...formData, adminFee: Number(e.target.value)})}
                />
                <input 
                  type="number"
                  placeholder="Perf"
                  value={formData.performanceFee}
                  className="w-1/2 px-3 py-2 rounded-xl bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                  onChange={e => setFormData({...formData, performanceFee: Number(e.target.value)})}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 font-bold transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-8 py-2.5 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 font-black transition-all shadow-xl shadow-blue-900/40"
            >
              Salvar Ativo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetForm;
