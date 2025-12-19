// State management
const state = {
    currentStep: 1,
    goal: null,
    age: null,
    height: null,
    weight: null,
    bmr: null,
    tdee: null,
    calorieAdjustment: null,
    trainingDays: [],
    mealStructure: null,
    snacks: {
        snack1: false, // Between breakfast and lunch
        snack2: false  // Between lunch and dinner
    },
    mealPlan: null
};

// Macro distribution based on goal
const macroDistributions = {
    bulk: { protein: 25, carbs: 55, fat: 20 },
    maintain: { protein: 30, carbs: 50, fat: 20 },
    cut: { protein: 35, carbs: 45, fat: 20 }
};

// BMR and TDEE calculation functions
function calculateBMR(age, height, weight) {
    // Mifflin-St Jeor Equation (most accurate)
    // BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5 (for males)
    // For simplicity, we'll use a unisex formula that averages male/female
    // Male: BMR = 10 × weight + 6.25 × height - 5 × age + 5
    // Female: BMR = 10 × weight + 6.25 × height - 5 × age - 161
    // Using average: BMR = 10 × weight + 6.25 × height - 5 × age - 78
    const bmr = (10 * weight) + (6.25 * height) - (5 * age) - 78;
    return Math.round(bmr);
}

function calculateTDEE(bmr, activityLevel = 'moderate') {
    // Activity multipliers:
    // Sedentary (little/no exercise): 1.2
    // Light (light exercise 1-3 days/week): 1.375
    // Moderate (moderate exercise 3-5 days/week): 1.55
    // Active (hard exercise 6-7 days/week): 1.725
    // Very Active (very hard exercise, physical job): 1.9
    // Default to moderate (1.55) for general use
    const multipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        veryActive: 1.9
    };
    const multiplier = multipliers[activityLevel] || multipliers.moderate;
    return Math.round(bmr * multiplier);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    updateStepDisplay();
    setupBMRAutoCalculation();
    setupHamburgerMenu();
});

function setupHamburgerMenu() {
    const hamburgerIcon = document.getElementById('hamburger-icon');
    const hamburgerOverlay = document.getElementById('hamburger-overlay');
    const infoBtn = document.getElementById('info-btn');
    const infoModal = document.getElementById('info-modal');
    const infoModalClose = document.getElementById('info-modal-close');
    
    hamburgerIcon.addEventListener('click', () => {
        hamburgerIcon.classList.toggle('active');
        hamburgerOverlay.classList.toggle('active');
    });
    
    hamburgerOverlay.addEventListener('click', (e) => {
        if (e.target === hamburgerOverlay) {
            hamburgerIcon.classList.remove('active');
            hamburgerOverlay.classList.remove('active');
        }
    });
    
    infoBtn.addEventListener('click', () => {
        hamburgerIcon.classList.remove('active');
        hamburgerOverlay.classList.remove('active');
        infoModal.classList.add('active');
    });
    
    infoModalClose.addEventListener('click', () => {
        infoModal.classList.remove('active');
    });
    
    infoModal.addEventListener('click', (e) => {
        if (e.target === infoModal) {
            infoModal.classList.remove('active');
        }
    });
}

function setupBMRAutoCalculation() {
    const ageInput = document.getElementById('age');
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    const bmrInput = document.getElementById('bmr');
    const tdeeInput = document.getElementById('tdee');
    
    function updateBMRAndTDEE() {
        const age = parseFloat(ageInput.value);
        const height = parseFloat(heightInput.value);
        const weight = parseFloat(weightInput.value);
        
        if (age && height && weight && age > 0 && height > 0 && weight > 0) {
            const bmr = calculateBMR(age, height, weight);
            const tdee = calculateTDEE(bmr, 'moderate');
            
            bmrInput.value = bmr;
            tdeeInput.value = tdee;
            
            // Update state
            state.bmr = bmr;
            state.tdee = tdee;
        } else {
            bmrInput.value = '';
            tdeeInput.value = '';
            state.bmr = null;
            state.tdee = null;
        }
    }
    
    ageInput.addEventListener('input', updateBMRAndTDEE);
    heightInput.addEventListener('input', updateBMRAndTDEE);
    weightInput.addEventListener('input', updateBMRAndTDEE);
}

