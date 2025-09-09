// Complex number implementation for quantum computations
export class Complex {
  public real: number;
  public imaginary: number;

  constructor(real: number, imaginary: number = 0) {
    this.real = real;
    this.imaginary = imaginary;
  }

  add(other: Complex): Complex {
    return new Complex(this.real + other.real, this.imaginary + other.imaginary);
  }

  subtract(other: Complex): Complex {
    return new Complex(this.real - other.real, this.imaginary - other.imaginary);
  }

  multiply(other: Complex): Complex {
    const real = this.real * other.real - this.imaginary * other.imaginary;
    const imaginary = this.real * other.imaginary + this.imaginary * other.real;
    return new Complex(real, imaginary);
  }

  conjugate(): Complex {
    return new Complex(this.real, -this.imaginary);
  }

  magnitude(): number {
    return Math.sqrt(this.real * this.real + this.imaginary * this.imaginary);
  }

  phase(): number {
    return Math.atan2(this.imaginary, this.real);
  }

  toString(): string {
    if (this.imaginary === 0) return this.real.toFixed(4);
    if (this.real === 0) return `${this.imaginary.toFixed(4)}i`;
    
    const sign = this.imaginary >= 0 ? '+' : '-';
    return `${this.real.toFixed(4)} ${sign} ${Math.abs(this.imaginary).toFixed(4)}i`;
  }
}