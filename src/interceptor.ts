/**
 * interceptor puppeteer middleware
 *
 * @module interceptor.ts
 * @description This module is responsible interception any requests from potential ads.
 * It will block common ad resources like images, scripts, and stylesheets.
 */

import { Page } from "puppeteer";
import logger from "./utils/logger";

export default async function interceptor(page: Page) {

    // Log the action
    logger.info("Blocking common ads...");

    // Enable request interception for ad blocking
    await page.setRequestInterception(true);
    
    // Block common ad resources
    page.on("request", (req) => {
        // Check if the resource is an image, script, or stylesheet
        if (
            // req.resourceType() === "image" ||
            req.resourceType() === "script" ||
            req.resourceType() === "stylesheet"
        ) {
            // Get the URL and convert it to lowercase
            const url = req.url().toLowerCase();

            // Check if the URL contains ad, analytics, or tracker
            if (
                url.includes("ad") ||
                url.includes("analytics") ||
                url.includes("tracker")
            ) {
                // Abort the request if found
                req.abort();
                return;
            }
        }

        // Continue the request if not blocked
        req.continue();
    });

    // Get consent button if still visible
    // await page.waitForSelector('::-p-xpath(//div[contains(@class, "fc-consent-root")]//button[contains(@class, "fc-cta-consent")])');
    // const consentButton = await page.$('::-p-xpath(//div[contains(@class, "fc-consent-root")]//button[contains(@class, "fc-cta-consent")])');

    // // Check if the consent button is present
    // if (consentButton) {
        
    //     // Click the consent button
    //     await consentButton.click();
    // }
}