function initializeEventListeners() {
    // Goal selection
    document.querySelectorAll('.goal-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.goal-btn').forEach(b => b.classList.remove('selected'));
            e.currentTarget.classList.add('selected');
            state.goal = e.currentTarget.dataset.goal;
            updateCalorieLabel();
        });
    });

    // Day selection
    document.querySelectorAll('.day-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const day = e.currentTarget.dataset.day;
            if (e.currentTarget.classList.contains('selected')) {
                e.currentTarget.classList.remove('selected');
                state.trainingDays = state.trainingDays.filter(d => d !== day);
            } else {
                e.currentTarget.classList.add('selected');
                state.trainingDays.push(day);
            }
        });
    });

    // Snack selection
    document.querySelectorAll('.snack-toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const snackNum = e.currentTarget.dataset.snack;
            const snackKey = snackNum === '1' ? 'snack1' : 'snack2';
            
            // Toggle snack selection
            state.snacks[snackKey] = !state.snacks[snackKey];
            e.currentTarget.classList.toggle('selected', state.snacks[snackKey]);
        });
    });

    // Navigation buttons
    document.getElementById('next-btn').addEventListener('click', nextStep);
    document.getElementById('prev-btn').addEventListener('click', prevStep);

    // PDF download
    document.getElementById('download-pdf').addEventListener('click', downloadPDF);
}

function updateCalorieLabel() {
    const label = document.getElementById('calorie-label');
    const help = document.getElementById('calorie-help');
    const input = document.getElementById('calorie-adjustment');
    const guidance = document.getElementById('calorie-guidance');
    const bulkGuidance = document.getElementById('bulk-guidance');
    const cutGuidance = document.getElementById('cut-guidance');
    const guidanceTitle = document.getElementById('guidance-title');
    
    if (state.goal === 'bulk') {
        label.textContent = 'Kaloriöverskott (kcal)';
        help.textContent = 'Ange det dagliga kaloriöverskottet du vill uppnå';
        input.disabled = false;
        input.value = '';
        if (guidance) {
            guidance.style.display = 'block';
            if (bulkGuidance) bulkGuidance.style.display = 'block';
            if (cutGuidance) cutGuidance.style.display = 'none';
            if (guidanceTitle) guidanceTitle.textContent = 'Vad är ett rimligt kaloriöverskott?';
        }
    } else if (state.goal === 'cut') {
        label.textContent = 'Kaloriunderskott (kcal)';
        help.textContent = 'Ange det dagliga kaloriunderskottet du vill uppnå';
        input.disabled = false;
        input.value = '';
        if (guidance) {
            guidance.style.display = 'block';
            if (bulkGuidance) bulkGuidance.style.display = 'none';
            if (cutGuidance) cutGuidance.style.display = 'block';
            if (guidanceTitle) guidanceTitle.textContent = 'Vad är ett rimligt kaloriunderskott?';
        }
    } else {
        label.textContent = 'Kalorijustering (kcal)';
        help.textContent = 'Behållningsläge - kalorier kommer att sättas för att behålla din nuvarande vikt';
        input.disabled = true;
        input.value = '0';
        if (guidance) {
            guidance.style.display = 'none';
        }
    }
}

function nextStep() {
    if (!validateCurrentStep()) {
        return;
    }

    if (state.currentStep < 6) {
        state.currentStep++;
        updateStepDisplay();
        
        if (state.currentStep === 6) {
            generateMealPlan();
        }
    }
}

function prevStep() {
    if (state.currentStep > 1) {
        state.currentStep--;
        updateStepDisplay();
    }
}

