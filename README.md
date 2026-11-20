
### 2.1 Input & Output Variables

| Variable | Type | Universe of Discourse | Fuzzy Sets (Linguistic Terms) |
| :--- | :--- | :--- | :--- |
| **Soil Dryness** | Input (Antecedent 1) | 0% ... 100% | **Low** (Wet), **Medium** (Moderate), **High** (Dry) |
| **Sunlight Intensity**| Input (Antecedent 2) | 0% ... 100% | **Low** (Shade), **Medium** (Normal), **High** (Intense) |
| **Watering Duration** | Output (Consequent) | 0 ... 30 minutes | **Short** (0-12m), **Medium** (8-22m), **Long** (18-30m) |

---

### 2.2 Membership Functions (MFs)

All sets use continuous piecewise linear functions (triangular and trapezoidal with flat saturation shoulders):

#### 1. Soil Dryness (x in [0, 100]):
- **Low (Trapezoidal Left Shoulder):** 1.0 for x <= 20; (40 - x) / 20 for 20 < x < 40; 0.0 for x >= 40
- **Medium (Triangular):** (x - 20) / 30 for 20 < x <= 50; (80 - x) / 30 for 50 < x < 80; 0.0 elsewhere
- **High (Trapezoidal Right Shoulder):** 0.0 for x <= 60; (x - 60) / 20 for 60 < x < 80; 1.0 for x >= 80

#### 2. Sunlight Intensity (y in [0, 100]):
- Symmetrical triangular/trapezoidal distributions matching the domain: Low [0, 20, 40], Medium [20, 50, 80], High [60, 80, 100].

#### 3. Watering Duration (z in [0, 30 min]):
- **Short:** Left shoulder plateau from 0 to 5 min, ramping down to 0 at 12 min.
- **Medium:** Symmetric isosceles triangle centered at 15 min (base from 8 to 22 min).
- **Long:** Right shoulder ramp starting at 18 min, plateauing at 1.0 from 25 to 30 min.

---

### 2.3 The 3 × 3 Knowledge Base (9 Mamdani Rules)

| Soil Dryness \ Sunlight | Sun: Low | Sun: Medium | Sun: High |
| :--- | :---: | :---: | :---: |
| **Soil: Low (Wet)** | **Rule 1:** Short | **Rule 2:** Short | **Rule 3:** Short |
| **Soil: Medium** | **Rule 4:** Short | **Rule 5:** Medium | **Rule 6:** Medium |
| **Soil: High (Dry)** | **Rule 7:** Medium | **Rule 8:** Long | **Rule 9:** Long |

---

### 2.4 Inference & Defuzzification Calculus

1. **Rule Firing Strength (Min T-Norm):**  
   `alpha_k = min(mu_Soil_k(x_soil), mu_Sun_k(y_sun))` for k = 1 to 9
2. **Implication (Clipping):**  
   `mu_C_k(z) = min(alpha_k, mu_Output_k(z))`
3. **Aggregation (Max S-Norm):**  
   `mu_agg(z) = max_k(mu_C_k(z))`
4. **Centroid Defuzzification (Center of Gravity):**  
   `z* = Integral(z * mu_agg(z) dz) / Integral(mu_agg(z) dz)`  
   *Implemented via high-resolution numerical integration (N = 120 steps, step size dz = 0.25 min) with zero-division protection.*

---

## 3. Application Features & Modules

- **Dashboard (Live Simulation):**
  - Instant slider controls for Soil Dryness and Sunlight Intensity with one-click presets (*Wet*, *Moderate*, *Dry*).
  - 4 real-time KPI status cards.
  - Defuzzification centroid graph with color-coded fuzzy sets (Short: Sky Blue, Medium: Golden Amber, Long: Crimson Red).
  - Side-by-side membership probe graphs for both input channels.
- **Rule Engine (3×3 Knowledge Matrix):**
  - Interactive grid displaying live firing strengths for all 9 rules.
  - Active rule count and dynamic dominant rule detection without unwanted click selection.
- **Step Pipeline Visualizer:**
  - Explains the exact numerical state at each stage of the Mamdani cycle for transparency.
- **Irrigation Scene (Animated Smart Farm Simulation):**
  - Widescreen 840 × 430 SVG physics simulation.
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
