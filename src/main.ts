import puppeteer, { type Browser, type Page } from 'puppeteer'

// Get the URL and window count from the command line arguments
const url = process.argv[ 2 ] as string
const windowCount = parseInt( process.argv[ 3 ] as string, 10 )

// Check if the arguments are valid
if ( !url || !windowCount || isNaN( windowCount ) || windowCount < 1 ) {
	console.error( 'Invalid arguments. Usage: node main.ts <url> <windowCount>' )
	process.exit( 1 )
}

// Declare a global variable to store the browser instance
let browser: Browser

// Define an async function to create and open a browser window
async function createWindow(): Promise<Page> {
	// Create a new browser context
	const context = await browser.createIncognitoBrowserContext()
	// Create a new page in the context
	const page = await context.newPage()
	// Print a message when the page is created
	console.log( 'Created a new window' )
	// Navigate to the URL and wait for it to load
	await page.goto( url, { waitUntil: 'load' } )
	// Print a message when the page is loaded
	console.log( `Loaded the page: ${  url }` )
	// Return the page object
	return page
}

// Define an async function to close and destroy a browser window
async function destroyWindow( page: Page ): Promise<void> {
	// Get the browser context of the page
	const context = page.browserContext()
	// Close the context and all its pages
	await context.close()
	// Print a message when the window is destroyed
	console.log( 'Destroyed a window' )
}

// Define an async function to launch the browser and create the windows
async function launchBrowser(): Promise<void> {
	// Launch the browser with headless mode disabled
	browser = await puppeteer.launch( { headless: false } )
	// Create an array to store the promises of creating windows
	const promises: Array<Promise<Page>> = []
	// Loop for the window count and push the promises to the array
	for ( let i = 0; i < windowCount; i++ ) {
		promises.push( createWindow() )
	}
	// Wait for all the promises to resolve and get the array of pages
	await Promise.all( promises )
	// Print a message when all windows are created and loaded
	console.log( 'All windows are ready' )
}

// Define an async function to close the browser and destroy the windows
async function closeBrowser(): Promise<void> {
	// Create an array to store the promises of destroying windows
	const promises: Array<Promise<void>> = []
	// Loop for all the pages and push the promises to the array
	for ( const page of await browser.pages() ) {
		promises.push( destroyWindow( page ) )
	}

	// Wait for all the promises to resolve
	await Promise.all( promises )

	// Print a message when closing the browser
	console.log( 'Closing the browser' )
	// Close the browser and wait for it to finish
	await browser.close()
}

// Call the launchBrowser function and catch any errors
launchBrowser().catch( error => {
	console.error( error )
} )

// Listen to CTRL+C/SIGTERM/SIGINT signals and call the closeBrowser function
process.on( 'SIGINT', closeBrowser )
process.on( 'SIGTERM', closeBrowser )
