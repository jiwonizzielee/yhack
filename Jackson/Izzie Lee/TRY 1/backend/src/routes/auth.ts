import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { supabase } from "../lib/supabase.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? "crashly-dev-secret";

// POST /auth/signup
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const hashed = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("users")
    .insert([{ full_name: name, email, password_hash: hashed }])
    .select()
    .single();

  if (error) {
    // If unique constraint — email already exists
    if (error.code === "23505") return res.status(409).json({ error: "Email already in use" });
    console.error("Signup error:", error);
    return res.status(500).json({ error: "Signup failed" });
  }

  const token = jwt.sign({ userId: data.id, email, name }, JWT_SECRET, { expiresIn: "7d" });
  return res.json({ token, user: { id: data.id, name, email } });
});

// POST /auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });

  const { data, error } = await supabase
    .from("users")
    .select("id, full_name, email, password_hash")
    .eq("email", email)
    .single();

  if (error || !data) return res.status(401).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, data.password_hash);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ userId: data.id, email: data.email, name: data.full_name }, JWT_SECRET, { expiresIn: "7d" });
  return res.json({ token, user: { id: data.id, name: data.full_name, email: data.email } });
});

export default router;
