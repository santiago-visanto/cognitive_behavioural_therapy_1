'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import InitialAssessment from '@/components/InitialAssessment';
import ReactMarkdown from 'react-markdown';

type ErrorState = null | string;

type VariantProps = {
  default?: string;
  destructive?: string;
  warning?: string;
};

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type DebugInfoType = {
  status?: number;
  statusText?: string;
  headers: Record<string, string>;
  body: string;
};

const CBTApp = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialAssessmentComplete, setIsInitialAssessmentComplete] = useState(false);
  const [error, setError] = useState<ErrorState>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfoType | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (userInput.trim() === '' || isLoading) return;
    const newMessages: Message[] = [...messages, { role: 'user', content: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/cbt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) throw new Error('Error en la respuesta del servidor');

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: initialMessage }] }),
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        if (!response.ok) throw new Error(`Error del servidor: ${data.message || response.statusText}`);
        setMessages([
          { role: 'user', content: 'He completado la evaluación inicial.' },
          { role: 'assistant', content: data.response }
        ]);
      } else {
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
      console.error('Error detallado:', error);
      setError(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      setMessages([{ role: 'assistant', content: 'Lo siento, hubo un error al procesar la evaluación inicial. Por favor, inténtalo de nuevo más tarde.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialAssessmentComplete) {
    return <InitialAssessment onComplete={handleInitialAssessmentComplete} />;
  }
 
  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Terapia Cognitivo-Conductual Asistida por IA</CardTitle>
          <CardDescription>Un espacio seguro para explorar tus pensamientos y emociones</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="default" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {debugInfo && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Debug Info</AlertTitle>
              <AlertDescription>
                <pre className="text-xs mt-2 overflow-auto max-h-40">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </AlertDescription>
            {/* Content */}
            </Alert>
          )}
          <ScrollArea className="h-[50vh]">
            <div className="space-y-4 p-4">
              {messages.map((message, index) => (
                <div key={index} className={`p-3 rounded-lg ${message.role === 'user' ? 'bg-primary/10 ml-8' : 'bg-secondary/10 mr-8'}`}>
                  <ReactMarkdown className="prose max-w-none">{message.content}</ReactMarkdown>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 bg-secondary/5 p-4">
          <Textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Escribe tu mensaje aquí..."
            className="w-full resize-none border-secondary focus:border-primary focus:ring focus:ring-primary/20"
            rows={3}
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CBTApp;

