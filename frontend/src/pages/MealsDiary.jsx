import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Apple, Scale, Save, ArrowLeft, Plus, Calendar, Clock, Trash2, Coffee, Sun, Moon, Utensils } from 'lucide-react';

const MealsDiary = () => {
    const navigate = useNavigate();

    // Logs and Toggles
    const [mealsLog, setMealsLog] = useState([]);
    const [isAdding, setIsAdding] = useState(false);

    // Meal Builder States (The "Cart")
    const [addedItems, setAddedItems] = useState([]);
    const [mealType, setMealType] = useState(''); // Changed to empty string - user MUST select
    
    // Form Inputs
    const [basicFoods, setBasicFoods] = useState([]);
    const [entryMode, setEntryMode] = useState('basic');
    const [selectedFoodId, setSelectedFoodId] = useState('');
    const [amount, setAmount] = useState('');
    const [manualData, setManualData] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }
                const headers = { Authorization: `Bearer ${token}` };

                const foodsRes = await axios.get('http://localhost:5000/food-items', { headers });
                const foodsData = foodsRes.data;
                if (Array.isArray(foodsData)) setBasicFoods(foodsData);
                else if (foodsData.foods) setBasicFoods(foodsData.foods);
                else if (foodsData.foodItems) setBasicFoods(foodsData.foodItems);

                const mealsRes = await axios.get('http://localhost:5000/meals', { headers });
                if (mealsRes.data && Array.isArray(mealsRes.data.meals)) {
                    setMealsLog(mealsRes.data.meals);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchInitialData();
    }, [navigate]);

    const handleManualChange = (e) => {
        setManualData({ ...manualData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
    };

    const handleAmountChange = (e) => {
        setAmount(e.target.value);
        if (errors.amount) setErrors({ ...errors, amount: null });
    };

    const handleAddItem = (e) => {
        e.preventDefault();
        const newErrors = {};
        const parsedAmount = parseFloat(amount);
        
        if (!parsedAmount || parsedAmount <= 0) {
            newErrors.amount = "Amount must be > 0";
        }

        let newItem = {};

        if (entryMode === 'basic') {
            if (!selectedFoodId) newErrors.food = "Select a food item";
            else {
                const food = basicFoods.find(f => f._id === selectedFoodId);
                const multiplier = parsedAmount / 100;
                newItem = {
                    tempId: Date.now(),
                    name: food.name,
                    foodItem: selectedFoodId,
                    quantity: parsedAmount,
                    calories: Math.round(food.calories * multiplier),
                    protein: Math.round(food.protein * multiplier),
                    carbs: Math.round(food.carbs * multiplier),
                    fat: Math.round(food.fat * multiplier)
                };
            }
        } else {
            if (!manualData.name) newErrors.name = "Name is required";
            ['calories', 'protein', 'carbs', 'fat'].forEach(field => {
                const val = parseFloat(manualData[field]);
                if (isNaN(val) || val < 0) newErrors[field] = "Invalid number";
            });

            if (Object.keys(newErrors).length === 0) {
                newItem = {
                    tempId: Date.now(),
                    name: manualData.name,
                    quantity: parsedAmount,
                    calories: parseFloat(manualData.calories),
                    protein: parseFloat(manualData.protein),
                    carbs: parseFloat(manualData.carbs),
                    fat: parseFloat(manualData.fat)
                };
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setAddedItems([...addedItems, newItem]);
        setAmount('');
        setSelectedFoodId('');
        setManualData({ name: '', calories: '', protein: '', carbs: '', fat: '' });
        setErrors({}); // Clear any previous submit errors
    };

    const removeItemFromMeal = (tempId) => {
        setAddedItems(addedItems.filter(item => item.tempId !== tempId));
    };

    const handleSaveMealToDB = async () => {
        if (addedItems.length === 0) return;
        
        // Force the user to select a meal type
        if (!mealType) {
            setErrors({ submit: "Please select a meal type (Breakfast, Lunch, etc.) before saving." });
            return;
        }

        try {
            const token = localStorage.getItem('token');
            
            const finalPayload = addedItems.map(item => ({
                ...item,
                mealType: mealType
            }));

            const res = await axios.post('http://localhost:5000/meals', finalPayload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setMealsLog([...res.data.meals, ...mealsLog]);
            setAddedItems([]);
            setMealType(''); // Reset choice for the next time
            setIsAdding(false);
            setErrors({});
            
        } catch (error) {
            console.error("Error saving meal:", error);
            setErrors({ submit: "Failed to save meal to server." });
        }
    };

    const formatDate = (dateString) => {
        const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const buildTotals = addedItems.reduce((acc, item) => {
        acc.calories += item.calories;
        acc.protein += item.protein;
        acc.carbs += item.carbs;
        acc.fat += item.fat;
        return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    return (
        <div className="max-w-4xl mx-auto mt-10 p-4 font-sans">
            <div className="flex justify-between items-center mb-6">
                <button onClick={() => navigate('/home')} className="flex items-center gap-2 text-violet-600 font-semibold hover:text-violet-800 transition-colors">
                    <ArrowLeft size={20} /> Dashboard
                </button>
                <button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-violet-700 transition-colors">
                    {isAdding ? 'Cancel Building' : <><Plus size={20} /> Build Meal</>}
                </button>
            </div>

            {isAdding && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
                    <div className="h-2 bg-violet-500 w-full"></div>
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                            <Utensils className="text-violet-500" size={24} /> Meal Builder
                        </h2>

                        {/* Meal Type Selector (Forced Manual Choice) */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-600 mb-2">1. Select Meal Type <span className="text-red-500">*</span></label>
                            <div className="flex gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
                                {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => { setMealType(type); setErrors({ ...errors, submit: null }); }}
                                        className={`flex-1 py-2 flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors text-sm ${mealType === type ? 'bg-white shadow text-violet-700 border border-violet-200' : 'text-gray-500 hover:bg-gray-100 border border-transparent'}`}
                                    >
                                        {type === 'Breakfast' && <Coffee size={16}/>}
                                        {type === 'Lunch' && <Sun size={16}/>}
                                        {type === 'Dinner' && <Moon size={16}/>}
                                        {type === 'Snack' && <Apple size={16}/>}
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Add Item Form */}
                        <div className="bg-violet-50/50 p-4 rounded-xl border border-violet-100 mb-6">
                            <label className="block text-sm font-semibold text-gray-600 mb-3">2. Add Foods to Meal</label>
                            <div className="flex gap-4 mb-4">
                                <button onClick={() => { setEntryMode('basic'); setErrors({}); }} className={`text-sm font-semibold pb-1 ${entryMode === 'basic' ? 'text-violet-700 border-b-2 border-violet-600' : 'text-gray-500'}`}>From Database</button>
                                <button onClick={() => { setEntryMode('manual'); setErrors({}); }} className={`text-sm font-semibold pb-1 ${entryMode === 'manual' ? 'text-violet-700 border-b-2 border-violet-600' : 'text-gray-500'}`}>Manual Entry</button>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 items-end">
                                {entryMode === 'basic' ? (
                                    <div className="flex-1 w-full">
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Food Item</label>
                                        <select value={selectedFoodId} onChange={(e) => setSelectedFoodId(e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg">
                                            <option value="">-- Choose --</option>
                                            {basicFoods.map(food => <option key={food._id} value={food._id}>{food.name}</option>)}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="flex-1 w-full">
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Food Name</label>
                                        <input type="text" name="name" value={manualData.name} onChange={handleManualChange} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg" placeholder="Name" />
                                    </div>
                                )}
                                
                                <div className="w-full md:w-32">
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Amount (g)</label>
                                    <input type="number" value={amount} onChange={handleAmountChange} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg" placeholder="100" />
                                </div>

                                <button onClick={handleAddItem} className="w-full md:w-auto px-6 py-2.5 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-900 transition-colors">
                                    Add 
                                </button>
                            </div>
                            
                            {entryMode === 'manual' && (
                                <div className="grid grid-cols-4 gap-2 mt-3">
                                    {['calories', 'protein', 'carbs', 'fat'].map(m => (
                                        <input key={m} type="number" name={m} value={manualData[m]} onChange={handleManualChange} className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm" placeholder={m} />
                                    ))}
                                </div>
                            )}
                            
                            {Object.values(errors).map((err, idx) => err && err !== errors.submit && <p key={idx} className="text-red-500 text-xs mt-2">{err}</p>)}
                        </div>

                        {/* Cart Display */}
                        {addedItems.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-bold text-gray-700 mb-3 border-b pb-2">3. Current Meal Items</h3>
                                <div className="space-y-2 mb-4">
                                    {addedItems.map(item => (
                                        <div key={item.tempId} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            <div>
                                                <span className="font-semibold text-gray-800">{item.name}</span>
                                                <span className="text-gray-500 text-sm ml-2">({item.quantity}g)</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm font-bold text-violet-600">{item.calories} kcal</span>
                                                <button onClick={() => removeItemFromMeal(item.tempId)} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-violet-600 text-white p-4 rounded-xl flex justify-between items-center">
                                    <div>
                                        <div className="font-bold text-lg mb-1">Meal Total {mealType ? `(${mealType})` : ''}</div>
                                        <div className="text-violet-200 text-sm flex gap-3">
                                            <span>P: {buildTotals.protein}g</span>
                                            <span>C: {buildTotals.carbs}g</span>
                                            <span>F: {buildTotals.fat}g</span>
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold">{buildTotals.calories} kcal</div>
                                </div>
                            </div>
                        )}

                        {errors.submit && <div className="mt-4 mb-4 p-3 bg-red-50 text-red-600 rounded-lg border border-red-100 text-center font-semibold">{errors.submit}</div>}

                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <button 
                                onClick={handleSaveMealToDB}
                                disabled={addedItems.length === 0}
                                className={`flex items-center gap-2 px-8 py-3 font-bold rounded-lg transition-colors ${addedItems.length > 0 ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                            >
                                <Save size={20} /> Save Complete Meal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Calendar className="text-violet-500" size={24} /> Food Diary Log
                </h2>
                
                {mealsLog.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">
                        <p>No meals logged yet. Click "Build Meal" to start tracking!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {mealsLog.map((meal) => (
                            <div key={meal._id} className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-gray-50/50">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">{meal.name}</h3>
                                        <p className="text-sm text-gray-500 flex items-center gap-2">
                                            <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs font-semibold">{meal.mealType}</span>
                                            <span className="flex items-center gap-1"><Clock size={12} /> {formatDate(meal.createdAt || meal.date)}</span>
                                            <span className="mx-1">•</span> 
                                            {meal.quantity}g
                                        </p>
                                    </div>
                                    <div className="bg-violet-100 text-violet-800 font-bold px-3 py-1 rounded-full text-sm">
                                        {meal.calories} kcal
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-gray-100 text-sm">
                                    <div className="text-center"><span className="block text-gray-500 text-xs">Protein</span> <span className="font-semibold">{meal.protein}g</span></div>
                                    <div className="text-center"><span className="block text-gray-500 text-xs">Carbs</span> <span className="font-semibold">{meal.carbs}g</span></div>
                                    <div className="text-center"><span className="block text-gray-500 text-xs">Fat</span> <span className="font-semibold">{meal.fat}g</span></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MealsDiary;