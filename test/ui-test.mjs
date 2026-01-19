import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5000';

// Define viewport sizes for testing
const viewports = [
  { name: 'mobile-small', width: 375, height: 667, device: 'iPhone SE' },
  { name: 'mobile-large', width: 414, height: 896, device: 'iPhone 11 Pro Max' },
  { name: 'tablet-portrait', width: 768, height: 1024, device: 'iPad' },
  { name: 'tablet-landscape', width: 1024, height: 768, device: 'iPad Landscape' },
  { name: 'desktop-small', width: 1280, height: 800, device: 'Small Laptop' },
  { name: 'desktop-medium', width: 1440, height: 900, device: 'Medium Desktop' },
  { name: 'desktop-large', width: 1920, height: 1080, device: 'Full HD Desktop' },
];

// Define pages to test
const pages = [
  { path: '/', name: 'Home' },
  { path: '/calculator', name: 'Calculator' },
  { path: '/smart-money', name: 'Budget Planner' },
  { path: '/housing', name: 'Housing' },
  { path: '/auto', name: 'Auto Guide' },
  { path: '/blog', name: 'Blog' },
  { path: '/login', name: 'Login' },
  { path: '/signup', name: 'Signup' },
];

// Create screenshots directory
const screenshotsDir = './test/screenshots';
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Test results storage
const results = {
  viewability: [],
  functionality: [],
  ux: [],
  engagement: [],
  issues: [],
  suggestions: [],
};

