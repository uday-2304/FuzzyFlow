# FuzzyFlow — Smart Irrigation Control System
### Using Mamdani Fuzzy Inference System (Soft Computing Project)

**Student Name:** Uday Tejan  
**Roll Number:** LIT2024057  
**Course:** Soft Computing  
**Tech Stack:** React 19, Vite, Framer Motion, Pure JavaScript (Custom Fuzzy Logic Engine), SVG

---

## 1. Project Overview

**FuzzyFlow** is an interactive, web-based intelligent irrigation control system built on the principles of **Soft Computing** and **Mamdani Fuzzy Inference Systems (FIS)**.

In conventional automated agriculture, irrigation timers or binary threshold controllers (e.g., "if soil moisture < 30% turn pump on") are notoriously inefficient:
1. They ignore atmospheric conditions such as sunlight intensity and evaporation rates.
2. They cause mechanical relay and valve thrashing due to rigid on/off switching.
3. They fail to reflect human-expert reasoning, which naturally balances soil dampness and ambient heat in continuous shades of gray.

FuzzyFlow solves this by modeling real-world environmental ambiguity through fuzzy sets, evaluating linguistic rules, and computing a smooth, defuzzified watering duration (in minutes) using the centroid method.

---

## 2. System Architecture & Mathematical Model

The system operates as a classic **2-Input, 1-Output Mamdani FIS** with a 4-stage pipeline:

```
[Soil Dryness %]  ──► [ 1. Fuzzification ] ──► [ 2. Rule Evaluation (MIN) ]
                                                        │
[Sunlight %]      ──► [ 1. Fuzzification ] ──►          ▼
                                                [ 3. Aggregation (MAX) ]
                                                        │
                                                        ▼
                                                [ 4. Defuzzification (Centroid) ] ──► [ Watering Duration: z* (min) ]
```

### 2.1 Input & Output Variables

| Variable | Type | Universe of Discourse | Fuzzy Sets (Linguistic Terms) |
| :--- | :--- | :--- | :--- |
| **Soil Dryness** | Input (Antecedent 1) | $0\% \dots 100\%$ | **Low** (Wet), **Medium** (Moderate), **High** (Dry) |
| **Sunlight Intensity**| Input (Antecedent 2) | $0\% \dots 100\%$ | **Low** (Shade), **Medium** (Normal), **High** (Intense) |
| **Watering Duration** | Output (Consequent) | $0 \dots 30\text{ minutes}$ | **Short** ($0\text{--}12\text{m}$), **Medium** ($8\text{--}22\text{m}$), **Long** ($18\text{--}30\text{m}$) |

---

### 2.2 Membership Functions (MFs)

All sets use continuous piecewise linear functions (triangular and trapezoidal with flat saturation shoulders):

#### 1. Soil Dryness ($x \in [0, 100]$):
- **Low (Trapezoidal Left Shoulder):**
  $$\mu_{\text{Low}}(x) = \begin{cases} 1.0 & x \le 20 \\ \frac{40 - x}{20} & 20 < x < 40 \\ 0.0 & x \ge 40 \end{cases}$$
- **Medium (Triangular):**
  $$\mu_{\text{Med}}(x) = \begin{cases} 0.0 & x \le 20 \text{ or } x \ge 80 \\ \frac{x - 20}{30} & 20 < x \le 50 \\ \frac{80 - x}{30} & 50 < x < 80 \end{cases}$$
- **High (Trapezoidal Right Shoulder):**
  $$\mu_{\text{High}}(x) = \begin{cases} 0.0 & x \le 60 \\ \frac{x - 60}{20} & 60 < x < 80 \\ 1.0 & x \ge 80 \end{cases}$$

#### 2. Sunlight Intensity ($y \in [0, 100]$):
- Symmetrical triangular/trapezoidal distributions matching the domain: Low ($[0, 20, 40]$), Medium ($[20, 50, 80]$), High ($[60, 80, 100]$).

#### 3. Watering Duration ($z \in [0, 30\text{ min}]$):
- **Short:** Left shoulder plateau from $0$ to $5\text{ min}$, ramping down to $0$ at $12\text{ min}$.
- **Medium:** Symmetric isosceles triangle centered at $15\text{ min}$ (base from $8$ to $22\text{ min}$).
- **Long:** Right shoulder ramp starting at $18\text{ min}$, plateauing at $1.0$ from $25$ to $30\text{ min}$.

---

### 2.3 The 3 × 3 Knowledge Base (9 Mamdani Rules)

The domain knowledge is encoded in a complete $3 \times 3$ rule matrix:

| Soil Dryness \ Sunlight | Sun: Low | Sun: Medium | Sun: High |
| :--- | :---: | :---: | :---: |
| **Soil: Low (Wet)** | **Rule 1:** Short | **Rule 2:** Short | **Rule 3:** Short |
| **Soil: Medium** | **Rule 4:** Short | **Rule 5:** Medium | **Rule 6:** Medium |
| **Soil: High (Dry)** | **Rule 7:** Medium | **Rule 8:** Long | **Rule 9:** Long |

