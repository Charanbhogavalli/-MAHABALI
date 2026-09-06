export type MahabaliPose = 'idle' | 'walk' | 'bless' | 'row' | 'feast' | 'celebrate' | 'step';

export class MahabaliRenderer {
  /**
   * High-Fidelity Realistic Classical Renderer for King Mahabali (Maveli)
   * Captures authentic Kerala mural and royal traditions:
   * - Volumetric skin gradients & anatomical proportions
   * - Realistic ivory & gold Kasavu Mundu with pleated zari folds
   * - Traditional Kathakali / Temple Royal Kireedam (Crown) with Mayilpeeli (Peacock Feather)
   * - Ornate Kerala jewelry: Palakka Mala, Mulla Mottu, Nagapadam, Padakkam, Tholvalaya, Kundalams
   * - Iconic Olakkuda (Traditional Woven Palm Leaf Umbrella)
   * - Fragrant fresh Jasmine & Chethi Poomala (Floral Garland)
   * - Majestic Komban Meesa mustache, warm benevolent eyes, Chandan & Kumkum Thilakam
   */
  public static draw(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number = 1.0,
    pose: MahabaliPose = 'idle',
    animTick: number = 0
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Natural physics & breathing ticks
    const breath = Math.sin(animTick * 0.05) * 1.8;
    const microBreath = Math.cos(animTick * 0.05) * 0.8;
    const clothSway = Math.sin(animTick * 0.07) * 3.5;
    const clothSway2 = Math.cos(animTick * 0.09) * 2.5;
    const stepBob = pose === 'walk' || pose === 'step' ? Math.abs(Math.sin(animTick * 0.15)) * 4.5 : 0;
    const garlandSway = Math.sin(animTick * 0.06) * 1.5;

    // --- 1. Soft Dynamic Drop Shadow & Sacred Ground Glow ---
    ctx.save();
    const groundShadow = ctx.createRadialGradient(0, 0, 8, 0, 0, 36);
    groundShadow.addColorStop(0, 'rgba(10, 4, 1, 0.6)');
    groundShadow.addColorStop(0.6, 'rgba(10, 4, 1, 0.25)');
    groundShadow.addColorStop(1, 'rgba(10, 4, 1, 0)');
    ctx.fillStyle = groundShadow;
    ctx.beginPath();
    ctx.ellipse(0, 0, 34, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.translate(0, -stepBob);

    // --- 2. Divine Prabhavali (Golden Back Aura Glow) ---
    if (pose === 'celebrate' || pose === 'bless' || pose === 'idle') {
      const auraPulse = Math.sin(animTick * 0.04) * 6;
      const auraY = -90 + breath;
      const auraGrad = ctx.createRadialGradient(0, auraY, 20, 0, auraY, 75 + auraPulse);
      auraGrad.addColorStop(0, 'rgba(254, 240, 138, 0.22)');
      auraGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.12)');
      auraGrad.addColorStop(0.85, 'rgba(217, 119, 6, 0.04)');
      auraGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, auraY, 75 + auraPulse, 0, Math.PI * 2);
      ctx.fill();

      // Subtle ray glints around the crown
      ctx.save();
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.15)';
      ctx.lineWidth = 1;
      const rayCount = 12;
      for (let i = 0; i < rayCount; i++) {
        const rayAngle = (i * Math.PI * 2) / rayCount + animTick * 0.005;
        const r1 = 35;
        const r2 = 55 + Math.sin(animTick * 0.08 + i) * 8;
        ctx.beginPath();
        ctx.moveTo(Math.cos(rayAngle) * r1, auraY + Math.sin(rayAngle) * r1);
        ctx.lineTo(Math.cos(rayAngle) * r2, auraY + Math.sin(rayAngle) * r2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // --- 3. Traditional Palm Leaf Umbrella (Olakkuda / ഓലക്കുട) ---
    // Rendered on the left/back side when standing regally
    if (pose !== 'row') {
      this.drawOlakkuda(ctx, -28, -85 + breath, animTick);
    }

    // --- 4. Feet & Golden Anklets (Kolusu / Padasaram) ---
    this.drawFeetAndAnklets(ctx);

    // --- 5. Kasavu Mundu (Pleated Kerala Silk Dhoti) ---
    this.drawKasavuMundu(ctx, breath, clothSway);

    // --- 6. Golden Royal Waist Belt (Odyanam / Mechala) ---
    this.drawOdyanamBelt(ctx, breath);

    // --- 7. Torso & Royal Musculature ---
    this.drawTorso(ctx, breath, microBreath);

    // --- 8. Royal Necklaces & Jewels (Palakka, Mulla Mottu, Padakkam) ---
    this.drawRoyalJewelry(ctx, breath);

    // --- 9. Fresh Jasmine & Chethi Floral Garland (Poomala) ---
    this.drawPoomalaGarland(ctx, breath, garlandSway);

    // --- 10. Flowing Royal Silk Angavastram (Vermilion Shawl) ---
    this.drawAngavastram(ctx, breath, clothSway, clothSway2);

    // --- 11. Arms & Hands in Royal Mudras ---
    this.drawArmsAndHands(ctx, pose, breath, animTick);

    // --- 12. Head, Realistic Face, Facial Hair & Tilak ---
    this.drawHeadAndFace(ctx, breath, animTick);

    // --- 13. Royal Kathakali / Temple Kireedam Crown & Peacock Feather ---
    this.drawKireedamCrown(ctx, breath, animTick);

    ctx.restore();
  }

  /**
   * Draws the iconic traditional Kerala woven palm leaf umbrella (Olakkuda)
   */
  private static drawOlakkuda(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    animTick: number
  ) {
    ctx.save();
    ctx.translate(x, y);
    const sway = Math.sin(animTick * 0.04) * 0.03;
    ctx.rotate(-0.15 + sway);

    // Long bamboo handle
    const handleGrad = ctx.createLinearGradient(0, 0, 6, 95);
    handleGrad.addColorStop(0, '#78350f');
    handleGrad.addColorStop(0.5, '#b45309');
    handleGrad.addColorStop(1, '#451a03');
    ctx.fillStyle = handleGrad;
    ctx.fillRect(-2, -10, 4, 105);

    // Brass handle ring grips
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-3, 30, 6, 3);
    ctx.fillRect(-3, 60, 6, 3);
    ctx.fillRect(-3, 88, 6, 4);

    // Conical Woven Palm Canopy Base
    const canopyY = -12;
    const canopyRadius = 38;

    // Palm leaf underside shadow
    ctx.fillStyle = '#271206';
    ctx.beginPath();
    ctx.ellipse(0, canopyY, canopyRadius, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Woven dried palm leaf cone (Panathambu / Thaali)
    const palmGrad = ctx.createLinearGradient(0, canopyY - 32, 0, canopyY);
    palmGrad.addColorStop(0, '#fef08a');
    palmGrad.addColorStop(0.25, '#d97706');
    palmGrad.addColorStop(0.7, '#92400e');
    palmGrad.addColorStop(1, '#451a03');
    ctx.fillStyle = palmGrad;
    ctx.beginPath();
    ctx.moveTo(0, canopyY - 36); // Cone peak
    ctx.bezierCurveTo(canopyRadius * 0.7, canopyY - 24, canopyRadius, canopyY - 8, canopyRadius, canopyY);
    ctx.bezierCurveTo(canopyRadius * 0.6, canopyY + 12, -canopyRadius * 0.6, canopyY + 12, -canopyRadius, canopyY);
    ctx.bezierCurveTo(-canopyRadius, canopyY - 8, -canopyRadius * 0.7, canopyY - 24, 0, canopyY - 36);
    ctx.closePath();
    ctx.fill();

    // Woven Rib lines (Struts)
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.4)';
    ctx.lineWidth = 1;
    const ribs = 10;
    for (let r = 0; r < ribs; r++) {
      const angle = (r * Math.PI) / (ribs - 1);
      const rx = Math.cos(angle) * canopyRadius;
      const ry = canopyY + Math.sin(angle) * 10;
      ctx.beginPath();
      ctx.moveTo(0, canopyY - 36);
      ctx.quadraticCurveTo(rx * 0.6, (canopyY - 36 + ry) / 2 - 2, rx, ry);
      ctx.stroke();
    }

    // Concentric cane binding rings
    ctx.strokeStyle = 'rgba(120, 53, 15, 0.8)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(0, canopyY - 14, canopyRadius * 0.55, 6, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, canopyY - 24, canopyRadius * 0.3, 3.5, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Golden brass pinnacle cap (Thoppikuda finial)
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(0, canopyY - 42);
    ctx.lineTo(4, canopyY - 34);
    ctx.lineTo(-4, canopyY - 34);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, canopyY - 42, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Draws realistic anatomical feet with golden anklets (Padasaram)
   */
  private static drawFeetAndAnklets(ctx: CanvasRenderingContext2D) {
    // Warm skin gradient for feet
    const skinGradLeft = ctx.createLinearGradient(-14, -6, -2, 0);
    skinGradLeft.addColorStop(0, '#ea7a32');
    skinGradLeft.addColorStop(0.7, '#c85e1b');
    skinGradLeft.addColorStop(1, '#9a3e0b');

    // Left foot
    ctx.fillStyle = skinGradLeft;
    ctx.beginPath();
    ctx.ellipse(-9, -2, 7, 3.8, -0.08, 0, Math.PI * 2);
    ctx.fill();
    // Toes & nails highlight
    ctx.fillStyle = '#fee28a';
    ctx.beginPath();
    ctx.arc(-14, -2, 1.2, 0, Math.PI * 2);
    ctx.arc(-11.5, -1.2, 1, 0, Math.PI * 2);
    ctx.arc(-9, -1, 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Right foot
    const skinGradRight = ctx.createLinearGradient(2, -6, 14, 0);
    skinGradRight.addColorStop(0, '#ea7a32');
    skinGradRight.addColorStop(0.7, '#c85e1b');
    skinGradRight.addColorStop(1, '#9a3e0b');

    ctx.fillStyle = skinGradRight;
    ctx.beginPath();
    ctx.ellipse(9, -2, 7, 3.8, 0.08, 0, Math.PI * 2);
    ctx.fill();
    // Toes & nails highlight
    ctx.fillStyle = '#fee28a';
    ctx.beginPath();
    ctx.arc(14, -2, 1.2, 0, Math.PI * 2);
    ctx.arc(11.5, -1.2, 1, 0, Math.PI * 2);
    ctx.arc(9, -1, 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Golden Padasaram / Kolusu (Anklets with mini bell drops)
    const drawAnklet = (ax: number) => {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(ax, -4, 6, 2.5, 0, 0, Math.PI);
      ctx.stroke();

      // Golden micro bells (Mani)
      ctx.fillStyle = '#fef08a';
      for (let b = -4; b <= 4; b += 2.5) {
        ctx.beginPath();
        ctx.arc(ax + b, -2.5, 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    drawAnklet(-9);
    drawAnklet(9);
  }

  /**
   * Draws the Kasavu Mundu with realistic folds, golden zari border, and center pleats (Kavani)
   */
  private static drawKasavuMundu(
    ctx: CanvasRenderingContext2D,
    breath: number,
    clothSway: number
  ) {
    const munduTopY = -52 + breath * 0.4;
    const munduBottomY = -8;

    // Mundu base ivory silk gradient
    const munduGrad = ctx.createLinearGradient(0, munduTopY, 0, munduBottomY);
    munduGrad.addColorStop(0, '#faf7ee');
    munduGrad.addColorStop(0.4, '#f5efe0');
    munduGrad.addColorStop(0.85, '#ebe2cc');
    munduGrad.addColorStop(1, '#ded3b6');
    ctx.fillStyle = munduGrad;

    ctx.beginPath();
    ctx.moveTo(-18, munduBottomY);
    ctx.bezierCurveTo(-22, -28, -23, -42, -19, munduTopY);
    ctx.lineTo(19, munduTopY);
    ctx.bezierCurveTo(23, -42, 22, -28, 18, munduBottomY);
    ctx.closePath();
    ctx.fill();

    // Ambient fold shadows for 3D depth
    ctx.strokeStyle = 'rgba(180, 83, 9, 0.16)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-10, munduTopY + 5);
    ctx.quadraticCurveTo(-14, -30, -12, munduBottomY);
    ctx.moveTo(10, munduTopY + 5);
    ctx.quadraticCurveTo(14, -30, 12, munduBottomY);
    ctx.stroke();

    // Kasavu Golden Zari Bottom Hem (Authentic Kerala broad gold border)
    const zariGrad = ctx.createLinearGradient(0, munduBottomY - 9, 0, munduBottomY);
    zariGrad.addColorStop(0, '#fef08a');
    zariGrad.addColorStop(0.3, '#f59e0b');
    zariGrad.addColorStop(0.7, '#d97706');
    zariGrad.addColorStop(1, '#92400e');
    ctx.fillStyle = zariGrad;
    ctx.fillRect(-18, munduBottomY - 8, 36, 7);

    // Kasavu Weave Motif Details (Herringbone zari lines)
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 0.8;
    for (let x = -16; x <= 16; x += 3.5) {
      ctx.beginPath();
      ctx.moveTo(x, munduBottomY - 8);
      ctx.lineTo(x + 1.5, munduBottomY - 1);
      ctx.stroke();
    }

    // Top gold thread line on Kasavu border
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-18, munduBottomY - 8);
    ctx.lineTo(18, munduBottomY - 8);
    ctx.stroke();

    // Center Gold-Pleated Flap (Kavani / Neriyaath Pleat)
    ctx.save();
    const pleatSway = clothSway * 0.35;
    const pleatGrad = ctx.createLinearGradient(-6, munduTopY, 6, munduBottomY);
    pleatGrad.addColorStop(0, '#fef08a');
    pleatGrad.addColorStop(0.5, '#f59e0b');
    pleatGrad.addColorStop(1, '#d97706');
    ctx.fillStyle = pleatGrad;

    ctx.beginPath();
    ctx.moveTo(-5 + pleatSway * 0.4, munduTopY);
    ctx.lineTo(5 + pleatSway * 0.4, munduTopY);
    ctx.lineTo(7 + pleatSway, munduBottomY - 1);
    ctx.lineTo(-7 + pleatSway, munduBottomY - 1);
    ctx.closePath();
    ctx.fill();

    // Pleat vertical gold cords
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-2 + pleatSway * 0.6, munduTopY);
    ctx.lineTo(-2 + pleatSway, munduBottomY - 1);
    ctx.moveTo(2 + pleatSway * 0.6, munduTopY);
    ctx.lineTo(2 + pleatSway, munduBottomY - 1);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Draws the ornate royal golden waist belt (Odyanam / Mechala)
   */
  private static drawOdyanamBelt(ctx: CanvasRenderingContext2D, breath: number) {
    const beltY = -52 + breath * 0.4;

    // Belt gold strap with embossed bevel
    const beltGrad = ctx.createLinearGradient(0, beltY - 4, 0, beltY + 5);
    beltGrad.addColorStop(0, '#fef08a');
    beltGrad.addColorStop(0.3, '#f59e0b');
    beltGrad.addColorStop(0.7, '#b45309');
    beltGrad.addColorStop(1, '#78350f');
    ctx.fillStyle = beltGrad;
    ctx.beginPath();
    ctx.roundRect(-19, beltY - 3, 38, 7, 3);
    ctx.fill();

    // Beaded gold edge
    ctx.fillStyle = '#fef08a';
    for (let bx = -17; bx <= 17; bx += 3) {
      ctx.beginPath();
      ctx.arc(bx, beltY - 2.5, 0.7, 0, Math.PI * 2);
      ctx.arc(bx, beltY + 3.5, 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Centerpiece Royal Brooch (Kirtimukha / Surya Medallion)
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(0, beltY + 0.5, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, beltY + 0.5, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // Central Ruby Cabochon
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(0, beltY + 0.5, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fecaca'; // Specular gleam
    ctx.beginPath();
    ctx.arc(-1, beltY - 0.5, 1, 0, Math.PI * 2);
    ctx.fill();

    // Hanging Pearl Strings from belt center (Muthu Charam)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-3, beltY + 7, 1.2, 0, Math.PI * 2);
    ctx.arc(0, beltY + 8.5, 1.4, 0, Math.PI * 2);
    ctx.arc(3, beltY + 7, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Draws the royal muscular torso with realistic volume, clavicles, and pectoral definition
   */
  private static drawTorso(
    ctx: CanvasRenderingContext2D,
    breath: number,
    microBreath: number
  ) {
    const shoulderY = -84 + breath;
    const waistY = -52 + breath * 0.4;

    // Volumetric Torso Skin Gradient (Rich golden bronze royal complexion)
    const torsoGrad = ctx.createRadialGradient(0, -68 + breath, 6, 0, -68 + breath, 30);
    torsoGrad.addColorStop(0, '#f28d44');
    torsoGrad.addColorStop(0.4, '#e0762c');
    torsoGrad.addColorStop(0.8, '#b85414');
    torsoGrad.addColorStop(1, '#833309');
    ctx.fillStyle = torsoGrad;

    // Muscular royal chest silhouette
    ctx.beginPath();
    ctx.moveTo(-16, waistY);
    ctx.bezierCurveTo(-23, -64, -25, -78 + breath, -18, shoulderY);
    ctx.bezierCurveTo(-10, shoulderY - 3, 10, shoulderY - 3, 18, shoulderY);
    ctx.bezierCurveTo(25, -78 + breath, 23, -64, 16, waistY);
    ctx.closePath();
    ctx.fill();

    // Subtle anatomical shading (Clavicles & Pectoral contour)
    ctx.strokeStyle = 'rgba(120, 53, 15, 0.35)';
    ctx.lineWidth = 1.2;

    // Clavicles (Collar bones)
    ctx.beginPath();
    ctx.moveTo(-14, shoulderY + 3);
    ctx.quadraticCurveTo(-6, shoulderY + 5, -2, shoulderY + 7);
    ctx.moveTo(14, shoulderY + 3);
    ctx.quadraticCurveTo(6, shoulderY + 5, 2, shoulderY + 7);
    ctx.stroke();

    // Pectoral muscles definition
    ctx.beginPath();
    ctx.arc(-7, -70 + breath, 7, 0.1 * Math.PI, 0.8 * Math.PI);
    ctx.arc(7, -70 + breath, 7, 0.2 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    // Sternum & Abdominal midline (Brahmasutram)
    ctx.strokeStyle = 'rgba(120, 53, 15, 0.22)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, shoulderY + 7);
    ctx.lineTo(0, waistY - 2);
    ctx.stroke();

    // Shoulder highlight glint
    ctx.fillStyle = 'rgba(254, 240, 138, 0.2)';
    ctx.beginPath();
    ctx.ellipse(-16, shoulderY + 2, 4, 2, -0.3, 0, Math.PI * 2);
    ctx.ellipse(16, shoulderY + 2, 4, 2, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Draws traditional layered Kerala jewelry:
   * 1. Palakka Mala (Leaf emerald necklace)
   * 2. Mulla Mottu (Jasmine bud gold chain)
   * 3. Royal Veera Padakkam (Heavy sun medallion)
   * 4. Poonool (Sacred golden thread across chest)
   */
  private static drawRoyalJewelry(ctx: CanvasRenderingContext2D, breath: number) {
    const neckY = -84 + breath;

    // --- Sacred Poonool (Golden thread across torso) ---
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-13, neckY + 2);
    ctx.bezierCurveTo(-6, -70 + breath, 8, -60 + breath, 15, -50 + breath * 0.4);
    ctx.stroke();

    // --- Layer 1: Choker Necklace (Nagapadam / Palakka Mala) ---
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, neckY + 1, 10, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    // Emerald Palakka leaves
    ctx.fillStyle = '#059669';
    for (let a = 0.25 * Math.PI; a <= 0.75 * Math.PI; a += 0.12 * Math.PI) {
      const lx = Math.cos(a) * 10.5;
      const ly = neckY + 1 + Math.sin(a) * 10.5;
      ctx.beginPath();
      ctx.arc(lx, ly, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Layer 2: Mulla Mottu Mala (Jasmine bud gold beads) ---
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, neckY, 15, 0.18 * Math.PI, 0.82 * Math.PI);
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    for (let a = 0.22 * Math.PI; a <= 0.78 * Math.PI; a += 0.08 * Math.PI) {
      const bx = Math.cos(a) * 15;
      const by = neckY + Math.sin(a) * 15;
      ctx.beginPath();
      ctx.arc(bx, by, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Layer 3: Royal Veera Padakkam (Heavy medallion on golden chain) ---
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, neckY - 2, 21, 0.22 * Math.PI, 0.78 * Math.PI);
    ctx.stroke();

    // Golden Padakkam Medallion
    const padakkamY = neckY + 19;
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(0, padakkamY, 6.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(0, padakkamY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Inset Ruby & Pearl drop
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(0, padakkamY, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, padakkamY + 7.5, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Draws fresh Jasmine & Red Chethi floral garland (Poomala) draped around King Mahabali
   */
  private static drawPoomalaGarland(
    ctx: CanvasRenderingContext2D,
    breath: number,
    garlandSway: number
  ) {
    const garlandY = -83 + breath;

    // Draped garland loop
    const flowerCount = 14;
    for (let i = 0; i <= flowerCount; i++) {
      const t = i / flowerCount;
      const angle = 0.15 * Math.PI + t * 0.7 * Math.PI;
      const gx = Math.cos(angle) * (18 + garlandSway * (1 - Math.abs(t - 0.5)));
      const gy = garlandY + Math.sin(angle) * 23;

      // Alternating Jasmine (White) & Chethi (Red) florets
      if (i % 3 === 0) {
        // Red Chethi floret
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(gx, gy, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fca5a5';
        ctx.beginPath();
        ctx.arc(gx - 0.5, gy - 0.5, 0.8, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Jasmine bud cluster (Mullappoo)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(gx, gy, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(gx, gy, 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /**
   * Draws the royal crimson silk Angavastram with golden zari borders and physics sway
   */
  private static drawAngavastram(
    ctx: CanvasRenderingContext2D,
    breath: number,
    clothSway: number,
    clothSway2: number
  ) {
    const shoulderY = -85 + breath;
    const waistY = -52 + breath * 0.4;

    // --- Shoulder Cross Drape (Deep Royal Vermilion) ---
    const shawlGrad = ctx.createLinearGradient(-18, shoulderY, 18, waistY);
    shawlGrad.addColorStop(0, '#991b1b');
    shawlGrad.addColorStop(0.4, '#b91c1c');
    shawlGrad.addColorStop(0.7, '#7f1d1d');
    shawlGrad.addColorStop(1, '#450a0a');
    ctx.fillStyle = shawlGrad;

    ctx.beginPath();
    ctx.moveTo(-18, shoulderY + 2);
    ctx.bezierCurveTo(-10, -68 + breath, 8, -58 + breath, 18, waistY + 2);
    ctx.lineTo(21, waistY + 5);
    ctx.bezierCurveTo(9, -54 + breath, -7, -64 + breath, -14, shoulderY - 2);
    ctx.closePath();
    ctx.fill();

    // Shawl Golden Zari Edges
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-18, shoulderY + 2);
    ctx.bezierCurveTo(-10, -68 + breath, 8, -58 + breath, 18, waistY + 2);
    ctx.stroke();

    // --- Flowing Shawl Tail Fluttering in the Wind (Back Left) ---
    const tailGrad = ctx.createLinearGradient(-18, shoulderY, -30 + clothSway, -25);
    tailGrad.addColorStop(0, '#b91c1c');
    tailGrad.addColorStop(0.6, '#991b1b');
    tailGrad.addColorStop(1, '#450a0a');
    ctx.fillStyle = tailGrad;

    ctx.beginPath();
    ctx.moveTo(-18, shoulderY + 2);
    ctx.bezierCurveTo(-28 + clothSway * 0.8, -65, -34 + clothSway * 1.4, -45, -28 + clothSway2, -26);
    ctx.lineTo(-22 + clothSway2, -28);
    ctx.bezierCurveTo(-26 + clothSway * 1.1, -46, -20, -66, -14, shoulderY - 2);
    ctx.closePath();
    ctx.fill();

    // Tail Gold Border & Tassels
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Golden fringe at shawl tip
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-28 + clothSway2, -26, 6, 2.5);
  }

  /**
   * Draws realistic arms, bracelets (Kankanams / Vanki), and expressive Mudra hands
   */
  private static drawArmsAndHands(
    ctx: CanvasRenderingContext2D,
    pose: MahabaliPose,
    breath: number,
    animTick: number
  ) {
    const shoulderY = -82 + breath;
    const armBob = Math.sin(animTick * 0.08) * 2;

    if (pose === 'bless' || pose === 'celebrate') {
      // --- Left Arm (Regally resting on hip / thigh) ---
      const leftArmGrad = ctx.createLinearGradient(-16, shoulderY, -24, -45);
      leftArmGrad.addColorStop(0, '#e0762c');
      leftArmGrad.addColorStop(0.6, '#c85e1b');
      leftArmGrad.addColorStop(1, '#9a3e0b');
      ctx.fillStyle = leftArmGrad;

      ctx.beginPath();
      ctx.moveTo(-18, shoulderY);
      ctx.bezierCurveTo(-28, -64, -26, -50, -22, -42);
      ctx.lineTo(-16, -44);
      ctx.bezierCurveTo(-20, -52, -22, -64, -13, shoulderY + 3);
      ctx.closePath();
      ctx.fill();

      // Left Hand resting (Katakamukha / relaxed fist)
      ctx.beginPath();
      ctx.ellipse(-20, -40, 4.5, 4, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Left Armlets & Bangles
      this.drawArmletAndBangles(ctx, -23, -64, -19, -46);

      // --- Right Arm (Raised in Abhaya Mudra / Blessing of Prosperity) ---
      const rightArmGrad = ctx.createLinearGradient(14, shoulderY, 26, -95 + armBob);
      rightArmGrad.addColorStop(0, '#e0762c');
      rightArmGrad.addColorStop(0.5, '#c85e1b');
      rightArmGrad.addColorStop(1, '#f28d44');
      ctx.fillStyle = rightArmGrad;

      // Forearm raised
      ctx.beginPath();
      ctx.moveTo(15, shoulderY + 2);
      ctx.quadraticCurveTo(27, -70, 24, -92 + armBob);
      ctx.lineTo(19, -92 + armBob);
      ctx.quadraticCurveTo(20, -72, 11, shoulderY + 5);
      ctx.closePath();
      ctx.fill();

      // Blessing Palm (Abhaya Mudra) with fingers
      const palmY = -97 + armBob;
      ctx.fillStyle = '#ea7a32';
      ctx.beginPath();
      ctx.ellipse(22, palmY, 5, 6.5, 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Render 4 fingers raised gracefully & thumb
      ctx.fillStyle = '#f28d44';
      ctx.beginPath();
      ctx.roundRect(18.5, palmY - 8, 2, 6, 1);
      ctx.roundRect(21, palmY - 9, 2, 7, 1);
      ctx.roundRect(23.5, palmY - 8.5, 2, 6.5, 1);
      ctx.roundRect(26, palmY - 7.5, 1.8, 5.5, 1);
      ctx.fill();

      // Red Henna / Sandalwood tint on palm center (Mailanchi / Kumkum mark)
      ctx.fillStyle = 'rgba(220, 38, 38, 0.6)';
      ctx.beginPath();
      ctx.arc(22, palmY, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Right Armlets & Bangles
      this.drawArmletAndBangles(ctx, 22, -68, 22, -88 + armBob);
    } else if (pose === 'row') {
      // Rowing grip pose
      const armGrad = ctx.createLinearGradient(0, shoulderY, 0, -60);
      armGrad.addColorStop(0, '#e0762c');
      armGrad.addColorStop(1, '#9a3e0b');
      ctx.fillStyle = armGrad;

      const oarRowOffset = Math.sin(animTick * 0.2) * 6;

      // Left Arm
      ctx.beginPath();
      ctx.moveTo(-16, shoulderY);
      ctx.lineTo(-28, -64 + oarRowOffset);
      ctx.lineTo(-23, -61 + oarRowOffset);
      ctx.lineTo(-11, shoulderY + 4);
      ctx.closePath();
      ctx.fill();

      // Right Arm
      ctx.beginPath();
      ctx.moveTo(16, shoulderY);
      ctx.lineTo(28, -64 + oarRowOffset);
      ctx.lineTo(23, -61 + oarRowOffset);
      ctx.lineTo(11, shoulderY + 4);
      ctx.closePath();
      ctx.fill();

      this.drawArmletAndBangles(ctx, -22, -72, -26, -63 + oarRowOffset);
      this.drawArmletAndBangles(ctx, 22, -72, 26, -63 + oarRowOffset);
    } else {
      // Regal Standing / Greeting Pose
      const armGrad = ctx.createLinearGradient(0, shoulderY, 0, -40);
      armGrad.addColorStop(0, '#e0762c');
      armGrad.addColorStop(0.6, '#c85e1b');
      armGrad.addColorStop(1, '#9a3e0b');
      ctx.fillStyle = armGrad;

      // Left arm
      ctx.beginPath();
      ctx.moveTo(-17, shoulderY);
      ctx.bezierCurveTo(-26, -62, -24, -48, -20, -40);
      ctx.lineTo(-15, -41);
      ctx.bezierCurveTo(-18, -50, -20, -62, -12, shoulderY + 3);
      ctx.closePath();
      ctx.fill();

      // Right arm
      ctx.beginPath();
      ctx.moveTo(17, shoulderY);
      ctx.bezierCurveTo(26, -62, 24, -48, 20, -40);
      ctx.lineTo(15, -41);
      ctx.bezierCurveTo(18, -50, 20, -62, 12, shoulderY + 3);
      ctx.closePath();
      ctx.fill();

      // Hands
      ctx.fillStyle = '#ea7a32';
      ctx.beginPath();
      ctx.ellipse(-18, -38, 4, 3.5, 0, 0, Math.PI * 2);
      ctx.ellipse(18, -38, 4, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      this.drawArmletAndBangles(ctx, -22, -65, -18, -43);
      this.drawArmletAndBangles(ctx, 22, -65, 18, -43);
    }
  }

  /**
   * Helper to draw golden Vanki armlets and wrist Kankanams
   */
  private static drawArmletAndBangles(
    ctx: CanvasRenderingContext2D,
    vankiX: number,
    vankiY: number,
    wristX: number,
    wristY: number
  ) {
    // Upper Armlet (Tholvalaya / Vanki with serpent motif)
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(vankiX, vankiY, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#dc2626'; // Ruby gem
    ctx.beginPath();
    ctx.arc(vankiX, vankiY, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Wrist Bangles (Kankanams)
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(wristX - 2.5, wristY - 1.5, 5, 3.5);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(wristX - 2.5, wristY, 5, 1);
  }

  /**
   * Draws realistic Head, Facial Anatomy, Royal Mustache, Eyes & Sacred Tilak
   */
  private static drawHeadAndFace(
    ctx: CanvasRenderingContext2D,
    breath: number,
    animTick: number
  ) {
    const headY = -94 + breath;

    // --- Neck with Sternocleidomastoid shading ---
    const neckGrad = ctx.createLinearGradient(-6, headY - 4, 6, headY + 12);
    neckGrad.addColorStop(0, '#b85414');
    neckGrad.addColorStop(0.5, '#d97736');
    neckGrad.addColorStop(1, '#9a3e0b');
    ctx.fillStyle = neckGrad;
    ctx.beginPath();
    ctx.moveTo(-6, headY);
    ctx.lineTo(-7, headY + 12);
    ctx.lineTo(7, headY + 12);
    ctx.lineTo(6, headY);
    ctx.closePath();
    ctx.fill();

    // --- Volumetric Face Gradient ---
    const faceGrad = ctx.createRadialGradient(0, headY - 7, 4, 0, headY - 6, 17);
    faceGrad.addColorStop(0, '#fbb06e');
    faceGrad.addColorStop(0.4, '#e8843c');
    faceGrad.addColorStop(0.8, '#c85e1b');
    faceGrad.addColorStop(1, '#833309');
    ctx.fillStyle = faceGrad;

    // Noble rounded jawline & benevolent facial structure
    ctx.beginPath();
    ctx.ellipse(0, headY - 7, 13.5, 15.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ear Lobes & Ornate Golden Kundalams (Earrings)
    this.drawKundalamEarrings(ctx, headY, animTick);

    // --- Expressive, Benevolent Almond Eyes ---
    this.drawEyesAndBrows(ctx, headY);

    // --- Noble Nose with highlights ---
    ctx.strokeStyle = 'rgba(120, 53, 15, 0.6)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(0, headY - 12);
    ctx.lineTo(0.5, headY - 5.5);
    ctx.quadraticCurveTo(2.5, headY - 4.5, 0, headY - 4);
    ctx.stroke();

    // Nose bridge highlight
    ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, headY - 8, 1, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nostril curves
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(-2.2, headY - 4.2, 0.9, 0, Math.PI * 2);
    ctx.arc(2.2, headY - 4.2, 0.9, 0, Math.PI * 2);
    ctx.fill();

    // --- Traditional Kerala Royal Mustache (Komban Meesa) ---
    this.drawKombanMustache(ctx, headY);

    // --- Warm Smiling Lips ---
    ctx.fillStyle = '#b94723';
    ctx.beginPath();
    ctx.ellipse(0, headY - 2.2, 4.5, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#6c2409';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-4, headY - 2.2);
    ctx.quadraticCurveTo(0, headY - 1.2, 4, headY - 2.2);
    ctx.stroke();

    // Subtle gentle smile dimples
    ctx.fillStyle = 'rgba(120, 53, 15, 0.3)';
    ctx.beginPath();
    ctx.arc(-5.5, headY - 2.8, 0.8, 0, Math.PI * 2);
    ctx.arc(5.5, headY - 2.8, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // --- Sacred Chandan & Kumkum Thilakam on Forehead ---
    this.drawSacredThilakam(ctx, headY);
  }

  /**
   * Draws realistic eyes, sculpted brows, and natural pupil gleams
   */
  private static drawEyesAndBrows(ctx: CanvasRenderingContext2D, headY: number) {
    const eyeY = headY - 9;

    // Left Eye & Right Eye
    const renderEye = (ex: number) => {
      // Eye White (Sclera) with almond shape
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.ellipse(ex, eyeY, 3.4, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Warm Hazel-Brown Iris
      const irisGrad = ctx.createRadialGradient(ex, eyeY, 0.5, ex, eyeY, 1.8);
      irisGrad.addColorStop(0, '#b45309');
      irisGrad.addColorStop(0.7, '#451a03');
      irisGrad.addColorStop(1, '#1e0c04');
      ctx.fillStyle = irisGrad;
      ctx.beginPath();
      ctx.arc(ex, eyeY, 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Deep Pupil
      ctx.fillStyle = '#0f0502';
      ctx.beginPath();
      ctx.arc(ex, eyeY, 0.9, 0, Math.PI * 2);
      ctx.fill();

      // Glossy Eye Reflection Highlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ex - 0.7, eyeY - 0.7, 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Upper Eyelid & Eyelash Line
      ctx.strokeStyle = '#261205';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(ex, eyeY + 0.2, 3.4, 1.1 * Math.PI, 1.9 * Math.PI);
      ctx.stroke();

      // Benevolent sculpted Eyebrow
      ctx.strokeStyle = '#1c0d06';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(ex, eyeY - 2.5, 4, 1.15 * Math.PI, 1.85 * Math.PI);
      ctx.stroke();
    };

    renderEye(-5.5);
    renderEye(5.5);
  }

  /**
   * Draws the majestic Kerala royal mustache with fine hair texture and tapered curved tips
   */
  private static drawKombanMustache(ctx: CanvasRenderingContext2D, headY: number) {
    const mustacheY = headY - 4;

    const mustacheGrad = ctx.createLinearGradient(0, mustacheY - 3, 0, mustacheY + 4);
    mustacheGrad.addColorStop(0, '#2e1408');
    mustacheGrad.addColorStop(0.5, '#170904');
    mustacheGrad.addColorStop(1, '#0c0401');
    ctx.fillStyle = mustacheGrad;

    // Sculpted curved mustache wings
    ctx.beginPath();
    ctx.moveTo(-13, mustacheY - 4); // Left tip curve
    ctx.quadraticCurveTo(-7, mustacheY + 1.5, 0, mustacheY - 0.5);
    ctx.quadraticCurveTo(7, mustacheY + 1.5, 13, mustacheY - 4); // Right tip curve
    ctx.quadraticCurveTo(15, mustacheY - 7, 12, mustacheY - 5.5);
    ctx.quadraticCurveTo(6, mustacheY - 1, 0, mustacheY - 2.5);
    ctx.quadraticCurveTo(-6, mustacheY - 1, -12, mustacheY - 5.5);
    ctx.quadraticCurveTo(-15, mustacheY - 7, -13, mustacheY - 4);
    ctx.closePath();
    ctx.fill();

    // Fine hair sheen highlight
    ctx.strokeStyle = 'rgba(180, 83, 9, 0.4)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-10, mustacheY - 3);
    ctx.quadraticCurveTo(0, mustacheY + 0.5, 10, mustacheY - 3);
    ctx.stroke();
  }

  /**
   * Draws traditional Chandan Chandrakala and Kumkum Thilakam on the forehead
   */
  private static drawSacredThilakam(ctx: CanvasRenderingContext2D, headY: number) {
    const thilakY = headY - 15;

    // Sandalwood White Chandrakala (Crescent moon curve)
    ctx.strokeStyle = '#fef9c3';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, thilakY - 1, 4.5, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();

    // Sacred Red Kumkum Bindi (Center)
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(0, thilakY, 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Subtle golden glow around bindi
    ctx.fillStyle = 'rgba(254, 240, 138, 0.6)';
    ctx.beginPath();
    ctx.arc(0, thilakY - 0.5, 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Draws traditional heavy golden earrings (Kundalam / Jhumka)
   */
  private static drawKundalamEarrings(
    ctx: CanvasRenderingContext2D,
    headY: number,
    animTick: number
  ) {
    const earSway = Math.sin(animTick * 0.08) * 0.8;

    const renderKundalam = (kx: number) => {
      // Golden stud on earlobe
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(kx, headY - 5, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Ruby center
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(kx, headY - 5, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Hanging bell jhumka with pearl fringe
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(kx - 3 + earSway * 0.3, headY - 1);
      ctx.lineTo(kx + 3 + earSway * 0.3, headY - 1);
      ctx.lineTo(kx + 4 + earSway, headY + 3);
      ctx.lineTo(kx - 4 + earSway, headY + 3);
      ctx.closePath();
      ctx.fill();

      // Mini pearls at bottom of earring
      ctx.fillStyle = '#ffffff';
      for (let p = -3; p <= 3; p += 2) {
        ctx.beginPath();
        ctx.arc(kx + p + earSway, headY + 4.2, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    renderKundalam(-14);
    renderKundalam(14);
  }

  /**
   * Draws the magnificent Kathakali / Kerala Temple Royal Kireedam (Crown)
   * with multi-tiered filigree, ruby/emerald insets, and Mayilpeeli (Peacock Feather)
   */
  private static drawKireedamCrown(
    ctx: CanvasRenderingContext2D,
    breath: number,
    animTick: number
  ) {
    const crownBaseY = -112 + breath;

    // --- Crown Golden Headband (Patta Band) ---
    const bandGrad = ctx.createLinearGradient(-15, crownBaseY, 15, crownBaseY + 6);
    bandGrad.addColorStop(0, '#fef08a');
    bandGrad.addColorStop(0.3, '#f59e0b');
    bandGrad.addColorStop(0.7, '#d97706');
    bandGrad.addColorStop(1, '#78350f');
    ctx.fillStyle = bandGrad;
    ctx.beginPath();
    ctx.roundRect(-15, crownBaseY - 2, 30, 7, 2);
    ctx.fill();

    // Pearl beading along crown rim
    ctx.fillStyle = '#ffffff';
    for (let px = -13; px <= 13; px += 2.8) {
      ctx.beginPath();
      ctx.arc(px, crownBaseY + 4, 0.9, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Tier 1: Wide Arched Golden Base (Kireedam Lower Tier) ---
    const tier1Grad = ctx.createLinearGradient(0, crownBaseY - 16, 0, crownBaseY);
    tier1Grad.addColorStop(0, '#fef08a');
    tier1Grad.addColorStop(0.4, '#fbbf24');
    tier1Grad.addColorStop(0.8, '#d97706');
    tier1Grad.addColorStop(1, '#92400e');
    ctx.fillStyle = tier1Grad;

    ctx.beginPath();
    ctx.moveTo(-15, crownBaseY - 2);
    ctx.bezierCurveTo(-17, crownBaseY - 14, -10, crownBaseY - 20, 0, crownBaseY - 22);
    ctx.bezierCurveTo(10, crownBaseY - 20, 17, crownBaseY - 14, 15, crownBaseY - 2);
    ctx.closePath();
    ctx.fill();

    // Filigree engraving & Ruby centerpiece
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.arc(0, crownBaseY - 11, 3.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, crownBaseY - 11, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Side emerald insets
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.arc(-8, crownBaseY - 9, 2.2, 0, Math.PI * 2);
    ctx.arc(8, crownBaseY - 9, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // --- Tier 2: Tall Conical Spire (Kalasam Tier) ---
    const tier2Grad = ctx.createLinearGradient(0, crownBaseY - 38, 0, crownBaseY - 20);
    tier2Grad.addColorStop(0, '#fef08a');
    tier2Grad.addColorStop(0.5, '#f59e0b');
    tier2Grad.addColorStop(1, '#b45309');
    ctx.fillStyle = tier2Grad;

    ctx.beginPath();
    ctx.moveTo(-8, crownBaseY - 20);
    ctx.bezierCurveTo(-9, crownBaseY - 28, -4, crownBaseY - 36, 0, crownBaseY - 40);
    ctx.bezierCurveTo(4, crownBaseY - 36, 9, crownBaseY - 28, 8, crownBaseY - 20);
    ctx.closePath();
    ctx.fill();

    // Top Kalasham Finial (Golden temple pot finial)
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, crownBaseY - 41, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff'; // Specular pinnacle glint
    ctx.beginPath();
    ctx.arc(-0.8, crownBaseY - 42, 1, 0, Math.PI * 2);
    ctx.fill();

    // --- Mayilpeeli (Traditional Peacock Feather on Crown) ---
    this.drawMayilpeeli(ctx, 4, crownBaseY - 36, animTick);
  }

  /**
   * Draws the realistic Mayilpeeli (Peacock Feather) swaying gracefully atop the crown
   */
  private static drawMayilpeeli(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    animTick: number
  ) {
    ctx.save();
    ctx.translate(x, y);
    const featherSway = Math.sin(animTick * 0.07) * 0.08;
    ctx.rotate(0.35 + featherSway);

    // Feather Quill Stem
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.quadraticCurveTo(2, -10, 4, -22);
    ctx.stroke();

    // Outer Wispy Green & Blue Barbules
    const eyeY = -16;
    const eyeGrad = ctx.createRadialGradient(2, eyeY, 1, 2, eyeY, 8);
    eyeGrad.addColorStop(0, '#0284c7'); // Cyan core
    eyeGrad.addColorStop(0.35, '#0369a1'); // Deep blue
    eyeGrad.addColorStop(0.65, '#047857'); // Emerald green
    eyeGrad.addColorStop(0.9, '#ca8a04'); // Golden rim
    eyeGrad.addColorStop(1, 'rgba(202, 138, 4, 0)');
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.ellipse(2, eyeY, 7.5, 5, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Inner Peacock Eye (Vibrant Iridescent Blue & Gold)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(2, eyeY, 3.5, 2.5, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(1.5, eyeY, 1.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
