const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, 'store-assets');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Colors
const colors = {
  bg: '#050505',
  bgCard: '#0a0a0a',
  primary: '#21ff1e',
  primaryDim: 'rgba(33, 255, 30, 0.15)',
  text: '#f0f0f0',
  textMuted: '#888888',
  border: '#1a1a1a',
  yellow: '#fbbf24'
};

// Helper to draw rounded rect
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Screenshot 1: Income Calculator (1280x800)
async function createScreenshot1() {
  const width = 1280;
  const height = 800;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, width, height);

  // Draw browser chrome mockup
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(0, 0, width, 60);

  // Browser dots
  ctx.fillStyle = '#ff5f56';
  ctx.beginPath();
  ctx.arc(25, 30, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffbd2e';
  ctx.beginPath();
  ctx.arc(50, 30, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#27ca3f';
  ctx.beginPath();
  ctx.arc(75, 30, 7, 0, Math.PI * 2);
  ctx.fill();

  // Extension popup mockup (centered)
  const popupWidth = 360;
  const popupHeight = 580;
  const popupX = (width - popupWidth) / 2;
  const popupY = 100;

  // Popup shadow
  ctx.shadowColor = 'rgba(33, 255, 30, 0.3)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 10;

  // Popup background
  ctx.fillStyle = colors.bg;
  roundRect(ctx, popupX, popupY, popupWidth, popupHeight, 12);
  ctx.fill();

  ctx.shadowBlur = 0;

  // Header
  ctx.fillStyle = colors.primary;
  ctx.font = 'bold 24px Arial';
  ctx.fillText('Income Calc', popupX + 20, popupY + 40);

  ctx.fillStyle = colors.textMuted;
  ctx.font = '12px Arial';
  ctx.fillText('Precision Annual Projections', popupX + 20, popupY + 58);

  // Tabs
  const tabY = popupY + 80;
  // Active tab
  ctx.fillStyle = colors.primaryDim;
  roundRect(ctx, popupX + 20, tabY, 150, 36, 8);
  ctx.fill();
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = colors.primary;
  ctx.font = '14px Arial';
  ctx.fillText('Income', popupX + 70, tabY + 23);

  // Inactive tab
  ctx.fillStyle = colors.bgCard;
  roundRect(ctx, popupX + 180, tabY, 150, 36, 8);
  ctx.fill();
  ctx.fillStyle = colors.textMuted;
  ctx.fillText('Payment', popupX + 225, tabY + 23);

  // Results card
  const cardY = tabY + 60;
  ctx.fillStyle = colors.bgCard;
  roundRect(ctx, popupX + 20, cardY, popupWidth - 40, 300, 12);
  ctx.fill();

  // Results header
  ctx.fillStyle = colors.primaryDim;
  roundRect(ctx, popupX + 20, cardY, popupWidth - 40, 45, 12);
  ctx.fill();

  ctx.fillStyle = colors.primary;
  ctx.font = 'bold 14px Arial';
  ctx.fillText('Projection Ready', popupX + 35, cardY + 28);

  ctx.fillStyle = colors.primaryDim;
  roundRect(ctx, popupX + 250, cardY + 10, 70, 25, 6);
  ctx.fill();
  ctx.fillStyle = colors.primary;
  ctx.font = '12px Arial';
  ctx.fillText('245 Days', popupX + 258, cardY + 27);

  // Hero stat
  const heroY = cardY + 65;
  ctx.fillStyle = 'rgba(33, 255, 30, 0.1)';
  roundRect(ctx, popupX + 35, heroY, popupWidth - 70, 100, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(33, 255, 30, 0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = colors.textMuted;
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Projected Annual Income', popupX + popupWidth/2, heroY + 25);

  ctx.fillStyle = colors.primary;
  ctx.font = 'bold 42px Arial';
  ctx.fillText('$78,450', popupX + popupWidth/2, heroY + 70);

  ctx.fillStyle = colors.textMuted;
  ctx.font = '11px Arial';
  ctx.fillText('Based on 245 days from Jan 1, 2025', popupX + popupWidth/2, heroY + 90);

  ctx.textAlign = 'left';

  // Stats grid
  const statsY = heroY + 120;

  // Monthly
  ctx.fillStyle = '#111';
  roundRect(ctx, popupX + 35, statsY, 130, 60, 10);
  ctx.fill();
  ctx.fillStyle = colors.textMuted;
  ctx.font = '10px Arial';
  ctx.fillText('MONTHLY', popupX + 75, statsY + 22);
  ctx.fillStyle = colors.text;
  ctx.font = 'bold 18px Arial';
  ctx.fillText('$6,537', popupX + 65, statsY + 45);

  // Weekly
  ctx.fillStyle = '#111';
  roundRect(ctx, popupX + 175, statsY, 130, 60, 10);
  ctx.fill();
  ctx.fillStyle = colors.textMuted;
  ctx.font = '10px Arial';
  ctx.fillText('WEEKLY', popupX + 218, statsY + 22);
  ctx.fillStyle = colors.text;
  ctx.font = 'bold 18px Arial';
  ctx.fillText('$1,508', popupX + 208, statsY + 45);

  // Feature callouts on sides
  ctx.fillStyle = colors.text;
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'right';
  ctx.fillText('Works Offline', popupX - 40, popupY + 150);
  ctx.font = '13px Arial';
  ctx.fillStyle = colors.textMuted;
  ctx.fillText('No internet required', popupX - 40, popupY + 172);

  ctx.fillText('Data Stays Local', popupX - 40, popupY + 230);
  ctx.font = 'bold 16px Arial';
  ctx.fillStyle = colors.text;
  ctx.fillText('100% Private', popupX - 40, popupY + 208);

  ctx.textAlign = 'left';
  ctx.fillStyle = colors.text;
  ctx.font = 'bold 16px Arial';
  ctx.fillText('Vehicle Calculator', popupX + popupWidth + 40, popupY + 150);
  ctx.font = '13px Arial';
  ctx.fillStyle = colors.textMuted;
  ctx.fillText('Tax, fees, trade-in', popupX + popupWidth + 40, popupY + 172);

  ctx.fillStyle = colors.text;
  ctx.font = 'bold 16px Arial';
  ctx.fillText('Affordability Check', popupX + popupWidth + 40, popupY + 208);
  ctx.font = '13px Arial';
  ctx.fillStyle = colors.textMuted;
  ctx.fillText('12% PTI rule built-in', popupX + popupWidth + 40, popupY + 230);

  // Bottom tagline
  ctx.fillStyle = colors.primary;
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Income Calculator Pro', width/2, height - 60);
  ctx.fillStyle = colors.textMuted;
  ctx.font = '16px Arial';
  ctx.fillText('Project your annual income in seconds', width/2, height - 32);

  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(outputDir, 'screenshot-1-income.png'), buffer);
  console.log('Created: screenshot-1-income.png (1280x800)');
}

// Screenshot 2: Payment Calculator (1280x800)
async function createScreenshot2() {
  const width = 1280;
  const height = 800;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, width, height);

  // Draw browser chrome mockup
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(0, 0, width, 60);

  // Browser dots
  ctx.fillStyle = '#ff5f56';
  ctx.beginPath();
  ctx.arc(25, 30, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffbd2e';
  ctx.beginPath();
  ctx.arc(50, 30, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#27ca3f';
  ctx.beginPath();
  ctx.arc(75, 30, 7, 0, Math.PI * 2);
  ctx.fill();

  // Extension popup mockup (centered)
  const popupWidth = 360;
  const popupHeight = 580;
  const popupX = (width - popupWidth) / 2;
  const popupY = 100;

  // Popup shadow
  ctx.shadowColor = 'rgba(33, 255, 30, 0.3)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 10;

  // Popup background
  ctx.fillStyle = colors.bg;
  roundRect(ctx, popupX, popupY, popupWidth, popupHeight, 12);
  ctx.fill();

  ctx.shadowBlur = 0;

  // Header
  ctx.fillStyle = colors.primary;
  ctx.font = 'bold 24px Arial';
  ctx.fillText('Income Calc', popupX + 20, popupY + 40);

  // Tabs
  const tabY = popupY + 80;
  // Inactive tab
  ctx.fillStyle = colors.bgCard;
  roundRect(ctx, popupX + 20, tabY, 150, 36, 8);
  ctx.fill();
  ctx.fillStyle = colors.textMuted;
  ctx.font = '14px Arial';
  ctx.fillText('Income', popupX + 70, tabY + 23);

  // Active tab
  ctx.fillStyle = colors.primaryDim;
  roundRect(ctx, popupX + 180, tabY, 150, 36, 8);
  ctx.fill();
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = colors.primary;
  ctx.fillText('Payment', popupX + 225, tabY + 23);

  // Payment results
  const cardY = tabY + 60;

  // Hero stat - monthly payment
  ctx.fillStyle = 'rgba(33, 255, 30, 0.1)';
  roundRect(ctx, popupX + 20, cardY, popupWidth - 40, 110, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(33, 255, 30, 0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = colors.textMuted;
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Monthly Payment', popupX + popupWidth/2, cardY + 25);

  ctx.fillStyle = colors.primary;
  ctx.font = 'bold 38px Arial';
  ctx.fillText('$487', popupX + popupWidth/2, cardY + 65);
  ctx.fillStyle = colors.textMuted;
  ctx.font = '16px Arial';
  ctx.fillText('/mo', popupX + popupWidth/2 + 55, cardY + 65);

  ctx.fillStyle = colors.primary;
  ctx.font = '11px Arial';
  ctx.fillText('Within budget (max $654/mo)', popupX + popupWidth/2, cardY + 95);

  ctx.textAlign = 'left';

  // Stats grid
  const statsY = cardY + 130;

  // Amount Financed
  ctx.fillStyle = '#111';
  roundRect(ctx, popupX + 20, statsY, 150, 55, 10);
  ctx.fill();
  ctx.fillStyle = colors.textMuted;
  ctx.font = '9px Arial';
  ctx.fillText('AMOUNT FINANCED', popupX + 45, statsY + 18);
  ctx.fillStyle = colors.text;
  ctx.font = 'bold 16px Arial';
  ctx.fillText('$24,500', popupX + 55, statsY + 40);

  // Sales Tax
  ctx.fillStyle = '#111';
  roundRect(ctx, popupX + 180, statsY, 150, 55, 10);
  ctx.fill();
  ctx.fillStyle = colors.textMuted;
  ctx.font = '9px Arial';
  ctx.fillText('SALES TAX', popupX + 220, statsY + 18);
  ctx.fillStyle = colors.text;
  ctx.font = 'bold 16px Arial';
  ctx.fillText('$1,470', popupX + 220, statsY + 40);

  // Total Interest
  ctx.fillStyle = '#111';
  roundRect(ctx, popupX + 20, statsY + 65, 150, 55, 10);
  ctx.fill();
  ctx.fillStyle = colors.textMuted;
  ctx.font = '9px Arial';
  ctx.fillText('TOTAL INTEREST', popupX + 50, statsY + 83);
  ctx.fillStyle = colors.yellow;
  ctx.font = 'bold 16px Arial';
  ctx.fillText('$4,720', popupX + 58, statsY + 105);

  // Total Cost
  ctx.fillStyle = '#111';
  roundRect(ctx, popupX + 180, statsY + 65, 150, 55, 10);
  ctx.fill();
  ctx.fillStyle = colors.textMuted;
  ctx.font = '9px Arial';
  ctx.fillText('TOTAL COST', popupX + 215, statsY + 83);
  ctx.fillStyle = colors.text;
  ctx.font = 'bold 16px Arial';
  ctx.fillText('$34,220', popupX + 212, statsY + 105);

  // Features on sides
  ctx.fillStyle = colors.text;
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'right';
  ctx.fillText('Trade-In Value', popupX - 40, popupY + 150);
  ctx.font = '13px Arial';
  ctx.fillStyle = colors.textMuted;
  ctx.fillText('Reduces loan amount', popupX - 40, popupY + 172);

  ctx.fillText('Dealer Fees', popupX - 40, popupY + 230);
  ctx.font = 'bold 16px Arial';
  ctx.fillStyle = colors.text;
  ctx.fillText('Sales Tax', popupX - 40, popupY + 208);

  ctx.textAlign = 'left';
  ctx.fillStyle = colors.text;
  ctx.font = 'bold 16px Arial';
  ctx.fillText('36-84 Month Terms', popupX + popupWidth + 40, popupY + 150);
  ctx.font = '13px Arial';
  ctx.fillStyle = colors.textMuted;
  ctx.fillText('Compare options', popupX + popupWidth + 40, popupY + 172);

  ctx.fillStyle = colors.text;
  ctx.font = 'bold 16px Arial';
  ctx.fillText('Budget Check', popupX + popupWidth + 40, popupY + 208);
  ctx.font = '13px Arial';
  ctx.fillStyle = colors.textMuted;
  ctx.fillText('Based on your income', popupX + popupWidth + 40, popupY + 230);

  // Bottom tagline
  ctx.fillStyle = colors.primary;
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Vehicle Payment Calculator', width/2, height - 60);
  ctx.fillStyle = colors.textMuted;
  ctx.font = '16px Arial';
  ctx.fillText('Tax, fees, and trade-in included', width/2, height - 32);

  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(outputDir, 'screenshot-2-payment.png'), buffer);
  console.log('Created: screenshot-2-payment.png (1280x800)');
}

// Promotional Tile (440x280)
async function createPromoTile() {
  const width = 440;
  const height = 280;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#0a0a0a');
  gradient.addColorStop(1, '#050505');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Decorative glow
  ctx.fillStyle = 'rgba(33, 255, 30, 0.1)';
  ctx.beginPath();
  ctx.arc(width - 50, 50, 150, 0, Math.PI * 2);
  ctx.fill();

  // Icon placeholder (circle with $ sign)
  ctx.fillStyle = colors.primaryDim;
  ctx.beginPath();
  ctx.arc(70, 100, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = colors.primary;
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('$', 70, 115);

  // Title
  ctx.textAlign = 'left';
  ctx.fillStyle = colors.text;
  ctx.font = 'bold 28px Arial';
  ctx.fillText('Income', 130, 85);
  ctx.fillText('Calculator Pro', 130, 118);

  // Features
  ctx.fillStyle = colors.primary;
  ctx.font = '14px Arial';
  const features = [
    '✓ Project annual income from YTD',
    '✓ Vehicle payment calculator',
    '✓ Works offline'
  ];

  features.forEach((feature, i) => {
    ctx.fillText(feature, 40, 180 + i * 24);
  });

  // Bottom branding
  ctx.fillStyle = colors.textMuted;
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('autolytiqs.com', width/2, height - 20);

  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(outputDir, 'promo-tile-440x280.png'), buffer);
  console.log('Created: promo-tile-440x280.png (440x280)');
}

// Marquee Image (1400x560) - Optional
async function createMarquee() {
  const width = 1400;
  const height = 560;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#0a0a0a');
  gradient.addColorStop(1, '#050505');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Decorative elements
  ctx.fillStyle = 'rgba(33, 255, 30, 0.05)';
  ctx.beginPath();
  ctx.arc(200, 280, 300, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(1200, 280, 250, 0, Math.PI * 2);
  ctx.fill();

  // Title
  ctx.fillStyle = colors.primary;
  ctx.font = 'bold 64px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Income Calculator Pro', width/2, 180);

  // Subtitle
  ctx.fillStyle = colors.text;
  ctx.font = '28px Arial';
  ctx.fillText('Project your annual income • Calculate vehicle payments', width/2, 240);

  // Features row
  ctx.fillStyle = colors.textMuted;
  ctx.font = '20px Arial';
  const features = ['Works Offline', 'Tax & Fees Included', '100% Private', 'Free Forever'];
  const featureWidth = width / (features.length + 1);

  features.forEach((feature, i) => {
    const x = featureWidth * (i + 1);

    // Feature box
    ctx.fillStyle = colors.bgCard;
    roundRect(ctx, x - 80, 300, 160, 80, 12);
    ctx.fill();
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Checkmark
    ctx.fillStyle = colors.primary;
    ctx.font = 'bold 24px Arial';
    ctx.fillText('✓', x, 340);

    // Text
    ctx.fillStyle = colors.text;
    ctx.font = '14px Arial';
    ctx.fillText(feature, x, 365);
  });

  // CTA
  ctx.fillStyle = colors.primary;
  roundRect(ctx, width/2 - 120, 440, 240, 50, 25);
  ctx.fill();

  ctx.fillStyle = '#000';
  ctx.font = 'bold 18px Arial';
  ctx.fillText('Add to Chrome - Free', width/2, 472);

  // Branding
  ctx.fillStyle = colors.textMuted;
  ctx.font = '14px Arial';
  ctx.fillText('autolytiqs.com', width/2, height - 30);

  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(outputDir, 'marquee-1400x560.png'), buffer);
  console.log('Created: marquee-1400x560.png (1400x560)');
}

// Run all
async function main() {
  console.log('Generating Chrome Web Store assets...\n');
  await createScreenshot1();
  await createScreenshot2();
  await createPromoTile();
  await createMarquee();
  console.log('\nAll assets created in:', outputDir);
}

main().catch(console.error);
