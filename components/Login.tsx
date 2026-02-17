
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Mail, Lock, Loader2, ArrowRight, Sparkles, AlertCircle, LayoutDashboard } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (session: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError("O serviço de autenticação não está configurado corretamente. Verifique as variáveis de ambiente.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        if (data.user && !data.session) {
          setError("Cadastro realizado! Verifique seu e-mail para confirmar a conta.");
        } else if (data.session) {
          onLoginSuccess(data.session);
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        if (data.session) onLoginSuccess(data.session);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 relative overflow-hidden">
      {/* Luzes de fundo decorativas */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-xl shadow-blue-900/40 mb-6">
              <LayoutDashboard size={32} />
            </div>
            <h1 className="text-3xl font-black text-white italic tracking-tight">FINANZA</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-2 text-center">
              Gestão Patrimonial Inteligente
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold animate-in slide-in-from-top-2 ${
                error.includes('Cadastro realizado') ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
              }`}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="email"
                  required
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all placeholder-slate-700"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="password"
                  required
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all placeholder-slate-700"
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-900/40 transition-all active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Criar Conta' : 'Entrar'}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
            >
              {isSignUp ? 'Já tem uma conta? Entrar' : 'Não tem conta? Cadastre-se'}
            </button>
            
            <div className="flex items-center gap-2 justify-center text-[10px] text-slate-700 font-bold uppercase tracking-widest pt-4">
              <Sparkles size={12} className="text-blue-600" />
              <span>Protegido por Finanza Cloud</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
