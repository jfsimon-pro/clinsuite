'use client';

import { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, FileText, X, Download, Trash2, Eye } from 'lucide-react';

interface DocumentsTabProps {
    patientId: string;
}

export default function DocumentsTab({ patientId }: DocumentsTabProps) {
    const [documentos, setDocumentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [documentType, setDocumentType] = useState('FOTO');
    const [description, setDescription] = useState('');
    const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);

    useEffect(() => {
        fetchDocumentos();
    }, [patientId]);

    const fetchDocumentos = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/documentos/lead/${patientId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setDocumentos(data);
            }
        } catch (error) {
            console.error('Erro ao buscar documentos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tamanho (10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('Arquivo muito grande! Tamanho máximo: 10MB');
            return;
        }

        // Validar tipo
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            alert('Tipo de arquivo não permitido. Use apenas JPG, PNG ou PDF.');
            return;
        }

        setSelectedFile(file);
        setDescription(file.name);

        // Criar preview para imagens
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPreviewUrl(null);
        }

        setShowUploadModal(true);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setUploadProgress(0);

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('leadId', patientId);
            formData.append('tipo', documentType);
            formData.append('descricao', description);

            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percentage = (e.loaded / e.total) * 100;
                    setUploadProgress(Math.round(percentage));
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status === 201) {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setDescription('');
                    setDocumentType('FOTO');
                    fetchDocumentos();
                } else {
                    alert('Erro ao fazer upload do documento');
                }
                setUploading(false);
            });

            xhr.addEventListener('error', () => {
                alert('Erro ao fazer upload do documento');
                setUploading(false);
            });

            xhr.open('POST', `${process.env.NEXT_PUBLIC_API_URL}/documentos/upload`);
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            xhr.send(formData);
        } catch (error) {
            console.error('Erro ao fazer upload:', error);
            alert('Erro ao fazer upload do documento');
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este documento?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/documentos/${id}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                fetchDocumentos();
            } else {
                alert('Erro ao excluir documento');
            }
        } catch (error) {
            console.error('Erro ao excluir documento:', error);
            alert('Erro ao excluir documento');
        }
    };

    if (loading) {
        return <div className="text-center py-8">Carregando documentos...</div>;
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Documentos e Imagens</h2>
                <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Upload
                    <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,application/pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </label>
            </div>

            {documentos.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Nenhum documento anexado</p>
                    <p className="text-sm text-gray-500 mt-1">Faça upload de fotos, raios-X ou PDFs</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {documentos.map((doc: any) => (
                        <div key={doc.id} className="border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors">
                            <div
                                className="aspect-square bg-gray-100 flex items-center justify-center cursor-pointer relative group"
                                onClick={() => {
                                    if (doc.tipo !== 'PDF') {
                                        setFullImageUrl(`${process.env.NEXT_PUBLIC_API_URL}${doc.url}`);
                                    }
                                }}
                            >
                                {doc.tipo === 'PDF' ? (
                                    <FileText className="w-16 h-16 text-red-500" />
                                ) : (
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL}${doc.url}`}
                                        alt={doc.descricao}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                                {doc.tipo !== 'PDF' && (
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                                        <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                )}
                            </div>
                            <div className="p-3">
                                <p className="text-xs text-gray-600 truncate mb-2">{doc.descricao || doc.tipo}</p>
                                <div className="grid grid-cols-3 gap-1">
                                    <button
                                        onClick={() => {
                                            if (doc.tipo === 'PDF') {
                                                window.open(`${process.env.NEXT_PUBLIC_API_URL}${doc.url}`, '_blank');
                                            } else {
                                                setFullImageUrl(`${process.env.NEXT_PUBLIC_API_URL}${doc.url}`);
                                            }
                                        }}
                                        className="flex items-center justify-center gap-1 px-2 py-1 bg-green-50 text-green-600 text-xs rounded hover:bg-green-100"
                                        title="Visualizar"
                                    >
                                        <Eye className="w-3 h-3" />
                                    </button>
                                    <a
                                        href={`${process.env.NEXT_PUBLIC_API_URL}${doc.url}`}
                                        download
                                        className="flex items-center justify-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded hover:bg-blue-100"
                                        title="Baixar"
                                    >
                                        <Download className="w-3 h-3" />
                                    </a>
                                    <button
                                        onClick={() => handleDelete(doc.id)}
                                        className="flex items-center justify-center gap-1 px-2 py-1 bg-red-50 text-red-600 text-xs rounded hover:bg-red-100"
                                        title="Excluir"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Upload */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Upload de Documento</h3>
                            <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Preview */}
                            {previewUrl ? (
                                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                                    <FileText className="w-16 h-16 text-gray-400" />
                                </div>
                            )}

                            {/* Tipo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de Documento
                                </label>
                                <select
                                    value={documentType}
                                    onChange={(e) => setDocumentType(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="FOTO">Foto</option>
                                    <option value="RAIO_X">Raio-X</option>
                                    <option value="PDF">PDF</option>
                                </select>
                            </div>

                            {/* Descrição */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Descrição
                                </label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Descreva o documento..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Progress Bar */}
                            {uploading && (
                                <div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                    <p className="text-sm text-gray-600 text-center mt-2">
                                        {uploadProgress}% enviado
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
                            <button
                                onClick={() => setShowUploadModal(false)}
                                disabled={uploading}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={uploading || !selectedFile}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {uploading ? 'Enviando...' : 'Upload'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Visualização Full Size */}
            {fullImageUrl && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
                    onClick={() => setFullImageUrl(null)}
                >
                    <button
                        onClick={() => setFullImageUrl(null)}
                        className="absolute top-4 right-4 text-white hover:text-gray-300"
                    >
                        <X className="w-8 h-8" />
                    </button>
                    <img
                        src={fullImageUrl}
                        alt="Visualização completa"
                        className="max-w-full max-h-full object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}
