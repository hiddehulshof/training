import { openDB } from 'idb';
import { RECIPES, SPECIAL_DATES, CIRCUIT_EXERCISES } from './App';

const DB_NAME = 'volleybal-app-db';
const DB_VERSION = 4;

export async function initDB() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // ... (keep existing checks)
            if (!db.objectStoreNames.contains('recipes')) {
                db.createObjectStore('recipes', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('events')) {
                db.createObjectStore('events', { keyPath: 'date' });
            }
            if (!db.objectStoreNames.contains('exercises')) {
                db.createObjectStore('exercises', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('settings')) {
                db.createObjectStore('settings', { keyPath: 'key' });
            }
            if (!db.objectStoreNames.contains('calorie_logs')) {
                db.createObjectStore('calorie_logs', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('food_suggestions')) {
                db.createObjectStore('food_suggestions', { keyPath: 'name' });
            }
            if (!db.objectStoreNames.contains('training_logs')) {
                db.createObjectStore('training_logs', { keyPath: 'id' });
            }
        },
    });
}

export async function seedDatabase() {
    const db = await initDB();
    const tx = db.transaction(['recipes', 'events', 'exercises', 'settings', 'food_suggestions'], 'readwrite');

    // Check if recipes exist (initial seed)
    const countRecipes = await tx.objectStore('recipes').count();

    if (countRecipes === 0) {
        console.log('Seeding initial data...');
        for (const recipe of RECIPES) {
            await tx.objectStore('recipes').put(recipe);
        }
        for (const [date, data] of Object.entries(SPECIAL_DATES)) {
            await tx.objectStore('events').put({ date, ...data });
        }
        for (const exercise of CIRCUIT_EXERCISES) {
            await tx.objectStore('exercises').put(exercise);
        }
        await tx.objectStore('settings').put({ key: 'habits', value: { water: false, fruit: false, veggies: false, protein: false } });
        await tx.objectStore('settings').put({ key: 'shoppingList', value: [] });
    }

    // Check if suggestions exist (separate seed for updates)
    const countSuggestions = await tx.objectStore('food_suggestions').count();

    if (countSuggestions === 0) {
        console.log('Seeding food suggestions...');
        const DUTCH_FOODS = [
            { name: "Boterham met kaas", calories: 180, protein: 7, carbs: 18, fat: 8, quantity: "1 snee" },
            { name: "Boterham met hagelslag", calories: 150, protein: 3, carbs: 25, fat: 4, quantity: "1 snee" },
            { name: "Boterham met pindakaas", calories: 230, protein: 9, carbs: 16, fat: 14, quantity: "1 snee" },
            { name: "Bakje kwark (250g)", calories: 130, protein: 22, carbs: 8, fat: 0, quantity: "250g" },
            { name: "Appel", calories: 60, protein: 0, carbs: 14, fat: 0, quantity: "1 stuk" },
            { name: "Banaan", calories: 105, protein: 1, carbs: 27, fat: 0, quantity: "1 stuk" },
            { name: "Eierkoek", calories: 100, protein: 2, carbs: 20, fat: 1, quantity: "1 stuk" },
            { name: "Krentenbol", calories: 140, protein: 4, carbs: 26, fat: 2, quantity: "1 stuk" },
            { name: "Glas halfvolle melk", calories: 90, protein: 7, carbs: 9, fat: 3, quantity: "200ml" },
            { name: "Tosti kaas/ketchup", calories: 260, protein: 10, carbs: 25, fat: 12, quantity: "1 stuk" },
            { name: "Pasta Bolognese", calories: 600, protein: 25, carbs: 70, fat: 20, quantity: "1 bord" },
            { name: "Boerenkool met worst", calories: 550, protein: 20, carbs: 40, fat: 30, quantity: "1 bord" },
            { name: "Hutspot", calories: 450, protein: 12, carbs: 50, fat: 18, quantity: "1 bord" },
            { name: "Kipfilet (gebakken)", calories: 165, protein: 31, carbs: 0, fat: 3, quantity: "100g" },
            { name: "Gekookt ei", calories: 75, protein: 7, carbs: 0, fat: 5, quantity: "1 stuk" },
            { name: "Ontbijtkoek", calories: 65, protein: 1, carbs: 15, fat: 0, quantity: "1 plak" }
        ];

        for (const food of DUTCH_FOODS) {
            await tx.objectStore('food_suggestions').put(food);
        }
        console.log('Food suggestions seeded!');
    }

    await tx.done;
}

export async function getAll(storeName) {
    const db = await initDB();
    return db.getAll(storeName);
}

export async function getSetting(key) {
    const db = await initDB();
    const result = await db.get('settings', key);
    return result ? result.value : null;
}

export async function put(storeName, data) {
    const db = await initDB();
    return db.put(storeName, data);
}

export async function putSetting(key, value) {
    const db = await initDB();
    return db.put('settings', { key, value });
}

export async function deleteItem(storeName, key) {
    const db = await initDB();
    return db.delete(storeName, key);
}
