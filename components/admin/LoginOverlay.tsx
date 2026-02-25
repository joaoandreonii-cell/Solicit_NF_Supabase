import React, { useState } from 'react';
import { LogIn, AlertTriangle } from 'lucide-react';

interface LoginOverlayProps {
    onLogin: () => void;
    onClose: () => void;
}

export const LoginOverlay: React.FC<LoginOverlayProps> = ({ onLogin, onClose }) => {
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');

        const ADMIN_PASSWORD = 'admin123';

        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem('transport_app_admin_auth', 'true');
            onLogin();
        } else {
            setLoginError('Senha incorreta.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-70 px-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md border border-slate-200">
                <div className="flex justify-center mb-6">
                    <div className="bg-blue-100 p-4 rounded-full shadow-inner">
                        <LogIn className="h-8 w-8 text-blue-600" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Acesso Administrativo</h2>
                <p className="text-center text-slate-500 mb-6 text-sm">Gerencie o banco de dados</p>
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <p className="text-sm text-amber-800">
                        O acesso ao Painel Administrativo requer uma senha de segurança.
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Senha de administrador</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                            className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="********"
                        />
                        {loginError && <p className="text-xs text-red-500 mt-1">{loginError}</p>}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancelar</button>
                        <button
                            type="submit"
                            className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                        >
                            Acessar Painel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
