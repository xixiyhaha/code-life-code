"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

export function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particlesArray: Particle[] = [];
    let animationFrameId: number;

    const setCanvasSize = () => {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    };
    window.addEventListener("resize", setCanvasSize);
    setCanvasSize();

    const isDark = resolvedTheme === "dark";
    const particleColor = isDark ? "255, 255, 255" : "30, 64, 175";

    let mouse = {
      x: null as number | null,
      y: null as number | null,
      radius: 180
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.x;
      mouse.y = event.y;
    };
    const handleMouseOut = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseOut);

    class Particle {
      x: number;
      y: number;
      size: number;
      baseX: number;
      baseY: number;
      speedX: number;
      speedY: number;
      density: number;

      constructor(x?: number, y?: number) {
        this.x = x || Math.random() * canvas!.width;
        this.y = y || Math.random() * canvas!.height;
        this.baseX = this.x;
        this.baseY = this.y;
        this.size = Math.random() * 2.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4 - 0.2;
        this.density = (Math.random() * 30) + 1;
      }

      update() {
        if (this.x > canvas!.width) {
          this.x = 0;
          this.baseX = this.x;
        } else if (this.x < 0) {
          this.x = canvas!.width;
          this.baseX = this.x;
        }

        if (this.y > canvas!.height) {
          this.y = 0;
          this.baseY = this.y;
        } else if (this.y < 0) {
          this.y = canvas!.height;
          this.baseY = this.y;
        }

        if (mouse.x != null && mouse.y != null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < mouse.radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouse.radius - distance) / mouse.radius;
            const directionX = forceDirectionX * force * this.density * 0.15;
            const directionY = forceDirectionY * force * this.density * 0.15;
            
            this.x -= directionX;
            this.y -= directionY;
          } else if (distance < mouse.radius * 2.5) {
             this.x += dx * 0.002;
             this.y += dy * 0.002;
          }
        }

        this.x += this.speedX;
        this.y += this.speedY;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + particleColor + ", 0.7)";
        ctx.fill();
      }
    }

    const init = () => {
      particlesArray = [];
      // 超高密度（大约翻倍）
      const numberOfParticles = Math.min((canvas!.width * canvas!.height) / 3000, 500);
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);

      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseOut);
      cancelAnimationFrame(animationFrameId);
    };
  }, [resolvedTheme]);

  return (
    <div className={"fixed inset-0 z-0 pointer-events-auto"}>
      <canvas
        ref={canvasRef}
        className={"w-full h-full"}
      />
    </div>
  );
}