function validateCurrentStep() {
    switch (state.currentStep) {
        case 1:
            if (!state.goal) {
                alert('Vänligen välj ditt mål');
                return false;
            }
            break;
        case 2:
            state.age = parseInt(document.getElementById('age').value);
            state.height = parseFloat(document.getElementById('height').value);
            state.weight = parseFloat(document.getElementById('weight').value);
            state.bmr = parseFloat(document.getElementById('bmr').value);
            state.tdee = parseFloat(document.getElementById('tdee').value);
            
            if (!state.age || !state.height || !state.weight) {
                alert('Vänligen fyll i Ålder, Längd och Vikt. BMR och TDEE beräknas automatiskt.');
                return false;
            }
            
            if (!state.bmr || !state.tdee) {
                alert('BMR och TDEE beräknas. Vänligen se till att Ålder, Längd och Vikt är giltiga nummer.');
                return false;
            }
            break;
        case 3:
            const calorieInput = document.getElementById('calorie-adjustment').value;
            if (state.goal === 'maintain') {
                state.calorieAdjustment = 0;
            } else {
                if (!calorieInput || calorieInput.trim() === '') {
                    alert('Vänligen ange ett kaloriöverskott eller underskott');
                    return false;
                }
                state.calorieAdjustment = parseFloat(calorieInput);
                if (isNaN(state.calorieAdjustment) || state.calorieAdjustment < 0) {
                    alert('Vänligen ange en giltig kalorijustering (0 eller högre)');
                    return false;
                }
            }
            break;
        case 4:
            if (state.trainingDays.length === 0) {
                alert('Vänligen välj minst en träningsdag');
                return false;
            }
            break;
        case 5:
            // Meal structure is always valid (at least 3 meals are always included)
            // Snacks are optional, so no validation needed
            break;
    }
    return true;
}

function updateStepDisplay() {
    // Update step indicators
    document.querySelectorAll('.step').forEach((step, index) => {
        const stepNum = index + 1;
        step.classList.remove('active', 'completed');
        if (stepNum < state.currentStep) {
            step.classList.add('completed');
        } else if (stepNum === state.currentStep) {
            step.classList.add('active');
        }
    });

    // Update step content
    document.querySelectorAll('.step-content').forEach((content, index) => {
        content.classList.remove('active');
        if (index + 1 === state.currentStep) {
            content.classList.add('active');
        }
    });

    // Update navigation buttons
    document.getElementById('prev-btn').style.display = state.currentStep > 1 ? 'block' : 'none';
    document.getElementById('next-btn').style.display = state.currentStep < 6 ? 'block' : 'none';
}

// Day name translations
const dayNames = {
    'monday': 'Måndag',
    'tuesday': 'Tisdag',
    'wednesday': 'Onsdag',
    'thursday': 'Torsdag',
    'friday': 'Fredag',
    'saturday': 'Lördag',
    'sunday': 'Söndag'
};

// Helper to display meal name with emoji
function getMealDisplayName(name) {
    switch (name) {
        case 'Frukost':
            return '☀️ Frukost';
        case 'Lunch':
            return '🍽️ Lunch';
        case 'Middag':
            return '🌙 Middag';
        case 'Mellanmål':
            return '🍎 Mellanmål';
        default:
            return name;
    }
}

