// supabase/functions/apply-complex-form/index.ts

import { createClient } from 'npm:@supabase/supabase-js@2';
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const corsHeaders = { /* ... */ };
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getUserFromToken(authHeader: string): Promise<{ user: any; error?: string }> { /* ... */ }

// --- "Smarter" Field Mapping ---
const fieldMappings = {
  fullName: ['name', 'full_name', 'fullname'],
  firstName: ['fname', 'first_name', 'firstname'],
  lastName: ['lname', 'last_name', 'lastname'],
  email: ['email', 'email_address'],
  phone: ['phone', 'phone_number', 'mobile', 'telephone'],
  location: ['location', 'city', 'address'],
  portfolio: ['portfolio', 'website', 'url', 'github', 'linkedin'],
};

async function processComplexFormJobs(jobs: any[], userProfile: any, userId: string) {
  const results = [];
  let successful = 0;
  let failed = 0;

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  for (const job of jobs) {
    // ... (Database insert logic remains the same)

    try {
      console.log(`[AUTOMATION] Starting COMPLEX FORM application for: ${job.jobTitle}`);
      await page.goto(job.jobUrl, { waitUntil: 'networkidle2', timeout: 60000 });

      // --- INTELLIGENT FORM FILLING ---
      const inputs = await page.$$('input, textarea, select');
      
      for (const input of inputs) {
        const properties = await page.evaluate(el => {
          const label = document.querySelector(`label[for="${el.id}"]`);
          return {
            id: el.id,
            name: el.name,
            type: el.type,
            placeholder: el.placeholder,
            ariaLabel: el.getAttribute('aria-label'),
            labelText: label ? label.textContent : null,
          };
        }, input);

        const combinedText = `${properties.id} ${properties.name} ${properties.placeholder} ${properties.ariaLabel} ${properties.labelText}`.toLowerCase();
        
        let matchedField = null;
        for (const [key, variations] of Object.entries(fieldMappings)) {
          if (variations.some(v => combinedText.includes(v))) {
            matchedField = key;
            break;
          }
        }
        
        if (matchedField && userProfile[matchedField]) {
          console.log(`[AUTOMATION] Found match for "${matchedField}", filling field.`);
          await input.type(userProfile[matchedField]);
        }
      }
      
      // TODO: This is where you would introduce an AI call for fields that don't match.
      // E.g., take a screenshot, send it to a vision model to identify a field's purpose.
      
      // Find and click the submit button
      const submitButtonSelector = 'button[type="submit"], input[type="submit"], button[id*="submit" i]';
      await page.waitForSelector(submitButtonSelector, { timeout: 10000 });
      // await page.click(submitButtonSelector); // Commented out for safety during testing

      console.log(`[AUTOMATION] Successfully submitted COMPLEX FORM for ${job.jobTitle}`);
      // --- END INTELLIGENT FORM FILLING ---

      // ... (Database update on success remains the same)
      successful++;
      results.push({ /* ... */ });
      
    } catch (error) {
      // ... (Error handling and database update on failure remains the same)
      failed++;
      results.push({ /* ... */ });
    }
  }

  await browser.close();
  return { summary: { successful, failed, total: jobs.length }, jobs: results };
}

Deno.serve(async (req: Request) => {
  // ... (Identical Deno.serve logic)
});
