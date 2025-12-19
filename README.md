# Meal Plan Generator

A beautiful, futuristic meal planning website that creates personalized 7-day nutrition plans based on your body metrics, goals, and training schedule.

## Features

- **Step-by-step form** for easy data input
- **Goal-based planning**: Bulk, Maintain, or Cut
- **Customizable meal structure**: 3 meals (Breakfast, Lunch, Dinner) or 5 meals (with snacks)
- **Training day adjustments**: Automatically adjusts calories for training vs rest days
- **Macronutrient distribution**: Shows protein, carbs, and fats in grams for each meal
- **PDF export**: Download your meal plan as a PDF file
- **Liquid glass design**: Modern, Apple-inspired glassmorphism UI

## Quick Preview

**Option 1: Direct File (Easiest)**
- Simply double-click `index.html` to open it in your browser
- Or right-click `index.html` → "Open With" → Your browser

**Option 2: Local Server (Recommended)**
```bash
python3 server.py
```
Then open: http://localhost:8000

**Option 3: Preview Page**
- Open `preview.html` in your browser for a quick access page

## How to Use

1. Open the website using one of the methods above
2. Follow the step-by-step process:
   - Select your goal (Bulk/Maintain/Cut)
   - Enter your body information (Age, Height, Weight, BMR, TDEE)
   - Set your calorie target (surplus/deficit)
   - Select your training days
   - Choose your meal structure
3. Review your personalized 7-day meal plan
4. Click "Download as PDF" to save your plan

## Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for jsPDF CDN)

## Files

- `index.html` - Main HTML structure
- `styles.css` - Styling with liquid glass effect
- `script.js` - Application logic and PDF generation

## Notes

- BMR (Basal Metabolic Rate): Calories your body burns at rest
- TDEE (Total Daily Energy Expenditure): Total calories burned per day including all activities
- Training days get 10% more calories, rest days get 5% less
- Macros are distributed across meals based on optimal timing

# kostschema-geroz
