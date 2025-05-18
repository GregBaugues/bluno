const puppeteer = require('puppeteer');
const { runTest } = require('./test_wild_draw4');

async function main() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--window-size=1280,800']
  });
  
  const page = await browser.newPage();
  
  // Enable console logging from the page to our Node.js console
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  try {
    await runTest(page);
    
    // Keep the browser open for a while to observe results
    await new Promise(resolve => setTimeout(resolve, 5000));
  } catch (error) {
    console.error('Test execution failed:', error);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);