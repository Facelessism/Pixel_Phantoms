const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// URL from your js/events.js
const API_URL = process.env.EVENTS_API_URL;
const TARGET_FILE = path.join(__dirname, '../data/events.json');

if (!API_URL) {
    throw new Error('EVENTS_API_URL is not configured in environment variables.');
}

async function syncEvents() {
    try {
        console.log("Fetching data from Google Sheet...");

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(API_URL, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const cloudData = await response.json();

        if (!Array.isArray(cloudData)) {
            throw new Error("Invalid API response format");
        }

        // 1. Filter for 'Approved' events
        const validEvents = cloudData
            .filter(e => e.status && e.status.toString().toLowerCase().trim() === "approved")
            .map(e => {
                const parsedDate = e.date ? new Date(e.date) : null;
                const isValidDate = parsedDate && !isNaN(parsedDate);

                return {
                    // Map fields to match data/events.json schema
                    title: e.title || "Untitled Event",
                    description: e.description || "",
                    date: isValidDate ? parsedDate.toISOString() : "TBD",
                    // Calculate a countdown date or default to date
                    countdownDate: isValidDate ? parsedDate.toISOString() : null,
                    location: e.location || "TBD",
                    status: "UPCOMING", // Default status for approved events
                    registrationOpen: true, // Default to true if approved
                    registrationLink: e.link || "" // Map 'link' from Sheet to 'registrationLink'
                };
            });

        // 2. Sort by Date
        validEvents.sort((a, b) => {
            const dateA = a.date === "TBD" ? Infinity : new Date(a.date).getTime();
            const dateB = b.date === "TBD" ? Infinity : new Date(b.date).getTime();
            return dateA - dateB;
        });

        // 3. Write to events.json
        const tempFile = TARGET_FILE + '.tmp';
        await fs.promises.writeFile(tempFile, JSON.stringify(validEvents, null, 4));
        await fs.promises.rename(tempFile, TARGET_FILE);

        console.log(`✅ Successfully synced ${validEvents.length} events to data/events.json`);

    } catch (error) {
        if (error.name === 'AbortError') {
            console.error("❌ Sync failed: Request timed out");
        } else {
            console.error("❌ Sync failed:", error.message);
        }
        process.exit(1);
    }
}

syncEvents();
