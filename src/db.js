import { openDB } from 'idb';
import { RECIPES, SPECIAL_DATES, CIRCUIT_EXERCISES } from './App';

const DB_NAME = 'volleybal-app-db';
const DB_VERSION = 2;

export async function initDB() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
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
        },
    });
}

export async function seedDatabase() {
    const db = await initDB();
    const tx = db.transaction(['recipes', 'events', 'exercises', 'settings'], 'readwrite');

    // Check if recipes exist to decide if we need to seed
    const count = await tx.objectStore('recipes').count();

    if (count === 0) {
        console.log('Seeding database...');

        // Seed Recipes
        for (const recipe of RECIPES) {
            await tx.objectStore('recipes').put(recipe);
        }

        // Seed Events (Special Dates)
        // SPECIAL_DATES is an object keyed by date string. Convert to array of objects.
        for (const [date, data] of Object.entries(SPECIAL_DATES)) {
            await tx.objectStore('events').put({ date, ...data });
        }

        // Seed Exercises
        for (const exercise of CIRCUIT_EXERCISES) {
            await tx.objectStore('exercises').put(exercise);
        }

        // Seed Default Settings using put instead of add to avoid errors if key exists (though it shouldn't safely)
        await tx.objectStore('settings').put({ key: 'habits', value: { water: false, fruit: false, veggies: false, protein: false } });
        await tx.objectStore('settings').put({ key: 'shoppingList', value: [] });

        console.log('Database seeded!');
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
