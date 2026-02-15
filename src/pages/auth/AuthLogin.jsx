import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./authLogin.css";

import jioji from "../../assets/Jioji_logo.png";
import { FaUserAlt } from "react-icons/fa";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { BASE_URL } from "/src/config/api.js";


function parseJwt(token) {
  try {
    const base64Url = token?.split(".")?.[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/* ================= ROLE HANDLING ================= */
function normalizeRole(role) {
  return String(role || "")
    .trim()
    .toUpperCase()
    .replace(/^ROLE_/, "");
}

function getDashboardPathByRole(role) {
  const r = normalizeRole(role);
  if (r === "ADMIN") return "/admin/dashboard";
  if (r === "USER") return "/dashboard";
  if (r === "EMPLOYEE" || r === "SURVEYOR") return "/employee/dashboard";
  if (r === "LAB" || r === "LAB_TECHNICIAN") return "/lab/dashboard";
  return "/";
}

/* ================= COMPONENT ================= */
export default function AuthLogin() {
  const navigate = useNavigate();
  const userIdRef = useRef(null);
  const canvasRef = useRef(null);

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setTimeout(() => userIdRef.current?.focus?.(), 0);
  }, []);

  /* ===== ABSTRACT LINES CANVAS WITH CURSOR TRACKING ===== */
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const mouse = mouseRef.current;

    const NODE_COUNT = 100; // Increased density
    const CURSOR_RADIUS = 220; // Slightly larger influence area
    const CURSOR_STRENGTH = 0.8; // Visual push strength
    const nodes = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize nodes
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6, // Slightly slower base drift
        vy: (Math.random() - 0.5) * 0.6,
        ox: 0, oy: 0, // Visual offset
        r: Math.random() * 2 + 1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const maxDist = 180; // Allow longer connections

      // --- Update Base Positions & Calculate Visual Offsets ---
      for (const n of nodes) {
        // 1. Move base position (Drift)
        n.x += n.vx;
        n.y += n.vy;

        // Bounce base position off edges
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;

        // 2. Calculate Visual Offset (Elastic Push)
        // Spring back to 0
        n.ox *= 0.94;
        n.oy *= 0.94;

        if (mouse.active) {
          // Calculate distance from cursor to the node's VISUAL position (approx)
          // We use base+offset to check if the node IS currently close
          const curX = n.x + n.ox;
          const curY = n.y + n.oy;
          const dx = curX - mouse.x;
          const dy = curY - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Push away
          if (dist < CURSOR_RADIUS) {
            const force = (1 - dist / CURSOR_RADIUS) * CURSOR_STRENGTH;
            const angle = Math.atan2(dy, dx);
            n.ox += Math.cos(angle) * force * 15; // Push multiplier
            n.oy += Math.sin(angle) * force * 15;
          }
        }
      }

      // --- Draw Connections (Based on Base Logic, Rendered at Visual Pos) ---
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];

          // Check connectivity using BASE positions (Stable Topology)
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const baseDist = Math.sqrt(dx * dx + dy * dy);

          if (baseDist < maxDist) {
            const baseAlpha = (1 - baseDist / maxDist) * 0.25;

            // Visual positions
            const ax = a.x + a.ox;
            const ay = a.y + a.oy;
            const bx = b.x + b.ox;
            const by = b.y + b.oy;

            // Interactions based on visual properties
            const mx = (ax + bx) / 2;
            const my = (ay + by) / 2;
            const cursorDist = mouse.active
              ? Math.sqrt((mx - mouse.x) ** 2 + (my - mouse.y) ** 2)
              : 9999;
            const nearCursor = cursorDist < CURSOR_RADIUS;

            const alpha = nearCursor
              ? Math.min(baseAlpha + (1 - cursorDist / CURSOR_RADIUS) * 0.4, 0.8)
              : baseAlpha;

            const color = nearCursor
              ? `rgba(110, 231, 183, ${alpha})` // Teal near cursor
              : `rgba(167, 139, 250, ${alpha})`; // Purple normally

            ctx.beginPath();
            ctx.moveTo(ax, ay);

            if (nearCursor) {
              // Gentle bend
              const bendFactor = (1 - cursorDist / CURSOR_RADIUS) * 30;
              // Perpendicular vector
              const vdx = bx - ax;
              const vdy = by - ay;
              const vLen = Math.sqrt(vdx * vdx + vdy * vdy);
              // Midpoint control
              const midX = (ax + bx) / 2;
              const midY = (ay + by) / 2;

              // Direction away from cursor
              const toCursorX = midX - mouse.x;
              const toCursorY = midY - mouse.y;
              // Normalize
              const toCursorLen = Math.sqrt(toCursorX * toCursorX + toCursorY * toCursorY) || 1;

              // We want to bend AWAY from cursor, so we add vector
              const cpX = midX + (toCursorX / toCursorLen) * bendFactor;
              const cpY = midY + (toCursorY / toCursorLen) * bendFactor;

              ctx.quadraticCurveTo(cpX, cpY, bx, by);
              ctx.lineWidth = 0.8 + (1 - cursorDist / CURSOR_RADIUS);
            } else {
              ctx.lineTo(bx, by);
              ctx.lineWidth = 0.6;
            }

            ctx.strokeStyle = color;
            ctx.stroke();
          }
        }
      }

      // --- Draw Nodes ---
      for (const n of nodes) {
        // Visual position
        const nx = n.x + n.ox;
        const ny = n.y + n.oy;

        const cursorDist = mouse.active
          ? Math.sqrt((nx - mouse.x) ** 2 + (ny - mouse.y) ** 2)
          : 9999;
        const nearCursor = cursorDist < CURSOR_RADIUS;

        const radius = nearCursor ? n.r + (1 - cursorDist / CURSOR_RADIUS) * 2.5 : n.r;
        const alpha = nearCursor ? 0.35 + (1 - cursorDist / CURSOR_RADIUS) * 0.5 : 0.35;

        ctx.beginPath();
        ctx.arc(nx, ny, radius, 0, Math.PI * 2);
        ctx.fillStyle = nearCursor
          ? `rgba(110, 231, 183, ${alpha})`
          : `rgba(167, 139, 250, ${alpha})`;
        ctx.fill();

        // Inner white dot for "tech" feel
        if (nearCursor) {
          ctx.beginPath();
          ctx.arc(nx, ny, radius * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, 0.8)`;
          ctx.fill();
        }
      }

      // --- Cursor Glow ---
      if (mouse.active) {
        const grd = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 140);
        grd.addColorStop(0, "rgba(110, 231, 183, 0.08)");
        grd.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 140, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  /* ================= LOGIN ================= */
  const onSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!userId.trim() || !password.trim()) {
      setApiError("Username and password are required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/jwt/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: userId.trim(),
          password,
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      const payload = contentType.includes("application/json")
        ? await res.json()
        : await res.text();

      if (!res.ok) {
        const msg =
          typeof payload === "string"
            ? payload
            : payload?.message || payload?.error || "Invalid credentials";
        throw new Error(msg);
      }

      const token =
        payload?.token ||
        payload?.accessToken ||
        payload?.data?.token ||
        payload?.data?.accessToken;

      if (!token)
        throw new Error("Login successful but token not found");

      const decoded = parseJwt(token);
      const authority = decoded?.authorities?.[0];
      const role = normalizeRole(authority);

      /* ================= SAVE AUTH DATA ================= */
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      localStorage.setItem(
        "employeeCode",
        decoded?.employeeCode || userId.trim()
      );
      localStorage.setItem(
        "employeeName",
        decoded?.employeeName || userId.trim()
      );
      localStorage.setItem("userEmail", userId.trim());

      if (decoded?.userId) {
        localStorage.setItem("userId", decoded.userId);
      }

      /* ================= CRITICAL FIX =================
         Force full reload so auth guards re-evaluate
      */
      window.location.href = getDashboardPathByRole(role);
    } catch (err) {
      setApiError(err?.message || "Login failed");
      userIdRef.current?.focus?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="authBg"
      onMouseMove={(e) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouseRef.current.x = e.clientX - rect.left;
        mouseRef.current.y = e.clientY - rect.top;
        mouseRef.current.active = true;
      }}
      onMouseLeave={() => { mouseRef.current.active = false; }}
    >
      {/* Abstract generative lines canvas */}
      <canvas ref={canvasRef} className="authCanvas"></canvas>

      <div className="authCard">
        <div className="authBrand">
          <img className="authLogo" src={jioji} alt="Jioji Green India" />
        </div>

        <h1 className="authHeading">Login</h1>

        {apiError && <div className="authError" key={apiError}>{apiError}</div>}

        <form className="authForm" onSubmit={onSubmit}>
          <label className="authLabel">
            Username
            <div className="authField">
              <input
                ref={userIdRef}
                className="authInput"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter Username"
                autoComplete="username"
              />
              <span className="authIcon">
                <FaUserAlt />
              </span>
            </div>
          </label>

          <label className="authLabel">
            Password
            <div className="authField">
              <input
                className="authInput"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="authIconBtn"
                onClick={() => setShowPassword((s) => !s)}
              >
                {showPassword ? <IoEyeOff /> : <IoEye />}
              </button>
            </div>
          </label>

          <div className="authRow">
            <label className="authRemember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>

            <button
              type="button"
              className="authLinkBtn"
              onClick={() => navigate("/forgot-password")}
            >
              Forget Password?
            </button>
          </div>

          <button className="authBtn" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>

          <div className="authTiny">
            By clicking login you agree to the T&amp;C and Privacy Policy
          </div>
        </form>
      </div>
    </div>
  );
}
