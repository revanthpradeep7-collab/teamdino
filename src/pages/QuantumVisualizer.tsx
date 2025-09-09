import { useState, useCallback, useEffect } from 'react';
import { BlochSphere } from '@/components/BlochSphere';
import { QuantumGateToolbox } from '@/components/QuantumGateToolbox';
import { QuantumCircuitBuilder } from '@/components/QuantumCircuitBuilder';
import { QuantumStatePanel } from '@/components/QuantumStatePanel';
import { StepExecutionControls } from '@/components/StepExecutionControls';
import { ProbabilityAmplitudesPanel } from '@/components/ProbabilityAmplitudesPanel';
import { QuantumValidation } from '@/components/QuantumValidation';
import { QuantumState, QuantumGates } from '@/lib/quantum';
import { Complex } from '@/lib/complex';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Info } from 'lucide-react';
import { toast } from 'sonner';

interface QuantumGate {
  name: string;
  symbol: string;
  description: string;
  category: string;
  qubit: number;
  step: number;
}

export default function QuantumVisualizer() {
  const [numQubits, setNumQubits] = useState(3);
  const [selectedQubit, setSelectedQubit] = useState(0);
  const [gates, setGates] = useState<QuantumGate[]>([]);
  const [quantumState, setQuantumState] = useState<QuantumState>(new QuantumState(3));
  const [blochVectors, setBlochVectors] = useState<Array<{ x: number; y: number; z: number }>>([
    { x: 0, y: 0, z: 1 },
    { x: 0, y: 0, z: 1 },
    { x: 0, y: 0, z: 1 }
  ]);
  const [densityMatrices, setDensityMatrices] = useState<Complex[][][]>([]);
  
  // Step execution state
  const [isStepMode, setIsStepMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [steppedQuantumState, setSteppedQuantumState] = useState<QuantumState>(new QuantumState(3));
  const [steppedBlochVectors, setSteppedBlochVectors] = useState<Array<{ x: number; y: number; z: number }>>([
    { x: 0, y: 0, z: 1 },
    { x: 0, y: 0, z: 1 },
    { x: 0, y: 0, z: 1 }
  ]);
  const [steppedDensityMatrices, setSteppedDensityMatrices] = useState<Complex[][][]>([]);

  const handleGateSelect = useCallback((gateInfo: any) => {
    if (gates.length >= 20) {
      toast.error("Circuit too complex! Maximum 20 gates supported.");
      return;
    }

    const maxStep = Math.max(...gates.filter(g => g.qubit === selectedQubit).map(g => g.step), -1);
    const newGate: QuantumGate = {
      ...gateInfo,
      qubit: selectedQubit,
      step: maxStep + 1
    };

    setGates(prev => [...prev, newGate]);
    
    // Reset step execution when circuit changes
    setCurrentStep(0);
    setIsPlaying(false);
    updateSteppedState(0, [...gates, newGate]);
    
    toast.success(`Added ${gateInfo.symbol} gate to qubit ${selectedQubit}`);
  }, [selectedQubit, gates.length]);

  const handleGateRemove = useCallback((gateId: string) => {
    const [qubit, step] = gateId.split('-').map(Number);
    const newGates = gates.filter(g => !(g.qubit === qubit && g.step === step));
    setGates(newGates);
    
    // Reset step execution when circuit changes
    setCurrentStep(0);
    setIsPlaying(false);
    updateSteppedState(0, newGates);
    
    toast.info("Gate removed from circuit");
  }, [gates]);

  const handleCircuitRun = useCallback(() => {
    try {
      let state = new QuantumState(numQubits);
      
      // Sort gates by step to ensure proper execution order
      const sortedGates = [...gates].sort((a, b) => a.step - b.step);
      
      // Apply gates in sequence
      for (const gate of sortedGates) {
        switch (gate.symbol) {
          case 'Pₓ':
            state = state.applyGate(QuantumGates.X, gate.qubit);
            break;
          case 'Pᵧ':
            state = state.applyGate(QuantumGates.Y, gate.qubit);
            break;
          case 'Pᵨ':
            state = state.applyGate(QuantumGates.Z, gate.qubit);
            break;
          case 'H':
            state = state.applyGate(QuantumGates.H, gate.qubit);
            break;
          case 'S':
            state = state.applyGate(QuantumGates.S, gate.qubit);
            break;
          default:
            // Handle other gates or rotations
            break;
        }
      }
      
      setQuantumState(state);
      
      // Compute Bloch vectors for all qubits
      const newBlochVectors = Array.from({ length: numQubits }, (_, i) => 
        state.getBlochVector(i)
      );
      setBlochVectors(newBlochVectors);
      
      // Compute density matrices
      const newDensityMatrices = Array.from({ length: numQubits }, (_, i) => 
        state.getReducedDensityMatrix(i)
      );
      setDensityMatrices(newDensityMatrices);
      
      toast.success(`Circuit executed! Updated ${numQubits} qubit states.`);
    } catch (error) {
      console.error('Circuit execution error:', error);
      toast.error("Failed to execute circuit. Check your gate sequence.");
    }
  }, [gates, numQubits]);

  // Update stepped state for step-by-step execution
  const updateSteppedState = useCallback((step: number, gateArray: QuantumGate[]) => {
    try {
      let state = new QuantumState(numQubits);
      
      // Sort gates by step to ensure proper execution order
      const sortedGates = [...gateArray].sort((a, b) => a.step - b.step);
      
      // Apply gates up to the current step
      for (const gate of sortedGates) {
        if (gate.step >= step) break;
        
        switch (gate.symbol) {
          case 'Pₓ':
            state = state.applyGate(QuantumGates.X, gate.qubit);
            break;
          case 'Pᵧ':
            state = state.applyGate(QuantumGates.Y, gate.qubit);
            break;
          case 'Pᵨ':
            state = state.applyGate(QuantumGates.Z, gate.qubit);
            break;
          case 'H':
            state = state.applyGate(QuantumGates.H, gate.qubit);
            break;
          case 'S':
            state = state.applyGate(QuantumGates.S, gate.qubit);
            break;
          default:
            break;
        }
      }
      
      setSteppedQuantumState(state);
      
      // Compute Bloch vectors for all qubits
      const newBlochVectors = Array.from({ length: numQubits }, (_, i) => 
        state.getBlochVector(i)
      );
      setSteppedBlochVectors(newBlochVectors);
      
      // Compute density matrices
      const newDensityMatrices = Array.from({ length: numQubits }, (_, i) => 
        state.getReducedDensityMatrix(i)
      );
      setSteppedDensityMatrices(newDensityMatrices);
      
    } catch (error) {
      console.error('Step execution error:', error);
      toast.error("Failed to execute step. Check your gate sequence.");
    }
  }, [numQubits]);

  const handleCircuitClear = useCallback(() => {
    setGates([]);
    setQuantumState(new QuantumState(numQubits));
    setBlochVectors(Array.from({ length: numQubits }, () => ({ x: 0, y: 0, z: 1 })));
    setDensityMatrices([]);
    
    // Reset step execution
    setCurrentStep(0);
    setIsPlaying(false);
    setSteppedQuantumState(new QuantumState(numQubits));
    setSteppedBlochVectors(Array.from({ length: numQubits }, () => ({ x: 0, y: 0, z: 1 })));
    setSteppedDensityMatrices([]);
    
    toast.info("Circuit cleared. All qubits reset to |0⟩ state.");
  }, [numQubits]);

  // Step execution controls
  const handleStepPlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handleStepPause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleStepStop = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
    updateSteppedState(0, gates);
  }, [gates, updateSteppedState]);

  const handleStepTo = useCallback((step: number) => {
    setCurrentStep(step);
    updateSteppedState(step, gates);
  }, [gates, updateSteppedState]);

  const handleStepForward = useCallback(() => {
    const maxSteps = Math.max(...gates.map(g => g.step), 0) + 1;
    if (currentStep < maxSteps) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      updateSteppedState(newStep, gates);
    }
  }, [currentStep, gates, updateSteppedState]);

  const handleStepBack = useCallback(() => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      updateSteppedState(newStep, gates);
    }
  }, [currentStep, gates, updateSteppedState]);

  const handleStepReset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    updateSteppedState(0, gates);
  }, [gates, updateSteppedState]);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;
    
    const maxSteps = Math.max(...gates.map(g => g.step), 0) + 1;
    if (currentStep >= maxSteps) {
      setIsPlaying(false);
      return;
    }
    
    const timer = setTimeout(() => {
      handleStepForward();
    }, 1500); // 1.5 second delay between steps
    
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, gates, handleStepForward]);

  // Initialize stepped state
  useEffect(() => {
    updateSteppedState(currentStep, gates);
  }, [numQubits, updateSteppedState]);

  const handleExport = useCallback((format: 'json' | 'png') => {
    if (format === 'json') {
      const exportData = {
        circuit: gates,
        blochVectors: isStepMode ? steppedBlochVectors : blochVectors,
        densityMatrices: (isStepMode ? steppedDensityMatrices : densityMatrices).map(matrix => 
          matrix.map(row => row.map(c => ({ real: c.real, imaginary: c.imaginary })))
        ),
        stepExecution: {
          isStepMode,
          currentStep,
          totalSteps: Math.max(...gates.map(g => g.step), 0) + 1
        },
        timestamp: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quantum-circuit-export.json';
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success("Circuit data exported to JSON");
    } else {
      toast.info("PNG export feature coming soon!");
    }
  }, [gates, blochVectors, densityMatrices, steppedBlochVectors, steppedDensityMatrices, isStepMode, currentStep]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Q-Bloch Visualizer
              </h1>
              <Badge variant="secondary" className="text-xs">
                v2.1
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Qubits:</span>
                  <div className="flex gap-1">
                    {[2, 3, 4, 5].map(n => (
                      <Button
                        key={n}
                        variant={numQubits === n ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setNumQubits(n);
                          setQuantumState(new QuantumState(n));
                          setBlochVectors(Array.from({ length: n }, () => ({ x: 0, y: 0, z: 1 })));
                          setSteppedQuantumState(new QuantumState(n));
                          setSteppedBlochVectors(Array.from({ length: n }, () => ({ x: 0, y: 0, z: 1 })));
                          setGates([]);
                          setSelectedQubit(0);
                          setCurrentStep(0);
                          setIsPlaying(false);
                        }}
                        className="w-8 h-8 p-0"
                      >
                        {n}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Mode:</span>
                  <div className="flex gap-1">
                    <Button
                      variant={!isStepMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsStepMode(false)}
                      className="text-xs px-3"
                    >
                      Full Run
                    </Button>
                    <Button
                      variant={isStepMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsStepMode(true)}
                      className="text-xs px-3"
                    >
                      Step-by-Step
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Info className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-120px)]">
          {/* Left Panel - Circuit Builder and Visualization */}
          <div className="col-span-8 space-y-6">
            {/* Quantum Validation */}
            <QuantumValidation gates={gates} numQubits={numQubits} />
            
            {/* Circuit Builder */}
            {!isStepMode ? (
              <QuantumCircuitBuilder
                numQubits={numQubits}
                gates={gates}
                onGateRemove={handleGateRemove}
                onCircuitRun={handleCircuitRun}
                onCircuitClear={handleCircuitClear}
              />
            ) : (
              <StepExecutionControls
                gates={gates}
                isPlaying={isPlaying}
                currentStep={currentStep}
                onPlay={handleStepPlay}
                onPause={handleStepPause}
                onStop={handleStepStop}
                onStepTo={handleStepTo}
                onStepForward={handleStepForward}
                onStepBack={handleStepBack}
                onReset={handleStepReset}
              />
            )}
            
            {/* Bloch Spheres Grid */}
            <div className="grid grid-cols-3 gap-4">
              {(isStepMode ? steppedBlochVectors : blochVectors).map((vector, index) => (
                <BlochSphere
                  key={index}
                  blochVector={vector}
                  qubitIndex={index}
                  className="cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all duration-200"
                  onClick={() => setSelectedQubit(index)}
                />
              ))}
            </div>
          </div>

          {/* Right Panel - Toolbox and Analysis */}
          <div className="col-span-4 space-y-6">
            <QuantumGateToolbox
              onGateSelect={handleGateSelect}
              selectedQubit={selectedQubit}
            />
            
            <ProbabilityAmplitudesPanel
              quantumState={isStepMode ? steppedQuantumState : quantumState}
            />
            
            <QuantumStatePanel
              densityMatrices={isStepMode ? steppedDensityMatrices : densityMatrices}
              blochVectors={isStepMode ? steppedBlochVectors : blochVectors}
              numQubits={numQubits}
              onExport={handleExport}
            />
          </div>
        </div>
      </main>
    </div>
  );
}