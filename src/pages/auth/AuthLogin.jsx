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

  /* ===== ABSTRACT LINES CANVAS ===== */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    // Nodes that drift around and connect with lines
    const NODE_COUNT = 60;
    const nodes = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize nodes with random positions and velocities
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        r: Math.random() * 2 + 1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const maxDist = 160;

      // Update node positions
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        // Bounce off edges
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.25;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(167, 139, 250, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(167, 139, 250, 0.35)";
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
    <div className="authBg">
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
