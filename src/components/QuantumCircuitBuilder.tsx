import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Play, RotateCcw } from "lucide-react";

interface QuantumGate {
  name: string;
  symbol: string;
  description: string;
  category: string;
  qubit: number;
  step: number;
}

interface QuantumCircuitBuilderProps {
  numQubits: number;
  gates: QuantumGate[];
  onGateRemove: (gateId: string) => void;
  onCircuitRun: () => void;
  onCircuitClear: () => void;
  className?: string;
}

export function QuantumCircuitBuilder({ 
  numQubits, 
  gates, 
  onGateRemove, 
  onCircuitRun, 
  onCircuitClear, 
  className 
}: QuantumCircuitBuilderProps) {
  const [hoveredCell, setHoveredCell] = useState<{ qubit: number; step: number } | null>(null);
  
  const maxSteps = Math.max(8, Math.max(...gates.map(g => g.step), 0) + 2);
  
  const getGateAtPosition = (qubit: number, step: number) => {
    return gates.find(g => g.qubit === qubit && g.step === step);
  };

  return (
    <Card className={`bg-card/95 backdrop-blur-sm border-border ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Quantum Circuit
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCircuitClear}
              className="text-destructive hover:text-destructive-foreground hover:bg-destructive/20"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Clear
            </Button>
            <Button
              size="sm"
              onClick={onCircuitRun}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              <Play className="w-4 h-4 mr-1" />
              Run Circuit
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Build your quantum circuit by selecting gates from the toolbox
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Circuit Grid */}
          <div className="relative">
            {/* Time step labels */}
            <div className="flex pl-16 mb-2">
              {Array.from({ length: maxSteps }, (_, i) => (
                <div key={i} className="w-16 text-center text-xs text-muted-foreground">
                  {i}
                </div>
              ))}
            </div>
            
            {/* Circuit rows */}
            <div className="space-y-2">
              {Array.from({ length: numQubits }, (_, qubitIndex) => (
                <div key={qubitIndex} className="flex items-center">
                  {/* Qubit label */}
                  <div className="w-14 text-sm font-medium text-foreground">
                    |q{qubitIndex}⟩
                  </div>
                  
                  {/* Quantum wire */}
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-1/2 w-full h-0.5 bg-muted-foreground/30"></div>
                    
                    {/* Gate positions */}
                    <div className="flex relative z-10">
                      {Array.from({ length: maxSteps }, (_, stepIndex) => {
                        const gate = getGateAtPosition(qubitIndex, stepIndex);
                        const isHovered = hoveredCell?.qubit === qubitIndex && hoveredCell?.step === stepIndex;
                        
                        return (
                          <div
                            key={stepIndex}
                            className={`w-16 h-10 flex items-center justify-center cursor-pointer transition-all duration-200 ${
                              isHovered ? 'bg-muted/50 rounded' : ''
                            }`}
                            onMouseEnter={() => setHoveredCell({ qubit: qubitIndex, step: stepIndex })}
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                            {gate ? (
                              <Badge
                                variant="default"
                                className="bg-primary text-primary-foreground hover:bg-primary/80 cursor-pointer group relative"
                                onClick={() => onGateRemove(`${gate.qubit}-${gate.step}`)}
                              >
                                {gate.symbol}
                                <Trash2 className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </Badge>
                            ) : (
                              <div className="w-8 h-8 border border-dashed border-muted-foreground/20 rounded bg-transparent"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Circuit Statistics */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              {gates.length} gates • {numQubits} qubits • Depth: {Math.max(...gates.map(g => g.step), 0) + 1}
            </div>
            <div className="text-xs text-muted-foreground">
              Click gates to remove • Drag from toolbox to add
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}