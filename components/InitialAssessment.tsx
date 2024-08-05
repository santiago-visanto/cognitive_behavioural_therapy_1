import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

type Question = {
  key: keyof Answers;
  question: string;
};

type Answers = {
  problems: string;
  symptoms: string;
  thoughts: string;
  emotions: string;
  behaviors: string;
  triggers: string;
  background: string;
};

const InitialAssessment = ({ onComplete }: { onComplete: (answers: Answers) => void }) => {
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

  const questions: Question[] = [
    { key: 'problems', question: '¿Cuáles son los problemas o dificultades específicas que estás enfrentando actualmente?' },
    { key: 'symptoms', question: '¿Qué síntomas físicos o emocionales has experimentado relacionados con estos problemas?' },
    { key: 'thoughts', question: '¿Qué pensamientos automáticos o creencias negativas tienes sobre estas situaciones?' },
    { key: 'emotions', question: '¿Qué emociones experimentas cuando te enfrentas a estos problemas?' },
    { key: 'behaviors', question: '¿Cómo reaccionas o qué haces típicamente cuando experimentas estos pensamientos y emociones?' },
    { key: 'triggers', question: '¿Puedes identificar situaciones o eventos que desencadenan estos pensamientos y emociones?' },
    { key: 'background', question: '¿Puedes proporcionar alguna información de fondo relevante sobre tu historia personal o relaciones?' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader className="space-y-4">
          <CardTitle className="text-3xl font-bold text-primary">Terapia Cognitivo-Conductual Asistida por IA</CardTitle>
          <CardDescription className="text-lg">Por favor responde las siguientes preguntas:<span style={{ display: 'block', marginBottom: '10px' }}>Pregunta {step + 1} de {questions.length}</span></CardDescription>
          <Progress value={(step + 1) / questions.length * 100} className="w-full h-2" />
        </CardHeader>
        <CardContent className="space-y-6 px-6 py-8">
          <Label htmlFor="answer" className="text-xl font-medium text-secondary-foreground">
            {questions[step].question}
          </Label>
          <Textarea
            id="answer"
            value={answers[questions[step].key]}
            onChange={handleInputChange}
            placeholder="Escribe tu respuesta aquí..."
            className="w-full min-h-[200px] text-lg p-4 resize-none border-2 focus:ring-2 focus:ring-primary"
          />
        </CardContent>
        <CardFooter className="flex justify-between px-6 py-6 bg-secondary/5">
          <Button 
            onClick={handlePrevious} 
            variant="outline" 
            disabled={step === 0}
            className="px-6 py-2 text-lg"
          >
            Anterior
          </Button>
          <Button 
            onClick={handleNext}
            className="px-6 py-2 text-lg bg-primary hover:bg-primary/90"
          >
            {step === questions.length - 1 ? 'Finalizar' : 'Siguiente'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default InitialAssessment;
