import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Copy } from "lucide-react";
import { Complex } from "@/lib/complex";

interface QuantumStatePanelProps {
  densityMatrices: Complex[][][];
  blochVectors: Array<{ x: number; y: number; z: number }>;
  numQubits: number;
  onExport: (format: 'json' | 'png') => void;
  className?: string;
}

export function QuantumStatePanel({ 
  densityMatrices, 
  blochVectors, 
  numQubits, 
  onExport, 
  className 
}: QuantumStatePanelProps) {
  const formatComplex = (c: Complex) => {
    if (Math.abs(c.real) < 1e-10 && Math.abs(c.imaginary) < 1e-10) return "0";
    if (Math.abs(c.imaginary) < 1e-10) return c.real.toFixed(3);
    if (Math.abs(c.real) < 1e-10) return `${c.imaginary.toFixed(3)}i`;
    
    const sign = c.imaginary >= 0 ? '+' : '-';
    return `${c.real.toFixed(3)} ${sign} ${Math.abs(c.imaginary).toFixed(3)}i`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card className={`bg-card/95 backdrop-blur-sm border-border ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Quantum State Analysis
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('json')}
              className="text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('png')}
              className="text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              PNG
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Bloch Vector Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground border-b border-border pb-1">
            Bloch Vectors
          </h3>
          <div className="grid gap-3">
            {blochVectors.map((vector, index) => {
              const magnitude = Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);
              const isPure = magnitude > 0.95;
              
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded border border-border/50">
                  <div className="flex items-center gap-2">
                    <Badge variant={isPure ? "default" : "secondary"} className="text-xs">
                      Q{index}
                    </Badge>
                    <span className="text-xs font-mono">
                      ({vector.x.toFixed(3)}, {vector.y.toFixed(3)}, {vector.z.toFixed(3)})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      |r| = {magnitude.toFixed(3)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(`(${vector.x.toFixed(3)}, ${vector.y.toFixed(3)}, ${vector.z.toFixed(3)})`)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Density Matrix Details */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground border-b border-border pb-1">
            Reduced Density Matrices
          </h3>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {densityMatrices.map((matrix, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    ρ_{index}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Qubit {index} Density Matrix
                  </span>
                </div>
                <div className="bg-muted/20 p-3 rounded border border-border/30 font-mono text-xs">
                  <div className="grid grid-cols-1 gap-1">
                    {matrix.map((row, i) => (
                      <div key={i} className="flex gap-4">
                        {row.map((element, j) => (
                          <span key={j} className="min-w-[120px]">
                            {formatComplex(element)}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* State Information */}
        <div className="space-y-2 pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            System: {numQubits} qubits • Hilbert space: {Math.pow(2, numQubits)}D
          </div>
          <div className="text-xs text-muted-foreground">
            Pure states: |r| ≈ 1 • Mixed states: |r| &lt; 1
          </div>
        </div>
      </CardContent>
    </Card>
  );
}