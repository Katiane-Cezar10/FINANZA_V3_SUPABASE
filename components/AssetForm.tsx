import React, { useState } from 'react';
import { Asset, AssetType, AssetSubtype, PaymentFrequency, YieldIndicator } from '../types';
import { X } from 'lucide-react';

interface AssetFormProps {
  onClose: () => void;
  onSave: (asset: any) => void;
  initialData?: Partial<Asset>;
}

const AssetForm: React.FC<AssetFormProps> = ({ onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<any>({
    type: AssetType.FIXED_INCOME,
    subtype: AssetSubtype.CRI,
    paymentFrequency: PaymentFrequency.MONTHLY,
    allocationDate: new Date().toISOString().split('T')[0],
    ...initialData
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const assetToSave = {
      name: formData.name,
      type: formData.type,
      category: formData.subtype || null,

      invested_amount: Number(formData.investedAmount) || 0,
      current_value: Number(formData.currentValue || formData.investedAmount) || 0,

      annual_rate: formData.yieldRate
        ? Number(formData.yieldRate)
        : null,

      dividend_yield: formData.dividendYield
        ? Number(formData.dividendYield)
        : null,

      allocation_date: formData.allocationDate || null,
      maturity_date: formData.maturityDate || null,

      notes: formData.notes || null
    };

    onSave(assetToSave);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-800">
        <div className="flex items-center justify-between p-6 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <h2 className="text-xl font-bold text-white">
            {formData.id ? 'Editar Ativo' : 'Novo Ativo'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Nome */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Nome do Ativo</label>
              <input
                required
                value={formData.name || ''}
                className="w-full px-4 py-2 rounded-xl bg-slate-800 text-white border border-slate-700"
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Tipo */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Tipo</label>
              <select
                value={formData.type}
                className="w-full px-4 py-2 rounded-xl bg-slate-800 text-white border border-slate-700"
                onChange={e => setFormData({ ...formData, type: e.target.value })}
              >
                <option value={AssetType.FIXED_INCOME}>Renda Fixa</option>
                <option value={AssetType.VARIABLE_INCOME}>Renda Variável</option>
                <option value={AssetType.CRYPTO}>Cripto</option>
              </select>
            </div>

            {/* Subtipo */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Categoria</label>
              <select
                value={formData.subtype}
                className="w-full px-4 py-2 rounded-xl bg-slate-800 text-white border border-slate-700"
                onChange={e => setFormData({ ...formData, subtype: e.target.value })}
              >
                {Object.values(AssetSubtype).map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* Valor investido */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Valor Investido</label>
              <input
                type="number"
                required
                value={formData.investedAmount || ''}
                className="w-full px-4 py-2 rounded-xl bg-slate-800 text-white border border-slate-700"
                onChange={e => setFormData({ ...formData, investedAmount: e.target.value })}
              />
            </div>

            {/* Valor atual */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Valor Atual</label>
              <input
                type="number"
                value={formData.currentValue || ''}
                className="w-full px-4 py-2 rounded-xl bg-slate-800 text-white border border-slate-700"
                onChange={e => setFormData({ ...formData, currentValue: e.target.value })}
              />
            </div>

            {/* Taxa anual */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Taxa anual (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.yieldRate || ''}
                className="w-full px-4 py-2 rounded-xl bg-slate-800 text-white border border-slate-700"
                onChange={e => setFormData({ ...formData, yieldRate: e.target.value })}
              />
            </div>

            {/* Dividend yield */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Dividend Yield (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.dividendYield || ''}
                className="w-full px-4 py-2 rounded-xl bg-slate-800 text-white border border-slate-700"
                onChange={e => setFormData({ ...formData, dividendYield: e.target.value })}
              />
            </div>

            {/* Data alocação */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Data da Alocação</label>
              <input
                type="date"
                value={formData.allocationDate || ''}
                className="w-full px-4 py-2 rounded-xl bg-slate-800 text-white border border-slate-700"
                onChange={e => setFormData({ ...formData, allocationDate: e.target.value })}
              />
            </div>

            {/* Vencimento */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Vencimento</label>
              <input
                type="date"
                value={formData.maturityDate || ''}
                className="w-full px-4 py-2 rounded-xl bg-slate-800 text-white border border-slate-700"
                onChange={e => setFormData({ ...formData, maturityDate: e.target.value })}
              />
            </div>

            {/* Observações */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-slate-300">Observações</label>
              <textarea
                value={formData.notes || ''}
                className="w-full px-4 py-2 rounded-xl bg-slate-800 text-white border border-slate-700"
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 font-bold"
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
