/**
 * Sinoptik script
 *
 * @module sinoptik.ts
 * @description This module is responsible for extracting the images from the source and saving them locally.
 */

// Imports
import puppeteer from "puppeteer";
import { browserOptions } from "../config";
import { SOURCE_URL } from "../constants/source";
import downloadImages from "../utils/downloadImages";
import interceptor from "../interceptor";
import SELECTOR from "../constants/selectors";
import logger from "../utils/logger";

// Function that scrapes the source url and gets the current cloudy image urls
export default async function sinoptikCrawler() {
    
    // Initialize the image URLs array to store the results
    const imageUrls: string[] = [];
    const SOFIA_CITY = "София";

    // Launch the browser
    const browser = await puppeteer.launch(browserOptions);

    // Create a new page
    const page = await browser.newPage();

    // Try to crawl the source
    try {

        // Block common ad resources
        await interceptor(page);

        // Go to the source URL with longer timeout
        await page.goto(SOURCE_URL, { waitUntil: "domcontentloaded" });

        // Wait for the page to load
        await page.waitForNetworkIdle({ idleTime: 2000 });

        // Set the viewport size
        logger.info("Setting viewport size to 800 x 600");
        await page.setViewport({ width: 800, height: 600 });

        // Wait for the search input to be visible
        await page.waitForSelector(SELECTOR.SEARCH_INPUT);

        // Get the search item container
        const searchInput = await page.$(SELECTOR.SEARCH_INPUT);

        // If the input is not found, throw an error
        if (!searchInput) throw new Error("Search input not found");

        // Type the search query with a delay between keystrokes to simulate human typing
        await searchInput.type(SOFIA_CITY, { delay: 400 });

        // Press the Enter key to submit the search
        logger.info(`Searching for ${SOFIA_CITY}`);
        await page.keyboard.press("Enter", { delay: 200 });

        // Wait for search results container to be visible
        await page.waitForSelector(".worldContent");

        // Wait for the first city link to be visible
        // TODO validate if the text is the same as the search query
        await page.waitForSelector(SELECTOR.CITY_LINK);

        // Get the link for the selected city
        const selectCity = await page.$(SELECTOR.CITY_LINK);

        // If the city link is not found, throw an error
        if (!selectCity) throw new Error("City link not found");

        // Click the city link
        logger.info("Selecting Sofia city link");

        // Click the city link with 1sec delay
        await selectCity.click({ delay: 1000 });

        // Wait for the page to load
        await page.waitForNavigation({ waitUntil: "domcontentloaded" });

        // Wait for the weather container to appear
        await page.waitForSelector(SELECTOR.CLOUDY_TAB);

        // Get the weather cloudy tab
        const cloudyTab = await page.$(SELECTOR.CLOUDY_TAB);

        if(!cloudyTab) throw new Error("Cloudy tab not found");

        // Click the cloudy tab with 3sec delay
        logger.info("Clicking on the Cloudy tab");
        await cloudyTab.click({ delay: 1000 });

        // Wait for the cloudiness tab to be selected
        logger.info("Waiting tab element class to be 'selected'");
        await page.waitForFunction((element) => element.classList.contains('selected'),
            {},
            cloudyTab
        );

        // Get the element
        const cloudyContainer = await page.$(SELECTOR.CLOUDY_CONTAINER);

        // If the cloudy container is not found, throw an error
        if(!cloudyContainer) throw new Error("Cloudy container not found");

        // Wait for the cloudy container to be visible
        await page.waitForFunction((element: Element) => (element as HTMLElement).style.display === 'flex',
            {},
            cloudyContainer
        );

        // Wait for the cloudiness container to be visible
        await page.waitForSelector(SELECTOR.TIME_CONTAINER);

        // Get the time bar elements
        await page.waitForSelector(SELECTOR.TIME_ITEMS);
        const timeItems = await page.$$(SELECTOR.TIME_ITEMS);

        // If no time items are found, throw an error
        if (!timeItems) throw new Error("Time items not found");

        // Loop through the time bar items to gather the image URLs
        for (const timeItem of timeItems) {
            
            // Get inner element
            const hrefElement = await timeItem.$("a");

            // Get current time text
            const currentTime = await hrefElement?.evaluate((el) => el.textContent);

            // Scroll the time item into view
            await timeItem.scrollIntoView();

            // Click the time item to ensure it gets selected
            logger.info(`Hovering on time item ${currentTime} h`);

            // Hover over the time item
            await page.locator(SELECTOR.timeItemByIndex(timeItems.indexOf(timeItem) + 1)).hover();

            // Wait for the selected class to be applied after successful hover
            // logger.info(`Waiting for element to be 'selected'`);
            // await page.waitForFunction((element) => element?.getAttribute("class")?.includes("selected"),
            //     {},
            //     hrefElement
            // );

            // Try to hover with explicit selector for the current time item
            // await page.waitForSelector(SELECTOR.timeItemByIndex(timeItems.indexOf(timeItem) + 1));
            // await page.locator(SELECTOR.timeItemByIndex(timeItems.indexOf(timeItem) + 1)).hover();

            // Get the clickable point of the current time item and move the mouse over
            // const itemCoordinates = await timeItem.clickablePoint();
            // await page.mouse.reset();
            // await page.mouse.move(itemCoordinates.x, itemCoordinates.y, { steps: 10 });

            // Wait for the cloudy image to be visible
            logger.info("Waiting for the image to be visible");
            await page.waitForSelector(SELECTOR.CLOUDY_IMG);

            // Get the img element
            const cloudyImageElement = await page.$(SELECTOR.CLOUDY_IMG);

            // If no image is found, throw an error
            if (!cloudyImageElement) throw new Error("Cloudy image element not found");

            // Get the image source
            const imageSrc = await cloudyImageElement.evaluate((el) => el.getAttribute("src"));

            // If no image source is found, throw an error
            if (!imageSrc) throw new Error("Cloudy image source url not found");

            // Push the image URL to the array
            imageUrls.push(imageSrc);

            // Log the image URL
            logger.info(`Found image url: ${imageSrc}`);
        }

        // Save the images locally by their URLs
        await downloadImages(imageUrls);
    } 
    
    // Catch errors
    catch (error) {

        console.error(error);
        // Log errors with more details
        logger.error("Script failed with error:", {
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
        });

        // Force exit if browser doesn't close properly
        // process.exit(1);
        process.exitCode = 1;
    }
    
    // Finally block
    finally {

        // Try to close the browser and page
        try {
            // Check if page and browser are defined before closing
            if (page && !page.isClosed()) {

                // Close page first
                await page.close();
            }

            // Check if the browser is open
            if (browser) {
                
                // Close the browser
                await browser.close();
            }

            // Exit the process
            process.exitCode = 0;

        } catch (closeError) {

            // Log errors if the browser doesn't close properly
            logger.error("Error while closing browser:", closeError);

            // Force exit if browser doesn't close properly
            process.exitCode = 1;
        }
    } 
}