import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

interface QuantumGate {
  name: string;
  symbol: string;
  description: string;
  category: string;
  qubit: number;
  step: number;
}

interface ValidationResult {
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  details?: string;
}

interface QuantumValidationProps {
  gates: QuantumGate[];
  numQubits: number;
  className?: string;
}

export function QuantumValidation({ gates, numQubits, className }: QuantumValidationProps) {
  const validateCircuit = (): ValidationResult[] => {
    const validations: ValidationResult[] = [];
    
    // Check circuit complexity
    if (gates.length === 0) {
      validations.push({
        type: 'info',
        message: 'Empty circuit',
        details: 'Add gates from the toolbox to build your quantum circuit'
      });
    }
    
    if (gates.length > 20) {
      validations.push({
        type: 'error',
        message: 'Circuit too complex',
        details: 'Maximum 20 gates supported for optimal performance'
      });
    }
    
    if (gates.length > 15) {
      validations.push({
        type: 'warning',
        message: 'Large circuit detected',
        details: 'Circuit execution may take longer than usual'
      });
    }
    
    // Check circuit depth
    const maxDepth = Math.max(...gates.map(g => g.step), 0) + 1;
    if (maxDepth > 10) {
      validations.push({
        type: 'warning',
        message: 'Deep circuit',
        details: `Circuit depth is ${maxDepth}. Consider gate optimization for better performance`
      });
    }
    
    // Check for unsupported gates
    const unsupportedGates = gates.filter(gate => 
      !['Pₓ', 'Pᵧ', 'Pᵨ', 'H', 'S'].includes(gate.symbol)
    );
    
    if (unsupportedGates.length > 0) {
      validations.push({
        type: 'warning',
        message: 'Unsupported gates detected',
        details: `${unsupportedGates.length} gates may not execute properly: ${unsupportedGates.map(g => g.symbol).join(', ')}`
      });
    }
    
    // Check qubit usage
    const usedQubits = new Set(gates.map(g => g.qubit));
    if (usedQubits.size === 1 && numQubits > 1) {
      validations.push({
        type: 'info',
        message: 'Single qubit circuit',
        details: 'Only one qubit is being used. Consider exploring multi-qubit operations'
      });
    }
    
    // Check for potential quantum advantages
    const hasHadamard = gates.some(g => g.symbol === 'H');
    const hasPauliGates = gates.some(g => ['Pₓ', 'Pᵧ', 'Pᵨ'].includes(g.symbol));
    
    if (hasHadamard && hasPauliGates) {
      validations.push({
        type: 'success',
        message: 'Good quantum circuit',
        details: 'Circuit contains superposition and rotation gates - excellent for learning!'
      });
    }
    
    // Check computational complexity
    const hilbertSpaceDim = Math.pow(2, numQubits);
    if (hilbertSpaceDim > 32) {
      validations.push({
        type: 'warning',
        message: 'Large Hilbert space',
        details: `${hilbertSpaceDim}D space may cause performance issues on some devices`
      });
    }
    
    return validations;
  };
  
  const validations = validateCircuit();
  
  if (validations.length === 0) {
    return null;
  }
  
  const getIcon = (type: ValidationResult['type']) => {
    switch (type) {
      case 'error': return <XCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'info': return <Info className="w-4 h-4" />;
    }
  };
  
  const getVariant = (type: ValidationResult['type']) => {
    switch (type) {
      case 'error': return 'destructive';
      case 'warning': return 'default';
      case 'success': return 'default';
      case 'info': return 'default';
    }
  };
  
  return (
    <div className={`space-y-3 ${className}`}>
      {validations.map((validation, index) => (
        <Alert key={index} variant={getVariant(validation.type)} className="border-l-4 border-l-current">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              {getIcon(validation.type)}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{validation.message}</span>
                <Badge 
                  variant={validation.type === 'error' ? 'destructive' : 'secondary'} 
                  className="text-xs"
                >
                  {validation.type.toUpperCase()}
                </Badge>
              </div>
              {validation.details && (
                <AlertDescription className="text-xs text-muted-foreground">
                  {validation.details}
                </AlertDescription>
              )}
            </div>
          </div>
        </Alert>
      ))}
    </div>
  );
}