function generateMealPlan() {
    const macros = macroDistributions[state.goal];
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    // Calculate daily calories
    let baseCalories = state.tdee;
    if (state.goal === 'bulk') {
        baseCalories += state.calorieAdjustment;
    } else if (state.goal === 'cut') {
        baseCalories -= state.calorieAdjustment;
    }
    // maintain uses TDEE as is

    // Calorie adjustment health rating
    let calorieRating = {
        level: 'neutral',
        label: 'Neutral',
        description: 'Kalorimålet är neutralt.',
        color: 'neutral'
    };
    if (state.goal !== 'maintain') {
        const adj = state.calorieAdjustment || 0;
        const ratio = adj > 0 && state.tdee ? adj / state.tdee : 0;
        if (ratio <= 0.15) {
            calorieRating.level = 'good';
            calorieRating.color = 'green';
            calorieRating.label = state.goal === 'bulk' ? '🟢 Rimligt överskott' : '🟢 Rimligt underskott';
            calorieRating.description = 'Ditt kaloriöverskott/underskott ligger på en hälsosam nivå.';
        } else if (ratio <= 0.25) {
            calorieRating.level = 'medium';
            calorieRating.color = 'yellow';
            calorieRating.label = state.goal === 'bulk' ? '🟡 Ganska högt överskott' : '🟡 Ganska stort underskott';
            calorieRating.description = 'Detta kan fungera kortsiktigt, men var uppmärksam på sömn, energi och återhämtning.';
        } else {
            calorieRating.level = 'high';
            calorieRating.color = 'red';
            calorieRating.label = state.goal === 'bulk' ? '🔴 Mycket högt överskott' : '🔴 Mycket stort underskott';
            calorieRating.description = 'Detta kaloriupplägg kan vara för aggressivt. Överväg att minska skillnaden.';
        }
    }

    // Calculate macros per gram
    const proteinPerGram = 4; // calories per gram
    const carbsPerGram = 4;
    const fatPerGram = 9;

    // Calculate total macros for the day
    const totalProtein = (baseCalories * macros.protein / 100) / proteinPerGram;
    const totalCarbs = (baseCalories * macros.carbs / 100) / carbsPerGram;
    const totalFat = (baseCalories * macros.fat / 100) / fatPerGram;

    // Adjust for training days (add 10% more calories on training days)
    const trainingDayMultiplier = 1.1;
    const restDayMultiplier = 0.95;

    const mealPlan = {
        userInfo: {
            age: state.age,
            height: state.height,
            weight: state.weight,
            bmr: state.bmr,
            tdee: state.tdee,
            goal: state.goal,
            calorieAdjustment: state.goal === 'maintain' ? 'Behålla' : state.calorieAdjustment
        },
        macros: macros,
        days: [],
        calorieRating
    };

    // Build meal names based on selected snacks
    const mealNamesList = [];
    const mealDistribution = {};
    
    // Always start with Breakfast
    mealNamesList.push('Frukost');
    mealDistribution['Frukost'] = state.snacks.snack1 ? 0.25 : (state.snacks.snack2 ? 0.30 : 0.30);
    
    // Add first snack if selected (between breakfast and lunch)
    if (state.snacks.snack1) {
        mealNamesList.push('Mellanmål');
        mealDistribution['Mellanmål'] = 0.10;
    }
    
    // Always include Lunch
    mealNamesList.push('Lunch');
    if (state.snacks.snack1 && state.snacks.snack2) {
        mealDistribution['Lunch'] = 0.30;
    } else if (state.snacks.snack1 || state.snacks.snack2) {
        mealDistribution['Lunch'] = 0.35;
    } else {
        mealDistribution['Lunch'] = 0.40;
    }
    
    // Add second snack if selected (between lunch and dinner)
    if (state.snacks.snack2) {
        mealNamesList.push('Mellanmål');
        // For the second snack, we need to track it separately
        // We'll use the order to determine which snack it is
    }
    
    // Always end with Dinner
    mealNamesList.push('Middag');
    mealDistribution['Middag'] = state.snacks.snack2 ? 0.25 : (state.snacks.snack1 ? 0.30 : 0.30);
    
    // Create a meal order array to track distribution
    const mealOrder = [];
    let snackCount = 0;
    
    mealNamesList.forEach((name, index) => {
        if (name === 'Mellanmål') {
            snackCount++;
            mealOrder.push({ name: 'Mellanmål', index: snackCount, distribution: 0.10 });
        } else {
            mealOrder.push({ name: name, distribution: mealDistribution[name] });
        }
    });

    days.forEach(day => {
        const isTrainingDay = state.trainingDays.includes(day);
        const dayMultiplier = isTrainingDay ? trainingDayMultiplier : restDayMultiplier;
        
        const dayCalories = baseCalories * dayMultiplier;
        const dayProtein = (dayCalories * macros.protein / 100) / proteinPerGram;
        const dayCarbs = (dayCalories * macros.carbs / 100) / carbsPerGram;
        const dayFat = (dayCalories * macros.fat / 100) / fatPerGram;

        const dayPlan = {
            name: dayNames[day],
            isTrainingDay: isTrainingDay,
            calories: Math.round(dayCalories),
            meals: []
        };

        mealOrder.forEach(meal => {
            const mealPercent = meal.distribution;
            dayPlan.meals.push({
                name: meal.name,
                protein: Math.round(dayProtein * mealPercent),
                carbs: Math.round(dayCarbs * mealPercent),
                fat: Math.round(dayFat * mealPercent),
                calories: Math.round(dayCalories * mealPercent)
            });
        });

        mealPlan.days.push(dayPlan);
    });

    // Calculate average daily macros for template
    let totalWeekCalories = 0;
    let totalWeekProtein = 0;
    let totalWeekCarbs = 0;
    let totalWeekFat = 0;
    
    mealPlan.days.forEach(day => {
        totalWeekCalories += day.calories;
        day.meals.forEach(meal => {
            totalWeekProtein += meal.protein;
            totalWeekCarbs += meal.carbs;
            totalWeekFat += meal.fat;
        });
    });
    
    const avgCalories = Math.round(totalWeekCalories / 7);
    const avgProtein = Math.round(totalWeekProtein / 7);
    const avgCarbs = Math.round(totalWeekCarbs / 7);
    const avgFat = Math.round(totalWeekFat / 7);

    mealPlan.template = {
        calories: avgCalories,
        protein: avgProtein,
        carbs: avgCarbs,
        fat: avgFat,
        meals: mealOrder.map((meal, index) => {
            // Calculate average for this meal
            let mealTotalProtein = 0;
            let mealTotalCarbs = 0;
            let mealTotalFat = 0;
            
            mealPlan.days.forEach(day => {
                // Use index to get the correct meal (handles duplicate "Snack" names)
                const mealData = day.meals[index];
                if (mealData) {
                    mealTotalProtein += mealData.protein;
                    mealTotalCarbs += mealData.carbs;
                    mealTotalFat += mealData.fat;
                }
            });
            
            return {
                name: meal.name,
                protein: Math.round(mealTotalProtein / 7),
                carbs: Math.round(mealTotalCarbs / 7),
                fat: Math.round(mealTotalFat / 7)
            };
        })
    };

    state.mealPlan = mealPlan;
    displayMealPlan(mealPlan);
}

