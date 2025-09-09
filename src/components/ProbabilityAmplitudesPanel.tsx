import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { QuantumState } from "@/lib/quantum";
import { Complex } from "@/lib/complex";

interface ProbabilityAmplitudesPanelProps {
  quantumState: QuantumState;
  className?: string;
}

export function ProbabilityAmplitudesPanel({ quantumState, className }: ProbabilityAmplitudesPanelProps) {
  const amplitudes = quantumState.getAmplitudes();
  const numQubits = quantumState.getNumQubits();
  
  // Calculate probability for each basis state
  const probabilities = amplitudes.map(amp => amp.magnitude() ** 2);
  const maxProbability = Math.max(...probabilities);
  
  // Generate basis state labels
  const generateBasisStateLabel = (index: number) => {
    return '|' + index.toString(2).padStart(numQubits, '0') + '⟩';
  };
  
  // Calculate single-qubit marginal probabilities
  const singleQubitProbabilities = Array.from({ length: numQubits }, (_, qubitIndex) => {
    let prob0 = 0;
    let prob1 = 0;
    
    for (let i = 0; i < amplitudes.length; i++) {
      const qubitBit = (i >> (numQubits - 1 - qubitIndex)) & 1;
      const probability = probabilities[i];
      
      if (qubitBit === 0) {
        prob0 += probability;
      } else {
        prob1 += probability;
      }
    }
    
    return { prob0, prob1 };
  });
  
  const formatComplex = (c: Complex) => {
    if (Math.abs(c.real) < 1e-10 && Math.abs(c.imaginary) < 1e-10) return "0";
    if (Math.abs(c.imaginary) < 1e-10) return c.real.toFixed(4);
    if (Math.abs(c.real) < 1e-10) return `${c.imaginary.toFixed(4)}i`;
    
    const sign = c.imaginary >= 0 ? '+' : '-';
    return `${c.real.toFixed(4)} ${sign} ${Math.abs(c.imaginary).toFixed(4)}i`;
  };
  
  return (
    <Card className={`bg-card/95 backdrop-blur-sm border-border ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Probability Amplitudes
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Single Qubit Marginal Probabilities */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground border-b border-border pb-1">
            Single Qubit Marginal Probabilities
          </h3>
          <div className="space-y-3">
            {singleQubitProbabilities.map(({ prob0, prob1 }, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    Qubit {index}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>|0⟩</span>
                    <span className="font-mono">{(prob0 * 100).toFixed(2)}%</span>
                  </div>
                  <Progress value={prob0 * 100} className="h-2" />
                  
                  <div className="flex items-center justify-between text-xs">
                    <span>|1⟩</span>
                    <span className="font-mono">{(prob1 * 100).toFixed(2)}%</span>
                  </div>
                  <Progress value={prob1 * 100} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Full State Vector */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground border-b border-border pb-1">
            Full State Vector ({Math.pow(2, numQubits)}D Hilbert Space)
          </h3>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {amplitudes.map((amplitude, index) => {
              const probability = probabilities[index];
              const isSignificant = probability > 1e-6;
              
              if (!isSignificant) return null;
              
              return (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/20 rounded border border-border/30">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-mono">
                      {generateBasisStateLabel(index)}
                    </Badge>
                    <span className="text-xs font-mono text-muted-foreground">
                      {formatComplex(amplitude)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono">
                      {(probability * 100).toFixed(3)}%
                    </span>
                    <div className="w-16">
                      <Progress 
                        value={(probability / maxProbability) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* State Information */}
        <div className="space-y-2 pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            Total probability: {probabilities.reduce((sum, p) => sum + p, 0).toFixed(6)}
          </div>
          <div className="text-xs text-muted-foreground">
            Non-zero amplitudes: {probabilities.filter(p => p > 1e-10).length} / {amplitudes.length}
          </div>
          <div className="text-xs text-muted-foreground">
            Entanglement: {singleQubitProbabilities.some(({ prob0, prob1 }) => 
              Math.abs(prob0 - 0.5) < 0.01 && Math.abs(prob1 - 0.5) < 0.01
            ) ? "Likely entangled" : "Separable or classical"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}