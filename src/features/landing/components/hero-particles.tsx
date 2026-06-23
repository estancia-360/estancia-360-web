const PARTICLE_COUNT = 24;

interface Particle {
  size: number;
  left: number;
  duration: number;
  delay: number;
  opacity: number;
}

/** Deterministic pseudo-random in [0, 1), seeded by index — keeps render pure. */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, index) => ({
  size: seededRandom(index) * 6 + 2,
  left: seededRandom(index + 0.37) * 100,
  duration: seededRandom(index + 0.71) * 15 + 10,
  delay: seededRandom(index + 0.13) * 8,
  opacity: seededRandom(index + 0.59) * 0.3 + 0.05,
}));

export function HeroParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {particles.map((particle, index) => (
        <div
          key={index}
          className="absolute animate-[float-up_linear_infinite] rounded-full bg-white/6"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.left}%`,
            top: "100%",
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            opacity: particle.opacity,
          }}
        />
      ))}
    </div>
  );
}
