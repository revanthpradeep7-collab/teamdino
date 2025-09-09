import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Square } from "lucide-react";

interface QuantumGate {
  name: string;
  symbol: string;
  description: string;
  category: string;
  qubit: number;
  step: number;
}

interface StepExecutionControlsProps {
  gates: QuantumGate[];
  isPlaying: boolean;
  currentStep: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onStepTo: (step: number) => void;
  onStepForward: () => void;
  onStepBack: () => void;
  onReset: () => void;
  className?: string;
}

export function StepExecutionControls({
  gates,
  isPlaying,
  currentStep,
  onPlay,
  onPause,
  onStop,
  onStepTo,
  onStepForward,
  onStepBack,
  onReset,
  className
}: StepExecutionControlsProps) {
  const maxSteps = Math.max(...gates.map(g => g.step), 0) + 1;
  const currentGate = gates.find(g => g.step === currentStep);
  
  return (
    <Card className={`bg-card/95 backdrop-blur-sm border-border ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Step-by-Step Execution
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Transport Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            disabled={currentStep === 0}
            className="w-10 h-10 p-0"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onStepBack}
            disabled={currentStep === 0}
            className="w-10 h-10 p-0"
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            onClick={isPlaying ? onPause : onPlay}
            disabled={currentStep >= maxSteps}
            className="w-12 h-10 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onStepForward}
            disabled={currentStep >= maxSteps}
            className="w-10 h-10 p-0"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onStop}
            disabled={!isPlaying && currentStep === 0}
            className="w-10 h-10 p-0"
          >
            <Square className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Step Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Step: {currentStep}</span>
            <span className="text-muted-foreground">Total: {maxSteps}</span>
          </div>
          
          <Slider
            value={[currentStep]}
            onValueChange={([value]) => onStepTo(value)}
            max={maxSteps}
            min={0}
            step={1}
            className="w-full"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Start</span>
            {maxSteps > 0 && <span>End</span>}
          </div>
        </div>
        
        {/* Current Gate Info */}
        {currentGate && (
          <div className="p-3 bg-muted/30 rounded border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default" className="text-xs">
                Step {currentStep}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Qubit {currentGate.qubit}
              </Badge>
            </div>
            <div className="text-sm font-medium mb-1">
              {currentGate.symbol} - {currentGate.name}
            </div>
            <div className="text-xs text-muted-foreground">
              {currentGate.description}
            </div>
          </div>
        )}
        
        {/* Progress Info */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
          {currentStep === 0 && "Initial state: All qubits in |0⟩"}
          {currentStep > 0 && currentStep < maxSteps && `Applied ${currentStep} of ${maxSteps} gates`}
          {currentStep >= maxSteps && maxSteps > 0 && "Circuit execution complete"}
          {maxSteps === 0 && "No gates in circuit"}
        </div>
      </CardContent>
    </Card>
  );
}