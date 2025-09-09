// Q-Bloch SDK - Lightweight quantum computing library
import { Complex } from './complex';

export class QuantumState {
  private amplitudes: Complex[];
  private numQubits: number;

  constructor(numQubits: number, initialState?: Complex[]) {
    this.numQubits = numQubits;
    const size = Math.pow(2, numQubits);
    
    if (initialState) {
      this.amplitudes = [...initialState];
    } else {
      // Initialize |00...0⟩ state
      this.amplitudes = new Array(size).fill(null).map((_, i) => 
        new Complex(i === 0 ? 1 : 0, 0)
      );
    }
  }

  getAmplitudes(): Complex[] {
    return [...this.amplitudes];
  }

  getNumQubits(): number {
    return this.numQubits;
  }

  // Compute density matrix ρ = |ψ⟩⟨ψ|
  getDensityMatrix(): Complex[][] {
    const size = this.amplitudes.length;
    const rho: Complex[][] = [];
    
    for (let i = 0; i < size; i++) {
      rho[i] = [];
      for (let j = 0; j < size; j++) {
        rho[i][j] = this.amplitudes[i].multiply(this.amplitudes[j].conjugate());
      }
    }
    
    return rho;
  }

  // Compute reduced density matrix for a single qubit using partial trace
  getReducedDensityMatrix(qubitIndex: number): Complex[][] {
    if (qubitIndex >= this.numQubits) {
      throw new Error(`Invalid qubit index: ${qubitIndex}`);
    }

    const rho = this.getDensityMatrix();
    const size = this.amplitudes.length;
    const reducedRho: Complex[][] = [
      [new Complex(0, 0), new Complex(0, 0)],
      [new Complex(0, 0), new Complex(0, 0)]
    ];

    // Partial trace over all qubits except the target qubit
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        // Extract qubit states
        const iBit = (i >> (this.numQubits - 1 - qubitIndex)) & 1;
        const jBit = (j >> (this.numQubits - 1 - qubitIndex)) & 1;
        
        // Check if other qubits match
        const iOther = i & ~(1 << (this.numQubits - 1 - qubitIndex));
        const jOther = j & ~(1 << (this.numQubits - 1 - qubitIndex));
        
        if (iOther === jOther) {
          reducedRho[iBit][jBit] = reducedRho[iBit][jBit].add(rho[i][j]);
        }
      }
    }

    return reducedRho;
  }

  // Get Bloch vector coordinates from reduced density matrix
  getBlochVector(qubitIndex: number): { x: number; y: number; z: number } {
    const rho = this.getReducedDensityMatrix(qubitIndex);
    
    // Pauli matrices
    const sigmaX = rho[0][1].add(rho[1][0]);
    const sigmaY = rho[0][1].subtract(rho[1][0]).multiply(new Complex(0, -1));
    const sigmaZ = rho[0][0].subtract(rho[1][1]);
    
    return {
      x: sigmaX.real,
      y: sigmaY.real,
      z: sigmaZ.real
    };
  }

  // Apply a single-qubit gate to a specific qubit
  applyGate(gate: Complex[][], qubitIndex: number): QuantumState {
    const newAmplitudes = new Array(this.amplitudes.length).fill(null).map(() => new Complex(0, 0));
    
    for (let state = 0; state < this.amplitudes.length; state++) {
      const qubitBit = (state >> (this.numQubits - 1 - qubitIndex)) & 1;
      const otherBits = state & ~(1 << (this.numQubits - 1 - qubitIndex));
      
      for (let newQubitBit = 0; newQubitBit < 2; newQubitBit++) {
        const newState = otherBits | (newQubitBit << (this.numQubits - 1 - qubitIndex));
        const gateElement = gate[newQubitBit][qubitBit];
        newAmplitudes[newState] = newAmplitudes[newState].add(
          this.amplitudes[state].multiply(gateElement)
        );
      }
    }
    
    return new QuantumState(this.numQubits, newAmplitudes);
  }

  // Apply CNOT gate
  applyCNOT(controlQubit: number, targetQubit: number): QuantumState {
    const newAmplitudes = [...this.amplitudes];
    
    for (let state = 0; state < this.amplitudes.length; state++) {
      const controlBit = (state >> (this.numQubits - 1 - controlQubit)) & 1;
      const targetBit = (state >> (this.numQubits - 1 - targetQubit)) & 1;
      
      if (controlBit === 1) {
        // Flip target bit
        const newTargetBit = 1 - targetBit;
        const newState = state ^ (1 << (this.numQubits - 1 - targetQubit));
        
        const temp = newAmplitudes[state];
        newAmplitudes[state] = newAmplitudes[newState];
        newAmplitudes[newState] = temp;
      }
    }
    
    return new QuantumState(this.numQubits, newAmplitudes);
  }
}

// Quantum Gates Library
export const QuantumGates = {
  // Pauli Gates
  X: [
    [new Complex(0, 0), new Complex(1, 0)],
    [new Complex(1, 0), new Complex(0, 0)]
  ],
  
  Y: [
    [new Complex(0, 0), new Complex(0, -1)],
    [new Complex(0, 1), new Complex(0, 0)]
  ],
  
  Z: [
    [new Complex(1, 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(-1, 0)]
  ],
  
  // Hadamard Gate
  H: [
    [new Complex(1/Math.sqrt(2), 0), new Complex(1/Math.sqrt(2), 0)],
    [new Complex(1/Math.sqrt(2), 0), new Complex(-1/Math.sqrt(2), 0)]
  ],
  
  // S Gate (Quarter turn Z)
  S: [
    [new Complex(1, 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(0, 1)]
  ],
  
  // T Gate (Eighth turn Z)
  T: [
    [new Complex(1, 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(1/Math.sqrt(2), 1/Math.sqrt(2))]
  ],

  // Rotation gates
  RX: (theta: number) => [
    [new Complex(Math.cos(theta/2), 0), new Complex(0, -Math.sin(theta/2))],
    [new Complex(0, -Math.sin(theta/2)), new Complex(Math.cos(theta/2), 0)]
  ],
  
  RY: (theta: number) => [
    [new Complex(Math.cos(theta/2), 0), new Complex(-Math.sin(theta/2), 0)],
    [new Complex(Math.sin(theta/2), 0), new Complex(Math.cos(theta/2), 0)]
  ],
  
  RZ: (theta: number) => [
    [new Complex(Math.cos(theta/2), -Math.sin(theta/2)), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(Math.cos(theta/2), Math.sin(theta/2))]
  ]
};