async function runTests() {
  console.log('🚀 Starting UI/UX Testing with Puppeteer\n');
  console.log('=' .repeat(60));

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    // Test each viewport
    for (const viewport of viewports) {
      console.log(`\n📱 Testing viewport: ${viewport.name} (${viewport.width}x${viewport.height})`);
      console.log('-'.repeat(50));

      const page = await browser.newPage();
      await page.setViewport({ width: viewport.width, height: viewport.height });

      // Test each page
      for (const pageInfo of pages) {
        console.log(`  📄 Testing: ${pageInfo.name} (${pageInfo.path})`);

        try {
          const startTime = Date.now();
          await page.goto(`${BASE_URL}${pageInfo.path}`, {
            waitUntil: 'networkidle0',
            timeout: 30000
          });
          const loadTime = Date.now() - startTime;

          // Take screenshot
          const screenshotPath = `${screenshotsDir}/${viewport.name}-${pageInfo.name.toLowerCase().replace(/\s+/g, '-')}.png`;
          await page.screenshot({ path: screenshotPath, fullPage: true });

          // Check for horizontal overflow (viewability issue)
          const hasOverflow = await page.evaluate(() => {
            return document.body.scrollWidth > window.innerWidth;
          });

          // Check for clickable elements that are too small on mobile
          const smallClickables = await page.evaluate(() => {
            const elements = document.querySelectorAll('a, button, input, [role="button"]');
            let smallCount = 0;
            elements.forEach(el => {
              const rect = el.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0) {
                if (rect.width < 44 || rect.height < 44) {
                  smallCount++;
                }
              }
            });
            return smallCount;
          });

          // Check for text readability (font size)
          const smallText = await page.evaluate(() => {
            const textElements = document.querySelectorAll('p, span, a, li, td, th, label');
            let smallCount = 0;
            textElements.forEach(el => {
              const style = window.getComputedStyle(el);
              const fontSize = parseFloat(style.fontSize);
              if (fontSize < 14 && el.textContent.trim().length > 0) {
                smallCount++;
              }
            });
            return smallCount;
          });

          // Check for broken images
          const brokenImages = await page.evaluate(() => {
            const images = document.querySelectorAll('img');
            return Array.from(images).filter(img => !img.complete || img.naturalWidth === 0).length;
          });

          // Check for console errors
          const consoleErrors = [];
          page.on('console', msg => {
            if (msg.type() === 'error') {
              consoleErrors.push(msg.text());
            }
          });

          // Check navigation visibility on mobile
          const navHidden = await page.evaluate(() => {
            const nav = document.querySelector('nav');
            if (nav) {
              const style = window.getComputedStyle(nav);
              return style.display === 'none' || style.visibility === 'hidden';
            }
            return false;
          });

          // Check CTA button visibility
          const ctaVisible = await page.evaluate(() => {
            const buttons = document.querySelectorAll('button, [role="button"]');
            for (const btn of buttons) {
              const text = btn.textContent.toLowerCase();
              if (text.includes('calculate') || text.includes('get started') || text.includes('try')) {
                const rect = btn.getBoundingClientRect();
                return rect.top < window.innerHeight && rect.bottom > 0;
              }
            }
            return false;
          });

          // Store results
          results.viewability.push({
            viewport: viewport.name,
            page: pageInfo.name,
            loadTime: `${loadTime}ms`,
            hasOverflow,
            brokenImages,
            screenshotPath,
          });

          if (viewport.name.includes('mobile')) {
            results.ux.push({
              viewport: viewport.name,
              page: pageInfo.name,
              smallClickables,
              smallText,
              navHidden,
              ctaVisible,
            });
          }

          // Log issues found
          if (hasOverflow) {
            results.issues.push(`⚠️  Horizontal overflow on ${pageInfo.name} at ${viewport.name}`);
          }
          if (brokenImages > 0) {
            results.issues.push(`⚠️  ${brokenImages} broken images on ${pageInfo.name}`);
          }
          if (smallClickables > 10 && viewport.name.includes('mobile')) {
            results.issues.push(`⚠️  ${smallClickables} small touch targets on ${pageInfo.name} (mobile)`);
          }

          console.log(`     ✓ Load time: ${loadTime}ms | Overflow: ${hasOverflow ? '⚠️ YES' : '✓ No'} | Screenshot saved`);

        } catch (error) {
          console.log(`     ❌ Error: ${error.message}`);
          results.issues.push(`❌ Page load failed: ${pageInfo.name} at ${viewport.name} - ${error.message}`);
        }
      }

      await page.close();
    }

    // Run interactive functionality tests
    console.log('\n\n🔧 Running Functionality Tests');
    console.log('=' .repeat(60));

    const funcPage = await browser.newPage();
    await funcPage.setViewport({ width: 1280, height: 800 });

    // Test Calculator Functionality
    console.log('\n📊 Testing Calculator Functionality...');
    try {
      await funcPage.goto(`${BASE_URL}/calculator`, { waitUntil: 'networkidle0' });

      // Check for input fields
      const hasInputs = await funcPage.evaluate(() => {
        const inputs = document.querySelectorAll('input');
        return inputs.length > 0;
      });

      // Try to interact with calculator
      const calcWorks = await funcPage.evaluate(() => {
        // Look for income/amount input
        const inputs = document.querySelectorAll('input');
        for (const input of inputs) {
          const placeholder = input.placeholder?.toLowerCase() || '';
          const label = input.getAttribute('aria-label')?.toLowerCase() || '';
          if (placeholder.includes('income') || placeholder.includes('amount') ||
              placeholder.includes('ytd') || placeholder.includes('gross') ||
              label.includes('income') || label.includes('gross')) {
            return true;
          }
        }
        // Check for any numeric input
        for (const input of inputs) {
          if (input.type === 'number' || input.type === 'text') {
            return true;
          }
        }
        return inputs.length > 0;
      });

      results.functionality.push({
        test: 'Calculator Page',
        hasInputs,
        calcWorks,
        status: hasInputs ? '✓ Inputs found' : '❌ No inputs',
      });
      console.log(`  ✓ Calculator inputs found: ${hasInputs}`);

    } catch (error) {
      console.log(`  ❌ Calculator test error: ${error.message}`);
    }

    // Test Navigation
    console.log('\n🧭 Testing Navigation...');
    try {
      await funcPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });

      // Test main navigation links
      const navLinks = await funcPage.evaluate(() => {
        const links = document.querySelectorAll('a, [role="link"]');
        const hrefs = [];
        links.forEach(link => {
          const href = link.getAttribute('href');
          if (href && href.startsWith('/') && !href.includes('#')) {
            hrefs.push(href);
          }
        });
        return [...new Set(hrefs)];
      });

      results.functionality.push({
        test: 'Navigation',
        linksFound: navLinks.length,
        links: navLinks,
        status: navLinks.length > 3 ? '✓ Good navigation' : '⚠️ Limited navigation',
      });
      console.log(`  ✓ Found ${navLinks.length} internal navigation links`);

    } catch (error) {
      console.log(`  ❌ Navigation test error: ${error.message}`);
    }

    // Test Theme Toggle
    console.log('\n🎨 Testing Theme Toggle...');
    try {
      const hasThemeToggle = await funcPage.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
          const text = btn.textContent.toLowerCase();
          const ariaLabel = btn.getAttribute('aria-label')?.toLowerCase() || '';
          if (text.includes('theme') || text.includes('dark') || text.includes('light') ||
              ariaLabel.includes('theme') || ariaLabel.includes('dark') || ariaLabel.includes('light')) {
            return true;
          }
          // Check for sun/moon icons
          if (btn.querySelector('svg')) {
            return true;
          }
        }
        return false;
      });

      results.functionality.push({
        test: 'Theme Toggle',
        found: hasThemeToggle,
        status: hasThemeToggle ? '✓ Theme toggle found' : '⚠️ No theme toggle',
      });
      console.log(`  ${hasThemeToggle ? '✓' : '⚠️'} Theme toggle: ${hasThemeToggle ? 'Found' : 'Not found'}`);

    } catch (error) {
      console.log(`  ❌ Theme toggle test error: ${error.message}`);
    }

    // Test Form Validation (Login/Signup)
    console.log('\n📝 Testing Form Validation...');
    try {
      await funcPage.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });

      const hasEmailField = await funcPage.evaluate(() => {
        const inputs = document.querySelectorAll('input[type="email"], input[name="email"]');
        return inputs.length > 0;
      });

      const hasPasswordField = await funcPage.evaluate(() => {
        const inputs = document.querySelectorAll('input[type="password"]');
        return inputs.length > 0;
      });

      results.functionality.push({
        test: 'Login Form',
        hasEmailField,
        hasPasswordField,
        status: hasEmailField && hasPasswordField ? '✓ Form complete' : '⚠️ Form incomplete',
      });
      console.log(`  ✓ Login form: Email field: ${hasEmailField}, Password field: ${hasPasswordField}`);

    } catch (error) {
      console.log(`  ❌ Form test error: ${error.message}`);
    }

    await funcPage.close();

    // Generate UX Analysis Report
    console.log('\n\n📋 UX ANALYSIS REPORT');
    console.log('=' .repeat(60));

    // Engagement Analysis
    console.log('\n🎯 Engagement Analysis:');
    const engagementPage = await browser.newPage();
    await engagementPage.setViewport({ width: 1280, height: 800 });
    await engagementPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });

    const engagementFactors = await engagementPage.evaluate(() => {
      const factors = {};

      // Check for clear CTA above fold
      factors.ctaAboveFold = false;
      const buttons = document.querySelectorAll('button, a[href*="calculator"]');
      for (const btn of buttons) {
        const rect = btn.getBoundingClientRect();
        const text = btn.textContent.toLowerCase();
        if ((text.includes('calculate') || text.includes('get started') || text.includes('try')) &&
            rect.top < window.innerHeight && rect.top > 0) {
          factors.ctaAboveFold = true;
          break;
        }
      }

      // Check for social proof
      factors.hasSocialProof = document.body.textContent.toLowerCase().includes('user') ||
                               document.body.textContent.includes('★') ||
                               document.body.textContent.toLowerCase().includes('rating');

      // Check for value proposition
      factors.hasValueProp = document.querySelector('h1') !== null;

      // Check for trust signals
      const text = document.body.textContent.toLowerCase();
      factors.hasTrustSignals = text.includes('secure') || text.includes('privacy') ||
                                 text.includes('free') || text.includes('no signup');

      // Check for urgency/scarcity (not always positive)
      factors.hasUrgency = text.includes('limited') || text.includes('now') || text.includes('today');

      // Check for clear navigation
      factors.hasNavigation = document.querySelector('nav') !== null ||
                              document.querySelector('header') !== null;

      // Check for secondary CTAs
      const allButtons = document.querySelectorAll('button, a.btn, a[class*="button"]');
      factors.ctaCount = allButtons.length;

      return factors;
    });

    results.engagement = engagementFactors;

    console.log(`  ${engagementFactors.ctaAboveFold ? '✓' : '❌'} CTA above the fold`);
    console.log(`  ${engagementFactors.hasSocialProof ? '✓' : '❌'} Social proof present`);
    console.log(`  ${engagementFactors.hasValueProp ? '✓' : '❌'} Value proposition (H1 present)`);
    console.log(`  ${engagementFactors.hasTrustSignals ? '✓' : '❌'} Trust signals`);
    console.log(`  ${engagementFactors.hasNavigation ? '✓' : '❌'} Clear navigation`);
    console.log(`  📊 Total CTA buttons: ${engagementFactors.ctaCount}`);

    await engagementPage.close();

    // Print Issues Found
    if (results.issues.length > 0) {
      console.log('\n\n⚠️  ISSUES FOUND:');
      console.log('-'.repeat(50));
      results.issues.forEach(issue => console.log(`  ${issue}`));
    }

    // Print all results summary
    console.log('\n\n📊 COMPLETE TEST RESULTS SUMMARY');
    console.log('=' .repeat(60));

    console.log('\n🖥️  Viewability Results:');
    console.log('-'.repeat(50));

    // Group by page
    const pageGroups = {};
    results.viewability.forEach(r => {
      if (!pageGroups[r.page]) pageGroups[r.page] = [];
      pageGroups[r.page].push(r);
    });

    for (const [pageName, pageResults] of Object.entries(pageGroups)) {
      console.log(`\n  📄 ${pageName}:`);
      pageResults.forEach(r => {
        const status = r.hasOverflow ? '⚠️ OVERFLOW' : '✓';
        console.log(`     ${r.viewport.padEnd(18)} | ${r.loadTime.padStart(6)} | ${status}`);
      });
    }

    console.log('\n\n🔧 Functionality Results:');
    console.log('-'.repeat(50));
    results.functionality.forEach(f => {
      console.log(`  ${f.status} - ${f.test}`);
    });

    // Generate Suggestions
    console.log('\n\n💡 RECOMMENDATIONS FOR IMPROVEMENT:');
    console.log('=' .repeat(60));

    const suggestions = [];

    // Check mobile UX
    const mobileIssues = results.ux.filter(u => u.viewport.includes('mobile'));
    if (mobileIssues.some(u => u.smallClickables > 10)) {
      suggestions.push('📱 MOBILE: Increase touch target sizes to at least 44x44px for better mobile usability');
    }
    if (mobileIssues.some(u => u.navHidden)) {
      suggestions.push('📱 MOBILE: Add a hamburger menu or bottom navigation for mobile users');
    }
    if (mobileIssues.some(u => !u.ctaVisible)) {
      suggestions.push('📱 MOBILE: Ensure primary CTA is visible above the fold on mobile');
    }

    // Check engagement
    if (!engagementFactors.ctaAboveFold) {
      suggestions.push('🎯 ENGAGEMENT: Move primary CTA button above the fold for immediate visibility');
    }
    if (!engagementFactors.hasSocialProof) {
      suggestions.push('🎯 ENGAGEMENT: Add social proof (testimonials, user count, ratings) to build trust');
    }

    // Check for overflow issues
    if (results.issues.some(i => i.includes('overflow'))) {
      suggestions.push('🖥️ VIEWABILITY: Fix horizontal overflow issues for better responsive design');
    }

    // Performance
    const slowPages = results.viewability.filter(v => parseInt(v.loadTime) > 3000);
    if (slowPages.length > 0) {
      suggestions.push('⚡ PERFORMANCE: Optimize slow-loading pages (target under 3 seconds)');
    }

    // Standard suggestions
    suggestions.push('💡 RE-ENGAGEMENT: Consider adding email capture for newsletter/tips to drive return visits');
    suggestions.push('💡 ONBOARDING: Add a quick tutorial or tooltip on first visit to guide new users');
    suggestions.push('💡 GAMIFICATION: Add progress indicators or achievements to increase engagement');
    suggestions.push('💡 PERSONALIZATION: Allow users to save their calculations/scenarios');

    suggestions.forEach((s, i) => console.log(`\n${i + 1}. ${s}`));

    // Save full report to file
    const reportPath = './test/ui-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n\n📁 Full report saved to: ${reportPath}`);
    console.log(`📸 Screenshots saved to: ${screenshotsDir}/`);

  } catch (error) {
    console.error('Test suite error:', error);
  } finally {
    await browser.close();
  }

  console.log('\n\n✅ UI/UX Testing Complete!');
  console.log('=' .repeat(60));
}

runTests().catch(console.error);
