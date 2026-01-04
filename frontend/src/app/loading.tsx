'use client';

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-center">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-violet-200 rounded-full animate-spin border-t-violet-600 mx-auto"></div>
                </div>
                <p className="text-gray-500 mt-4 font-medium animate-pulse">Carregando...</p>
            </div>
        </div>
    );
}
