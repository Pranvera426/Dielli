const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    const { roofArea, monthlyExpenditure, latitude, longitude } = req.body;

    if (!monthlyExpenditure) {
        return res.status(400).json({ error: 'Monthly expenditure is required to calculate ROI and needs.' });
    }

    // Assumptions for estimation
    // 1. Average cost per kWh = 0.15 USD
    // 2. Average solar panel production = 150 kWh per month per 1 kW installed
    // 3. Average cost of solar installation = $3,000 per kW

    const electricityPricePerKwh = 0.15;
    const productionPerKwMonthly = 150;
    const costPerKw = 3000;

    // Calculate needed kWh per month based on the bill
    const neededKwhMonthly = monthlyExpenditure / electricityPricePerKwh;

    // Calculate needed Solar Capacity in kW
    const neededKwCapacity = neededKwhMonthly / productionPerKwMonthly;

    // Estimated Installation Cost
    const estimatedCost = neededKwCapacity * costPerKw;

    // Estimated Annual Savings
    const annualSavings = monthlyExpenditure * 12;

    // ROI in Years
    const roiYears = estimatedCost / annualSavings;

    // Check if roof size is adequate. 
    // Roughly 1 kW needs 10 sq meters of space.
    let roofAdequate = true;
    let requiredArea = neededKwCapacity * 10;
    
    if (roofArea && roofArea < requiredArea) {
        roofAdequate = false;
    }

    res.json({
        neededKwhMonthly: neededKwhMonthly.toFixed(2),
        neededKwCapacity: neededKwCapacity.toFixed(2),
        estimatedCost: estimatedCost.toFixed(2),
        annualSavings: annualSavings.toFixed(2),
        roiYears: roiYears.toFixed(2),
        roofAdequate,
        requiredArea: requiredArea.toFixed(2)
    });
});

module.exports = router;
