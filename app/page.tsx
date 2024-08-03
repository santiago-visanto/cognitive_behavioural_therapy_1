'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import InitialAssessment from '@/components/InitialAssessment';
type ErrorState = null | string;

type Message = {
  role: 'user' | 'assistant'; // Assuming roles are either 'user' or 'assistant'
  content: string;
};

type DebugInfoType = {
  status?: number; // Optional because it might not always be available
  statusText?: string; // Optional for the same reason
  headers: Record<string, string>; // Assuming headers are key-value pairs of strings
  body: string; // The body content
};

const CBTApp = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialAssessmentComplete, setIsInitialAssessmentComplete] = useState(false);
  const [error, setError] = useState<ErrorState>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfoType | null>(null);


  const handleSendMessage = async () => {
    if (userInput.trim() === '' || isLoading) return;
    const newMessages: Message[] = [...messages, { role: 'user', content: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/cbt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const data = await response.json();
      setMessages([...newMessages, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: 'Lo siento, hubo un error al procesar tu mensaje.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitialAssessmentComplete = async (answers: { problems: any; symptoms: any; thoughts: any; emotions: any; behaviors: any; triggers: any; background: any; }) => {
    setIsInitialAssessmentComplete(true);
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);

    const initialMessage = `
      Problemas: ${answers.problems}
      Síntomas: ${answers.symptoms}
      Pensamientos: ${answers.thoughts}
      Emociones: ${answers.emotions}
      Comportamientos: ${answers.behaviors}
      Desencadenantes: ${answers.triggers}
      Antecedentes: ${answers.background}
    `;

    try {
      const response = await fetch('/api/cbt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [{ role: 'user', content: initialMessage }] }),
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(`Error del servidor: ${data.message || response.statusText}`);
        }
        setMessages([
          { role: 'user', content: 'He completado la evaluación inicial.' },
          { role: 'assistant', content: data.response }
        ]);
      } else {
        // La respuesta no es JSON, probablemente es HTML
        const text = await response.text();
        console.error('Respuesta no JSON recibida:', text);
        setDebugInfo({
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: text.substring(0, 500)
        });
        throw new Error('Recibida respuesta inesperada del servidor');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error detallado:', error);
        setError(`Error: ${error.message}`);
        setMessages([{ role: 'assistant', content: 'Lo siento, hubo un error al procesar la evaluación inicial. Por favor, inténtalo de nuevo más tarde.' }]);
      } else {
        console.error('Error desconocido:', error);
        setError('Ocurrió un error desconocido.');
        setMessages([{ role: 'assistant', content: 'Lo siento, hubo un error al procesar la evaluación inicial. Por favor, inténtalo de nuevo más tarde.' }]);
      }
    } finally {
      setIsLoading(false);
    }
  };


  if (!isInitialAssessmentComplete) {
    return <InitialAssessment onComplete={handleInitialAssessmentComplete} />;
  }


    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <h2 className="text-2xl font-bold">Terapia Cognitivo-Conductual Asistida por IA</h2>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {debugInfo && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4">
              <strong className="font-bold">Debug Info: </strong>
              <pre className="text-xs mt-2 overflow-auto max-h-40">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-100 text-right' : 'bg-gray-100'}`}>
                {message.content}
              </div>
            ))}
          </div>
        </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Escribe tu mensaje aquí..."
          className="w-full"
          disabled={isLoading}
        />
        <Button onClick={handleSendMessage} className="w-full" disabled={isLoading}>
          {isLoading ? 'Enviando...' : 'Enviar'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CBTApp;