function displayMealPlan(plan) {
    const content = document.getElementById('meal-plan-content');
    
    let html = `
        <div class="plan-header">
            <h3>Din Personliga Kostplan</h3>
            <div class="plan-info">
                <div class="info-item">
                    <span class="info-label">Ålder</span>
                    <span class="info-value">${plan.userInfo.age} år</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Längd</span>
                    <span class="info-value">${plan.userInfo.height} cm</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Vikt</span>
                    <span class="info-value">${plan.userInfo.weight} kg</span>
                </div>
                <div class="info-item">
                    <span class="info-label">BMR</span>
                    <span class="info-value">${plan.userInfo.bmr} kcal</span>
                    <span class="info-explanation">Basal Metabolic Rate - kalorier förbrända i vila</span>
                </div>
                <div class="info-item">
                    <span class="info-label">TDEE</span>
                    <span class="info-value">${plan.userInfo.tdee} kcal</span>
                    <span class="info-explanation">Total Daily Energy Expenditure - totala kalorier förbrända per dag</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Dagligt Mål</span>
                    <span class="info-value">${plan.userInfo.calorieAdjustment === 'Behålla' ? 'Behålla' : plan.userInfo.calorieAdjustment + ' kcal ' + (plan.userInfo.goal === 'bulk' ? 'överskott' : 'underskott')}</span>
                </div>
            </div>
            <div class="calorie-rating rating-${plan.calorieRating.level}">
                <span class="calorie-rating-label">${plan.calorieRating.label}</span>
                <span class="calorie-rating-desc">${plan.calorieRating.description}</span>
            </div>
            <div class="macro-distribution">
                <h4>Makronäringsdistribution</h4>
                <div class="macro-bars">
                    <div class="macro-bar">
                        <div class="macro-bar-label">Protein</div>
                        <div class="macro-bar-value">${plan.macros.protein}%</div>
                    </div>
                    <div class="macro-bar">
                        <div class="macro-bar-label">Kolhydrater</div>
                        <div class="macro-bar-value">${plan.macros.carbs}%</div>
                    </div>
                    <div class="macro-bar">
                        <div class="macro-bar-label">Fett</div>
                        <div class="macro-bar-value">${plan.macros.fat}%</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Daily plans
    html += '<div class="daily-plan"><h4>Kostplan</h4>';
    plan.days.forEach(day => {
        html += `
            <div class="day-section">
                <div class="day-header">
                    <div>
                        <span class="day-name">${day.name}</span>
                        <span class="day-calories" style="font-size: 0.9rem; color: var(--text-secondary); margin-left: 10px;">${day.calories} kcal</span>
                    </div>
                    <span class="day-type ${day.isTrainingDay ? '' : 'rest'}">${day.isTrainingDay ? 'Träningsdag' : 'Vilodag'}</span>
                </div>
                <div class="meals-list">
        `;
        
        day.meals.forEach(meal => {
            const mealDisplayName = getMealDisplayName(meal.name);
            html += `
                <div class="meal-item">
                    <div class="meal-name">${mealDisplayName}</div>
                    <div class="macros-grid">
                        <div class="macro-item">
                            <div class="macro-item-label">Protein</div>
                            <div class="macro-item-value">${meal.protein}g</div>
                        </div>
                        <div class="macro-item">
                            <div class="macro-item-label">Kolhydrater</div>
                            <div class="macro-item-value">${meal.carbs}g</div>
                        </div>
                        <div class="macro-item">
                            <div class="macro-item-label">Fett</div>
                            <div class="macro-item-value">${meal.fat}g</div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    html += '</div>';

    // Template section
    html += `
        <div class="template-section">
            <h4>Dagligt Genomsnittligt Mall</h4>
            <p style="color: var(--text-secondary); margin-bottom: 15px;">Genomsnittlig daglig makronäringsdistribution</p>
            <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 10px; margin-bottom: 20px; border: 1px solid var(--glass-border);">
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; text-align: center;">
                    <div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 4px;">Totalt Kalorier</div>
                        <div style="font-size: 1.1rem; font-weight: 600; color: var(--text-primary);">${plan.template.calories} kcal</div>
                    </div>
                    <div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 4px;">Protein</div>
                        <div style="font-size: 1.1rem; font-weight: 600; color: var(--text-primary);">${plan.template.protein}g</div>
                    </div>
                    <div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 4px;">Kolhydrater</div>
                        <div style="font-size: 1.1rem; font-weight: 600; color: var(--text-primary);">${plan.template.carbs}g</div>
                    </div>
                    <div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 4px;">Fett</div>
                        <div style="font-size: 1.1rem; font-weight: 600; color: var(--text-primary);">${plan.template.fat}g</div>
                    </div>
                </div>
            </div>
            <div class="meals-list">
    `;
    
    plan.template.meals.forEach(meal => {
        const mealDisplayName = getMealDisplayName(meal.name);
        html += `
            <div class="meal-item">
                <div class="meal-name">${mealDisplayName}</div>
                <div class="macros-grid">
                    <div class="macro-item">
                        <div class="macro-item-label">Protein</div>
                        <div class="macro-item-value">${meal.protein}g</div>
                    </div>
                    <div class="macro-item">
                        <div class="macro-item-label">Kolhydrater</div>
                        <div class="macro-item-value">${meal.carbs}g</div>
                    </div>
                    <div class="macro-item">
                        <div class="macro-item-label">Fett</div>
                        <div class="macro-item-value">${meal.fat}g</div>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;

    content.innerHTML = html;
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const plan = state.mealPlan;

    let yPos = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);

    // Helper function to check page break
    function checkPageBreak(requiredSpace = 10) {
        if (yPos > 280 - requiredSpace) {
            doc.addPage();
            yPos = 20;
            return true;
        }
        return false;
    }

    // Header with title
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(8, 145, 178); // Cyan color
    doc.text('Personlig Kostplan', pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(107, 114, 128); // Gray
    doc.text('Skapad specifikt för dina mål', pageWidth / 2, yPos, { align: 'center' });
    yPos += 20;

    // Stats Grid (5 columns)
    checkPageBreak(25);
    const statsBoxWidth = (contentWidth - 60) / 5;
    const statsStartX = margin;
    const statsData = [
        { label: 'Ålder', value: `${plan.userInfo.age} år` },
        { label: 'Längd', value: `${plan.userInfo.height} cm` },
        { label: 'Vikt', value: `${plan.userInfo.weight} kg` },
        { label: 'BMR', value: `${plan.userInfo.bmr} kcal` },
        { label: 'TDEE', value: `${plan.userInfo.tdee} kcal` }
    ];
    
    statsData.forEach((stat, index) => {
        const xPos = statsStartX + (index * (statsBoxWidth + 15));
        // Draw box background
        doc.setDrawColor(229, 231, 235);
        doc.setFillColor(243, 244, 246);
        doc.roundedRect(xPos, yPos, statsBoxWidth, 20, 3, 3, 'FD');
        // Label
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        doc.text(stat.label, xPos + statsBoxWidth / 2, yPos + 7, { align: 'center' });
        // Value
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(stat.value, xPos + statsBoxWidth / 2, yPos + 15, { align: 'center' });
    });
    yPos += 25;

    // Info badges (Goal and Daily Target)
    checkPageBreak(15);
    const goalText = plan.userInfo.goal === 'bulk' ? 'bygga' : plan.userInfo.goal === 'cut' ? 'gå ner' : 'behålla';
    const targetText = plan.userInfo.calorieAdjustment === 'Behålla' 
        ? 'Behålla' 
        : `${plan.userInfo.calorieAdjustment} kcal ${plan.userInfo.goal === 'bulk' ? 'överskott' : 'underskott'}`;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(55, 65, 81);
    doc.setFillColor(224, 242, 254);
    doc.setDrawColor(8, 145, 178);
    doc.roundedRect(margin, yPos, 80, 12, 10, 10, 'FD');
    doc.text(`Mål: `, margin + 5, yPos + 8);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(8, 145, 178);
    doc.text(goalText, margin + 20, yPos + 8);
    
    doc.setFont(undefined, 'normal');
    doc.setTextColor(55, 65, 81);
    doc.roundedRect(margin + 100, yPos, 100, 12, 10, 10, 'FD');
    doc.text(`Dagligt Mål: `, margin + 105, yPos + 8);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(8, 145, 178);
    doc.text(targetText, margin + 155, yPos + 8);
    yPos += 20;

    // Macros Row
    checkPageBreak(25);
    const macroStartX = pageWidth / 2 - 60;
    const macrosData = [
        { value: `${plan.macros.protein}%`, label: 'Protein', color: [8, 145, 178] },
        { value: `${plan.macros.carbs}%`, label: 'Kolhydrater', color: [147, 51, 234] },
        { value: `${plan.macros.fat}%`, label: 'Fett', color: [234, 88, 12] }
    ];
    
    macrosData.forEach((macro, index) => {
        const xPos = macroStartX + (index * 50);
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(macro.color[0], macro.color[1], macro.color[2]);
        doc.text(macro.value, xPos, yPos, { align: 'center' });
        doc.setFontSize(9);
        doc.setTextColor(107, 114, 128);
        doc.text(macro.label, xPos, yPos + 8, { align: 'center' });
    });
    yPos += 20;

    // Explanations section
    checkPageBreak(40);
    doc.setFillColor(249, 250, 251);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(margin, yPos, contentWidth, 35, 4, 4, 'FD');
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text('Förstå dina värden', margin + 5, yPos + 8);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);
    doc.text('BMR (Basal Metabolic Rate): Antalet kalorier din kropp förbränner i vila för att', margin + 5, yPos + 15);
    doc.text('upprätthålla grundläggande funktioner som andning och cirkulation.', margin + 5, yPos + 20);
    doc.text('TDEE (Total Daily Energy Expenditure): Totalt antal kalorier du förbränner per dag,', margin + 5, yPos + 26);
    doc.text('inklusive all fysisk aktivitet och träning.', margin + 5, yPos + 31);
    yPos += 45;

    // Calorie rating
    checkPageBreak(15);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Kaloribedömning', margin, yPos);
    yPos += 7;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text(`${plan.calorieRating.label}`, margin, yPos);
    yPos += 6;
    doc.text(plan.calorieRating.description, margin, yPos);
    yPos += 12;

    // Guide: Så räknar du kalorier
    checkPageBreak(30);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Så räknar du kalorier (kort guide)', margin, yPos);
    yPos += 7;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    const guideLines = [
        '• 1 g protein = 4 kcal, 1 g kolhydrater = 4 kcal, 1 g fett = 9 kcal.',
        '• Använd livsmedelsförpackningar eller en app (t.ex. Lifesum, MyFitnessPal) för att se näringsvärden.',
        '• Räkna ut mängden genom att multiplicera gram av varje makro med värdena ovan.',
        '• Jämför sedan dagens totala kalorier och makron med planen i detta dokument.'
    ];
    guideLines.forEach(line => {
        checkPageBreak(7);
        doc.text(line, margin, yPos);
        yPos += 6;
    });
    yPos += 5;

    // Meal Plan - structured like the HTML file
    plan.days.forEach(day => {
        checkPageBreak(50);
        
        // Day header
        doc.setDrawColor(229, 231, 235);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 5;
        
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        const dayTitle = day.isTrainingDay ? `${day.name} 🏋️ Träningsdag` : day.name;
        doc.text(dayTitle, margin, yPos);
        
        // Daily total on the right
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(107, 114, 128);
        doc.text('Dagligt Totalt', pageWidth - margin - 40, yPos - 5);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(`${day.calories} kcal`, pageWidth - margin - 40, yPos + 3);
        yPos += 12;

        // Meal rows - structured table format
        const mealColWidth = contentWidth / 5;
        const mealCols = [
            { x: margin, width: mealColWidth * 1.5, label: 'Måltid' },
            { x: margin + mealColWidth * 1.5, width: mealColWidth * 0.8, label: 'Protein' },
            { x: margin + mealColWidth * 2.3, width: mealColWidth * 0.8, label: 'Kolhydrater' },
            { x: margin + mealColWidth * 3.1, width: mealColWidth * 0.8, label: 'Fett' }
        ];

        day.meals.forEach(meal => {
            checkPageBreak(15);
            
            // Meal row background
            doc.setFillColor(249, 250, 251);
            doc.setDrawColor(229, 231, 235);
            doc.roundedRect(margin, yPos - 8, contentWidth, 12, 2, 2, 'FD');
            
            // Meal name and kcal
            const mealDisplayName = getMealDisplayName(meal.name).replace(/[☀️🍎🍽️🌙]/g, '').trim();
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(mealDisplayName, mealCols[0].x + 3, yPos);
            doc.setFont(undefined, 'normal');
            doc.setFontSize(8);
            doc.setTextColor(107, 114, 128);
            doc.text(`${meal.calories} kcal`, mealCols[0].x + 3, yPos + 5);
            
            // Protein (cyan)
            doc.setFillColor(224, 242, 254);
            doc.setDrawColor(186, 230, 253);
            doc.roundedRect(mealCols[1].x, yPos - 6, mealCols[1].width, 10, 2, 2, 'FD');
            doc.setFontSize(9);
            doc.setTextColor(8, 145, 178);
            doc.text(`${meal.protein}g`, mealCols[1].x + mealCols[1].width / 2, yPos + 1, { align: 'center' });
            
            // Carbs (purple)
            doc.setFillColor(243, 232, 255);
            doc.setDrawColor(233, 213, 255);
            doc.roundedRect(mealCols[2].x, yPos - 6, mealCols[2].width, 10, 2, 2, 'FD');
            doc.setTextColor(147, 51, 234);
            doc.text(`${meal.carbs}g`, mealCols[2].x + mealCols[2].width / 2, yPos + 1, { align: 'center' });
            
            // Fat (orange)
            doc.setFillColor(255, 237, 213);
            doc.setDrawColor(254, 215, 170);
            doc.roundedRect(mealCols[3].x, yPos - 6, mealCols[3].width, 10, 2, 2, 'FD');
            doc.setTextColor(234, 88, 12);
            doc.text(`${meal.fat}g`, mealCols[3].x + mealCols[3].width / 2, yPos + 1, { align: 'center' });
            
            yPos += 15;
        });
        
        yPos += 5;
    });

    // Footer
    checkPageBreak(15);
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text('Genererad av Kostschema Generator • Följ din plan konsekvent för bästa resultat', pageWidth / 2, yPos, { align: 'center' });

    // Save PDF
    doc.save('kostplan.pdf');
}

