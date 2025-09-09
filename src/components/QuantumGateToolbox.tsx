import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

interface QuantumGate {
  name: string;
  symbol: string;
  description: string;
  category: 'half-turn' | 'quarter-turn' | 'eighth-turn' | 'custom' | 'rotation';
  angle?: number;
}

const quantumGates: QuantumGate[] = [
  // Half-turn Gates
  { name: 'Pauli-X', symbol: 'Pₓ', description: 'Bit flip gate', category: 'half-turn' },
  { name: 'Pauli-Y', symbol: 'Pᵧ', description: 'Bit and phase flip', category: 'half-turn' },
  { name: 'Pauli-Z', symbol: 'Pᵨ', description: 'Phase flip gate', category: 'half-turn' },
  { name: 'Hadamard', symbol: 'H', description: 'Superposition gate', category: 'half-turn' },
  
  // Quarter-turn Gates
  { name: 'X^1/2', symbol: 'Pₓ^1/2', description: 'Square root of X', category: 'quarter-turn' },
  { name: 'Y^1/2', symbol: 'Pᵧ^1/2', description: 'Square root of Y', category: 'quarter-turn' },
  { name: 'Z^1/2', symbol: 'Pᵨ^1/2', description: 'Square root of Z', category: 'quarter-turn' },
  { name: 'X^-1/2', symbol: 'Pₓ^-1/2', description: 'Inverse sqrt X', category: 'quarter-turn' },
  { name: 'Y^-1/2', symbol: 'Pᵧ^-1/2', description: 'Inverse sqrt Y', category: 'quarter-turn' },
  { name: 'Z^-1/2', symbol: 'Pᵨ^-1/2', description: 'Inverse sqrt Z', category: 'quarter-turn' },
  { name: 'S', symbol: 'S', description: 'Phase gate', category: 'quarter-turn' },
  { name: 'S†', symbol: 'S⁻¹', description: 'Inverse phase', category: 'quarter-turn' },
  
  // Eighth-turn Gates
  { name: 'X^1/4', symbol: 'Pₓ^1/4', description: 'Fourth root of X', category: 'eighth-turn' },
  { name: 'Y^1/4', symbol: 'Pᵧ^1/4', description: 'Fourth root of Y', category: 'eighth-turn' },
  { name: 'Z^1/4', symbol: 'Pᵨ^1/4', description: 'Fourth root of Z', category: 'eighth-turn' },
  { name: 'X^-1/4', symbol: 'Pₓ^-1/4', description: 'Inverse fourth root X', category: 'eighth-turn' },
  { name: 'Y^-1/4', symbol: 'Pᵧ^-1/4', description: 'Inverse fourth root Y', category: 'eighth-turn' },
  { name: 'Z^-1/4', symbol: 'Pᵨ^-1/4', description: 'Inverse fourth root Z', category: 'eighth-turn' },
];

interface QuantumGateToolboxProps {
  onGateSelect: (gate: QuantumGate) => void;
  selectedQubit: number;
  className?: string;
}

export function QuantumGateToolbox({ onGateSelect, selectedQubit, className }: QuantumGateToolboxProps) {
  const gatesByCategory = quantumGates.reduce((acc, gate) => {
    if (!acc[gate.category]) acc[gate.category] = [];
    acc[gate.category].push(gate);
    return acc;
  }, {} as Record<string, QuantumGate[]>);

  const categoryTitles = {
    'half-turn': 'Half-turn Gates',
    'quarter-turn': 'Quarter-turn Gates',
    'eighth-turn': 'Eighth-turn Gates',
    'custom': 'Custom Gates',
    'rotation': 'Lambda Gates'
  };

  return (
    <Card className={`bg-card/95 backdrop-blur-sm border-border ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Toolbox
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            Target: Qubit {selectedQubit}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {Object.entries(categoryTitles).map(([category, title]) => (
          <div key={category} className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground border-b border-border pb-1">
              {title}
            </h3>
            
            <div className="grid grid-cols-3 gap-2">
              {gatesByCategory[category]?.map((gate) => (
                <Button
                  key={gate.name}
                  variant="outline"
                  size="sm"
                  className="h-12 w-full bg-primary/5 hover:bg-primary/20 border-primary/20 hover:border-primary/40 transition-all duration-200 group"
                  onClick={() => onGateSelect(gate)}
                >
                  <div className="text-center">
                    <div className="text-sm font-bold text-primary group-hover:text-primary-foreground transition-colors">
                      {gate.symbol}
                    </div>
                  </div>
                </Button>
              ))}
              
              {/* Custom gates add button */}
              {category === 'custom' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-12 w-full bg-accent/5 hover:bg-accent/20 border-accent/20 hover:border-accent/40 transition-all duration-200"
                  onClick={() => onGateSelect({ name: 'Custom', symbol: '+', description: 'Custom gate', category: 'custom' })}
                >
                  <Plus className="w-4 h-4 text-accent" />
                </Button>
              )}
            </div>
          </div>
        ))}
        
        {/* Lambda Gates Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground border-b border-border pb-1">
            Lambda Gates
          </h3>
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Polar angle: 0°</div>
            <div className="w-full h-2 bg-muted rounded-full">
              <div className="w-0 h-full bg-primary rounded-full"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}