---

### 2.4 Inference & Defuzzification Calculus

1. **Rule Firing Strength (Min T-Norm):**
   $$\alpha_k = \min\big(\mu_{\text{Soil}, k}(x_{\text{soil}}), \; \mu_{\text{Sun}, k}(y_{\text{sun}})\big) \quad \text{for } k = 1 \dots 9$$
2. **Implication (Clipping):**
   $$\mu_{C, k}(z) = \min(\alpha_k, \; \mu_{\text{Output}, k}(z))$$
3. **Aggregation (Max S-Norm):**
   $$\mu_{\text{agg}}(z) = \max_{k=1\dots9} \big(\mu_{C, k}(z)\big)$$
4. **Centroid Defuzzification (Center of Gravity):**
   $$z^* = \frac{\int_{0}^{30} z \cdot \mu_{\text{agg}}(z) \, dz}{\int_{0}^{30} \mu_{\text{agg}}(z) \, dz}$$
   *Implemented via high-resolution numerical integration ($N = 120$ steps, step size $\Delta z = 0.25\text{ min}$) with zero-division protection.*

---

## 3. Application Features & Modules

- **Dashboard (Live Simulation):**
  - Instant slider controls for Soil Dryness and Sunlight Intensity with one-click presets (*Wet*, *Moderate*, *Dry*).
  - 4 real-time KPI status cards.
  - Defuzzification centroid graph with color-coded fuzzy sets (Short: Sky Blue, Medium: Golden Amber, Long: Crimson Red).
  - Side-by-side membership probe graphs for both input channels.
- **Rule Engine (3×3 Knowledge Matrix):**
  - Interactive grid displaying live firing strengths $\alpha_k$ for all 9 rules.
  - Active rule count and dynamic dominant rule detection without unwanted click selection.
- **Step Pipeline Visualizer:**
  - Explains the exact numerical state at each stage of the Mamdani cycle for transparency.
- **Irrigation Scene (Animated Smart Farm Simulation):**
  - Widescreen $840 \times 430$ SVG physics simulation.
  - Dynamic sky illumination, animated sun flare, and floating clouds.
  - Multi-stream parabolic water jets with 36 ballistic droplets and ground splash ripples.
  - Living crops with wind sway, subterranean root system, and moisture seepage particles.
  - Integrated digital telemetry HUD cards for valve duration and soil moisture probes.
- **Algorithm Guide:**
  - Complete academic breakdown containing all piecewise equations, 3x3 rule explanations, and centroid derivations.
- **User Branding & Profile:**
  - Custom geometric logo with transparent cutout.
  - Student profile card (**Uday Tejan — LIT2024057**) in the navigation sidebar.

---

## 4. Verification & Unit Tests

The core mathematical engine has **174 automated unit tests** that pass with 100% compliance:

```bash
npm test
```

### Verified Test Suites:
1. **Trapezoid & Triangle MF Geometry**: Shoulder plateaus, midpoints, foot points, and zero outside domain boundaries.
2. **Partition of Unity & Overlapping**: Smooth partition across overlapping intervals ($[20, 40]$ and $[60, 80]$).
3. **Min-AND Rule Firing**: Exact validation of $\alpha = \min(\mu_1, \mu_2)$ across all 9 rule branches.
4. **Centroid Integration**: Accurate center-of-gravity calculation and division-by-zero protection.
5. **The 5 Standard Scenarios**:
   - *Extreme Wet/Shade:* Soil=0%, Sun=0% $\rightarrow$ Short (~4.49 min)
   - *Transition:* Soil=35%, Sun=65% $\rightarrow$ Valid multi-rule firing (~7.29 min)
   - *Balanced:* Soil=50%, Sun=50% $\rightarrow$ Exact symmetric Medium (15.00 min)
   - *High Heat:* Soil=85%, Sun=90% $\rightarrow$ Long (~25.51 min)
   - *Extreme Dry/Sun:* Soil=100%, Sun=100% $\rightarrow$ Maximum Long (~25.51 min)
6. **Strict Monotonicity Proof**: Automated 50-step sweep verifying that as soil dryness increases, watering duration strictly never decreases.

---

## 5. Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd fuzzyflow

# Install dependencies
npm install
```

### Run Locally (Development)

```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173/` (or `http://localhost:5174/` if 5173 is occupied).

### Run Test Suite

```bash
npm test
```

### Production Build

```bash
npm run build
```

---

## 6. Project Details & Credits

- **Author:** Uday Tejan
- **Roll Number:** LIT2024057
- **Project Title:** FuzzyFlow — Smart Irrigation Control System
- **Topic:** Soft Computing / Fuzzy Logic (Mamdani Model)
- **Year:** 2026
