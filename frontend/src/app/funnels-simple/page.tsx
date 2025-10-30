'use client';

import { useState, useEffect } from 'react';

export default function FunnelsSimple() {
  const [showModal, setShowModal] = useState(false);
  const [funnelName, setFunnelName] = useState('');
  const [funnels, setFunnels] = useState([]);

  const createFunnel = () => {
    if (funnelName.trim()) {
      const newFunnel = {
        id: Date.now(),
        name: funnelName,
        steps: []
      };
      setFunnels([...funnels, newFunnel]);
      setFunnelName('');
      setShowModal(false);
      console.log('Funil criado:', newFunnel);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Funis de Vendas (Simples)</h1>
        <button
          onClick={() => {
            console.log('Abrindo modal');
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
        >
          + Novo Funil
        </button>
      </div>

      <div className="mb-4 p-4 bg-gray-800 rounded-lg">
        <div>Modal: {showModal ? 'ABERTO' : 'FECHADO'}</div>
        <div>Funis: {funnels.length}</div>
      </div>

      <div className="grid gap-4">
        {funnels.map((funnel) => (
          <div key={funnel.id} className="bg-gray-800 p-4 rounded-lg">
            <h3 className="font-bold">{funnel.name}</h3>
            <p className="text-gray-400">{funnel.steps.length} etapas</p>
          </div>
        ))}
      </div>

      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[999999]"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 w-96"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Criar Novo Funil</h3>
            <input
              type="text"
              placeholder="Nome do funil"
              value={funnelName}
              onChange={(e) => setFunnelName(e.target.value)}
              className="w-full p-3 border rounded-lg text-gray-900"
              autoFocus
            />
            <div className="flex space-x-3 mt-4">
              <button
                onClick={createFunnel}
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-white"
                disabled={!funnelName.trim()}
              >
                Criar
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setFunnelName('');
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded-lg text-white"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}