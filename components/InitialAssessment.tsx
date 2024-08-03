import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const InitialAssessment = ({ onComplete }: { onComplete: any }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    problems: '',
    symptoms: '',
    thoughts: '',
    emotions: '',
    behaviors: '',
    triggers: '',
    background: ''
  });

  type Question = {
    key: keyof typeof answers;
    question: string;
  };

  type Answers = {
    [key: string]: string;
  };

  const questions: Question[] = [
    { key: 'problems', question: '¿Cuáles son los problemas o dificultades específicas que estás enfrentando actualmente?' },
    { key: 'symptoms', question: '¿Qué síntomas físicos o emocionales has experimentado relacionados con estos problemas?' },
    { key: 'thoughts', question: '¿Qué pensamientos automáticos o creencias negativas tienes sobre estas situaciones?' },
    { key: 'emotions', question: '¿Qué emociones experimentas cuando te enfrentas a estos problemas?' },
    { key: 'behaviors', question: '¿Cómo reaccionas o qué haces típicamente cuando experimentas estos pensamientos y emociones?' },
    { key: 'triggers', question: '¿Puedes identificar situaciones o eventos que desencadenan estos pensamientos y emociones?' },
    { key: 'background', question: '¿Puedes proporcionar alguna información de fondo relevante sobre tu historia personal o relaciones?' }
  ];

  const handleInputChange = (e: { target: { value: any; }; }) => {
    setAnswers({ ...answers, [questions[step].key]: e.target.value });
  };

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(answers);
    }
  };

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold">Evaluación Inicial</h2>
        <p className="text-sm text-gray-500">Paso {step + 1} de {questions.length}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Label htmlFor="answer">{questions[step].question}</Label>
          <Textarea
            id="answer"
            value={answers[questions[step].key as keyof Answers]}
            onChange={handleInputChange}
            placeholder="Escribe tu respuesta aquí..."
            className="w-full"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={handlePrevious} disabled={step === 0}>Anterior</Button>
        <Button onClick={handleNext}>
          {step === questions.length - 1 ? 'Finalizar' : 'Siguiente'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InitialAssessment;
