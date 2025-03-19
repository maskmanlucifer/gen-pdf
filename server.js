const express = require('express');
const puppeteer = require("puppeteer");
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

app.use(cors({
    exposedHeaders: ['Content-Disposition']
}));


app.use(express.json({ limit: '50mb' }));

app.get("/", (req, res) => {
    res.send("HTML to PDF Converter API");
});

app.post("/generate-pdf", async (req, res) => {      
    const { html } = req.body;

    console.log("Received HTML content");

    if (!html) {
        return res.status(400).json({ error: "HTML content is required" });
    }

    try {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=output.pdf');
        
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        await page.setContent(html, { 
            waitUntil: ["load", "domcontentloaded", "networkidle0"] 
        });

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
        });
        
        await browser.close();

        res.end(pdfBuffer);
        
    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ error: "PDF generation failed: " + error.message });
    }
});

app.listen(3001, () => {
    console.log('PDF server started on port 3001');
});