'use client';

import { useState, useEffect } from 'react';
import { usePatientAuth } from '@/context/PatientAuthContext';
import { patientApi } from '@/lib/patient-api';
import { FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PatientDocumentsPage() {
    const { token } = usePatientAuth();
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            loadDocuments();
        }
    }, [token]);

    const loadDocuments = async () => {
        try {
            const data = await patientApi.getDocuments(token!);
            setDocuments(data);
        } catch (error) {
            console.error('Erro ao carregar documentos:', error);
        } finally {
            setLoading(false);
        }
    };

    // Helper para formatar data com segurança
    const formatDate = (dateValue: any) => {
        if (!dateValue) return 'Data não definida';
        try {
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) return 'Data inválida';
            return format(date, 'dd/MM/yyyy', { locale: ptBR });
        } catch {
            return 'Data inválida';
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
    }

    return (
        <div className="space-y-6 pb-20 md:pb-0">
            <h1 className="text-3xl font-bold text-gray-900">Meus Documentos</h1>

            {documents.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum documento disponível</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.map((doc) => (
                        <div key={doc.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-purple-50 rounded-lg">
                                        <FileText className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{doc.tipo}</p>
                                        <p className="text-sm text-gray-600">
                                            {formatDate(doc.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {doc.descricao && (
                                <p className="text-sm text-gray-600 mb-4">{doc.descricao}</p>
                            )}
                            {doc.url && (
                                <a
                                    href={`${process.env.NEXT_PUBLIC_API_URL}${doc.url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    Baixar/Visualizar
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
