import { useState, useEffect } from 'react';
import { seedDatabase, getAll, getSetting } from '../db';
import { getUserStats } from '../gamification';
import { RECIPES, SPECIAL_DATES, CIRCUIT_EXERCISES } from '../constants';

export function useData() {
    const [loading, setLoading] = useState(true);
    const [recipes, setRecipes] = useState([]);
    const [events, setEvents] = useState({});
    const [exercises, setExercises] = useState([]);
    const [habits, setHabits] = useState({ water: false, fruit: false, veggies: false, protein: false });
    const [shoppingListItems, setShoppingListItems] = useState([]);
    const [userStats, setUserStats] = useState({ level: 1, progress: 0, streak: 0 });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            await seedDatabase();

            // Recipes
            const allRecipes = await getAll('recipes');
            setRecipes(allRecipes.length > 0 ? allRecipes : RECIPES);

            // Events
            const allEvents = await getAll('events');
            if (allEvents.length > 0) {
                const eventsObj = allEvents.reduce((acc, curr) => ({ ...acc, [curr.date]: curr }), {});
                setEvents(eventsObj);
            } else {
                setEvents(SPECIAL_DATES);
            }

            // Exercises
            const allExercises = await getAll('exercises');
            setExercises(allExercises.length > 0 ? allExercises : CIRCUIT_EXERCISES);

            // Settings
            const savedHabits = await getSetting('habits');
            if (savedHabits) setHabits(savedHabits);

            const savedList = await getSetting('shoppingList');
            if (savedList) setShoppingListItems(savedList);

            // Stats
            const stats = await getUserStats();
            setUserStats(stats);

        } catch (error) {
            console.error("Failed to load data:", error);
        } finally {
            setLoading(false);
        }
    };

    const refreshData = () => {
        loadData();
    };

    return {
        loading,
        recipes,
        events,
        exercises,
        habits,
        setHabits,
        shoppingListItems,
        setShoppingListItems,
        userStats,
        setUserStats, // Exposed to allow updates from components
        refreshData
    };
}
