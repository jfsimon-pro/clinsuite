'use client';

import { useState } from 'react';

export default function TestModal() {
  const [showModal, setShowModal] = useState(false);
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Teste de Modal</h1>
      
      <button
        onClick={() => {
          console.log('Clicou no botão');
          setShowModal(true);
        }}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
      >
        Abrir Modal
      </button>

      <div className="mt-4 p-4 bg-gray-800 rounded-lg">
        <div>Modal está: {showModal ? 'ABERTO' : 'FECHADO'}</div>
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
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Modal de Teste</h3>
            <input
              type="text"
              placeholder="Digite algo"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full p-3 border rounded-lg text-gray-900"
            />
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => {
                  console.log('Valor:', inputValue);
                  alert(`Valor: ${inputValue}`);
                  setShowModal(false);
                  setInputValue('');
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-white"
              >
                OK
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setInputValue('');
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